import { useState, useRef, useEffect } from 'react'
import { useMutation } from '@tanstack/react-query'
import { motion, AnimatePresence } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import {
  Bot, Send, User, Users, BarChart3,
  Loader2, Trash2, Plus,
} from 'lucide-react'
import api from '../lib/api'

interface Message {
  role: 'user' | 'assistant'
  content: string
  actions?: Array<{ type: string; label: string; icon: string }>
  timestamp: Date
}

const STARTER_PROMPTS = [
  { icon: '💤', text: 'Launch a campaign for inactive shoppers' },
  { icon: '💎', text: 'Find high-value customers likely to churn' },
  { icon: '🚀', text: 'Suggest a campaign for our VIP segment' },
  { icon: '📊', text: 'Analyze our best performing customer segments' },
  { icon: '🎯', text: 'Create a win-back strategy for 90-day inactive customers' },
  { icon: '🛍️', text: 'What channels work best for premium customers?' },
]

const ACTION_ICONS: Record<string, React.FC<any>> = {
  create_segment: Users,
  create_campaign: Send,
  view_analytics: BarChart3,
}

const sessionId = `session_${Date.now()}`

export default function Copilot() {
  const navigate = useNavigate()
  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'assistant',
      content: `## Welcome to XenoReach AI Copilot! 🤖\n\nI'm your AI marketing assistant powered by **Google Gemini**. I can help you:\n\n- 🎯 **Create customer segments** from natural language\n- 📧 **Generate personalized campaigns** with AI\n- 📊 **Analyze performance** and find opportunities\n- 💡 **Recommend strategies** to grow your retail brand\n\nTry asking me something like: *"Launch a win-back campaign for inactive premium customers in Mumbai"*`,
      timestamp: new Date(),
    },
  ])
  const [input, setInput] = useState('')
  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const chatMutation = useMutation({
    mutationFn: (message: string) => api.post('/copilot/chat', { message, sessionId }).then(r => r.data),
    onSuccess: (data) => {
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: data.response,
        actions: data.actions,
        timestamp: new Date(),
      }])
    },
    onError: () => {
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: "I'm having trouble connecting to Gemini API. Please check your API key in the backend `.env` file.",
        timestamp: new Date(),
      }])
    },
  })

  const sendMessage = (text: string) => {
    if (!text.trim() || chatMutation.isPending) return
    setMessages(prev => [...prev, { role: 'user', content: text, timestamp: new Date() }])
    setInput('')
    chatMutation.mutate(text)
  }

  const handleAction = (action: { type: string }) => {
    if (action.type === 'create_segment') navigate('/segments')
    else if (action.type === 'create_campaign') navigate('/campaigns')
    else if (action.type === 'view_analytics') navigate('/analytics')
  }

  const clearChat = () => {
    setMessages([{
      role: 'assistant',
      content: 'Chat cleared! How can I help you today?',
      timestamp: new Date(),
    }])
    api.delete(`/copilot/session/${sessionId}`).catch(() => {})
  }

  const formatMarkdown = (text: string) => {
    return text
      .replace(/\*\*(.*?)\*\*/g, '<strong style="color:rgba(255,255,255,0.95)">$1</strong>')
      .replace(/## (.*?)(?:\n|$)/g, '<h3 style="font-size:15px;font-weight:700;color:rgba(255,255,255,0.9);margin-bottom:8px;margin-top:12px">$1</h3>')
      .replace(/- (.*?)(?:\n|$)/g, '<div style="display:flex;gap:8px;margin-bottom:4px"><span style="color:#a78bfa">•</span><span>$1</span></div>')
      .replace(/\*(.*?)\*/g, '<em style="color:rgba(255,255,255,0.65)">$1</em>')
      .replace(/\n\n/g, '<br/>')
      .replace(/\n/g, '<br/>')
  }

  return (
    <div className="flex flex-col h-full" style={{ height: 'calc(100vh - 73px)' }}>
      {/* Header */}
      <div className="flex items-center justify-between p-5 border-b" style={{ borderColor: 'rgba(255,255,255,0.06)' }}>
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center"
            style={{ background: 'linear-gradient(135deg, rgba(124,58,237,0.3), rgba(192,38,211,0.3))', border: '1px solid rgba(124,58,237,0.4)' }}>
            <Bot size={20} style={{ color: '#a78bfa' }} />
          </div>
          <div>
            <h1 className="font-bold text-base" style={{ color: 'rgba(255,255,255,0.95)' }}>AI Copilot</h1>
            <div className="flex items-center gap-1.5 text-xs">
              <div className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
              <span style={{ color: 'rgba(255,255,255,0.4)' }}>Gemini 1.5 Flash · Online</span>
            </div>
          </div>
        </div>
        <button onClick={clearChat} className="flex items-center gap-1.5 p-2 rounded-lg text-xs hover:bg-white/5 transition-colors"
          style={{ color: 'rgba(255,255,255,0.4)' }}>
          <Trash2 size={13} /> Clear
        </button>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-5 space-y-4">
        {/* Starter prompts - show only when 1 message */}
        {messages.length === 1 && (
          <div className="grid grid-cols-2 md:grid-cols-3 gap-2 mb-4">
            {STARTER_PROMPTS.map(({ icon, text }) => (
              <button key={text} onClick={() => sendMessage(text)}
                className="text-left p-3 rounded-xl text-xs transition-all hover:border-purple-500/40"
                style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', color: 'rgba(255,255,255,0.6)' }}>
                <span className="text-base mr-2">{icon}</span>{text}
              </button>
            ))}
          </div>
        )}

        <AnimatePresence>
          {messages.map((msg, i) => (
            <motion.div key={i} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
              className={`flex items-start gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
              {/* Avatar */}
              <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                msg.role === 'assistant'
                  ? 'bg-gradient-to-br from-violet-600 to-fuchsia-600'
                  : 'bg-gradient-to-br from-violet-800 to-fuchsia-800'
              }`}>
                {msg.role === 'assistant' ? <Bot size={14} className="text-white" /> : <User size={14} className="text-white" />}
              </div>

              <div className={`flex-1 max-w-[80%] ${msg.role === 'user' ? 'items-end' : 'items-start'} flex flex-col gap-2`}>
                <div className={msg.role === 'assistant' ? 'chat-bubble-ai p-4' : 'chat-bubble-user p-3'}
                  style={{ fontSize: 13, lineHeight: 1.6, color: 'rgba(255,255,255,0.85)' }}>
                  {msg.role === 'assistant' ? (
                    <div dangerouslySetInnerHTML={{ __html: formatMarkdown(msg.content) }} />
                  ) : (
                    <span>{msg.content}</span>
                  )}
                </div>

                {/* Action buttons */}
                {msg.actions && msg.actions.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {msg.actions.map((action) => {
                      const Icon = ACTION_ICONS[action.type] || Plus
                      return (
                        <button key={action.type} onClick={() => handleAction(action)}
                          className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-all hover:opacity-80"
                          style={{ background: 'rgba(124,58,237,0.2)', border: '1px solid rgba(124,58,237,0.3)', color: '#a78bfa' }}>
                          <Icon size={11} /> {action.label}
                        </button>
                      )
                    })}
                  </div>
                )}

                <div className="text-[10px]" style={{ color: 'rgba(255,255,255,0.25)' }}>
                  {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>

        {/* Typing indicator */}
        {chatMutation.isPending && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-full flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #7c3aed, #c026d3)' }}>
              <Bot size={14} className="text-white" />
            </div>
            <div className="chat-bubble-ai p-4 flex items-center gap-2">
              <Loader2 size={14} className="animate-spin" style={{ color: '#a78bfa' }} />
              <span className="text-xs" style={{ color: 'rgba(255,255,255,0.5)' }}>Gemini is thinking...</span>
            </div>
          </motion.div>
        )}

        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div className="p-4 border-t" style={{ borderColor: 'rgba(255,255,255,0.06)' }}>
        <div className="flex items-end gap-3">
          <div className="flex-1 relative">
            <textarea
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(input) } }}
              placeholder="Ask the AI Copilot anything... (Press Enter to send)"
              className="w-full rounded-2xl py-3 px-4 text-sm resize-none"
              rows={1}
              style={{ minHeight: 48, maxHeight: 120 }}
            />
          </div>
          <button
            onClick={() => sendMessage(input)}
            disabled={!input.trim() || chatMutation.isPending}
            className="btn-gradient w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0 disabled:opacity-50"
          >
            <Send size={16} />
          </button>
        </div>
        <div className="text-center text-xs mt-2" style={{ color: 'rgba(255,255,255,0.2)' }}>
          Powered by Google Gemini · Shift+Enter for new line
        </div>
      </div>
    </div>
  )
}
