import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { motion } from 'framer-motion'
import { History, Search, RefreshCw, CheckCircle, XCircle, Clock, Filter, Download } from 'lucide-react'
import api from '../lib/api'
import toast from 'react-hot-toast'

const CATEGORY_CONFIG: Record<string, { color: string; bg: string; label: string }> = {
  customer:    { color: '#3b82f6', bg: 'rgba(59,130,246,0.12)',  label: 'Customer' },
  campaign:    { color: '#7c3aed', bg: 'rgba(124,58,237,0.12)', label: 'Campaign' },
  segment:     { color: '#10b981', bg: 'rgba(16,185,129,0.12)', label: 'Segment' },
  workflow:    { color: '#f59e0b', bg: 'rgba(245,158,11,0.12)', label: 'Workflow' },
  integration: { color: '#06b6d4', bg: 'rgba(6,182,212,0.12)',  label: 'Integration' },
  ai:          { color: '#8b5cf6', bg: 'rgba(139,92,246,0.12)', label: 'AI Action' },
  data_import: { color: '#ec4899', bg: 'rgba(236,72,153,0.12)', label: 'Data Import' },
  auth:        { color: '#64748b', bg: 'rgba(100,116,139,0.12)',label: 'Auth' },
}

const STATUS_CONFIG = {
  success: { color: '#10b981', icon: CheckCircle },
  failed:  { color: '#ef4444', icon: XCircle },
  pending: { color: '#f59e0b', icon: Clock },
}

function formatTime(ts: string) {
  const d = new Date(ts)
  return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) + ' ' + d.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false })
}

