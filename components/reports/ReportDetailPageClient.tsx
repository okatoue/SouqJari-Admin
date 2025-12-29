"use client"

import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { ArrowLeft, AlertCircle } from 'lucide-react'
import { useReport } from '@/hooks/useReport'
import { ReportDetail } from './ReportDetail'
import type { AdminUser } from '@/types'

interface ReportDetailPageClientProps {
  reportId: string
  adminUser: AdminUser
}

export function ReportDetailPageClient({
  reportId,
  adminUser,
}: ReportDetailPageClientProps) {
  const { data: report, isLoading, error } = useReport(reportId)

  if (isLoading) {
    return <ReportDetailSkeleton />
  }

  if (error || !report) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <div className="rounded-full bg-red-100 p-4 mb-4">
          <AlertCircle className="h-8 w-8 text-red-600" />
        </div>
        <h2 className="text-lg font-medium">Report Not Found</h2>
        <p className="text-muted-foreground text-sm mt-1">
          {error?.message || 'The report you are looking for does not exist or has been removed.'}
        </p>
        <Button asChild variant="outline" className="mt-4">
          <Link href="/reports">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Reports
          </Link>
        </Button>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Back Button */}
      <div>
        <Button asChild variant="ghost" size="sm">
          <Link href="/reports">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Reports
          </Link>
        </Button>
      </div>

      {/* Report Detail */}
      <ReportDetail
        report={report}
        adminId={adminUser.id}
        adminRole={adminUser.role}
      />
    </div>
  )
}

function ReportDetailSkeleton() {
  return (
    <div className="space-y-6">
      {/* Back Button */}
      <Skeleton className="h-8 w-32" />

      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="space-y-2">
          <Skeleton className="h-8 w-64" />
          <Skeleton className="h-4 w-48" />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Reported Item Card */}
          <div className="border rounded-lg p-6 space-y-4">
            <div className="flex items-center gap-2">
              <Skeleton className="h-5 w-5" />
              <Skeleton className="h-6 w-32" />
            </div>
            <Skeleton className="h-48 w-full" />
            <div className="space-y-2">
              <Skeleton className="h-6 w-3/4" />
              <Skeleton className="h-4 w-1/2" />
            </div>
          </div>

          {/* Report Details Card */}
          <div className="border rounded-lg p-6 space-y-4">
            <Skeleton className="h-6 w-32" />
            <div className="space-y-2">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-2/3" />
            </div>
          </div>

          {/* Admin Notes Card */}
          <div className="border rounded-lg p-6 space-y-4">
            <div className="flex justify-between">
              <Skeleton className="h-6 w-32" />
              <Skeleton className="h-8 w-16" />
            </div>
            <Skeleton className="h-20 w-full" />
          </div>

          {/* Actions Card */}
          <div className="border rounded-lg p-6 space-y-4">
            <Skeleton className="h-6 w-24" />
            <div className="flex gap-3">
              <Skeleton className="h-10 w-24" />
              <Skeleton className="h-10 w-28" />
              <Skeleton className="h-10 w-32" />
              <Skeleton className="h-10 w-32" />
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Reporter Card */}
          <div className="border rounded-lg p-6 space-y-4">
            <Skeleton className="h-6 w-24" />
            <div className="flex items-center gap-3">
              <Skeleton className="h-10 w-10 rounded-full" />
              <div className="space-y-1">
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-3 w-40" />
              </div>
            </div>
            <Skeleton className="h-4 w-24" />
          </div>
        </div>
      </div>
    </div>
  )
}
