import { useQuery } from '@tanstack/react-query'
import { motion } from 'framer-motion'
import {
  AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, PieChart, Pie, Cell, Legend,
} from 'recharts'
import {
  Users, Send, TrendingUp, Mail, MousePointer, ShoppingBag,
  ArrowUpRight, Zap, Target, RefreshCw, ExternalLink,
} from 'lucide-react'
import api from '../lib/api'
import { useNavigate } from 'react-router-dom'
import { formatCurrency, formatNumber, timeAgo, statusColor, channelIcon } from '../lib/utils'

const COLORS = ['#7c3aed', '#c026d3', '#2563eb', '#059669', '#d97706', '#dc2626']

const StatCard = ({ icon: Icon, label, value, change, color, sub }: any) => (
  <motion.div
    initial={{ opacity: 0, y: 16 }}
    animate={{ opacity: 1, y: 0 }}
    className="metric-card p-5"
  >
    <div className="flex items-start justify-between mb-4">
      <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: `${color}20`, border: `1px solid ${color}30` }}>
        <Icon size={18} style={{ color }} />
      </div>
      {change !== undefined && (
        <div className="flex items-center gap-1 text-xs font-medium" style={{ color: change >= 0 ? '#10b981' : '#ef4444' }}>
          <ArrowUpRight size={12} style={{ transform: change < 0 ? 'scaleY(-1)' : undefined }} />
          {Math.abs(change)}%
        </div>
      )}
    </div>
    <div className="text-2xl font-bold mb-1" style={{ color: 'rgba(255,255,255,0.95)' }}>{value}</div>
    <div className="text-xs" style={{ color: 'rgba(255,255,255,0.45)' }}>{label}</div>
    {sub && <div className="text-xs mt-1" style={{ color: 'rgba(255,255,255,0.3)' }}>{sub}</div>}
  </motion.div>
)

const SkeletonCard = () => (
  <div className="metric-card p-5">
    <div className="shimmer w-10 h-10 rounded-xl mb-4" />
    <div className="shimmer w-24 h-7 rounded mb-2" />
    <div className="shimmer w-32 h-4 rounded" />
  </div>
)

const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null
  return (
    <div className="glass p-3 rounded-xl text-xs" style={{ border: '1px solid rgba(124,58,237,0.3)' }}>
      <div className="font-semibold mb-1" style={{ color: 'rgba(255,255,255,0.8)' }}>{label}</div>
      {payload.map((p: any) => (
        <div key={p.name} style={{ color: p.color }}>{p.name}: {p.value}</div>
      ))}
    </div>
  )
}

