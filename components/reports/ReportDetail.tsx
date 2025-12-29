"use client"

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Separator } from '@/components/ui/separator'
import {
  AlertTriangle,
  Clock,
  Edit2,
  Save,
  X,
  Package,
  User,
  FileText,
} from 'lucide-react'
import type { Report, ReportStatus, ReportReason, AdminRole } from '@/types'
import { REPORT_REASONS, REPORT_STATUS_LABELS } from '@/lib/constants'
import { formatDate, formatDistanceToNow } from '@/lib/utils'
import { usePermissions } from '@/hooks/usePermissions'
import { useReportActions } from '@/hooks/useReportActions'
import { ReportedListingCard } from './ReportedListingCard'
import { ReportedUserCard } from './ReportedUserCard'
import { ActionModal, type ActionType, type ActionData } from './ActionModal'
import { ActionHistory } from './ActionHistory'
import { useReportsByReporter } from '@/hooks/useReport'

interface ReportDetailProps {
  report: Report & { actionHistory?: unknown[] }
  adminId: string
  adminRole: AdminRole
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

export function ReportDetail({ report, adminId, adminRole }: ReportDetailProps) {
  const [isEditingNotes, setIsEditingNotes] = useState(false)
  const [notes, setNotes] = useState(report.admin_notes || '')
  const [actionModal, setActionModal] = useState<{
    open: boolean
    type: ActionType
  }>({ open: false, type: 'dismiss' })

  const permissions = usePermissions(adminRole)
  const actions = useReportActions()

  const { data: reporterHistory } = useReportsByReporter(report.reporter_id)

  const isResolved = report.status === 'resolved' || report.status === 'dismissed'
  const isListing = !!report.reported_listing
  const targetUserId = isListing
    ? report.reported_listing?.user_id
    : report.reported_user_id

  const handleSaveNotes = async () => {
    await actions.updateNotes.mutateAsync({
      reportId: report.id,
      notes,
    })
    setIsEditingNotes(false)
  }

  const handleAction = async (type: ActionType, data: ActionData) => {
    try {
      switch (type) {
        case 'dismiss':
          await actions.dismiss.mutateAsync({
            adminId,
            reportId: report.id,
            reason: data.reason,
          })
          break
        case 'warn':
          if (!targetUserId) return
          await actions.warn.mutateAsync({
            adminId,
            reportId: report.id,
            userId: targetUserId,
            message: data.message || '',
            internalNotes: data.internalNotes,
          })
          break
        case 'remove_listing':
          if (!report.reported_listing_id) return
          await actions.removeListing.mutateAsync({
            adminId,
            reportId: report.id,
            listingId: report.reported_listing_id,
            reason: data.reason || '',
            notifySeller: data.notifySeller ?? true,
            internalNotes: data.internalNotes,
          })
          break
        case 'suspend':
          if (!targetUserId) return
          await actions.suspend.mutateAsync({
            adminId,
            reportId: report.id,
            userId: targetUserId,
            duration: data.duration || '7_days',
            customDays: data.customDays,
            reason: data.reason || '',
            internalNotes: data.internalNotes,
          })
          break
        case 'ban':
          if (!targetUserId) return
          await actions.ban.mutateAsync({
            adminId,
            reportId: report.id,
            userId: targetUserId,
            reason: data.reason || '',
            internalNotes: data.internalNotes,
          })
          break
      }
      setActionModal({ open: false, type: 'dismiss' })
    } catch (error) {
      console.error('Action failed:', error)
    }
  }

  const openActionModal = (type: ActionType) => {
    setActionModal({ open: true, type })
  }

  const getActionLoading = () => {
    return (
      actions.dismiss.isPending ||
      actions.warn.isPending ||
      actions.removeListing.isPending ||
      actions.suspend.isPending ||
      actions.ban.isPending
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold">Report #{report.id.slice(0, 8)}</h1>
            <Badge variant={getStatusBadgeVariant(report.status)}>
              {REPORT_STATUS_LABELS[report.status]?.label || report.status}
            </Badge>
          </div>
          <p className="text-muted-foreground mt-1">
            Submitted {formatDistanceToNow(report.created_at)} ({formatDate(report.created_at)})
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content - 2 columns */}
        <div className="lg:col-span-2 space-y-6">
          {/* Reported Item */}
          {isListing && report.reported_listing ? (
            <ReportedListingCard listing={report.reported_listing} />
          ) : report.reported_user ? (
            <ReportedUserCard user={report.reported_user} />
          ) : null}

          {/* Report Details */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Report Details
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-2">
                <AlertTriangle className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm font-medium">Reason:</span>
                <Badge variant={getReasonBadgeVariant(report.reason)}>
                  {REPORT_REASONS[report.reason]?.label || report.reason}
                </Badge>
              </div>

              {report.description && (
                <div>
                  <p className="text-sm font-medium mb-1">Description:</p>
                  <p className="text-sm text-muted-foreground whitespace-pre-wrap bg-muted p-3 rounded-lg">
                    {report.description}
                  </p>
                </div>
              )}

              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Clock className="h-4 w-4" />
                Submitted: {formatDate(report.created_at)}
              </div>

              {report.resolved_at && (
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Clock className="h-4 w-4" />
                  Resolved: {formatDate(report.resolved_at)}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Admin Notes */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">Admin Notes</CardTitle>
                {!isEditingNotes ? (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setIsEditingNotes(true)}
                  >
                    <Edit2 className="h-4 w-4 mr-1" />
                    Edit
                  </Button>
                ) : (
                  <div className="flex gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        setNotes(report.admin_notes || '')
                        setIsEditingNotes(false)
                      }}
                    >
                      <X className="h-4 w-4 mr-1" />
                      Cancel
                    </Button>
                    <Button
                      size="sm"
                      onClick={handleSaveNotes}
                      disabled={actions.updateNotes.isPending}
                    >
                      <Save className="h-4 w-4 mr-1" />
                      Save
                    </Button>
                  </div>
                )}
              </div>
            </CardHeader>
            <CardContent>
              {isEditingNotes ? (
                <Textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Add internal notes for other admins..."
                  className="min-h-[100px]"
                />
              ) : (
                <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                  {report.admin_notes || 'No notes added yet.'}
                </p>
              )}
            </CardContent>
          </Card>

          {/* Actions */}
          {!isResolved && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Actions</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-3">
                  <Button
                    variant="secondary"
                    onClick={() => openActionModal('dismiss')}
                    disabled={!permissions.canDismissReports}
                  >
                    Dismiss
                  </Button>
                  <Button
                    variant="outline"
                    className="border-yellow-500 text-yellow-600 hover:bg-yellow-50"
                    onClick={() => openActionModal('warn')}
                    disabled={!permissions.canWarnUsers}
                  >
                    Warn User
                  </Button>
                  {isListing && (
                    <Button
                      variant="destructive"
                      onClick={() => openActionModal('remove_listing')}
                      disabled={!permissions.canRemoveListings}
                    >
                      Remove Listing
                    </Button>
                  )}
                  <Button
                    variant="outline"
                    className="border-orange-500 text-orange-600 hover:bg-orange-50"
                    onClick={() => openActionModal('suspend')}
                    disabled={!permissions.canSuspendUsers}
                  >
                    Suspend User
                  </Button>
                  <Button
                    variant="destructive"
                    onClick={() => openActionModal('ban')}
                    disabled={!permissions.canBanUsers}
                  >
                    Ban User
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Action History */}
          <ActionHistory actions={(report.actionHistory || []) as any[]} />
        </div>

        {/* Sidebar - 1 column */}
        <div className="space-y-6">
          {/* Reporter Info */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <User className="h-5 w-5" />
                Reporter
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-3">
                <Avatar>
                  <AvatarImage src={report.reporter?.avatar_url || undefined} />
                  <AvatarFallback>
                    {report.reporter?.display_name?.charAt(0) || 'U'}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-medium">
                    {report.reporter?.display_name || 'Unknown'}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {report.reporter?.email}
                  </p>
                </div>
              </div>

              {report.reporter?.created_at && (
                <p className="text-sm text-muted-foreground">
                  Joined {formatDistanceToNow(report.reporter.created_at)}
                </p>
              )}

              <Separator />

              <div>
                <p className="text-sm font-medium mb-2">Previous Reports Filed</p>
                {reporterHistory ? (
                  <p className="text-sm text-muted-foreground">
                    {reporterHistory.totalCount} report
                    {reporterHistory.totalCount !== 1 ? 's' : ''} filed
                  </p>
                ) : (
                  <p className="text-sm text-muted-foreground">Loading...</p>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Action Modal */}
      <ActionModal
        open={actionModal.open}
        onOpenChange={(open) => setActionModal({ ...actionModal, open })}
        actionType={actionModal.type}
        onConfirm={(data) => handleAction(actionModal.type, data)}
        isLoading={getActionLoading()}
        targetName={
          isListing
            ? report.reported_listing?.title ?? undefined
            : (report.reported_user?.display_name || report.reported_user?.email) ?? undefined
        }
        canSuspend={permissions.canSuspendUsers}
        canBan={permissions.canBanUsers}
      />
    </div>
  )
}
