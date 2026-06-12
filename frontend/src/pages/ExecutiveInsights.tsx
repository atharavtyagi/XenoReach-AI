import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  Brain, Sparkles, RefreshCw, TrendingUp, Users, AlertTriangle,
  Zap, BarChart3, MessageCircle, Target, ChevronRight, DollarSign, ArrowRight
} from 'lucide-react'
import api from '../lib/api'
import toast from 'react-hot-toast'

const CATEGORY_META: Record<string, { color: string; bg: string; icon: React.ElementType; label: string }> = {
  retention:    { color: '#3b82f6', bg: 'rgba(59,130,246,0.12)',  icon: Users,         label: 'Retention' },
  revenue:      { color: '#10b981', bg: 'rgba(16,185,129,0.12)',  icon: TrendingUp,    label: 'Revenue' },
  risk:         { color: '#ef4444', bg: 'rgba(239,68,68,0.12)',   icon: AlertTriangle, label: 'Risk' },
  optimization: { color: '#f59e0b', bg: 'rgba(245,158,11,0.12)',  icon: Zap,           label: 'Optimization' },
  growth:       { color: '#7c3aed', bg: 'rgba(124,58,237,0.12)',  icon: BarChart3,     label: 'Growth' },
  engagement:   { color: '#06b6d4', bg: 'rgba(6,182,212,0.12)',   icon: MessageCircle, label: 'Engagement' },
}

const PRIORITY_COLORS: Record<string, { color: string; bg: string }> = {
  high:   { color: '#ef4444', bg: 'rgba(239,68,68,0.12)' },
  medium: { color: '#f59e0b', bg: 'rgba(245,158,11,0.12)' },
  low:    { color: '#10b981', bg: 'rgba(16,185,129,0.12)' },
}

const shimmer: React.CSSProperties = {
  background: 'linear-gradient(90deg,rgba(255,255,255,0.03) 0%,rgba(255,255,255,0.08) 50%,rgba(255,255,255,0.03) 100%)',
  backgroundSize: '800px 100%',
  animation: 'shimmer 2s infinite',
  borderRadius: 16,
}

