import { NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const id = searchParams.get('id')
  const ban = searchParams.get('ban') === 'true'
  const reason = searchParams.get('reason') || null

  if (!id) {
    return NextResponse.json({ error: 'Missing user ID' }, { status: 400 })
  }

  const admin = createAdminClient()
  const updates: any = {
    banned: ban,
    updated_at: new Date().toISOString(),
  }

  if (ban) {
    updates.banned_at = new Date().toISOString()
    if (reason) updates.ban_reason = reason
  } else {
    updates.ban_reason = null
    updates.banned_at = null
  }

  const { error } = await admin
    .from('users')
    .update(updates)
    .eq('id', id)

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  // Also sync to subscriptions table for consistency (existing status enum has 'banned')
  try {
    await admin
      .from('subscriptions')
      .update({ status: ban ? 'banned' : 'active', updated_at: new Date().toISOString() })
      .eq('user_id', id)
  } catch {
    // Subscriptions row may not exist for every user — that's fine
  }

  return NextResponse.json({ success: true, banned: ban, reason: updates.ban_reason })
}
