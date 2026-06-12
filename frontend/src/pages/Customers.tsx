import { useState, useCallback, useRef, useEffect } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { motion, AnimatePresence } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { useDropzone } from 'react-dropzone'
import {
  Search, Upload, Plus, ChevronLeft, ChevronRight, Filter,
  Download, Eye, Trash2, Users, TrendingUp, ShoppingBag, MapPin,
  Loader2, X, CheckCircle,
} from 'lucide-react'
import api from '../lib/api'
import { formatCurrency, getInitials, timeAgo } from '../lib/utils'
import toast from 'react-hot-toast'

const CHANNEL_COLORS: Record<string, string> = {
  Email: '#2563eb', SMS: '#059669', WhatsApp: '#10b981', Push: '#d97706',
}

const TAG_COLORS: Record<string, string> = {
  premium: '#7c3aed', vip: '#c026d3', 'at-risk': '#ef4444',
  active: '#10b981', loyal: '#059669', 'never-purchased': '#94a3b8',
}

const CHANNELS = ['All', 'Email', 'SMS', 'WhatsApp', 'Push'] as const

// ── Sample CSV download ────────────────────────────────────────────────────────
function downloadSampleCSV() {
  const csv = [
    'name,email,phone,city,totalSpend,orderCount,lastOrderDate,tags',
    'Preeti Sharma,preeti@example.com,+919876543210,Mumbai,8500,12,2024-01-15,premium',
    'Rajesh Kumar,rajesh@example.com,+919876543211,Delhi,15000,24,2024-02-10,vip',
    'Ananya Patel,ananya@example.com,+919876543212,Bangalore,2500,5,2024-01-20,active',
  ].join('\n')

  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = 'sample_customers.csv'
  link.click()
  URL.revokeObjectURL(url)
}

// ── Add Customer Modal ─────────────────────────────────────────────────────────
interface AddCustomerForm {
  name: string
  email: string
  phone: string
  city: string
  preferredChannel: string
}

const EMPTY_FORM: AddCustomerForm = {
  name: '', email: '', phone: '', city: '', preferredChannel: 'Email',
}

function AddCustomerModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const qc = useQueryClient()
  const [form, setForm] = useState<AddCustomerForm>(EMPTY_FORM)

  const mutation = useMutation({
    mutationFn: (data: AddCustomerForm) => api.post('/customers', data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['customers'] })
      toast.success('Customer added successfully!')
      setForm(EMPTY_FORM)
      onClose()
    },
    onError: () => {
      toast.error('Failed to add customer. Please try again.')
    },
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.name.trim() || !form.email.trim()) {
      toast.error('Name and email are required.')
      return
    }
    mutation.mutate(form)
  }

  const field = (
    key: keyof AddCustomerForm,
    label: string,
    type = 'text',
    required = false,
  ) => (
    <div>
      <label className="block text-xs mb-1.5" style={{ color: 'rgba(255,255,255,0.5)' }}>
        {label}{required && <span className="ml-0.5" style={{ color: '#ef4444' }}>*</span>}
      </label>
      <input
        type={type}
        value={form[key]}
        onChange={e => setForm(f => ({ ...f, [key]: e.target.value }))}
        required={required}
        className="w-full rounded-xl py-2 px-3 text-sm"
        style={{
          background: 'rgba(255,255,255,0.05)',
          border: '1px solid rgba(255,255,255,0.1)',
          color: 'rgba(255,255,255,0.9)',
          outline: 'none',
        }}
      />
    </div>
  )

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          className="fixed inset-0 flex items-center justify-center z-50 p-4"
          style={{ background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(10px)' }}
          onClick={e => { if (e.target === e.currentTarget) onClose() }}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }}
            className="glass rounded-2xl p-6 w-full max-w-md"
            style={{ border: '1px solid rgba(124,58,237,0.3)' }}
          >
            {/* Header */}
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-lg font-bold" style={{ color: 'rgba(255,255,255,0.9)' }}>Add Customer</h2>
              <button onClick={onClose} className="p-2 rounded-lg hover:bg-white/10" style={{ color: 'rgba(255,255,255,0.5)' }}>
                <X size={16} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              {field('name', 'Full Name', 'text', true)}
              {field('email', 'Email Address', 'email', true)}
              {field('phone', 'Phone Number')}
              {field('city', 'City')}

              {/* Preferred Channel select */}
              <div>
                <label className="block text-xs mb-1.5" style={{ color: 'rgba(255,255,255,0.5)' }}>
                  Preferred Channel
                </label>
                <select
                  value={form.preferredChannel}
                  onChange={e => setForm(f => ({ ...f, preferredChannel: e.target.value }))}
                  className="w-full rounded-xl py-2 px-3 text-sm"
                  style={{
                    background: 'rgba(255,255,255,0.05)',
                    border: '1px solid rgba(255,255,255,0.1)',
                    color: 'rgba(255,255,255,0.9)',
                    outline: 'none',
                  }}
                >
                  {['Email', 'SMS', 'WhatsApp', 'Push'].map(ch => (
                    <option key={ch} value={ch} style={{ background: '#1a1033' }}>{ch}</option>
                  ))}
                </select>
              </div>

              {/* Actions */}
              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 rounded-xl text-sm border transition-colors hover:bg-white/5"
                  style={{ borderColor: 'rgba(255,255,255,0.15)', color: 'rgba(255,255,255,0.6)' }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={mutation.isPending}
                  className="btn-gradient flex items-center gap-2 px-5 py-2 rounded-xl text-sm font-medium disabled:opacity-60"
                >
                  {mutation.isPending ? <Loader2 size={14} className="animate-spin" /> : <Plus size={14} />}
                  Add Customer
                </button>
              </div>
            </form>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

// ── Filter Panel ───────────────────────────────────────────────────────────────
function FilterPanel({
  open,
  anchorRef,
  channelFilter,
  tagFilter,
  onChannelChange,
  onTagChange,
  onClose,
}: {
  open: boolean
  anchorRef: React.RefObject<HTMLButtonElement | null>
  channelFilter: string
  tagFilter: string
  onChannelChange: (v: string) => void
  onTagChange: (v: string) => void
  onClose: () => void
}) {
  const panelRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!open) return
    const handler = (e: MouseEvent) => {
      if (
        panelRef.current && !panelRef.current.contains(e.target as Node) &&
        anchorRef.current && !anchorRef.current.contains(e.target as Node)
      ) {
        onClose()
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [open, onClose, anchorRef])

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          ref={panelRef}
          initial={{ opacity: 0, y: -6, scale: 0.97 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -6, scale: 0.97 }}
          transition={{ duration: 0.15 }}
          className="absolute right-0 top-full mt-2 z-40 glass rounded-2xl p-4 w-64"
          style={{ border: '1px solid rgba(255,255,255,0.1)', boxShadow: '0 8px 32px rgba(0,0,0,0.5)' }}
        >
          <p className="text-xs font-semibold mb-3" style={{ color: 'rgba(255,255,255,0.5)' }}>FILTERS</p>

          {/* Channel filter */}
          <div className="mb-4">
            <label className="block text-xs mb-2" style={{ color: 'rgba(255,255,255,0.6)' }}>Preferred Channel</label>
            <div className="flex flex-wrap gap-1.5">
              {CHANNELS.map(ch => (
                <button
                  key={ch}
                  onClick={() => onChannelChange(ch)}
                  className="px-2.5 py-1 rounded-lg text-xs transition-all"
                  style={{
                    background: channelFilter === ch ? 'rgba(124,58,237,0.3)' : 'rgba(255,255,255,0.05)',
                    border: `1px solid ${channelFilter === ch ? 'rgba(124,58,237,0.6)' : 'rgba(255,255,255,0.1)'}`,
                    color: channelFilter === ch ? '#c4b5fd' : 'rgba(255,255,255,0.5)',
                  }}
                >
                  {ch}
                </button>
              ))}
            </div>
          </div>

          {/* Tag filter */}
          <div>
            <label className="block text-xs mb-1.5" style={{ color: 'rgba(255,255,255,0.6)' }}>Tag</label>
            <input
              type="text"
              value={tagFilter}
              onChange={e => onTagChange(e.target.value)}
              placeholder="e.g. premium, vip…"
              className="w-full rounded-xl py-1.5 px-3 text-xs"
              style={{
                background: 'rgba(255,255,255,0.05)',
                border: '1px solid rgba(255,255,255,0.1)',
                color: 'rgba(255,255,255,0.9)',
                outline: 'none',
              }}
            />
          </div>

          {/* Clear */}
          {(channelFilter !== 'All' || tagFilter) && (
            <button
              onClick={() => { onChannelChange('All'); onTagChange('') }}
              className="mt-3 text-xs w-full text-center"
              style={{ color: '#f87171' }}
            >
              Clear filters
            </button>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  )
}

// ── Main Component ─────────────────────────────────────────────────────────────
export default function Customers() {
  const navigate = useNavigate()
  const qc = useQueryClient()
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)
  const [showUpload, setShowUpload] = useState(false)
  const [showAddCustomer, setShowAddCustomer] = useState(false)
  const [showFilter, setShowFilter] = useState(false)
  const [channelFilter, setChannelFilter] = useState('All')
  const [tagFilter, setTagFilter] = useState('')
  const [uploadResult, setUploadResult] = useState<any>(null)
  const [uploading, setUploading] = useState(false)
  const filterBtnRef = useRef<HTMLButtonElement>(null)

  // Build query params including filters
  const buildQueryString = () => {
    const params = new URLSearchParams({
      page: String(page),
      limit: '15',
      search,
    })
    if (channelFilter && channelFilter !== 'All') params.set('channel', channelFilter)
    if (tagFilter.trim()) params.set('tag', tagFilter.trim())
    return params.toString()
  }

  const { data, isLoading } = useQuery({
    queryKey: ['customers', page, search, channelFilter, tagFilter],
    queryFn: () => api.get(`/customers?${buildQueryString()}`).then(r => r.data),
    placeholderData: (prev) => prev,
  })

  const { data: statsData } = useQuery({
    queryKey: ['customer-stats'],
    queryFn: () => api.get('/customers/stats').then(r => r.data.data),
  })

  const deleteMutation = useMutation({
    mutationFn: (id: string) => api.delete(`/customers/${id}`),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['customers'] })
      toast.success('Customer removed')
    },
  })

  // Dropzone for CSV
  const onDrop = useCallback(async (files: File[]) => {
    if (!files[0]) return
    setUploading(true)
    try {
      const formData = new FormData()
      formData.append('file', files[0])
      const { data } = await api.post('/customers/upload-csv', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      })
      setUploadResult(data)
      qc.invalidateQueries({ queryKey: ['customers'] })
      toast.success(`Imported ${data.created} new customers!`)
    } catch {
      toast.error('CSV import failed. Check format.')
    } finally {
      setUploading(false)
    }
  }, [qc])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'text/csv': ['.csv'] },
    multiple: false,
  })

  const customers = data?.data || []
  const pagination = data?.pagination || {}

  const hasActiveFilters = channelFilter !== 'All' || tagFilter.trim() !== ''

  return (
    <div className="p-6 space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold" style={{ color: 'rgba(255,255,255,0.95)' }}>Customer Hub</h1>
          <p className="text-sm mt-1" style={{ color: 'rgba(255,255,255,0.4)' }}>
            {pagination.total || 0} customers · AI-enriched profiles
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button onClick={() => setShowUpload(true)} className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm border transition-colors hover:bg-white/5"
            style={{ borderColor: 'rgba(255,255,255,0.15)', color: 'rgba(255,255,255,0.7)' }}>
            <Upload size={15} /> CSV Import
          </button>
          <button
            onClick={() => setShowAddCustomer(true)}
            className="btn-gradient flex items-center gap-2 px-4 py-2 rounded-xl text-sm"
          >
            <Plus size={15} /> Add Customer
          </button>
        </div>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { icon: Users, label: 'Total', value: statsData?.totalCustomers || 0, color: '#7c3aed' },
          { icon: TrendingUp, label: 'Total Revenue', value: formatCurrency(statsData?.totalRevenue || 0), color: '#059669' },
          { icon: ShoppingBag, label: 'Avg Spend', value: formatCurrency(statsData?.avgSpend || 0), color: '#c026d3' },
          { icon: MapPin, label: 'Avg Orders', value: statsData?.avgOrders || 0, color: '#d97706' },
        ].map(({ icon: Icon, label, value, color }) => (
          <div key={label} className="metric-card p-4 flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: `${color}20` }}>
              <Icon size={16} style={{ color }} />
            </div>
            <div>
              <div className="text-xs" style={{ color: 'rgba(255,255,255,0.4)' }}>{label}</div>
              <div className="text-sm font-semibold" style={{ color: 'rgba(255,255,255,0.9)' }}>{value}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Search + Filter */}
      <div className="flex items-center gap-3">
        <div className="flex-1 relative">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: 'rgba(255,255,255,0.3)' }} />
          <input
            type="text"
            value={search}
            onChange={e => { setSearch(e.target.value); setPage(1) }}
            placeholder="Search by name, email, or phone..."
            className="w-full rounded-xl py-2.5 pl-9 pr-4 text-sm"
          />
        </div>

        {/* Filter button with dropdown */}
        <div className="relative">
          <button
            ref={filterBtnRef}
            onClick={() => setShowFilter(v => !v)}
            className="p-2.5 rounded-xl border transition-colors hover:bg-white/5"
            style={{
              borderColor: hasActiveFilters ? 'rgba(124,58,237,0.6)' : 'rgba(255,255,255,0.15)',
              color: hasActiveFilters ? '#c4b5fd' : 'rgba(255,255,255,0.5)',
              background: hasActiveFilters ? 'rgba(124,58,237,0.15)' : 'transparent',
            }}
          >
            <Filter size={15} />
          </button>
          <FilterPanel
            open={showFilter}
            anchorRef={filterBtnRef}
            channelFilter={channelFilter}
            tagFilter={tagFilter}
            onChannelChange={v => { setChannelFilter(v); setPage(1) }}
            onTagChange={v => { setTagFilter(v); setPage(1) }}
            onClose={() => setShowFilter(false)}
          />
        </div>
      </div>

      {/* Active filter chips */}
      {hasActiveFilters && (
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-xs" style={{ color: 'rgba(255,255,255,0.4)' }}>Filters:</span>
          {channelFilter !== 'All' && (
            <span className="flex items-center gap-1 text-xs px-2.5 py-1 rounded-full"
              style={{ background: 'rgba(124,58,237,0.2)', color: '#c4b5fd', border: '1px solid rgba(124,58,237,0.4)' }}>
              Channel: {channelFilter}
              <button onClick={() => setChannelFilter('All')} className="ml-0.5 hover:opacity-70"><X size={10} /></button>
            </span>
          )}
          {tagFilter.trim() && (
            <span className="flex items-center gap-1 text-xs px-2.5 py-1 rounded-full"
              style={{ background: 'rgba(192,38,211,0.2)', color: '#e879f9', border: '1px solid rgba(192,38,211,0.4)' }}>
              Tag: {tagFilter}
              <button onClick={() => setTagFilter('')} className="ml-0.5 hover:opacity-70"><X size={10} /></button>
            </span>
          )}
        </div>
      )}

      {/* Table */}
      <div className="glass rounded-2xl overflow-hidden" style={{ border: '1px solid rgba(255,255,255,0.06)' }}>
        <table className="data-table w-full">
          <thead>
            <tr>
              <th>Customer</th>
              <th>City</th>
              <th>Total Spend</th>
              <th>Orders</th>
              <th>Last Order</th>
              <th>Channel</th>
              <th>Tags</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {isLoading
              ? Array(8).fill(0).map((_, i) => (
                <tr key={i}>
                  {Array(8).fill(0).map((_, j) => (
                    <td key={j}><div className="shimmer h-5 rounded" /></td>
                  ))}
                </tr>
              ))
              : customers.map((c: any) => (
                <motion.tr key={c._id} initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                  <td>
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0"
                        style={{ background: 'linear-gradient(135deg, #7c3aed, #c026d3)', color: 'white' }}>
                        {getInitials(c.name)}
                      </div>
                      <div>
                        <div className="text-sm font-medium" style={{ color: 'rgba(255,255,255,0.9)' }}>{c.name}</div>
                        <div className="text-xs" style={{ color: 'rgba(255,255,255,0.4)' }}>{c.email}</div>
                      </div>
                    </div>
                  </td>
                  <td className="text-sm" style={{ color: 'rgba(255,255,255,0.6)' }}>{c.city || '—'}</td>
                  <td>
                    <span className="text-sm font-semibold" style={{ color: '#10b981' }}>{formatCurrency(c.totalSpend)}</span>
                  </td>
                  <td className="text-sm" style={{ color: 'rgba(255,255,255,0.7)' }}>{c.orderCount}</td>
                  <td className="text-xs" style={{ color: 'rgba(255,255,255,0.5)' }}>
                    {c.lastOrderDate ? timeAgo(c.lastOrderDate) : 'Never'}
                  </td>
                  <td>
                    <span className="text-xs px-2 py-1 rounded-full font-medium"
                      style={{ background: `${CHANNEL_COLORS[c.preferredChannel] || '#7c3aed'}20`, color: CHANNEL_COLORS[c.preferredChannel] || '#a78bfa' }}>
                      {c.preferredChannel}
                    </span>
                  </td>
                  <td>
                    <div className="flex flex-wrap gap-1">
                      {(c.tags || []).slice(0, 2).map((tag: string) => (
                        <span key={tag} className="text-[10px] px-1.5 py-0.5 rounded-full"
                          style={{ background: `${TAG_COLORS[tag] || '#7c3aed'}20`, color: TAG_COLORS[tag] || '#a78bfa' }}>
                          {tag}
                        </span>
                      ))}
                    </div>
                  </td>
                  <td>
                    <div className="flex items-center gap-1">
                      <button onClick={() => navigate(`/customers/${c._id}`)}
                        className="p-1.5 rounded-lg hover:bg-white/10 transition-colors" style={{ color: '#a78bfa' }}>
                        <Eye size={14} />
                      </button>
                      <button onClick={() => deleteMutation.mutate(c._id)}
                        className="p-1.5 rounded-lg hover:bg-red-500/10 transition-colors" style={{ color: 'rgba(255,255,255,0.3)' }}>
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </td>
                </motion.tr>
              ))}
          </tbody>
        </table>

        {!isLoading && customers.length === 0 && (
          <div className="py-16 text-center" style={{ color: 'rgba(255,255,255,0.3)' }}>
            <Users size={40} className="mx-auto mb-3 opacity-30" />
            <p>No customers found</p>
          </div>
        )}
      </div>

      {/* Pagination */}
      {pagination.pages > 1 && (
        <div className="flex items-center justify-between">
          <span className="text-xs" style={{ color: 'rgba(255,255,255,0.4)' }}>
            Page {pagination.page} of {pagination.pages} · {pagination.total} total
          </span>
          <div className="flex items-center gap-2">
            <button disabled={page === 1} onClick={() => setPage(p => p - 1)}
              className="p-2 rounded-lg disabled:opacity-30 hover:bg-white/5 transition-colors" style={{ color: 'rgba(255,255,255,0.6)' }}>
              <ChevronLeft size={16} />
            </button>
            <button disabled={page === pagination.pages} onClick={() => setPage(p => p + 1)}
              className="p-2 rounded-lg disabled:opacity-30 hover:bg-white/5 transition-colors" style={{ color: 'rgba(255,255,255,0.6)' }}>
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      )}

      {/* Add Customer Modal */}
      <AddCustomerModal open={showAddCustomer} onClose={() => setShowAddCustomer(false)} />

      {/* CSV Upload Modal */}
      <AnimatePresence>
        {showUpload && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 flex items-center justify-center z-50 p-4" style={{ background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(10px)' }}>
            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }}
              className="glass rounded-2xl p-6 w-full max-w-lg" style={{ border: '1px solid rgba(124,58,237,0.3)' }}>
              <div className="flex items-center justify-between mb-5">
                <h2 className="text-lg font-bold" style={{ color: 'rgba(255,255,255,0.9)' }}>CSV Customer Import</h2>
                <button onClick={() => { setShowUpload(false); setUploadResult(null) }}
                  className="p-2 rounded-lg hover:bg-white/10" style={{ color: 'rgba(255,255,255,0.5)' }}>
                  <X size={16} />
                </button>
              </div>

              {!uploadResult ? (
                <>
                  <div {...getRootProps()} className="border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all"
                    style={{ borderColor: isDragActive ? '#7c3aed' : 'rgba(255,255,255,0.1)', background: isDragActive ? 'rgba(124,58,237,0.1)' : 'transparent' }}>
                    <input {...getInputProps()} />
                    {uploading ? (
                      <div><Loader2 size={32} className="mx-auto mb-3 animate-spin" style={{ color: '#7c3aed' }} />
                        <p className="text-sm" style={{ color: 'rgba(255,255,255,0.6)' }}>Importing...</p></div>
                    ) : (
                      <div><Upload size={32} className="mx-auto mb-3" style={{ color: 'rgba(255,255,255,0.3)' }} />
                        <p className="text-sm font-medium" style={{ color: 'rgba(255,255,255,0.7)' }}>
                          {isDragActive ? 'Drop your CSV here' : 'Drag & drop CSV or click to browse'}
                        </p>
                        <p className="text-xs mt-2" style={{ color: 'rgba(255,255,255,0.35)' }}>
                          Columns: name, email, phone, city, totalSpend, orderCount, lastOrderDate, tags
                        </p>
                      </div>
                    )}
                  </div>
                  <div className="mt-3 p-3 rounded-xl text-xs" style={{ background: 'rgba(255,255,255,0.03)' }}>
                    <button
                      onClick={downloadSampleCSV}
                      className="flex items-center gap-2 hover:opacity-80 transition-opacity"
                      style={{ color: '#a78bfa' }}
                    >
                      <Download size={12} /> Download sample CSV template
                    </button>
                  </div>
                </>
              ) : (
                <div className="text-center py-4">
                  <CheckCircle size={40} className="mx-auto mb-3" style={{ color: '#10b981' }} />
                  <p className="font-semibold mb-3" style={{ color: 'rgba(255,255,255,0.9)' }}>Import Complete!</p>
                  <div className="grid grid-cols-2 gap-3 mb-5">
                    <div className="p-3 rounded-xl" style={{ background: 'rgba(16,185,129,0.1)' }}>
                      <div className="text-2xl font-bold" style={{ color: '#10b981' }}>{uploadResult.created}</div>
                      <div className="text-xs" style={{ color: 'rgba(255,255,255,0.5)' }}>New customers</div>
                    </div>
                    <div className="p-3 rounded-xl" style={{ background: 'rgba(124,58,237,0.1)' }}>
                      <div className="text-2xl font-bold" style={{ color: '#a78bfa' }}>{uploadResult.updated}</div>
                      <div className="text-xs" style={{ color: 'rgba(255,255,255,0.5)' }}>Updated</div>
                    </div>
                  </div>
                  <button onClick={() => { setShowUpload(false); setUploadResult(null) }}
                    className="btn-gradient px-6 py-2 rounded-xl text-sm font-medium">Done</button>
                </div>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
