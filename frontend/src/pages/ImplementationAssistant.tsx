import { useState, useRef, useEffect } from 'react'
import { useQuery } from '@tanstack/react-query'
import { motion, AnimatePresence } from 'framer-motion'
import { Zap, Send, Loader2, Users, BarChart3, Bot, Sparkles, Brain, RefreshCw } from 'lucide-react'
import api from '../lib/api'
import toast from 'react-hot-toast'

interface Message {
  role: 'user' | 'assistant'
  content: string
  timestamp: Date
}

interface HistoryItem {
  role: 'user' | 'model'
  content: string
}

const SUGGESTED_QUESTIONS = [
  'How do I onboard customer data?',
  'Why are my campaigns underperforming?',
  'Which segment should I target first?',
  'How can I improve retention?',
  'What integrations am I missing?',
  'How do I set up automated workflows?',
]

function renderMarkdown(text: string): React.ReactNode {
  const lines = text.split('\n')
  return lines.map((line, i) => {
    if (line.startsWith('## ')) return <div key={i} style={{ fontSize: 16, fontWeight: 700, color: 'rgba(255,255,255,0.92)', marginTop: 16, marginBottom: 8 }}>{line.slice(3)}</div>
    if (line.startsWith('**') && line.endsWith('**')) return <div key={i} style={{ fontWeight: 700, color: 'rgba(255,255,255,0.85)', marginBottom: 4 }}>{line.slice(2, -2)}</div>
    if (line.startsWith('- ') || line.startsWith('* ')) return <div key={i} style={{ display: 'flex', gap: 8, color: 'rgba(255,255,255,0.65)', fontSize: 13, marginBottom: 4, paddingLeft: 8 }}><span style={{ color: '#a78bfa', flexShrink: 0 }}>•</span><span dangerouslySetInnerHTML={{ __html: line.slice(2).replace(/\*\*(.*?)\*\*/g, '<strong style="color:rgba(255,255,255,0.85)">$1</strong>') }} /></div>
    if (line.match(/^\d+\./)) return <div key={i} style={{ color: 'rgba(255,255,255,0.65)', fontSize: 13, marginBottom: 4, paddingLeft: 8 }} dangerouslySetInnerHTML={{ __html: line.replace(/\*\*(.*?)\*\*/g, '<strong style="color:rgba(255,255,255,0.85)">$1</strong>') }} />
    if (line === '') return <div key={i} style={{ height: 8 }} />
    return <div key={i} style={{ color: 'rgba(255,255,255,0.65)', fontSize: 13, lineHeight: 1.6, marginBottom: 2 }} dangerouslySetInnerHTML={{ __html: line.replace(/\*\*(.*?)\*\*/g, '<strong style="color:rgba(255,255,255,0.85)">$1</strong>').replace(/`(.*?)`/g, '<code style="background:rgba(124,58,237,0.2);padding:2px 6px;border-radius:4px;font-size:12px;color:#a78bfa">$1</code>') }} />
  })
}

