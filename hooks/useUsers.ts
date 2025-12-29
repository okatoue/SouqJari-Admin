"use client"

import { useInfiniteQuery } from '@tanstack/react-query'
import { createClient } from '@/lib/supabase/client'
import type { Profile, ModerationStatus } from '@/types'

export interface UseUsersOptions {
  search?: string
  moderationStatus?: ModerationStatus | 'all'
  emailVerified?: boolean | 'all'
  hasAvatar?: boolean | 'all'
  dateFrom?: Date
  dateTo?: Date
  listingsCount?: '0' | '1-5' | '5+' | 'all'
  reportsAgainst?: '0' | '1-3' | '3+' | 'all'
  sortBy?: 'created_at' | 'display_name' | 'email'
  sortOrder?: 'asc' | 'desc'
  pageSize?: number
}

export interface UserWithCounts extends Profile {
  listings_count?: number
  reports_count?: number
}

interface UsersPage {
  data: UserWithCounts[]
  nextPage: number | null
  totalCount: number
}

async function fetchUsers(
  options: UseUsersOptions,
  pageParam: number
): Promise<UsersPage> {
  const supabase = createClient()
  const pageSize = options.pageSize || 25
  const from = pageParam * pageSize
  const to = from + pageSize - 1

  // Build base query
  let query = supabase
    .from('profiles')
    .select('*', { count: 'exact' })

  // Search filter (email, phone, display_name)
  if (options.search) {
    const searchPattern = `%${options.search}%`
    query = query.or(`email.ilike.${searchPattern},phone_number.ilike.${searchPattern},display_name.ilike.${searchPattern}`)
  }

  // Moderation status filter
  if (options.moderationStatus && options.moderationStatus !== 'all') {
    query = query.eq('moderation_status', options.moderationStatus)
  }

  // Email verified filter
  if (options.emailVerified !== 'all' && options.emailVerified !== undefined) {
    query = query.eq('email_verified', options.emailVerified)
  }

  // Has avatar filter
  if (options.hasAvatar === true) {
    query = query.not('avatar_url', 'is', null)
  } else if (options.hasAvatar === false) {
    query = query.is('avatar_url', null)
  }

  // Date range filters
  if (options.dateFrom) {
    query = query.gte('created_at', options.dateFrom.toISOString())
  }
  if (options.dateTo) {
    query = query.lte('created_at', options.dateTo.toISOString())
  }

  // Exclude deleted users
  query = query.is('deleted_at', null)

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

  // Fetch additional counts for each user
  const usersWithCounts: UserWithCounts[] = []

  for (const user of data || []) {
    // Get listings count
    const { count: listingsCount } = await supabase
      .from('listings')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', user.id)

    // Get reports against count
    const { count: reportsCount } = await supabase
      .from('reports')
      .select('*', { count: 'exact', head: true })
      .eq('reported_user_id', user.id)

    usersWithCounts.push({
      ...user,
      listings_count: listingsCount || 0,
      reports_count: reportsCount || 0,
    })
  }

  // Apply client-side filtering for listings count and reports count
  let filteredUsers = usersWithCounts

  if (options.listingsCount && options.listingsCount !== 'all') {
    filteredUsers = filteredUsers.filter((user) => {
      const count = user.listings_count || 0
      switch (options.listingsCount) {
        case '0':
          return count === 0
        case '1-5':
          return count >= 1 && count <= 5
        case '5+':
          return count > 5
        default:
          return true
      }
    })
  }

  if (options.reportsAgainst && options.reportsAgainst !== 'all') {
    filteredUsers = filteredUsers.filter((user) => {
      const count = user.reports_count || 0
      switch (options.reportsAgainst) {
        case '0':
          return count === 0
        case '1-3':
          return count >= 1 && count <= 3
        case '3+':
          return count > 3
        default:
          return true
      }
    })
  }

  const totalCount = count || 0
  const hasMore = to < totalCount - 1

  return {
    data: filteredUsers as UserWithCounts[],
    nextPage: hasMore ? pageParam + 1 : null,
    totalCount,
  }
}

export function useUsers(options: UseUsersOptions = {}) {
  return useInfiniteQuery({
    queryKey: ['users', options],
    queryFn: ({ pageParam }) => fetchUsers(options, pageParam),
    initialPageParam: 0,
    getNextPageParam: (lastPage) => lastPage.nextPage,
    refetchOnWindowFocus: false,
  })
}

// Helper to get flat list of all users from pages
export function flattenUsers(pages: UsersPage[] | undefined): UserWithCounts[] {
  if (!pages) return []
  return pages.flatMap((page) => page.data)
}
