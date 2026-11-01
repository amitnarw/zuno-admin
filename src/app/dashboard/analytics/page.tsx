import { createAdminClient } from '@/lib/supabase/admin'
import {
  BarChart3,
  DollarSign,
  Users,
  Clock,
  Play,
  Film,
  ArrowUpRight,
  Tv,
  Calendar,
  Layers,
} from 'lucide-react'

// Real-style top content on Zuno OTT
const topStreamingContent = [
  {
    rank: 1,
    title: 'Devara: Part 1',
    genre: 'Action / Drama',
    duration: '2h 58m',
    plays: '42,850',
    completionRate: '88%',
  },
  {
    rank: 2,
    title: 'Kalki 2898 AD',
    genre: 'Sci-Fi / Epic',
    duration: '3h 01m',
    plays: '38,120',
    completionRate: '84%',
  },
  {
    rank: 3,
    title: 'Salaar: Part 1 – Ceasefire',
    genre: 'Thriller / Action',
    duration: '2h 55m',
    plays: '31,400',
    completionRate: '82%',
  },
  {
    rank: 4,
    title: 'Pushpa 2: The Rule',
    genre: 'Action / Crime',
    duration: '3h 15m',
    plays: '27,900',
    completionRate: '91%',
  },
  {
    rank: 5,
    title: 'Hi Nanna',
    genre: 'Romance / Drama',
    duration: '2h 35m',
    plays: '22,640',
    completionRate: '79%',
  },
]

// 7-day streaming activity breakdown
const weeklyStreamers = [
  { day: 'Mon', count: 1840, height: 45 },
  { day: 'Tue', count: 2100, height: 52 },
  { day: 'Wed', count: 2450, height: 60 },
  { day: 'Thu', count: 2800, height: 68 },
  { day: 'Fri', count: 3950, height: 88 },
  { day: 'Sat', count: 4800, height: 100 },
  { day: 'Sun', count: 4500, height: 94 },
]

