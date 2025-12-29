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
import { CATEGORIES, SUBCATEGORIES } from '@/lib/constants'
import { Search, X, Filter, LayoutGrid, LayoutList } from 'lucide-react'
import type { ListingModerationStatus } from '@/types'

export interface ListingFiltersState {
  search: string
  categoryId: number | undefined
  subcategoryId: number | undefined
  status: 'active' | 'sold' | 'inactive' | 'all'
  moderationStatus: ListingModerationStatus | 'all'
  priceMin: number | undefined
  priceMax: number | undefined
  dateFrom: Date | undefined
  dateTo: Date | undefined
  hasImages: boolean | 'all'
  location: string
  sortBy: 'created_at' | 'price' | 'title'
  sortOrder: 'asc' | 'desc'
}

interface ListingFiltersProps {
  filters: ListingFiltersState
  onFiltersChange: (filters: ListingFiltersState) => void
  viewMode: 'table' | 'grid'
  onViewModeChange: (mode: 'table' | 'grid') => void
  totalCount: number
}

export function ListingFilters({
  filters,
  onFiltersChange,
  viewMode,
  onViewModeChange,
  totalCount,
}: ListingFiltersProps) {
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

  const subcategories = filters.categoryId
    ? SUBCATEGORIES[filters.categoryId] || []
    : []

  const clearFilters = () => {
    setSearchValue('')
    onFiltersChange({
      search: '',
      categoryId: undefined,
      subcategoryId: undefined,
      status: 'all',
      moderationStatus: 'all',
      priceMin: undefined,
      priceMax: undefined,
      dateFrom: undefined,
      dateTo: undefined,
      hasImages: 'all',
      location: '',
      sortBy: 'created_at',
      sortOrder: 'desc',
    })
  }

  const hasActiveFilters =
    filters.search ||
    filters.categoryId ||
    filters.subcategoryId ||
    filters.status !== 'all' ||
    filters.moderationStatus !== 'all' ||
    filters.priceMin !== undefined ||
    filters.priceMax !== undefined ||
    filters.dateFrom ||
    filters.dateTo ||
    filters.hasImages !== 'all' ||
    filters.location

  return (
    <div className="space-y-4">
      {/* Search and View Toggle */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search listings..."
            value={searchValue}
            onChange={(e) => setSearchValue(e.target.value)}
            className="pl-9"
          />
        </div>

        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">
            {totalCount.toLocaleString()} listings
          </span>

          <div className="flex items-center rounded-md border">
            <Button
              variant={viewMode === 'table' ? 'secondary' : 'ghost'}
              size="sm"
              onClick={() => onViewModeChange('table')}
              className="rounded-r-none"
            >
              <LayoutList className="h-4 w-4" />
            </Button>
            <Button
              variant={viewMode === 'grid' ? 'secondary' : 'ghost'}
              size="sm"
              onClick={() => onViewModeChange('grid')}
              className="rounded-l-none"
            >
              <LayoutGrid className="h-4 w-4" />
            </Button>
          </div>

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
        {['all', 'pending', 'approved', 'rejected', 'removed'].map((status) => (
          <Button
            key={status}
            variant={filters.moderationStatus === status ? 'secondary' : 'ghost'}
            size="sm"
            onClick={() =>
              onFiltersChange({
                ...filters,
                moderationStatus: status as ListingModerationStatus | 'all',
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
            {/* Category */}
            <div className="space-y-2">
              <Label>Category</Label>
              <Select
                value={filters.categoryId?.toString() || 'all'}
                onValueChange={(value) =>
                  onFiltersChange({
                    ...filters,
                    categoryId: value === 'all' ? undefined : parseInt(value),
                    subcategoryId: undefined,
                  })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="All Categories" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  {CATEGORIES.map((cat) => (
                    <SelectItem key={cat.id} value={cat.id.toString()}>
                      {cat.icon} {cat.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Subcategory */}
            <div className="space-y-2">
              <Label>Subcategory</Label>
              <Select
                value={filters.subcategoryId?.toString() || 'all'}
                onValueChange={(value) =>
                  onFiltersChange({
                    ...filters,
                    subcategoryId: value === 'all' ? undefined : parseInt(value),
                  })
                }
                disabled={!filters.categoryId}
              >
                <SelectTrigger>
                  <SelectValue placeholder="All Subcategories" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Subcategories</SelectItem>
                  {subcategories.map((sub) => (
                    <SelectItem key={sub.id} value={sub.id.toString()}>
                      {sub.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Listing Status */}
            <div className="space-y-2">
              <Label>Listing Status</Label>
              <Select
                value={filters.status}
                onValueChange={(value) =>
                  onFiltersChange({
                    ...filters,
                    status: value as ListingFiltersState['status'],
                  })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="All Statuses" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="sold">Sold</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Has Images */}
            <div className="space-y-2">
              <Label>Has Images</Label>
              <Select
                value={filters.hasImages === 'all' ? 'all' : filters.hasImages ? 'yes' : 'no'}
                onValueChange={(value) =>
                  onFiltersChange({
                    ...filters,
                    hasImages: value === 'all' ? 'all' : value === 'yes',
                  })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Any" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Any</SelectItem>
                  <SelectItem value="yes">With Images</SelectItem>
                  <SelectItem value="no">Without Images</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Price Range */}
            <div className="space-y-2">
              <Label>Min Price</Label>
              <Input
                type="number"
                placeholder="Min"
                value={filters.priceMin || ''}
                onChange={(e) =>
                  onFiltersChange({
                    ...filters,
                    priceMin: e.target.value ? parseInt(e.target.value) : undefined,
                  })
                }
              />
            </div>

            <div className="space-y-2">
              <Label>Max Price</Label>
              <Input
                type="number"
                placeholder="Max"
                value={filters.priceMax || ''}
                onChange={(e) =>
                  onFiltersChange({
                    ...filters,
                    priceMax: e.target.value ? parseInt(e.target.value) : undefined,
                  })
                }
              />
            </div>

            {/* Location */}
            <div className="space-y-2">
              <Label>Location</Label>
              <Input
                placeholder="Search location..."
                value={filters.location}
                onChange={(e) =>
                  onFiltersChange({ ...filters, location: e.target.value })
                }
              />
            </div>

            {/* Sort */}
            <div className="space-y-2">
              <Label>Sort By</Label>
              <Select
                value={`${filters.sortBy}-${filters.sortOrder}`}
                onValueChange={(value) => {
                  const [sortBy, sortOrder] = value.split('-') as [
                    ListingFiltersState['sortBy'],
                    ListingFiltersState['sortOrder']
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
                  <SelectItem value="price-desc">Price: High to Low</SelectItem>
                  <SelectItem value="price-asc">Price: Low to High</SelectItem>
                  <SelectItem value="title-asc">Title: A-Z</SelectItem>
                  <SelectItem value="title-desc">Title: Z-A</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Date Range */}
            <div className="space-y-2">
              <Label>From Date</Label>
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
              <Label>To Date</Label>
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
