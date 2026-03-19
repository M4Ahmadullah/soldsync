import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  let response = NextResponse.next({ request })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll: () => request.cookies.getAll(),
        setAll: (cookiesToSet) => {
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  const { data: { user } } = await supabase.auth.getUser()
  const path = request.nextUrl.pathname

  // Protect /dashboard and /settings
  if (path.startsWith('/dashboard') || path.startsWith('/settings')) {
    if (!user) {
      return NextResponse.redirect(new URL('/auth', request.url))
    }

    // Check subscription status — allow past_due so users can fix billing
    const { data: profile } = await supabase
      .from('profiles')
      .select('subscription_status')
      .eq('id', user.id)
      .single()

    if (!profile || !['active', 'trialing', 'past_due'].includes(profile.subscription_status)) {
      return NextResponse.redirect(new URL('/subscribe', request.url))
    }
  }

  // Redirect already-logged-in users away from /auth
  if (path === '/auth' && user) {
    return NextResponse.redirect(new URL('/dashboard', request.url))
  }

  return response
}

export const config = {
  matcher: ['/dashboard/:path*', '/settings/:path*', '/auth'],
}
