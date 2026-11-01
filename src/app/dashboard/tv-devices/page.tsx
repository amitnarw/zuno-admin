import { createAdminClient } from '@/lib/supabase/admin'
import { Tv, CheckCircle2, Clock, Smartphone } from 'lucide-react'
import { TVDevicesTable, TVDevice } from '@/components/dashboard/tv-devices-table'

async function fetchDevices(search: string): Promise<TVDevice[]> {
  const admin = createAdminClient()
  let query = admin
    .from('tv_devices')
    .select(`
      *,
      users (
        email,
        full_name
      )
    `)
    .order('created_at', { ascending: false })

  if (search) {
    query = query.or(`device_id.ilike.%${search}%,pairing_code.ilike.%${search}%`)
  }

  const { data, error } = await query
  if (!error && data) {
    return data
  }
  return []
}

export default async function TVDevicesPage({
  searchParams,
}: {
  searchParams: Promise<{ search?: string }>
}) {
  const params = await searchParams
  const search = params.search ?? ''
  const devices = await fetchDevices(search)

  const pairedCount = devices.filter((d) => d.paired_at !== null).length
  const pendingCount = devices.length - pairedCount

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2">
        <div>
          <h1 className="text-xl font-bold text-white tracking-tight">TV Device Hub</h1>
          <p className="text-xs text-zinc-400 mt-0.5">
            Manage television screens, 6-digit activation PINs, and active user pairings
          </p>
        </div>
      </div>

      {/* Quick Status Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="p-4 rounded-xl bg-[#131313] flex items-center justify-between">
          <div>
            <p className="text-[10px] font-semibold uppercase text-zinc-400">Total Registered TVs</p>
            <p className="text-xl font-bold font-mono text-white mt-1">{devices.length}</p>
          </div>
          <div className="w-8 h-8 rounded-lg bg-[#1c1c1c] text-zinc-300 flex items-center justify-center">
            <Tv size={16} />
          </div>
        </div>

        <div className="p-4 rounded-xl bg-[#131313] flex items-center justify-between">
          <div>
            <p className="text-[10px] font-semibold uppercase text-zinc-400">Active Paired Screens</p>
            <p className="text-xl font-bold font-mono text-emerald-400 mt-1">{pairedCount}</p>
          </div>
          <div className="w-8 h-8 rounded-lg bg-[#16271c] text-emerald-400 flex items-center justify-center">
            <CheckCircle2 size={16} />
          </div>
        </div>

        <div className="p-4 rounded-xl bg-[#131313] flex items-center justify-between">
          <div>
            <p className="text-[10px] font-semibold uppercase text-zinc-400">Awaiting Pairing</p>
            <p className="text-xl font-bold font-mono text-amber-400 mt-1">{pendingCount}</p>
          </div>
          <div className="w-8 h-8 rounded-lg bg-[#261f12] text-amber-400 flex items-center justify-center">
            <Clock size={16} />
          </div>
        </div>
      </div>

      {/* Devices Table */}
      <TVDevicesTable devices={devices} initialSearch={search} />
    </div>
  )
}
