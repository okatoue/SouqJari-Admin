import { createClient } from '@/lib/supabase/server'
import { Header } from '@/components/layout/Header'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Flag } from 'lucide-react'
import type { AdminUser } from '@/types'

export default async function ReportsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const { data: adminUser } = await supabase
    .from('admin_users')
    .select('id, role, created_at, created_by, is_active')
    .eq('id', user?.id)
    .single()

  const typedAdminUser = adminUser as AdminUser | null

  return (
    <div className="flex flex-col">
      <Header
        title="Reports"
        adminUser={typedAdminUser}
        userEmail={user?.email}
      />

      <div className="flex-1 space-y-6 p-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Flag className="h-5 w-5" />
              Content Reports
            </CardTitle>
            <CardDescription>
              Review and moderate reported listings and users
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex h-64 items-center justify-center rounded-lg border border-dashed">
              <div className="text-center">
                <Flag className="mx-auto h-12 w-12 text-muted-foreground/50" />
                <h3 className="mt-4 text-lg font-medium">Reports Management</h3>
                <p className="mt-2 text-sm text-muted-foreground">
                  Report listing and management functionality will be implemented here.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
