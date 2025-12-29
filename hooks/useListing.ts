"use client"

import { useQuery } from '@tanstack/react-query'
import { createClient } from '@/lib/supabase/client'
import type { Listing, Report, AuditLogEntry } from '@/types'

interface ListingWithDetails extends Listing {
  reports?: Report[]
  auditLog?: AuditLogEntry[]
}

async function fetchListing(id: number): Promise<ListingWithDetails | null> {
  const supabase = createClient()

  // Fetch listing with seller profile
  const { data: listing, error: listingError } = await supabase
    .from('listings')
    .select(`
      *,
      seller:profiles!user_id (
        id,
        email,
        phone_number,
        display_name,
        avatar_url,
        email_verified,
        created_at,
        moderation_status,
        suspension_until,
        ban_reason,
        warning_count
      )
    `)
    .eq('id', id)
    .single()

  if (listingError) {
    if (listingError.code === 'PGRST116') {
      return null // Not found
    }
    throw listingError
  }

  // Fetch reports against this listing
  const { data: reports, error: reportsError } = await supabase
    .from('reports')
    .select('*')
    .eq('reported_listing_id', id)
    .order('created_at', { ascending: false })

  if (reportsError) {
    console.error('Error fetching reports:', reportsError)
  }

  // Fetch audit log for this listing
  const { data: auditLog, error: auditError } = await supabase
    .from('admin_audit_log')
    .select(`
      *,
      admin:admin_users (
        id,
        role,
        profile:profiles (
          display_name,
          email
        )
      )
    `)
    .eq('target_type', 'listing')
    .eq('target_id', id.toString())
    .order('created_at', { ascending: false })

  if (auditError) {
    console.error('Error fetching audit log:', auditError)
  }

  return {
    ...listing,
    reports: reports || [],
    auditLog: auditLog || [],
  } as ListingWithDetails
}

export function useListing(id: number | null) {
  return useQuery({
    queryKey: ['listing', id],
    queryFn: () => (id ? fetchListing(id) : null),
    enabled: id !== null,
    refetchOnWindowFocus: false,
  })
}
