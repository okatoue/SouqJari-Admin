import { createClient } from '@/lib/supabase/server'
import { Header } from '@/components/layout/Header'
import { UserDetailPageClient } from '@/components/users/UserDetailPageClient'
import type { AdminUser } from '@/types'

interface UserDetailPageProps {
  params: Promise<{ id: string }>
}

export default async function UserDetailPage({ params }: UserDetailPageProps) {
  const { id } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const { data: adminUser } = await supabase
    .from('admin_users')
    .select('id, user_id, role, is_active')
    .eq('user_id', user?.id)
    .single()

  const typedAdminUser = adminUser as AdminUser | null

  return (
    <div className="flex flex-col">
      <Header
        title="User Details"
        adminUser={typedAdminUser}
        userEmail={user?.email}
      />

      <div className="flex-1 space-y-6 p-6">
        {typedAdminUser && (
          <UserDetailPageClient
            userId={id}
            adminUser={typedAdminUser}
          />
        )}
      </div>
    </div>
  )
}
