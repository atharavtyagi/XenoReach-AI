import { useState } from 'react'
import { useMutation } from '@tanstack/react-query'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Sparkles, Wand2, Send, Users, GitBranch, Zap,
  Calendar, Loader2, CheckCircle, ChevronRight
} from 'lucide-react'
import api from '../lib/api'
import toast from 'react-hot-toast'

const BIZ_TYPES = ['Retail Fashion', 'Electronics', 'F&B / Restaurant', 'Grocery', 'Beauty & Wellness', 'Luxury / Premium', 'Other']

const TABS = [
  { id: 'integrations', label: 'Integrations', icon: Zap },
  { id: 'segments', label: 'Segments', icon: Users },
  { id: 'campaigns', label: 'Campaigns', icon: Send },
  { id: 'workflows', label: 'Workflows', icon: GitBranch },
  { id: 'timeline', label: 'Timeline', icon: Calendar },
]

const PRIORITY_COLORS: Record<string, { color: string; bg: string }> = {
  high:   { color: '#ef4444', bg: 'rgba(239,68,68,0.12)' },
  medium: { color: '#f59e0b', bg: 'rgba(245,158,11,0.12)' },
  low:    { color: '#10b981', bg: 'rgba(16,185,129,0.12)' },
}

export default function SolutionRecommendations() {
  const [bizType, setBizType] = useState('')
  const [custCount, setCustCount] = useState('')
  const [monthlyOrders, setMonthlyOrders] = useState('')
  const [challenges, setChallenges] = useState('')
  const [activeTab, setActiveTab] = useState('integrations')
  const [result, setResult] = useState<any>(null)

  const generateMutation = useMutation({
    mutationFn: (data: any) => api.post('/solutions/generate', data).then(r => r.data.data),
    onSuccess: (data) => { setResult(data); setActiveTab('integrations'); toast.success('AI recommendations generated! 🎉') },
    onError: () => toast.error('Generation failed. Please try again.'),
  })

  const handleGenerate = () => {
    if (!bizType || !custCount) { toast.error('Please fill in business type and customer count'); return }
    generateMutation.mutate({ businessType: bizType, customerCount: parseInt(custCount), monthlyOrders: parseInt(monthlyOrders) || undefined, challenges })
  }

  const inputStyle: React.CSSProperties = { width: '100%', padding: '11px 14px', borderRadius: 10, background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.12)', color: 'rgba(255,255,255,0.9)', fontSize: 14, outline: 'none', boxSizing: 'border-box', fontFamily: 'Inter, sans-serif' }

  return (
    <div style={{ padding: 32, background: 'hsl(222,47%,4%)', minHeight: '100%', overflowY: 'auto' }}>

      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} style={{ marginBottom: 32 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 6 }}>
          <div style={{ width: 44, height: 44, borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'linear-gradient(135deg,#7c3aed,#c026d3)' }}>
            <Wand2 size={22} color="white" />
          </div>
          <div>
            <h1 style={{ fontSize: 28, fontWeight: 800, color: 'rgba(255,255,255,0.95)', margin: 0 }}>Solution Recommendations</h1>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 4 }}>
              <Sparkles size={12} color="#a78bfa" />
              <span style={{ fontSize: 12, color: '#a78bfa', fontWeight: 600 }}>AI-Powered Implementation Report</span>
            </div>
          </div>
        </div>
        <p style={{ fontSize: 14, color: 'rgba(255,255,255,0.45)', margin: 0 }}>Describe your business and get a personalized CRM implementation plan</p>
      </motion.div>

      <div style={{ display: 'grid', gridTemplateColumns: result ? '380px 1fr' : '1fr', gap: 24 }}>

        {/* Input Form */}
        <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.1 }}
          style={{ padding: 28, borderRadius: 18, background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', height: 'fit-content' }}>
          <div style={{ fontSize: 15, fontWeight: 700, color: 'rgba(255,255,255,0.85)', marginBottom: 24, display: 'flex', alignItems: 'center', gap: 8 }}>
            <Sparkles size={16} color="#a78bfa" /> Tell me about your business
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
            <div>
              <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: 'rgba(255,255,255,0.45)', marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Business Type *</label>
              <select value={bizType} onChange={e => setBizType(e.target.value)} style={{ ...inputStyle }}>
                <option value="">Select business type...</option>
                {BIZ_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
            <div>
              <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: 'rgba(255,255,255,0.45)', marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Customer Count *</label>
              <input type="number" value={custCount} onChange={e => setCustCount(e.target.value)} placeholder="e.g. 5000" style={inputStyle} />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: 'rgba(255,255,255,0.45)', marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Monthly Orders</label>
              <input type="number" value={monthlyOrders} onChange={e => setMonthlyOrders(e.target.value)} placeholder="e.g. 800" style={inputStyle} />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: 'rgba(255,255,255,0.45)', marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Business Challenges</label>
              <textarea value={challenges} onChange={e => setChallenges(e.target.value)} placeholder="e.g. High churn, fragmented data, low retention..." rows={3}
                style={{ ...inputStyle, resize: 'vertical', lineHeight: 1.5 }} />
            </div>
            <button onClick={handleGenerate} disabled={generateMutation.isPending}
              style={{ width: '100%', padding: '13px', borderRadius: 12, fontWeight: 800, fontSize: 15, color: 'white', border: 'none', cursor: generateMutation.isPending ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, background: generateMutation.isPending ? 'rgba(124,58,237,0.5)' : 'linear-gradient(135deg,#7c3aed,#c026d3)' }}>
              {generateMutation.isPending ? <><Loader2 size={18} style={{ animation: 'spin 1s linear infinite' }} /> Gemini AI is analyzing...</> : <><Wand2 size={16} /> Generate AI Recommendations</>}
            </button>
          </div>
        </motion.div>

        {/* Results */}
        <AnimatePresence>
          {result && (
            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}>
              {/* Summary */}
              <div style={{ padding: '18px 22px', borderRadius: 14, background: 'linear-gradient(135deg,rgba(124,58,237,0.1),rgba(192,38,211,0.07))', border: '1px solid rgba(124,58,237,0.2)', marginBottom: 20 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
                  <Sparkles size={14} color="#a78bfa" />
                  <span style={{ fontSize: 12, fontWeight: 700, color: '#a78bfa', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Executive Summary</span>
                </div>
                <p style={{ fontSize: 14, color: 'rgba(255,255,255,0.75)', lineHeight: 1.7, margin: 0 }}>{result.summary}</p>
              </div>

              {/* Tab nav */}
              <div style={{ display: 'flex', gap: 6, marginBottom: 20, flexWrap: 'wrap' }}>
                {TABS.map(tab => {
                  const TIcon = tab.icon
                  return (
                    <button key={tab.id} onClick={() => setActiveTab(tab.id)}
                      style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '8px 16px', borderRadius: 8, fontSize: 12, fontWeight: 600, cursor: 'pointer', border: 'none', background: activeTab === tab.id ? 'linear-gradient(135deg,#7c3aed,#c026d3)' : 'rgba(255,255,255,0.05)', color: activeTab === tab.id ? 'white' : 'rgba(255,255,255,0.55)' }}>
                      <TIcon size={13} /> {tab.label}
                    </button>
                  )
                })}
              </div>

              {/* Tab content */}
              <style>{`@keyframes spin{from{transform:rotate(0deg)}to{transform:rotate(360deg)}}`}</style>
              <AnimatePresence mode="wait">
                <motion.div key={activeTab} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
                  {activeTab === 'integrations' && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                      {(result.integrations || []).map((item: any, i: number) => {
                        const p = PRIORITY_COLORS[item.priority] || PRIORITY_COLORS.medium
                        return (
                          <div key={i} style={{ padding: '16px 20px', borderRadius: 12, background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)', display: 'flex', alignItems: 'flex-start', gap: 16 }}>
                            <span style={{ fontSize: 10, fontWeight: 800, padding: '3px 9px', borderRadius: 5, background: p.bg, color: p.color, textTransform: 'uppercase', letterSpacing: '0.04em', flexShrink: 0, marginTop: 3 }}>{item.priority}</span>
                            <div>
                              <div style={{ fontSize: 14, fontWeight: 700, color: 'rgba(255,255,255,0.9)', marginBottom: 4 }}>{item.name}</div>
                              <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.5)', lineHeight: 1.5 }}>{item.reason}</div>
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  )}
                  {activeTab === 'segments' && (
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
                      {(result.segments || []).map((seg: any, i: number) => (
                        <div key={i} style={{ padding: '18px 20px', borderRadius: 12, background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)' }}>
                          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
                            <div style={{ fontSize: 14, fontWeight: 700, color: 'rgba(255,255,255,0.9)' }}>{seg.name}</div>
                            <span style={{ fontSize: 11, fontWeight: 700, padding: '2px 8px', borderRadius: 5, background: 'rgba(124,58,237,0.15)', color: '#a78bfa' }}>{seg.estimatedSize}</span>
                          </div>
                          <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.5)', lineHeight: 1.5 }}>{seg.description}</div>
                        </div>
                      ))}
                    </div>
                  )}
                  {activeTab === 'campaigns' && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                      {(result.campaigns || []).map((camp: any, i: number) => (
                        <div key={i} style={{ padding: '16px 20px', borderRadius: 12, background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)', display: 'flex', alignItems: 'flex-start', gap: 16 }}>
                          <div style={{ flex: 1 }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
                              <span style={{ fontSize: 14, fontWeight: 700, color: 'rgba(255,255,255,0.9)' }}>{camp.name}</span>
                              <span style={{ fontSize: 10, fontWeight: 700, padding: '2px 8px', borderRadius: 5, background: 'rgba(59,130,246,0.15)', color: '#3b82f6' }}>{camp.channel}</span>
                            </div>
                            <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.5)' }}>{camp.goal}</div>
                          </div>
                          <div style={{ textAlign: 'right', flexShrink: 0 }}>
                            <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.35)' }}>Expected ROI</div>
                            <div style={{ fontSize: 18, fontWeight: 800, color: '#10b981' }}>{camp.expectedROI}</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                  {activeTab === 'workflows' && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                      {(result.workflows || []).map((wf: any, i: number) => (
                        <div key={i} style={{ padding: '16px 20px', borderRadius: 12, background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)' }}>
                          <div style={{ fontSize: 14, fontWeight: 700, color: 'rgba(255,255,255,0.9)', marginBottom: 6 }}>{wf.name}</div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                            <span style={{ fontSize: 11, padding: '2px 8px', borderRadius: 5, background: 'rgba(245,158,11,0.15)', color: '#f59e0b' }}>Trigger: {wf.trigger}</span>
                          </div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: 'rgba(255,255,255,0.5)' }}>
                            <ChevronRight size={12} color="#a78bfa" /> {wf.outcome}
                          </div>
                        </div>
                      ))}
                      {result.retentionStrategy && (
                        <div style={{ padding: '18px 22px', borderRadius: 14, background: 'rgba(16,185,129,0.05)', border: '1px solid rgba(16,185,129,0.15)', marginTop: 8 }}>
                          <div style={{ fontSize: 13, fontWeight: 700, color: '#10b981', marginBottom: 10 }}>Retention Strategy</div>
                          <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.6)', lineHeight: 1.6, marginBottom: 12 }}>{result.retentionStrategy.approach}</p>
                          {(result.retentionStrategy.tactics || []).map((t: string, i: number) => (
                            <div key={i} style={{ display: 'flex', gap: 8, marginBottom: 6 }}>
                              <CheckCircle size={13} color="#10b981" style={{ flexShrink: 0, marginTop: 2 }} />
                              <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.55)' }}>{t}</span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                  {activeTab === 'timeline' && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                      {(result.implementationTimeline || []).map((item: any, i: number) => (
                        <div key={i} style={{ display: 'flex', gap: 16, alignItems: 'flex-start' }}>
                          <div style={{ width: 44, height: 44, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'linear-gradient(135deg,#7c3aed,#c026d3)', flexShrink: 0, fontSize: 13, fontWeight: 800, color: 'white' }}>W{item.week}</div>
                          <div style={{ flex: 1, padding: '12px 16px', borderRadius: 12, background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)', marginTop: 4 }}>
                            <div style={{ fontSize: 11, fontWeight: 700, color: 'rgba(255,255,255,0.4)', marginBottom: 4 }}>WEEK {item.week}</div>
                            <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.75)', lineHeight: 1.5 }}>{item.milestone}</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </motion.div>
              </AnimatePresence>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {!result && !generateMutation.isPending && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }}
          style={{ marginTop: 24, textAlign: 'center', padding: '48px 0', color: 'rgba(255,255,255,0.25)' }}>
          <Wand2 size={40} style={{ margin: '0 auto 12px', display: 'block', opacity: 0.3 }} />
          <p style={{ fontSize: 15, fontWeight: 600 }}>Fill in your business details and click Generate</p>
          <p style={{ fontSize: 13, marginTop: 6 }}>Gemini AI will create a personalized implementation report in seconds</p>
        </motion.div>
      )}
    </div>
  )
}
