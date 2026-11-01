'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useEffect, useState } from 'react'
import {
  LayoutDashboard,
  Users,
  CreditCard,
  Tablet,
  Bell,
  BarChart3,
  LogOut,
  PanelLeftClose,
  PanelLeftOpen,
  Search,
  Menu,
  X,
  Radio,
} from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import TopLoader from 'nextjs-toploader'
import { Logo } from '@/components/ui/logo'

const navigation = [
  { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { name: 'Users', href: '/dashboard/users', icon: Users },
  { name: 'Pricing', href: '/dashboard/pricing', icon: CreditCard },
  { name: 'TV Devices', href: '/dashboard/tv-devices', icon: Tablet },
  { name: 'Notifications', href: '/dashboard/notifications', icon: Bell },
  { name: 'Analytics', href: '/dashboard/analytics', icon: BarChart3 },
]

export default function Layout({ children }: { children: React.ReactNode }) {
  const [collapsed, setCollapsed] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const pathname = usePathname()
  const supabase = createClient()

  // Load sidebar preference from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('zuno_sidebar_collapsed')
    if (saved !== null) {
      setCollapsed(saved === 'true')
    }
  }, [])

  const toggleCollapsed = () => {
    const next = !collapsed
    setCollapsed(next)
    localStorage.setItem('zuno_sidebar_collapsed', String(next))
  }

  // Close mobile sidebar on route change
  useEffect(() => {
    setMobileOpen(false)
  }, [pathname])

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    window.location.href = '/login'
  }

  const currentPage = navigation.find(
    (item) => pathname === item.href || (item.href !== '/dashboard' && pathname.startsWith(item.href))
  )?.name || 'Dashboard'

  return (
    <div className="flex h-screen bg-[#080808] overflow-hidden text-[#f4f4f5]">
      {/* Top Loading Bar */}
      <TopLoader color="#f08327" height={2} showSpinner={false} />

      {/* Mobile Backdrop */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/70 backdrop-blur-sm lg:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 flex flex-col bg-[#0c0c0c] transition-all duration-200 ease-in-out lg:static ${
          collapsed ? 'w-[4.5rem]' : 'w-64'
        } ${mobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}
      >
        {/* Brand Header */}
        <div className="flex items-center justify-between h-14 px-4 bg-[#0c0c0c]">
          <Link href="/dashboard" className="flex items-center gap-2.5 overflow-hidden">
            <Logo height={28} collapsed={collapsed} />
          </Link>
          <button
            onClick={() => setMobileOpen(false)}
            className="p-1 rounded-md text-zinc-400 hover:text-white hover:bg-[#1a1a1a] transition-colors lg:hidden"
            aria-label="Close sidebar"
          >
            <X size={18} />
          </button>
        </div>

        {/* Navigation Section */}
        <div className="px-3 pt-3 pb-2">
          {!collapsed && (
            <p className="px-2 text-[10px] font-semibold text-zinc-400 uppercase tracking-wider mb-2">
              Platform
            </p>
          )}
          <nav className="space-y-1">
            {navigation.map((item) => {
              const Icon = item.icon
              const isActive =
                item.href === '/dashboard'
                  ? pathname === '/dashboard'
                  : pathname === item.href || pathname.startsWith(item.href + '/')

              return (
                <Link
                  key={item.name}
                  href={item.href}
                  title={collapsed ? item.name : undefined}
                  className={`group relative flex items-center gap-3 px-3 py-2 rounded-lg text-xs font-medium transition-colors select-none ${
                    isActive
                      ? 'bg-[#181818] text-white font-semibold'
                      : 'text-zinc-400 hover:text-zinc-200 hover:bg-[#141414]'
                  } ${collapsed ? 'justify-center' : ''}`}
                >
                  {/* Subtle active indicator mark */}
                  {isActive && !collapsed && (
                    <span className="absolute left-1.5 w-1 h-3.5 bg-[#f08327] rounded-full" />
                  )}
                  <Icon
                    size={17}
                    className={`shrink-0 transition-colors ${
                      isActive ? 'text-[#f08327]' : 'text-zinc-400 group-hover:text-zinc-300'
                    }`}
                  />
                  {!collapsed && <span className="truncate">{item.name}</span>}
                </Link>
              )
            })}
          </nav>
        </div>

        {/* Sidebar Footer / User Profile */}
        <div className="mt-auto p-3 bg-[#0c0c0c]">
          <div
            className={`flex items-center gap-3 p-2 rounded-lg bg-[#141414] ${
              collapsed ? 'justify-center' : ''
            }`}
          >
            <div className="w-7 h-7 rounded-md bg-[#222222] text-[#f08327] font-bold text-xs flex items-center justify-center shrink-0">
              ZA
            </div>
            {!collapsed && (
              <div className="flex-1 min-w-0">
                <p className="text-xs font-semibold text-zinc-200 truncate">Zuno Admin</p>
                <p className="text-[10px] text-zinc-400 truncate">admin@zuno.app</p>
              </div>
            )}
            <button
              onClick={handleSignOut}
              className={`p-1.5 rounded-md text-zinc-400 hover:text-rose-400 hover:bg-[#1f1f1f] transition-colors shrink-0 ${
                collapsed ? 'hidden' : ''
              }`}
              title="Sign out"
            >
              <LogOut size={15} />
            </button>
          </div>
        </div>
      </aside>

      {/* Main Container */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden bg-[#080808]">
        {/* Top Header Bar */}
        <header className="h-14 bg-[#0c0c0c] px-4 lg:px-8 flex items-center justify-between shrink-0 select-none">
          {/* Left section: mobile toggle + collapse toggle + breadcrumb */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => setMobileOpen(true)}
              className="p-1.5 rounded-md text-zinc-400 hover:text-white hover:bg-[#1a1a1a] transition-colors lg:hidden"
              aria-label="Open mobile menu"
            >
              <Menu size={18} />
            </button>
            <button
              onClick={toggleCollapsed}
              className="hidden lg:flex p-1.5 rounded-md text-zinc-400 hover:text-white hover:bg-[#1a1a1a] transition-colors"
              aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            >
              {collapsed ? <PanelLeftOpen size={17} /> : <PanelLeftClose size={17} />}
            </button>

            {/* Breadcrumb */}
            <div className="flex items-center gap-2 text-xs">
              <span className="text-zinc-400 hidden sm:inline">Admin</span>
              <span className="text-zinc-500 hidden sm:inline">/</span>
              <span className="font-semibold text-white text-sm">{currentPage}</span>
            </div>
          </div>

          {/* Right section: System Status indicator & Search */}
          <div className="flex items-center gap-4">
            {/* Live Operational Status */}
            <div className="hidden sm:flex items-center gap-2 px-2.5 py-1 rounded-full bg-[#141414] text-[11px] text-zinc-300">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0" />
              <span className="font-medium">Live Systems Normal</span>
            </div>

            {/* Quick Search Shortcut */}
            <Link
              href="/dashboard/users"
              className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[#141414] hover:bg-[#1a1a1a] text-zinc-400 hover:text-zinc-200 text-xs transition-colors"
            >
              <Search size={14} className="text-zinc-400" />
              <span className="hidden md:inline">Search platform...</span>
              <kbd className="hidden md:inline-block px-1.5 py-0.5 rounded bg-[#202020] text-[10px] text-zinc-400 font-mono">
                ⌘K
              </kbd>
            </Link>
          </div>
        </header>

        {/* Page Viewport */}
        <main className="flex-1 overflow-y-auto px-4 lg:px-8 py-6">
          <div className="max-w-7xl mx-auto">{children}</div>
        </main>
      </div>
    </div>
  )
}
