import { createClient } from '@/lib/supabase/server'
import { Header } from '@/components/layout/Header'
import { ListingDetailPageClient } from '@/components/listings/ListingDetailPageClient'
import type { AdminUser } from '@/types'

interface ListingDetailPageProps {
  params: Promise<{ id: string }>
}

export default async function ListingDetailPage({ params }: ListingDetailPageProps) {
  const { id } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const { data: adminUser } = await supabase
    .from('admin_users')
    .select('id, user_id, role, is_active')
    .eq('user_id', user?.id)
    .single()

  const typedAdminUser = adminUser as AdminUser | null
  const listingId = parseInt(id, 10)

  return (
    <div className="flex flex-col">
      <Header
        title="Listing Details"
        adminUser={typedAdminUser}
        userEmail={user?.email}
      />

      <div className="flex-1 space-y-6 p-6">
        {typedAdminUser && (
          <ListingDetailPageClient
            listingId={listingId}
            adminUser={typedAdminUser}
          />
        )}
      </div>
    </div>
  )
}
