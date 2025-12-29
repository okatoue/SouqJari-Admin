"use client"

import Link from 'next/link'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { MODERATION_STATUS_LABELS } from '@/lib/constants'
import { formatDistanceToNow } from '@/lib/utils'
import { Mail, Phone, Package, AlertTriangle, CheckCircle } from 'lucide-react'
import type { Profile } from '@/types'

interface UserCardProps {
  user: Profile & {
    listings_count?: number
    reports_count?: number
  }
}

export function UserCard({ user }: UserCardProps) {
  const moderationInfo = MODERATION_STATUS_LABELS[user.moderation_status]
  const initials = user.display_name
    ? user.display_name
        .split(' ')
        .map((n) => n[0])
        .join('')
        .toUpperCase()
        .slice(0, 2)
    : user.email?.[0]?.toUpperCase() || 'U'

  return (
    <Card className="transition-shadow hover:shadow-md">
      <CardContent className="p-4">
        <Link href={`/users/${user.id}`}>
          <div className="flex items-start gap-4">
            {/* Avatar */}
            <Avatar className="h-12 w-12">
              <AvatarImage src={user.avatar_url || undefined} />
              <AvatarFallback>{initials}</AvatarFallback>
            </Avatar>

            {/* User Info */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <h3 className="font-medium truncate">
                  {user.display_name || 'No Name'}
                </h3>
                <Badge
                  variant={
                    moderationInfo.color === 'green'
                      ? 'default'
                      : moderationInfo.color === 'red'
                      ? 'destructive'
                      : 'secondary'
                  }
                  className={
                    moderationInfo.color === 'yellow'
                      ? 'bg-yellow-100 text-yellow-800'
                      : moderationInfo.color === 'orange'
                      ? 'bg-orange-100 text-orange-800'
                      : ''
                  }
                >
                  {moderationInfo.label}
                </Badge>
              </div>

              {/* Email */}
              {user.email && (
                <div className="mt-1 flex items-center gap-1 text-sm text-muted-foreground">
                  <Mail className="h-3 w-3" />
                  <span className="truncate">{user.email}</span>
                  {user.email_verified && (
                    <CheckCircle className="h-3 w-3 text-green-500" />
                  )}
                </div>
              )}

              {/* Phone */}
              {user.phone_number && (
                <div className="flex items-center gap-1 text-sm text-muted-foreground">
                  <Phone className="h-3 w-3" />
                  <span>{user.phone_number}</span>
                </div>
              )}

              {/* Stats */}
              <div className="mt-2 flex items-center gap-4 text-xs text-muted-foreground">
                <span className="flex items-center gap-1">
                  <Package className="h-3 w-3" />
                  {user.listings_count || 0} listings
                </span>
                {(user.reports_count || 0) > 0 && (
                  <span className="flex items-center gap-1 text-yellow-600">
                    <AlertTriangle className="h-3 w-3" />
                    {user.reports_count} reports
                  </span>
                )}
                <span>Joined {formatDistanceToNow(user.created_at)}</span>
              </div>

              {/* Warning Count */}
              {user.warning_count > 0 && (
                <div className="mt-2 flex items-center gap-1 text-xs text-yellow-600">
                  <AlertTriangle className="h-3 w-3" />
                  {user.warning_count} warning(s)
                </div>
              )}
            </div>
          </div>
        </Link>
      </CardContent>
    </Card>
  )
}
