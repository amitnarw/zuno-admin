import { createAdminClient } from '@/lib/supabase/admin'
import { UsersTable, UserRow } from '@/components/dashboard/users-table'
import { Users, UserPlus } from 'lucide-react'

async function fetchUsers(search: string): Promise<UserRow[]> {
  const admin = createAdminClient()
  let query = admin
    .from('users')
    .select(`
      *,
      subscriptions (
        id,
        plan,
        status,
        expires_at
      )
    `)
    .order('created_at', { ascending: false })

  if (search) {
    query = query.ilike('email', `%${search}%`)
  }

  const { data, error } = await query

  if (!error && data) {
    return data.map((u: any) => ({
      ...u,
      subscription: u.subscriptions?.[0] ?? null,
    }))
  }
  return []
}

export default async function UsersPage({
  searchParams,
}: {
  searchParams: Promise<{ search?: string }>
}) {
  const params = await searchParams
  const search = params.search ?? ''
  const users = await fetchUsers(search)

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2">
        <div>
          <h1 className="text-xl font-bold text-white tracking-tight">User Directory</h1>
          <p className="text-xs text-zinc-400 mt-0.5">
            Manage streaming accounts, active subscription tiers, and TV permissions
          </p>
        </div>
      </div>

      {/* Users Table */}
      <UsersTable users={users} initialSearch={search} />
    </div>
  )
}
