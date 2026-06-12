import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { motion, AnimatePresence } from 'framer-motion'
import {
  GitBranch, Play, Plus, Trash2, Save, Zap, Users, Tag,
  Star, Bell, X, Clock, ShoppingCart,
  UserPlus, TrendingUp, Send, MousePointer, ToggleLeft, ToggleRight
} from 'lucide-react'
import api from '../lib/api'
import toast from 'react-hot-toast'

const TRIGGERS = [
  { id: 'customer_created', label: 'Customer Created', icon: UserPlus, color: '#10b981' },
  { id: 'order_placed', label: 'Order Placed', icon: ShoppingCart, color: '#3b82f6' },
  { id: 'high_spender', label: 'High Spender', icon: TrendingUp, color: '#f59e0b' },
  { id: 'campaign_clicked', label: 'Campaign Clicked', icon: MousePointer, color: '#7c3aed' },
  { id: 'customer_inactive', label: 'Customer Inactive', icon: Clock, color: '#ef4444' },
]

const ACTIONS = [
  { id: 'send_campaign', label: 'Send Campaign', icon: Send, color: '#7c3aed', note: 'via WhatsApp / Email' },
  { id: 'add_tag', label: 'Add Tag', icon: Tag, color: '#3b82f6', note: 'e.g. vip, at-risk' },
  { id: 'add_loyalty_points', label: 'Add Loyalty Points', icon: Star, color: '#f59e0b', note: '100-500 points' },
  { id: 'notify_team', label: 'Notify Team', icon: Bell, color: '#10b981', note: 'Slack / Email alert' },
  { id: 'add_to_segment', label: 'Add to Segment', icon: Users, color: '#06b6d4', note: 'Existing segment' },
]

interface WorkflowForm { name: string; description: string; trigger: string; actions: string[] }

