"use client"

import { useMutation, useQueryClient } from '@tanstack/react-query'
import { createClient } from '@/lib/supabase/client'
import type { ListingModerationStatus } from '@/types'

interface ActionContext {
  adminId: string
  listingId: number
}

interface ApproveListingParams extends ActionContext {
  internalNotes?: string
}

interface RejectListingParams extends ActionContext {
  reason: string
  internalNotes?: string
}

interface RemoveListingParams extends ActionContext {
  reason: string
  notifySeller: boolean
  internalNotes?: string
}

interface BulkActionParams {
  adminId: string
  listingIds: number[]
}

interface BulkRemoveParams extends BulkActionParams {
  reason: string
}

// Helper to log audit entry
async function logAuditEntry(
  supabase: ReturnType<typeof createClient>,
  adminId: string,
  action: string,
  targetId: string,
  details: Record<string, unknown>
) {
  const { error } = await supabase.from('admin_audit_log').insert({
    admin_id: adminId,
    action,
    target_type: 'listing',
    target_id: targetId,
    details,
  })

  if (error) {
    console.error('Failed to log audit entry:', error)
  }
}

// Approve listing
async function approveListing(params: ApproveListingParams): Promise<void> {
  const supabase = createClient()

  const { error } = await supabase
    .from('listings')
    .update({
      moderation_status: 'approved' as ListingModerationStatus,
    })
    .eq('id', params.listingId)

  if (error) throw error

  await logAuditEntry(supabase, params.adminId, 'listing_approved', params.listingId.toString(), {
    listing_id: params.listingId,
    internal_notes: params.internalNotes,
  })
}

// Reject listing
async function rejectListing(params: RejectListingParams): Promise<void> {
  const supabase = createClient()

  const { error } = await supabase
    .from('listings')
    .update({
      moderation_status: 'rejected' as ListingModerationStatus,
      removal_reason: params.reason,
    })
    .eq('id', params.listingId)

  if (error) throw error

  await logAuditEntry(supabase, params.adminId, 'listing_rejected', params.listingId.toString(), {
    listing_id: params.listingId,
    reason: params.reason,
    internal_notes: params.internalNotes,
  })
}

// Remove listing
async function removeListing(params: RemoveListingParams): Promise<void> {
  const supabase = createClient()

  const { error } = await supabase
    .from('listings')
    .update({
      moderation_status: 'removed' as ListingModerationStatus,
      removal_reason: params.reason,
      removed_by: params.adminId,
      removed_at: new Date().toISOString(),
    })
    .eq('id', params.listingId)

  if (error) throw error

  await logAuditEntry(supabase, params.adminId, 'listing_removed', params.listingId.toString(), {
    listing_id: params.listingId,
    reason: params.reason,
    notify_seller: params.notifySeller,
    internal_notes: params.internalNotes,
  })
}

// Restore listing (undo removal)
async function restoreListing(params: ActionContext): Promise<void> {
  const supabase = createClient()

  const { error } = await supabase
    .from('listings')
    .update({
      moderation_status: 'approved' as ListingModerationStatus,
      removal_reason: null,
      removed_by: null,
      removed_at: null,
    })
    .eq('id', params.listingId)

  if (error) throw error

  await logAuditEntry(supabase, params.adminId, 'listing_restored', params.listingId.toString(), {
    listing_id: params.listingId,
  })
}

// Bulk approve listings
async function bulkApprove(params: BulkActionParams): Promise<void> {
  const supabase = createClient()

  const { error } = await supabase
    .from('listings')
    .update({
      moderation_status: 'approved' as ListingModerationStatus,
    })
    .in('id', params.listingIds)

  if (error) throw error

  // Log each listing individually
  for (const listingId of params.listingIds) {
    await logAuditEntry(supabase, params.adminId, 'listing_approved', listingId.toString(), {
      listing_id: listingId,
      bulk_action: true,
    })
  }
}

// Bulk remove listings
async function bulkRemove(params: BulkRemoveParams): Promise<void> {
  const supabase = createClient()

  const { error } = await supabase
    .from('listings')
    .update({
      moderation_status: 'removed' as ListingModerationStatus,
      removal_reason: params.reason,
      removed_by: params.adminId,
      removed_at: new Date().toISOString(),
    })
    .in('id', params.listingIds)

  if (error) throw error

  // Log each listing individually
  for (const listingId of params.listingIds) {
    await logAuditEntry(supabase, params.adminId, 'listing_removed', listingId.toString(), {
      listing_id: listingId,
      reason: params.reason,
      bulk_action: true,
    })
  }
}

export function useListingActions() {
  const queryClient = useQueryClient()

  const invalidateQueries = () => {
    queryClient.invalidateQueries({ queryKey: ['listings'] })
    queryClient.invalidateQueries({ queryKey: ['listing'] })
  }

  const approveMutation = useMutation({
    mutationFn: approveListing,
    onSuccess: invalidateQueries,
  })

  const rejectMutation = useMutation({
    mutationFn: rejectListing,
    onSuccess: invalidateQueries,
  })

  const removeMutation = useMutation({
    mutationFn: removeListing,
    onSuccess: invalidateQueries,
  })

  const restoreMutation = useMutation({
    mutationFn: restoreListing,
    onSuccess: invalidateQueries,
  })

  const bulkApproveMutation = useMutation({
    mutationFn: bulkApprove,
    onSuccess: invalidateQueries,
  })

  const bulkRemoveMutation = useMutation({
    mutationFn: bulkRemove,
    onSuccess: invalidateQueries,
  })

  return {
    approve: approveMutation,
    reject: rejectMutation,
    remove: removeMutation,
    restore: restoreMutation,
    bulkApprove: bulkApproveMutation,
    bulkRemove: bulkRemoveMutation,
  }
}
