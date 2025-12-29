"use client"

import { useQuery } from '@tanstack/react-query'
import { createClient } from '@/lib/supabase/client'
import type { Profile, Listing, Report, AuditLogEntry, UserFeedback } from '@/types'

interface UserWithDetails extends Profile {
  listings?: Listing[]
  reportsAgainst?: Report[]
  reportsFiled?: Report[]
  feedback?: UserFeedback[]
  auditLog?: AuditLogEntry[]
}

async function fetchUser(id: string): Promise<UserWithDetails | null> {
  const supabase = createClient()

  // Fetch user profile
  const { data: user, error: userError } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', id)
    .single()

  if (userError) {
    if (userError.code === 'PGRST116') {
      return null // Not found
    }
    throw userError
  }

  // Fetch user's listings
  const { data: listings, error: listingsError } = await supabase
    .from('listings')
    .select('*')
    .eq('user_id', id)
    .order('created_at', { ascending: false })

  if (listingsError) {
    console.error('Error fetching listings:', listingsError)
  }

  // Fetch reports against this user
  const { data: reportsAgainst, error: reportsAgainstError } = await supabase
    .from('reports')
    .select('*')
    .eq('reported_user_id', id)
    .order('created_at', { ascending: false })

  if (reportsAgainstError) {
    console.error('Error fetching reports against:', reportsAgainstError)
  }

  // Fetch reports filed by this user
  const { data: reportsFiled, error: reportsFiledError } = await supabase
    .from('reports')
    .select('*')
    .eq('reporter_id', id)
    .order('created_at', { ascending: false })

  if (reportsFiledError) {
    console.error('Error fetching reports filed:', reportsFiledError)
  }

  // Fetch user's feedback
  const { data: feedback, error: feedbackError } = await supabase
    .from('user_feedback')
    .select('*')
    .eq('user_id', id)
    .order('created_at', { ascending: false })

  if (feedbackError) {
    console.error('Error fetching feedback:', feedbackError)
  }

  // Fetch audit log for this user (without joins - relationships may not be configured)
  const { data: auditLog, error: auditError } = await supabase
    .from('admin_audit_log')
    .select('*')
    .eq('target_type', 'user')
    .eq('target_id', id)
    .order('created_at', { ascending: false })

  if (auditError) {
    console.error('Error fetching audit log:', auditError)
  }

  return {
    ...user,
    listings: listings || [],
    reportsAgainst: reportsAgainst || [],
    reportsFiled: reportsFiled || [],
    feedback: feedback || [],
    auditLog: auditLog || [],
  } as UserWithDetails
}

export function useUser(id: string | null) {
  return useQuery({
    queryKey: ['user', id],
    queryFn: () => (id ? fetchUser(id) : null),
    enabled: id !== null,
    refetchOnWindowFocus: false,
  })
}
