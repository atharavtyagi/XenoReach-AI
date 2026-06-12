import { useState } from 'react'
import { NavLink, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  LayoutDashboard, Users, Tag, Send, Bot, BarChart3,
  Plug, Code2, LogOut, Menu, X, Zap, Bell, ChevronDown,
  Sparkles, Shield, History, CheckCircle, Star, Brain,
  Wand2, MessageCircle, GitBranch, Target
} from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'
import { getInitials } from '../lib/utils'

interface NavItem { to: string; icon: React.FC<any>; label: string; badge?: string }
interface NavGroup { label: string; items: NavItem[] }

const NAV_GROUPS: NavGroup[] = [
  {
    label: 'Core CRM',
    items: [
      { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
      { to: '/customers', icon: Users, label: 'Customers' },
      { to: '/segments', icon: Tag, label: 'AI Segments' },
      { to: '/campaigns', icon: Send, label: 'Campaigns' },
      { to: '/analytics', icon: BarChart3, label: 'Analytics' },
    ],
  },
  {
    label: 'AI Features',
    items: [
      { to: '/copilot', icon: Bot, label: 'AI Copilot', badge: 'AI' },
      { to: '/executive-insights', icon: Brain, label: 'Exec Insights', badge: 'AI' },
      { to: '/solution-recommendations', icon: Wand2, label: 'Solution AI', badge: 'AI' },
      { to: '/implementation-assistant', icon: MessageCircle, label: 'FDE Assistant', badge: 'AI' },
    ],
  },
  {
    label: 'Enterprise Tools',
    items: [
      { to: '/integrations', icon: Plug, label: 'Integration Hub' },
      { to: '/workflow-builder', icon: GitBranch, label: 'Workflow Builder' },
      { to: '/data-quality', icon: Shield, label: 'Data Quality' },
      { to: '/audit-center', icon: History, label: 'Audit Center' },
    ],
  },
  {
    label: 'FDE Platform',
    items: [
      { to: '/deployment-readiness', icon: CheckCircle, label: 'Deployment Ready' },
      { to: '/implementation-tracker', icon: Target, label: 'Impl. Tracker' },
      { to: '/customer-success', icon: Star, label: 'Case Studies' },
      { to: '/architecture', icon: Code2, label: 'Architecture' },
    ],
  },
]

interface LayoutProps {
  children: React.ReactNode
}

export default function Layout({ children }: LayoutProps) {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [userMenuOpen, setUserMenuOpen] = useState(false)
  const [notifOpen, setNotifOpen] = useState(false)

  const NOTIFICATIONS = [
    { icon: '📊', text: 'Campaign \'Summer Sale\' delivered to 1,240 customers', time: '2m ago', color: '#10b981' },
    { icon: '🎯', text: 'New AI segment \'High-Value VIPs\' created with 342 customers', time: '15m ago', color: '#a78bfa' },
    { icon: '⚠️', text: 'Data quality score dropped to 87% — 23 records need attention', time: '1h ago', color: '#f59e0b' },
  ]

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  return (
    <div style={{ display: 'flex', height: '100vh', overflow: 'hidden', background: 'hsl(222,47%,4%)' }}>
      {/* Sidebar */}
      <motion.aside
        animate={{ width: sidebarOpen ? 260 : 0, opacity: sidebarOpen ? 1 : 0 }}
        transition={{ duration: 0.3, ease: 'easeInOut' }}
        style={{
          flexShrink: 0,
          overflow: 'hidden',
          position: 'relative',
          zIndex: 30,
          background: 'rgba(10, 8, 20, 0.97)',
          borderRight: '1px solid rgba(255,255,255,0.06)',
        }}
      >
        <div style={{ display: 'flex', flexDirection: 'column', height: '100%', width: 260 }}>
          {/* Logo */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '20px 20px', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
            <div style={{ width: 36, height: 36, borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'linear-gradient(135deg, #7c3aed, #c026d3)', flexShrink: 0 }}>
              <Zap size={18} color="white" />
            </div>
            <div>
              <div style={{ fontWeight: 800, fontSize: 15, background: 'linear-gradient(135deg, #a78bfa, #e879f9)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>XenoReach</div>
              <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.35)' }}>AI CRM Platform</div>
            </div>
          </div>

          {/* Nav */}
          <nav style={{ flex: 1, padding: '10px 10px', overflowY: 'auto' }}>
            {NAV_GROUPS.map((group) => (
              <div key={group.label} style={{ marginBottom: 16 }}>
                <div style={{ padding: '4px 10px 6px', fontSize: 9, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.12em', color: 'rgba(255,255,255,0.22)' }}>
                  {group.label}
                </div>
                {group.items.map(({ to, icon: Icon, label, badge }) => (
                  <NavLink
                    key={to}
                    to={to}
                    style={({ isActive }) => ({
                      display: 'flex',
                      alignItems: 'center',
                      gap: 9,
                      padding: '8px 10px',
                      borderRadius: 9,
                      marginBottom: 2,
                      fontSize: 13,
                      fontWeight: 500,
                      textDecoration: 'none',
                      transition: 'all 0.2s',
                      color: isActive ? '#a78bfa' : 'rgba(255,255,255,0.55)',
                      background: isActive
                        ? 'linear-gradient(135deg, rgba(124,58,237,0.25), rgba(192,38,211,0.15))'
                        : 'transparent',
                      border: isActive ? '1px solid rgba(124,58,237,0.3)' : '1px solid transparent',
                    })}
                    onMouseEnter={e => {
                      const el = e.currentTarget
                      if (!el.style.background.includes('linear-gradient')) {
                        el.style.background = 'rgba(124,58,237,0.08)'
                        el.style.color = 'rgba(255,255,255,0.85)'
                      }
                    }}
                    onMouseLeave={e => {
                      const el = e.currentTarget
                      if (!el.style.background.includes('linear-gradient')) {
                        el.style.background = 'transparent'
                        el.style.color = 'rgba(255,255,255,0.55)'
                      }
                    }}
                  >
                    <Icon size={15} />
                    <span style={{ flex: 1 }}>{label}</span>
                    {badge && (
                      <span style={{ fontSize: 8, fontWeight: 800, padding: '2px 5px', borderRadius: 999, background: 'linear-gradient(135deg, #7c3aed, #c026d3)', color: 'white', letterSpacing: '0.04em' }}>
                        {badge}
                      </span>
                    )}
                  </NavLink>
                ))}
              </div>
            ))}
          </nav>

          {/* User */}
          <div style={{ padding: 12, borderTop: '1px solid rgba(255,255,255,0.06)' }}>
            <div
              style={{ display: 'flex', alignItems: 'center', gap: 10, padding: 12, borderRadius: 12, cursor: 'pointer', background: 'rgba(255,255,255,0.03)', transition: 'background 0.2s' }}
              onClick={() => setUserMenuOpen(!userMenuOpen)}
              onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.06)' }}
              onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.03)' }}
            >
              <div style={{ width: 36, height: 36, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, fontWeight: 700, flexShrink: 0, background: 'linear-gradient(135deg, #7c3aed, #c026d3)', color: 'white' }}>
                {getInitials(user?.name || 'U')}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 13, fontWeight: 600, color: 'rgba(255,255,255,0.9)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{user?.name}</div>
                <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{user?.email}</div>
              </div>
              <ChevronDown size={14} style={{ color: 'rgba(255,255,255,0.4)' }} />
            </div>

            <AnimatePresence>
              {userMenuOpen && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  style={{ marginTop: 8, borderRadius: 12, overflow: 'hidden', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}
                >
                  <button
                    onClick={handleLogout}
                    style={{ display: 'flex', alignItems: 'center', gap: 8, width: '100%', padding: '12px 16px', fontSize: 14, color: '#f87171', background: 'none', border: 'none', cursor: 'pointer', textAlign: 'left' }}
                    onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = 'rgba(239,68,68,0.1)' }}
                    onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'none' }}
                  >
                    <LogOut size={15} /> Sign Out
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </motion.aside>

      {/* Main content */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0, overflow: 'hidden' }}>
        {/* Topbar */}
        <header style={{
          display: 'flex',
          alignItems: 'center',
          gap: 16,
          padding: '12px 24px',
          flexShrink: 0,
          background: 'rgba(10,8,20,0.9)',
          borderBottom: '1px solid rgba(255,255,255,0.06)',
          backdropFilter: 'blur(20px)',
        }}>
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            style={{ padding: 8, borderRadius: 8, background: 'none', border: 'none', cursor: 'pointer', color: 'rgba(255,255,255,0.5)', display: 'flex', alignItems: 'center' }}
            onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.05)' }}
            onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'none' }}
          >
            {sidebarOpen ? <X size={18} /> : <Menu size={18} />}
          </button>

          <div style={{ flex: 1 }} />

          {/* AI Badge */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '6px 12px', borderRadius: 999, fontSize: 12, fontWeight: 600, background: 'rgba(124,58,237,0.15)', border: '1px solid rgba(124,58,237,0.3)', color: '#a78bfa' }}>
            <Sparkles size={12} /> Gemini AI Active
          </div>

          {/* Notifications */}
          <div style={{ position: 'relative' }}>
            <button
              onClick={() => { setNotifOpen(!notifOpen); setUserMenuOpen(false) }}
              style={{ position: 'relative', padding: 8, borderRadius: 8, background: notifOpen ? 'rgba(255,255,255,0.05)' : 'none', border: 'none', cursor: 'pointer', color: 'rgba(255,255,255,0.5)', display: 'flex', alignItems: 'center' }}
              onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.05)' }}
              onMouseLeave={e => { if (!notifOpen) (e.currentTarget as HTMLElement).style.background = 'none' }}
            >
              <Bell size={18} />
              <span style={{ position: 'absolute', top: 6, right: 6, width: 7, height: 7, borderRadius: '50%', background: '#7c3aed' }} />
            </button>
            <AnimatePresence>
              {notifOpen && (
                <motion.div
                  initial={{ opacity: 0, y: -8, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -8, scale: 0.95 }}
                  style={{ position: 'absolute', top: '100%', right: 0, marginTop: 8, width: 340, borderRadius: 14, background: 'hsl(222,47%,8%)', border: '1px solid rgba(255,255,255,0.1)', boxShadow: '0 20px 60px rgba(0,0,0,0.5)', zIndex: 100, overflow: 'hidden' }}
                >
                  <div style={{ padding: '14px 18px', borderBottom: '1px solid rgba(255,255,255,0.06)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <span style={{ fontSize: 13, fontWeight: 700, color: 'rgba(255,255,255,0.9)' }}>Notifications</span>
                    <span style={{ fontSize: 11, padding: '2px 8px', borderRadius: 999, background: 'rgba(124,58,237,0.2)', color: '#a78bfa', fontWeight: 700 }}>3 new</span>
                  </div>
                  {NOTIFICATIONS.map((n, i) => (
                    <div key={i}
                      onClick={() => setNotifOpen(false)}
                      style={{ display: 'flex', gap: 12, padding: '14px 18px', borderBottom: '1px solid rgba(255,255,255,0.04)', cursor: 'pointer', transition: 'background 0.15s' }}
                      onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = 'rgba(124,58,237,0.06)' }}
                      onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'transparent' }}
                    >
                      <span style={{ fontSize: 18, flexShrink: 0, marginTop: 2 }}>{n.icon}</span>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.75)', lineHeight: 1.5, marginBottom: 4 }}>{n.text}</div>
                        <div style={{ fontSize: 11, color: n.color }}>{n.time}</div>
                      </div>
                    </div>
                  ))}
                  <div
                    onClick={() => { setNotifOpen(false); navigate('/audit-center') }}
                    style={{ padding: '12px 18px', textAlign: 'center', fontSize: 12, color: '#a78bfa', cursor: 'pointer', fontWeight: 600 }}
                    onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = 'rgba(124,58,237,0.06)' }}
                    onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'transparent' }}
                  >
                    View All in Audit Center →
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </header>

        {/* Page content */}
        <main style={{ flex: 1, overflowY: 'auto', background: 'hsl(222,47%,4%)' }}>
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            style={{ height: '100%' }}
          >
            {children}
          </motion.div>
        </main>
      </div>
    </div>
  )
}
