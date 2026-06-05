import { createClient } from '@/utils/supabase/server'
import { NextResponse } from 'next/server'

export async function GET() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  // Step 1: Check if env vars exist at all
  const envCheck = {
    SUPABASE_URL_set: !!supabaseUrl,
    SUPABASE_URL_value: supabaseUrl ? `${supabaseUrl.slice(0, 30)}...` : 'MISSING',
    SUPABASE_ANON_KEY_set: !!supabaseKey,
    SUPABASE_ANON_KEY_value: supabaseKey ? `${supabaseKey.slice(0, 20)}...` : 'MISSING',
  }

  // Step 2: Try to create a Supabase client and check session
  let sessionCheck: Record<string, unknown> = { status: 'not_attempted' }
  try {
    const supabase = createClient()
    const { data, error } = await supabase.auth.getUser()
    sessionCheck = {
      status: 'success',
      user_found: !!data?.user,
      user_id: data?.user?.id ?? null,
      user_email: data?.user?.email ?? null,
      error: error?.message ?? null,
    }
  } catch (e) {
    sessionCheck = {
      status: 'exception',
      error: String(e),
    }
  }

  return NextResponse.json({
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV,
    env_vars: envCheck,
    session: sessionCheck,
    message: sessionCheck.user_found
      ? '✅ Session valid — user is authenticated'
      : '❌ No session — user would be redirected to /login',
  })
}
