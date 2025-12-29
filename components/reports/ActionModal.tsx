"use client"

import { useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Checkbox } from '@/components/ui/checkbox'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { AlertTriangle, Ban, Clock, Trash2, XCircle, Loader2 } from 'lucide-react'

export type ActionType = 'dismiss' | 'warn' | 'remove_listing' | 'suspend' | 'ban'

interface ActionModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  actionType: ActionType
  onConfirm: (data: ActionData) => void
  isLoading?: boolean
  targetName?: string
  canSuspend?: boolean
  canBan?: boolean
}

export interface ActionData {
  reason?: string
  message?: string
  internalNotes?: string
  notifySeller?: boolean
  duration?: '1_day' | '3_days' | '7_days' | '30_days' | 'custom'
  customDays?: number
}

const ACTION_CONFIG = {
  dismiss: {
    title: 'Dismiss Report',
    description: 'Dismiss this report without taking action.',
    icon: XCircle,
    confirmText: 'Dismiss Report',
    variant: 'secondary' as const,
  },
  warn: {
    title: 'Warn User',
    description: 'Issue a warning to the reported user.',
    icon: AlertTriangle,
    confirmText: 'Issue Warning',
    variant: 'warning' as const,
  },
  remove_listing: {
    title: 'Remove Listing',
    description: 'Remove this listing from the marketplace.',
    icon: Trash2,
    confirmText: 'Remove Listing',
    variant: 'destructive' as const,
  },
  suspend: {
    title: 'Suspend User',
    description: 'Temporarily suspend this user from the platform.',
    icon: Clock,
    confirmText: 'Suspend User',
    variant: 'warning' as const,
  },
  ban: {
    title: 'Ban User',
    description: 'Permanently ban this user from the platform.',
    icon: Ban,
    confirmText: 'Ban User',
    variant: 'destructive' as const,
  },
}

