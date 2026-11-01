import Link from 'next/link'
import { createAdminClient } from '@/lib/supabase/admin'
import {
  Users,
  CreditCard,
  Tablet,
  Bell,
  ArrowUpRight,
  Tv,
  CheckCircle2,
  Clock,
  Sparkles,
  ChevronRight,
  Activity,
  Layers,
} from 'lucide-react'
import { Card, CardTitle, CardDescription } from '@/components/ui/card'

export default async function DashboardPage() {
  const admin = createAdminClient()

  const [usersResult, subsResult, devicesResult, recentDevicesResult, recentUsersResult] =
    await Promise.all([
      admin.from('users').select('id', { count: 'exact' }),
      admin.from('subscriptions').select('id, plan, amount_paid, status').eq('status', 'active'),
      admin.from('tv_devices').select('id', { count: 'exact' }).not('paired_at', 'is', null),
      admin
        .from('tv_devices')
        .select(`
          id,
          device_id,
          pairing_code,
          paired_at,
          last_seen,
          users (
            email,
            full_name
          )
        `)
        .order('created_at', { ascending: false })
        .limit(4),
      admin
        .from('users')
        .select(`
          id,
          email,
          full_name,
          created_at,
          subscriptions (
            plan,
            status
          )
        `)
        .order('created_at', { ascending: false })
        .limit(4),
    ])

  const totalUsers = usersResult.count ?? 0
  const activeSubs = subsResult.count ?? 0
  const pairedDevices = devicesResult.count ?? 0

  const activeSubscriptions = subsResult.data || []
  const totalRevenue = activeSubscriptions.reduce((sum, sub) => {
    return sum + (sub.amount_paid ? sub.amount_paid / 100 : 0)
  }, 0)

  const monthlySubs = activeSubscriptions.filter((s) => s.plan === 'monthly').length
  const yearlySubs = activeSubscriptions.filter((s) => s.plan === 'yearly').length
  const monthlyPercent = activeSubs > 0 ? Math.round((monthlySubs / activeSubs) * 100) : 0
  const yearlyPercent = activeSubs > 0 ? 100 - monthlyPercent : 0

  const recentDevices = recentDevicesResult.data || []
  const recentUsers = (recentUsersResult.data || []).map((u: any) => ({
    ...u,
    subscription: u.subscriptions?.[0] || null,
  }))

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2">
        <div>
          <h1 className="text-xl font-bold text-white tracking-tight">Platform Overview</h1>
          <p className="text-xs text-zinc-400 mt-0.5">
            Real-time subscriber metrics, streaming activity, and TV device pairings
          </p>
        </div>
        <div className="flex items-center gap-2.5">
          <Link
            href="/dashboard/notifications"
            className="inline-flex items-center gap-2 px-3.5 py-2 rounded-lg bg-[#f08327] hover:bg-[#d9721c] text-white text-xs font-semibold transition-all shadow-sm"
          >
            <Bell size={14} /> Send Alert
          </Link>
          <Link
            href="/dashboard/tv-devices"
            className="inline-flex items-center gap-2 px-3.5 py-2 rounded-lg bg-[#181818] hover:bg-[#222222] text-zinc-200 text-xs font-medium transition-all"
          >
            <Tv size={14} /> TV Hub
          </Link>
        </div>
      </div>

      {/* Primary KPI Metrics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
        {/* Total Users */}
        <Link
          href="/dashboard/users"
          className="group block p-4 rounded-xl bg-[#131313] hover:bg-[#181818] transition-colors"
        >
          <div className="flex items-center justify-between mb-3">
            <span className="text-[11px] font-semibold text-zinc-400 uppercase tracking-wider">
              Total Accounts
            </span>
            <div className="w-7 h-7 rounded-md bg-[#1f1f1f] text-zinc-300 flex items-center justify-center">
              <Users size={14} />
            </div>
          </div>
          <div className="flex items-baseline justify-between">
            <span className="text-2xl font-bold font-mono tracking-tight text-white">
              {totalUsers.toLocaleString()}
            </span>
            <span className="text-[10px] font-semibold text-emerald-400 bg-[#16271c] px-1.5 py-0.5 rounded">
              +12% vs mo
            </span>
          </div>
          <p className="text-[11px] text-zinc-500 mt-2 flex items-center gap-1 group-hover:text-zinc-400 transition-colors">
            Manage user accounts <ChevronRight size={12} />
          </p>
        </Link>

        {/* Active Subscriptions */}
        <Link
          href="/dashboard/users"
          className="group block p-4 rounded-xl bg-[#131313] hover:bg-[#181818] transition-colors"
        >
          <div className="flex items-center justify-between mb-3">
            <span className="text-[11px] font-semibold text-zinc-400 uppercase tracking-wider">
              Active Subscribers
            </span>
            <div className="w-7 h-7 rounded-md bg-[#1f1f1f] text-emerald-400 flex items-center justify-center">
              <CreditCard size={14} />
            </div>
          </div>
          <div className="flex items-baseline justify-between">
            <span className="text-2xl font-bold font-mono tracking-tight text-white">
              {activeSubs.toLocaleString()}
            </span>
            <span className="text-[10px] font-semibold text-emerald-400 bg-[#16271c] px-1.5 py-0.5 rounded">
              Paid plans
            </span>
          </div>
          <p className="text-[11px] text-zinc-500 mt-2 flex items-center gap-1 group-hover:text-zinc-400 transition-colors">
            View subscriber list <ChevronRight size={12} />
          </p>
        </Link>

        {/* TV Devices Paired */}
        <Link
          href="/dashboard/tv-devices"
          className="group block p-4 rounded-xl bg-[#131313] hover:bg-[#181818] transition-colors"
        >
          <div className="flex items-center justify-between mb-3">
            <span className="text-[11px] font-semibold text-zinc-400 uppercase tracking-wider">
              Paired TV Devices
            </span>
            <div className="w-7 h-7 rounded-md bg-[#1f1f1f] text-sky-400 flex items-center justify-center">
              <Tablet size={14} />
            </div>
          </div>
          <div className="flex items-baseline justify-between">
            <span className="text-2xl font-bold font-mono tracking-tight text-white">
              {pairedDevices.toLocaleString()}
            </span>
            <span className="text-[10px] font-semibold text-sky-400 bg-[#132338] px-1.5 py-0.5 rounded">
              Active pairs
            </span>
          </div>
          <p className="text-[11px] text-zinc-500 mt-2 flex items-center gap-1 group-hover:text-zinc-400 transition-colors">
            TV pairing codes <ChevronRight size={12} />
          </p>
        </Link>

        {/* Total Platform Revenue */}
        <Link
          href="/dashboard/pricing"
          className="group block p-4 rounded-xl bg-[#131313] hover:bg-[#181818] transition-colors"
        >
          <div className="flex items-center justify-between mb-3">
            <span className="text-[11px] font-semibold text-zinc-400 uppercase tracking-wider">
              Total Revenue
            </span>
            <div className="w-7 h-7 rounded-md bg-[#1f1f1f] text-[#f08327] flex items-center justify-center">
              <span className="font-bold text-xs">₹</span>
            </div>
          </div>
          <div className="flex items-baseline justify-between">
            <span className="text-2xl font-bold font-mono tracking-tight text-white">
              ₹{totalRevenue.toLocaleString()}
            </span>
            <span className="text-[10px] font-semibold text-[#f08327] bg-[#291910] px-1.5 py-0.5 rounded">
              Realized
            </span>
          </div>
          <p className="text-[11px] text-zinc-500 mt-2 flex items-center gap-1 group-hover:text-zinc-400 transition-colors">
            Pricing breakdown <ChevronRight size={12} />
          </p>
        </Link>
      </div>

      {/* Middle Operations Grid: TV Pairing Queue + Plan Adoption */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Recent Paired TV Devices (2 Cols) */}
        <div className="lg:col-span-2 p-5 rounded-xl bg-[#131313]">
          <div className="flex items-center justify-between pb-3 mb-3 border-b border-[#1c1c1c]">
            <div className="flex items-center gap-2">
              <Tv size={16} className="text-[#f08327]" />
              <h2 className="text-sm font-bold text-white tracking-tight">Recent TV Pairings</h2>
            </div>
            <Link
              href="/dashboard/tv-devices"
              className="text-xs text-zinc-400 hover:text-white flex items-center gap-1 transition-colors"
            >
              View all devices <ArrowUpRight size={13} />
            </Link>
          </div>

          <div className="space-y-2">
            {recentDevices.map((device: any) => {
              const isPaired = device.paired_at !== null
              return (
                <div
                  key={device.id}
                  className="flex items-center justify-between p-3 rounded-lg bg-[#181818] hover:bg-[#1d1d1d] transition-colors"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-8 h-8 rounded bg-[#202020] text-zinc-300 flex items-center justify-center shrink-0">
                      <Tv size={15} />
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-mono font-bold text-white">
                          {device.pairing_code}
                        </span>
                        <span
                          className={`inline-block w-1.5 h-1.5 rounded-full ${
                            isPaired ? 'bg-emerald-500' : 'bg-amber-500'
                          }`}
                        />
                      </div>
                      <p className="text-[11px] text-zinc-400 truncate">
                        {device.users?.email || 'Pending association with user'}
                      </p>
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    <span
                      className={`text-[10px] font-semibold px-2 py-0.5 rounded ${
                        isPaired
                          ? 'bg-[#16271c] text-emerald-400'
                          : 'bg-[#261f12] text-amber-400'
                      }`}
                    >
                      {isPaired ? 'Paired' : 'Pending'}
                    </span>
                    <p className="text-[10px] text-zinc-500 mt-1 font-mono">
                      {device.paired_at
                        ? new Date(device.paired_at).toLocaleDateString()
                        : 'Unclaimed'}
                    </p>
                  </div>
                </div>
              )
            })}

            {recentDevices.length === 0 && (
              <div className="py-8 text-center text-xs text-zinc-500">
                No TV pairing devices registered yet
              </div>
            )}
          </div>
        </div>

        {/* Subscription Plan Ratio (1 Col) */}
        <div className="p-5 rounded-xl bg-[#131313] flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 mb-4 border-b border-[#1c1c1c]">
              <div className="flex items-center gap-2">
                <Layers size={16} className="text-[#f08327]" />
                <h2 className="text-sm font-bold text-white tracking-tight">Plan Distribution</h2>
              </div>
              <Link
                href="/dashboard/pricing"
                className="text-xs text-zinc-400 hover:text-white transition-colors"
              >
                Plans
              </Link>
            </div>

            <div className="space-y-4">
              {/* Monthly Plan */}
              <div>
                <div className="flex justify-between text-xs mb-1.5">
                  <span className="text-zinc-300 font-medium">Monthly Plan (₹50)</span>
                  <span className="text-white font-mono font-bold">{monthlySubs} users</span>
                </div>
                <div className="h-2 w-full rounded-full bg-[#202020] overflow-hidden">
                  <div
                    className="h-full bg-blue-500 rounded-full transition-all duration-500"
                    style={{ width: `${monthlyPercent}%` }}
                  />
                </div>
                <p className="text-[10px] text-zinc-500 mt-1">{monthlyPercent}% of active subscribers</p>
              </div>

              {/* Yearly Plan */}
              <div>
                <div className="flex justify-between text-xs mb-1.5">
                  <span className="text-zinc-300 font-medium">Yearly Plan (₹500)</span>
                  <span className="text-white font-mono font-bold">{yearlySubs} users</span>
                </div>
                <div className="h-2 w-full rounded-full bg-[#202020] overflow-hidden">
                  <div
                    className="h-full bg-purple-500 rounded-full transition-all duration-500"
                    style={{ width: `${yearlyPercent}%` }}
                  />
                </div>
                <p className="text-[10px] text-zinc-500 mt-1">{yearlyPercent}% of active subscribers</p>
              </div>
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-[#1c1c1c] bg-[#171717] -mx-5 -mb-5 p-4 rounded-b-xl">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[10px] text-zinc-400 uppercase font-semibold">Active ARR Projection</p>
                <p className="text-base font-bold font-mono text-white mt-0.5">
                  ₹{((monthlySubs * 50 * 12) + (yearlySubs * 500)).toLocaleString()}
                </p>
              </div>
              <Link
                href="/dashboard/analytics"
                className="text-xs font-semibold text-[#f08327] hover:underline"
              >
                Analytics →
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Row: Recent Signups */}
      <div className="p-5 rounded-xl bg-[#131313]">
        <div className="flex items-center justify-between pb-3 mb-3 border-b border-[#1c1c1c]">
          <div className="flex items-center gap-2">
            <Users size={16} className="text-[#f08327]" />
            <h2 className="text-sm font-bold text-white tracking-tight">Recent User Registrations</h2>
          </div>
          <Link
            href="/dashboard/users"
            className="text-xs text-zinc-400 hover:text-white flex items-center gap-1 transition-colors"
          >
            All users <ArrowUpRight size={13} />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
          {recentUsers.map((u: any) => {
            const plan = u.subscription?.plan
            const status = u.subscription?.status
            return (
              <div key={u.id} className="p-3 rounded-lg bg-[#181818]">
                <div className="flex items-center gap-2.5 mb-2">
                  <div className="w-7 h-7 rounded-full bg-[#242424] text-zinc-300 font-bold text-xs flex items-center justify-center shrink-0">
                    {u.full_name?.charAt(0) || u.email.charAt(0).toUpperCase()}
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs font-medium text-white truncate">{u.email}</p>
                    <p className="text-[10px] text-zinc-500 truncate">{u.full_name || 'Anonymous'}</p>
                  </div>
                </div>
                <div className="flex items-center justify-between pt-1">
                  <span
                    className={`text-[10px] font-semibold px-2 py-0.5 rounded ${
                      plan === 'yearly'
                        ? 'bg-[#251d38] text-purple-300'
                        : plan === 'monthly'
                        ? 'bg-[#162438] text-blue-300'
                        : 'bg-[#222222] text-zinc-400'
                    }`}
                  >
                    {plan ? plan.toUpperCase() : 'FREE'}
                  </span>
                  <span className="text-[10px] font-mono text-zinc-500">
                    {new Date(u.created_at).toLocaleDateString()}
                  </span>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
