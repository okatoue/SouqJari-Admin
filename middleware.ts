import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

interface CookieToSet {
  name: string
  value: string
  options?: CookieOptions
}

export async function middleware(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request })

  // Store cookies that need to be set
  let pendingCookies: CookieToSet[] = []

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet: CookieToSet[]) {
          pendingCookies = cookiesToSet
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
          supabaseResponse = NextResponse.next({ request })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  const { data: { user } } = await supabase.auth.getUser()

  // Helper to create redirect with cookies
  const createRedirect = (pathname: string, searchParams?: Record<string, string>) => {
    const url = request.nextUrl.clone()
    url.pathname = pathname
    if (searchParams) {
      Object.entries(searchParams).forEach(([key, value]) => {
        url.searchParams.set(key, value)
      })
    }
    const response = NextResponse.redirect(url)
    // Apply any pending cookies to the redirect response
    pendingCookies.forEach(({ name, value, options }) => {
      response.cookies.set(name, value, options)
    })
    return response
  }

  // Redirect unauthenticated users to login
  if (!user && !request.nextUrl.pathname.startsWith('/login') && !request.nextUrl.pathname.startsWith('/api/auth')) {
    return createRedirect('/login')
  }

  // For authenticated users accessing protected routes, check admin status
  if (user && !request.nextUrl.pathname.startsWith('/login') && !request.nextUrl.pathname.startsWith('/api/auth')) {
    const { data: adminUser, error } = await supabase
      .from('admin_users')
      .select('role, is_active')
      .eq('user_id', user.id)
      .single()

    if (error || !adminUser || !adminUser.is_active) {
      // Not an admin - sign out and redirect to unauthorized page
      await supabase.auth.signOut()
      return createRedirect('/login', { error: 'unauthorized' })
    }
  }

  // Redirect authenticated admins away from login
  if (user && request.nextUrl.pathname === '/login') {
    const { data: adminUser } = await supabase
      .from('admin_users')
      .select('role, is_active')
      .eq('user_id', user.id)
      .single()

    if (adminUser && adminUser.is_active) {
      return createRedirect('/')
    }
  }

  return supabaseResponse
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
