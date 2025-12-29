"use client"

import { useState, useCallback, useEffect } from 'react'
import { useListings, flattenListings } from '@/hooks/useListings'
import { useListingActions } from '@/hooks/useListingActions'
import { ListingFilters, type ListingFiltersState } from './ListingFilters'
import { ListingsTable } from './ListingsTable'
import { ListingsGrid } from './ListingsGrid'
import { BulkActions } from './BulkActions'
import { Button } from '@/components/ui/button'
import { useToast } from '@/hooks/use-toast'
import { Download, Loader2 } from 'lucide-react'
import type { AdminUser, Listing } from '@/types'

interface ListingsPageClientProps {
  adminUser: AdminUser
}

const defaultFilters: ListingFiltersState = {
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
}

export function ListingsPageClient({ adminUser }: ListingsPageClientProps) {
  const [filters, setFilters] = useState<ListingFiltersState>(defaultFilters)
  const [viewMode, setViewMode] = useState<'table' | 'grid'>('table')
  const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set())
  const { toast } = useToast()

  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
    isError,
    error,
  } = useListings({
    search: filters.search || undefined,
    categoryId: filters.categoryId,
    subcategoryId: filters.subcategoryId,
    status: filters.status,
    moderationStatus: filters.moderationStatus,
    priceMin: filters.priceMin,
    priceMax: filters.priceMax,
    dateFrom: filters.dateFrom,
    dateTo: filters.dateTo,
    hasImages: filters.hasImages,
    location: filters.location || undefined,
    sortBy: filters.sortBy,
    sortOrder: filters.sortOrder,
  })

  const actions = useListingActions()

  const listings = flattenListings(data?.pages)
  const totalCount = data?.pages[0]?.totalCount || 0

  // Clear selection when filters change
  useEffect(() => {
    setSelectedIds(new Set())
  }, [filters])

  const handleApprove = useCallback(
    async (listingId: number) => {
      try {
        await actions.approve.mutateAsync({
          adminId: adminUser.id,
          listingId,
        })
        toast({
          title: 'Listing approved',
          description: 'The listing has been approved successfully.',
        })
      } catch (err) {
        toast({
          title: 'Error',
          description: 'Failed to approve the listing.',
          variant: 'destructive',
        })
      }
    },
    [actions.approve, adminUser.id, toast]
  )

  const handleReject = useCallback(
    async (listingId: number) => {
      try {
        await actions.reject.mutateAsync({
          adminId: adminUser.id,
          listingId,
          reason: 'Rejected from listings table',
        })
        toast({
          title: 'Listing rejected',
          description: 'The listing has been rejected.',
        })
      } catch (err) {
        toast({
          title: 'Error',
          description: 'Failed to reject the listing.',
          variant: 'destructive',
        })
      }
    },
    [actions.reject, adminUser.id, toast]
  )

  const handleRemove = useCallback(
    async (listingId: number) => {
      try {
        await actions.remove.mutateAsync({
          adminId: adminUser.id,
          listingId,
          reason: 'Removed from listings table',
          notifySeller: false,
        })
        toast({
          title: 'Listing removed',
          description: 'The listing has been removed from the marketplace.',
        })
      } catch (err) {
        toast({
          title: 'Error',
          description: 'Failed to remove the listing.',
          variant: 'destructive',
        })
      }
    },
    [actions.remove, adminUser.id, toast]
  )

  const handleBulkApprove = useCallback(async () => {
    try {
      await actions.bulkApprove.mutateAsync({
        adminId: adminUser.id,
        listingIds: Array.from(selectedIds),
      })
      setSelectedIds(new Set())
      toast({
        title: 'Listings approved',
        description: `${selectedIds.size} listings have been approved.`,
      })
    } catch (err) {
      toast({
        title: 'Error',
        description: 'Failed to approve the listings.',
        variant: 'destructive',
      })
    }
  }, [actions.bulkApprove, adminUser.id, selectedIds, toast])

  const handleBulkRemove = useCallback(
    async (reason: string) => {
      try {
        await actions.bulkRemove.mutateAsync({
          adminId: adminUser.id,
          listingIds: Array.from(selectedIds),
          reason,
        })
        setSelectedIds(new Set())
        toast({
          title: 'Listings removed',
          description: `${selectedIds.size} listings have been removed.`,
        })
      } catch (err) {
        toast({
          title: 'Error',
          description: 'Failed to remove the listings.',
          variant: 'destructive',
        })
      }
    },
    [actions.bulkRemove, adminUser.id, selectedIds, toast]
  )

  const exportToCSV = useCallback(() => {
    if (listings.length === 0) return

    const headers = [
      'ID',
      'Title',
      'Category',
      'Subcategory',
      'Price',
      'Currency',
      'Location',
      'Status',
      'Moderation Status',
      'Seller Email',
      'Seller Name',
      'Created At',
    ]

    const rows = listings.map((listing) => [
      listing.id,
      `"${listing.title.replace(/"/g, '""')}"`,
      listing.category_id,
      listing.subcategory_id || '',
      listing.price,
      listing.currency,
      `"${(listing.location || '').replace(/"/g, '""')}"`,
      listing.status,
      listing.moderation_status,
      listing.seller?.email || '',
      `"${(listing.seller?.display_name || '').replace(/"/g, '""')}"`,
      listing.created_at,
    ])

    const csv = [headers.join(','), ...rows.map((row) => row.join(','))].join('\n')

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    link.href = URL.createObjectURL(blob)
    link.download = `listings_export_${new Date().toISOString().split('T')[0]}.csv`
    link.click()
  }, [listings])

  if (isError) {
    return (
      <div className="flex h-64 items-center justify-center rounded-lg border border-dashed">
        <p className="text-muted-foreground">
          Error loading listings: {(error as Error)?.message || 'Unknown error'}
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Filters */}
      <ListingFilters
        filters={filters}
        onFiltersChange={setFilters}
        viewMode={viewMode}
        onViewModeChange={setViewMode}
        totalCount={totalCount}
      />

      {/* Export Button */}
      <div className="flex justify-end">
        <Button variant="outline" size="sm" onClick={exportToCSV} disabled={listings.length === 0}>
          <Download className="mr-2 h-4 w-4" />
          Export CSV
        </Button>
      </div>

      {/* Bulk Actions */}
      <BulkActions
        selectedCount={selectedIds.size}
        onClearSelection={() => setSelectedIds(new Set())}
        onBulkApprove={handleBulkApprove}
        onBulkRemove={handleBulkRemove}
        isLoading={actions.bulkApprove.isPending || actions.bulkRemove.isPending}
      />

      {/* Listings View */}
      {viewMode === 'table' ? (
        <ListingsTable
          listings={listings}
          isLoading={isLoading}
          selectedIds={selectedIds}
          onSelectionChange={setSelectedIds}
          onApprove={handleApprove}
          onReject={handleReject}
          onRemove={handleRemove}
        />
      ) : (
        <ListingsGrid
          listings={listings}
          isLoading={isLoading}
          selectedIds={selectedIds}
          onSelectionChange={setSelectedIds}
          showCheckboxes
        />
      )}

      {/* Load More */}
      {hasNextPage && (
        <div className="flex justify-center pt-4">
          <Button
            variant="outline"
            onClick={() => fetchNextPage()}
            disabled={isFetchingNextPage}
          >
            {isFetchingNextPage ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Loading...
              </>
            ) : (
              'Load More'
            )}
          </Button>
        </div>
      )}
    </div>
  )
}