export default function WorkflowBuilder() {
  const qc = useQueryClient()
  const [selected, setSelected] = useState<any>(null)
  const [isNew, setIsNew] = useState(false)
  const [showActionMenu, setShowActionMenu] = useState(false)
  const [form, setForm] = useState<WorkflowForm>({ name: '', description: '', trigger: '', actions: [] })

  const { data: workflows = [], isLoading } = useQuery({
    queryKey: ['workflows'],
    queryFn: () => api.get('/workflows').then(r => r.data.data),
  })

  const createMutation = useMutation({
    mutationFn: (data: any) => api.post('/workflows', data),
    onSuccess: (res) => {
      qc.invalidateQueries({ queryKey: ['workflows'] })
      toast.success('Workflow created!')
      setSelected(res.data.data)
      setIsNew(false)
    },
    onError: () => toast.error('Failed to create workflow'),
  })

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) => api.put(`/workflows/${id}`, data),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['workflows'] }); toast.success('Workflow updated!') },
    onError: () => toast.error('Update failed'),
  })

  const deleteMutation = useMutation({
    mutationFn: (id: string) => api.delete(`/workflows/${id}`),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['workflows'] }); setSelected(null); toast.success('Workflow deleted') },
    onError: () => toast.error('Delete failed'),
  })

  const executeMutation = useMutation({
    mutationFn: (id: string) => api.post(`/workflows/${id}/execute`).then(r => r.data),
    onSuccess: (data) => { qc.invalidateQueries({ queryKey: ['workflows'] }); toast.success(data.message || 'Workflow executed!') },
    onError: () => toast.error('Execution failed'),
  })

  const toggleActiveMutation = useMutation({
    mutationFn: ({ id, isActive }: { id: string; isActive: boolean }) => api.put(`/workflows/${id}`, { isActive }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['workflows'] }),
  })

  const startNew = () => {
    setIsNew(true)
    setSelected(null)
    setForm({ name: '', description: '', trigger: '', actions: [] })
  }

  const editWorkflow = (wf: any) => {
    setSelected(wf)
    setIsNew(false)
    setForm({ name: wf.name, description: wf.description || '', trigger: wf.trigger, actions: (wf.actions || []).map((a: any) => a.type) })
  }

  const saveWorkflow = () => {
    if (!form.name || !form.trigger) { toast.error('Name and trigger are required'); return }
    const payload = { name: form.name, description: form.description, trigger: form.trigger, actions: form.actions.map((a, i) => ({ type: a, config: {}, order: i + 1 })) }
    if (isNew) { createMutation.mutate(payload) }
    else if (selected) { updateMutation.mutate({ id: selected._id, data: payload }) }
  }

  const getTrigger = (id: string) => TRIGGERS.find(t => t.id === id)
  const getAction = (id: string) => ACTIONS.find(a => a.id === id)

  return (
    <div style={{ display: 'flex', height: '100%', background: 'hsl(222,47%,4%)' }}>

      {/* Left Panel — Workflow List */}
      <div style={{ width: 320, flexShrink: 0, borderRight: '1px solid rgba(255,255,255,0.06)', display: 'flex', flexDirection: 'column', background: 'rgba(10,8,20,0.5)' }}>
        <div style={{ padding: '20px 20px 12px', borderBottom: '1px solid rgba(255,255,255,0.06)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <GitBranch size={18} color="#7c3aed" />
            <span style={{ fontWeight: 700, fontSize: 15, color: 'rgba(255,255,255,0.9)' }}>Workflows</span>
            <span style={{ fontSize: 11, padding: '2px 7px', borderRadius: 999, background: 'rgba(124,58,237,0.15)', color: '#a78bfa' }}>{workflows.length}</span>
          </div>
          <button onClick={startNew} style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '7px 12px', borderRadius: 8, fontSize: 12, fontWeight: 700, background: 'linear-gradient(135deg,#7c3aed,#c026d3)', border: 'none', color: 'white', cursor: 'pointer' }}>
            <Plus size={13} /> New
          </button>
        </div>
        <div style={{ flex: 1, overflowY: 'auto', padding: 12 }}>
          {isLoading ? <div style={{ padding: 20, textAlign: 'center', color: 'rgba(255,255,255,0.3)', fontSize: 13 }}>Loading...</div> : (
            workflows.map((wf: any) => {
              const trigger = getTrigger(wf.trigger)
              const TIcon = trigger?.icon || GitBranch
              const isSelected = selected?._id === wf._id
              return (
                <div key={wf._id} onClick={() => editWorkflow(wf)}
                  style={{ padding: '14px 14px', borderRadius: 12, marginBottom: 8, cursor: 'pointer', background: isSelected ? 'rgba(124,58,237,0.1)' : 'rgba(255,255,255,0.03)', border: `1px solid ${isSelected ? 'rgba(124,58,237,0.35)' : 'rgba(255,255,255,0.06)'}`, transition: 'all 0.2s' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <TIcon size={14} style={{ color: trigger?.color || '#7c3aed' }} />
                      <span style={{ fontSize: 13, fontWeight: 700, color: 'rgba(255,255,255,0.9)' }}>{wf.name}</span>
                    </div>
                    <button onClick={e => { e.stopPropagation(); toggleActiveMutation.mutate({ id: wf._id, isActive: !wf.isActive }) }}
                      style={{ background: 'none', border: 'none', cursor: 'pointer', color: wf.isActive ? '#10b981' : 'rgba(255,255,255,0.25)' }}>
                      {wf.isActive ? <ToggleRight size={18} /> : <ToggleLeft size={18} />}
                    </button>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                    <span style={{ fontSize: 10, padding: '2px 7px', borderRadius: 5, background: `${trigger?.color || '#7c3aed'}15`, color: trigger?.color || '#a78bfa' }}>{trigger?.label || wf.trigger}</span>
                    <span style={{ fontSize: 10, color: 'rgba(255,255,255,0.3)' }}>{(wf.actions || []).length} actions</span>
                    <span style={{ fontSize: 10, color: 'rgba(255,255,255,0.3)' }}>·</span>
                    <span style={{ fontSize: 10, color: 'rgba(255,255,255,0.3)' }}>{wf.executionCount || 0} runs</span>
                  </div>
                </div>
              )
            })
          )}
          {!isLoading && workflows.length === 0 && (
            <div style={{ textAlign: 'center', padding: '40px 20px', color: 'rgba(255,255,255,0.3)' }}>
              <GitBranch size={28} style={{ margin: '0 auto 8px', display: 'block', opacity: 0.4 }} />
              <p style={{ fontSize: 13 }}>No workflows yet</p>
              <p style={{ fontSize: 12, marginTop: 4 }}>Click "+ New" to create one</p>
            </div>
          )}
        </div>
      </div>

      {/* Right Panel — Editor */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflowY: 'auto', padding: 32, minWidth: 0 }}>
        {!selected && !isNew ? (
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: 'rgba(255,255,255,0.25)' }}>
            <GitBranch size={52} style={{ marginBottom: 16, opacity: 0.3 }} />
            <p style={{ fontSize: 16, fontWeight: 600, marginBottom: 8 }}>Select a workflow to edit</p>
            <p style={{ fontSize: 13 }}>or click "+ New" to create one</p>
            <button onClick={startNew} style={{ marginTop: 24, display: 'flex', alignItems: 'center', gap: 8, padding: '10px 24px', borderRadius: 10, fontSize: 14, fontWeight: 700, background: 'linear-gradient(135deg,#7c3aed,#c026d3)', border: 'none', color: 'white', cursor: 'pointer' }}>
              <Plus size={16} /> Create First Workflow
            </button>
          </div>
        ) : (
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
              <h2 style={{ fontSize: 20, fontWeight: 800, color: 'rgba(255,255,255,0.9)', margin: 0 }}>{isNew ? 'New Workflow' : 'Edit Workflow'}</h2>
              <div style={{ display: 'flex', gap: 10 }}>
                {selected && !isNew && (
                  <>
                    <button onClick={() => executeMutation.mutate(selected._id)} disabled={executeMutation.isPending}
                      style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '8px 16px', borderRadius: 9, fontSize: 12, fontWeight: 700, background: 'rgba(16,185,129,0.15)', border: '1px solid rgba(16,185,129,0.25)', color: '#10b981', cursor: 'pointer' }}>
                      <Play size={12} /> Execute Now
                    </button>
                    <button onClick={() => { if (confirm('Delete this workflow?')) deleteMutation.mutate(selected._id) }}
                      style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '8px 16px', borderRadius: 9, fontSize: 12, fontWeight: 700, background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.15)', color: '#f87171', cursor: 'pointer' }}>
                      <Trash2 size={12} /> Delete
                    </button>
                  </>
                )}
                <button onClick={saveWorkflow} disabled={createMutation.isPending || updateMutation.isPending}
                  style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '8px 20px', borderRadius: 9, fontSize: 12, fontWeight: 700, background: 'linear-gradient(135deg,#7c3aed,#c026d3)', border: 'none', color: 'white', cursor: 'pointer' }}>
                  <Save size={12} /> Save Workflow
                </button>
              </div>
            </div>

            {/* Form fields */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 28 }}>
              <div>
                <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: 'rgba(255,255,255,0.45)', marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Workflow Name *</label>
                <input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder="e.g. New Customer Welcome Flow"
                  style={{ width: '100%', padding: '11px 14px', borderRadius: 10, background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.12)', color: 'rgba(255,255,255,0.9)', fontSize: 14, outline: 'none', boxSizing: 'border-box' }} />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: 'rgba(255,255,255,0.45)', marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Description</label>
                <input value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} placeholder="What does this workflow do?"
                  style={{ width: '100%', padding: '11px 14px', borderRadius: 10, background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.12)', color: 'rgba(255,255,255,0.9)', fontSize: 14, outline: 'none', boxSizing: 'border-box' }} />
              </div>
            </div>

            {/* Trigger selector */}
            <div style={{ marginBottom: 28 }}>
              <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: 'rgba(255,255,255,0.45)', marginBottom: 12, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Trigger Event *</label>
              <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                {TRIGGERS.map(t => {
                  const TIcon = t.icon
                  const isActive = form.trigger === t.id
                  return (
                    <button key={t.id} onClick={() => setForm(f => ({ ...f, trigger: t.id }))}
                      style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 16px', borderRadius: 10, fontSize: 13, fontWeight: 600, cursor: 'pointer', border: `1px solid ${isActive ? t.color : 'rgba(255,255,255,0.1)'}`, background: isActive ? `${t.color}20` : 'rgba(255,255,255,0.03)', color: isActive ? t.color : 'rgba(255,255,255,0.55)', transition: 'all 0.2s' }}>
                      <TIcon size={14} /> {t.label}
                    </button>
                  )
                })}
              </div>
            </div>

            {/* Visual flow canvas */}
            {form.trigger && (
              <div style={{ marginBottom: 28 }}>
                <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: 'rgba(255,255,255,0.45)', marginBottom: 16, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Workflow Flow</label>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: 0 }}>
                  {/* Trigger node */}
                  {(() => { const t = getTrigger(form.trigger); const TIcon = t?.icon || Zap; return (
                    <div style={{ padding: '14px 20px', borderRadius: 12, border: `2px solid ${t?.color || '#7c3aed'}`, background: `${t?.color || '#7c3aed'}12`, display: 'flex', alignItems: 'center', gap: 10 }}>
                      <TIcon size={18} style={{ color: t?.color || '#7c3aed' }} />
                      <div>
                        <div style={{ fontSize: 10, fontWeight: 700, color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase' }}>Trigger</div>
                        <div style={{ fontSize: 14, fontWeight: 700, color: t?.color || '#a78bfa' }}>{t?.label}</div>
                      </div>
                    </div>
                  )})()}

                  {/* Action nodes */}
                  {form.actions.map((actionId, i) => {
                    const act = getAction(actionId)
                    const AIcon = act?.icon || Zap
                    return (
                      <div key={i} style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
                        <div style={{ marginLeft: 28, color: 'rgba(255,255,255,0.2)', fontSize: 20 }}>↓</div>
                        <div style={{ padding: '12px 16px', borderRadius: 12, border: `1px solid ${act?.color || '#7c3aed'}30`, background: `${act?.color || '#7c3aed'}08`, display: 'flex', alignItems: 'center', gap: 10 }}>
                          <AIcon size={15} style={{ color: act?.color || '#a78bfa' }} />
                          <div>
                            <div style={{ fontSize: 13, fontWeight: 700, color: 'rgba(255,255,255,0.85)' }}>{act?.label}</div>
                            <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.35)' }}>{act?.note}</div>
                          </div>
                          <button onClick={() => setForm(f => ({ ...f, actions: f.actions.filter((_, j) => j !== i) }))}
                            style={{ marginLeft: 8, background: 'none', border: 'none', cursor: 'pointer', color: 'rgba(255,255,255,0.25)' }}>
                            <X size={13} />
                          </button>
                        </div>
                      </div>
                    )
                  })}

                  {/* Add action */}
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
                    <div style={{ marginLeft: 28, color: 'rgba(255,255,255,0.15)', fontSize: 20 }}>↓</div>
                    <div style={{ position: 'relative' }}>
                      <button onClick={() => setShowActionMenu(!showActionMenu)}
                        style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 16px', borderRadius: 10, fontSize: 13, fontWeight: 600, background: 'rgba(255,255,255,0.04)', border: '1px dashed rgba(255,255,255,0.2)', color: 'rgba(255,255,255,0.5)', cursor: 'pointer' }}>
                        <Plus size={14} /> Add Action
                      </button>
                      <AnimatePresence>
                        {showActionMenu && (
                          <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}
                            style={{ position: 'absolute', top: '100%', left: 0, marginTop: 8, padding: 8, borderRadius: 12, background: 'hsl(222,47%,8%)', border: '1px solid rgba(255,255,255,0.1)', zIndex: 50, minWidth: 220 }}>
                            {ACTIONS.map(act => {
                              const AIcon = act.icon
                              return (
                                <button key={act.id} onClick={() => { setForm(f => ({ ...f, actions: [...f.actions, act.id] })); setShowActionMenu(false) }}
                                  style={{ display: 'flex', alignItems: 'center', gap: 10, width: '100%', padding: '10px 14px', borderRadius: 8, background: 'none', border: 'none', cursor: 'pointer', color: 'rgba(255,255,255,0.7)', fontSize: 13, textAlign: 'left' }}
                                  onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = 'rgba(124,58,237,0.1)' }}
                                  onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'none' }}>
                                  <AIcon size={14} style={{ color: act.color }} /> {act.label}
                                </button>
                              )
                            })}
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Execution log (simulated) */}
            {selected && !isNew && (
              <div style={{ padding: 20, borderRadius: 14, background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)' }}>
                <div style={{ fontSize: 12, fontWeight: 700, color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 12 }}>
                  Execution History · {selected.executionCount || 0} total runs
                </div>
                {[
                  { time: '2 hours ago', customers: 12, status: 'success' },
                  { time: '1 day ago', customers: 8, status: 'success' },
                  { time: '3 days ago', customers: 21, status: 'success' },
                ].map((log, i) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 12px', borderRadius: 8, marginBottom: 6, background: 'rgba(255,255,255,0.02)' }}>
                    <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.4)' }}>{log.time}</span>
                    <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.6)' }}>{log.customers} customers triggered</span>
                    <span style={{ fontSize: 11, padding: '2px 8px', borderRadius: 4, background: 'rgba(16,185,129,0.15)', color: '#10b981' }}>✓ Success</span>
                  </div>
                ))}
              </div>
            )}
          </motion.div>
        )}
      </div>
    </div>
  )
}
