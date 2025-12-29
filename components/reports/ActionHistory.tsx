"use client"

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import {
  History,
  AlertTriangle,
  Trash2,
  Clock,
  Ban,
  XCircle,
  Eye,
  Check,
} from 'lucide-react'
import type { AuditLogEntry } from '@/types'
import { formatDate } from '@/lib/utils'

interface ActionHistoryProps {
  actions: AuditLogEntry[]
  isLoading?: boolean
}

const ACTION_CONFIG: Record<
  string,
  { icon: React.ElementType; label: string; color: string }
> = {
  warning_issued: {
    icon: AlertTriangle,
    label: 'Warning Issued',
    color: 'text-yellow-600 bg-yellow-100',
  },
  listing_removed: {
    icon: Trash2,
    label: 'Listing Removed',
    color: 'text-red-600 bg-red-100',
  },
  user_suspended: {
    icon: Clock,
    label: 'User Suspended',
    color: 'text-orange-600 bg-orange-100',
  },
  user_banned: {
    icon: Ban,
    label: 'User Banned',
    color: 'text-red-600 bg-red-100',
  },
  report_dismissed: {
    icon: XCircle,
    label: 'Report Dismissed',
    color: 'text-gray-600 bg-gray-100',
  },
  report_reviewed: {
    icon: Eye,
    label: 'Report Reviewed',
    color: 'text-blue-600 bg-blue-100',
  },
  report_resolved: {
    icon: Check,
    label: 'Report Resolved',
    color: 'text-green-600 bg-green-100',
  },
}

function getActionConfig(action: string) {
  return (
    ACTION_CONFIG[action] || {
      icon: History,
      label: action.replace(/_/g, ' ').replace(/\b\w/g, (l) => l.toUpperCase()),
      color: 'text-gray-600 bg-gray-100',
    }
  )
}

export function ActionHistory({ actions, isLoading }: ActionHistoryProps) {
  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <History className="h-5 w-5" />
            Action History
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="flex gap-4 animate-pulse">
                <div className="h-8 w-8 rounded-full bg-muted" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 w-32 bg-muted rounded" />
                  <div className="h-3 w-48 bg-muted rounded" />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    )
  }

  if (!actions || actions.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <History className="h-5 w-5" />
            Action History
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground text-center py-4">
            No actions have been taken yet.
          </p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg flex items-center gap-2">
          <History className="h-5 w-5" />
          Action History
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="relative">
          {/* Timeline line */}
          <div className="absolute left-4 top-0 bottom-0 w-px bg-border" />

          <div className="space-y-6">
            {actions.map((action, index) => {
              const config = getActionConfig(action.action)
              const Icon = config.icon
              const details = action.details as Record<string, unknown> | null
              const adminProfile = (action.admin as any)?.profile

              return (
                <div key={action.id} className="relative flex gap-4 pl-2">
                  {/* Timeline dot */}
                  <div
                    className={`relative z-10 flex h-8 w-8 items-center justify-center rounded-full ${config.color}`}
                  >
                    <Icon className="h-4 w-4" />
                  </div>

                  <div className="flex-1 min-w-0 pb-4">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <p className="font-medium text-sm">{config.label}</p>
                        <p className="text-xs text-muted-foreground">
                          {formatDate(action.created_at)}
                        </p>
                      </div>
                      {adminProfile && (
                        <div className="flex items-center gap-2">
                          <Avatar className="h-6 w-6">
                            <AvatarImage src={adminProfile.avatar_url} />
                            <AvatarFallback className="text-xs">
                              {adminProfile.display_name?.charAt(0) ||
                                adminProfile.email?.charAt(0) ||
                                'A'}
                            </AvatarFallback>
                          </Avatar>
                          <span className="text-xs text-muted-foreground">
                            {adminProfile.display_name || adminProfile.email}
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Action details */}
                    {details && (
                      <div className="mt-2 text-sm text-muted-foreground space-y-1">
                        {Boolean(details.reason) && (
                          <p>
                            <span className="font-medium">Reason:</span>{' '}
                            {String(details.reason)}
                          </p>
                        )}
                        {Boolean(details.message) && (
                          <p>
                            <span className="font-medium">Message:</span>{' '}
                            {String(details.message)}
                          </p>
                        )}
                        {Boolean(details.duration) && (
                          <p>
                            <span className="font-medium">Duration:</span>{' '}
                            {String(details.duration).replace(/_/g, ' ')}
                          </p>
                        )}
                        {Boolean(details.suspension_until) && (
                          <p>
                            <span className="font-medium">Until:</span>{' '}
                            {formatDate(String(details.suspension_until))}
                          </p>
                        )}
                        {Boolean(details.internal_notes) && (
                          <p className="italic">
                            Note: {String(details.internal_notes)}
                          </p>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
