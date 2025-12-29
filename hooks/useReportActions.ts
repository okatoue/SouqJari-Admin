"use client"

import { useMutation, useQueryClient } from '@tanstack/react-query'
import { createClient } from '@/lib/supabase/client'
import type { ReportResolution } from '@/types'

interface ActionContext {
  adminId: string
  reportId: string
}

interface DismissParams extends ActionContext {
  reason?: string
}

interface WarnUserParams extends ActionContext {
  userId: string
  message: string
  internalNotes?: string
}

interface RemoveListingParams extends ActionContext {
  listingId: number
  reason: string
  notifySeller: boolean
  internalNotes?: string
}

interface SuspendUserParams extends ActionContext {
  userId: string
  duration: '1_day' | '3_days' | '7_days' | '30_days' | 'custom'
  customDays?: number
  reason: string
  internalNotes?: string
}

interface BanUserParams extends ActionContext {
  userId: string
  reason: string
  internalNotes?: string
}

interface UpdateNotesParams {
  reportId: string
  notes: string
}

// Helper to log audit entry
async function logAuditEntry(
  supabase: ReturnType<typeof createClient>,
  adminId: string,
  action: string,
  targetType: 'user' | 'listing' | 'report',
  targetId: string,
  details: Record<string, unknown>
) {
  const { error } = await supabase.from('admin_audit_log').insert({
    admin_id: adminId,
    action,
    target_type: targetType,
    target_id: targetId,
    details,
  })

  if (error) {
    console.error('Failed to log audit entry:', error)
  }
}

// Helper to calculate suspension end date
function calculateSuspensionEnd(
  duration: SuspendUserParams['duration'],
  customDays?: number
): Date {
  const now = new Date()
  let days = 1

  switch (duration) {
    case '1_day':
      days = 1
      break
    case '3_days':
      days = 3
      break
    case '7_days':
      days = 7
      break
    case '30_days':
      days = 30
      break
    case 'custom':
      days = customDays || 1
      break
  }

  return new Date(now.getTime() + days * 24 * 60 * 60 * 1000)
}

// Dismiss report
async function dismissReport(params: DismissParams): Promise<void> {
  const supabase = createClient()

  const { error } = await supabase
    .from('reports')
    .update({
      status: 'dismissed',
      resolution: 'no_action' as ReportResolution,
      resolved_by: params.adminId,
      resolved_at: new Date().toISOString(),
      admin_notes: params.reason || null,
    })
    .eq('id', params.reportId)

  if (error) throw error

  await logAuditEntry(supabase, params.adminId, 'report_dismissed', 'report', params.reportId, {
    report_id: params.reportId,
    reason: params.reason,
  })
}

// Warn user
async function warnUser(params: WarnUserParams): Promise<void> {
  const supabase = createClient()

  // Update user profile
  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('warning_count')
    .eq('id', params.userId)
    .single()

  if (profileError) throw profileError

  const newWarningCount = (profile?.warning_count || 0) + 1

  const { error: updateError } = await supabase
    .from('profiles')
    .update({
      warning_count: newWarningCount,
      moderation_status: newWarningCount >= 3 ? 'warned' : 'active',
    })
    .eq('id', params.userId)

  if (updateError) throw updateError

  // Update report status
  const { error: reportError } = await supabase
    .from('reports')
    .update({
      status: 'resolved',
      resolution: 'warning_issued' as ReportResolution,
      resolved_by: params.adminId,
      resolved_at: new Date().toISOString(),
      admin_notes: params.internalNotes || null,
    })
    .eq('id', params.reportId)

  if (reportError) throw reportError

  await logAuditEntry(supabase, params.adminId, 'warning_issued', 'user', params.userId, {
    report_id: params.reportId,
    message: params.message,
    internal_notes: params.internalNotes,
    new_warning_count: newWarningCount,
  })
}

// Remove listing
async function removeListing(params: RemoveListingParams): Promise<void> {
  const supabase = createClient()

  // Update listing
  const { error: listingError } = await supabase
    .from('listings')
    .update({
      moderation_status: 'removed',
      removal_reason: params.reason,
      removed_by: params.adminId,
      removed_at: new Date().toISOString(),
    })
    .eq('id', params.listingId)

  if (listingError) throw listingError

  // Update report status
  const { error: reportError } = await supabase
    .from('reports')
    .update({
      status: 'resolved',
      resolution: 'listing_removed' as ReportResolution,
      resolved_by: params.adminId,
      resolved_at: new Date().toISOString(),
      admin_notes: params.internalNotes || null,
    })
    .eq('id', params.reportId)

  if (reportError) throw reportError

  await logAuditEntry(supabase, params.adminId, 'listing_removed', 'listing', params.listingId.toString(), {
    report_id: params.reportId,
    reason: params.reason,
    notify_seller: params.notifySeller,
    internal_notes: params.internalNotes,
  })
}

