"use client"

import Link from 'next/link'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
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
import { MODERATION_STATUS_LABELS } from '@/lib/constants'
import { formatDistanceToNow } from '@/lib/utils'
import {
  MoreHorizontal,
  Eye,
  AlertTriangle,
  Ban,
  Clock,
  CheckCircle,
  RotateCcw,
} from 'lucide-react'
import type { Profile } from '@/types'

interface UsersTableProps {
  users: (Profile & {
    listings_count?: number
    reports_count?: number
  })[]
  isLoading?: boolean
  onWarn?: (userId: string) => void
  onSuspend?: (userId: string) => void
  onBan?: (userId: string) => void
  onReactivate?: (userId: string) => void
}

export function UsersTable({
  users,
  isLoading,
  onWarn,
  onSuspend,
  onBan,
  onReactivate,
}: UsersTableProps) {
  if (isLoading) {
    return (
      <div className="space-y-3">
        {Array.from({ length: 5 }).map((_, i) => (
          <Skeleton key={i} className="h-16 w-full" />
        ))}
      </div>
    )
  }

  if (users.length === 0) {
    return (
      <div className="flex h-64 items-center justify-center rounded-lg border border-dashed">
        <p className="text-muted-foreground">No users found</p>
      </div>
    )
  }

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>User</TableHead>
            <TableHead>Phone</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Joined</TableHead>
            <TableHead>Listings</TableHead>
            <TableHead>Reports</TableHead>
            <TableHead className="w-12"></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {users.map((user) => {
            const moderationInfo = MODERATION_STATUS_LABELS[user.moderation_status]
            const initials = user.display_name
              ? user.display_name
                  .split(' ')
                  .map((n) => n[0])
                  .join('')
                  .toUpperCase()
                  .slice(0, 2)
              : user.email?.[0]?.toUpperCase() || 'U'

            return (
              <TableRow key={user.id}>
                <TableCell>
                  <Link
                    href={`/users/${user.id}`}
                    className="flex items-center gap-3 hover:text-primary"
                  >
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={user.avatar_url || undefined} />
                      <AvatarFallback className="text-xs">{initials}</AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-medium">
                        {user.display_name || 'No Name'}
                      </p>
                      <p className="text-sm text-muted-foreground flex items-center gap-1">
                        {user.email}
                        {user.email_verified && (
                          <CheckCircle className="h-3 w-3 text-green-500" />
                        )}
                      </p>
                    </div>
                  </Link>
                </TableCell>
                <TableCell className="text-sm">
                  {user.phone_number || '-'}
                </TableCell>
                <TableCell>
                  <div className="flex flex-col gap-1">
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
                          ? 'bg-yellow-100 text-yellow-800'
                          : moderationInfo.color === 'orange'
                          ? 'bg-orange-100 text-orange-800'
                          : ''
                      }
                    >
                      {moderationInfo.label}
                    </Badge>
                    {user.warning_count > 0 && (
                      <span className="text-xs text-yellow-600 flex items-center gap-1">
                        <AlertTriangle className="h-3 w-3" />
                        {user.warning_count} warning(s)
                      </span>
                    )}
                  </div>
                </TableCell>
                <TableCell className="text-sm text-muted-foreground">
                  {formatDistanceToNow(user.created_at)}
                </TableCell>
                <TableCell className="text-sm">
                  {user.listings_count || 0}
                </TableCell>
                <TableCell>
                  {(user.reports_count || 0) > 0 ? (
                    <span className="flex items-center gap-1 text-sm text-yellow-600">
                      <AlertTriangle className="h-3 w-3" />
                      {user.reports_count}
                    </span>
                  ) : (
                    <span className="text-sm text-muted-foreground">0</span>
                  )}
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
                        <Link href={`/users/${user.id}`}>
                          <Eye className="mr-2 h-4 w-4" />
                          View Profile
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      {user.moderation_status === 'active' && (
                        <>
                          <DropdownMenuItem onClick={() => onWarn?.(user.id)}>
                            <AlertTriangle className="mr-2 h-4 w-4 text-yellow-500" />
                            Issue Warning
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => onSuspend?.(user.id)}>
                            <Clock className="mr-2 h-4 w-4 text-orange-500" />
                            Suspend
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => onBan?.(user.id)}
                            className="text-red-600"
                          >
                            <Ban className="mr-2 h-4 w-4" />
                            Ban User
                          </DropdownMenuItem>
                        </>
                      )}
                      {user.moderation_status === 'warned' && (
                        <>
                          <DropdownMenuItem onClick={() => onSuspend?.(user.id)}>
                            <Clock className="mr-2 h-4 w-4 text-orange-500" />
                            Suspend
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => onBan?.(user.id)}
                            className="text-red-600"
                          >
                            <Ban className="mr-2 h-4 w-4" />
                            Ban User
                          </DropdownMenuItem>
                        </>
                      )}
                      {(user.moderation_status === 'suspended' ||
                        user.moderation_status === 'banned') && (
                        <DropdownMenuItem onClick={() => onReactivate?.(user.id)}>
                          <RotateCcw className="mr-2 h-4 w-4 text-green-500" />
                          Reactivate
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
