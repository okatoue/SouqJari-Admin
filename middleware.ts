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

  // Refresh session - this is critical for server components
  const { data: { user } } = await supabase.auth.getUser()

  // Helper to create redirect with cookies
  const createRedirect = (pathname: string) => {
    const url = new URL(pathname, request.url)
    const response = NextResponse.redirect(url)
    // Apply any pending cookies to the redirect response
    pendingCookies.forEach(({ name, value, options }) => {
      response.cookies.set(name, value, options)
    })
    return response
  }

  const isLoginPage = request.nextUrl.pathname === '/login'
  const isAuthCallback = request.nextUrl.pathname.startsWith('/api/auth')

  // Skip auth routes
  if (isAuthCallback) {
    return supabaseResponse
  }

  // Redirect unauthenticated users to login (except if already on login page)
  if (!user && !isLoginPage) {
    return createRedirect('/login')
  }

  // Redirect authenticated users away from login page
  // But NOT if there's an error param (means they were redirected from dashboard as non-admin)
  // Note: Admin check happens in the dashboard layout, not here
  if (user && isLoginPage && !request.nextUrl.searchParams.has('error')) {
    return createRedirect('/')
  }

  return supabaseResponse
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
