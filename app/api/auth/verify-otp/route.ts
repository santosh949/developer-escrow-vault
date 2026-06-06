import { createClient } from '@/utils/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const { email, token } = await request.json()

    if (!email || !token) {
      return NextResponse.json({ error: 'Email and token are required' }, { status: 400 })
    }

    const supabase = createClient()

    // Verify the OTP server-side — this sets the session via Set-Cookie headers
    const { data, error } = await supabase.auth.verifyOtp({
      email,
      token,
      type: 'email',
    })

    if (error) {
      console.error('[VERIFY OTP] Error:', error.message)
      return NextResponse.json({ error: error.message }, { status: 400 })
    }

    if (!data.session) {
      console.error('[VERIFY OTP] No session returned after verification')
      return NextResponse.json({ error: 'No session created' }, { status: 400 })
    }

    console.log('[VERIFY OTP] Success for:', data.session.user.email)
    return NextResponse.json({ success: true })

  } catch (err) {
    console.error('[VERIFY OTP] Exception:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
