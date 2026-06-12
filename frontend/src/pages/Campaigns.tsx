import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { motion, AnimatePresence } from 'framer-motion'
import { useNavigate, useSearchParams } from 'react-router-dom'
import {
  Plus, Send, Sparkles, Rocket,
  Loader2, Mail, MessageSquare, Smartphone, Bell, Radio, BarChart3, X,
} from 'lucide-react'
import api from '../lib/api'
import { formatCurrency, timeAgo, statusColor, channelIcon } from '../lib/utils'
import toast from 'react-hot-toast'

const CHANNEL_OPTS = [
  { value: 'Email', label: 'Email', icon: Mail, color: '#2563eb' },
  { value: 'SMS', label: 'SMS', icon: MessageSquare, color: '#059669' },
  { value: 'WhatsApp', label: 'WhatsApp', icon: Smartphone, color: '#10b981' },
  { value: 'Push', label: 'Push', icon: Bell, color: '#d97706' },
  { value: 'Multi-Channel', label: 'Multi-Channel', icon: Radio, color: '#7c3aed' },
]

export default function Campaigns() {
  const navigate = useNavigate()
  const [params] = useSearchParams()
  const qc = useQueryClient()
  const [showCreate, setShowCreate] = useState(false)
  const [goal, setGoal] = useState('')
  const [aiResult, setAiResult] = useState<any>(null)
  const [step, setStep] = useState<'goal' | 'review' | 'done'>('goal')
  const [form, setForm] = useState({
    name: '', channel: 'Email', message: '', subject: '',
    segmentId: params.get('segmentId') || '',
  })

  const { data: campaigns, isLoading } = useQuery({
    queryKey: ['campaigns'],
    queryFn: () => api.get('/campaigns').then(r => r.data.data),
    refetchInterval: 15000,
  })

  const { data: segments } = useQuery({
    queryKey: ['segments'],
    queryFn: () => api.get('/segments').then(r => r.data.data),
  })

  const aiGenMutation = useMutation({
    mutationFn: (goal: string) => api.post('/campaigns/ai-generate', {
      goal, segmentId: form.segmentId || undefined,
    }).then(r => r.data.data),
    onSuccess: (data) => {
      setAiResult(data)
      setForm(f => ({
        ...f,
        name: data.name,
        channel: data.channel || f.channel,
        message: data.message,
        subject: data.subject || '',
      }))
      setStep('review')
    },
    onError: () => toast.error('AI generation failed'),
  })

  const createMutation = useMutation({
    mutationFn: () => api.post('/campaigns', {
      ...form,
      goal,
      isAiGenerated: !!aiResult,
      aiMetadata: aiResult,
    }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['campaigns'] })
      setShowCreate(false)
      setStep('goal')
      setAiResult(null)
      toast.success('Campaign created! 🎉')
    },
  })

  const launchMutation = useMutation({
    mutationFn: (id: string) => api.post(`/campaigns/${id}/launch`),
    onSuccess: (_res, _id) => {
      qc.invalidateQueries({ queryKey: ['campaigns'] })
      toast.success('Campaign launched! 🚀 Delivery simulation started.')
    },
    onError: (err: any) => toast.error(err.response?.data?.message || 'Launch failed'),
  })

  return (
    <div className="p-6 space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold" style={{ color: 'rgba(255,255,255,0.95)' }}>Campaigns</h1>
          <p className="text-sm mt-1" style={{ color: 'rgba(255,255,255,0.4)' }}>AI-powered campaign generation and launch</p>
        </div>
        <button onClick={() => setShowCreate(true)} className="btn-gradient flex items-center gap-2 px-4 py-2 rounded-xl text-sm">
          <Plus size={15} /> Create Campaign
        </button>
      </div>

      {/* Campaign Cards */}
      {isLoading ? (
        <div className="space-y-3">
          {Array(4).fill(0).map((_, i) => <div key={i} className="shimmer h-24 rounded-2xl" />)}
        </div>
      ) : (
        <div className="space-y-3">
          {(campaigns || []).map((c: any) => (
            <motion.div key={c._id} initial={{ opacity: 0 }} animate={{ opacity: 1 }}
              className="glass p-4 rounded-2xl flex items-center gap-4" style={{ border: '1px solid rgba(255,255,255,0.06)' }}>
              <div className="text-2xl w-10 text-center flex-shrink-0">{channelIcon(c.channel)}</div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-semibold text-sm" style={{ color: 'rgba(255,255,255,0.9)' }}>{c.name}</span>
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${statusColor(c.status)}`}>{c.status}</span>
                  {c.isAiGenerated && <span className="text-xs flex items-center gap-1" style={{ color: '#a78bfa' }}><Sparkles size={10} /> AI</span>}
                </div>
                <div className="text-xs mt-1" style={{ color: 'rgba(255,255,255,0.4)' }}>
                  {c.channel} · {c.audienceSize} recipients · {timeAgo(c.createdAt)}
                  {c.segmentName && ` · ${c.segmentName}`}
                </div>
                <div className="flex items-center gap-4 mt-2">
                  {[
                    { label: 'Sent', val: c.stats?.sent || 0 },
                    { label: 'Delivered', val: c.stats?.delivered || 0, color: '#10b981' },
                    { label: 'Opened', val: c.stats?.opened || 0, color: '#3b82f6' },
                    { label: 'Clicked', val: c.stats?.clicked || 0, color: '#8b5cf6' },
                    { label: 'Revenue', val: formatCurrency(c.stats?.revenue || 0), color: '#10b981' },
                  ].map(({ label, val, color }) => (
                    <div key={label} className="text-center">
                      <div className="text-xs font-semibold" style={{ color: color || 'rgba(255,255,255,0.7)' }}>{val}</div>
                      <div className="text-[10px]" style={{ color: 'rgba(255,255,255,0.3)' }}>{label}</div>
                    </div>
                  ))}
                </div>
              </div>
              <div className="flex items-center gap-2 flex-shrink-0">
                <button onClick={() => navigate(`/campaigns/${c._id}`)}
                  className="p-2 rounded-xl hover:bg-white/10 transition-colors" style={{ color: '#a78bfa' }}>
                  <BarChart3 size={15} />
                </button>
                {c.status === 'draft' && (
                  <button onClick={() => launchMutation.mutate(c._id)}
                    disabled={launchMutation.isPending || !c.segmentId}
                    className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold btn-gradient disabled:opacity-50">
                    {launchMutation.isPending ? <Loader2 size={13} className="animate-spin" /> : <Rocket size={13} />}
                    Launch
                  </button>
                )}
              </div>
            </motion.div>
          ))}

          {(!campaigns || campaigns.length === 0) && (
            <div className="py-16 text-center" style={{ color: 'rgba(255,255,255,0.3)' }}>
              <Send size={40} className="mx-auto mb-3 opacity-30" />
              <p className="mb-4">No campaigns yet</p>
              <button onClick={() => setShowCreate(true)} className="btn-gradient px-5 py-2 rounded-xl text-sm">
                Create First Campaign
              </button>
            </div>
          )}
        </div>
      )}

      {/* Create Modal */}
      <AnimatePresence>
        {showCreate && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 flex items-center justify-center z-50 p-4" style={{ background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(10px)' }}>
            <motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }} exit={{ scale: 0.9 }}
              className="glass rounded-2xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto"
              style={{ border: '1px solid rgba(124,58,237,0.3)' }}>
              <div className="flex items-center justify-between mb-5">
                <h2 className="text-lg font-bold" style={{ color: 'rgba(255,255,255,0.95)' }}>
                  {step === 'goal' ? '🎯 AI Campaign Generator' : '✏️ Review & Launch'}
                </h2>
                <button onClick={() => { setShowCreate(false); setStep('goal'); setAiResult(null) }}
                  className="p-2 rounded-lg hover:bg-white/10" style={{ color: 'rgba(255,255,255,0.5)' }}>
                  <X size={16} />
                </button>
              </div>

              {step === 'goal' && (
                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-medium mb-2" style={{ color: 'rgba(255,255,255,0.6)' }}>Campaign Goal</label>
                    <textarea value={goal} onChange={e => setGoal(e.target.value)}
                      placeholder='e.g., "Bring back inactive premium customers with an exclusive offer"'
                      className="w-full rounded-xl py-3 px-4 text-sm resize-none" rows={3} />
                  </div>

                  <div>
                    <label className="block text-xs font-medium mb-2" style={{ color: 'rgba(255,255,255,0.6)' }}>Target Segment (optional)</label>
                    <select value={form.segmentId} onChange={e => setForm(f => ({ ...f, segmentId: e.target.value }))}
                      className="w-full rounded-xl py-3 px-4 text-sm">
                      <option value="">Auto-select audience</option>
                      {(segments || []).map((s: any) => (
                        <option key={s._id} value={s._id}>{s.name} ({s.customerCount} customers)</option>
                      ))}
                    </select>
                  </div>

                  <button onClick={() => aiGenMutation.mutate(goal)} disabled={!goal.trim() || aiGenMutation.isPending}
                    className="btn-gradient w-full py-3 rounded-xl font-semibold text-sm flex items-center justify-center gap-2">
                    {aiGenMutation.isPending ? <Loader2 size={16} className="animate-spin" /> : <Sparkles size={16} />}
                    {aiGenMutation.isPending ? 'Gemini is crafting your campaign...' : 'Generate Campaign with AI'}
                  </button>
                </div>
              )}

              {step === 'review' && aiResult && (
                <div className="space-y-4">
                  {/* AI Recommendations */}
                  <div className="p-4 rounded-xl space-y-2" style={{ background: 'rgba(124,58,237,0.1)', border: '1px solid rgba(124,58,237,0.2)' }}>
                    <div className="flex items-center gap-2 text-sm font-semibold" style={{ color: '#a78bfa' }}>
                      <Sparkles size={14} /> AI Recommendations
                    </div>
                    <div className="text-xs" style={{ color: 'rgba(255,255,255,0.6)' }}>
                      <span className="font-medium" style={{ color: 'rgba(255,255,255,0.8)' }}>Audience:</span> {aiResult.audienceRecommendation}
                    </div>
                    <div className="text-xs" style={{ color: 'rgba(255,255,255,0.6)' }}>
                      <span className="font-medium" style={{ color: 'rgba(255,255,255,0.8)' }}>Expected:</span> {aiResult.expectedOutcome}
                    </div>
                    {(aiResult.tips || []).map((tip: string, i: number) => (
                      <div key={i} className="text-xs flex items-start gap-2" style={{ color: 'rgba(255,255,255,0.5)' }}>
                        <span>💡</span> {tip}
                      </div>
                    ))}
                  </div>

                  <div>
                    <label className="block text-xs font-medium mb-2" style={{ color: 'rgba(255,255,255,0.6)' }}>Campaign Name</label>
                    <input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                      className="w-full rounded-xl py-3 px-4 text-sm" />
                  </div>

                  <div>
                    <label className="block text-xs font-medium mb-2" style={{ color: 'rgba(255,255,255,0.6)' }}>Channel</label>
                    <div className="grid grid-cols-5 gap-2">
                      {CHANNEL_OPTS.map(({ value, label, icon: Icon, color }) => (
                        <button key={value} onClick={() => setForm(f => ({ ...f, channel: value }))}
                          className="p-2 rounded-xl text-center transition-all"
                          style={{
                            background: form.channel === value ? `${color}20` : 'rgba(255,255,255,0.03)',
                            border: `1px solid ${form.channel === value ? color : 'rgba(255,255,255,0.08)'}`,
                            color: form.channel === value ? color : 'rgba(255,255,255,0.4)',
                          }}>
                          <Icon size={16} className="mx-auto mb-1" />
                          <div className="text-[10px]">{label}</div>
                        </button>
                      ))}
                    </div>
                  </div>

                  {form.channel === 'Email' && (
                    <div>
                      <label className="block text-xs font-medium mb-2" style={{ color: 'rgba(255,255,255,0.6)' }}>Subject Line</label>
                      <input value={form.subject} onChange={e => setForm(f => ({ ...f, subject: e.target.value }))}
                        className="w-full rounded-xl py-3 px-4 text-sm" />
                    </div>
                  )}

                  <div>
                    <label className="block text-xs font-medium mb-2" style={{ color: 'rgba(255,255,255,0.6)' }}>Message</label>
                    <textarea value={form.message} onChange={e => setForm(f => ({ ...f, message: e.target.value }))}
                      className="w-full rounded-xl py-3 px-4 text-sm resize-none" rows={6} />
                  </div>

                  <div className="flex gap-3">
                    <button onClick={() => setStep('goal')} className="flex-1 py-3 rounded-xl text-sm border transition-colors hover:bg-white/5"
                      style={{ borderColor: 'rgba(255,255,255,0.15)', color: 'rgba(255,255,255,0.6)' }}>
                      ← Back
                    </button>
                    <button onClick={() => createMutation.mutate()} disabled={createMutation.isPending || !form.name}
                      className="flex-1 btn-gradient py-3 rounded-xl font-semibold text-sm flex items-center justify-center gap-2">
                      {createMutation.isPending ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}
                      Save Campaign
                    </button>
                  </div>
                </div>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
