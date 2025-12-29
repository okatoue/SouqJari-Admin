"use client"

import { useInfiniteQuery } from '@tanstack/react-query'
import { createClient } from '@/lib/supabase/client'
import type { Listing, ListingModerationStatus } from '@/types'

export interface UseListingsOptions {
  search?: string
  categoryId?: number
  subcategoryId?: number
  status?: 'active' | 'sold' | 'inactive' | 'all'
  moderationStatus?: ListingModerationStatus | 'all'
  priceMin?: number
  priceMax?: number
  dateFrom?: Date
  dateTo?: Date
  hasImages?: boolean | 'all'
  location?: string
  sortBy?: 'created_at' | 'price' | 'title'
  sortOrder?: 'asc' | 'desc'
  pageSize?: number
}

interface ListingsPage {
  data: Listing[]
  nextPage: number | null
  totalCount: number
}

async function fetchListings(
  options: UseListingsOptions,
  pageParam: number
): Promise<ListingsPage> {
  const supabase = createClient()
  const pageSize = options.pageSize || 25
  const from = pageParam * pageSize
  const to = from + pageSize - 1

  // Build query with seller profile join
  let query = supabase
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
        warning_count
      )
    `, { count: 'exact' })

  // Search filter (title and description)
  if (options.search) {
    query = query.or(`title.ilike.%${options.search}%,description.ilike.%${options.search}%`)
  }

  // Category filter
  if (options.categoryId) {
    query = query.eq('category_id', options.categoryId)
  }

  // Subcategory filter
  if (options.subcategoryId) {
    query = query.eq('subcategory_id', options.subcategoryId)
  }

  // Status filter
  if (options.status && options.status !== 'all') {
    query = query.eq('status', options.status)
  }

  // Moderation status filter
  if (options.moderationStatus && options.moderationStatus !== 'all') {
    query = query.eq('moderation_status', options.moderationStatus)
  }

  // Price range filters
  if (options.priceMin !== undefined) {
    query = query.gte('price', options.priceMin)
  }
  if (options.priceMax !== undefined) {
    query = query.lte('price', options.priceMax)
  }

  // Date range filters
  if (options.dateFrom) {
    query = query.gte('created_at', options.dateFrom.toISOString())
  }
  if (options.dateTo) {
    query = query.lte('created_at', options.dateTo.toISOString())
  }

  // Has images filter
  if (options.hasImages === true) {
    query = query.not('images', 'eq', '{}')
  } else if (options.hasImages === false) {
    query = query.eq('images', '{}')
  }

  // Location filter
  if (options.location) {
    query = query.ilike('location', `%${options.location}%`)
  }

  // Sorting
  const sortBy = options.sortBy || 'created_at'
  const sortOrder = options.sortOrder || 'desc'
  query = query.order(sortBy, { ascending: sortOrder === 'asc' })

  // Pagination
  query = query.range(from, to)

  const { data, error, count } = await query

  if (error) {
    throw error
  }

  const totalCount = count || 0
  const hasMore = to < totalCount - 1

  return {
    data: data as Listing[],
    nextPage: hasMore ? pageParam + 1 : null,
    totalCount,
  }
}

export function useListings(options: UseListingsOptions = {}) {
  return useInfiniteQuery({
    queryKey: ['listings', options],
    queryFn: ({ pageParam }) => fetchListings(options, pageParam),
    initialPageParam: 0,
    getNextPageParam: (lastPage) => lastPage.nextPage,
    refetchOnWindowFocus: false,
  })
}

// Helper to get flat list of all listings from pages
export function flattenListings(pages: ListingsPage[] | undefined): Listing[] {
  if (!pages) return []
  return pages.flatMap((page) => page.data)
}
