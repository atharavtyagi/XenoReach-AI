import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Sparkles, Plus, Trash2, Users, Send,
  Loader2, X, Eye,
} from 'lucide-react'
import api from '../lib/api'
import { formatCurrency, formatNumber } from '../lib/utils'
import toast from 'react-hot-toast'
import { useNavigate } from 'react-router-dom'

const SEGMENT_EXAMPLES = [
  'Customers who spent more than ₹5000 and have not ordered in 90 days',
  'High-value customers in Mumbai who purchased 5+ times',
  'New customers who joined in the last 30 days',
  'Female customers aged 25-40 with premium tag',
  'Customers who ordered more than 3 times but not in last 60 days',
]

export default function Segments() {
  const navigate = useNavigate()
  const qc = useQueryClient()
  const [query, setQuery] = useState('')
  const [showBuilder, setShowBuilder] = useState(false)
  const [preview, setPreview] = useState<any>(null)
  const [segName, setSegName] = useState('')

  const { data: segments, isLoading } = useQuery({
    queryKey: ['segments'],
    queryFn: () => api.get('/segments').then(r => r.data.data),
  })

  const generateMutation = useMutation({
    mutationFn: (q: string) => api.post('/segments/ai-generate', { query: q }).then(r => r.data.data),
    onSuccess: (data) => {
      setPreview(data)
      setSegName(data.suggestedName || '')
      toast.success(`Preview: ${data.preview.count} customers matched!`)
    },
    onError: () => toast.error('AI generation failed'),
  })

  const saveMutation = useMutation({
    mutationFn: () => api.post('/segments', {
      name: segName || preview.suggestedName,
      description: preview.description,
      filters: preview.filters,
      naturalLanguageQuery: query,
      isAiGenerated: true,
      suggestions: preview.suggestions,
    }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['segments'] })
      setShowBuilder(false)
      setPreview(null)
      setQuery('')
      toast.success('Segment saved! 🎯')
    },
    onError: () => toast.error('Failed to save segment'),
  })

  const deleteMutation = useMutation({
    mutationFn: (id: string) => api.delete(`/segments/${id}`),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['segments'] })
      toast.success('Segment deleted')
    },
  })

  const COLORS = ['#7c3aed', '#c026d3', '#2563eb', '#059669', '#d97706', '#dc2626']

  return (
    <div className="p-6 space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold" style={{ color: 'rgba(255,255,255,0.95)' }}>AI Segment Builder</h1>
          <p className="text-sm mt-1" style={{ color: 'rgba(255,255,255,0.4)' }}>
            Describe your audience in plain English — Gemini AI builds the segment
          </p>
        </div>
        <button onClick={() => setShowBuilder(true)} className="btn-gradient flex items-center gap-2 px-4 py-2 rounded-xl text-sm">
          <Plus size={15} /> New Segment
        </button>
      </div>

      {/* Existing segments */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array(3).fill(0).map((_, i) => <div key={i} className="shimmer h-40 rounded-2xl" />)}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {(segments || []).map((seg: any, i: number) => (
            <motion.div key={seg._id} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
              className="glass p-5 rounded-2xl group" style={{ border: `1px solid ${seg.color || COLORS[i % COLORS.length]}25` }}>
              <div className="flex items-start justify-between mb-4">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center"
                  style={{ background: `${seg.color || COLORS[i % COLORS.length]}20`, border: `1px solid ${seg.color || COLORS[i % COLORS.length]}30` }}>
                  <Users size={18} style={{ color: seg.color || COLORS[i % COLORS.length] }} />
                </div>
                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button onClick={() => navigate(`/campaigns?segmentId=${seg._id}`)}
                    className="p-1.5 rounded-lg hover:bg-white/10 transition-colors" style={{ color: '#a78bfa' }}>
                    <Send size={13} />
                  </button>
                  <button onClick={() => deleteMutation.mutate(seg._id)}
                    className="p-1.5 rounded-lg hover:bg-red-500/10 transition-colors" style={{ color: 'rgba(255,255,255,0.3)' }}>
                    <Trash2 size={13} />
                  </button>
                </div>
              </div>

              <h3 className="font-semibold text-sm mb-1" style={{ color: 'rgba(255,255,255,0.9)' }}>{seg.name}</h3>
              <p className="text-xs mb-4 line-clamp-2" style={{ color: 'rgba(255,255,255,0.45)' }}>{seg.description}</p>

              <div className="grid grid-cols-2 gap-3">
                <div className="p-2.5 rounded-xl" style={{ background: 'rgba(255,255,255,0.03)' }}>
                  <div className="text-xs" style={{ color: 'rgba(255,255,255,0.4)' }}>Customers</div>
                  <div className="text-base font-bold" style={{ color: 'rgba(255,255,255,0.9)' }}>{formatNumber(seg.customerCount)}</div>
                </div>
                <div className="p-2.5 rounded-xl" style={{ background: 'rgba(255,255,255,0.03)' }}>
                  <div className="text-xs" style={{ color: 'rgba(255,255,255,0.4)' }}>Revenue</div>
                  <div className="text-base font-bold" style={{ color: '#10b981' }}>{formatCurrency(seg.estimatedRevenue)}</div>
                </div>
              </div>

              {seg.isAiGenerated && (
                <div className="flex items-center gap-1.5 mt-3 text-xs" style={{ color: '#a78bfa' }}>
                  <Sparkles size={11} /> AI Generated
                </div>
              )}
            </motion.div>
          ))}

          {/* Empty state */}
          {(!segments || segments.length === 0) && (
            <div className="col-span-3 py-16 text-center" style={{ color: 'rgba(255,255,255,0.3)' }}>
              <Users size={40} className="mx-auto mb-3 opacity-30" />
              <p className="mb-4">No segments yet — create your first AI segment!</p>
              <button onClick={() => setShowBuilder(true)} className="btn-gradient px-5 py-2 rounded-xl text-sm">
                Build First Segment
              </button>
            </div>
          )}
        </div>
      )}

      {/* AI Builder Modal */}
      <AnimatePresence>
        {showBuilder && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 flex items-center justify-center z-50 p-4" style={{ background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(10px)' }}>
            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }}
              className="glass rounded-2xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto"
              style={{ border: '1px solid rgba(124,58,237,0.3)' }}>
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center"
                    style={{ background: 'linear-gradient(135deg, rgba(124,58,237,0.3), rgba(192,38,211,0.3))', border: '1px solid rgba(124,58,237,0.4)' }}>
                    <Sparkles size={18} style={{ color: '#a78bfa' }} />
                  </div>
                  <div>
                    <h2 className="text-lg font-bold" style={{ color: 'rgba(255,255,255,0.95)' }}>AI Segment Builder</h2>
                    <p className="text-xs" style={{ color: 'rgba(255,255,255,0.4)' }}>Powered by Google Gemini</p>
                  </div>
                </div>
                <button onClick={() => { setShowBuilder(false); setPreview(null) }}
                  className="p-2 rounded-lg hover:bg-white/10" style={{ color: 'rgba(255,255,255,0.5)' }}>
                  <X size={16} />
                </button>
              </div>

              {/* Query input */}
              <div className="mb-4">
                <label className="block text-xs font-medium mb-2" style={{ color: 'rgba(255,255,255,0.6)' }}>
                  Describe your audience in plain English
                </label>
                <textarea
                  value={query}
                  onChange={e => setQuery(e.target.value)}
                  placeholder="e.g., 'Show customers who spent more than ₹5000 and haven't ordered in 90 days'"
                  className="w-full rounded-xl py-3 px-4 text-sm resize-none"
                  rows={3}
                />
              </div>

              {/* Examples */}
              <div className="mb-5">
                <div className="text-xs mb-2" style={{ color: 'rgba(255,255,255,0.4)' }}>Quick examples:</div>
                <div className="flex flex-wrap gap-2">
                  {SEGMENT_EXAMPLES.slice(0, 3).map(ex => (
                    <button key={ex} onClick={() => setQuery(ex)}
                      className="text-xs px-3 py-1.5 rounded-full transition-all hover:border-purple-500/50"
                      style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.6)' }}>
                      {ex.slice(0, 45)}...
                    </button>
                  ))}
                </div>
              </div>

              <button
                onClick={() => generateMutation.mutate(query)}
                disabled={!query.trim() || generateMutation.isPending}
                className="btn-gradient w-full py-3 rounded-xl font-semibold text-sm flex items-center justify-center gap-2 mb-5"
              >
                {generateMutation.isPending ? <Loader2 size={16} className="animate-spin" /> : <Sparkles size={16} />}
                {generateMutation.isPending ? 'AI is building your segment...' : 'Generate Segment with AI'}
              </button>

              {/* Preview */}
              {preview && (
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                  className="space-y-4">
                  <div className="p-4 rounded-xl" style={{ background: 'rgba(124,58,237,0.1)', border: '1px solid rgba(124,58,237,0.25)' }}>
                    <div className="flex items-center gap-2 mb-3">
                      <Eye size={14} style={{ color: '#a78bfa' }} />
                      <span className="text-sm font-semibold" style={{ color: '#a78bfa' }}>Segment Preview</span>
                    </div>
                    <div className="grid grid-cols-3 gap-3 mb-3">
                      <div className="text-center p-2 rounded-lg" style={{ background: 'rgba(255,255,255,0.05)' }}>
                        <div className="text-xl font-bold" style={{ color: 'rgba(255,255,255,0.9)' }}>{preview.preview.count}</div>
                        <div className="text-xs" style={{ color: 'rgba(255,255,255,0.4)' }}>Customers</div>
                      </div>
                      <div className="text-center p-2 rounded-lg" style={{ background: 'rgba(255,255,255,0.05)' }}>
                        <div className="text-xl font-bold" style={{ color: '#10b981' }}>{formatCurrency(preview.preview.estimatedRevenue)}</div>
                        <div className="text-xs" style={{ color: 'rgba(255,255,255,0.4)' }}>Est. Revenue</div>
                      </div>
                      <div className="text-center p-2 rounded-lg" style={{ background: 'rgba(255,255,255,0.05)' }}>
                        <div className="text-xl font-bold" style={{ color: '#c026d3' }}>{formatCurrency(preview.preview.avgSpend)}</div>
                        <div className="text-xs" style={{ color: 'rgba(255,255,255,0.4)' }}>Avg Spend</div>
                      </div>
                    </div>
                    {preview.suggestions && (
                      <div className="text-xs p-2 rounded-lg" style={{ background: 'rgba(255,255,255,0.05)', color: 'rgba(255,255,255,0.6)' }}>
                        💡 {preview.suggestions}
                      </div>
                    )}
                  </div>

                  <div>
                    <label className="block text-xs font-medium mb-2" style={{ color: 'rgba(255,255,255,0.6)' }}>Segment Name</label>
                    <input value={segName} onChange={e => setSegName(e.target.value)}
                      className="w-full rounded-xl py-3 px-4 text-sm" placeholder="Segment name..." />
                  </div>

                  <button onClick={() => saveMutation.mutate()} disabled={saveMutation.isPending || !segName}
                    className="btn-gradient w-full py-3 rounded-xl font-semibold text-sm flex items-center justify-center gap-2">
                    {saveMutation.isPending ? <Loader2 size={16} className="animate-spin" /> : <Plus size={16} />}
                    {saveMutation.isPending ? 'Saving...' : `Save Segment (${preview.preview.count} customers)`}
                  </button>
                </motion.div>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
