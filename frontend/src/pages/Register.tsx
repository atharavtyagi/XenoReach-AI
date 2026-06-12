import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Zap, User, Mail, Lock, Building2, Loader2 } from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'
import toast from 'react-hot-toast'

const inputStyle: React.CSSProperties = {
  width: '100%',
  borderRadius: 12,
  padding: '12px 16px 12px 38px',
  fontSize: 14,
  background: 'rgba(255,255,255,0.05)',
  border: '1px solid rgba(255,255,255,0.12)',
  color: 'rgba(255,255,255,0.9)',
  outline: 'none',
  boxSizing: 'border-box',
  fontFamily: 'Inter, sans-serif',
}

export default function RegisterPage() {
  const [form, setForm] = useState({ name: '', email: '', password: '', company: '' })
  const { register, isLoading } = useAuth()
  const navigate = useNavigate()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      await register(form.name, form.email, form.password, form.company)
      toast.success('Account created! Welcome to XenoReach AI 🚀')
      navigate('/dashboard')
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Registration failed')
    }
  }

  const update = (k: string, v: string) => setForm(f => ({ ...f, [k]: v }))

  const fields = [
    { key: 'name', label: 'Full Name', icon: User, type: 'text', placeholder: 'Arjun Sharma' },
    { key: 'email', label: 'Email', icon: Mail, type: 'email', placeholder: 'you@company.com' },
    { key: 'company', label: 'Company (optional)', icon: Building2, type: 'text', placeholder: 'Your Retail Brand' },
    { key: 'password', label: 'Password', icon: Lock, type: 'password', placeholder: 'Min 6 characters' },
  ]

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16, background: 'hsl(222,47%,3%)', position: 'relative' }}>
      <div style={{ position: 'fixed', inset: 0, overflow: 'hidden', pointerEvents: 'none' }}>
        <div style={{ position: 'absolute', top: 0, right: 0, width: 384, height: 384, opacity: 0.2, background: 'radial-gradient(circle, #7c3aed, transparent 70%)', filter: 'blur(60px)' }} />
        <div style={{ position: 'absolute', bottom: 0, left: 0, width: 384, height: 384, opacity: 0.15, background: 'radial-gradient(circle, #c026d3, transparent 70%)', filter: 'blur(60px)' }} />
      </div>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} style={{ width: '100%', maxWidth: 440, position: 'relative', zIndex: 10 }}>
        <div style={{ padding: 40, borderRadius: 20, background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(124,58,237,0.2)', backdropFilter: 'blur(20px)' }}>
          <div style={{ textAlign: 'center', marginBottom: 32 }}>
            <div style={{ width: 56, height: 56, borderRadius: 16, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px', background: 'linear-gradient(135deg, #7c3aed, #c026d3)' }}>
              <Zap size={26} color="white" />
            </div>
            <h1 style={{ fontSize: 24, fontWeight: 800, background: 'linear-gradient(135deg, #a78bfa, #e879f9)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>Create Account</h1>
            <p style={{ marginTop: 4, fontSize: 14, color: 'rgba(255,255,255,0.45)' }}>Start your AI CRM journey</p>
          </div>

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {fields.map(({ key, label, icon: Icon, type, placeholder }) => (
              <div key={key}>
                <label style={{ display: 'block', fontSize: 12, fontWeight: 600, marginBottom: 8, color: 'rgba(255,255,255,0.6)' }}>{label}</label>
                <div style={{ position: 'relative' }}>
                  <Icon size={15} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'rgba(255,255,255,0.3)', pointerEvents: 'none' }} />
                  <input
                    type={type}
                    value={form[key as keyof typeof form]}
                    onChange={e => update(key, e.target.value)}
                    placeholder={placeholder}
                    required={key !== 'company'}
                    style={inputStyle}
                    onFocus={e => { e.target.style.borderColor = 'rgba(124,58,237,0.5)'; e.target.style.boxShadow = '0 0 0 3px rgba(124,58,237,0.1)' }}
                    onBlur={e => { e.target.style.borderColor = 'rgba(255,255,255,0.12)'; e.target.style.boxShadow = 'none' }}
                  />
                </div>
              </div>
            ))}

            <button
              type="submit"
              disabled={isLoading}
              style={{ marginTop: 8, width: '100%', padding: '14px', borderRadius: 12, fontWeight: 700, fontSize: 15, color: 'white', border: 'none', cursor: isLoading ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, background: isLoading ? 'rgba(124,58,237,0.5)' : 'linear-gradient(135deg, #7c3aed, #c026d3)', boxSizing: 'border-box' }}
            >
              {isLoading ? <Loader2 size={18} style={{ animation: 'spin 1s linear infinite' }} /> : null}
              {isLoading ? 'Creating...' : 'Create Account'}
            </button>
          </form>

          <p style={{ marginTop: 24, textAlign: 'center', fontSize: 14, color: 'rgba(255,255,255,0.4)' }}>
            Already have an account?{' '}
            <Link to="/login" style={{ fontWeight: 600, color: '#a78bfa', textDecoration: 'none' }}>Sign in</Link>
          </p>
        </div>
      </motion.div>
    </div>
  )
}
