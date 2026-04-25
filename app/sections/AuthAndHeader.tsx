'use client'

import React, { useState } from 'react'
import { useAuth } from './DemoAuthContext'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { FiActivity, FiShield, FiSettings, FiLogOut, FiUser } from 'react-icons/fi'

export function AuthScreen() {
  const [mode, setMode] = useState<'login' | 'register'>('login')
  const { login, register } = useAuth()

  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    if (mode === 'login') {
      if (!email || !password) { setError('Please fill in all fields.'); setLoading(false); return }
      const res = await login(email, password)
      if (!res.success) setError(res.error || 'Login failed.')
    } else {
      if (!name || !email || !password) { setError('Please fill in all fields.'); setLoading(false); return }
      if (password.length < 4) { setError('Password must be at least 4 characters.'); setLoading(false); return }
      const res = await register(name, email, password)
      if (!res.success) setError(res.error || 'Registration failed.')
    }
    setLoading(false)
  }

  const switchMode = () => {
    setMode(m => m === 'login' ? 'register' : 'login')
    setError('')
    setName('')
    setEmail('')
    setPassword('')
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <Card className="w-full max-w-md bg-card border-border">
        <CardHeader className="text-center pb-2">
          <div className="flex items-center justify-center gap-2 mb-2">
            <FiActivity className="w-7 h-7 text-primary" />
            <CardTitle className="text-xl font-semibold text-foreground font-sans">Golden Hour</CardTitle>
          </div>
          <p className="text-xs text-muted-foreground">Medical Emergency Coordination System</p>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <h3 className="text-sm font-medium text-foreground text-center">
              {mode === 'login' ? 'Sign In' : 'Create Account'}
            </h3>

            {mode === 'register' && (
              <div className="space-y-1.5">
                <Label htmlFor="name" className="text-xs text-muted-foreground">Full Name</Label>
                <Input
                  id="name"
                  type="text"
                  placeholder="Dr. John Doe"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  className="h-9 text-sm bg-input border-border text-foreground placeholder:text-muted-foreground"
                />
              </div>
            )}

            <div className="space-y-1.5">
              <Label htmlFor="email" className="text-xs text-muted-foreground">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="you@hospital.com"
                value={email}
                onChange={e => setEmail(e.target.value)}
                className="h-9 text-sm bg-input border-border text-foreground placeholder:text-muted-foreground"
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="password" className="text-xs text-muted-foreground">Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="Enter password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                className="h-9 text-sm bg-input border-border text-foreground placeholder:text-muted-foreground"
              />
            </div>

            {error && (
              <div className="p-2 bg-destructive/10 border border-destructive/30 rounded text-[11px] text-destructive">
                {error}
              </div>
            )}

            <Button type="submit" className="w-full h-9 text-sm" disabled={loading}>
              {loading ? (mode === 'login' ? 'Signing in...' : 'Creating account...') : (mode === 'login' ? 'Sign In' : 'Create Account')}
            </Button>

            <p className="text-center text-xs text-muted-foreground">
              {mode === 'login' ? "Don't have an account? " : 'Already have an account? '}
              <button type="button" onClick={switchMode} className="text-primary hover:underline font-medium">
                {mode === 'login' ? 'Register' : 'Sign In'}
              </button>
            </p>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}

interface HeaderProps {
  showAdmin: boolean
  onToggleAdmin: () => void
  activeView: 'dashboard' | 'admin'
}

export function Header({ showAdmin, onToggleAdmin, activeView }: HeaderProps) {
  const { user, logout } = useAuth()

  return (
    <header className="h-12 border-b border-border bg-card flex items-center justify-between px-4">
      <div className="flex items-center gap-3">
        <FiActivity className="w-5 h-5 text-primary" />
        <span className="text-sm font-semibold text-foreground tracking-tight font-sans">GOLDEN HOUR</span>
        <Badge variant="outline" className="text-[10px] px-1.5 py-0 border-primary/40 text-primary">v1.0</Badge>
      </div>
      <div className="flex items-center gap-2">
        <Button variant={activeView === 'dashboard' ? 'default' : 'ghost'} size="sm" className="h-7 text-xs" onClick={() => { if (activeView === 'admin') onToggleAdmin() }}>
          <FiShield className="w-3 h-3 mr-1" />Dashboard
        </Button>
        <Button variant={activeView === 'admin' ? 'default' : 'ghost'} size="sm" className="h-7 text-xs" onClick={() => { if (activeView !== 'admin') onToggleAdmin() }}>
          <FiSettings className="w-3 h-3 mr-1" />Admin
        </Button>
        {user && (
          <div className="flex items-center gap-2 ml-2 pl-2 border-l border-border">
            <div className="flex items-center gap-1.5">
              <FiUser className="w-3.5 h-3.5 text-muted-foreground" />
              <span className="text-xs text-muted-foreground">{user.name}</span>
            </div>
            <Button variant="ghost" size="sm" className="h-7 w-7 p-0 text-muted-foreground hover:text-destructive" onClick={logout} title="Logout">
              <FiLogOut className="w-3.5 h-3.5" />
            </Button>
          </div>
        )}
      </div>
    </header>
  )
}