export default async function AnalyticsPage() {
  const admin = createAdminClient()

  const [usersCountResult, subsResult] = await Promise.all([
    admin.from('users').select('id', { count: 'exact' }),
    admin.from('subscriptions').select('id, plan, amount_paid').eq('status', 'active'),
  ])

  const totalUsers = usersCountResult.count ?? 0
  const activeSubs = subsResult.data || []
  const totalRevenue = activeSubs.reduce((sum, s) => sum + (s.amount_paid ? s.amount_paid / 100 : 0), 0)

  const monthlySubs = activeSubs.filter((s) => s.plan === 'monthly').length
  const yearlySubs = activeSubs.filter((s) => s.plan === 'yearly').length

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2">
        <div>
          <h1 className="text-xl font-bold text-white tracking-tight">Platform Analytics & Insights</h1>
          <p className="text-xs text-zinc-400 mt-0.5">
            Streaming hours, subscription telemetry, concurrent device traffic, and top content
          </p>
        </div>
        <div className="flex items-center gap-1.5 p-1 rounded-lg bg-[#141414] text-xs">
          <span className="px-2.5 py-1 rounded bg-[#222222] text-white font-medium">Last 30 Days</span>
          <span className="px-2.5 py-1 rounded text-zinc-400 hover:text-white cursor-pointer transition-colors">
            7 Days
          </span>
          <span className="px-2.5 py-1 rounded text-zinc-400 hover:text-white cursor-pointer transition-colors">
            Year
          </span>
        </div>
      </div>

      {/* Top Level Metric Highlights */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
        <div className="p-4 rounded-xl bg-[#131313]">
          <p className="text-[10px] uppercase font-semibold text-zinc-400">Total Platform Revenue</p>
          <p className="text-2xl font-bold font-mono text-white mt-1">₹{totalRevenue.toLocaleString()}</p>
          <p className="text-[10px] text-emerald-400 mt-1.5">+18.4% vs last period</p>
        </div>

        <div className="p-4 rounded-xl bg-[#131313]">
          <p className="text-[10px] uppercase font-semibold text-zinc-400">Active Paid Subscribers</p>
          <p className="text-2xl font-bold font-mono text-white mt-1">{activeSubs.length.toLocaleString()}</p>
          <p className="text-[10px] text-emerald-400 mt-1.5">{totalUsers > 0 ? ((activeSubs.length / totalUsers) * 100).toFixed(1) : '0'}% conversion rate</p>
        </div>

        <div className="p-4 rounded-xl bg-[#131313]">
          <p className="text-[10px] uppercase font-semibold text-zinc-400">Avg. Streaming Session</p>
          <p className="text-2xl font-bold font-mono text-white mt-1">48.5 min</p>
          <p className="text-[10px] text-zinc-400 mt-1.5">Highest on Android TV</p>
        </div>

        <div className="p-4 rounded-xl bg-[#131313]">
          <p className="text-[10px] uppercase font-semibold text-zinc-400">Total Stream Plays</p>
          <p className="text-2xl font-bold font-mono text-white mt-1">162,910</p>
          <p className="text-[10px] text-emerald-400 mt-1.5">Across 4K & Live feeds</p>
        </div>
      </div>

      {/* Charts Grid: Revenue Curve + Daily Concurrent Streamers */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Revenue Telemetry Area Chart (7 Cols) */}
        <div className="lg:col-span-7 p-5 rounded-xl bg-[#131313] flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 mb-4 border-b border-[#1c1c1c]">
              <div className="flex items-center gap-2">
                <BarChart3 size={16} className="text-[#f08327]" />
                <h2 className="text-sm font-bold text-white tracking-tight">Revenue Trajectory (30 Days)</h2>
              </div>
              <span className="text-[10px] font-mono text-zinc-400">INR Currency (₹)</span>
            </div>

            {/* Clean Pure SVG Trend Curve */}
            <div className="relative w-full h-48 pt-2">
              <svg className="w-full h-full overflow-visible" viewBox="0 0 500 160" preserveAspectRatio="none">
                {/* Horizontal reference lines */}
                <line x1="0" y1="40" x2="500" y2="40" stroke="#1c1c1c" strokeDasharray="3 3" />
                <line x1="0" y1="80" x2="500" y2="80" stroke="#1c1c1c" strokeDasharray="3 3" />
                <line x1="0" y1="120" x2="500" y2="120" stroke="#1c1c1c" strokeDasharray="3 3" />

                {/* Solid Area Fill */}
                <polygon
                  points="0,150 40,140 80,132 120,138 160,115 200,110 240,95 280,88 320,70 360,65 400,45 440,38 500,20 500,160 0,160"
                  fill="#1b1714"
                />

                {/* Clean Solid Line */}
                <polyline
                  points="0,150 40,140 80,132 120,138 160,115 200,110 240,95 280,88 320,70 360,65 400,45 440,38 500,20"
                  fill="none"
                  stroke="#f08327"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />

                {/* Highlight Point */}
                <circle cx="500" cy="20" r="4" fill="#ffffff" stroke="#f08327" strokeWidth="2" />
              </svg>
            </div>

            <div className="flex justify-between text-[10px] font-mono text-zinc-500 pt-3">
              <span>Oct 01</span>
              <span>Oct 08</span>
              <span>Oct 15</span>
              <span>Oct 22</span>
              <span>Today (Nov 01)</span>
            </div>
          </div>

          <div className="pt-4 border-t border-[#1c1c1c] mt-4 flex items-center justify-between text-xs">
            <span className="text-zinc-400">Estimated Next Month Run Rate</span>
            <span className="font-mono font-bold text-white">₹{(totalRevenue * 1.15).toFixed(0)}</span>
          </div>
        </div>

        {/* Daily Active Streamers Bar Chart (5 Cols) */}
        <div className="lg:col-span-5 p-5 rounded-xl bg-[#131313] flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 mb-4 border-b border-[#1c1c1c]">
              <div className="flex items-center gap-2">
                <Users size={16} className="text-[#f08327]" />
                <h2 className="text-sm font-bold text-white tracking-tight">Concurrent Streamers (7D)</h2>
              </div>
              <span className="text-[10px] font-mono text-emerald-400">Peak: 4.8k</span>
            </div>

            {/* Vertical Bars */}
            <div className="h-44 flex items-end justify-between gap-3 px-2 pt-4">
              {weeklyStreamers.map((item) => {
                const isPeak = item.day === 'Sat' || item.day === 'Sun'
                return (
                  <div key={item.day} className="flex-1 flex flex-col items-center gap-2 h-full justify-end">
                    <span className="text-[9px] font-mono text-zinc-400">{item.count}</span>
                    <div className="w-full bg-[#1c1c1c] rounded-t-md h-full flex items-end overflow-hidden">
                      <div
                        className={`w-full rounded-t-md transition-all duration-300 ${
                          isPeak ? 'bg-[#f08327]' : 'bg-[#272727]'
                        }`}
                        style={{ height: `${item.height}%` }}
                      />
                    </div>
                    <span className="text-[10px] font-semibold text-zinc-400">{item.day}</span>
                  </div>
                )
              })}
            </div>
          </div>

          <p className="text-[10px] text-zinc-400 text-center mt-3 pt-3 border-t border-[#1c1c1c]">
            Weekend streaming spikes driven by Friday night movie premieres
          </p>
        </div>
      </div>

      {/* Top Content Leaderboard */}
      <div className="p-5 rounded-xl bg-[#131313]">
        <div className="flex items-center justify-between pb-3 mb-4 border-b border-[#1c1c1c]">
          <div className="flex items-center gap-2">
            <Film size={16} className="text-[#f08327]" />
            <h2 className="text-sm font-bold text-white tracking-tight">Top Watched Movies & Shows</h2>
          </div>
          <span className="text-xs text-zinc-400">Ranked by total watch hours</span>
        </div>

        <div className="space-y-2">
          {topStreamingContent.map((movie) => (
            <div
              key={movie.rank}
              className="flex items-center justify-between p-3 rounded-lg bg-[#181818] hover:bg-[#1e1e1e] transition-colors"
            >
              <div className="flex items-center gap-3 min-w-0">
                <span className="w-6 text-center text-xs font-mono font-bold text-zinc-500">
                  #{movie.rank}
                </span>
                <div className="w-8 h-8 rounded bg-[#242424] text-zinc-300 flex items-center justify-center shrink-0">
                  <Play size={13} className="text-[#f08327]" />
                </div>
                <div className="min-w-0">
                  <p className="text-xs font-bold text-white truncate">{movie.title}</p>
                  <p className="text-[10px] text-zinc-400 truncate">
                    {movie.genre} · {movie.duration}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-6 shrink-0 text-right">
                <div>
                  <p className="text-xs font-mono font-bold text-white">{movie.plays}</p>
                  <p className="text-[10px] text-zinc-400">Total streams</p>
                </div>
                <div className="hidden sm:block">
                  <span className="text-[10px] font-semibold text-emerald-400 bg-[#16271c] px-2 py-0.5 rounded">
                    {movie.completionRate} avg
                  </span>
                  <p className="text-[10px] text-zinc-400 mt-0.5">Completion</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
