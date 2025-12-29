import { createClient } from '@/lib/supabase/server'
import { Header } from '@/components/layout/Header'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Flag, Package, Users, MessageSquare, AlertTriangle, TrendingUp } from 'lucide-react'
import type { AdminUser } from '@/types'

export default async function DashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const { data: adminUser } = await supabase
    .from('admin_users')
    .select('id, user_id, role, is_active')
    .eq('user_id', user?.id)
    .single()

  const typedAdminUser = adminUser as AdminUser | null

  // Placeholder stats - in production, these would come from real queries
  const stats = [
    {
      title: 'Pending Reports',
      value: '12',
      description: 'Requires attention',
      icon: Flag,
      color: 'text-red-500',
      bgColor: 'bg-red-50',
    },
    {
      title: 'Active Listings',
      value: '1,234',
      description: 'Total marketplace listings',
      icon: Package,
      color: 'text-blue-500',
      bgColor: 'bg-blue-50',
    },
    {
      title: 'Total Users',
      value: '5,678',
      description: 'Registered users',
      icon: Users,
      color: 'text-green-500',
      bgColor: 'bg-green-50',
    },
    {
      title: 'New Feedback',
      value: '8',
      description: 'Unread feedback',
      icon: MessageSquare,
      color: 'text-purple-500',
      bgColor: 'bg-purple-50',
    },
  ]

  return (
    <div className="flex flex-col">
      <Header
        title="Dashboard"
        adminUser={typedAdminUser}
        userEmail={user?.email}
      />

      <div className="flex-1 space-y-6 p-6">
        {/* Welcome message */}
        <div className="rounded-lg border bg-card p-6">
          <h2 className="text-lg font-semibold">
            Welcome back{typedAdminUser?.role ? `, ${typedAdminUser.role.replace('_', ' ')}` : ''}!
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Here&apos;s an overview of the SouqJari marketplace.
          </p>
        </div>

        {/* Stats grid */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {stats.map((stat) => {
            const Icon = stat.icon
            return (
              <Card key={stat.title}>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    {stat.title}
                  </CardTitle>
                  <div className={`rounded-full p-2 ${stat.bgColor}`}>
                    <Icon className={`h-4 w-4 ${stat.color}`} />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stat.value}</div>
                  <p className="text-xs text-muted-foreground">{stat.description}</p>
                </CardContent>
              </Card>
            )
          })}
        </div>

        {/* Placeholder sections */}
        <div className="grid gap-6 lg:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-yellow-500" />
                Recent Reports
              </CardTitle>
              <CardDescription>
                Latest reported content requiring review
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex h-32 items-center justify-center text-muted-foreground">
                <p>Reports will appear here</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-green-500" />
                Activity Overview
              </CardTitle>
              <CardDescription>
                Marketplace activity trends
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex h-32 items-center justify-center text-muted-foreground">
                <p>Activity charts will appear here</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
