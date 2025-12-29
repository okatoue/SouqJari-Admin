"use client"

import { useState } from 'react'
import Link from 'next/link'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Eye,
  MoreHorizontal,
  Package,
  User,
  ArrowUpDown,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react'
import type { Report, ReportStatus, ReportReason } from '@/types'
import { REPORT_REASONS, REPORT_STATUS_LABELS } from '@/lib/constants'
import { formatDistanceToNow } from '@/lib/utils'

interface ReportsTableProps {
  reports: Report[]
  isLoading?: boolean
  hasNextPage?: boolean
  isFetchingNextPage?: boolean
  onLoadMore?: () => void
  totalCount?: number
  currentPage?: number
  onPageChange?: (page: number) => void
}

function getStatusBadgeVariant(status: ReportStatus) {
  switch (status) {
    case 'pending':
      return 'warning'
    case 'under_review':
      return 'info'
    case 'resolved':
      return 'success'
    case 'dismissed':
      return 'secondary'
    default:
      return 'default'
  }
}

function getReasonBadgeVariant(reason: ReportReason) {
  switch (reason) {
    case 'scam':
    case 'fraud':
      return 'destructive'
    case 'harassment':
    case 'offensive':
      return 'warning'
    case 'spam':
      return 'secondary'
    default:
      return 'outline'
  }
}

function truncateUUID(uuid: string): string {
  return uuid.slice(0, 8)
}

