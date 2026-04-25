'use client'

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react'

interface DemoUser {
  id: string
  email: string
  name: string
}

interface AuthContextType {
  user: DemoUser | null
  isLoading: boolean
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>
  register: (name: string, email: string, password: string) => Promise<{ success: boolean; error?: string }>
  logout: () => void
}

const AuthContext = createContext<AuthContextType | null>(null)

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within DemoAuthProvider')
  return ctx
}

const STORAGE_KEY = 'golden_hour_demo_users'
const SESSION_KEY = 'golden_hour_demo_session'

function getStoredUsers(): Record<string, { name: string; email: string; password: string }> {
  if (typeof window === 'undefined') return {}
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}')
  } catch { return {} }
}

function storeUsers(users: Record<string, { name: string; email: string; password: string }>) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(users))
}

export function DemoAuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<DemoUser | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const session = localStorage.getItem(SESSION_KEY)
    if (session) {
      try {
        setUser(JSON.parse(session))
      } catch { /* ignore */ }
    }
    setIsLoading(false)
  }, [])

  const login = useCallback(async (email: string, password: string): Promise<{ success: boolean; error?: string }> => {
    const users = getStoredUsers()
    const entry = users[email.toLowerCase()]
    if (!entry) {
      return { success: false, error: 'No account found with this email. Please register first.' }
    }
    if (entry.password !== password) {
      return { success: false, error: 'Incorrect password. Please try again.' }
    }
    const u: DemoUser = { id: email.toLowerCase().replace(/[^a-z0-9]/g, ''), email: entry.email, name: entry.name }
    setUser(u)
    localStorage.setItem(SESSION_KEY, JSON.stringify(u))
    return { success: true }
  }, [])

  const register = useCallback(async (name: string, email: string, password: string): Promise<{ success: boolean; error?: string }> => {
    const users = getStoredUsers()
    const key = email.toLowerCase()
    if (users[key]) {
      return { success: false, error: 'An account with this email already exists. Please login.' }
    }
    users[key] = { name, email, password }
    storeUsers(users)
    const u: DemoUser = { id: key.replace(/[^a-z0-9]/g, ''), email, name }
    setUser(u)
    localStorage.setItem(SESSION_KEY, JSON.stringify(u))
    return { success: true }
  }, [])

  const logout = useCallback(() => {
    setUser(null)
    localStorage.removeItem(SESSION_KEY)
  }, [])

  return (
    <AuthContext.Provider value={{ user, isLoading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  )
}