// Suspend user
async function suspendUser(params: SuspendUserParams): Promise<void> {
  const supabase = createClient()

  const suspensionEnd = calculateSuspensionEnd(params.duration, params.customDays)

  // Update user profile
  const { error: profileError } = await supabase
    .from('profiles')
    .update({
      moderation_status: 'suspended',
      suspension_until: suspensionEnd.toISOString(),
    })
    .eq('id', params.userId)

  if (profileError) throw profileError

  // Update report status
  const { error: reportError } = await supabase
    .from('reports')
    .update({
      status: 'resolved',
      resolution: 'user_suspended' as ReportResolution,
      resolved_by: params.adminId,
      resolved_at: new Date().toISOString(),
      admin_notes: params.internalNotes || null,
    })
    .eq('id', params.reportId)

  if (reportError) throw reportError

  await logAuditEntry(supabase, params.adminId, 'user_suspended', 'user', params.userId, {
    report_id: params.reportId,
    duration: params.duration,
    custom_days: params.customDays,
    suspension_until: suspensionEnd.toISOString(),
    reason: params.reason,
    internal_notes: params.internalNotes,
  })
}

// Ban user
async function banUser(params: BanUserParams): Promise<void> {
  const supabase = createClient()

  // Update user profile
  const { error: profileError } = await supabase
    .from('profiles')
    .update({
      moderation_status: 'banned',
      ban_reason: params.reason,
      suspension_until: null,
    })
    .eq('id', params.userId)

  if (profileError) throw profileError

  // Update report status
  const { error: reportError } = await supabase
    .from('reports')
    .update({
      status: 'resolved',
      resolution: 'user_banned' as ReportResolution,
      resolved_by: params.adminId,
      resolved_at: new Date().toISOString(),
      admin_notes: params.internalNotes || null,
    })
    .eq('id', params.reportId)

  if (reportError) throw reportError

  await logAuditEntry(supabase, params.adminId, 'user_banned', 'user', params.userId, {
    report_id: params.reportId,
    reason: params.reason,
    internal_notes: params.internalNotes,
  })
}

// Update admin notes
async function updateAdminNotes(params: UpdateNotesParams): Promise<void> {
  const supabase = createClient()

  const { error } = await supabase
    .from('reports')
    .update({
      admin_notes: params.notes,
    })
    .eq('id', params.reportId)

  if (error) throw error
}

// Mark report as under review
async function markUnderReview(params: ActionContext): Promise<void> {
  const supabase = createClient()

  const { error } = await supabase
    .from('reports')
    .update({
      status: 'under_review',
    })
    .eq('id', params.reportId)

  if (error) throw error

  await logAuditEntry(supabase, params.adminId, 'report_reviewed', 'report', params.reportId, {
    report_id: params.reportId,
  })
}

export function useReportActions() {
  const queryClient = useQueryClient()

  const invalidateQueries = () => {
    queryClient.invalidateQueries({ queryKey: ['reports'] })
    queryClient.invalidateQueries({ queryKey: ['report'] })
  }

  const dismissMutation = useMutation({
    mutationFn: dismissReport,
    onSuccess: invalidateQueries,
  })

  const warnMutation = useMutation({
    mutationFn: warnUser,
    onSuccess: invalidateQueries,
  })

  const removeListingMutation = useMutation({
    mutationFn: removeListing,
    onSuccess: invalidateQueries,
  })

  const suspendMutation = useMutation({
    mutationFn: suspendUser,
    onSuccess: invalidateQueries,
  })

  const banMutation = useMutation({
    mutationFn: banUser,
    onSuccess: invalidateQueries,
  })

  const updateNotesMutation = useMutation({
    mutationFn: updateAdminNotes,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['report'] })
    },
  })

  const markUnderReviewMutation = useMutation({
    mutationFn: markUnderReview,
    onSuccess: invalidateQueries,
  })

  return {
    dismiss: dismissMutation,
    warn: warnMutation,
    removeListing: removeListingMutation,
    suspend: suspendMutation,
    ban: banMutation,
    updateNotes: updateNotesMutation,
    markUnderReview: markUnderReviewMutation,
  }
}
