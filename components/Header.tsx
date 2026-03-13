'use client'

import { ScanSearch, Zap } from 'lucide-react'
import Link from 'next/link'
import { Badge } from '@/components/ui/badge'
import { ThemeToggle } from '@/components/ThemeToggle'

export function Header() {
  return (
    <header className="border-b bg-card/50 backdrop-blur-sm sticky top-0 z-10">
      <div className="max-w-3xl mx-auto px-4 h-14 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2">
          <ScanSearch className="h-5 w-5 text-primary" />
          <span className="font-semibold text-base">GeoLocator</span>
          <Badge variant="outline" className="text-xs hidden sm:inline-flex">AI</Badge>
        </Link>
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <Zap className="h-3.5 w-3.5 text-amber-500" />
            <span>100 sats per analysis</span>
          </div>
          <ThemeToggle />
        </div>
      </div>
    </header>
  )
}
