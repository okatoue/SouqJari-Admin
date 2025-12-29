"use client"

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import {
  User,
  Mail,
  Phone,
  Calendar,
  AlertTriangle,
  Ban,
  Clock,
} from 'lucide-react'
import type { Profile } from '@/types'
import { MODERATION_STATUS_LABELS } from '@/lib/constants'
import { formatDistanceToNow, formatDate } from '@/lib/utils'

interface ReportedUserCardProps {
  user: Profile
}

export function ReportedUserCard({ user }: ReportedUserCardProps) {
  const isSuspended = user.moderation_status === 'suspended'
  const isBanned = user.moderation_status === 'banned'
  const suspensionActive =
    isSuspended && user.suspension_until && new Date(user.suspension_until) > new Date()

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <CardTitle className="text-lg flex items-center gap-2">
            <User className="h-5 w-5" />
            Reported User
          </CardTitle>
          <Badge
            variant={
              user.moderation_status === 'active'
                ? 'success'
                : user.moderation_status === 'banned'
                ? 'destructive'
                : user.moderation_status === 'suspended'
                ? 'warning'
                : 'secondary'
            }
          >
            {MODERATION_STATUS_LABELS[user.moderation_status]?.label || user.moderation_status}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* User Profile */}
        <div className="flex items-center gap-4">
          <Avatar className="h-16 w-16">
            <AvatarImage
              src={
                user.avatar_url
                  ? `https://api.souqjari.com/storage/v1/object/public/avatars/${user.id}/${user.avatar_url}`
                  : undefined
              }
            />
            <AvatarFallback className="text-xl">
              {user.display_name?.charAt(0) || 'U'}
            </AvatarFallback>
          </Avatar>
          <div>
            <h3 className="font-semibold text-lg">
              {user.display_name || 'Unknown User'}
            </h3>
            <p className="text-sm text-muted-foreground font-mono">
              {user.id.slice(0, 8)}...
            </p>
          </div>
        </div>

        {/* Contact Info */}
        <div className="space-y-2">
          {user.email && (
            <div className="flex items-center gap-2 text-sm">
              <Mail className="h-4 w-4 text-muted-foreground" />
              <span>{user.email}</span>
            </div>
          )}
          {user.phone_number && (
            <div className="flex items-center gap-2 text-sm">
              <Phone className="h-4 w-4 text-muted-foreground" />
              <span>{user.phone_number}</span>
            </div>
          )}
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Calendar className="h-4 w-4" />
            <span>Joined {formatDistanceToNow(user.created_at)}</span>
          </div>
        </div>

        {/* Warning Count */}
        {user.warning_count > 0 && (
          <div className="flex items-center gap-2 p-3 bg-yellow-50 rounded-lg border border-yellow-200">
            <AlertTriangle className="h-5 w-5 text-yellow-600" />
            <div>
              <p className="text-sm font-medium text-yellow-800">
                {user.warning_count} Warning{user.warning_count > 1 ? 's' : ''} Issued
              </p>
              <p className="text-xs text-yellow-600">
                User has received prior warnings
              </p>
            </div>
          </div>
        )}

        {/* Suspension Info */}
        {suspensionActive && user.suspension_until && (
          <div className="flex items-center gap-2 p-3 bg-orange-50 rounded-lg border border-orange-200">
            <Clock className="h-5 w-5 text-orange-600" />
            <div>
              <p className="text-sm font-medium text-orange-800">
                Currently Suspended
              </p>
              <p className="text-xs text-orange-600">
                Until {formatDate(user.suspension_until)}
              </p>
            </div>
          </div>
        )}

        {/* Ban Info */}
        {isBanned && (
          <div className="p-3 bg-red-50 rounded-lg border border-red-200">
            <div className="flex items-center gap-2">
              <Ban className="h-5 w-5 text-red-600" />
              <p className="text-sm font-medium text-red-800">
                Permanently Banned
              </p>
            </div>
            {user.ban_reason && (
              <p className="text-sm text-red-600 mt-2">
                Reason: {user.ban_reason}
              </p>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
