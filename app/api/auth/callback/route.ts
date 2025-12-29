import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  const next = searchParams.get('next') ?? '/'

  if (code) {
    const supabase = await createClient()
    const { error } = await supabase.auth.exchangeCodeForSession(code)

    if (!error) {
      // Check if user is an admin
      const { data: { user } } = await supabase.auth.getUser()

      if (user) {
        const { data: adminUser } = await supabase
          .from('admin_users')
          .select('role, is_active')
          .eq('id', user.id)
          .single()

        if (!adminUser || !adminUser.is_active) {
          // Not an admin - sign out and redirect with error
          await supabase.auth.signOut()
          return NextResponse.redirect(`${origin}/login?error=unauthorized`)
        }
      }

      return NextResponse.redirect(`${origin}${next}`)
    }
  }

  // Return the user to an error page with instructions
  return NextResponse.redirect(`${origin}/login?error=auth_callback_error`)
}