export default function ImplementationAssistant() {
  const [messages, setMessages] = useState<Message[]>([{
    role: 'assistant',
    content: `## FDE Implementation Assistant 🚀\n\nHi! I'm your dedicated Forward Deployed Engineer from XenoReach AI.\n\nI have full context of your platform and I'm here to help you get maximum value from your CRM implementation.\n\n**What I can help you with:**\n- Customer data onboarding strategies\n- Campaign optimization and troubleshooting\n- Segment targeting recommendations\n- Integration setup guidance\n- Workflow automation best practices\n\n**Try asking me something like:**\n- *"How do I onboard customer data?"*\n- *"Why are my campaigns underperforming?"*`,
    timestamp: new Date(),
  }])
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [history, setHistory] = useState<HistoryItem[]>([])
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const { data: metricsData } = useQuery({
    queryKey: ['fde-metrics'],
    queryFn: () => api.get('/insights').then(r => r.data.data?.metrics),
  })

  useEffect(() => { messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }) }, [messages, isLoading])

  const sendMessage = async (text: string) => {
    if (!text.trim() || isLoading) return
    const userMsg: Message = { role: 'user', content: text, timestamp: new Date() }
    setMessages(prev => [...prev, userMsg])
    setInput('')
    setIsLoading(true)

    try {
      const res = await api.post('/implementation-assistant/chat', { message: text, history, context: { customerCount, campaignCount, segmentCount, totalRevenue } })
      const { response, history: newHistory } = res.data.data
      setHistory(newHistory)
      setMessages(prev => [...prev, { role: 'assistant', content: response, timestamp: new Date() }])
    } catch {
      toast.error('Failed to get response. Please try again.')
      setMessages(prev => [...prev, { role: 'assistant', content: 'I encountered an error. Please try again.', timestamp: new Date() }])
    } finally {
      setIsLoading(false)
    }
  }

  const metrics = metricsData || {}
  const customerCount = metrics.customers?.total || 150
  const campaignCount = metrics.campaigns?.total || 5
  const segmentCount = metrics.segments?.total || 3
  const totalRevenue = metrics.revenue?.lifetime || 500000

  return (
    <div style={{ display: 'flex', height: '100%', background: 'hsl(222,47%,4%)' }}>

      {/* Left Sidebar */}
      <div style={{ width: 280, flexShrink: 0, borderRight: '1px solid rgba(255,255,255,0.06)', display: 'flex', flexDirection: 'column', padding: 20, overflowY: 'auto', background: 'rgba(10,8,20,0.6)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 24 }}>
          <div style={{ width: 36, height: 36, borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'linear-gradient(135deg,#7c3aed,#c026d3)' }}>
            <Bot size={18} color="white" />
          </div>
          <div>
            <div style={{ fontSize: 14, fontWeight: 800, color: 'rgba(255,255,255,0.9)' }}>FDE Assistant</div>
            <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.4)' }}>Forward Deployed Engineer</div>
          </div>
        </div>

        {/* Context cards */}
        <div style={{ marginBottom: 24 }}>
          <div style={{ fontSize: 10, fontWeight: 700, color: 'rgba(255,255,255,0.3)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 10 }}>Platform Context</div>
          {[
            { label: 'Customers', value: customerCount, icon: Users, color: '#3b82f6' },
            { label: 'Campaigns', value: campaignCount, icon: BarChart3, color: '#7c3aed' },
            { label: 'Segments', value: segmentCount, icon: Brain, color: '#10b981' },
            { label: 'Revenue', value: `₹${(totalRevenue / 100000).toFixed(1)}L`, icon: Zap, color: '#f59e0b' },
          ].map(({ label, value, icon: Icon, color }) => (
            <div key={label} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 12px', borderRadius: 8, background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)', marginBottom: 6 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <Icon size={13} style={{ color }} />
                <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.5)' }}>{label}</span>
              </div>
              <span style={{ fontSize: 13, fontWeight: 700, color }}>{value}</span>
            </div>
          ))}
        </div>

        {/* Suggested questions */}
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 10, fontWeight: 700, color: 'rgba(255,255,255,0.3)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 10 }}>Quick Questions</div>
          {SUGGESTED_QUESTIONS.map((q, i) => (
            <button key={i} onClick={() => sendMessage(q)}
              style={{ width: '100%', textAlign: 'left', padding: '8px 12px', borderRadius: 8, marginBottom: 6, fontSize: 12, color: 'rgba(255,255,255,0.55)', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)', cursor: 'pointer', lineHeight: 1.4, transition: 'all 0.2s' }}
              onMouseEnter={e => { (e.target as HTMLElement).style.background = 'rgba(124,58,237,0.1)'; (e.target as HTMLElement).style.color = '#a78bfa'; (e.target as HTMLElement).style.borderColor = 'rgba(124,58,237,0.25)' }}
              onMouseLeave={e => { (e.target as HTMLElement).style.background = 'rgba(255,255,255,0.03)'; (e.target as HTMLElement).style.color = 'rgba(255,255,255,0.55)'; (e.target as HTMLElement).style.borderColor = 'rgba(255,255,255,0.06)' }}
            >
              {q}
            </button>
          ))}
        </div>

        {/* Gemini badge */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '8px 12px', borderRadius: 8, background: 'rgba(124,58,237,0.1)', border: '1px solid rgba(124,58,237,0.2)' }}>
          <Sparkles size={12} color="#a78bfa" />
          <span style={{ fontSize: 11, color: '#a78bfa', fontWeight: 600 }}>Backed by Gemini AI</span>
        </div>
      </div>

      {/* Chat Area */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>
        {/* Header */}
        <div style={{ padding: '16px 24px', borderBottom: '1px solid rgba(255,255,255,0.06)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexShrink: 0 }}>
          <div>
            <h2 style={{ fontSize: 16, fontWeight: 700, color: 'rgba(255,255,255,0.9)', margin: 0 }}>Implementation Chat</h2>
            <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.4)', margin: 0 }}>Get actionable FDE guidance in real-time</p>
          </div>
          <button onClick={() => { setMessages([{ role: 'assistant', content: 'Chat cleared! How can I help you today?', timestamp: new Date() }]); setHistory([]) }}
            style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '7px 14px', borderRadius: 8, fontSize: 12, color: 'rgba(255,255,255,0.5)', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', cursor: 'pointer' }}>
            <RefreshCw size={12} /> Clear Chat
          </button>
        </div>

        {/* Messages */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '24px', display: 'flex', flexDirection: 'column', gap: 16 }}>
          <AnimatePresence initial={false}>
            {messages.map((msg, i) => (
              <motion.div key={i} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.25 }}
                style={{ display: 'flex', flexDirection: msg.role === 'user' ? 'row-reverse' : 'row', gap: 12, alignItems: 'flex-start' }}>
                {msg.role === 'assistant' && (
                  <div style={{ width: 32, height: 32, borderRadius: '50%', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'linear-gradient(135deg,#7c3aed,#c026d3)', marginTop: 4 }}>
                    <Bot size={15} color="white" />
                  </div>
                )}
                <div style={{ maxWidth: '78%' }}>
                  <div style={msg.role === 'assistant' ? {
                    padding: '14px 18px', borderRadius: '4px 16px 16px 16px',
                    background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)',
                    borderLeft: '3px solid #7c3aed',
                  } : {
                    padding: '12px 16px', borderRadius: '16px 4px 16px 16px',
                    background: 'linear-gradient(135deg,#7c3aed,#c026d3)',
                  }}>
                    {msg.role === 'assistant' ? renderMarkdown(msg.content) : (
                      <span style={{ fontSize: 14, color: 'white', lineHeight: 1.5 }}>{msg.content}</span>
                    )}
                  </div>
                  <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.25)', marginTop: 4, textAlign: msg.role === 'user' ? 'right' : 'left' }}>
                    {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>

          {/* Typing indicator */}
          {isLoading && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <div style={{ width: 32, height: 32, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'linear-gradient(135deg,#7c3aed,#c026d3)', flexShrink: 0 }}>
                <Bot size={15} color="white" />
              </div>
              <div style={{ padding: '14px 18px', borderRadius: '4px 16px 16px 16px', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', display: 'flex', gap: 4, alignItems: 'center' }}>
                {[0, 1, 2].map(i => (
                  <div key={i} style={{ width: 7, height: 7, borderRadius: '50%', background: '#7c3aed', animation: `bounce 1.2s ease-in-out ${i * 0.15}s infinite` }} />
                ))}
              </div>
            </motion.div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <div style={{ padding: '16px 24px', borderTop: '1px solid rgba(255,255,255,0.06)', flexShrink: 0 }}>
          <style>{`@keyframes bounce{0%,80%,100%{transform:scale(0.8);opacity:0.5}40%{transform:scale(1.2);opacity:1}} @keyframes spin{from{transform:rotate(0deg)}to{transform:rotate(360deg)}}`}</style>
          <form onSubmit={e => { e.preventDefault(); sendMessage(input) }}
            style={{ display: 'flex', gap: 12, alignItems: 'flex-end' }}>
            <input
              value={input} onChange={e => setInput(e.target.value)}
              placeholder="Ask your FDE anything about implementation..."
              style={{ flex: 1, padding: '12px 16px', borderRadius: 12, fontSize: 14, background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.12)', color: 'rgba(255,255,255,0.9)', outline: 'none', boxSizing: 'border-box' }}
              onFocus={e => { e.target.style.borderColor = 'rgba(124,58,237,0.5)'; e.target.style.boxShadow = '0 0 0 3px rgba(124,58,237,0.1)' }}
              onBlur={e => { e.target.style.borderColor = 'rgba(255,255,255,0.12)'; e.target.style.boxShadow = 'none' }}
            />
            <button type="submit" disabled={!input.trim() || isLoading}
              style={{ padding: '12px 20px', borderRadius: 12, background: 'linear-gradient(135deg,#7c3aed,#c026d3)', border: 'none', color: 'white', cursor: !input.trim() || isLoading ? 'not-allowed' : 'pointer', opacity: !input.trim() || isLoading ? 0.6 : 1, display: 'flex', alignItems: 'center', gap: 8, fontWeight: 700, fontSize: 13, flexShrink: 0 }}>
              {isLoading ? <Loader2 size={16} style={{ animation: 'spin 1s linear infinite' }} /> : <Send size={16} />}
              Send
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}
