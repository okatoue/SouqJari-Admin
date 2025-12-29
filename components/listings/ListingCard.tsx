"use client"

import Image from 'next/image'
import Link from 'next/link'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardFooter } from '@/components/ui/card'
import { Checkbox } from '@/components/ui/checkbox'
import { CATEGORIES, SUBCATEGORIES, LISTING_STATUS_LABELS } from '@/lib/constants'
import { formatDistanceToNow } from '@/lib/utils'
import { MapPin, ImageIcon, User } from 'lucide-react'
import type { Listing } from '@/types'

interface ListingCardProps {
  listing: Listing
  isSelected?: boolean
  onSelectChange?: (selected: boolean) => void
  showCheckbox?: boolean
}

export function ListingCard({
  listing,
  isSelected,
  onSelectChange,
  showCheckbox = false,
}: ListingCardProps) {
  const category = CATEGORIES.find((c) => c.id === listing.category_id)
  const subcategory = listing.subcategory_id
    ? SUBCATEGORIES[listing.category_id]?.find((s) => s.id === listing.subcategory_id)
    : null

  const moderationInfo = LISTING_STATUS_LABELS[listing.moderation_status]
  const firstImage = listing.images?.[0]

  const formatPrice = (price: number, currency: string) => {
    return new Intl.NumberFormat('en-US', {
      style: 'decimal',
      maximumFractionDigits: 0,
    }).format(price) + ' ' + currency
  }

  return (
    <Card className="group relative overflow-hidden transition-shadow hover:shadow-md">
      {/* Selection Checkbox */}
      {showCheckbox && (
        <div className="absolute left-2 top-2 z-10">
          <Checkbox
            checked={isSelected}
            onCheckedChange={onSelectChange}
            className="bg-background"
          />
        </div>
      )}

      {/* Image */}
      <Link href={`/listings/${listing.id}`}>
        <div className="relative aspect-[4/3] bg-muted">
          {firstImage ? (
            <Image
              src={firstImage}
              alt={listing.title}
              fill
              className="object-cover transition-transform group-hover:scale-105"
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
            />
          ) : (
            <div className="flex h-full items-center justify-center">
              <ImageIcon className="h-12 w-12 text-muted-foreground/50" />
            </div>
          )}

          {/* Image Count Badge */}
          {listing.images?.length > 1 && (
            <Badge
              variant="secondary"
              className="absolute bottom-2 right-2 gap-1"
            >
              <ImageIcon className="h-3 w-3" />
              {listing.images.length}
            </Badge>
          )}
        </div>
      </Link>

      <CardContent className="p-3">
        {/* Title */}
        <Link href={`/listings/${listing.id}`}>
          <h3 className="line-clamp-2 font-medium leading-tight hover:text-primary">
            {listing.title}
          </h3>
        </Link>

        {/* Price */}
        <p className="mt-1 text-lg font-bold text-primary">
          {formatPrice(listing.price, listing.currency)}
        </p>

        {/* Category */}
        <p className="mt-1 text-xs text-muted-foreground">
          {category?.icon} {category?.name}
          {subcategory && ` › ${subcategory.name}`}
        </p>

        {/* Location */}
        {listing.location && (
          <p className="mt-1 flex items-center gap-1 text-xs text-muted-foreground">
            <MapPin className="h-3 w-3" />
            <span className="truncate">{listing.location}</span>
          </p>
        )}
      </CardContent>

      <CardFooter className="flex items-center justify-between border-t p-3">
        {/* Moderation Status */}
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

        {/* Seller & Time */}
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          {listing.seller && (
            <span className="flex items-center gap-1">
              <User className="h-3 w-3" />
              <span className="max-w-[80px] truncate">
                {listing.seller.display_name || 'Unknown'}
              </span>
            </span>
          )}
          <span>{formatDistanceToNow(listing.created_at)}</span>
        </div>
      </CardFooter>
    </Card>
  )
}
