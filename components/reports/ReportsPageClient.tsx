"use client"

import { useState } from 'react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { ReportsTable } from './ReportsTable'
import { ReportFilters } from './ReportFilters'
import { useReports, flattenReports } from '@/hooks/useReports'
import type { ReportStatus, ReportReason, AdminUser } from '@/types'

interface ReportsPageClientProps {
  adminUser: AdminUser
}

export function ReportsPageClient({ adminUser }: ReportsPageClientProps) {
  const [activeTab, setActiveTab] = useState<ReportStatus | 'all'>('all')
  const [selectedReasons, setSelectedReasons] = useState<ReportReason[]>([])
  const [targetType, setTargetType] = useState<'listing' | 'user' | 'all'>('all')
  const [dateFrom, setDateFrom] = useState<Date | undefined>()
  const [dateTo, setDateTo] = useState<Date | undefined>()

  const {
    data,
    isLoading,
    isFetchingNextPage,
    hasNextPage,
    fetchNextPage,
    error,
  } = useReports({
    status: activeTab,
    reason: selectedReasons.length > 0 ? selectedReasons : undefined,
    targetType,
    dateFrom,
    dateTo,
  })

  const reports = flattenReports(data?.pages)
  const totalCount = data?.pages[0]?.totalCount || 0

  const handleClearFilters = () => {
    setSelectedReasons([])
    setTargetType('all')
    setDateFrom(undefined)
    setDateTo(undefined)
  }

  // Get counts for tabs (we'll show them if we have data)
  const pendingCount = reports.filter((r) => r.status === 'pending').length
  const underReviewCount = reports.filter((r) => r.status === 'under_review').length

  return (
    <div className="space-y-6">
      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as ReportStatus | 'all')}>
        <TabsList className="grid w-full grid-cols-5 lg:w-auto lg:inline-grid">
          <TabsTrigger value="all" className="gap-2">
            All
            {totalCount > 0 && (
              <Badge variant="secondary" className="h-5 px-1.5">
                {totalCount}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="pending" className="gap-2">
            Pending
            {activeTab === 'all' && pendingCount > 0 && (
              <Badge variant="warning" className="h-5 px-1.5">
                {pendingCount}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="under_review">Under Review</TabsTrigger>
          <TabsTrigger value="resolved">Resolved</TabsTrigger>
          <TabsTrigger value="dismissed">Dismissed</TabsTrigger>
        </TabsList>

        {/* Filters */}
        <div className="mt-4">
          <ReportFilters
            selectedReasons={selectedReasons}
            onReasonsChange={setSelectedReasons}
            targetType={targetType}
            onTargetTypeChange={setTargetType}
            dateFrom={dateFrom}
            dateTo={dateTo}
            onDateFromChange={setDateFrom}
            onDateToChange={setDateTo}
            onClearFilters={handleClearFilters}
          />
        </div>

        {/* Table Content */}
        <TabsContent value={activeTab} className="mt-4">
          {error ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <div className="rounded-full bg-red-100 p-4 mb-4">
                <span className="text-red-600 text-2xl">!</span>
              </div>
              <h3 className="text-lg font-medium">Error loading reports</h3>
              <p className="text-muted-foreground text-sm mt-1">
                {error.message || 'Something went wrong. Please try again.'}
              </p>
            </div>
          ) : (
            <ReportsTable
              reports={reports}
              isLoading={isLoading}
              hasNextPage={hasNextPage}
              isFetchingNextPage={isFetchingNextPage}
              onLoadMore={() => fetchNextPage()}
              totalCount={totalCount}
            />
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}
