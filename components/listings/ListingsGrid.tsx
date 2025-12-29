"use client"

import { ListingCard } from './ListingCard'
import { Skeleton } from '@/components/ui/skeleton'
import type { Listing } from '@/types'

interface ListingsGridProps {
  listings: Listing[]
  isLoading?: boolean
  selectedIds?: Set<number>
  onSelectionChange?: (selectedIds: Set<number>) => void
  showCheckboxes?: boolean
}

export function ListingsGrid({
  listings,
  isLoading,
  selectedIds = new Set(),
  onSelectionChange,
  showCheckboxes = false,
}: ListingsGridProps) {
  const handleSelectChange = (listingId: number, selected: boolean) => {
    if (!onSelectionChange) return

    const newSelection = new Set(selectedIds)
    if (selected) {
      newSelection.add(listingId)
    } else {
      newSelection.delete(listingId)
    }
    onSelectionChange(newSelection)
  }

  if (isLoading) {
    return (
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="space-y-3">
            <Skeleton className="aspect-[4/3] w-full" />
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-6 w-1/2" />
            <Skeleton className="h-3 w-full" />
          </div>
        ))}
      </div>
    )
  }

  if (listings.length === 0) {
    return (
      <div className="flex h-64 items-center justify-center rounded-lg border border-dashed">
        <p className="text-muted-foreground">No listings found</p>
      </div>
    )
  }

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {listings.map((listing) => (
        <ListingCard
          key={listing.id}
          listing={listing}
          isSelected={selectedIds.has(listing.id)}
          onSelectChange={(selected) => handleSelectChange(listing.id, selected)}
          showCheckbox={showCheckboxes}
        />
      ))}
    </div>
  )
}
