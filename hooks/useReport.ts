"use client"

import { useQuery } from '@tanstack/react-query'
import { createClient } from '@/lib/supabase/client'
import type { Report, AuditLogEntry } from '@/types'

interface ReportWithHistory extends Report {
  actionHistory: AuditLogEntry[]
}

async function fetchReport(id: string): Promise<ReportWithHistory> {
  const supabase = createClient()

  // Fetch the report - simplified query without joins
  const { data: report, error: reportError } = await supabase
    .from('reports')
    .select('*')
    .eq('id', id)
    .single()

  if (reportError) {
    throw reportError
  }

  // Fetch action history from audit log for this report
  const targetIds = [id]
  if (report.reported_user_id) {
    targetIds.push(report.reported_user_id)
  }
  if (report.reported_listing_id) {
    targetIds.push(report.reported_listing_id.toString())
  }

  const { data: auditLogs, error: auditError } = await supabase
    .from('admin_audit_log')
    .select('*')
    .in('target_id', targetIds)
    .order('created_at', { ascending: false })

  if (auditError) {
    console.error('Error fetching audit logs:', auditError)
  }

  return {
    ...report,
    actionHistory: auditLogs || [],
  } as ReportWithHistory
}

export function useReport(id: string | undefined) {
  return useQuery({
    queryKey: ['report', id],
    queryFn: () => fetchReport(id!),
    enabled: !!id,
    refetchOnWindowFocus: false,
  })
}

// Hook to get reports filed by a specific user
export function useReportsByReporter(reporterId: string | undefined) {
  const supabase = createClient()

  return useQuery({
    queryKey: ['reports-by-reporter', reporterId],
    queryFn: async () => {
      const { data, error, count } = await supabase
        .from('reports')
        .select('id, reason, status, created_at', { count: 'exact' })
        .eq('reporter_id', reporterId!)
        .order('created_at', { ascending: false })
        .limit(10)

      if (error) throw error
      return { reports: data, totalCount: count || 0 }
    },
    enabled: !!reporterId,
  })
}

// Hook to get reports against a specific target
export function useReportsAgainstTarget(targetType: 'user' | 'listing', targetId: string | number | undefined) {
  const supabase = createClient()

  return useQuery({
    queryKey: ['reports-against-target', targetType, targetId],
    queryFn: async () => {
      let query = supabase
        .from('reports')
        .select('id, reason, status, created_at', { count: 'exact' })
        .order('created_at', { ascending: false })
        .limit(10)

      if (targetType === 'user') {
        query = query.eq('reported_user_id', targetId as string)
      } else {
        query = query.eq('reported_listing_id', targetId as number)
      }

      const { data, error, count } = await query

      if (error) throw error
      return { reports: data, totalCount: count || 0 }
    },
    enabled: !!targetId,
  })
}
