import { useQuery } from '@tanstack/react-query'
import { motion } from 'framer-motion'
import {
  AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis,
} from 'recharts'
import { TrendingUp, Mail, MousePointer, Users, Send } from 'lucide-react'
import api from '../lib/api'
import { formatCurrency, formatNumber } from '../lib/utils'

const COLORS = ['#7c3aed', '#c026d3', '#2563eb', '#059669', '#d97706']

const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null
  return (
    <div className="glass p-3 rounded-xl text-xs" style={{ border: '1px solid rgba(124,58,237,0.3)' }}>
      <div className="font-semibold mb-1" style={{ color: 'rgba(255,255,255,0.8)' }}>{label}</div>
      {payload.map((p: any) => <div key={p.name} style={{ color: p.stroke || p.fill || '#a78bfa' }}>{p.name}: {p.value}</div>)}
    </div>
  )
}

export default function Analytics() {
  const { data, isLoading } = useQuery({
    queryKey: ['analytics-full'],
    queryFn: () => api.get('/analytics/overview').then(r => r.data.data),
    refetchInterval: 30000,
  })

  const { data: campaigns } = useQuery({
    queryKey: ['campaigns-analytics'],
    queryFn: () => api.get('/analytics/campaigns').then(r => r.data.data),
  })

  const kpis = data?.kpis || {}

  const radarData = [
    { metric: 'Delivery', value: kpis.deliveryRate || 0, fullMark: 100 },
    { metric: 'Open', value: kpis.openRate || 0, fullMark: 100 },
    { metric: 'Click', value: kpis.clickRate || 0, fullMark: 100 },
    { metric: 'Convert', value: kpis.conversionRate || 0, fullMark: 100 },
    { metric: 'Revenue', value: Math.min(100, (kpis.campaignRevenue / 10000) || 0), fullMark: 100 },
  ]

  const campaignPerf = (campaigns || []).slice(0, 8).map((c: any) => ({
    name: c.name.slice(0, 18) + (c.name.length > 18 ? '...' : ''),
    deliveryRate: c.deliveryRate,
    openRate: c.openRate,
    revenue: Math.round((c.stats?.revenue || 0) / 1000),
  }))

  const cityData = (data?.topCities || []).map((c: any) => ({
    city: c._id?.slice(0, 10),
    customers: c.count,
    revenue: Math.round(c.revenue / 1000),
  }))

  const growthData = (data?.customerGrowth || []).map((g: any) => ({
    month: g._id?.slice(0, 7),
    customers: g.count,
  }))

  return (
    <div className="p-6 space-y-5">
      <div>
        <h1 className="text-2xl font-bold" style={{ color: 'rgba(255,255,255,0.95)' }}>Analytics Center</h1>
        <p className="text-sm mt-1" style={{ color: 'rgba(255,255,255,0.4)' }}>Campaign performance & customer intelligence</p>
      </div>

      {/* KPI Row */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {[
          { icon: Users, label: 'Customers', value: formatNumber(kpis.totalCustomers || 0), color: '#7c3aed' },
          { icon: TrendingUp, label: 'Revenue', value: formatCurrency(kpis.totalRevenue || 0), color: '#10b981' },
          { icon: Send, label: 'Campaigns', value: kpis.totalCampaigns || 0, color: '#c026d3' },
          { icon: Mail, label: 'Delivery %', value: `${kpis.deliveryRate || 0}%`, color: '#2563eb' },
          { icon: Mail, label: 'Open %', value: `${kpis.openRate || 0}%`, color: '#d97706' },
          { icon: MousePointer, label: 'Click %', value: `${kpis.clickRate || 0}%`, color: '#f97316' },
        ].map(({ icon: Icon, label, value, color }) => (
          <div key={label} className="metric-card p-4 text-center">
            <Icon size={18} className="mx-auto mb-2" style={{ color }} />
            <div className="text-lg font-bold" style={{ color: 'rgba(255,255,255,0.9)' }}>{isLoading ? '—' : value}</div>
            <div className="text-xs mt-1" style={{ color: 'rgba(255,255,255,0.4)' }}>{label}</div>
          </div>
        ))}
      </div>

      {/* Charts Row 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Customer Growth */}
        <div className="glass p-5 rounded-2xl lg:col-span-2" style={{ border: '1px solid rgba(255,255,255,0.06)' }}>
          <h3 className="font-semibold text-sm mb-4" style={{ color: 'rgba(255,255,255,0.8)' }}>Customer Acquisition Trend</h3>
          {isLoading ? <div className="shimmer h-48 rounded-xl" /> : (
            <ResponsiveContainer width="100%" height={200}>
              <AreaChart data={growthData}>
                <defs>
                  <linearGradient id="grad1" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#7c3aed" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#7c3aed" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                <XAxis dataKey="month" tick={{ fill: 'rgba(255,255,255,0.4)', fontSize: 11 }} />
                <YAxis tick={{ fill: 'rgba(255,255,255,0.4)', fontSize: 11 }} />
                <Tooltip content={<CustomTooltip />} />
                <Area type="monotone" dataKey="customers" stroke="#7c3aed" fill="url(#grad1)" strokeWidth={2} name="New Customers" />
              </AreaChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* Radar */}
        <div className="glass p-5 rounded-2xl" style={{ border: '1px solid rgba(255,255,255,0.06)' }}>
          <h3 className="font-semibold text-sm mb-4" style={{ color: 'rgba(255,255,255,0.8)' }}>Channel Performance Score</h3>
          <ResponsiveContainer width="100%" height={200}>
            <RadarChart cx="50%" cy="50%" outerRadius={70} data={radarData}>
              <PolarGrid stroke="rgba(255,255,255,0.1)" />
              <PolarAngleAxis dataKey="metric" tick={{ fill: 'rgba(255,255,255,0.4)', fontSize: 11 }} />
              <PolarRadiusAxis angle={30} domain={[0, 100]} tick={{ fill: 'rgba(255,255,255,0.3)', fontSize: 9 }} />
              <Radar name="Score" dataKey="value" stroke="#7c3aed" fill="#7c3aed" fillOpacity={0.25} />
            </RadarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Campaign Performance */}
      <div className="glass p-5 rounded-2xl" style={{ border: '1px solid rgba(255,255,255,0.06)' }}>
        <h3 className="font-semibold text-sm mb-4" style={{ color: 'rgba(255,255,255,0.8)' }}>Campaign Performance Comparison</h3>
        {isLoading ? <div className="shimmer h-56 rounded-xl" /> : (
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={campaignPerf}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
              <XAxis dataKey="name" tick={{ fill: 'rgba(255,255,255,0.4)', fontSize: 10 }} />
              <YAxis tick={{ fill: 'rgba(255,255,255,0.4)', fontSize: 11 }} />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="deliveryRate" name="Delivery %" fill="#7c3aed" radius={[4, 4, 0, 0]} />
              <Bar dataKey="openRate" name="Open %" fill="#c026d3" radius={[4, 4, 0, 0]} />
              <Bar dataKey="revenue" name="Revenue (₹K)" fill="#10b981" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>

      {/* City breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <div className="glass p-5 rounded-2xl" style={{ border: '1px solid rgba(255,255,255,0.06)' }}>
          <h3 className="font-semibold text-sm mb-4" style={{ color: 'rgba(255,255,255,0.8)' }}>Top Cities by Revenue</h3>
          <div className="space-y-3">
            {(cityData || []).slice(0, 6).map((c: any, i: number) => (
              <div key={c.city} className="flex items-center gap-3">
                <span className="text-xs w-4 text-right" style={{ color: 'rgba(255,255,255,0.3)' }}>{i + 1}</span>
                <div className="flex-1">
                  <div className="flex justify-between text-xs mb-1">
                    <span style={{ color: 'rgba(255,255,255,0.7)' }}>{c.city}</span>
                    <span style={{ color: COLORS[i % COLORS.length] }}>₹{c.revenue}K</span>
                  </div>
                  <div className="h-2 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.05)' }}>
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${(c.revenue / (cityData[0]?.revenue || 1)) * 100}%` }}
                      transition={{ delay: i * 0.1 }}
                      className="h-full rounded-full"
                      style={{ background: COLORS[i % COLORS.length] }}
                    />
                  </div>
                </div>
                <span className="text-xs" style={{ color: 'rgba(255,255,255,0.4)' }}>{c.customers} customers</span>
              </div>
            ))}
          </div>
        </div>

        {/* Campaign table */}
        <div className="glass p-5 rounded-2xl" style={{ border: '1px solid rgba(255,255,255,0.06)' }}>
          <h3 className="font-semibold text-sm mb-4" style={{ color: 'rgba(255,255,255,0.8)' }}>All Campaign Rates</h3>
          <table className="data-table w-full text-xs">
            <thead>
              <tr>
                <th>Campaign</th>
                <th>Delivery</th>
                <th>Open</th>
                <th>Click</th>
                <th>Conv.</th>
              </tr>
            </thead>
            <tbody>
              {(campaigns || []).slice(0, 6).map((c: any) => (
                <tr key={c._id}>
                  <td style={{ color: 'rgba(255,255,255,0.7)' }}>{c.name.slice(0, 20)}{c.name.length > 20 ? '...' : ''}</td>
                  <td style={{ color: '#10b981' }}>{c.deliveryRate}%</td>
                  <td style={{ color: '#3b82f6' }}>{c.openRate}%</td>
                  <td style={{ color: '#8b5cf6' }}>{c.clickRate}%</td>
                  <td style={{ color: '#c026d3' }}>{c.conversionRate}%</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