function downloadAuditCSV(logs: any[]) {
  const header = ['Timestamp', 'User', 'Action', 'Category', 'Status', 'Entity']
  const rows = logs.map(l => [
    l.createdAt ? formatTime(l.createdAt) : '',
    l.userName || 'System',
    `"${l.action}"`,
    l.category || '',
    l.status || '',
    l.entity || ''
  ])
  const csv = [header, ...rows].map(r => r.join(',')).join('\n')
  const blob = new Blob([csv], { type: 'text/csv' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `XenoReach_Audit_${new Date().toISOString().split('T')[0]}.csv`
  a.click()
  URL.revokeObjectURL(url)
  toast.success(`Exported ${logs.length} audit records`)
}

export default function AuditCenter() {
  const [category, setCategory] = useState('all')
  const [status, setStatus] = useState('all')
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)

  const { data, isLoading, refetch } = useQuery({
    queryKey: ['audit-logs', category, status, search, page],
    queryFn: () => api.get('/audit', { params: { category: category !== 'all' ? category : undefined, status: status !== 'all' ? status : undefined, search: search || undefined, page, limit: 30 } }).then(r => r.data),
  })

  const logs: any[] = data?.data || []
  const total = data?.pagination?.total || 0
  const pages = data?.pagination?.pages || 1

  const selectStyle: React.CSSProperties = {
    padding: '8px 12px', borderRadius: 8, background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.12)', color: 'rgba(255,255,255,0.75)', fontSize: 13, outline: 'none', cursor: 'pointer',
  }

  return (
    <div style={{ padding: 32, background: 'hsl(222,47%,4%)', minHeight: '100%', overflowY: 'auto' }}>

      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}
        style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 28, flexWrap: 'wrap', gap: 16 }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 6 }}>
            <div style={{ width: 44, height: 44, borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'linear-gradient(135deg,#1e40af,#7c3aed)' }}>
              <History size={22} color="white" />
            </div>
            <h1 style={{ fontSize: 28, fontWeight: 800, color: 'rgba(255,255,255,0.95)', margin: 0 }}>Audit Center</h1>
          </div>
          <p style={{ fontSize: 14, color: 'rgba(255,255,255,0.45)', margin: 0 }}>Enterprise activity log — every action tracked</p>
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          <button onClick={() => downloadAuditCSV(logs)} disabled={logs.length === 0}
            style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '9px 18px', borderRadius: 10, fontSize: 13, fontWeight: 600, background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: logs.length ? 'rgba(255,255,255,0.7)' : 'rgba(255,255,255,0.3)', cursor: logs.length ? 'pointer' : 'not-allowed' }}>
            <Download size={14} /> Export CSV
          </button>
          <button onClick={() => refetch()}
            style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '9px 18px', borderRadius: 10, fontSize: 13, fontWeight: 600, background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.7)', cursor: 'pointer' }}>
            <RefreshCw size={14} /> Refresh
          </button>
        </div>
      </motion.div>

      {/* Stats */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
        style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(150px,1fr))', gap: 14, marginBottom: 24 }}>
        {[
          { label: 'Total Events', value: total.toLocaleString(), color: '#7c3aed' },
          { label: 'Success Rate', value: logs.length > 0 ? `${Math.round((logs.filter((l: any) => l.status === 'success').length / logs.length) * 100)}%` : '—', color: '#10b981' },
          { label: 'AI Actions', value: logs.filter((l: any) => l.category === 'ai').length, color: '#8b5cf6' },
          { label: 'Data Imports', value: logs.filter((l: any) => l.category === 'data_import').length, color: '#ec4899' },
        ].map(({ label, value, color }) => (
          <div key={label} style={{ padding: '16px 20px', borderRadius: 12, background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)' }}>
            <div style={{ fontSize: 22, fontWeight: 800, color, marginBottom: 4 }}>{value}</div>
            <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)' }}>{label}</div>
          </div>
        ))}
      </motion.div>

      {/* Filter bar */}
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.15 }}
        style={{ display: 'flex', gap: 12, marginBottom: 20, flexWrap: 'wrap', alignItems: 'center', padding: '14px 18px', borderRadius: 12, background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: 'rgba(255,255,255,0.4)' }}>
          <Filter size={14} /> <span style={{ fontSize: 12, fontWeight: 600 }}>Filter:</span>
        </div>
        <select value={category} onChange={e => { setCategory(e.target.value); setPage(1) }} style={selectStyle}>
          <option value="all">All Categories</option>
          {Object.entries(CATEGORY_CONFIG).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
        </select>
        <select value={status} onChange={e => { setStatus(e.target.value); setPage(1) }} style={selectStyle}>
          <option value="all">All Statuses</option>
          <option value="success">Success</option>
          <option value="failed">Failed</option>
          <option value="pending">Pending</option>
        </select>
        <div style={{ flex: 1, position: 'relative', minWidth: 200 }}>
          <Search size={13} style={{ position: 'absolute', left: 11, top: '50%', transform: 'translateY(-50%)', color: 'rgba(255,255,255,0.3)', pointerEvents: 'none' }} />
          <input value={search} onChange={e => { setSearch(e.target.value); setPage(1) }} placeholder="Search actions, users, entities..."
            style={{ ...selectStyle, width: '100%', paddingLeft: 32, boxSizing: 'border-box' }} />
        </div>
      </motion.div>

      {/* Table */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
        style={{ borderRadius: 14, overflow: 'hidden', border: '1px solid rgba(255,255,255,0.07)' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ background: 'rgba(255,255,255,0.03)' }}>
              {['Timestamp', 'User', 'Action', 'Category', 'Status', 'Entity'].map(h => (
                <th key={h} style={{ padding: '12px 16px', textAlign: 'left', fontSize: 10, fontWeight: 700, color: 'rgba(255,255,255,0.35)', textTransform: 'uppercase', letterSpacing: '0.07em', borderBottom: '1px solid rgba(255,255,255,0.06)', whiteSpace: 'nowrap' }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              Array(8).fill(0).map((_, i) => (
                <tr key={i}>
                  {Array(6).fill(0).map((_, j) => (
                    <td key={j} style={{ padding: '14px 16px', borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                      <div style={{ height: 14, borderRadius: 4, background: 'rgba(255,255,255,0.04)' }} />
                    </td>
                  ))}
                </tr>
              ))
            ) : logs.length === 0 ? (
              <tr><td colSpan={6} style={{ padding: '48px', textAlign: 'center', color: 'rgba(255,255,255,0.3)', fontSize: 14 }}>
                <History size={28} style={{ margin: '0 auto 8px', display: 'block', opacity: 0.3 }} />
                No audit logs found
              </td></tr>
            ) : (
              logs.map((log: any, i: number) => {
                const cat = CATEGORY_CONFIG[log.category] || CATEGORY_CONFIG.customer
                const stCfg = STATUS_CONFIG[log.status as keyof typeof STATUS_CONFIG] || STATUS_CONFIG.success
                const SIcon = stCfg.icon
                return (
                  <tr key={log._id || i} style={{ transition: 'background 0.15s' }}
                    onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = 'rgba(124,58,237,0.04)' }}
                    onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'transparent' }}>
                    <td style={{ padding: '14px 16px', borderBottom: '1px solid rgba(255,255,255,0.04)', fontSize: 12, color: 'rgba(255,255,255,0.45)', whiteSpace: 'nowrap' }}>
                      {log.createdAt ? formatTime(log.createdAt) : '—'}
                    </td>
                    <td style={{ padding: '14px 16px', borderBottom: '1px solid rgba(255,255,255,0.04)', fontSize: 13, color: 'rgba(255,255,255,0.8)', fontWeight: 600 }}>
                      {log.userName || 'System'}
                    </td>
                    <td style={{ padding: '14px 16px', borderBottom: '1px solid rgba(255,255,255,0.04)', fontSize: 13, color: 'rgba(255,255,255,0.75)' }}>
                      {log.action}
                    </td>
                    <td style={{ padding: '14px 16px', borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                      <span style={{ fontSize: 11, fontWeight: 700, padding: '3px 9px', borderRadius: 5, background: cat.bg, color: cat.color }}>{cat.label}</span>
                    </td>
                    <td style={{ padding: '14px 16px', borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                        <SIcon size={12} style={{ color: stCfg.color }} />
                        <span style={{ fontSize: 12, fontWeight: 600, color: stCfg.color, textTransform: 'capitalize' }}>{log.status}</span>
                      </div>
                    </td>
                    <td style={{ padding: '14px 16px', borderBottom: '1px solid rgba(255,255,255,0.04)', fontSize: 12, color: 'rgba(255,255,255,0.4)' }}>
                      {log.entity || '—'}
                    </td>
                  </tr>
                )
              })
            )}
          </tbody>
        </table>
      </motion.div>

      {/* Pagination */}
      {pages > 1 && (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 20 }}>
          <span style={{ fontSize: 13, color: 'rgba(255,255,255,0.4)' }}>
            Page {page} of {pages} · {total} total events
          </span>
          <div style={{ display: 'flex', gap: 8 }}>
            <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}
              style={{ padding: '7px 16px', borderRadius: 8, fontSize: 13, background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: page === 1 ? 'rgba(255,255,255,0.25)' : 'rgba(255,255,255,0.7)', cursor: page === 1 ? 'not-allowed' : 'pointer' }}>
              ← Prev
            </button>
            <button onClick={() => setPage(p => Math.min(pages, p + 1))} disabled={page === pages}
              style={{ padding: '7px 16px', borderRadius: 8, fontSize: 13, background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: page === pages ? 'rgba(255,255,255,0.25)' : 'rgba(255,255,255,0.7)', cursor: page === pages ? 'not-allowed' : 'pointer' }}>
              Next →
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
