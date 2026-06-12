import React, { createContext, useContext, useState } from 'react'
import api from '../lib/api'

interface User {
  id: string
  name: string
  email: string
  role: string
  company: string
}

interface AuthContextType {
  user: User | null
  token: string | null
  login: (email: string, password: string) => Promise<void>
  register: (name: string, email: string, password: string, company?: string) => Promise<void>
  logout: () => void
  isLoading: boolean
}

const AuthContext = createContext<AuthContextType | null>(null)

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(() => {
    const stored = localStorage.getItem('xeno_user')
    return stored ? JSON.parse(stored) : null
  })
  const [token, setToken] = useState<string | null>(() => localStorage.getItem('xeno_token'))
  const [isLoading, setIsLoading] = useState(false)

  const login = async (email: string, password: string) => {
    setIsLoading(true)
    try {
      const { data } = await api.post('/auth/login', { email, password })
      setUser(data.user)
      setToken(data.token)
      localStorage.setItem('xeno_token', data.token)
      localStorage.setItem('xeno_user', JSON.stringify(data.user))
    } finally {
      setIsLoading(false)
    }
  }

  const register = async (name: string, email: string, password: string, company?: string) => {
    setIsLoading(true)
    try {
      const { data } = await api.post('/auth/register', { name, email, password, company })
      setUser(data.user)
      setToken(data.token)
      localStorage.setItem('xeno_token', data.token)
      localStorage.setItem('xeno_user', JSON.stringify(data.user))
    } finally {
      setIsLoading(false)
    }
  }

  const logout = () => {
    setUser(null)
    setToken(null)
    localStorage.removeItem('xeno_token')
    localStorage.removeItem('xeno_user')
  }

  return (
    <AuthContext.Provider value={{ user, token, login, register, logout, isLoading }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be inside AuthProvider')
  return ctx
}
