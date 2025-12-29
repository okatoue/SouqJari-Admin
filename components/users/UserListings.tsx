"use client"

import Image from 'next/image'
import Link from 'next/link'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { CATEGORIES, LISTING_STATUS_LABELS } from '@/lib/constants'
import { formatDistanceToNow } from '@/lib/utils'
import { ImageIcon, ExternalLink } from 'lucide-react'
import type { Listing } from '@/types'

interface UserListingsProps {
  listings: Listing[]
}

export function UserListings({ listings }: UserListingsProps) {
  if (listings.length === 0) {
    return (
      <div className="flex h-48 items-center justify-center rounded-lg border border-dashed">
        <p className="text-muted-foreground">No listings found</p>
      </div>
    )
  }

  const formatPrice = (price: number, currency: string) => {
    return new Intl.NumberFormat('en-US', {
      style: 'decimal',
      maximumFractionDigits: 0,
    }).format(price) + ' ' + currency
  }

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {listings.map((listing) => {
        const category = CATEGORIES.find((c) => c.id === listing.category_id)
        const moderationInfo = LISTING_STATUS_LABELS[listing.moderation_status]

        return (
          <Card key={listing.id} className="overflow-hidden">
            {/* Image */}
            <div className="relative aspect-video bg-muted">
              {listing.images?.[0] ? (
                <Image
                  src={listing.images[0]}
                  alt={listing.title}
                  fill
                  className="object-cover"
                  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                />
              ) : (
                <div className="flex h-full items-center justify-center">
                  <ImageIcon className="h-8 w-8 text-muted-foreground/50" />
                </div>
              )}
              <Badge
                variant={
                  moderationInfo.color === 'green'
                    ? 'default'
                    : moderationInfo.color === 'red'
                    ? 'destructive'
                    : 'secondary'
                }
                className={`absolute right-2 top-2 ${
                  moderationInfo.color === 'yellow'
                    ? 'bg-yellow-100 text-yellow-800'
                    : moderationInfo.color === 'gray'
                    ? 'bg-gray-100 text-gray-800'
                    : ''
                }`}
              >
                {moderationInfo.label}
              </Badge>
            </div>

            <CardContent className="p-3">
              <h4 className="line-clamp-1 font-medium">{listing.title}</h4>
              <p className="text-lg font-bold text-primary">
                {formatPrice(listing.price, listing.currency)}
              </p>
              <p className="text-xs text-muted-foreground">
                {category?.icon} {category?.name}
              </p>
              <div className="mt-2 flex items-center justify-between">
                <span className="text-xs text-muted-foreground">
                  {formatDistanceToNow(listing.created_at)}
                </span>
                <Button variant="ghost" size="sm" asChild>
                  <Link href={`/listings/${listing.id}`}>
                    <ExternalLink className="mr-1 h-3 w-3" />
                    View
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}
