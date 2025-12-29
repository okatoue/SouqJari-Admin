"use client"

import { useMutation, useQueryClient } from '@tanstack/react-query'
import { createClient } from '@/lib/supabase/client'
import type { ModerationStatus } from '@/types'

interface ActionContext {
  adminId: string
  userId: string
}

interface WarnUserParams extends ActionContext {
  message: string
  internalNotes?: string
}

interface SuspendUserParams extends ActionContext {
  duration: '1_day' | '3_days' | '7_days' | '30_days' | 'custom'
  customDays?: number
  reason: string
  internalNotes?: string
}

interface BanUserParams extends ActionContext {
  reason: string
  internalNotes?: string
}

interface ReactivateUserParams extends ActionContext {
  internalNotes?: string
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
    target_type: 'user',
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

// Warn user
async function warnUser(params: WarnUserParams): Promise<void> {
  const supabase = createClient()

  // Get current warning count
  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('warning_count')
    .eq('id', params.userId)
    .single()

  if (profileError) throw profileError

  const newWarningCount = (profile?.warning_count || 0) + 1

  // Update user profile
  const { error: updateError } = await supabase
    .from('profiles')
    .update({
      warning_count: newWarningCount,
      moderation_status: newWarningCount >= 3 ? 'warned' : 'active',
    })
    .eq('id', params.userId)

  if (updateError) throw updateError

  await logAuditEntry(supabase, params.adminId, 'user_warned', params.userId, {
    message: params.message,
    internal_notes: params.internalNotes,
    new_warning_count: newWarningCount,
  })
}

// Suspend user
async function suspendUser(params: SuspendUserParams): Promise<void> {
  const supabase = createClient()

  const suspensionEnd = calculateSuspensionEnd(params.duration, params.customDays)

  const { error: updateError } = await supabase
    .from('profiles')
    .update({
      moderation_status: 'suspended' as ModerationStatus,
      suspension_until: suspensionEnd.toISOString(),
    })
    .eq('id', params.userId)

  if (updateError) throw updateError

  await logAuditEntry(supabase, params.adminId, 'user_suspended', params.userId, {
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

  const { error: updateError } = await supabase
    .from('profiles')
    .update({
      moderation_status: 'banned' as ModerationStatus,
      ban_reason: params.reason,
      suspension_until: null,
    })
    .eq('id', params.userId)

  if (updateError) throw updateError

  await logAuditEntry(supabase, params.adminId, 'user_banned', params.userId, {
    reason: params.reason,
    internal_notes: params.internalNotes,
  })
}

// Reactivate user (unban/unsuspend)
async function reactivateUser(params: ReactivateUserParams): Promise<void> {
  const supabase = createClient()

  const { error: updateError } = await supabase
    .from('profiles')
    .update({
      moderation_status: 'active' as ModerationStatus,
      suspension_until: null,
      ban_reason: null,
    })
    .eq('id', params.userId)

  if (updateError) throw updateError

  await logAuditEntry(supabase, params.adminId, 'user_reactivated', params.userId, {
    internal_notes: params.internalNotes,
  })
}

// Reset warning count
async function resetWarnings(params: ActionContext): Promise<void> {
  const supabase = createClient()

  const { error: updateError } = await supabase
    .from('profiles')
    .update({
      warning_count: 0,
      moderation_status: 'active' as ModerationStatus,
    })
    .eq('id', params.userId)

  if (updateError) throw updateError

  await logAuditEntry(supabase, params.adminId, 'warnings_reset', params.userId, {})
}

export function useUserActions() {
  const queryClient = useQueryClient()

  const invalidateQueries = () => {
    queryClient.invalidateQueries({ queryKey: ['users'] })
    queryClient.invalidateQueries({ queryKey: ['user'] })
  }

  const warnMutation = useMutation({
    mutationFn: warnUser,
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

  const reactivateMutation = useMutation({
    mutationFn: reactivateUser,
    onSuccess: invalidateQueries,
  })

  const resetWarningsMutation = useMutation({
    mutationFn: resetWarnings,
    onSuccess: invalidateQueries,
  })

  return {
    warn: warnMutation,
    suspend: suspendMutation,
    ban: banMutation,
    reactivate: reactivateMutation,
    resetWarnings: resetWarningsMutation,
  }
}
