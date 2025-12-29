"use client"

import { useState } from 'react'
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
import { AlertTriangle, Clock, Ban, RotateCcw, RefreshCw, Loader2 } from 'lucide-react'
import type { ModerationStatus } from '@/types'

interface UserActionsProps {
  userId: string
  currentStatus: ModerationStatus
  warningCount: number
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

type ActionType = 'warn' | 'suspend' | 'ban' | 'reactivate' | null

export function UserActions({
  userId,
  currentStatus,
  warningCount,
  onWarn,
  onSuspend,
  onBan,
  onReactivate,
  onResetWarnings,
  isLoading,
}: UserActionsProps) {
  const [openDialog, setOpenDialog] = useState<ActionType>(null)
  const [message, setMessage] = useState('')
  const [reason, setReason] = useState('')
  const [internalNotes, setInternalNotes] = useState('')
  const [duration, setDuration] = useState<'1_day' | '3_days' | '7_days' | '30_days' | 'custom'>(
    '7_days'
  )
  const [customDays, setCustomDays] = useState<number>(14)
  const [processing, setProcessing] = useState(false)

  const handleAction = async () => {
    setProcessing(true)
    try {
      switch (openDialog) {
        case 'warn':
          await onWarn(message, internalNotes || undefined)
          break
        case 'suspend':
          await onSuspend(
            duration,
            duration === 'custom' ? customDays : undefined,
            reason,
            internalNotes || undefined
          )
          break
        case 'ban':
          await onBan(reason, internalNotes || undefined)
          break
        case 'reactivate':
          await onReactivate(internalNotes || undefined)
          break
      }
      closeDialog()
    } catch (error) {
      console.error('Action failed:', error)
    } finally {
      setProcessing(false)
    }
  }

  const closeDialog = () => {
    setOpenDialog(null)
    setMessage('')
    setReason('')
    setInternalNotes('')
    setDuration('7_days')
    setCustomDays(14)
  }

  const handleResetWarnings = async () => {
    setProcessing(true)
    try {
      await onResetWarnings()
    } catch (error) {
      console.error('Reset warnings failed:', error)
    } finally {
      setProcessing(false)
    }
  }

  const disabled = isLoading || processing

  return (
    <>
      <div className="flex flex-wrap gap-2">
        {/* Warn Button */}
        {(currentStatus === 'active' || currentStatus === 'warned') && (
          <Button
            variant="outline"
            onClick={() => setOpenDialog('warn')}
            disabled={disabled}
            className="border-yellow-500 text-yellow-600 hover:bg-yellow-50"
          >
            <AlertTriangle className="mr-2 h-4 w-4" />
            Issue Warning
          </Button>
        )}

        {/* Suspend Button */}
        {(currentStatus === 'active' || currentStatus === 'warned') && (
          <Button
            variant="outline"
            onClick={() => setOpenDialog('suspend')}
            disabled={disabled}
            className="border-orange-500 text-orange-600 hover:bg-orange-50"
          >
            <Clock className="mr-2 h-4 w-4" />
            Suspend
          </Button>
        )}

        {/* Ban Button */}
        {currentStatus !== 'banned' && (
          <Button
            variant="destructive"
            onClick={() => setOpenDialog('ban')}
            disabled={disabled}
          >
            <Ban className="mr-2 h-4 w-4" />
            Ban User
          </Button>
        )}

        {/* Reactivate Button */}
        {(currentStatus === 'suspended' || currentStatus === 'banned') && (
          <Button
            variant="outline"
            onClick={() => setOpenDialog('reactivate')}
            disabled={disabled}
            className="border-green-500 text-green-600 hover:bg-green-50"
          >
            <RotateCcw className="mr-2 h-4 w-4" />
            Reactivate
          </Button>
        )}

        {/* Reset Warnings Button */}
        {warningCount > 0 && (
          <Button
            variant="ghost"
            onClick={handleResetWarnings}
            disabled={disabled}
          >
            {processing ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <RefreshCw className="mr-2 h-4 w-4" />
            )}
            Reset Warnings
          </Button>
        )}
      </div>

      {/* Warn Dialog */}
      <Dialog open={openDialog === 'warn'} onOpenChange={(open) => !open && closeDialog()}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Issue Warning</DialogTitle>
            <DialogDescription>
              Send a warning to this user. They currently have {warningCount} warning(s).
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
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="warn-notes">Internal Notes (optional)</Label>
              <Textarea
                id="warn-notes"
                placeholder="Add any internal notes..."
                value={internalNotes}
                onChange={(e) => setInternalNotes(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={closeDialog} disabled={processing}>
              Cancel
            </Button>
            <Button
              onClick={handleAction}
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
      <Dialog open={openDialog === 'suspend'} onOpenChange={(open) => !open && closeDialog()}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Suspend User</DialogTitle>
            <DialogDescription>
              Temporarily suspend this user from the platform.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Suspension Duration</Label>
              <Select
                value={duration}
                onValueChange={(value) =>
                  setDuration(value as typeof duration)
                }
              >
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
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="suspend-notes">Internal Notes (optional)</Label>
              <Textarea
                id="suspend-notes"
                placeholder="Add any internal notes..."
                value={internalNotes}
                onChange={(e) => setInternalNotes(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={closeDialog} disabled={processing}>
              Cancel
            </Button>
            <Button
              onClick={handleAction}
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
      <Dialog open={openDialog === 'ban'} onOpenChange={(open) => !open && closeDialog()}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Ban User</DialogTitle>
            <DialogDescription>
              Permanently ban this user from the platform. This action can be undone later.
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
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="ban-notes">Internal Notes (optional)</Label>
              <Textarea
                id="ban-notes"
                placeholder="Add any internal notes..."
                value={internalNotes}
                onChange={(e) => setInternalNotes(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={closeDialog} disabled={processing}>
              Cancel
            </Button>
            <Button
              onClick={handleAction}
              disabled={processing || !reason.trim()}
              variant="destructive"
            >
              {processing && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Ban User
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Reactivate Dialog */}
      <Dialog open={openDialog === 'reactivate'} onOpenChange={(open) => !open && closeDialog()}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reactivate User</DialogTitle>
            <DialogDescription>
              Reactivate this user&apos;s account. They will regain access to the platform.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="reactivate-notes">Internal Notes (optional)</Label>
              <Textarea
                id="reactivate-notes"
                placeholder="Add any internal notes..."
                value={internalNotes}
                onChange={(e) => setInternalNotes(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={closeDialog} disabled={processing}>
              Cancel
            </Button>
            <Button
              onClick={handleAction}
              disabled={processing}
              className="bg-green-600 hover:bg-green-700"
            >
              {processing && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Reactivate User
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
