import { createClient } from '@/utils/supabase/server'
import { NextResponse, type NextRequest } from 'next/server'

export async function GET(request: NextRequest) {
  const code = request.nextUrl.searchParams.get('code')
  const next = request.nextUrl.searchParams.get('next') ?? '/dashboard'

  if (code) {
    const supabase = createClient()
    const { error } = await supabase.auth.exchangeCodeForSession(code)

    if (!error) {
      const host = request.headers.get('x-forwarded-host')
      const baseUrl = host ? `https://${host}` : request.nextUrl.origin
      return NextResponse.redirect(`${baseUrl}${next}`)
    }
  }

  // Auth failed — return to login
  const url = request.nextUrl.clone()
  url.pathname = '/login'
  url.searchParams.set('error', 'auth_failed')
  url.searchParams.delete('code')
  return NextResponse.redirect(url)
}
