import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { Sidebar } from '@/components/layout/Sidebar'
import type { AdminUser } from '@/types'

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  // Get admin user data
  const { data: adminUser } = await supabase
    .from('admin_users')
    .select(`
      id,
      role,
      created_at,
      created_by,
      is_active
    `)
    .eq('id', user.id)
    .single()

  if (!adminUser || !adminUser.is_active) {
    redirect('/login?error=unauthorized')
  }

  const typedAdminUser = adminUser as AdminUser

  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar role={typedAdminUser.role} />
      <main className="flex-1 overflow-y-auto">
        {children}
      </main>
    </div>
  )
}
