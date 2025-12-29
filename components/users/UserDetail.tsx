"use client"

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { UserListings } from './UserListings'
import { UserReports } from './UserReports'
import { ModerationHistory } from './ModerationHistory'
import { UserActions } from './UserActions'
import { MODERATION_STATUS_LABELS } from '@/lib/constants'
import { formatDate, formatDateShort } from '@/lib/utils'
import {
  Mail,
  Phone,
  Calendar,
  AlertTriangle,
  CheckCircle,
  Package,
  Flag,
  MessageSquare,
  Clock,
} from 'lucide-react'
import type { Profile, Listing, Report, AuditLogEntry, UserFeedback, AdminUser } from '@/types'

interface UserDetailProps {
  user: Profile & {
    listings?: Listing[]
    reportsAgainst?: Report[]
    reportsFiled?: Report[]
    feedback?: UserFeedback[]
    auditLog?: AuditLogEntry[]
  }
  adminUser: AdminUser
  onWarn: (message: string, internalNotes?: string) => Promise<void>
  onSuspend: (
    duration: '1_day' | '3_days' | '7_days' | '30_days' | 'custom',
    customDays: number | undefined,
    reason: string,
    internalNotes?: string
  ) => Promise<void>
  onBan: (reason: string, internalNotes?: string) => Promise<void>
  onReactivate: (internalNotes?: string) => Promise<void>
  onResetWarnings: () => Promise<void>
  isLoading?: boolean
}

export function UserDetail({
  user,
  adminUser,
  onWarn,
  onSuspend,
  onBan,
  onReactivate,
  onResetWarnings,
  isLoading,
}: UserDetailProps) {
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
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-4">
          <Avatar className="h-16 w-16">
            <AvatarImage src={user.avatar_url || undefined} />
            <AvatarFallback className="text-xl">{initials}</AvatarFallback>
          </Avatar>
          <div>
            <h1 className="text-2xl font-bold">
              {user.display_name || 'No Name'}
            </h1>
            <p className="text-muted-foreground">{user.email}</p>
          </div>
        </div>
        <Badge
          variant={
            moderationInfo.color === 'green'
              ? 'default'
              : moderationInfo.color === 'red'
              ? 'destructive'
              : 'secondary'
          }
          className={`text-base px-4 py-1 ${
            moderationInfo.color === 'yellow'
              ? 'bg-yellow-100 text-yellow-800'
              : moderationInfo.color === 'orange'
              ? 'bg-orange-100 text-orange-800'
              : ''
          }`}
        >
          {moderationInfo.label}
        </Badge>
      </div>

      {/* Main Content */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Left Column - User Info */}
        <div className="space-y-6">
          {/* Contact Info Card */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Contact Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {user.email && (
                <div className="flex items-center gap-2 text-sm">
                  <Mail className="h-4 w-4 text-muted-foreground" />
                  <span>{user.email}</span>
                  {user.email_verified ? (
                    <Badge variant="outline" className="text-xs">
                      <CheckCircle className="mr-1 h-3 w-3 text-green-500" />
                      Verified
                    </Badge>
                  ) : (
                    <Badge variant="outline" className="text-xs text-yellow-600">
                      Not Verified
                    </Badge>
                  )}
                </div>
              )}
              {user.phone_number && (
                <div className="flex items-center gap-2 text-sm">
                  <Phone className="h-4 w-4 text-muted-foreground" />
                  <span>{user.phone_number}</span>
                </div>
              )}
              <div className="flex items-center gap-2 text-sm">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <span>Joined {formatDateShort(user.created_at)}</span>
              </div>
            </CardContent>
          </Card>

          {/* Stats Card */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Statistics</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center justify-between text-sm">
                <span className="flex items-center gap-2 text-muted-foreground">
                  <Package className="h-4 w-4" />
                  Listings
                </span>
                <span className="font-medium">{user.listings?.length || 0}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="flex items-center gap-2 text-muted-foreground">
                  <Flag className="h-4 w-4" />
                  Reports Against
                </span>
                <span className="font-medium">{user.reportsAgainst?.length || 0}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="flex items-center gap-2 text-muted-foreground">
                  <Flag className="h-4 w-4" />
                  Reports Filed
                </span>
                <span className="font-medium">{user.reportsFiled?.length || 0}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="flex items-center gap-2 text-muted-foreground">
                  <MessageSquare className="h-4 w-4" />
                  Feedback
                </span>
                <span className="font-medium">{user.feedback?.length || 0}</span>
              </div>
            </CardContent>
          </Card>

          {/* Moderation Status Card */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Moderation Status</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Status</span>
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
              <div className="flex items-center justify-between text-sm">
                <span className="flex items-center gap-2 text-muted-foreground">
                  <AlertTriangle className="h-4 w-4" />
                  Warnings
                </span>
                <span className={`font-medium ${user.warning_count > 0 ? 'text-yellow-600' : ''}`}>
                  {user.warning_count}
                </span>
              </div>

              {user.moderation_status === 'suspended' && user.suspension_until && (
                <div className="mt-3 rounded-md bg-orange-50 p-3 text-sm text-orange-800">
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4" />
                    <span className="font-medium">Suspended</span>
                  </div>
                  <p className="mt-1 text-xs">
                    Until {formatDate(user.suspension_until)}
                  </p>
                </div>
              )}

              {user.moderation_status === 'banned' && user.ban_reason && (
                <div className="mt-3 rounded-md bg-red-50 p-3 text-sm text-red-800">
                  <p className="font-medium">Ban Reason:</p>
                  <p className="mt-1 text-xs">{user.ban_reason}</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Actions Card */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Actions</CardTitle>
            </CardHeader>
            <CardContent>
              <UserActions
                userId={user.id}
                currentStatus={user.moderation_status}
                warningCount={user.warning_count}
                onWarn={onWarn}
                onSuspend={onSuspend}
                onBan={onBan}
                onReactivate={onReactivate}
                onResetWarnings={onResetWarnings}
                isLoading={isLoading}
              />
            </CardContent>
          </Card>
        </div>

        {/* Right Column - Tabbed Content */}
        <div className="lg:col-span-2">
          <Card>
            <Tabs defaultValue="listings">
              <CardHeader>
                <TabsList className="grid w-full grid-cols-4">
                  <TabsTrigger value="listings">
                    Listings ({user.listings?.length || 0})
                  </TabsTrigger>
                  <TabsTrigger value="reports-against">
                    Reports ({user.reportsAgainst?.length || 0})
                  </TabsTrigger>
                  <TabsTrigger value="reports-filed">
                    Filed ({user.reportsFiled?.length || 0})
                  </TabsTrigger>
                  <TabsTrigger value="history">
                    History
                  </TabsTrigger>
                </TabsList>
              </CardHeader>
              <CardContent>
                <TabsContent value="listings" className="mt-0">
                  <UserListings listings={user.listings || []} />
                </TabsContent>
                <TabsContent value="reports-against" className="mt-0">
                  <UserReports reports={user.reportsAgainst || []} type="against" />
                </TabsContent>
                <TabsContent value="reports-filed" className="mt-0">
                  <UserReports reports={user.reportsFiled || []} type="filed" />
                </TabsContent>
                <TabsContent value="history" className="mt-0">
                  <ModerationHistory auditLog={user.auditLog || []} />
                </TabsContent>
              </CardContent>
            </Tabs>
          </Card>
        </div>
      </div>
    </div>
  )
}
