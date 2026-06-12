import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Plug, RefreshCw, CheckCircle, XCircle, Clock, Loader2,
  Database, AlertCircle, Zap,
  Globe, Activity, FileText, Download
} from 'lucide-react'
import api from '../lib/api'
import { timeAgo } from '../lib/utils'
import toast from 'react-hot-toast'

const INTEGRATION_META: Record<string, { emoji: string; color: string; category: string; tier: string }> = {
  shopify:       { emoji: '🛍️', color: '#95bf47', category: 'E-commerce', tier: 'Core' },
  woocommerce:   { emoji: '🛒', color: '#7f54b3', category: 'E-commerce', tier: 'Core' },
  pos:           { emoji: '🖥️', color: '#f59e0b', category: 'Retail POS', tier: 'Core' },
  erp:           { emoji: '⚙️', color: '#3b82f6', category: 'ERP System', tier: 'Enterprise' },
  mailchimp:     { emoji: '✉️', color: '#ffe01b', category: 'Email Marketing', tier: 'Growth' },
  whatsapp:      { emoji: '📱', color: '#25d366', category: 'Messaging', tier: 'Core' },
  razorpay:      { emoji: '💳', color: '#3395ff', category: 'Payments', tier: 'Growth' },
  googleanalytics: { emoji: '📊', color: '#e37400', category: 'Analytics', tier: 'Growth' },
}

const STATUS_CONFIG = {
  connected:    { color: '#10b981', bg: 'rgba(16,185,129,0.12)',  icon: CheckCircle, label: 'Connected' },
  disconnected: { color: '#94a3b8', bg: 'rgba(148,163,184,0.08)', icon: XCircle,     label: 'Disconnected' },
  pending:      { color: '#f59e0b', bg: 'rgba(245,158,11,0.12)',  icon: Clock,        label: 'Pending' },
}

const TIER_COLORS: Record<string, string> = {
  Core: '#7c3aed',
  Enterprise: '#2563eb',
  Growth: '#059669',
}

const shimmerStyle: React.CSSProperties = {
  background: 'linear-gradient(90deg, rgba(255,255,255,0.03) 0%, rgba(255,255,255,0.08) 50%, rgba(255,255,255,0.03) 100%)',
  backgroundSize: '800px 100%',
  animation: 'shimmer 2s infinite',
  borderRadius: 16,
}

