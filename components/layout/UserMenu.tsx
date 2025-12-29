"use client"

import { useRouter } from 'next/navigation'
import { LogOut, User, Shield } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { ADMIN_ROLE_LABELS } from '@/lib/constants'
import type { AdminUser } from '@/types'

interface UserMenuProps {
  adminUser: AdminUser | null
  userEmail?: string | null
}

export function UserMenu({ adminUser, userEmail }: UserMenuProps) {
  const router = useRouter()
  const supabase = createClient()

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    router.push('/login')
    router.refresh()
  }

  const roleInfo = adminUser?.role ? ADMIN_ROLE_LABELS[adminUser.role] : null
  const displayName = adminUser?.profile?.display_name || userEmail?.split('@')[0] || 'Admin'
  const avatarUrl = adminUser?.profile?.avatar_url
  const initials = displayName.slice(0, 2).toUpperCase()

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="relative h-10 gap-2 px-2">
          <Avatar className="h-8 w-8">
            {avatarUrl && <AvatarImage src={avatarUrl} alt={displayName} />}
            <AvatarFallback className="text-xs">{initials}</AvatarFallback>
          </Avatar>
          <div className="hidden flex-col items-start text-left md:flex">
            <span className="text-sm font-medium">{displayName}</span>
            {roleInfo && (
              <span className="text-xs text-muted-foreground">{roleInfo.label}</span>
            )}
          </div>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuLabel>
          <div className="flex flex-col space-y-1">
            <p className="text-sm font-medium">{displayName}</p>
            <p className="text-xs text-muted-foreground">{userEmail}</p>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem disabled className="gap-2">
          <Shield className="h-4 w-4" />
          <span>Role:</span>
          {roleInfo && (
            <Badge variant="secondary" className="ml-auto">
              {roleInfo.label}
            </Badge>
          )}
        </DropdownMenuItem>
        <DropdownMenuItem disabled className="gap-2">
          <User className="h-4 w-4" />
          <span>Profile</span>
          <span className="ml-auto text-xs text-muted-foreground">Coming soon</span>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          className="gap-2 text-destructive focus:text-destructive"
          onClick={handleSignOut}
        >
          <LogOut className="h-4 w-4" />
          <span>Sign out</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
