import { createClient } from '@/utils/supabase/server'
import { NextResponse, NextRequest } from 'next/server'

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const code = searchParams.get('code')
  const next = searchParams.get('next') ?? '/dashboard'

  console.log('[AUTH CALLBACK] Triggered')
  console.log('[AUTH CALLBACK] code present:', !!code)
  console.log('[AUTH CALLBACK] next:', next)
  console.log('[AUTH CALLBACK] origin:', request.nextUrl.origin)
  console.log('[AUTH CALLBACK] x-forwarded-host:', request.headers.get('x-forwarded-host'))
  console.log('[AUTH CALLBACK] NODE_ENV:', process.env.NODE_ENV)

  if (code) {
    const supabase = createClient()
    const { data, error } = await supabase.auth.exchangeCodeForSession(code)

    console.log('[AUTH CALLBACK] exchangeCodeForSession error:', error?.message ?? 'none')
    console.log('[AUTH CALLBACK] session created:', !!data?.session)
    console.log('[AUTH CALLBACK] user:', data?.session?.user?.email ?? 'none')

    if (!error) {
      const forwardedHost = request.headers.get('x-forwarded-host')
      const isLocalEnv = process.env.NODE_ENV === 'development'

      let redirectUrl: string

      if (isLocalEnv) {
        redirectUrl = `${request.nextUrl.origin}${next}`
      } else if (forwardedHost) {
        redirectUrl = `https://${forwardedHost}${next}`
      } else {
        const url = request.nextUrl.clone()
        url.pathname = next
        url.search = ''
        redirectUrl = url.toString()
      }

      console.log('[AUTH CALLBACK] redirecting to:', redirectUrl)
      return NextResponse.redirect(redirectUrl)
    }

    console.log('[AUTH CALLBACK] FAILED — redirecting to login with error')
  } else {
    console.log('[AUTH CALLBACK] No code in URL — redirecting to login')
  }

  const errorUrl = request.nextUrl.clone()
  errorUrl.pathname = '/login'
  errorUrl.searchParams.set('error', 'auth_failed')
  return NextResponse.redirect(errorUrl)
}
