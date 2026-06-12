import { useState } from 'react'
import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { CheckCircle, Circle, Target, Database, Plug, GitBranch, Send, Download, Calendar, Loader2 } from 'lucide-react'
import toast from 'react-hot-toast'

const STAGES = [
  {
    id: 1, name: 'Discovery', icon: Target, percent: 100, status: 'complete' as const,
    date: 'Completed June 1 · Week 1',
    note: 'Identified 3 key data sources: Shopify, POS, Loyalty platform',
    tasks: [
      { label: 'Stakeholder interviews', done: true },
      { label: 'Tech stack review', done: true },
      { label: 'Data audit & assessment', done: true },
      { label: 'Goals alignment workshop', done: true },
    ],
  },
  {
    id: 2, name: 'Data Collection', icon: Database, percent: 100, status: 'complete' as const,
    date: 'Completed June 7 · Week 2',
    note: '28,400 customer records imported across 3 sources',
    tasks: [
      { label: 'Shopify historical export', done: true },
      { label: 'POS transaction data extract', done: true },
      { label: 'Legacy CRM migration', done: true },
      { label: 'Loyalty program data import', done: true },
    ],
  },
  {
    id: 3, name: 'Data Cleaning', icon: Database, percent: 85, status: 'progress' as const,
    date: 'ETA: June 15',
    tasks: [
      { label: 'Deduplication scan', done: true },
      { label: 'Format standardization (+91)', done: true },
      { label: 'Missing field enrichment', done: false, inProgress: true },
      { label: 'Quality validation (target: 95%)', done: false },
    ],
  },
  {
    id: 4, name: 'Integration Setup', icon: Plug, percent: 60, status: 'progress' as const,
    date: 'ETA: June 18',
    tasks: [
      { label: 'Shopify sync live', done: true },
      { label: 'Google Analytics connected', done: true },
      { label: 'POS real-time pipeline', done: false, inProgress: true },
      { label: 'WhatsApp Business API', done: false },
      { label: 'Loyalty platform webhook', done: false },
    ],
  },
  {
    id: 5, name: 'Workflow Configuration', icon: GitBranch, percent: 40, status: 'progress' as const,
    date: 'ETA: June 22',
    tasks: [
      { label: 'Welcome series (3-touch)', done: true },
      { label: 'Churn alert trigger', done: true },
      { label: 'Win-back flow (20% discount)', done: false, inProgress: true },
      { label: 'Upsell automation', done: false },
      { label: 'VIP upgrade trigger', done: false },
    ],
  },
  {
    id: 6, name: 'Campaign Launch', icon: Send, percent: 20, status: 'progress' as const,
    date: 'ETA: June 28',
    tasks: [
      { label: 'VIP early access campaign', done: true },
      { label: 'Re-engagement drive', done: false },
      { label: 'Welcome series email', done: false },
      { label: 'Festival flash sale prep', done: false },
      { label: 'Analytics instrumentation', done: false },
    ],
  },
  {
    id: 7, name: 'Optimization', icon: Target, percent: 0, status: 'pending' as const,
    date: 'Starts July 1',
    tasks: [
      { label: 'A/B test analysis', done: false },
      { label: 'Performance review meeting', done: false },
      { label: 'Segment refinement', done: false },
      { label: 'ROI attribution analysis', done: false },
      { label: 'Phase 2 planning', done: false },
    ],
  },
]

const CLIENTS = ['Demo Retail Brand', 'FashionFirst India', 'TechGadgets Pro']

const weightedProgress = Math.round(STAGES.reduce((s, st) => s + st.percent, 0) / STAGES.length)
const complete = STAGES.filter(s => s.status === 'complete').length
const inProgress = STAGES.filter(s => s.status === 'progress').length
const pending = STAGES.filter(s => s.status === 'pending').length

