"use client"

import { UserMenu } from './UserMenu'
import type { AdminUser } from '@/types'

interface HeaderProps {
  title: string
  adminUser: AdminUser | null
  userEmail?: string | null
}

export function Header({ title, adminUser, userEmail }: HeaderProps) {
  return (
    <header className="sticky top-0 z-40 flex h-16 items-center justify-between border-b bg-background px-6">
      <h1 className="text-xl font-semibold">{title}</h1>
      <UserMenu adminUser={adminUser} userEmail={userEmail} />
    </header>
  )
}
