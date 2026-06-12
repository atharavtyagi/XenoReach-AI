import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import { Zap, Users, Target, Send, BarChart3, Bot, Shield, ArrowRight, Sparkles, TrendingUp, Globe } from 'lucide-react'

const FEATURES = [
  { icon: Users, title: 'Customer 360°', desc: 'Complete customer profiles with AI-generated behavioral insights and churn predictions', color: '#7c3aed' },
  { icon: Target, title: 'AI Segment Builder', desc: 'Natural language to MongoDB query — "Show VIPs inactive for 90 days"', color: '#c026d3' },
  { icon: Bot, title: 'AI Copilot', desc: 'Gemini-powered chat assistant that drafts campaigns and finds opportunities', color: '#2563eb' },
  { icon: Send, title: 'Campaign Engine', desc: 'Multi-channel campaign launch with real-time delivery simulation', color: '#059669' },
  { icon: BarChart3, title: 'Live Analytics', desc: 'Funnel analytics, revenue attribution, and conversion tracking', color: '#d97706' },
  { icon: Globe, title: 'Integration Hub', desc: 'Simulated Shopify, POS, ERP, and WhatsApp Business integrations', color: '#dc2626' },
]

const STATS = [
  { value: '200+', label: 'Sample Customers' },
  { value: '5', label: 'AI Features' },
  { value: '8', label: 'Integrations' },
  { value: '∞', label: 'Possibilities' },
]

