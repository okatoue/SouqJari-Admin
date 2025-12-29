import { createClient } from '@/lib/supabase/server'
import { Header } from '@/components/layout/Header'
import { ReportDetailPageClient } from '@/components/reports/ReportDetailPageClient'
import type { AdminUser } from '@/types'

interface ReportDetailPageProps {
  params: Promise<{ id: string }>
}

export default async function ReportDetailPage({ params }: ReportDetailPageProps) {
  const { id } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const { data: adminUser } = await supabase
    .from('admin_users')
    .select('id, user_id, role, is_active, created_at, created_by')
    .eq('user_id', user?.id)
    .single()

  const typedAdminUser = adminUser as unknown as AdminUser

  return (
    <div className="flex flex-col">
      <Header
        title="Report Details"
        adminUser={typedAdminUser}
        userEmail={user?.email}
      />

      <div className="flex-1 p-6">
        <ReportDetailPageClient
          reportId={id}
          adminUser={typedAdminUser}
        />
      </div>
    </div>
  )
}
