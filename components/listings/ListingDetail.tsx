"use client"

import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { ImageGallery } from './ImageGallery'
import { SellerCard } from './SellerCard'
import { ListingActions } from './ListingActions'
import { CATEGORIES, SUBCATEGORIES, LISTING_STATUS_LABELS, REPORT_STATUS_LABELS } from '@/lib/constants'
import { formatDate, formatDistanceToNow } from '@/lib/utils'
import {
  MapPin,
  Calendar,
  Phone,
  Tag,
  AlertTriangle,
  Clock,
  FileText,
  User,
} from 'lucide-react'
import type { Listing, Report, AuditLogEntry, AdminUser, Profile } from '@/types'

interface ListingDetailProps {
  listing: Listing & {
    seller?: Profile
    reports?: Report[]
    auditLog?: AuditLogEntry[]
  }
  adminUser: AdminUser
  onApprove: (internalNotes?: string) => Promise<void>
  onReject: (reason: string, internalNotes?: string) => Promise<void>
  onRemove: (reason: string, notifySeller: boolean, internalNotes?: string) => Promise<void>
  onRestore: () => Promise<void>
  isLoading?: boolean
}

export function ListingDetail({
  listing,
  adminUser,
  onApprove,
  onReject,
  onRemove,
  onRestore,
  isLoading,
}: ListingDetailProps) {
  const category = CATEGORIES.find((c) => c.id === listing.category_id)
  const subcategory = listing.subcategory_id
    ? SUBCATEGORIES[listing.category_id]?.find((s) => s.id === listing.subcategory_id)
    : null
  const moderationInfo = LISTING_STATUS_LABELS[listing.moderation_status]

  const formatPrice = (price: number, currency: string) => {
    return new Intl.NumberFormat('en-US', {
      style: 'decimal',
      maximumFractionDigits: 0,
    }).format(price) + ' ' + currency
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold">{listing.title}</h1>
          <p className="text-muted-foreground">Listing #{listing.id}</p>
        </div>
        <Badge
          variant={
            moderationInfo.color === 'green'
              ? 'default'
              : moderationInfo.color === 'red'
              ? 'destructive'
              : 'secondary'
          }
          className={`text-base px-4 py-1 ${
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

      {/* Main Content */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Left Column - Images and Details */}
        <div className="space-y-6 lg:col-span-2">
          {/* Image Gallery */}
          <Card>
            <CardContent className="p-4">
              <ImageGallery images={listing.images || []} title={listing.title} />
            </CardContent>
          </Card>

          {/* Listing Info */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Listing Details
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Category */}
              <div className="flex items-center gap-2">
                <Tag className="h-4 w-4 text-muted-foreground" />
                <span className="font-medium">Category:</span>
                <span>
                  {category?.icon} {category?.name}
                  {subcategory && (
                    <span className="text-muted-foreground"> › {subcategory.name}</span>
                  )}
                </span>
              </div>

              {/* Price */}
              <div className="flex items-center gap-2">
                <span className="text-2xl font-bold text-primary">
                  {formatPrice(listing.price, listing.currency)}
                </span>
              </div>

              {/* Location */}
              {listing.location && (
                <div className="flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-muted-foreground" />
                  <span className="font-medium">Location:</span>
                  <span>{listing.location}</span>
                </div>
              )}

              {/* Posted Date */}
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <span className="font-medium">Posted:</span>
                <span>
                  {formatDate(listing.created_at)} ({formatDistanceToNow(listing.created_at)})
                </span>
              </div>

              {/* Status */}
              <div className="flex items-center gap-2">
                <span className="font-medium">Listing Status:</span>
                <Badge variant="outline">
                  {listing.status.charAt(0).toUpperCase() + listing.status.slice(1)}
                </Badge>
              </div>

              <Separator />

              {/* Description */}
              <div>
                <h4 className="mb-2 font-medium">Description</h4>
                <p className="whitespace-pre-wrap text-muted-foreground">
                  {listing.description || 'No description provided'}
                </p>
              </div>

              {/* Contact Info */}
              {listing.phone_number && (
                <>
                  <Separator />
                  <div className="flex items-center gap-2">
                    <Phone className="h-4 w-4 text-muted-foreground" />
                    <span className="font-medium">Contact Phone:</span>
                    <span>{listing.phone_number}</span>
                  </div>
                </>
              )}

              {/* Removal Info */}
              {listing.moderation_status === 'removed' && (
                <>
                  <Separator />
                  <div className="rounded-lg bg-red-50 p-4">
                    <h4 className="font-medium text-red-800">Removal Information</h4>
                    <p className="mt-1 text-sm text-red-700">
                      Reason: {listing.removal_reason || 'No reason provided'}
                    </p>
                    {listing.removed_at && (
                      <p className="mt-1 text-xs text-red-600">
                        Removed at {formatDate(listing.removed_at)}
                      </p>
                    )}
                  </div>
                </>
              )}
            </CardContent>
          </Card>

          {/* Reports Against Listing */}
          {listing.reports && listing.reports.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <AlertTriangle className="h-5 w-5 text-yellow-500" />
                  Reports Against This Listing ({listing.reports.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {listing.reports.map((report) => {
                    const statusInfo = REPORT_STATUS_LABELS[report.status]
                    return (
                      <div
                        key={report.id}
                        className="flex items-start justify-between rounded-lg border p-3"
                      >
                        <div>
                          <div className="flex items-center gap-2">
                            <Badge variant="outline">{report.reason}</Badge>
                            <Badge
                              variant={
                                statusInfo.color === 'green'
                                  ? 'default'
                                  : statusInfo.color === 'gray'
                                  ? 'secondary'
                                  : 'outline'
                              }
                              className={
                                statusInfo.color === 'yellow'
                                  ? 'bg-yellow-100 text-yellow-800'
                                  : statusInfo.color === 'blue'
                                  ? 'bg-blue-100 text-blue-800'
                                  : ''
                              }
                            >
                              {statusInfo.label}
                            </Badge>
                          </div>
                          {report.description && (
                            <p className="mt-1 text-sm text-muted-foreground">
                              {report.description}
                            </p>
                          )}
                        </div>
                        <span className="text-xs text-muted-foreground">
                          {formatDistanceToNow(report.created_at)}
                        </span>
                      </div>
                    )
                  })}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Actions */}
          <Card>
            <CardHeader>
              <CardTitle>Actions</CardTitle>
            </CardHeader>
            <CardContent>
              <ListingActions
                listingId={listing.id}
                currentStatus={listing.moderation_status}
                onApprove={onApprove}
                onReject={onReject}
                onRemove={onRemove}
                onRestore={onRestore}
                isLoading={isLoading}
              />
            </CardContent>
          </Card>

          {/* Moderation History */}
          {listing.auditLog && listing.auditLog.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="h-5 w-5" />
                  Moderation History
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {listing.auditLog.map((entry) => (
                    <div
                      key={entry.id}
                      className="flex items-start gap-3 border-l-2 border-muted pl-4"
                    >
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <span className="font-medium">
                            {entry.action.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())}
                          </span>
                          <span className="text-xs text-muted-foreground">
                            {formatDistanceToNow(entry.created_at)}
                          </span>
                        </div>
                        {entry.admin && (
                          <p className="mt-1 flex items-center gap-1 text-sm text-muted-foreground">
                            <User className="h-3 w-3" />
                            by{' '}
                            {(entry.admin as { profile?: { display_name?: string; email?: string } })?.profile?.display_name ||
                              (entry.admin as { profile?: { display_name?: string; email?: string } })?.profile?.email ||
                              'Unknown Admin'}
                          </p>
                        )}
                        {entry.details && (
                          <div className="mt-2 rounded bg-muted p-2 text-xs">
                            {Object.entries(entry.details).map(([key, value]) => (
                              <div key={key}>
                                <span className="font-medium">{key.replace(/_/g, ' ')}:</span>{' '}
                                {String(value)}
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Right Column - Seller Info */}
        <div className="space-y-6">
          {listing.seller && <SellerCard seller={listing.seller} />}
        </div>
      </div>
    </div>
  )
}