export default function LandingPage() {
  return (
    <div style={{ minHeight: '100vh', overflowX: 'hidden', background: 'hsl(222,47%,3%)', position: 'relative' }}>
      {/* Background orbs */}
      <div style={{ position: 'fixed', inset: 0, overflow: 'hidden', pointerEvents: 'none', zIndex: 0 }}>
        <div style={{ position: 'absolute', top: -160, right: -160, width: 384, height: 384, borderRadius: '50%', opacity: 0.2, background: 'radial-gradient(circle, #7c3aed 0%, transparent 70%)', filter: 'blur(60px)' }} />
        <div style={{ position: 'absolute', bottom: -160, left: -160, width: 384, height: 384, borderRadius: '50%', opacity: 0.15, background: 'radial-gradient(circle, #c026d3 0%, transparent 70%)', filter: 'blur(60px)' }} />
      </div>

      {/* Nav */}
      <nav style={{ position: 'relative', zIndex: 10, display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '20px 40px', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{ width: 36, height: 36, borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'linear-gradient(135deg, #7c3aed, #c026d3)' }}>
            <Zap size={18} color="white" />
          </div>
          <span style={{ fontWeight: 800, fontSize: 20, background: 'linear-gradient(135deg, #a78bfa 0%, #e879f9 50%, #fb923c 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>XenoReach AI</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <Link to="/login" style={{ padding: '8px 16px', fontSize: 14, borderRadius: 8, color: 'rgba(255,255,255,0.7)', textDecoration: 'none', transition: 'background 0.2s' }}
            onMouseEnter={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.06)')}
            onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}>
            Sign In
          </Link>
          <Link to="/register" style={{ padding: '8px 20px', fontSize: 14, borderRadius: 8, fontWeight: 600, color: 'white', textDecoration: 'none', background: 'linear-gradient(135deg, #7c3aed, #c026d3)' }}>
            Get Started Free
          </Link>
        </div>
      </nav>

      {/* Hero */}
      <section style={{ position: 'relative', zIndex: 10, textAlign: 'center', padding: '96px 40px 60px' }}>
        <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7 }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '8px 16px', borderRadius: 999, marginBottom: 32, fontSize: 12, fontWeight: 600, background: 'rgba(124,58,237,0.15)', border: '1px solid rgba(124,58,237,0.3)', color: '#a78bfa' }}>
            <Sparkles size={12} /> Powered by Google Gemini AI
          </div>

          <h1 style={{ fontSize: 'clamp(40px, 7vw, 80px)', fontWeight: 900, lineHeight: 1.1, marginBottom: 24, letterSpacing: '-2px' }}>
            <span style={{ color: 'rgba(255,255,255,0.95)' }}>The AI-Native</span>
            <br />
            <span style={{ background: 'linear-gradient(135deg, #a78bfa 0%, #e879f9 50%, #fb923c 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>CRM for Retail Brands</span>
          </h1>

          <p style={{ fontSize: 18, maxWidth: 600, margin: '0 auto 40px', lineHeight: 1.7, color: 'rgba(255,255,255,0.55)' }}>
            Build AI-powered segments, generate personalized campaigns, and analyze performance
            — all in one premium platform. Built for modern retail marketers.
          </p>

          <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'center', gap: 16 }}>
            <Link to="/register" style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '14px 32px', borderRadius: 12, fontSize: 16, fontWeight: 700, color: 'white', textDecoration: 'none', background: 'linear-gradient(135deg, #7c3aed, #c026d3)', boxShadow: '0 0 30px rgba(124,58,237,0.4)' }}>
              Start Free Trial <ArrowRight size={18} />
            </Link>
            <Link to="/login" style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '14px 32px', borderRadius: 12, fontSize: 14, fontWeight: 500, color: 'rgba(255,255,255,0.7)', textDecoration: 'none', border: '1px solid rgba(255,255,255,0.15)' }}>
              Demo: demo@xenoreach.ai / demo123
            </Link>
          </div>
        </motion.div>

        {/* Stats */}
        <motion.div initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, delay: 0.3 }}
          style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 64, marginTop: 80, flexWrap: 'wrap' }}>
          {STATS.map(({ value, label }) => (
            <div key={label} style={{ textAlign: 'center' }}>
              <div style={{ fontSize: 32, fontWeight: 900, background: 'linear-gradient(135deg, #a78bfa, #e879f9)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>{value}</div>
              <div style={{ fontSize: 12, marginTop: 4, color: 'rgba(255,255,255,0.4)' }}>{label}</div>
            </div>
          ))}
        </motion.div>
      </section>

      {/* Features */}
      <section style={{ position: 'relative', zIndex: 10, padding: '80px 40px', maxWidth: 1200, margin: '0 auto' }}>
        <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} transition={{ duration: 0.6 }}>
          <h2 style={{ fontSize: 36, fontWeight: 800, textAlign: 'center', marginBottom: 16, color: 'rgba(255,255,255,0.9)' }}>
            Everything you need to grow
          </h2>
          <p style={{ textAlign: 'center', marginBottom: 64, color: 'rgba(255,255,255,0.45)', fontSize: 16 }}>
            A complete AI-native CRM stack built for retail brands
          </p>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 20 }}>
            {FEATURES.map(({ icon: Icon, title, desc, color }, i) => (
              <motion.div
                key={title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                style={{ padding: 24, borderRadius: 16, background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', backdropFilter: 'blur(20px)', transition: 'border-color 0.3s' }}
                onMouseEnter={e => { (e.currentTarget as HTMLElement).style.borderColor = `${color}40` }}
                onMouseLeave={e => { (e.currentTarget as HTMLElement).style.borderColor = 'rgba(255,255,255,0.08)' }}
              >
                <div style={{ width: 48, height: 48, borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 16, background: `${color}20`, border: `1px solid ${color}30` }}>
                  <Icon size={22} style={{ color }} />
                </div>
                <h3 style={{ fontWeight: 700, fontSize: 15, marginBottom: 8, color: 'rgba(255,255,255,0.9)' }}>{title}</h3>
                <p style={{ fontSize: 14, lineHeight: 1.6, color: 'rgba(255,255,255,0.45)' }}>{desc}</p>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </section>

      {/* CTA */}
      <section style={{ position: 'relative', zIndex: 10, padding: '60px 40px', textAlign: 'center' }}>
        <motion.div initial={{ opacity: 0, scale: 0.95 }} whileInView={{ opacity: 1, scale: 1 }}
          style={{ maxWidth: 600, margin: '0 auto', padding: '64px 48px', borderRadius: 24, background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(124,58,237,0.3)', backdropFilter: 'blur(20px)' }}>
          <TrendingUp size={40} style={{ margin: '0 auto 16px', color: '#a78bfa', display: 'block' }} />
          <h2 style={{ fontSize: 32, fontWeight: 800, marginBottom: 16, background: 'linear-gradient(135deg, #a78bfa, #e879f9)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
            Ready to supercharge your CRM?
          </h2>
          <p style={{ marginBottom: 32, color: 'rgba(255,255,255,0.5)', fontSize: 16 }}>
            Join forward-thinking retail brands using AI to grow revenue and retain customers.
          </p>
          <Link to="/register" style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '14px 32px', borderRadius: 12, fontWeight: 700, color: 'white', textDecoration: 'none', background: 'linear-gradient(135deg, #7c3aed, #c026d3)' }}>
            Get Started — It's Free <ArrowRight size={18} />
          </Link>
        </motion.div>
      </section>

      {/* Footer */}
      <footer style={{ position: 'relative', zIndex: 10, borderTop: '1px solid rgba(255,255,255,0.06)', padding: '32px 40px', textAlign: 'center', fontSize: 13, color: 'rgba(255,255,255,0.3)' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, marginBottom: 8 }}>
          <Shield size={14} /> XenoReach AI — Built for Forward Deployed Engineer Interview
        </div>
        <div>React + TypeScript + Vite + TailwindCSS + Node.js + MongoDB + Gemini API</div>
      </footer>
    </div>
  )
}
