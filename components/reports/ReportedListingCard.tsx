"use client"

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import {
  Package,
  MapPin,
  Calendar,
  DollarSign,
  User,
  ExternalLink,
  ChevronLeft,
  ChevronRight,
  X,
} from 'lucide-react'
import type { Listing } from '@/types'
import { LISTING_STATUS_LABELS } from '@/lib/constants'
import { formatDistanceToNow } from '@/lib/utils'

interface ReportedListingCardProps {
  listing: Listing
}

function getListingImage(listing: Listing, imageName: string): string {
  return `https://images.souqjari.com/listing-images/${listing.user_id}/${imageName}`
}

export function ReportedListingCard({ listing }: ReportedListingCardProps) {
  const [currentImageIndex, setCurrentImageIndex] = useState(0)
  const [lightboxOpen, setLightboxOpen] = useState(false)

  const images = listing.images || []
  const hasImages = images.length > 0

  const nextImage = () => {
    setCurrentImageIndex((prev) => (prev + 1) % images.length)
  }

  const prevImage = () => {
    setCurrentImageIndex((prev) => (prev - 1 + images.length) % images.length)
  }

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <CardTitle className="text-lg flex items-center gap-2">
            <Package className="h-5 w-5" />
            Reported Listing
          </CardTitle>
          <Badge
            variant={
              listing.moderation_status === 'approved'
                ? 'success'
                : listing.moderation_status === 'removed'
                ? 'destructive'
                : 'warning'
            }
          >
            {LISTING_STATUS_LABELS[listing.moderation_status]?.label || listing.moderation_status}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Image Gallery */}
        {hasImages && (
          <div className="relative">
            <Dialog open={lightboxOpen} onOpenChange={setLightboxOpen}>
              <DialogTrigger asChild>
                <div className="relative aspect-video rounded-lg overflow-hidden cursor-pointer group">
                  <img
                    src={getListingImage(listing, images[currentImageIndex])}
                    alt={listing.title}
                    className="w-full h-full object-cover transition-transform group-hover:scale-105"
                  />
                  {images.length > 1 && (
                    <div className="absolute bottom-2 right-2 bg-black/60 text-white text-xs px-2 py-1 rounded">
                      {currentImageIndex + 1} / {images.length}
                    </div>
                  )}
                </div>
              </DialogTrigger>
              <DialogContent className="max-w-4xl p-0">
                <DialogHeader className="sr-only">
                  <DialogTitle>Listing Images</DialogTitle>
                </DialogHeader>
                <div className="relative">
                  <img
                    src={getListingImage(listing, images[currentImageIndex])}
                    alt={listing.title}
                    className="w-full max-h-[80vh] object-contain"
                  />
                  {images.length > 1 && (
                    <>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white"
                        onClick={prevImage}
                      >
                        <ChevronLeft className="h-6 w-6" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white"
                        onClick={nextImage}
                      >
                        <ChevronRight className="h-6 w-6" />
                      </Button>
                    </>
                  )}
                  <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-1">
                    {images.map((_, i) => (
                      <button
                        key={i}
                        className={`w-2 h-2 rounded-full transition-colors ${
                          i === currentImageIndex ? 'bg-white' : 'bg-white/50'
                        }`}
                        onClick={() => setCurrentImageIndex(i)}
                      />
                    ))}
                  </div>
                </div>
              </DialogContent>
            </Dialog>

            {/* Thumbnail Strip */}
            {images.length > 1 && (
              <div className="flex gap-2 mt-2 overflow-x-auto pb-1">
                {images.map((img, i) => (
                  <button
                    key={i}
                    onClick={() => setCurrentImageIndex(i)}
                    className={`flex-shrink-0 w-16 h-16 rounded overflow-hidden border-2 transition-colors ${
                      i === currentImageIndex
                        ? 'border-primary'
                        : 'border-transparent'
                    }`}
                  >
                    <img
                      src={getListingImage(listing, img)}
                      alt={`${listing.title} ${i + 1}`}
                      className="w-full h-full object-cover"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Listing Details */}
        <div className="space-y-3">
          <h3 className="font-semibold text-lg">{listing.title}</h3>

          <div className="flex items-center gap-2 text-lg font-bold text-primary">
            <DollarSign className="h-5 w-5" />
            {listing.price.toLocaleString()} {listing.currency}
          </div>

          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <MapPin className="h-4 w-4" />
            {listing.location}
          </div>

          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Calendar className="h-4 w-4" />
            Listed {formatDistanceToNow(listing.created_at)}
          </div>

          {/* Description */}
          <div className="pt-2">
            <p className="text-sm text-muted-foreground whitespace-pre-wrap">
              {listing.description}
            </p>
          </div>

          {/* Removal Reason */}
          {listing.removal_reason && (
            <div className="p-3 bg-destructive/10 rounded-lg border border-destructive/20">
              <p className="text-sm font-medium text-destructive">
                Removal Reason:
              </p>
              <p className="text-sm text-destructive/80 mt-1">
                {listing.removal_reason}
              </p>
            </div>
          )}
        </div>

        {/* Seller Info */}
        {listing.seller && (
          <div className="pt-4 border-t">
            <p className="text-sm font-medium mb-2 flex items-center gap-1">
              <User className="h-4 w-4" />
              Seller
            </p>
            <div className="flex items-center gap-3">
              <Avatar>
                <AvatarImage
                  src={
                    listing.seller.avatar_url
                      ? `https://api.souqjari.com/storage/v1/object/public/avatars/${listing.seller.id}/${listing.seller.avatar_url}`
                      : undefined
                  }
                />
                <AvatarFallback>
                  {listing.seller.display_name?.charAt(0) || 'U'}
                </AvatarFallback>
              </Avatar>
              <div>
                <p className="font-medium">
                  {listing.seller.display_name || 'Unknown'}
                </p>
                <p className="text-sm text-muted-foreground">
                  {listing.seller.email}
                </p>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
