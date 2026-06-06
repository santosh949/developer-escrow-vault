import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import DashboardClient from './DashboardClient'
import type { User } from '@supabase/supabase-js'

// This is a SERVER COMPONENT — it can reliably read cookies and check auth
// Auth protection belongs here, NOT in client components or middleware
export default async function DashboardPage() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()

  // If no authenticated user, hard redirect to login
  if (!user) {
    redirect('/login')
  }

  return <DashboardClient user={user as User} />
}
