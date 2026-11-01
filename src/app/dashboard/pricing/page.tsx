import { createAdminClient } from '@/lib/supabase/admin'
import { Check, CreditCard, Sparkles, TrendingUp, HelpCircle } from 'lucide-react'

interface Plan {
  id: string
  name: string
  price: number
  interval: 'month' | 'year' | null
  features: string[]
  isPopular: boolean
  subscribers: number
  revenue: number
}

const defaultPlans: Omit<Plan, 'subscribers' | 'revenue'>[] = [
  {
    id: 'monthly',
    name: 'Standard Monthly',
    price: 50,
    interval: 'month',
    features: [
      '7-day free trial on first sign up',
      'Unlimited 4K streaming on Android & iOS',
      'Television pairing via 6-digit code',
      'All Live TV news & entertainment channels',
      'Cancel anytime with instant cutoff',
    ],
    isPopular: false,
  },
  {
    id: 'yearly',
    name: 'Annual Premium Pass',
    price: 500,
    interval: 'year',
    features: [
      '7-day free trial included',
      'Save ₹100/year vs monthly renewal',
      'Simultaneous multi-device TV playback',
      'All movie premieres & live channels',
      'Priority streaming bitrate buffer',
      'Annual billing with renewal protection',
    ],
    isPopular: true,
  },
]

async function fetchPricingPlans(): Promise<Omit<Plan, 'subscribers' | 'revenue'>[]> {
  const admin = createAdminClient()
  const { data, error } = await admin
    .from('pricing_plans')
    .select('id, name, price_inr, interval, features, is_popular, is_active')
    .eq('is_active', true)
    .order('sort_order', { ascending: true })

  if (error || !data) {
    console.warn('Failed to fetch pricing_plans from Supabase, using defaults:', error)
    return defaultPlans
  }

  return data.map((p: any) => ({
    id: p.id,
    name: p.name,
    price: p.price_inr ?? 0,
    interval: p.interval === 'month' || p.interval === 'year' ? p.interval : null,
    features: Array.isArray(p.features) ? p.features : [],
    isPopular: p.is_popular ?? false,
  }))
}

async function fetchPlanStats(): Promise<Map<string, { count: number; total: number }>> {
  const admin = createAdminClient()
  const { data, error } = await admin
    .from('subscriptions')
    .select('plan, amount_paid')
    .eq('status', 'active')

  const planMap = new Map<string, { count: number; total: number }>()
  if (!error && data) {
    data.forEach((sub: any) => {
      const key = sub.plan
      if (!planMap.has(key)) {
        planMap.set(key, { count: 0, total: 0 })
      }
      const entry = planMap.get(key)!
      entry.count += 1
      entry.total += sub.amount_paid || 0
    })
  }
  return planMap
}

export default async function PricingPage() {
  const [planMap, dbPlans] = await Promise.all([
    fetchPlanStats(),
    fetchPricingPlans(),
  ])

  // Use DB plans if available, otherwise fall back to defaults
  const sourcePlans = dbPlans.length > 0 ? dbPlans : defaultPlans

  const plans: Plan[] = sourcePlans.map((p) => {
    const entry = planMap.get(p.id)
    return {
      ...p,
      subscribers: entry?.count ?? 0,
      revenue: (entry?.total ?? 0) / 100,
    }
  })

  const totalSubs = plans.reduce((acc, p) => acc + p.subscribers, 0)
  const totalRevenue = plans.reduce((acc, p) => acc + p.revenue, 0)

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2">
        <div>
          <h1 className="text-xl font-bold text-white tracking-tight">Subscription Plans & Pricing</h1>
          <p className="text-xs text-zinc-400 mt-0.5">
            Configure consumer tiers, monitor recurring revenue (MRR), and feature entitlements
          </p>
        </div>
      </div>

      {/* Plans Comparison Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {plans.map((plan) => (
          <div
            key={plan.id}
            className={`p-6 rounded-2xl bg-[#131313] flex flex-col justify-between ${
              plan.isPopular ? 'bg-[#151515]' : ''
            }`}
          >
            <div>
              {/* Card Header */}
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-base font-bold text-white tracking-tight">{plan.name}</h3>
                  <p className="text-xs text-zinc-400">
                    Billed per {plan.interval === 'year' ? 'year' : plan.interval === 'month' ? 'month' : '—'}
                  </p>
                </div>
                {plan.isPopular && (
                  <span className="text-[10px] font-bold uppercase tracking-wider bg-[#f08327] text-white px-2.5 py-1 rounded-md">
                    Best Value
                  </span>
                )}
              </div>

              {/* Price */}
              <div className="flex items-baseline gap-1.5 my-4">
                <span className="text-3xl font-black font-mono text-white tracking-tight">
                  ₹{plan.price}
                </span>
                <span className="text-xs text-zinc-400 font-medium">
                  /{plan.interval === 'year' ? 'year' : plan.interval === 'month' ? 'month' : ''}
                </span>
              </div>

              {/* Feature Checklist */}
              <div className="space-y-2.5 my-6">
                {plan.features.map((feature) => (
                  <div key={feature} className="flex items-start gap-2.5 text-xs text-zinc-300">
                    <div className="w-4 h-4 rounded bg-[#1c271e] text-emerald-400 flex items-center justify-center shrink-0 mt-0.5">
                      <Check size={11} />
                    </div>
                    <span>{feature}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Plan Metrics Bottom Bar */}
            <div className="pt-4 border-t border-[#1c1c1c] space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="text-zinc-400">Active Paid Subscribers</span>
                <span className="font-mono font-bold text-white">{plan.subscribers.toLocaleString()}</span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-zinc-400">Total Historical Revenue</span>
                <span className="font-mono font-bold text-[#f08327]">
                  ₹{plan.revenue.toLocaleString()}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Plan Economics Summary Bar */}
      <div className="p-5 rounded-xl bg-[#131313] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#1c1c1c] text-[#f08327] flex items-center justify-center shrink-0">
            <TrendingUp size={20} />
          </div>
          <div>
            <h4 className="text-xs font-bold text-white uppercase tracking-wider">
              Subscription Performance Summary
            </h4>
            <p className="text-xs text-zinc-400 mt-0.5">
              {totalSubs} total subscribers currently generate an estimated{' '}
              <span className="text-white font-mono font-semibold">
                ₹{(
                  (plans.find((p) => p.id === 'monthly')?.subscribers || 0) * 50 +
                  (plans.find((p) => p.id === 'yearly')?.subscribers || 0) * (500 / 12)
                ).toFixed(0)}
              </span>{' '}
              in normalized monthly recurring revenue (MRR).
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <div className="px-3 py-1.5 rounded-lg bg-[#181818] text-xs font-mono text-zinc-300">
            Avg ARPU: <span className="text-white font-bold">₹{totalSubs > 0 ? (totalRevenue / totalSubs).toFixed(0) : '0'}</span>
          </div>
        </div>
      </div>
    </div>
  )
}
