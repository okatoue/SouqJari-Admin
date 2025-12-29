"use client"

import { useState, useCallback, useEffect } from 'react'
import { useUsers, flattenUsers } from '@/hooks/useUsers'
import { useUserActions } from '@/hooks/useUserActions'
import { UserFilters, type UserFiltersState } from './UserFilters'
import { UsersTable } from './UsersTable'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useToast } from '@/hooks/use-toast'
import { Download, Loader2 } from 'lucide-react'
import type { AdminUser } from '@/types'

interface UsersPageClientProps {
  adminUser: AdminUser
}

const defaultFilters: UserFiltersState = {
  search: '',
  moderationStatus: 'all',
  emailVerified: 'all',
  hasAvatar: 'all',
  dateFrom: undefined,
  dateTo: undefined,
  listingsCount: 'all',
  reportsAgainst: 'all',
  sortBy: 'created_at',
  sortOrder: 'desc',
}

type ActionDialogType = 'warn' | 'suspend' | 'ban' | null

export function UsersPageClient({ adminUser }: UsersPageClientProps) {
  const [filters, setFilters] = useState<UserFiltersState>(defaultFilters)
  const { toast } = useToast()

  // Action dialog state
  const [actionDialog, setActionDialog] = useState<ActionDialogType>(null)
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null)
  const [message, setMessage] = useState('')
  const [reason, setReason] = useState('')
  const [duration, setDuration] = useState<'1_day' | '3_days' | '7_days' | '30_days' | 'custom'>(
    '7_days'
  )
  const [customDays, setCustomDays] = useState<number>(14)
  const [processing, setProcessing] = useState(false)

  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
    isError,
    error,
  } = useUsers({
    search: filters.search || undefined,
    moderationStatus: filters.moderationStatus,
    emailVerified: filters.emailVerified,
    hasAvatar: filters.hasAvatar,
    dateFrom: filters.dateFrom,
    dateTo: filters.dateTo,
    listingsCount: filters.listingsCount,
    reportsAgainst: filters.reportsAgainst,
    sortBy: filters.sortBy,
    sortOrder: filters.sortOrder,
  })

  const actions = useUserActions()

  const users = flattenUsers(data?.pages)
  const totalCount = data?.pages[0]?.totalCount || 0

  const openActionDialog = (type: ActionDialogType, userId: string) => {
    setActionDialog(type)
    setSelectedUserId(userId)
  }

  const closeActionDialog = () => {
    setActionDialog(null)
    setSelectedUserId(null)
    setMessage('')
    setReason('')
    setDuration('7_days')
    setCustomDays(14)
  }

  const handleWarn = async () => {
    if (!selectedUserId || !message.trim()) return
    setProcessing(true)
    try {
      await actions.warn.mutateAsync({
        adminId: adminUser.id,
        userId: selectedUserId,
        message,
      })
      toast({
        title: 'Warning issued',
        description: 'The user has been warned.',
      })
      closeActionDialog()
    } catch (err) {
      toast({
        title: 'Error',
        description: 'Failed to issue warning.',
        variant: 'destructive',
      })
    } finally {
      setProcessing(false)
    }
  }

  const handleSuspend = async () => {
    if (!selectedUserId || !reason.trim()) return
    setProcessing(true)
    try {
      await actions.suspend.mutateAsync({
        adminId: adminUser.id,
        userId: selectedUserId,
        duration,
        customDays: duration === 'custom' ? customDays : undefined,
        reason,
      })
      toast({
        title: 'User suspended',
        description: 'The user has been suspended.',
      })
      closeActionDialog()
    } catch (err) {
      toast({
        title: 'Error',
        description: 'Failed to suspend user.',
        variant: 'destructive',
      })
    } finally {
      setProcessing(false)
    }
  }

  const handleBan = async () => {
    if (!selectedUserId || !reason.trim()) return
    setProcessing(true)
    try {
      await actions.ban.mutateAsync({
        adminId: adminUser.id,
        userId: selectedUserId,
        reason,
      })
      toast({
        title: 'User banned',
        description: 'The user has been banned.',
      })
      closeActionDialog()
    } catch (err) {
      toast({
        title: 'Error',
        description: 'Failed to ban user.',
        variant: 'destructive',
      })
    } finally {
      setProcessing(false)
    }
  }

  const handleReactivate = useCallback(
    async (userId: string) => {
      try {
        await actions.reactivate.mutateAsync({
          adminId: adminUser.id,
          userId,
        })
        toast({
          title: 'User reactivated',
          description: 'The user has been reactivated.',
        })
      } catch (err) {
        toast({
          title: 'Error',
          description: 'Failed to reactivate user.',
          variant: 'destructive',
        })
      }
    },
    [actions.reactivate, adminUser.id, toast]
  )

  const exportToCSV = useCallback(() => {
    if (users.length === 0) return

    const headers = [
      'ID',
      'Email',
      'Display Name',
      'Phone',
      'Email Verified',
      'Moderation Status',
      'Warning Count',
      'Listings',
      'Reports Against',
      'Created At',
    ]

    const rows = users.map((user) => [
      user.id,
      user.email || '',
      `"${(user.display_name || '').replace(/"/g, '""')}"`,
      user.phone_number || '',
      user.email_verified ? 'Yes' : 'No',
      user.moderation_status,
      user.warning_count,
      user.listings_count || 0,
      user.reports_count || 0,
      user.created_at,
    ])

    const csv = [headers.join(','), ...rows.map((row) => row.join(','))].join('\n')

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    link.href = URL.createObjectURL(blob)
    link.download = `users_export_${new Date().toISOString().split('T')[0]}.csv`
    link.click()
  }, [users])

  if (isError) {
    return (
      <div className="flex h-64 items-center justify-center rounded-lg border border-dashed">
        <p className="text-muted-foreground">
          Error loading users: {(error as Error)?.message || 'Unknown error'}
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Filters */}
      <UserFilters
        filters={filters}
        onFiltersChange={setFilters}
        totalCount={totalCount}
      />

      {/* Export Button */}
      <div className="flex justify-end">
        <Button variant="outline" size="sm" onClick={exportToCSV} disabled={users.length === 0}>
          <Download className="mr-2 h-4 w-4" />
          Export CSV
        </Button>
      </div>

      {/* Users Table */}
      <UsersTable
        users={users}
        isLoading={isLoading}
        onWarn={(userId) => openActionDialog('warn', userId)}
        onSuspend={(userId) => openActionDialog('suspend', userId)}
        onBan={(userId) => openActionDialog('ban', userId)}
        onReactivate={handleReactivate}
      />

      {/* Load More */}
      {hasNextPage && (
        <div className="flex justify-center pt-4">
          <Button
            variant="outline"
            onClick={() => fetchNextPage()}
            disabled={isFetchingNextPage}
          >
            {isFetchingNextPage ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Loading...
              </>
            ) : (
              'Load More'
            )}
          </Button>
        </div>
      )}

      {/* Warn Dialog */}
      <Dialog open={actionDialog === 'warn'} onOpenChange={() => closeActionDialog()}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Issue Warning</DialogTitle>
            <DialogDescription>
              Send a warning to this user.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="warn-message">Warning Message *</Label>
              <Textarea
                id="warn-message"
                placeholder="Explain the reason for this warning..."
                value={message}
                onChange={(e) => setMessage(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={closeActionDialog} disabled={processing}>
              Cancel
            </Button>
            <Button
              onClick={handleWarn}
              disabled={processing || !message.trim()}
              className="bg-yellow-600 hover:bg-yellow-700"
            >
              {processing && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Issue Warning
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Suspend Dialog */}
      <Dialog open={actionDialog === 'suspend'} onOpenChange={() => closeActionDialog()}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Suspend User</DialogTitle>
            <DialogDescription>
              Temporarily suspend this user from the platform.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Duration</Label>
              <Select value={duration} onValueChange={(v) => setDuration(v as typeof duration)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1_day">1 Day</SelectItem>
                  <SelectItem value="3_days">3 Days</SelectItem>
                  <SelectItem value="7_days">7 Days</SelectItem>
                  <SelectItem value="30_days">30 Days</SelectItem>
                  <SelectItem value="custom">Custom</SelectItem>
                </SelectContent>
              </Select>
            </div>
            {duration === 'custom' && (
              <div className="space-y-2">
                <Label htmlFor="custom-days">Number of Days</Label>
                <Input
                  id="custom-days"
                  type="number"
                  min={1}
                  max={365}
                  value={customDays}
                  onChange={(e) => setCustomDays(parseInt(e.target.value) || 1)}
                />
              </div>
            )}
            <div className="space-y-2">
              <Label htmlFor="suspend-reason">Reason *</Label>
              <Textarea
                id="suspend-reason"
                placeholder="Reason for suspension..."
                value={reason}
                onChange={(e) => setReason(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={closeActionDialog} disabled={processing}>
              Cancel
            </Button>
            <Button
              onClick={handleSuspend}
              disabled={processing || !reason.trim()}
              className="bg-orange-600 hover:bg-orange-700"
            >
              {processing && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Suspend User
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Ban Dialog */}
      <Dialog open={actionDialog === 'ban'} onOpenChange={() => closeActionDialog()}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Ban User</DialogTitle>
            <DialogDescription>
              Permanently ban this user from the platform.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="ban-reason">Reason *</Label>
              <Textarea
                id="ban-reason"
                placeholder="Reason for banning..."
                value={reason}
                onChange={(e) => setReason(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={closeActionDialog} disabled={processing}>
              Cancel
            </Button>
            <Button
              onClick={handleBan}
              disabled={processing || !reason.trim()}
              variant="destructive"
            >
              {processing && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Ban User
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
