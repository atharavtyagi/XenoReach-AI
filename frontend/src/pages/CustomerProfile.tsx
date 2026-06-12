import { useParams, useNavigate } from 'react-router-dom'
import { useQuery, useMutation } from '@tanstack/react-query'
import {
  ArrowLeft, Mail, Phone, MapPin, ShoppingBag, TrendingUp,
  Sparkles, Calendar, Tag, Loader2, RefreshCw,
} from 'lucide-react'
import api from '../lib/api'
import { formatCurrency, formatDate, getInitials, timeAgo, statusColor } from '../lib/utils'
import toast from 'react-hot-toast'

export default function CustomerProfile() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()

  const { data, isLoading, refetch } = useQuery({
    queryKey: ['customer', id],
    queryFn: () => api.get(`/customers/${id}`).then(r => r.data.data),
  })

  const insightsMutation = useMutation({
    mutationFn: () => api.post(`/customers/${id}/insights`),
    onSuccess: () => {
      toast.success('AI insights generated!')
      refetch()
    },
    onError: () => toast.error('Failed to generate insights'),
  })

  if (isLoading) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-4">
          <div className="shimmer h-8 w-48 rounded-xl" />
          <div className="shimmer h-40 rounded-2xl" />
          <div className="grid grid-cols-3 gap-4">
            {Array(3).fill(0).map((_, i) => <div key={i} className="shimmer h-24 rounded-2xl" />)}
          </div>
        </div>
      </div>
    )
  }

  if (!data) return <div className="p-6 text-red-400">Customer not found</div>

  const customer = data
  const orders = customer.recentOrders || []

  const tierLabel = customer.totalSpend > 20000 ? 'VIP' : customer.totalSpend > 5000 ? 'Premium' : 'Standard'
  const tierColor = tierLabel === 'VIP' ? '#c026d3' : tierLabel === 'Premium' ? '#7c3aed' : '#94a3b8'

  const daysSince = customer.lastOrderDate
    ? Math.floor((Date.now() - new Date(customer.lastOrderDate).getTime()) / 86400000)
    : null

  const churnRisk = !daysSince ? 'Unknown' : daysSince > 120 ? 'High' : daysSince > 60 ? 'Medium' : 'Low'
  const churnColor = churnRisk === 'High' ? '#ef4444' : churnRisk === 'Medium' ? '#f59e0b' : '#10b981'

  return (
    <div className="p-6 space-y-5">
      {/* Back */}
      <button onClick={() => navigate('/customers')} className="flex items-center gap-2 text-sm hover:opacity-80 transition-opacity" style={{ color: '#a78bfa' }}>
        <ArrowLeft size={16} /> Back to Customers
      </button>

      {/* Profile Header */}
      <div className="glass p-6 rounded-2xl" style={{ border: '1px solid rgba(255,255,255,0.06)' }}>
        <div className="flex items-start gap-5">
          <div className="w-20 h-20 rounded-2xl flex items-center justify-center text-2xl font-black flex-shrink-0"
            style={{ background: 'linear-gradient(135deg, #7c3aed, #c026d3)', color: 'white' }}>
            {getInitials(customer.name)}
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-3 flex-wrap">
              <h1 className="text-2xl font-bold" style={{ color: 'rgba(255,255,255,0.95)' }}>{customer.name}</h1>
              <span className="text-xs px-2.5 py-1 rounded-full font-bold"
                style={{ background: `${tierColor}20`, color: tierColor, border: `1px solid ${tierColor}30` }}>
                ⭐ {tierLabel}
              </span>
              <span className="text-xs px-2.5 py-1 rounded-full font-medium"
                style={{ background: `${churnColor}15`, color: churnColor, border: `1px solid ${churnColor}25` }}>
                Churn Risk: {churnRisk}
              </span>
            </div>
            <div className="flex flex-wrap gap-4 mt-3">
              <a href={`mailto:${customer.email}`} className="flex items-center gap-2 text-sm" style={{ color: 'rgba(255,255,255,0.5)' }}>
                <Mail size={14} /> {customer.email}
              </a>
              {customer.phone && (
                <span className="flex items-center gap-2 text-sm" style={{ color: 'rgba(255,255,255,0.5)' }}>
                  <Phone size={14} /> {customer.phone}
                </span>
              )}
              {customer.city && (
                <span className="flex items-center gap-2 text-sm" style={{ color: 'rgba(255,255,255,0.5)' }}>
                  <MapPin size={14} /> {customer.city}, {customer.state}
                </span>
              )}
            </div>
            <div className="flex flex-wrap gap-2 mt-3">
              {(customer.tags || []).map((tag: string) => (
                <span key={tag} className="text-xs px-2.5 py-1 rounded-full"
                  style={{ background: 'rgba(124,58,237,0.15)', color: '#a78bfa', border: '1px solid rgba(124,58,237,0.25)' }}>
                  <Tag size={10} className="inline mr-1" />{tag}
                </span>
              ))}
            </div>
          </div>
          <div className="text-right flex-shrink-0">
            <div className="text-xs mb-1" style={{ color: 'rgba(255,255,255,0.4)' }}>Data Quality</div>
            <div className="text-2xl font-bold" style={{ color: customer.dataQualityScore > 80 ? '#10b981' : '#f59e0b' }}>
              {customer.dataQualityScore}%
            </div>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { icon: TrendingUp, label: 'Total Spend', value: formatCurrency(customer.totalSpend), color: '#10b981' },
          { icon: ShoppingBag, label: 'Total Orders', value: customer.orderCount, color: '#7c3aed' },
          { icon: TrendingUp, label: 'Avg Order Value', value: formatCurrency(customer.avgOrderValue || 0), color: '#c026d3' },
          { icon: Calendar, label: 'Last Order', value: customer.lastOrderDate ? timeAgo(customer.lastOrderDate) : 'Never', color: '#d97706' },
        ].map(({ icon: Icon, label, value, color }) => (
          <div key={label} className="metric-card p-4 text-center">
            <Icon size={20} className="mx-auto mb-2" style={{ color }} />
            <div className="text-lg font-bold" style={{ color: 'rgba(255,255,255,0.9)' }}>{value}</div>
            <div className="text-xs mt-1" style={{ color: 'rgba(255,255,255,0.4)' }}>{label}</div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* AI Insights */}
        <div className="glass p-5 rounded-2xl" style={{ border: '1px solid rgba(124,58,237,0.2)' }}>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Sparkles size={16} style={{ color: '#a78bfa' }} />
              <h3 className="font-semibold text-sm" style={{ color: 'rgba(255,255,255,0.85)' }}>AI Customer Insights</h3>
            </div>
            <button
              onClick={() => insightsMutation.mutate()}
              disabled={insightsMutation.isPending}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all"
              style={{ background: 'rgba(124,58,237,0.15)', color: '#a78bfa', border: '1px solid rgba(124,58,237,0.25)' }}
            >
              {insightsMutation.isPending ? <Loader2 size={12} className="animate-spin" /> : <RefreshCw size={12} />}
              {insightsMutation.isPending ? 'Analyzing...' : 'Generate'}
            </button>
          </div>

          {customer.aiInsights ? (
            <div className="text-sm leading-relaxed" style={{ color: 'rgba(255,255,255,0.65)' }}
              dangerouslySetInnerHTML={{ __html: customer.aiInsights.replace(/\*\*(.*?)\*\*/g, '<strong style="color:rgba(255,255,255,0.9)">$1</strong>') }}
            />
          ) : (
            <div className="flex flex-col items-center py-6 text-center">
              <Sparkles size={28} className="mb-2" style={{ color: 'rgba(124,58,237,0.4)' }} />
              <p className="text-sm" style={{ color: 'rgba(255,255,255,0.35)' }}>Click "Generate" for AI-powered insights</p>
            </div>
          )}
        </div>

        {/* Recent Orders */}
        <div className="glass p-5 rounded-2xl" style={{ border: '1px solid rgba(255,255,255,0.06)' }}>
          <h3 className="font-semibold text-sm mb-4" style={{ color: 'rgba(255,255,255,0.85)' }}>Recent Orders</h3>
          {orders.length === 0 ? (
            <div className="py-8 text-center" style={{ color: 'rgba(255,255,255,0.3)' }}>
              <ShoppingBag size={28} className="mx-auto mb-2 opacity-40" />
              <p className="text-sm">No orders yet</p>
            </div>
          ) : (
            <div className="space-y-3">
              {orders.slice(0, 6).map((order: any) => (
                <div key={order._id} className="flex items-center justify-between p-3 rounded-xl" style={{ background: 'rgba(255,255,255,0.03)' }}>
                  <div>
                    <div className="text-xs font-mono" style={{ color: 'rgba(255,255,255,0.5)' }}>{order.orderNumber}</div>
                    <div className="text-xs mt-0.5" style={{ color: 'rgba(255,255,255,0.35)' }}>
                      {formatDate(order.createdAt)} · {order.channel}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-semibold" style={{ color: '#10b981' }}>{formatCurrency(order.totalAmount)}</div>
                    <span className={`text-xs px-2 py-0.5 rounded-full ${statusColor(order.status)}`}>{order.status}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