export default function Dashboard() {
  const navigate = useNavigate()
  const { data, isLoading, refetch } = useQuery({
    queryKey: ['analytics-overview'],
    queryFn: () => api.get('/analytics/overview').then(r => r.data.data),
    refetchInterval: 30000,
  })

  const kpis = data?.kpis || {}

  const statCards = [
    { icon: Users, label: 'Total Customers', value: formatNumber(kpis.totalCustomers || 0), change: 12, color: '#7c3aed' },
    { icon: TrendingUp, label: 'Total Revenue', value: formatCurrency(kpis.totalRevenue || 0), change: 8, color: '#059669' },
    { icon: Send, label: 'Total Campaigns', value: kpis.totalCampaigns || 0, change: 24, color: '#c026d3' },
    { icon: Mail, label: 'Delivery Rate', value: `${kpis.deliveryRate || 0}%`, change: 3, color: '#2563eb' },
    { icon: Zap, label: 'Open Rate', value: `${kpis.openRate || 0}%`, change: 5, color: '#d97706' },
    { icon: MousePointer, label: 'Click Rate', value: `${kpis.clickRate || 0}%`, change: -2, color: '#f97316' },
    { icon: ShoppingBag, label: 'Conversion Rate', value: `${kpis.conversionRate || 0}%`, change: 11, color: '#06b6d4' },
    { icon: Target, label: 'Avg Customer Spend', value: formatCurrency(kpis.avgCustomerSpend || 0), change: 6, color: '#ec4899' },
  ]

  const spendDist = (data?.spendDistribution || []).map((d: any) => ({
    range: typeof d._id === 'number' ? `₹${(d._id / 1000).toFixed(0)}K+` : 'High',
    customers: d.count,
    revenue: Math.round(d.revenue / 1000),
  }))

  const cityData = (data?.topCities || []).map((c: any) => ({
    city: c._id,
    count: c.count,
    revenue: Math.round(c.revenue / 1000),
  }))

  const growthData = (data?.customerGrowth || []).map((g: any) => ({
    month: g._id?.slice(0, 7) || '',
    customers: g.count,
  }))

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold" style={{ color: 'rgba(255,255,255,0.95)' }}>Analytics Dashboard</h1>
          <p className="text-sm mt-1" style={{ color: 'rgba(255,255,255,0.4)' }}>Real-time CRM performance overview</p>
        </div>
        <button onClick={() => refetch()} className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm border transition-colors hover:bg-white/5"
          style={{ borderColor: 'rgba(255,255,255,0.15)', color: 'rgba(255,255,255,0.7)' }}>
          <RefreshCw size={14} /> Refresh
        </button>
      </div>

      {/* KPI Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {isLoading ? Array(8).fill(0).map((_, i) => <SkeletonCard key={i} />) : statCards.map(s => <StatCard key={s.label} {...s} />)}
      </div>

      {/* Charts Row 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Customer Growth */}
        <div className="glass p-5 rounded-2xl" style={{ border: '1px solid rgba(255,255,255,0.06)' }}>
          <h3 className="font-semibold text-sm mb-4" style={{ color: 'rgba(255,255,255,0.8)' }}>Customer Growth</h3>
          {isLoading ? <div className="shimmer h-48 rounded-xl" /> : (
            <ResponsiveContainer width="100%" height={200}>
              <AreaChart data={growthData}>
                <defs>
                  <linearGradient id="cGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#7c3aed" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#7c3aed" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                <XAxis dataKey="month" tick={{ fill: 'rgba(255,255,255,0.4)', fontSize: 11 }} />
                <YAxis tick={{ fill: 'rgba(255,255,255,0.4)', fontSize: 11 }} />
                <Tooltip content={<CustomTooltip />} />
                <Area type="monotone" dataKey="customers" stroke="#7c3aed" fill="url(#cGrad)" strokeWidth={2} name="Customers" />
              </AreaChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* City Revenue */}
        <div className="glass p-5 rounded-2xl" style={{ border: '1px solid rgba(255,255,255,0.06)' }}>
          <h3 className="font-semibold text-sm mb-4" style={{ color: 'rgba(255,255,255,0.8)' }}>Revenue by City (₹K)</h3>
          {isLoading ? <div className="shimmer h-48 rounded-xl" /> : (
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={cityData}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                <XAxis dataKey="city" tick={{ fill: 'rgba(255,255,255,0.4)', fontSize: 10 }} />
                <YAxis tick={{ fill: 'rgba(255,255,255,0.4)', fontSize: 11 }} />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="revenue" fill="#7c3aed" radius={[4, 4, 0, 0]} name="Revenue (₹K)">
                  {cityData.map((_: any, i: number) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      {/* Charts Row 2 */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Spend Distribution */}
        <div className="glass p-5 rounded-2xl" style={{ border: '1px solid rgba(255,255,255,0.06)' }}>
          <h3 className="font-semibold text-sm mb-4" style={{ color: 'rgba(255,255,255,0.8)' }}>Spend Distribution</h3>
          {isLoading ? <div className="shimmer h-48 rounded-xl" /> : (
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie data={spendDist} dataKey="customers" nameKey="range" cx="50%" cy="50%" outerRadius={70} strokeWidth={0}>
                  {spendDist.map((_: any, i: number) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
                <Legend formatter={(v) => <span style={{ color: 'rgba(255,255,255,0.5)', fontSize: 11 }}>{v}</span>} />
              </PieChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* Recent Campaigns */}
        <div className="glass p-5 rounded-2xl lg:col-span-2" style={{ border: '1px solid rgba(255,255,255,0.06)' }}>
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-sm" style={{ color: 'rgba(255,255,255,0.8)' }}>Recent Campaigns</h3>
            <button onClick={() => navigate('/campaigns')} className="flex items-center gap-1 text-xs hover:opacity-80 transition-opacity" style={{ color: '#a78bfa' }}>
              View All <ExternalLink size={11} />
            </button>
          </div>
          <div className="space-y-3">
            {isLoading
              ? Array(4).fill(0).map((_, i) => <div key={i} className="shimmer h-12 rounded-xl" />)
              : (data?.recentCampaigns || []).map((c: any) => (
                <div key={c._id} className="flex items-center gap-3 p-3 rounded-xl cursor-pointer transition-colors hover:bg-white/5"
                  style={{ background: 'rgba(255,255,255,0.03)' }}
                  onClick={() => navigate(`/campaigns/${c._id}`)}>
                  <span className="text-xl">{channelIcon(c.channel)}</span>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium truncate" style={{ color: 'rgba(255,255,255,0.85)' }}>{c.name}</div>
                    <div className="text-xs" style={{ color: 'rgba(255,255,255,0.4)' }}>{c.audienceSize} recipients · {timeAgo(c.createdAt)}</div>
                  </div>
                  <span className={`text-xs px-2 py-1 rounded-full font-medium ${statusColor(c.status)}`}>{c.status}</span>
                  <div className="text-xs text-right" style={{ color: 'rgba(255,255,255,0.5)' }}>
                    <div>{c.stats?.delivered || 0} delivered</div>
                    <div style={{ color: '#10b981' }}>{formatCurrency(c.stats?.revenue || 0)}</div>
                  </div>
                </div>
              ))}
          </div>
        </div>
      </div>
    </div>
  )
}
