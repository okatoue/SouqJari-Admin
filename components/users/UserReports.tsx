"use client"

import Link from 'next/link'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { REPORT_REASONS, REPORT_STATUS_LABELS } from '@/lib/constants'
import { formatDistanceToNow } from '@/lib/utils'
import { ExternalLink, FileText } from 'lucide-react'
import type { Report } from '@/types'

interface UserReportsProps {
  reports: Report[]
  type: 'against' | 'filed'
}

export function UserReports({ reports, type }: UserReportsProps) {
  if (reports.length === 0) {
    return (
      <div className="flex h-48 items-center justify-center rounded-lg border border-dashed">
        <p className="text-muted-foreground">
          {type === 'against'
            ? 'No reports against this user'
            : 'This user has not filed any reports'}
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-3">
      {reports.map((report) => {
        const reasonInfo = REPORT_REASONS[report.reason]
        const statusInfo = REPORT_STATUS_LABELS[report.status]

        return (
          <Card key={report.id}>
            <CardContent className="p-4">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <Badge variant="outline">{reasonInfo?.label || report.reason}</Badge>
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
                    <p className="mt-2 text-sm text-muted-foreground line-clamp-2">
                      {report.description}
                    </p>
                  )}

                  <div className="mt-2 flex items-center gap-4 text-xs text-muted-foreground">
                    <span>{formatDistanceToNow(report.created_at)}</span>
                    {type === 'against' && report.reported_listing_id && (
                      <span className="flex items-center gap-1">
                        <FileText className="h-3 w-3" />
                        Listing #{report.reported_listing_id}
                      </span>
                    )}
                    {type === 'filed' && (
                      <>
                        {report.reported_listing_id && (
                          <span className="flex items-center gap-1">
                            <FileText className="h-3 w-3" />
                            vs Listing #{report.reported_listing_id}
                          </span>
                        )}
                        {report.reported_user_id && (
                          <span>vs User</span>
                        )}
                      </>
                    )}
                  </div>
                </div>

                <Button variant="ghost" size="sm" asChild>
                  <Link href={`/reports/${report.id}`}>
                    <ExternalLink className="h-4 w-4" />
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
