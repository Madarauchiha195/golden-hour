'use client'

import React, { useState } from 'react'
import { useAuth } from './DemoAuthContext'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Activity, Shield, Settings, LogOut, User } from 'lucide-react'


export function Header({ showAdmin, onToggleAdmin, activeView }: HeaderProps) {
  const { user, logout } = useAuth()

  return (
    <header className="h-12 border-b border-border bg-card flex items-center justify-between px-4">
      <div className="flex items-center gap-3">
        <Activity className="w-5 h-5 text-primary" />
        <span className="text-sm font-semibold text-foreground tracking-tight font-sans">GOLDEN HOUR</span>
        <Badge variant="outline" className="text-[10px] px-1.5 py-0 border-primary/40 text-primary">v1.0</Badge>
      </div>
      <div className="flex items-center gap-2">
        <Button variant={activeView === 'dashboard' ? 'default' : 'ghost'} size="sm" className="h-7 text-xs" onClick={() => { if (activeView === 'admin') onToggleAdmin() }}>
          <Shield className="w-3 h-3 mr-1" />Dashboard
        </Button>
        <Button variant={activeView === 'admin' ? 'default' : 'ghost'} size="sm" className="h-7 text-xs" onClick={() => { if (activeView !== 'admin') onToggleAdmin() }}>
          <Settings className="w-3 h-3 mr-1" />Admin
        </Button>
        {user && (
          <div className="flex items-center gap-2 ml-2 pl-2 border-l border-border">
            <div className="flex items-center gap-1.5">
              <User className="w-3.5 h-3.5 text-muted-foreground" />
              <span className="text-xs text-muted-foreground">{user.name}</span>
            </div>
            <Button variant="ghost" size="sm" className="h-7 w-7 p-0 text-muted-foreground hover:text-destructive" onClick={logout} title="Logout">
              <LogOut className="w-3.5 h-3.5" />
            </Button>
          </div>
        )}
      </div>
    </header>
  )
}