export default function Integrations() {
  const qc = useQueryClient()
  const [syncingId, setSyncingId] = useState<string | null>(null)
  const [expandedId, setExpandedId] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState<'all' | 'connected' | 'available'>('all')

  const { data: integrations = [], isLoading } = useQuery({
    queryKey: ['integrations'],
    queryFn: () => api.get('/integrations').then(r => r.data.data),
  })

  const connectMutation = useMutation({
    mutationFn: (id: string) => api.post(`/integrations/${id}/connect`),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['integrations'] })
      toast.success('Integration connected! Data sync initiated. 🚀')
    },
    onError: () => toast.error('Connection failed. Please try again.'),
  })

  const disconnectMutation = useMutation({
    mutationFn: (id: string) => api.post(`/integrations/${id}/disconnect`),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['integrations'] })
      toast.success('Integration disconnected')
    },
  })

  const syncMutation = useMutation({
    mutationFn: (id: string) => api.post(`/integrations/${id}/sync`).then(r => r.data),
    onMutate: (id) => setSyncingId(id),
    onSuccess: (data) => {
      qc.invalidateQueries({ queryKey: ['integrations'] })
      toast.success(`Synced ${data.synced || 0} records successfully!`)
      setSyncingId(null)
    },
    onError: () => { toast.error('Sync failed'); setSyncingId(null) },
  })

  const connected = integrations.filter((i: any) => i.status === 'connected')
  const totalRecords = integrations.reduce((s: number, i: any) => s + i.recordsSynced, 0)
  const filteredIntegrations = activeTab === 'connected'
    ? integrations.filter((i: any) => i.status === 'connected')
    : activeTab === 'available'
    ? integrations.filter((i: any) => i.status !== 'connected')
    : integrations

  return (
    <div style={{ padding: '32px', background: 'hsl(222,47%,4%)', minHeight: '100%', overflowY: 'auto' }}>
      <style>{`@keyframes shimmer { 0% { background-position: -400px 0; } 100% { background-position: 400px 0; } }`}</style>

      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}
        style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 32, flexWrap: 'wrap', gap: 16 }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8 }}>
            <div style={{ width: 44, height: 44, borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'linear-gradient(135deg, #7c3aed, #c026d3)' }}>
              <Plug size={22} color="white" />
            </div>
            <div>
              <h1 style={{ fontSize: 28, fontWeight: 800, color: 'rgba(255,255,255,0.95)', margin: 0 }}>Integration Hub</h1>
              <p style={{ fontSize: 14, color: 'rgba(255,255,255,0.45)', margin: 0 }}>Enterprise customer data onboarding & integrations</p>
            </div>
          </div>
        </div>
        <div style={{ display: 'flex', gap: 12 }}>
          <button
            style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 18px', borderRadius: 10, fontSize: 13, fontWeight: 600, background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.7)', cursor: 'pointer' }}
            onClick={() => {
              const rows = [
                ['Integration', 'Status', 'Category', 'Records Synced', 'Last Sync'],
                ...integrations.map((i: any) => [
                  i.name, i.status,
                  INTEGRATION_META[i.icon]?.category || 'Integration',
                  i.recordsSynced || 0,
                  i.lastSync ? new Date(i.lastSync).toLocaleDateString('en-IN') : 'Never'
                ])
              ]
              const csv = rows.map((r: any[]) => r.join(',')).join('\n')
              const blob = new Blob([csv], { type: 'text/csv' })
              const url = URL.createObjectURL(blob)
              const a = document.createElement('a')
              a.href = url
              a.download = `XenoReach_Integrations_${new Date().toISOString().split('T')[0]}.csv`
              a.click()
              URL.revokeObjectURL(url)
              toast.success('Integration report downloaded!')
            }}
          >
            <Download size={14} /> Export Report
          </button>
          <button
            style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 18px', borderRadius: 10, fontSize: 13, fontWeight: 600, background: 'linear-gradient(135deg,#7c3aed,#c026d3)', border: 'none', color: 'white', cursor: 'pointer' }}
            onClick={() => qc.invalidateQueries({ queryKey: ['integrations'] })}
          >
            <RefreshCw size={14} /> Refresh All
          </button>
        </div>
      </motion.div>

      {/* Stats strip */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
        style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 16, marginBottom: 28 }}>
        {[
          { label: 'Connected', value: connected.length, unit: 'integrations', color: '#10b981', icon: CheckCircle, bg: 'rgba(16,185,129,0.1)' },
          { label: 'Total Records', value: totalRecords.toLocaleString(), unit: 'synced', color: '#7c3aed', icon: Database, bg: 'rgba(124,58,237,0.1)' },
          { label: 'Data Sources', value: integrations.length, unit: 'available', color: '#3b82f6', icon: Globe, bg: 'rgba(59,130,246,0.1)' },
          { label: 'Sync Health', value: connected.length > 0 ? '98.4%' : '—', unit: 'uptime', color: '#f59e0b', icon: Activity, bg: 'rgba(245,158,11,0.1)' },
        ].map(({ label, value, unit, color, icon: Icon, bg }) => (
          <div key={label} style={{ padding: '20px 24px', borderRadius: 16, background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
              <span style={{ fontSize: 12, fontWeight: 600, color: 'rgba(255,255,255,0.45)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{label}</span>
              <div style={{ width: 32, height: 32, borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', background: bg }}>
                <Icon size={15} style={{ color }} />
              </div>
            </div>
            <div style={{ fontSize: 26, fontWeight: 800, color }}>{value}</div>
            <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.35)', marginTop: 2 }}>{unit}</div>
          </div>
        ))}
      </motion.div>

      {/* Filter tabs */}
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.15 }}
        style={{ display: 'flex', gap: 8, marginBottom: 24 }}>
        {(['all', 'connected', 'available'] as const).map(tab => (
          <button key={tab} onClick={() => setActiveTab(tab)} style={{
            padding: '8px 20px', borderRadius: 8, fontSize: 13, fontWeight: 600, cursor: 'pointer', border: 'none',
            background: activeTab === tab ? 'linear-gradient(135deg,#7c3aed,#c026d3)' : 'rgba(255,255,255,0.05)',
            color: activeTab === tab ? 'white' : 'rgba(255,255,255,0.55)',
            textTransform: 'capitalize',
          }}>
            {tab === 'all' ? `All (${integrations.length})` : tab === 'connected' ? `Connected (${connected.length})` : `Available`}
          </button>
        ))}
      </motion.div>

      {/* Integration Cards */}
      {isLoading ? (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: 20 }}>
          {Array(6).fill(0).map((_, i) => <div key={i} style={{ ...shimmerStyle, height: 220 }} />)}
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: 20 }}>
          {filteredIntegrations.map((integration: any, i: number) => {
            const statusCfg = STATUS_CONFIG[integration.status as keyof typeof STATUS_CONFIG]
            const StatusIcon = statusCfg.icon
            const isConnected = integration.status === 'connected'
            const meta = INTEGRATION_META[integration.icon] || { emoji: '🔌', color: '#7c3aed', category: 'Integration', tier: 'Core' }
            const isExpanded = expandedId === integration.id

            return (
              <motion.div key={integration.id}
                initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}
                style={{
                  borderRadius: 16, overflow: 'hidden',
                  background: isConnected ? `linear-gradient(135deg, rgba(16,185,129,0.04) 0%, rgba(255,255,255,0.02) 100%)` : 'rgba(255,255,255,0.03)',
                  border: `1px solid ${isConnected ? 'rgba(16,185,129,0.2)' : 'rgba(255,255,255,0.08)'}`,
                  transition: 'all 0.3s ease',
                }}
              >
                {/* Top bar accent */}
                {isConnected && (
                  <div style={{ height: 3, background: 'linear-gradient(90deg, #10b981, #059669)', borderRadius: '0 0 0 0' }} />
                )}

                <div style={{ padding: '20px 22px' }}>
                  {/* Header */}
                  <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 16 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                      <div style={{ width: 52, height: 52, borderRadius: 14, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 26, background: `${meta.color}15`, border: `1px solid ${meta.color}25`, flexShrink: 0 }}>
                        {meta.emoji}
                      </div>
                      <div>
                        <div style={{ fontWeight: 700, fontSize: 15, color: 'rgba(255,255,255,0.95)', marginBottom: 4 }}>{integration.name}</div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                          <span style={{ fontSize: 10, fontWeight: 700, padding: '2px 8px', borderRadius: 999, background: `${TIER_COLORS[meta.tier] || '#7c3aed'}20`, color: TIER_COLORS[meta.tier] || '#a78bfa', border: `1px solid ${TIER_COLORS[meta.tier] || '#7c3aed'}30` }}>
                            {meta.tier}
                          </span>
                          <span style={{ fontSize: 10, color: 'rgba(255,255,255,0.35)' }}>{meta.category}</span>
                        </div>
                      </div>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '4px 10px', borderRadius: 20, background: statusCfg.bg, border: `1px solid ${statusCfg.color}30` }}>
                      <StatusIcon size={11} style={{ color: statusCfg.color }} />
                      <span style={{ fontSize: 11, fontWeight: 700, color: statusCfg.color }}>{statusCfg.label}</span>
                    </div>
                  </div>

                  {/* Description */}
                  <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.45)', lineHeight: 1.6, marginBottom: 14 }}>{integration.description}</p>

                  {/* Connected stats */}
                  {isConnected && (
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: 16 }}>
                      {[
                        { label: 'Records Imported', value: integration.recordsSynced?.toLocaleString() || '0' },
                        { label: 'Last Sync', value: integration.lastSync ? timeAgo(integration.lastSync) : 'Never' },
                      ].map(({ label, value }) => (
                        <div key={label} style={{ padding: '10px 12px', borderRadius: 10, background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.06)' }}>
                          <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.35)', marginBottom: 4 }}>{label}</div>
                          <div style={{ fontSize: 14, fontWeight: 700, color: 'rgba(255,255,255,0.85)' }}>{value}</div>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Data quality indicator */}
                  {isConnected && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
                      <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)' }}>Data Quality</span>
                      <div style={{ flex: 1, height: 4, borderRadius: 2, background: 'rgba(255,255,255,0.06)' }}>
                        <div style={{ width: '88%', height: '100%', borderRadius: 2, background: 'linear-gradient(90deg,#10b981,#059669)' }} />
                      </div>
                      <span style={{ fontSize: 11, fontWeight: 700, color: '#10b981' }}>88%</span>
                    </div>
                  )}

                  {/* Expanded sync logs */}
                  <AnimatePresence>
                    {isExpanded && isConnected && (
                      <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}
                        style={{ overflow: 'hidden', marginBottom: 14 }}>
                        <div style={{ fontSize: 11, fontWeight: 700, color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 8 }}>Recent Sync Log</div>
                        {[
                          { time: '2h ago', records: '+45', status: 'success' },
                          { time: '8h ago', records: '+128', status: 'success' },
                          { time: '1d ago', records: '+89', status: 'success' },
                        ].map((log, idx) => (
                          <div key={idx} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '6px 10px', borderRadius: 8, marginBottom: 4, background: 'rgba(255,255,255,0.02)' }}>
                            <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.35)' }}>{log.time}</span>
                            <span style={{ fontSize: 11, color: '#10b981', fontWeight: 600 }}>{log.records} records</span>
                            <span style={{ fontSize: 10, padding: '2px 6px', borderRadius: 4, background: 'rgba(16,185,129,0.15)', color: '#10b981' }}>✓ OK</span>
                          </div>
                        ))}
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {/* Actions */}
                  <div style={{ display: 'flex', gap: 8 }}>
                    {isConnected ? (
                      <>
                        <button
                          onClick={() => syncMutation.mutate(integration.id)}
                          disabled={syncingId === integration.id}
                          style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, padding: '10px', borderRadius: 10, fontSize: 12, fontWeight: 600, cursor: 'pointer', background: 'rgba(124,58,237,0.15)', border: '1px solid rgba(124,58,237,0.25)', color: '#a78bfa', transition: 'all 0.2s' }}
                        >
                          {syncingId === integration.id ? <Loader2 size={12} style={{ animation: 'spin 1s linear infinite' }} /> : <RefreshCw size={12} />}
                          Sync Now
                        </button>
                        <button
                          onClick={() => setExpandedId(isExpanded ? null : integration.id)}
                          style={{ padding: '10px 12px', borderRadius: 10, fontSize: 12, cursor: 'pointer', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', color: 'rgba(255,255,255,0.5)', display: 'flex', alignItems: 'center', gap: 4 }}
                        >
                          <FileText size={12} /> Logs
                        </button>
                        <button
                          onClick={() => disconnectMutation.mutate(integration.id)}
                          style={{ padding: '10px 12px', borderRadius: 10, fontSize: 12, cursor: 'pointer', background: 'rgba(239,68,68,0.06)', border: '1px solid rgba(239,68,68,0.15)', color: '#f87171', display: 'flex', alignItems: 'center', gap: 4 }}
                        >
                          <XCircle size={12} />
                        </button>
                      </>
                    ) : (
                      <button
                        onClick={() => connectMutation.mutate(integration.id)}
                        disabled={connectMutation.isPending}
                        style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, padding: '11px', borderRadius: 10, fontSize: 13, fontWeight: 700, cursor: connectMutation.isPending ? 'not-allowed' : 'pointer', background: 'linear-gradient(135deg,#7c3aed,#c026d3)', border: 'none', color: 'white', transition: 'all 0.2s' }}
                      >
                        {connectMutation.isPending ? <Loader2 size={13} style={{ animation: 'spin 1s linear infinite' }} /> : <Zap size={13} />}
                        Connect {integration.name}
                      </button>
                    )}
                  </div>
                </div>
              </motion.div>
            )
          })}
        </div>
      )}

      {/* Enterprise note */}
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }}
        style={{ marginTop: 32, padding: '20px 24px', borderRadius: 16, background: 'rgba(124,58,237,0.05)', border: '1px solid rgba(124,58,237,0.15)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
          <AlertCircle size={15} style={{ color: '#a78bfa' }} />
          <span style={{ fontSize: 13, fontWeight: 700, color: '#a78bfa' }}>Enterprise Integration Note</span>
        </div>
        <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.45)', lineHeight: 1.6, margin: 0 }}>
          These integrations are simulated for demonstration. In production, each connection uses OAuth 2.0 flows, 
          real-time webhooks, and ETL pipelines with data validation. Shopify integration syncs order history, 
          customer profiles, and product catalogs. POS integration merges online + offline purchase data for 
          true Customer 360° views.
        </p>
      </motion.div>
    </div>
  )
}
