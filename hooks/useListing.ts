"use client"

import { useQuery } from '@tanstack/react-query'
import { createClient } from '@/lib/supabase/client'
import type { Listing, Report, AuditLogEntry, Profile } from '@/types'

interface ListingWithDetails extends Listing {
  seller?: Profile
  reports?: Report[]
  auditLog?: AuditLogEntry[]
}

async function fetchListing(id: number): Promise<ListingWithDetails | null> {
  const supabase = createClient()

  // Fetch listing without joins - relationships may not be configured
  const { data: listing, error: listingError } = await supabase
    .from('listings')
    .select('*')
    .eq('id', id)
    .single()

  if (listingError) {
    if (listingError.code === 'PGRST116') {
      return null // Not found
    }
    throw listingError
  }

  // Fetch seller profile separately
  let seller: Profile | undefined
  if (listing.user_id) {
    const { data: sellerData, error: sellerError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', listing.user_id)
      .single()

    if (!sellerError && sellerData) {
      seller = sellerData as Profile
    }
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

  // Fetch audit log for this listing (without joins)
  const { data: auditLog, error: auditError } = await supabase
    .from('admin_audit_log')
    .select('*')
    .eq('target_type', 'listing')
    .eq('target_id', id.toString())
    .order('created_at', { ascending: false })

  if (auditError) {
    console.error('Error fetching audit log:', auditError)
  }

  return {
    ...listing,
    seller,
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