export default function ImplementationTracker() {
  const navigate = useNavigate()
  const [selectedClient, setSelectedClient] = useState(CLIENTS[0])
  const [completedTasks, setCompletedTasks] = useState<Record<string, boolean>>({})

  const toggleTask = (stageId: number, taskIdx: number) => {
    const key = `${stageId}-${taskIdx}`
    setCompletedTasks(prev => ({ ...prev, [key]: !prev[key] }))
  }

  const downloadReport = () => {
    const rows = [
      ['Implementation Tracker — ' + selectedClient, '', '', ''],
      ['Generated', new Date().toLocaleDateString('en-IN'), '', ''],
      ['Overall Progress', weightedProgress + '%', '', ''],
      [],
      ['Stage', 'Status', 'Progress', 'Tasks Done'],
      ...STAGES.map(s => [
        `Stage ${s.id}: ${s.name}`,
        s.status === 'complete' ? 'Complete' : s.status === 'progress' ? 'In Progress' : 'Pending',
        s.percent + '%',
        s.tasks.filter(t => t.done).length + '/' + s.tasks.length
      ])
    ]
    const csv = rows.map(r => r.join(',')).join('\n')
    const blob = new Blob([csv], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `XenoReach_Implementation_${selectedClient.replace(/ /g, '_')}_${new Date().toISOString().split('T')[0]}.csv`
    a.click()
    URL.revokeObjectURL(url)
    toast.success('Implementation report downloaded!')
  }

  const statusColor = { complete: '#10b981', progress: '#f59e0b', pending: 'rgba(255,255,255,0.2)' }
  const statusBg = { complete: 'rgba(16,185,129,0.12)', progress: 'rgba(245,158,11,0.1)', pending: 'rgba(255,255,255,0.04)' }
  const statusLabel = { complete: 'Complete', progress: 'In Progress', pending: 'Pending' }

  return (
    <div style={{ padding: 32, background: 'hsl(222,47%,4%)', minHeight: '100%', overflowY: 'auto' }}>

      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}
        style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 28, flexWrap: 'wrap', gap: 16 }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 6 }}>
            <div style={{ width: 44, height: 44, borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'linear-gradient(135deg,#0ea5e9,#7c3aed)' }}>
              <Target size={22} color="white" />
            </div>
            <h1 style={{ fontSize: 28, fontWeight: 800, color: 'rgba(255,255,255,0.95)', margin: 0 }}>Implementation Tracker</h1>
          </div>
          <p style={{ fontSize: 14, color: 'rgba(255,255,255,0.45)', margin: 0 }}>Customer onboarding progress & milestone tracking</p>
        </div>
        <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
          <select value={selectedClient} onChange={e => setSelectedClient(e.target.value)}
            style={{ padding: '9px 14px', borderRadius: 9, background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.12)', color: 'rgba(255,255,255,0.8)', fontSize: 13, outline: 'none', cursor: 'pointer' }}>
            {CLIENTS.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>
      </motion.div>

      {/* Progress summary */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
        style={{ padding: '20px 24px', borderRadius: 16, background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', marginBottom: 24 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14, flexWrap: 'wrap', gap: 12 }}>
          <div style={{ display: 'flex', gap: 24 }}>
            {[
              { label: 'Complete', value: complete, color: '#10b981' },
              { label: 'In Progress', value: inProgress, color: '#f59e0b' },
              { label: 'Pending', value: pending, color: 'rgba(255,255,255,0.3)' },
            ].map(({ label, value, color }) => (
              <div key={label} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <div style={{ width: 10, height: 10, borderRadius: '50%', background: color }} />
                <span style={{ fontSize: 13, color: 'rgba(255,255,255,0.6)' }}>{value} {label}</span>
              </div>
            ))}
          </div>
          <span style={{ fontSize: 16, fontWeight: 800, color: '#7c3aed' }}>{weightedProgress}% overall</span>
        </div>
        <div style={{ height: 10, borderRadius: 5, background: 'rgba(255,255,255,0.06)', overflow: 'hidden' }}>
          <motion.div initial={{ width: 0 }} animate={{ width: `${weightedProgress}%` }} transition={{ delay: 0.3, duration: 1, ease: 'easeOut' }}
            style={{ height: '100%', borderRadius: 5, background: 'linear-gradient(90deg,#7c3aed,#10b981)' }} />
        </div>
      </motion.div>

      {/* Timeline */}
      <div style={{ position: 'relative' }}>
        <div style={{ position: 'absolute', left: 28, top: 0, bottom: 0, width: 2, background: 'linear-gradient(180deg,rgba(124,58,237,0.4),rgba(255,255,255,0.05))', zIndex: 0 }} />
        <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
          {STAGES.map((stage, i) => {
            const SIcon = stage.icon
            const sColor = statusColor[stage.status]
            const sBg = statusBg[stage.status]
            const sLabel = statusLabel[stage.status]

            return (
              <motion.div key={stage.id}
                initial={{ opacity: 0, x: -24 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2 + i * 0.07 }}
                style={{ display: 'flex', gap: 20, paddingBottom: 24, position: 'relative', zIndex: 1 }}>
                {/* Circle */}
                <div style={{ width: 58, flexShrink: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 0 }}>
                  <div style={{ width: 42, height: 42, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', background: sBg, border: `2px solid ${sColor}`, flexShrink: 0, position: 'relative', zIndex: 2 }}>
                    {stage.status === 'complete' ? <CheckCircle size={20} style={{ color: sColor }} /> :
                      stage.status === 'progress' ? <Loader2 size={18} style={{ color: sColor, animation: 'spin 2s linear infinite' }} /> :
                      <Circle size={18} style={{ color: 'rgba(255,255,255,0.2)' }} />}
                  </div>
                </div>

                {/* Card */}
                <div style={{ flex: 1, padding: '18px 22px', borderRadius: 14, background: 'rgba(255,255,255,0.03)', border: `1px solid ${stage.status === 'complete' ? 'rgba(16,185,129,0.15)' : stage.status === 'progress' ? 'rgba(245,158,11,0.15)' : 'rgba(255,255,255,0.06)'}` }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12, flexWrap: 'wrap', gap: 8 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <SIcon size={16} style={{ color: sColor }} />
                      <span style={{ fontSize: 16, fontWeight: 800, color: 'rgba(255,255,255,0.9)' }}>Stage {stage.id}: {stage.name}</span>
                      <span style={{ fontSize: 10, fontWeight: 800, padding: '2px 8px', borderRadius: 5, background: sBg, color: sColor, border: `1px solid ${sColor}25`, textTransform: 'uppercase', letterSpacing: '0.05em' }}>{sLabel}</span>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontSize: 18, fontWeight: 800, color: sColor }}>{stage.percent}%</div>
                    </div>
                  </div>

                  {/* Progress bar */}
                  <div style={{ height: 5, borderRadius: 2.5, background: 'rgba(255,255,255,0.06)', marginBottom: 12 }}>
                    <div style={{ width: `${stage.percent}%`, height: '100%', borderRadius: 2.5, background: sColor, transition: 'width 0.8s ease' }} />
                  </div>

                  {/* Tasks */}
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(240px,1fr))', gap: 8, marginBottom: 12 }}>
                    {stage.tasks.map((task, j) => {
                      const key = `${stage.id}-${j}`
                      const isDone = task.done || !!completedTasks[key]
                      return (
                        <div key={j} style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer' }}
                          onClick={() => toggleTask(stage.id, j)}>
                          {isDone ? <CheckCircle size={13} color="#10b981" /> : (task as any).inProgress ? <Loader2 size={13} color="#f59e0b" style={{ animation: 'spin 2s linear infinite' }} /> : <Circle size={13} color="rgba(255,255,255,0.2)" />}
                          <span style={{ fontSize: 12, color: isDone ? 'rgba(255,255,255,0.65)' : (task as any).inProgress ? '#f59e0b' : 'rgba(255,255,255,0.3)', textDecoration: isDone && !task.done ? 'line-through' : 'none' }}>{task.label}</span>
                        </div>
                      )
                    })}
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: 16, fontSize: 12, color: 'rgba(255,255,255,0.35)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                      <Calendar size={11} /> {stage.date}
                    </div>
                    {stage.note && <div style={{ fontStyle: 'italic', color: 'rgba(255,255,255,0.4)' }}>{stage.note}</div>}
                  </div>
                </div>
              </motion.div>
            )
          })}
        </div>
      </div>

      {/* Action bar */}
      <style>{`@keyframes spin{from{transform:rotate(0deg)}to{transform:rotate(360deg)}}`}</style>
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.8 }}
        style={{ display: 'flex', gap: 14, marginTop: 8, justifyContent: 'center', flexWrap: 'wrap' }}>
        <button onClick={() => navigate('/implementation-assistant')}
          style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '12px 28px', borderRadius: 12, fontSize: 14, fontWeight: 700, background: 'linear-gradient(135deg,#7c3aed,#c026d3)', border: 'none', color: 'white', cursor: 'pointer' }}>
          <Calendar size={15} /> Schedule Review Call
        </button>
        <button onClick={downloadReport}
          style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '12px 28px', borderRadius: 12, fontSize: 14, fontWeight: 700, background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.15)', color: 'rgba(255,255,255,0.75)', cursor: 'pointer' }}>
          <Download size={15} /> Download Report
        </button>
      </motion.div>
    </div>
  )
}
