"use client"

import Image from 'next/image'
import Link from 'next/link'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { CATEGORIES, SUBCATEGORIES, LISTING_STATUS_LABELS, MODERATION_STATUS_LABELS } from '@/lib/constants'
import { formatDistanceToNow } from '@/lib/utils'
import { ImageIcon, MoreHorizontal, Eye, CheckCircle, XCircle, Trash2 } from 'lucide-react'
import type { Listing } from '@/types'

interface ListingsTableProps {
  listings: Listing[]
  isLoading?: boolean
  selectedIds?: Set<number>
  onSelectionChange?: (selectedIds: Set<number>) => void
  onApprove?: (listingId: number) => void
  onReject?: (listingId: number) => void
  onRemove?: (listingId: number) => void
}

export function ListingsTable({
  listings,
  isLoading,
  selectedIds = new Set(),
  onSelectionChange,
  onApprove,
  onReject,
  onRemove,
}: ListingsTableProps) {
  const allSelected = listings.length > 0 && listings.every((l) => selectedIds.has(l.id))
  const someSelected = listings.some((l) => selectedIds.has(l.id))

  const handleSelectAll = (checked: boolean) => {
    if (!onSelectionChange) return

    if (checked) {
      onSelectionChange(new Set(listings.map((l) => l.id)))
    } else {
      onSelectionChange(new Set())
    }
  }

  const handleSelectOne = (listingId: number, checked: boolean) => {
    if (!onSelectionChange) return

    const newSelection = new Set(selectedIds)
    if (checked) {
      newSelection.add(listingId)
    } else {
      newSelection.delete(listingId)
    }
    onSelectionChange(newSelection)
  }

  const formatPrice = (price: number, currency: string) => {
    return new Intl.NumberFormat('en-US', {
      style: 'decimal',
      maximumFractionDigits: 0,
    }).format(price) + ' ' + currency
  }

  if (isLoading) {
    return (
      <div className="space-y-3">
        {Array.from({ length: 5 }).map((_, i) => (
          <Skeleton key={i} className="h-16 w-full" />
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
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-12">
              <Checkbox
                checked={allSelected}
                onCheckedChange={handleSelectAll}
                aria-label="Select all"
                {...(someSelected && !allSelected && { 'data-state': 'indeterminate' })}
              />
            </TableHead>
            <TableHead className="w-16">Image</TableHead>
            <TableHead>Title</TableHead>
            <TableHead>Category</TableHead>
            <TableHead>Price</TableHead>
            <TableHead>Seller</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Moderation</TableHead>
            <TableHead>Created</TableHead>
            <TableHead className="w-12"></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {listings.map((listing) => {
            const category = CATEGORIES.find((c) => c.id === listing.category_id)
            const subcategory = listing.subcategory_id
              ? SUBCATEGORIES[listing.category_id]?.find(
                  (s) => s.id === listing.subcategory_id
                )
              : null
            const moderationInfo = LISTING_STATUS_LABELS[listing.moderation_status]
            const sellerModerationInfo = listing.seller
              ? MODERATION_STATUS_LABELS[listing.seller.moderation_status]
              : null

            return (
              <TableRow key={listing.id}>
                <TableCell>
                  <Checkbox
                    checked={selectedIds.has(listing.id)}
                    onCheckedChange={(checked) =>
                      handleSelectOne(listing.id, checked as boolean)
                    }
                    aria-label={`Select ${listing.title}`}
                  />
                </TableCell>
                <TableCell>
                  <Link href={`/listings/${listing.id}`}>
                    <div className="relative h-10 w-10 overflow-hidden rounded bg-muted">
                      {listing.images?.[0] ? (
                        <Image
                          src={listing.images[0]}
                          alt={listing.title}
                          fill
                          className="object-cover"
                          sizes="40px"
                        />
                      ) : (
                        <div className="flex h-full items-center justify-center">
                          <ImageIcon className="h-4 w-4 text-muted-foreground/50" />
                        </div>
                      )}
                    </div>
                  </Link>
                </TableCell>
                <TableCell>
                  <Link
                    href={`/listings/${listing.id}`}
                    className="font-medium hover:text-primary"
                  >
                    <span className="line-clamp-1">{listing.title}</span>
                  </Link>
                  {listing.location && (
                    <p className="text-xs text-muted-foreground">{listing.location}</p>
                  )}
                </TableCell>
                <TableCell>
                  <span className="text-sm">
                    {category?.icon} {category?.name}
                    {subcategory && (
                      <span className="text-muted-foreground"> › {subcategory.name}</span>
                    )}
                  </span>
                </TableCell>
                <TableCell className="font-medium">
                  {formatPrice(listing.price, listing.currency)}
                </TableCell>
                <TableCell>
                  {listing.seller ? (
                    <Link
                      href={`/users/${listing.seller.id}`}
                      className="flex items-center gap-2 hover:text-primary"
                    >
                      <span className="text-sm">
                        {listing.seller.display_name || listing.seller.email || 'Unknown'}
                      </span>
                      {sellerModerationInfo && sellerModerationInfo.color !== 'green' && (
                        <Badge
                          variant="outline"
                          className={
                            sellerModerationInfo.color === 'red'
                              ? 'border-red-500 text-red-500'
                              : sellerModerationInfo.color === 'orange'
                              ? 'border-orange-500 text-orange-500'
                              : sellerModerationInfo.color === 'yellow'
                              ? 'border-yellow-500 text-yellow-500'
                              : ''
                          }
                        >
                          {sellerModerationInfo.label}
                        </Badge>
                      )}
                    </Link>
                  ) : (
                    <span className="text-muted-foreground">Unknown</span>
                  )}
                </TableCell>
                <TableCell>
                  <Badge variant="outline">
                    {listing.status.charAt(0).toUpperCase() + listing.status.slice(1)}
                  </Badge>
                </TableCell>
                <TableCell>
                  <Badge
                    variant={
                      moderationInfo.color === 'green'
                        ? 'default'
                        : moderationInfo.color === 'red'
                        ? 'destructive'
                        : 'secondary'
                    }
                    className={
                      moderationInfo.color === 'yellow'
                        ? 'bg-yellow-100 text-yellow-800 hover:bg-yellow-200'
                        : moderationInfo.color === 'gray'
                        ? 'bg-gray-100 text-gray-800 hover:bg-gray-200'
                        : ''
                    }
                  >
                    {moderationInfo.label}
                  </Badge>
                </TableCell>
                <TableCell className="text-sm text-muted-foreground">
                  {formatDistanceToNow(listing.created_at)}
                </TableCell>
                <TableCell>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon">
                        <MoreHorizontal className="h-4 w-4" />
                        <span className="sr-only">Actions</span>
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem asChild>
                        <Link href={`/listings/${listing.id}`}>
                          <Eye className="mr-2 h-4 w-4" />
                          View Details
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      {listing.moderation_status === 'pending' && (
                        <>
                          <DropdownMenuItem onClick={() => onApprove?.(listing.id)}>
                            <CheckCircle className="mr-2 h-4 w-4 text-green-600" />
                            Approve
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => onReject?.(listing.id)}>
                            <XCircle className="mr-2 h-4 w-4 text-red-600" />
                            Reject
                          </DropdownMenuItem>
                        </>
                      )}
                      {listing.moderation_status !== 'removed' && (
                        <DropdownMenuItem
                          onClick={() => onRemove?.(listing.id)}
                          className="text-red-600"
                        >
                          <Trash2 className="mr-2 h-4 w-4" />
                          Remove
                        </DropdownMenuItem>
                      )}
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            )
          })}
        </TableBody>
      </Table>
    </div>
  )
}
