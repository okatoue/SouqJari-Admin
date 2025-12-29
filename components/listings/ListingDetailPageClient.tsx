"use client"

import { useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { useListing } from '@/hooks/useListing'
import { useListingActions } from '@/hooks/useListingActions'
import { ListingDetail } from './ListingDetail'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { useToast } from '@/hooks/use-toast'
import { ArrowLeft } from 'lucide-react'
import type { AdminUser } from '@/types'

interface ListingDetailPageClientProps {
  listingId: number
  adminUser: AdminUser
}

export function ListingDetailPageClient({
  listingId,
  adminUser,
}: ListingDetailPageClientProps) {
  const router = useRouter()
  const { toast } = useToast()
  const { data: listing, isLoading, isError, error } = useListing(listingId)
  const actions = useListingActions()

  const handleApprove = useCallback(
    async (internalNotes?: string) => {
      try {
        await actions.approve.mutateAsync({
          adminId: adminUser.id,
          listingId,
          internalNotes,
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
        throw err
      }
    },
    [actions.approve, adminUser.id, listingId, toast]
  )

  const handleReject = useCallback(
    async (reason: string, internalNotes?: string) => {
      try {
        await actions.reject.mutateAsync({
          adminId: adminUser.id,
          listingId,
          reason,
          internalNotes,
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
        throw err
      }
    },
    [actions.reject, adminUser.id, listingId, toast]
  )

  const handleRemove = useCallback(
    async (reason: string, notifySeller: boolean, internalNotes?: string) => {
      try {
        await actions.remove.mutateAsync({
          adminId: adminUser.id,
          listingId,
          reason,
          notifySeller,
          internalNotes,
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
        throw err
      }
    },
    [actions.remove, adminUser.id, listingId, toast]
  )

  const handleRestore = useCallback(async () => {
    try {
      await actions.restore.mutateAsync({
        adminId: adminUser.id,
        listingId,
      })
      toast({
        title: 'Listing restored',
        description: 'The listing has been restored.',
      })
    } catch (err) {
      toast({
        title: 'Error',
        description: 'Failed to restore the listing.',
        variant: 'destructive',
      })
      throw err
    }
  }, [actions.restore, adminUser.id, listingId, toast])

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-64" />
        <div className="grid gap-6 lg:grid-cols-3">
          <div className="space-y-6 lg:col-span-2">
            <Skeleton className="aspect-video w-full" />
            <Skeleton className="h-64 w-full" />
          </div>
          <Skeleton className="h-64 w-full" />
        </div>
      </div>
    )
  }

  if (isError) {
    return (
      <div className="space-y-4">
        <Button variant="outline" onClick={() => router.back()}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Listings
        </Button>
        <div className="flex h-64 items-center justify-center rounded-lg border border-dashed">
          <p className="text-muted-foreground">
            Error loading listing: {(error as Error)?.message || 'Unknown error'}
          </p>
        </div>
      </div>
    )
  }

  if (!listing) {
    return (
      <div className="space-y-4">
        <Button variant="outline" onClick={() => router.back()}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Listings
        </Button>
        <div className="flex h-64 items-center justify-center rounded-lg border border-dashed">
          <p className="text-muted-foreground">Listing not found</p>
        </div>
      </div>
    )
  }

  const isActionLoading =
    actions.approve.isPending ||
    actions.reject.isPending ||
    actions.remove.isPending ||
    actions.restore.isPending

  return (
    <div className="space-y-6">
      <Button variant="outline" onClick={() => router.back()}>
        <ArrowLeft className="mr-2 h-4 w-4" />
        Back to Listings
      </Button>

      <ListingDetail
        listing={listing}
        adminUser={adminUser}
        onApprove={handleApprove}
        onReject={handleReject}
        onRemove={handleRemove}
        onRestore={handleRestore}
        isLoading={isActionLoading}
      />
    </div>
  )
}
