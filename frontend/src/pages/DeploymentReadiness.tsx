import { motion } from 'framer-motion'
import { Activity, Database, Layers, Send, GitBranch, Brain, Download, AlertCircle, CheckCircle, ChevronRight } from 'lucide-react'
import { RadarChart, PolarGrid, PolarAngleAxis, Radar, ResponsiveContainer } from 'recharts'
import toast from 'react-hot-toast'

function downloadReadinessReport() {
  const rows = [
    ['Category', 'Score', 'Status', 'Notes'],
    ['Data Quality', '78', 'Good', '89/100 health score, 3 issues pending'],
    ['Integrations', '60', 'Needs Work', '3 of 8 connected'],
    ['Segmentation', '92', 'Excellent', '3 active AI segments'],
    ['Campaign Setup', '85', 'Excellent', '5 campaigns, 3 completed'],
    ['Workflow Coverage', '70', 'Good', '4 workflows, 2 inactive'],
    ['AI Utilization', '95', 'Excellent', 'Gemini AI fully active'],
    [],
    ['Overall Score', `${Math.round((78+60+92+85+70+95)/6)}%`, 'Nearly Ready', 'Generated: ' + new Date().toLocaleDateString('en-IN')],
  ]
  const csv = rows.map(r => r.join(',')).join('\n')
  const blob = new Blob([csv], { type: 'text/csv' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `XenoReach_Deployment_Readiness_${new Date().toISOString().split('T')[0]}.csv`
  a.click()
  URL.revokeObjectURL(url)
  toast.success('Readiness report downloaded!')
}

const CATEGORIES = [
  { id: 'data', label: 'Data Quality', score: 78, icon: Database, color: '#f59e0b', note: '89/100 health score, 3 issues pending', desc: 'Customer data completeness and accuracy' },
  { id: 'integrations', label: 'Integrations', score: 60, icon: Layers, color: '#ef4444', note: '3 of 8 connected', desc: 'Platform and data source connections' },
  { id: 'segments', label: 'Segmentation', score: 92, icon: Activity, color: '#10b981', note: '3 active AI segments', desc: 'Customer segment coverage and quality' },
  { id: 'campaigns', label: 'Campaign Setup', score: 85, icon: Send, color: '#10b981', note: '5 campaigns, 3 completed', desc: 'Campaign configuration and delivery' },
  { id: 'workflows', label: 'Workflow Coverage', score: 70, icon: GitBranch, color: '#f59e0b', note: '4 workflows, 2 inactive', desc: 'Automation coverage and trigger setup' },
  { id: 'ai', label: 'AI Utilization', score: 95, icon: Brain, color: '#10b981', note: 'Gemini AI fully active', desc: 'AI features adoption and configuration' },
]

const RECOMMENDATIONS = [
  { priority: 'high', action: 'Connect Shopify and POS integrations to improve data completeness by 35%', category: 'Integrations', icon: Layers, color: '#ef4444' },
  { priority: 'high', action: 'Fix 12 customer records with zero spend data — run data recalculation script', category: 'Data Quality', icon: Database, color: '#f59e0b' },
  { priority: 'medium', action: 'Activate "Churn Prevention" and "Upsell" workflows to boost automation coverage', category: 'Workflows', icon: GitBranch, color: '#f59e0b' },
  { priority: 'low', action: 'Create 2 more targeted segments to improve coverage from 85% to 95%+', category: 'Segments', icon: Activity, color: '#10b981' },
]

function CircularScore({ score }: { score: number }) {
  const r = 70, cx = 85, cy = 85
  const circum = 2 * Math.PI * r
  const offset = circum * (1 - score / 100)
  const color = score >= 85 ? '#10b981' : score >= 70 ? '#f59e0b' : '#ef4444'
  return (
    <svg width={170} height={170} viewBox="0 0 170 170">
      <circle cx={cx} cy={cy} r={r} fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth={12} />
      <circle cx={cx} cy={cy} r={r} fill="none" stroke={color} strokeWidth={12}
        strokeDasharray={circum} strokeDashoffset={offset} strokeLinecap="round"
        transform={`rotate(-90 ${cx} ${cy})`} style={{ transition: 'stroke-dashoffset 1.2s ease' }} />
      <text x={cx} y={cy} textAnchor="middle" dominantBaseline="central" style={{ fontSize: 34, fontWeight: 800, fill: color }}>{score}%</text>
      <text x={cx} y={cy + 24} textAnchor="middle" dominantBaseline="central" style={{ fontSize: 12, fill: 'rgba(255,255,255,0.4)' }}>Readiness</text>
    </svg>
  )
}

const overall = Math.round(CATEGORIES.reduce((s, c) => s + c.score, 0) / CATEGORIES.length)
const radarData = CATEGORIES.map(c => ({ subject: c.label.split(' ')[0], score: c.score }))

export default function DeploymentReadiness() {
  return (
    <div style={{ padding: 32, background: 'hsl(222,47%,4%)', minHeight: '100%', overflowY: 'auto' }}>

      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}
        style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 32, flexWrap: 'wrap', gap: 16 }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 6 }}>
            <div style={{ width: 44, height: 44, borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'linear-gradient(135deg,#059669,#10b981)' }}>
              <CheckCircle size={22} color="white" />
            </div>
            <h1 style={{ fontSize: 28, fontWeight: 800, color: 'rgba(255,255,255,0.95)', margin: 0 }}>Deployment Readiness</h1>
          </div>
          <p style={{ fontSize: 14, color: 'rgba(255,255,255,0.45)', margin: 0 }}>Enterprise deployment evaluation — go-live readiness assessment</p>
        </div>
        <button onClick={downloadReadinessReport}
          style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 20px', borderRadius: 10, fontSize: 13, fontWeight: 700, background: 'linear-gradient(135deg,#7c3aed,#c026d3)', border: 'none', color: 'white', cursor: 'pointer' }}>
          <Download size={14} /> Download Report
        </button>
      </motion.div>

      {/* Top section: Score + Radar */}
      <div style={{ display: 'grid', gridTemplateColumns: 'auto 1fr', gap: 24, marginBottom: 28 }}>
        <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.1 }}
          style={{ padding: 32, borderRadius: 20, background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
          <CircularScore score={overall} />
          <div style={{ marginTop: 16, textAlign: 'center' }}>
            <div style={{ fontSize: 14, fontWeight: 700, color: overall >= 85 ? '#10b981' : '#f59e0b', marginBottom: 4 }}>
              {overall >= 85 ? '✓ Ready to Deploy' : overall >= 70 ? '⚠ Nearly Ready' : '✗ Needs Work'}
            </div>
            <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.35)' }}>Overall score: {overall}/100</div>
          </div>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}
          style={{ padding: 24, borderRadius: 20, background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)' }}>
          <div style={{ fontSize: 13, fontWeight: 700, color: 'rgba(255,255,255,0.6)', marginBottom: 8 }}>Coverage Radar</div>
          <ResponsiveContainer width="100%" height={220}>
            <RadarChart data={radarData}>
              <PolarGrid stroke="rgba(255,255,255,0.06)" />
              <PolarAngleAxis dataKey="subject" tick={{ fill: 'rgba(255,255,255,0.4)', fontSize: 11 }} />
              <Radar name="Score" dataKey="score" stroke="#7c3aed" fill="#7c3aed" fillOpacity={0.2} strokeWidth={2} />
            </RadarChart>
          </ResponsiveContainer>
        </motion.div>
      </div>

      {/* Category cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(300px,1fr))', gap: 16, marginBottom: 28 }}>
        {CATEGORIES.map((cat, i) => {
          const CatIcon = cat.icon
          const label = cat.score >= 85 ? 'Excellent' : cat.score >= 70 ? 'Good' : 'Needs Work'
          return (
            <motion.div key={cat.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 + i * 0.05 }}
              style={{ padding: '20px 22px', borderRadius: 14, background: 'rgba(255,255,255,0.03)', border: `1px solid ${cat.color}20` }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <div style={{ width: 36, height: 36, borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', background: `${cat.color}15` }}>
                    <CatIcon size={17} style={{ color: cat.color }} />
                  </div>
                  <div>
                    <div style={{ fontSize: 14, fontWeight: 700, color: 'rgba(255,255,255,0.9)' }}>{cat.label}</div>
                    <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.35)' }}>{cat.desc}</div>
                  </div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: 22, fontWeight: 800, color: cat.color }}>{cat.score}%</div>
                  <div style={{ fontSize: 10, fontWeight: 700, color: cat.color }}>{label}</div>
                </div>
              </div>
              <div style={{ height: 6, borderRadius: 3, background: 'rgba(255,255,255,0.06)', marginBottom: 10 }}>
                <motion.div initial={{ width: 0 }} animate={{ width: `${cat.score}%` }} transition={{ delay: 0.3 + i * 0.05, duration: 0.8 }}
                  style={{ height: '100%', borderRadius: 3, background: cat.color }} />
              </div>
              <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)' }}>{cat.note}</div>
            </motion.div>
          )
        })}
      </div>

      {/* Recommendations */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.55 }}
        style={{ padding: 24, borderRadius: 16, background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.07)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20 }}>
          <AlertCircle size={16} color="#f59e0b" />
          <span style={{ fontSize: 15, fontWeight: 700, color: 'rgba(255,255,255,0.85)' }}>Recommendations to Improve Score</span>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {RECOMMENDATIONS.map((rec, i) => {
            const RIcon = rec.icon
            const pColors = { high: '#ef4444', medium: '#f59e0b', low: '#10b981' }
            const pColor = pColors[rec.priority as keyof typeof pColors]
            return (
              <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 14, padding: '14px 16px', borderRadius: 12, background: 'rgba(255,255,255,0.03)', border: `1px solid ${rec.color}15` }}>
                <div style={{ width: 32, height: 32, borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', background: `${rec.color}12`, flexShrink: 0 }}>
                  <RIcon size={15} style={{ color: rec.color }} />
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                    <span style={{ fontSize: 10, fontWeight: 800, padding: '2px 7px', borderRadius: 4, background: `${pColor}15`, color: pColor, textTransform: 'uppercase' }}>{rec.priority}</span>
                    <span style={{ fontSize: 10, color: 'rgba(255,255,255,0.35)' }}>{rec.category}</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <ChevronRight size={12} color="#a78bfa" />
                    <span style={{ fontSize: 13, color: 'rgba(255,255,255,0.7)', lineHeight: 1.5 }}>{rec.action}</span>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </motion.div>
    </div>
  )
}
