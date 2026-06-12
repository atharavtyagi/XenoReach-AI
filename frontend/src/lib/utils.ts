import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export const formatCurrency = (amount: number) =>
  new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(amount)

export const formatNumber = (n: number) =>
  new Intl.NumberFormat('en-IN').format(n)

export const formatDate = (date: string | Date) =>
  new Date(date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })

export const timeAgo = (date: string | Date) => {
  const diff = Date.now() - new Date(date).getTime()
  const days = Math.floor(diff / 86400000)
  if (days === 0) return 'Today'
  if (days === 1) return 'Yesterday'
  if (days < 30) return `${days}d ago`
  if (days < 365) return `${Math.floor(days / 30)}mo ago`
  return `${Math.floor(days / 365)}y ago`
}

export const getInitials = (name: string) =>
  name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)

export const statusColor = (status: string) => {
  const map: Record<string, string> = {
    completed: 'badge-completed',
    running: 'badge-running',
    draft: 'badge-draft',
    failed: 'badge-failed',
    delivered: 'badge-delivered',
  }
  return map[status] || 'badge-draft'
}

export const channelIcon = (channel: string) => {
  const map: Record<string, string> = {
    Email: '✉️', SMS: '💬', WhatsApp: '📱', Push: '🔔', 'Multi-Channel': '📡',
  }
  return map[channel] || '📧'
}

export const sleep = (ms: number) => new Promise(r => setTimeout(r, ms))
