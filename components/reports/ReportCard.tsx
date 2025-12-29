"use client"

import Link from 'next/link'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Package, User, Eye, Clock, AlertTriangle } from 'lucide-react'
import type { Report, ReportStatus, ReportReason } from '@/types'
import { REPORT_REASONS, REPORT_STATUS_LABELS } from '@/lib/constants'
import { formatDistanceToNow } from '@/lib/utils'

interface ReportCardProps {
  report: Report
}

function getStatusBadgeVariant(status: ReportStatus) {
  switch (status) {
    case 'pending':
      return 'warning'
    case 'under_review':
      return 'info'
    case 'resolved':
      return 'success'
    case 'dismissed':
      return 'secondary'
    default:
      return 'default'
  }
}

function getReasonBadgeVariant(reason: ReportReason) {
  switch (reason) {
    case 'scam':
    case 'fraud':
      return 'destructive'
    case 'harassment':
    case 'offensive':
      return 'warning'
    case 'spam':
      return 'secondary'
    default:
      return 'outline'
  }
}

export function ReportCard({ report }: ReportCardProps) {
  const isListing = !!report.reported_listing
  const target = isListing ? report.reported_listing : report.reported_user

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-2">
            {isListing ? (
              <div className="p-2 bg-blue-100 rounded-lg">
                <Package className="h-4 w-4 text-blue-600" />
              </div>
            ) : (
              <div className="p-2 bg-purple-100 rounded-lg">
                <User className="h-4 w-4 text-purple-600" />
              </div>
            )}
            <div>
              <p className="font-medium text-sm">
                {isListing ? 'Listing Report' : 'User Report'}
              </p>
              <p className="text-xs text-muted-foreground font-mono">
                #{report.id.slice(0, 8)}
              </p>
            </div>
          </div>
          <Badge variant={getStatusBadgeVariant(report.status)}>
            {REPORT_STATUS_LABELS[report.status]?.label || report.status}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Target Info */}
        <div className="p-3 bg-muted rounded-lg">
          {isListing && report.reported_listing ? (
            <div className="flex items-start gap-3">
              {report.reported_listing.images?.[0] && (
                <img
                  src={`https://images.souqjari.com/listing-images/${report.reported_listing.user_id}/${report.reported_listing.images[0]}`}
                  alt={report.reported_listing.title}
                  className="w-12 h-12 object-cover rounded"
                />
              )}
              <div className="flex-1 min-w-0">
                <p className="font-medium truncate">
                  {report.reported_listing.title}
                </p>
                <p className="text-sm text-muted-foreground">
                  {report.reported_listing.price} {report.reported_listing.currency}
                </p>
                <p className="text-xs text-muted-foreground">
                  by {report.reported_listing.seller?.display_name || 'Unknown'}
                </p>
              </div>
            </div>
          ) : report.reported_user ? (
            <div className="flex items-center gap-3">
              <Avatar className="h-10 w-10">
                <AvatarImage src={report.reported_user.avatar_url || undefined} />
                <AvatarFallback>
                  {report.reported_user.display_name?.charAt(0) || 'U'}
                </AvatarFallback>
              </Avatar>
              <div>
                <p className="font-medium">
                  {report.reported_user.display_name || 'Unknown User'}
                </p>
                <p className="text-sm text-muted-foreground">
                  {report.reported_user.email}
                </p>
              </div>
            </div>
          ) : (
            <p className="text-muted-foreground text-sm">Target unavailable</p>
          )}
        </div>

        {/* Reason */}
        <div className="flex items-center gap-2">
          <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          <Badge variant={getReasonBadgeVariant(report.reason)}>
            {REPORT_REASONS[report.reason]?.label || report.reason}
          </Badge>
        </div>

        {/* Description Preview */}
        {report.description && (
          <p className="text-sm text-muted-foreground line-clamp-2">
            {report.description}
          </p>
        )}

        {/* Reporter & Time */}
        <div className="flex items-center justify-between pt-2 border-t">
          <div className="flex items-center gap-2">
            <Avatar className="h-5 w-5">
              <AvatarImage src={report.reporter?.avatar_url || undefined} />
              <AvatarFallback className="text-xs">
                {report.reporter?.display_name?.charAt(0) || 'U'}
              </AvatarFallback>
            </Avatar>
            <span className="text-xs text-muted-foreground">
              {report.reporter?.display_name || 'Unknown'}
            </span>
          </div>
          <div className="flex items-center gap-1 text-xs text-muted-foreground">
            <Clock className="h-3 w-3" />
            {formatDistanceToNow(report.created_at)}
          </div>
        </div>

        {/* Action Button */}
        <Button asChild variant="outline" size="sm" className="w-full">
          <Link href={`/reports/${report.id}`}>
            <Eye className="mr-2 h-4 w-4" />
            View Details
          </Link>
        </Button>
      </CardContent>
    </Card>
  )
}
