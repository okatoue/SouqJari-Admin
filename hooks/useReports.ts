"use client"

import { useInfiniteQuery } from '@tanstack/react-query'
import { createClient } from '@/lib/supabase/client'
import type { Report, ReportStatus, ReportReason } from '@/types'

export interface UseReportsOptions {
  status?: ReportStatus | 'all'
  reason?: ReportReason[]
  targetType?: 'listing' | 'user' | 'all'
  dateFrom?: Date
  dateTo?: Date
  reporterId?: string
  pageSize?: number
}

interface ReportsPage {
  data: Report[]
  nextPage: number | null
  totalCount: number
}

async function fetchReports(
  options: UseReportsOptions,
  pageParam: number
): Promise<ReportsPage> {
  const supabase = createClient()
  const pageSize = options.pageSize || 25
  const from = pageParam * pageSize
  const to = from + pageSize - 1

  let query = supabase
    .from('reports')
    .select(`
      *,
      reporter:profiles!reporter_id(
        id,
        email,
        display_name,
        avatar_url,
        moderation_status,
        warning_count,
        created_at
      ),
      reported_user:profiles!reported_user_id(
        id,
        email,
        display_name,
        avatar_url,
        moderation_status,
        suspension_until,
        ban_reason,
        warning_count,
        created_at
      ),
      reported_listing:listings!reported_listing_id(
        id,
        user_id,
        title,
        description,
        price,
        currency,
        images,
        status,
        location,
        moderation_status,
        removal_reason,
        created_at,
        seller:profiles!user_id(
          id,
          email,
          display_name,
          avatar_url
        )
      )
    `, { count: 'exact' })

  // Apply status filter
  if (options.status && options.status !== 'all') {
    query = query.eq('status', options.status)
  }

  // Apply reason filter
  if (options.reason && options.reason.length > 0) {
    query = query.in('reason', options.reason)
  }

  // Apply target type filter
  if (options.targetType === 'listing') {
    query = query.not('reported_listing_id', 'is', null)
  } else if (options.targetType === 'user') {
    query = query.not('reported_user_id', 'is', null)
  }

  // Apply date range filter
  if (options.dateFrom) {
    query = query.gte('created_at', options.dateFrom.toISOString())
  }
  if (options.dateTo) {
    query = query.lte('created_at', options.dateTo.toISOString())
  }

  // Apply reporter filter
  if (options.reporterId) {
    query = query.eq('reporter_id', options.reporterId)
  }

  // Order by created_at descending and paginate
  query = query.order('created_at', { ascending: false }).range(from, to)

  const { data, error, count } = await query

  if (error) {
    throw error
  }

  const totalCount = count || 0
  const hasMore = to < totalCount - 1

  return {
    data: data as Report[],
    nextPage: hasMore ? pageParam + 1 : null,
    totalCount,
  }
}

export function useReports(options: UseReportsOptions = {}) {
  return useInfiniteQuery({
    queryKey: ['reports', options],
    queryFn: ({ pageParam }) => fetchReports(options, pageParam),
    initialPageParam: 0,
    getNextPageParam: (lastPage) => lastPage.nextPage,
    refetchOnWindowFocus: false,
  })
}

// Helper to get flat list of all reports from pages
export function flattenReports(pages: ReportsPage[] | undefined): Report[] {
  if (!pages) return []
  return pages.flatMap((page) => page.data)
}