export function ReportsTable({
  reports,
  isLoading,
  hasNextPage,
  isFetchingNextPage,
  onLoadMore,
  totalCount,
}: ReportsTableProps) {
  const [sortField, setSortField] = useState<'created_at' | 'status'>('created_at')
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc')

  const sortedReports = [...reports].sort((a, b) => {
    if (sortField === 'created_at') {
      const dateA = new Date(a.created_at).getTime()
      const dateB = new Date(b.created_at).getTime()
      return sortDirection === 'desc' ? dateB - dateA : dateA - dateB
    }
    if (sortField === 'status') {
      const statusOrder = ['pending', 'under_review', 'resolved', 'dismissed']
      const indexA = statusOrder.indexOf(a.status)
      const indexB = statusOrder.indexOf(b.status)
      return sortDirection === 'desc' ? indexB - indexA : indexA - indexB
    }
    return 0
  })

  const toggleSort = (field: 'created_at' | 'status') => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc')
    } else {
      setSortField(field)
      setSortDirection('desc')
    }
  }

  if (isLoading) {
    return <ReportsTableSkeleton />
  }

  if (reports.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <div className="rounded-full bg-muted p-4 mb-4">
          <Package className="h-8 w-8 text-muted-foreground" />
        </div>
        <h3 className="text-lg font-medium">No reports found</h3>
        <p className="text-muted-foreground text-sm mt-1">
          No reports match your current filters.
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[100px]">ID</TableHead>
              <TableHead>Target</TableHead>
              <TableHead>Reason</TableHead>
              <TableHead>Reporter</TableHead>
              <TableHead>
                <Button
                  variant="ghost"
                  size="sm"
                  className="-ml-3 h-8"
                  onClick={() => toggleSort('status')}
                >
                  Status
                  <ArrowUpDown className="ml-2 h-4 w-4" />
                </Button>
              </TableHead>
              <TableHead>
                <Button
                  variant="ghost"
                  size="sm"
                  className="-ml-3 h-8"
                  onClick={() => toggleSort('created_at')}
                >
                  Created
                  <ArrowUpDown className="ml-2 h-4 w-4" />
                </Button>
              </TableHead>
              <TableHead className="w-[70px]">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {sortedReports.map((report) => (
              <TableRow key={report.id}>
                <TableCell className="font-mono text-xs">
                  {truncateUUID(report.id)}
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    {report.reported_listing ? (
                      <>
                        <Package className="h-4 w-4 text-muted-foreground" />
                        <div className="flex flex-col">
                          <span className="font-medium truncate max-w-[200px]">
                            {report.reported_listing.title}
                          </span>
                          <span className="text-xs text-muted-foreground">
                            by {report.reported_listing.seller?.display_name || 'Unknown'}
                          </span>
                        </div>
                      </>
                    ) : report.reported_user ? (
                      <>
                        <User className="h-4 w-4 text-muted-foreground" />
                        <div className="flex flex-col">
                          <span className="font-medium">
                            {report.reported_user.display_name || 'Unknown User'}
                          </span>
                          <span className="text-xs text-muted-foreground">
                            {report.reported_user.email}
                          </span>
                        </div>
                      </>
                    ) : (
                      <span className="text-muted-foreground">Unknown target</span>
                    )}
                  </div>
                </TableCell>
                <TableCell>
                  <Badge variant={getReasonBadgeVariant(report.reason)}>
                    {REPORT_REASONS[report.reason]?.label || report.reason}
                  </Badge>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <Avatar className="h-6 w-6">
                      <AvatarImage src={report.reporter?.avatar_url || undefined} />
                      <AvatarFallback className="text-xs">
                        {report.reporter?.display_name?.charAt(0) || 'U'}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex flex-col">
                      <span className="text-sm">
                        {report.reporter?.display_name || 'Unknown'}
                      </span>
                      <span className="text-xs text-muted-foreground truncate max-w-[150px]">
                        {report.reporter?.email}
                      </span>
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  <Badge variant={getStatusBadgeVariant(report.status)}>
                    {REPORT_STATUS_LABELS[report.status]?.label || report.status}
                  </Badge>
                </TableCell>
                <TableCell className="text-muted-foreground text-sm">
                  {formatDistanceToNow(report.created_at)}
                </TableCell>
                <TableCell>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <MoreHorizontal className="h-4 w-4" />
                        <span className="sr-only">Open menu</span>
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem asChild>
                        <Link href={`/reports/${report.id}`}>
                          <Eye className="mr-2 h-4 w-4" />
                          View Details
                        </Link>
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          Showing {reports.length} {totalCount ? `of ${totalCount}` : ''} reports
        </p>
        {hasNextPage && (
          <Button
            variant="outline"
            onClick={onLoadMore}
            disabled={isFetchingNextPage}
          >
            {isFetchingNextPage ? (
              'Loading...'
            ) : (
              <>
                Load More
                <ChevronRight className="ml-2 h-4 w-4" />
              </>
            )}
          </Button>
        )}
      </div>
    </div>
  )
}

function ReportsTableSkeleton() {
  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[100px]">ID</TableHead>
            <TableHead>Target</TableHead>
            <TableHead>Reason</TableHead>
            <TableHead>Reporter</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Created</TableHead>
            <TableHead className="w-[70px]">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {Array.from({ length: 5 }).map((_, i) => (
            <TableRow key={i}>
              <TableCell>
                <Skeleton className="h-4 w-16" />
              </TableCell>
              <TableCell>
                <div className="flex items-center gap-2">
                  <Skeleton className="h-4 w-4" />
                  <div className="space-y-1">
                    <Skeleton className="h-4 w-32" />
                    <Skeleton className="h-3 w-24" />
                  </div>
                </div>
              </TableCell>
              <TableCell>
                <Skeleton className="h-5 w-20" />
              </TableCell>
              <TableCell>
                <div className="flex items-center gap-2">
                  <Skeleton className="h-6 w-6 rounded-full" />
                  <div className="space-y-1">
                    <Skeleton className="h-4 w-24" />
                    <Skeleton className="h-3 w-32" />
                  </div>
                </div>
              </TableCell>
              <TableCell>
                <Skeleton className="h-5 w-16" />
              </TableCell>
              <TableCell>
                <Skeleton className="h-4 w-20" />
              </TableCell>
              <TableCell>
                <Skeleton className="h-8 w-8" />
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}
