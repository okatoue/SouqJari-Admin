"use client"

import { useState, useEffect } from 'react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Search, X, Filter } from 'lucide-react'
import type { ModerationStatus } from '@/types'

export interface UserFiltersState {
  search: string
  moderationStatus: ModerationStatus | 'all'
  emailVerified: boolean | 'all'
  hasAvatar: boolean | 'all'
  dateFrom: Date | undefined
  dateTo: Date | undefined
  listingsCount: '0' | '1-5' | '5+' | 'all'
  reportsAgainst: '0' | '1-3' | '3+' | 'all'
  sortBy: 'created_at' | 'display_name' | 'email'
  sortOrder: 'asc' | 'desc'
}

interface UserFiltersProps {
  filters: UserFiltersState
  onFiltersChange: (filters: UserFiltersState) => void
  totalCount: number
}

export function UserFilters({
  filters,
  onFiltersChange,
  totalCount,
}: UserFiltersProps) {
  const [showAdvanced, setShowAdvanced] = useState(false)
  const [searchValue, setSearchValue] = useState(filters.search)

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => {
      if (searchValue !== filters.search) {
        onFiltersChange({ ...filters, search: searchValue })
      }
    }, 300)
    return () => clearTimeout(timer)
  }, [searchValue, filters, onFiltersChange])

  const clearFilters = () => {
    setSearchValue('')
    onFiltersChange({
      search: '',
      moderationStatus: 'all',
      emailVerified: 'all',
      hasAvatar: 'all',
      dateFrom: undefined,
      dateTo: undefined,
      listingsCount: 'all',
      reportsAgainst: 'all',
      sortBy: 'created_at',
      sortOrder: 'desc',
    })
  }

  const hasActiveFilters =
    filters.search ||
    filters.moderationStatus !== 'all' ||
    filters.emailVerified !== 'all' ||
    filters.hasAvatar !== 'all' ||
    filters.dateFrom ||
    filters.dateTo ||
    filters.listingsCount !== 'all' ||
    filters.reportsAgainst !== 'all'

  return (
    <div className="space-y-4">
      {/* Search and Controls */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search by email, phone, or name..."
            value={searchValue}
            onChange={(e) => setSearchValue(e.target.value)}
            className="pl-9"
          />
        </div>

        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">
            {totalCount.toLocaleString()} users
          </span>

          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowAdvanced(!showAdvanced)}
          >
            <Filter className="mr-2 h-4 w-4" />
            Filters
            {hasActiveFilters && (
              <span className="ml-1 rounded-full bg-primary px-1.5 text-xs text-primary-foreground">
                !
              </span>
            )}
          </Button>
        </div>
      </div>

      {/* Quick Status Tabs */}
      <div className="flex flex-wrap gap-2">
        {['all', 'active', 'warned', 'suspended', 'banned'].map((status) => (
          <Button
            key={status}
            variant={filters.moderationStatus === status ? 'secondary' : 'ghost'}
            size="sm"
            onClick={() =>
              onFiltersChange({
                ...filters,
                moderationStatus: status as ModerationStatus | 'all',
              })
            }
          >
            {status === 'all' ? 'All' : status.charAt(0).toUpperCase() + status.slice(1)}
          </Button>
        ))}
      </div>

      {/* Advanced Filters */}
      {showAdvanced && (
        <div className="rounded-lg border bg-card p-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {/* Email Verified */}
            <div className="space-y-2">
              <Label>Email Verified</Label>
              <Select
                value={filters.emailVerified === 'all' ? 'all' : filters.emailVerified ? 'yes' : 'no'}
                onValueChange={(value) =>
                  onFiltersChange({
                    ...filters,
                    emailVerified: value === 'all' ? 'all' : value === 'yes',
                  })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Any" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Any</SelectItem>
                  <SelectItem value="yes">Verified</SelectItem>
                  <SelectItem value="no">Not Verified</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Has Avatar */}
            <div className="space-y-2">
              <Label>Has Avatar</Label>
              <Select
                value={filters.hasAvatar === 'all' ? 'all' : filters.hasAvatar ? 'yes' : 'no'}
                onValueChange={(value) =>
                  onFiltersChange({
                    ...filters,
                    hasAvatar: value === 'all' ? 'all' : value === 'yes',
                  })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Any" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Any</SelectItem>
                  <SelectItem value="yes">With Avatar</SelectItem>
                  <SelectItem value="no">Without Avatar</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Listings Count */}
            <div className="space-y-2">
              <Label>Listings Count</Label>
              <Select
                value={filters.listingsCount}
                onValueChange={(value) =>
                  onFiltersChange({
                    ...filters,
                    listingsCount: value as UserFiltersState['listingsCount'],
                  })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Any" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Any</SelectItem>
                  <SelectItem value="0">No Listings</SelectItem>
                  <SelectItem value="1-5">1-5 Listings</SelectItem>
                  <SelectItem value="5+">5+ Listings</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Reports Against */}
            <div className="space-y-2">
              <Label>Reports Against</Label>
              <Select
                value={filters.reportsAgainst}
                onValueChange={(value) =>
                  onFiltersChange({
                    ...filters,
                    reportsAgainst: value as UserFiltersState['reportsAgainst'],
                  })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Any" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Any</SelectItem>
                  <SelectItem value="0">No Reports</SelectItem>
                  <SelectItem value="1-3">1-3 Reports</SelectItem>
                  <SelectItem value="3+">3+ Reports</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Sort */}
            <div className="space-y-2">
              <Label>Sort By</Label>
              <Select
                value={`${filters.sortBy}-${filters.sortOrder}`}
                onValueChange={(value) => {
                  const [sortBy, sortOrder] = value.split('-') as [
                    UserFiltersState['sortBy'],
                    UserFiltersState['sortOrder']
                  ]
                  onFiltersChange({ ...filters, sortBy, sortOrder })
                }}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="created_at-desc">Newest First</SelectItem>
                  <SelectItem value="created_at-asc">Oldest First</SelectItem>
                  <SelectItem value="display_name-asc">Name: A-Z</SelectItem>
                  <SelectItem value="display_name-desc">Name: Z-A</SelectItem>
                  <SelectItem value="email-asc">Email: A-Z</SelectItem>
                  <SelectItem value="email-desc">Email: Z-A</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Date Range */}
            <div className="space-y-2">
              <Label>Joined From</Label>
              <Input
                type="date"
                value={filters.dateFrom?.toISOString().split('T')[0] || ''}
                onChange={(e) =>
                  onFiltersChange({
                    ...filters,
                    dateFrom: e.target.value ? new Date(e.target.value) : undefined,
                  })
                }
              />
            </div>

            <div className="space-y-2">
              <Label>Joined To</Label>
              <Input
                type="date"
                value={filters.dateTo?.toISOString().split('T')[0] || ''}
                onChange={(e) =>
                  onFiltersChange({
                    ...filters,
                    dateTo: e.target.value ? new Date(e.target.value) : undefined,
                  })
                }
              />
            </div>
          </div>

          {/* Clear Filters Button */}
          {hasActiveFilters && (
            <div className="mt-4 flex justify-end">
              <Button variant="outline" size="sm" onClick={clearFilters}>
                <X className="mr-2 h-4 w-4" />
                Clear All Filters
              </Button>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
