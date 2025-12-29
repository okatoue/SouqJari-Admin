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
import { CheckCircle, Trash2, X, Loader2 } from 'lucide-react'

interface BulkActionsProps {
  selectedCount: number
  onClearSelection: () => void
  onBulkApprove: () => Promise<void>
  onBulkRemove: (reason: string) => Promise<void>
  isLoading?: boolean
}

export function BulkActions({
  selectedCount,
  onClearSelection,
  onBulkApprove,
  onBulkRemove,
  isLoading,
}: BulkActionsProps) {
  const [showRemoveDialog, setShowRemoveDialog] = useState(false)
  const [reason, setReason] = useState('')
  const [processing, setProcessing] = useState(false)

  if (selectedCount === 0) {
    return null
  }

  const handleApprove = async () => {
    setProcessing(true)
    try {
      await onBulkApprove()
    } catch (error) {
      console.error('Bulk approve failed:', error)
    } finally {
      setProcessing(false)
    }
  }

  const handleRemove = async () => {
    if (!reason.trim()) return
    setProcessing(true)
    try {
      await onBulkRemove(reason)
      setShowRemoveDialog(false)
      setReason('')
    } catch (error) {
      console.error('Bulk remove failed:', error)
    } finally {
      setProcessing(false)
    }
  }

  const disabled = isLoading || processing

  return (
    <>
      <div className="flex items-center gap-4 rounded-lg border bg-muted/50 p-4">
        <span className="text-sm font-medium">
          {selectedCount} listing{selectedCount !== 1 ? 's' : ''} selected
        </span>

        <div className="flex items-center gap-2">
          <Button
            size="sm"
            onClick={handleApprove}
            disabled={disabled}
            className="bg-green-600 hover:bg-green-700"
          >
            {processing ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <CheckCircle className="mr-2 h-4 w-4" />
            )}
            Approve Selected
          </Button>

          <Button
            size="sm"
            variant="destructive"
            onClick={() => setShowRemoveDialog(true)}
            disabled={disabled}
          >
            <Trash2 className="mr-2 h-4 w-4" />
            Remove Selected
          </Button>

          <Button
            size="sm"
            variant="ghost"
            onClick={onClearSelection}
            disabled={disabled}
          >
            <X className="mr-2 h-4 w-4" />
            Clear
          </Button>
        </div>
      </div>

      {/* Bulk Remove Dialog */}
      <Dialog open={showRemoveDialog} onOpenChange={setShowRemoveDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Remove {selectedCount} Listings</DialogTitle>
            <DialogDescription>
              This will remove all selected listings from the marketplace. Please provide a reason.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="bulk-reason">Reason *</Label>
              <Textarea
                id="bulk-reason"
                placeholder="Reason for removal..."
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                required
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowRemoveDialog(false)}
              disabled={processing}
            >
              Cancel
            </Button>
            <Button
              onClick={handleRemove}
              disabled={processing || !reason.trim()}
              variant="destructive"
            >
              {processing && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Remove {selectedCount} Listings
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
