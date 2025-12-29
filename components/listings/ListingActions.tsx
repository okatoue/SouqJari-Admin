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
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Checkbox } from '@/components/ui/checkbox'
import { CheckCircle, XCircle, Trash2, RotateCcw, Loader2 } from 'lucide-react'
import type { ListingModerationStatus } from '@/types'

interface ListingActionsProps {
  listingId: number
  currentStatus: ListingModerationStatus
  onApprove: (internalNotes?: string) => Promise<void>
  onReject: (reason: string, internalNotes?: string) => Promise<void>
  onRemove: (reason: string, notifySeller: boolean, internalNotes?: string) => Promise<void>
  onRestore?: () => Promise<void>
  isLoading?: boolean
}

type ActionType = 'approve' | 'reject' | 'remove' | null

export function ListingActions({
  listingId,
  currentStatus,
  onApprove,
  onReject,
  onRemove,
  onRestore,
  isLoading,
}: ListingActionsProps) {
  const [openDialog, setOpenDialog] = useState<ActionType>(null)
  const [reason, setReason] = useState('')
  const [internalNotes, setInternalNotes] = useState('')
  const [notifySeller, setNotifySeller] = useState(true)
  const [processing, setProcessing] = useState(false)

  const handleAction = async () => {
    setProcessing(true)
    try {
      switch (openDialog) {
        case 'approve':
          await onApprove(internalNotes || undefined)
          break
        case 'reject':
          await onReject(reason, internalNotes || undefined)
          break
        case 'remove':
          await onRemove(reason, notifySeller, internalNotes || undefined)
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
    setReason('')
    setInternalNotes('')
    setNotifySeller(true)
  }

  const handleRestore = async () => {
    if (!onRestore) return
    setProcessing(true)
    try {
      await onRestore()
    } catch (error) {
      console.error('Restore failed:', error)
    } finally {
      setProcessing(false)
    }
  }

  const disabled = isLoading || processing

  return (
    <>
      <div className="flex flex-wrap gap-2">
        {/* Approve Button */}
        {(currentStatus === 'pending' || currentStatus === 'rejected') && (
          <Button
            onClick={() => setOpenDialog('approve')}
            disabled={disabled}
            className="bg-green-600 hover:bg-green-700"
          >
            <CheckCircle className="mr-2 h-4 w-4" />
            Approve
          </Button>
        )}

        {/* Reject Button */}
        {currentStatus === 'pending' && (
          <Button
            variant="outline"
            onClick={() => setOpenDialog('reject')}
            disabled={disabled}
            className="border-red-500 text-red-600 hover:bg-red-50"
          >
            <XCircle className="mr-2 h-4 w-4" />
            Reject
          </Button>
        )}

        {/* Remove Button */}
        {currentStatus !== 'removed' && (
          <Button
            variant="destructive"
            onClick={() => setOpenDialog('remove')}
            disabled={disabled}
          >
            <Trash2 className="mr-2 h-4 w-4" />
            Remove
          </Button>
        )}

        {/* Restore Button */}
        {currentStatus === 'removed' && onRestore && (
          <Button
            variant="outline"
            onClick={handleRestore}
            disabled={disabled}
          >
            {processing ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <RotateCcw className="mr-2 h-4 w-4" />
            )}
            Restore Listing
          </Button>
        )}
      </div>

      {/* Approve Dialog */}
      <Dialog open={openDialog === 'approve'} onOpenChange={(open) => !open && closeDialog()}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Approve Listing</DialogTitle>
            <DialogDescription>
              This listing will be approved and visible to all users.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="internal-notes">Internal Notes (optional)</Label>
              <Textarea
                id="internal-notes"
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
              Approve
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Reject Dialog */}
      <Dialog open={openDialog === 'reject'} onOpenChange={(open) => !open && closeDialog()}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reject Listing</DialogTitle>
            <DialogDescription>
              Please provide a reason for rejecting this listing. The seller will be notified.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="reject-reason">Reason *</Label>
              <Textarea
                id="reject-reason"
                placeholder="Reason for rejection..."
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="reject-notes">Internal Notes (optional)</Label>
              <Textarea
                id="reject-notes"
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
              Reject
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Remove Dialog */}
      <Dialog open={openDialog === 'remove'} onOpenChange={(open) => !open && closeDialog()}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Remove Listing</DialogTitle>
            <DialogDescription>
              This action will remove the listing from the marketplace. This can be undone later.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="remove-reason">Reason *</Label>
              <Textarea
                id="remove-reason"
                placeholder="Reason for removal..."
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                required
              />
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox
                id="notify-seller"
                checked={notifySeller}
                onCheckedChange={(checked) => setNotifySeller(checked as boolean)}
              />
              <Label htmlFor="notify-seller" className="text-sm font-normal">
                Notify seller about this removal
              </Label>
            </div>
            <div className="space-y-2">
              <Label htmlFor="remove-notes">Internal Notes (optional)</Label>
              <Textarea
                id="remove-notes"
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
              Remove Listing
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
