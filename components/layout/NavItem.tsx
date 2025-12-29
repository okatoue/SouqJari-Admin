"use client"

import Link from 'next/link'
import { cn } from '@/lib/utils'

interface NavItemProps {
  href: string
  icon: React.ComponentType<{ className?: string }>
  children: React.ReactNode
  isActive?: boolean
  badge?: number
}

export function NavItem({ href, icon: Icon, children, isActive, badge }: NavItemProps) {
  return (
    <Link
      href={href}
      className={cn(
        'flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
        isActive
          ? 'bg-primary text-primary-foreground'
          : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
      )}
    >
      <Icon className="h-5 w-5 shrink-0" />
      <span>{children}</span>
      {badge && badge > 0 && (
        <span
          className={cn(
            'ml-auto flex h-5 min-w-[20px] items-center justify-center rounded-full px-1.5 text-xs font-medium',
            isActive
              ? 'bg-primary-foreground/20 text-primary-foreground'
              : 'bg-destructive text-destructive-foreground'
          )}
        >
          {badge > 99 ? '99+' : badge}
        </span>
      )}
    </Link>
  )
}