export function ActionModal({
  open,
  onOpenChange,
  actionType,
  onConfirm,
  isLoading,
  targetName,
  canSuspend = true,
  canBan = true,
}: ActionModalProps) {
  const [data, setData] = useState<ActionData>({
    notifySeller: true,
    duration: '7_days',
  })

  const config = ACTION_CONFIG[actionType]
  const Icon = config.icon

  const handleConfirm = () => {
    onConfirm(data)
  }

  const updateData = (updates: Partial<ActionData>) => {
    setData((prev) => ({ ...prev, ...updates }))
  }

  const isValid = () => {
    switch (actionType) {
      case 'dismiss':
        return true
      case 'warn':
        return !!data.message?.trim()
      case 'remove_listing':
        return !!data.reason?.trim()
      case 'suspend':
        return !!data.reason?.trim() && (data.duration !== 'custom' || (data.customDays && data.customDays > 0))
      case 'ban':
        return !!data.reason?.trim()
      default:
        return false
    }
  }

  // Check permission restrictions
  const isRestricted =
    (actionType === 'suspend' && !canSuspend) ||
    (actionType === 'ban' && !canBan)

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <div className="flex items-center gap-3">
            <div
              className={`p-2 rounded-lg ${
                config.variant === 'destructive'
                  ? 'bg-red-100'
                  : config.variant === 'warning'
                  ? 'bg-yellow-100'
                  : 'bg-gray-100'
              }`}
            >
              <Icon
                className={`h-5 w-5 ${
                  config.variant === 'destructive'
                    ? 'text-red-600'
                    : config.variant === 'warning'
                    ? 'text-yellow-600'
                    : 'text-gray-600'
                }`}
              />
            </div>
            <div>
              <DialogTitle>{config.title}</DialogTitle>
              <DialogDescription>{config.description}</DialogDescription>
            </div>
          </div>
        </DialogHeader>

        {isRestricted && (
          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              You don&apos;t have permission to {actionType === 'suspend' ? 'suspend' : 'ban'} users.
              Only Admins and Super Admins can perform this action.
            </AlertDescription>
          </Alert>
        )}

        <div className="space-y-4 py-4">
          {targetName && (
            <p className="text-sm text-muted-foreground">
              Target: <span className="font-medium text-foreground">{targetName}</span>
            </p>
          )}

          {/* Dismiss - Optional reason */}
          {actionType === 'dismiss' && (
            <div className="space-y-2">
              <Label htmlFor="reason">Reason (optional)</Label>
              <Textarea
                id="reason"
                placeholder="Why is this report being dismissed?"
                value={data.reason || ''}
                onChange={(e) => updateData({ reason: e.target.value })}
              />
            </div>
          )}

          {/* Warn - Message required */}
          {actionType === 'warn' && (
            <>
              <div className="space-y-2">
                <Label htmlFor="message">Warning Message *</Label>
                <Textarea
                  id="message"
                  placeholder="This message will be shown to the user..."
                  value={data.message || ''}
                  onChange={(e) => updateData({ message: e.target.value })}
                  className="min-h-[100px]"
                />
                <p className="text-xs text-muted-foreground">
                  This message will be visible to the user.
                </p>
              </div>
              <div className="space-y-2">
                <Label htmlFor="internalNotes">Internal Notes (optional)</Label>
                <Textarea
                  id="internalNotes"
                  placeholder="Notes for other admins..."
                  value={data.internalNotes || ''}
                  onChange={(e) => updateData({ internalNotes: e.target.value })}
                />
              </div>
            </>
          )}

          {/* Remove Listing - Reason required */}
          {actionType === 'remove_listing' && (
            <>
              <div className="space-y-2">
                <Label htmlFor="reason">Removal Reason *</Label>
                <Textarea
                  id="reason"
                  placeholder="Why is this listing being removed?"
                  value={data.reason || ''}
                  onChange={(e) => updateData({ reason: e.target.value })}
                />
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="notify"
                  checked={data.notifySeller}
                  onCheckedChange={(checked) =>
                    updateData({ notifySeller: checked as boolean })
                  }
                />
                <Label htmlFor="notify" className="text-sm font-normal">
                  Notify seller about removal
                </Label>
              </div>
              <div className="space-y-2">
                <Label htmlFor="internalNotes">Internal Notes (optional)</Label>
                <Textarea
                  id="internalNotes"
                  placeholder="Notes for other admins..."
                  value={data.internalNotes || ''}
                  onChange={(e) => updateData({ internalNotes: e.target.value })}
                />
              </div>
            </>
          )}

          {/* Suspend - Duration and reason required */}
          {actionType === 'suspend' && (
            <>
              <div className="space-y-2">
                <Label htmlFor="duration">Suspension Duration *</Label>
                <Select
                  value={data.duration}
                  onValueChange={(v) =>
                    updateData({ duration: v as ActionData['duration'] })
                  }
                  disabled={isRestricted}
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
              {data.duration === 'custom' && (
                <div className="space-y-2">
                  <Label htmlFor="customDays">Number of Days</Label>
                  <Input
                    id="customDays"
                    type="number"
                    min="1"
                    max="365"
                    value={data.customDays || ''}
                    onChange={(e) =>
                      updateData({ customDays: parseInt(e.target.value) || undefined })
                    }
                    disabled={isRestricted}
                  />
                </div>
              )}
              <div className="space-y-2">
                <Label htmlFor="reason">Suspension Reason *</Label>
                <Textarea
                  id="reason"
                  placeholder="This reason will be shown to the user..."
                  value={data.reason || ''}
                  onChange={(e) => updateData({ reason: e.target.value })}
                  disabled={isRestricted}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="internalNotes">Internal Notes (optional)</Label>
                <Textarea
                  id="internalNotes"
                  placeholder="Notes for other admins..."
                  value={data.internalNotes || ''}
                  onChange={(e) => updateData({ internalNotes: e.target.value })}
                  disabled={isRestricted}
                />
              </div>
            </>
          )}

          {/* Ban - Reason required */}
          {actionType === 'ban' && (
            <>
              <Alert variant="destructive">
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>
                  This action is permanent and cannot be undone. The user will be
                  permanently banned from the platform.
                </AlertDescription>
              </Alert>
              <div className="space-y-2">
                <Label htmlFor="reason">Ban Reason *</Label>
                <Textarea
                  id="reason"
                  placeholder="This reason will be shown to the user..."
                  value={data.reason || ''}
                  onChange={(e) => updateData({ reason: e.target.value })}
                  disabled={isRestricted}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="internalNotes">Internal Notes (optional)</Label>
                <Textarea
                  id="internalNotes"
                  placeholder="Notes for other admins..."
                  value={data.internalNotes || ''}
                  onChange={(e) => updateData({ internalNotes: e.target.value })}
                  disabled={isRestricted}
                />
              </div>
            </>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button
            variant={config.variant === 'warning' ? 'default' : config.variant}
            onClick={handleConfirm}
            disabled={!isValid() || isLoading || isRestricted}
            className={config.variant === 'warning' ? 'bg-yellow-600 hover:bg-yellow-700' : ''}
          >
            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {config.confirmText}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
