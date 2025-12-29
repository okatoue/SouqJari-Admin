"use client"

import { useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { useUser } from '@/hooks/useUser'
import { useUserActions } from '@/hooks/useUserActions'
import { UserDetail } from './UserDetail'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { useToast } from '@/hooks/use-toast'
import { ArrowLeft } from 'lucide-react'
import type { AdminUser } from '@/types'

interface UserDetailPageClientProps {
  userId: string
  adminUser: AdminUser
}

export function UserDetailPageClient({
  userId,
  adminUser,
}: UserDetailPageClientProps) {
  const router = useRouter()
  const { toast } = useToast()
  const { data: user, isLoading, isError, error } = useUser(userId)
  const actions = useUserActions()

  const handleWarn = useCallback(
    async (message: string, internalNotes?: string) => {
      try {
        await actions.warn.mutateAsync({
          adminId: adminUser.id,
          userId,
          message,
          internalNotes,
        })
        toast({
          title: 'Warning issued',
          description: 'The user has been warned.',
        })
      } catch (err) {
        toast({
          title: 'Error',
          description: 'Failed to issue warning.',
          variant: 'destructive',
        })
        throw err
      }
    },
    [actions.warn, adminUser.id, userId, toast]
  )

  const handleSuspend = useCallback(
    async (
      duration: '1_day' | '3_days' | '7_days' | '30_days' | 'custom',
      customDays: number | undefined,
      reason: string,
      internalNotes?: string
    ) => {
      try {
        await actions.suspend.mutateAsync({
          adminId: adminUser.id,
          userId,
          duration,
          customDays,
          reason,
          internalNotes,
        })
        toast({
          title: 'User suspended',
          description: 'The user has been suspended.',
        })
      } catch (err) {
        toast({
          title: 'Error',
          description: 'Failed to suspend user.',
          variant: 'destructive',
        })
        throw err
      }
    },
    [actions.suspend, adminUser.id, userId, toast]
  )

  const handleBan = useCallback(
    async (reason: string, internalNotes?: string) => {
      try {
        await actions.ban.mutateAsync({
          adminId: adminUser.id,
          userId,
          reason,
          internalNotes,
        })
        toast({
          title: 'User banned',
          description: 'The user has been banned.',
        })
      } catch (err) {
        toast({
          title: 'Error',
          description: 'Failed to ban user.',
          variant: 'destructive',
        })
        throw err
      }
    },
    [actions.ban, adminUser.id, userId, toast]
  )

  const handleReactivate = useCallback(
    async (internalNotes?: string) => {
      try {
        await actions.reactivate.mutateAsync({
          adminId: adminUser.id,
          userId,
          internalNotes,
        })
        toast({
          title: 'User reactivated',
          description: 'The user has been reactivated.',
        })
      } catch (err) {
        toast({
          title: 'Error',
          description: 'Failed to reactivate user.',
          variant: 'destructive',
        })
        throw err
      }
    },
    [actions.reactivate, adminUser.id, userId, toast]
  )

  const handleResetWarnings = useCallback(async () => {
    try {
      await actions.resetWarnings.mutateAsync({
        adminId: adminUser.id,
        userId,
      })
      toast({
        title: 'Warnings reset',
        description: 'The user warnings have been reset.',
      })
    } catch (err) {
      toast({
        title: 'Error',
        description: 'Failed to reset warnings.',
        variant: 'destructive',
      })
      throw err
    }
  }, [actions.resetWarnings, adminUser.id, userId, toast])

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-64" />
        <div className="grid gap-6 lg:grid-cols-3">
          <div className="space-y-6">
            <Skeleton className="h-48 w-full" />
            <Skeleton className="h-32 w-full" />
            <Skeleton className="h-32 w-full" />
          </div>
          <div className="lg:col-span-2">
            <Skeleton className="h-96 w-full" />
          </div>
        </div>
      </div>
    )
  }

  if (isError) {
    return (
      <div className="space-y-4">
        <Button variant="outline" onClick={() => router.back()}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Users
        </Button>
        <div className="flex h-64 items-center justify-center rounded-lg border border-dashed">
          <p className="text-muted-foreground">
            Error loading user: {(error as Error)?.message || 'Unknown error'}
          </p>
        </div>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="space-y-4">
        <Button variant="outline" onClick={() => router.back()}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Users
        </Button>
        <div className="flex h-64 items-center justify-center rounded-lg border border-dashed">
          <p className="text-muted-foreground">User not found</p>
        </div>
      </div>
    )
  }

  const isActionLoading =
    actions.warn.isPending ||
    actions.suspend.isPending ||
    actions.ban.isPending ||
    actions.reactivate.isPending ||
    actions.resetWarnings.isPending

  return (
    <div className="space-y-6">
      <Button variant="outline" onClick={() => router.back()}>
        <ArrowLeft className="mr-2 h-4 w-4" />
        Back to Users
      </Button>

      <UserDetail
        user={user}
        adminUser={adminUser}
        onWarn={handleWarn}
        onSuspend={handleSuspend}
        onBan={handleBan}
        onReactivate={handleReactivate}
        onResetWarnings={handleResetWarnings}
        isLoading={isActionLoading}
      />
    </div>
  )
}