function SkeletonCard() {
  return (
    <div style={{ padding: 24, borderRadius: 16, background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)' }}>
      <div style={{ ...shimmer, height: 20, width: '60%', marginBottom: 12 }} />
      <div style={{ ...shimmer, height: 14, width: '100%', marginBottom: 8 }} />
      <div style={{ ...shimmer, height: 14, width: '80%', marginBottom: 20 }} />
      <div style={{ ...shimmer, height: 36, width: '40%' }} />
    </div>
  )
}

const ACTION_ROUTES: Record<string, string> = {
  retention:    '/segments',
  revenue:      '/campaigns',
  risk:         '/customers',
  optimization: '/analytics',
  growth:       '/segments',
  engagement:   '/campaigns',
}

export default function ExecutiveInsights() {
  const navigate = useNavigate()
  const [key, setKey] = useState(0)

  const { data: rawData, isLoading, error } = useQuery({
    queryKey: ['executive-insights', key],
    queryFn: () => api.get('/insights').then(r => r.data.data),
  })

  const insights: any[] = rawData?.insights || []
  const metrics = rawData?.metrics || {}

  const handleRefresh = () => {
    setKey(k => k + 1)
    toast.success('Generating fresh AI insights...')
  }

  return (
    <div style={{ padding: 32, background: 'hsl(222,47%,4%)', minHeight: '100%', overflowY: 'auto' }}>
      <style>{`@keyframes shimmer{0%{background-position:-400px 0}100%{background-position:400px 0}} @keyframes spin{from{transform:rotate(0deg)}to{transform:rotate(360deg)}}`}</style>

      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}
        style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 32, flexWrap: 'wrap', gap: 16 }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 6 }}>
            <div style={{ width: 44, height: 44, borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'linear-gradient(135deg,#7c3aed,#c026d3)' }}>
              <Brain size={22} color="white" />
            </div>
            <div>
              <h1 style={{ fontSize: 28, fontWeight: 800, color: 'rgba(255,255,255,0.95)', margin: 0 }}>Executive Insights</h1>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 4 }}>
                <Sparkles size={12} color="#a78bfa" />
                <span style={{ fontSize: 12, color: '#a78bfa', fontWeight: 600 }}>Powered by Gemini AI</span>
              </div>
            </div>
          </div>
          <p style={{ fontSize: 14, color: 'rgba(255,255,255,0.45)', margin: 0 }}>AI-generated business intelligence from your CRM data</p>
        </div>
        <button onClick={handleRefresh} disabled={isLoading}
          style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 20px', borderRadius: 10, fontSize: 13, fontWeight: 700, background: 'linear-gradient(135deg,#7c3aed,#c026d3)', border: 'none', color: 'white', cursor: isLoading ? 'not-allowed' : 'pointer', opacity: isLoading ? 0.7 : 1 }}>
          <RefreshCw size={14} style={{ animation: isLoading ? 'spin 1s linear infinite' : 'none' }} />
          Generate New Insights
        </button>
      </motion.div>

      {/* Metrics strip */}
      {metrics && (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
          style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(160px,1fr))', gap: 16, marginBottom: 32 }}>
          {[
            { label: 'Total Customers', value: (metrics.customers?.total || 0).toLocaleString(), color: '#3b82f6', icon: Users },
            { label: 'Revenue Tracked', value: `₹${((metrics.revenue?.lifetime || 0) / 100000).toFixed(1)}L`, color: '#10b981', icon: DollarSign },
            { label: 'Active Campaigns', value: metrics.campaigns?.total || 0, color: '#7c3aed', icon: Target },
            { label: 'Segments Built', value: metrics.segments?.total || 0, color: '#f59e0b', icon: BarChart3 },
          ].map(({ label, value, color, icon: Icon }) => (
            <div key={label} style={{ padding: '16px 20px', borderRadius: 14, background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)' }}>
              <Icon size={16} style={{ color, marginBottom: 8 }} />
              <div style={{ fontSize: 22, fontWeight: 800, color }}>{value}</div>
              <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)', marginTop: 2 }}>{label}</div>
            </div>
          ))}
        </motion.div>
      )}

      {/* Insights Grid */}
      {error ? (
        <div style={{ textAlign: 'center', padding: 60 }}>
          <AlertTriangle size={40} color="#ef4444" style={{ marginBottom: 12 }} />
          <p style={{ color: 'rgba(255,255,255,0.5)', marginBottom: 16 }}>Failed to load insights</p>
          <button onClick={handleRefresh} style={{ padding: '10px 24px', borderRadius: 10, background: 'linear-gradient(135deg,#7c3aed,#c026d3)', border: 'none', color: 'white', cursor: 'pointer', fontWeight: 600 }}>
            Retry
          </button>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(380px,1fr))', gap: 20 }}>
          {isLoading
            ? Array(6).fill(0).map((_, i) => <SkeletonCard key={i} />)
            : insights.map((insight: any, i: number) => {
                const meta = CATEGORY_META[insight.category] || CATEGORY_META.engagement
                const Icon = meta.icon
                const priority = PRIORITY_COLORS[insight.priority] || PRIORITY_COLORS.medium
                const confidence = Math.round((insight.confidence || 0.85) * 100)

                return (
                  <motion.div key={i}
                    initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08 }}
                    style={{ padding: 24, borderRadius: 16, background: 'rgba(255,255,255,0.03)', border: `1px solid ${meta.color}20`, position: 'relative', overflow: 'hidden' }}>
                    {/* Top accent */}
                    <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 3, background: `linear-gradient(90deg,${meta.color},${meta.color}80)` }} />

                    {/* Header */}
                    <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 14 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <div style={{ width: 36, height: 36, borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', background: meta.bg, flexShrink: 0 }}>
                          <Icon size={17} style={{ color: meta.color }} />
                        </div>
                        <div>
                          <div style={{ fontSize: 10, fontWeight: 700, color: meta.color, textTransform: 'uppercase', letterSpacing: '0.06em' }}>{meta.label}</div>
                        </div>
                      </div>
                      <span style={{ fontSize: 10, fontWeight: 800, padding: '3px 8px', borderRadius: 6, background: priority.bg, color: priority.color, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                        {insight.priority}
                      </span>
                    </div>

                    <h3 style={{ fontSize: 16, fontWeight: 700, color: 'rgba(255,255,255,0.92)', marginBottom: 10, lineHeight: 1.4 }}>{insight.title}</h3>
                    <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.5)', lineHeight: 1.6, marginBottom: 16 }}>{insight.impact}</p>

                    {/* Revenue impact */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 12px', borderRadius: 10, background: 'rgba(16,185,129,0.06)', border: '1px solid rgba(16,185,129,0.15)', marginBottom: 14 }}>
                      <TrendingUp size={13} color="#10b981" />
                      <span style={{ fontSize: 12, color: '#10b981', fontWeight: 700 }}>{insight.estimatedRevenue}</span>
                      <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.35)' }}>estimated impact</span>
                    </div>

                    {/* Action */}
                    <div style={{ display: 'flex', alignItems: 'flex-start', gap: 8, marginBottom: 16 }}>
                      <ChevronRight size={14} color="#a78bfa" style={{ flexShrink: 0, marginTop: 2 }} />
                      <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.65)', lineHeight: 1.5 }}>{insight.action}</span>
                    </div>

                    {/* Confidence bar */}
                    <div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                        <span style={{ fontSize: 10, color: 'rgba(255,255,255,0.35)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>AI Confidence</span>
                        <span style={{ fontSize: 10, fontWeight: 800, color: meta.color }}>{confidence}%</span>
                      </div>
                      <div style={{ height: 4, borderRadius: 2, background: 'rgba(255,255,255,0.06)' }}>
                        <motion.div
                          initial={{ width: 0 }} animate={{ width: `${confidence}%` }} transition={{ delay: i * 0.08 + 0.3, duration: 0.8, ease: 'easeOut' }}
                          style={{ height: '100%', borderRadius: 2, background: `linear-gradient(90deg,${meta.color},${meta.color}80)` }}
                        />
                      </div>
                    </div>

                    {/* Action button */}
                    <button
                      onClick={() => navigate(ACTION_ROUTES[insight.category] || '/dashboard')}
                      style={{ marginTop: 16, width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, padding: '9px', borderRadius: 10, fontSize: 12, fontWeight: 700, cursor: 'pointer', background: meta.bg, border: `1px solid ${meta.color}30`, color: meta.color }}
                      onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = `${meta.color}20`; (e.currentTarget as HTMLElement).style.borderColor = meta.color }}
                      onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = meta.bg; (e.currentTarget as HTMLElement).style.borderColor = `${meta.color}30` }}
                    >
                      Take Action <ArrowRight size={13} />
                    </button>
                  </motion.div>
                )
              })}
        </div>
      )}
    </div>
  )
}
