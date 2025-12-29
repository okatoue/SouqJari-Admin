"use client"

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { formatDistanceToNow } from '@/lib/utils'
import { Clock, User, AlertTriangle, Ban, RotateCcw, CheckCircle } from 'lucide-react'
import type { AuditLogEntry } from '@/types'

interface ModerationHistoryProps {
  auditLog: AuditLogEntry[]
}

function getActionIcon(action: string) {
  switch (action) {
    case 'user_warned':
    case 'warning_issued':
      return <AlertTriangle className="h-4 w-4 text-yellow-500" />
    case 'user_suspended':
      return <Clock className="h-4 w-4 text-orange-500" />
    case 'user_banned':
      return <Ban className="h-4 w-4 text-red-500" />
    case 'user_reactivated':
    case 'warnings_reset':
      return <RotateCcw className="h-4 w-4 text-green-500" />
    default:
      return <CheckCircle className="h-4 w-4 text-blue-500" />
  }
}

function formatActionName(action: string): string {
  return action
    .replace(/_/g, ' ')
    .replace(/\b\w/g, (c) => c.toUpperCase())
}

export function ModerationHistory({ auditLog }: ModerationHistoryProps) {
  if (auditLog.length === 0) {
    return (
      <div className="flex h-48 items-center justify-center rounded-lg border border-dashed">
        <p className="text-muted-foreground">No moderation history</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {auditLog.map((entry) => (
        <div
          key={entry.id}
          className="flex items-start gap-3 border-l-2 border-muted pl-4"
        >
          <div className="mt-1">{getActionIcon(entry.action)}</div>
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <span className="font-medium">{formatActionName(entry.action)}</span>
              <span className="text-xs text-muted-foreground">
                {formatDistanceToNow(entry.created_at)}
              </span>
            </div>
            {entry.admin && (
              <p className="mt-1 flex items-center gap-1 text-sm text-muted-foreground">
                <User className="h-3 w-3" />
                by{' '}
                {(entry.admin as { profile?: { display_name?: string; email?: string } })?.profile?.display_name ||
                  (entry.admin as { profile?: { display_name?: string; email?: string } })?.profile?.email ||
                  'Unknown Admin'}
              </p>
            )}
            {entry.details && Object.keys(entry.details).length > 0 && (
              <div className="mt-2 rounded bg-muted p-2 text-xs">
                {Object.entries(entry.details).map(([key, value]) => {
                  // Skip some internal fields
                  if (key === 'user_id' || key === 'report_id') return null
                  return (
                    <div key={key}>
                      <span className="font-medium">
                        {key.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())}:
                      </span>{' '}
                      {String(value)}
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  )
}
