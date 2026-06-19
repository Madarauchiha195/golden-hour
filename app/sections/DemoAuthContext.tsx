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
  const [user, setUser] = useState<DemoUser | null>({
    id: 'demo-user-123',
    email: 'demo@hospital.com',
    name: 'Dr. Demo',
  })
  const [isLoading, setIsLoading] = useState(false)

  const login = useCallback(async (email: string, password: string): Promise<{ success: boolean; error?: string }> => {
    return { success: true }
  }, [])

  const register = useCallback(async (name: string, email: string, password: string): Promise<{ success: boolean; error?: string }> => {
    return { success: true }
  }, [])

  const logout = useCallback(() => {
    // Cannot logout in demo mode as auth screen is removed
  }, [])

  return (
    <AuthContext.Provider value={{ user, isLoading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  )
}
