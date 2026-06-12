import { useParams, useNavigate } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { motion } from 'framer-motion'
import {
  ArrowLeft, Send, MailOpen, MousePointer, ShoppingBag,
} from 'lucide-react'
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell,
} from 'recharts'
import api from '../lib/api'
import { formatCurrency, formatNumber, timeAgo, statusColor, channelIcon } from '../lib/utils'

const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null
  return (
    <div className="glass p-3 rounded-xl text-xs" style={{ border: '1px solid rgba(124,58,237,0.3)' }}>
      <div className="font-semibold mb-1" style={{ color: 'rgba(255,255,255,0.8)' }}>{label}</div>
      {payload.map((p: any) => (
        <div key={p.name} style={{ color: p.fill || '#a78bfa' }}>{p.name}: {p.value}</div>
      ))}
    </div>
  )
}

export default function CampaignDetail() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()

  const { data, isLoading } = useQuery({
    queryKey: ['campaign-detail', id],
    queryFn: () => api.get(`/campaigns/${id}/analytics`).then(r => r.data.data),
    refetchInterval: 10000,
  })

  if (isLoading) {
    return (
      <div className="p-6 space-y-4">
        {Array(4).fill(0).map((_, i) => <div key={i} className="shimmer h-32 rounded-2xl" />)}
      </div>
    )
  }

  const campaign = data?.campaign
  const funnel = data?.funnel || {}
  const statusDist = data?.statusDistribution || []

  if (!campaign) return <div className="p-6 text-red-400">Campaign not found</div>

  const funnelData = [
    { name: 'Sent', value: funnel.sent || 0, fill: '#7c3aed' },
    { name: 'Delivered', value: funnel.delivered || 0, fill: '#2563eb' },
    { name: 'Opened', value: funnel.opened || 0, fill: '#059669' },
    { name: 'Clicked', value: funnel.clicked || 0, fill: '#d97706' },
    { name: 'Converted', value: funnel.converted || 0, fill: '#c026d3' },
  ]

  const deliveryRate = funnel.sent > 0 ? ((funnel.delivered / funnel.sent) * 100).toFixed(1) : 0
  const openRate = funnel.delivered > 0 ? ((funnel.opened / funnel.delivered) * 100).toFixed(1) : 0
  const clickRate = funnel.opened > 0 ? ((funnel.clicked / funnel.opened) * 100).toFixed(1) : 0
  const convRate = funnel.clicked > 0 ? ((funnel.converted / funnel.clicked) * 100).toFixed(1) : 0

  return (
    <div className="p-6 space-y-5">
      <button onClick={() => navigate('/campaigns')} className="flex items-center gap-2 text-sm hover:opacity-80" style={{ color: '#a78bfa' }}>
        <ArrowLeft size={16} /> Back to Campaigns
      </button>

      {/* Header */}
      <div className="glass p-5 rounded-2xl flex items-start gap-4" style={{ border: '1px solid rgba(255,255,255,0.06)' }}>
        <div className="text-3xl">{channelIcon(campaign.channel)}</div>
        <div className="flex-1">
          <div className="flex items-center gap-3 flex-wrap">
            <h1 className="text-xl font-bold" style={{ color: 'rgba(255,255,255,0.95)' }}>{campaign.name}</h1>
            <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${statusColor(campaign.status)}`}>{campaign.status}</span>
          </div>
          <div className="text-sm mt-1" style={{ color: 'rgba(255,255,255,0.4)' }}>
            {campaign.channel} · {campaign.audienceSize} recipients · Launched {timeAgo(campaign.launchedAt || campaign.createdAt)}
          </div>
          {campaign.goal && <div className="text-xs mt-2 italic" style={{ color: 'rgba(255,255,255,0.35)' }}>Goal: {campaign.goal}</div>}
        </div>
        <div className="text-right">
          <div className="text-xs mb-1" style={{ color: 'rgba(255,255,255,0.4)' }}>Revenue</div>
          <div className="text-2xl font-bold" style={{ color: '#10b981' }}>{formatCurrency(campaign.stats?.revenue || 0)}</div>
        </div>
      </div>

      {/* Rate Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { icon: Send, label: 'Delivery Rate', value: `${deliveryRate}%`, sub: `${formatNumber(funnel.delivered)} delivered`, color: '#10b981' },
          { icon: MailOpen, label: 'Open Rate', value: `${openRate}%`, sub: `${formatNumber(funnel.opened)} opened`, color: '#3b82f6' },
          { icon: MousePointer, label: 'Click Rate', value: `${clickRate}%`, sub: `${formatNumber(funnel.clicked)} clicked`, color: '#8b5cf6' },
          { icon: ShoppingBag, label: 'Conversion', value: `${convRate}%`, sub: `${formatNumber(funnel.converted)} converted`, color: '#c026d3' },
        ].map(({ icon: Icon, label, value, sub, color }) => (
          <div key={label} className="metric-card p-4">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center mb-3" style={{ background: `${color}20` }}>
              <Icon size={16} style={{ color }} />
            </div>
            <div className="text-2xl font-bold" style={{ color: 'rgba(255,255,255,0.95)' }}>{value}</div>
            <div className="text-xs font-medium mt-1" style={{ color: 'rgba(255,255,255,0.5)' }}>{label}</div>
            <div className="text-xs mt-0.5" style={{ color: 'rgba(255,255,255,0.3)' }}>{sub}</div>
          </div>
        ))}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Funnel */}
        <div className="glass p-5 rounded-2xl" style={{ border: '1px solid rgba(255,255,255,0.06)' }}>
          <h3 className="font-semibold text-sm mb-5" style={{ color: 'rgba(255,255,255,0.8)' }}>Campaign Funnel</h3>
          <div className="space-y-3">
            {funnelData.map((item, i) => {
              const pct = funnelData[0].value > 0 ? (item.value / funnelData[0].value) * 100 : 0
              return (
                <div key={item.name}>
                  <div className="flex justify-between text-xs mb-1">
                    <span style={{ color: 'rgba(255,255,255,0.6)' }}>{item.name}</span>
                    <span style={{ color: item.fill }}>{formatNumber(item.value)} ({pct.toFixed(1)}%)</span>
                  </div>
                  <div className="h-8 rounded-lg overflow-hidden" style={{ background: 'rgba(255,255,255,0.05)' }}>
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${pct}%` }}
                      transition={{ delay: i * 0.1, duration: 0.8 }}
                      className="h-full rounded-lg flex items-center px-3 text-xs font-semibold"
                      style={{ background: item.fill, color: 'white', minWidth: pct > 5 ? 'auto' : 0 }}
                    >
                      {pct > 8 ? item.name : ''}
                    </motion.div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* Status Distribution */}
        <div className="glass p-5 rounded-2xl" style={{ border: '1px solid rgba(255,255,255,0.06)' }}>
          <h3 className="font-semibold text-sm mb-4" style={{ color: 'rgba(255,255,255,0.8)' }}>Status Distribution</h3>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={statusDist} margin={{ left: -20 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
              <XAxis dataKey="_id" tick={{ fill: 'rgba(255,255,255,0.4)', fontSize: 11 }} />
              <YAxis tick={{ fill: 'rgba(255,255,255,0.4)', fontSize: 11 }} />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="count" radius={[4, 4, 0, 0]} name="Count">
                {statusDist.map((_: any, i: number) => (
                  <Cell key={i} fill={['#7c3aed', '#10b981', '#3b82f6', '#059669', '#c026d3', '#ef4444'][i % 6]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Communications Sample */}
      {campaign.communications?.length > 0 && (
        <div className="glass p-5 rounded-2xl" style={{ border: '1px solid rgba(255,255,255,0.06)' }}>
          <h3 className="font-semibold text-sm mb-4" style={{ color: 'rgba(255,255,255,0.8)' }}>Recent Deliveries</h3>
          <div className="space-y-2">
            {campaign.communications.slice(0, 8).map((comm: any) => (
              <div key={comm._id} className="flex items-center gap-3 p-3 rounded-xl" style={{ background: 'rgba(255,255,255,0.03)' }}>
                <div className={`w-2 h-2 rounded-full flex-shrink-0 ${
                  comm.status === 'converted' ? 'bg-purple-500' :
                  comm.status === 'clicked' ? 'bg-violet-400' :
                  comm.status === 'opened' || comm.status === 'read' ? 'bg-blue-400' :
                  comm.status === 'delivered' ? 'bg-green-400' :
                  comm.status === 'failed' ? 'bg-red-400' : 'bg-gray-500'
                }`} />
                <div className="flex-1 text-xs" style={{ color: 'rgba(255,255,255,0.7)' }}>
                  {comm.customerId?.name || 'Unknown'} · {comm.customerId?.email}
                </div>
                <span className={`text-xs px-2 py-0.5 rounded-full ${statusColor(comm.status)}`}>{comm.status}</span>
                {comm.revenue > 0 && <span className="text-xs" style={{ color: '#10b981' }}>{formatCurrency(comm.revenue)}</span>}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
