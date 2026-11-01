'use client'

import { useState, useMemo } from 'react'
import {
  Search,
  X,
  User,
  Shield,
  CreditCard,
  Calendar,
  Copy,
  Check,
  MoreVertical,
  Ban,
  CheckCircle2,
  Tv,
  ArrowUpRight,
} from 'lucide-react'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { ConfirmationModal } from '@/components/ui/confirmation-modal'
import { Button } from '@/components/ui/button'

export interface UserRow {
  id: string
  email: string
  full_name: string | null
  avatar_url: string | null
  provider?: string
  created_at?: string
  subscription?: {
    id: string
    plan: string
    status: string
    expires_at: string | null
  } | null
}

interface UsersTableProps {
  users: UserRow[]
  initialSearch?: string
}

export function UsersTable({ users, initialSearch = '' }: UsersTableProps) {
  const [searchTerm, setSearchTerm] = useState(initialSearch)
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'trial' | 'banned'>('all')
  const [planFilter, setPlanFilter] = useState<string>('all')

  // Selected user for Slide-Over Drawer
  const [selectedUser, setSelectedUser] = useState<UserRow | null>(null)

  // Ban confirmation modal state
  const [banModalOpen, setBanModalOpen] = useState(false)
  const [banTarget, setBanTarget] = useState<{ id: string; isBanned: boolean } | null>(null)
  const [banLoading, setBanLoading] = useState(false)

  // Local state for optimistic updates
  const [localUsers, setLocalUsers] = useState<UserRow[]>(users)
  const [copiedId, setCopiedId] = useState<string | null>(null)

  const handleCopyId = (id: string) => {
    navigator.clipboard.writeText(id)
    setCopiedId(id)
    setTimeout(() => setCopiedId(null), 2000)
  }

  // Filter logic
  const filteredUsers = useMemo(() => {
    return localUsers.filter((u) => {
      // Search matches
      const matchesSearch =
        !searchTerm ||
        u.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (u.full_name && u.full_name.toLowerCase().includes(searchTerm.toLowerCase())) ||
        u.id.toLowerCase().includes(searchTerm.toLowerCase())

      if (!matchesSearch) return false

      // Status filter
      const subStatus = u.subscription?.status || 'none'
      if (statusFilter === 'active' && subStatus !== 'active') return false
      if (statusFilter === 'trial' && subStatus !== 'trial') return false
      if (statusFilter === 'banned' && subStatus !== 'banned') return false

      // Plan filter
      if (planFilter !== 'all') {
        const userPlan = u.subscription?.plan || 'none'
        if (userPlan !== planFilter) return false
      }

      return true
    })
  }, [localUsers, searchTerm, statusFilter, planFilter])

  // Counts for tabs
  const counts = useMemo(() => {
    return {
      all: localUsers.length,
      active: localUsers.filter((u) => u.subscription?.status === 'active').length,
      trial: localUsers.filter((u) => u.subscription?.status === 'trial').length,
      banned: localUsers.filter((u) => u.subscription?.status === 'banned').length,
    }
  }, [localUsers])

  const openBanDialog = (user: UserRow) => {
    const isBanned = user.subscription?.status === 'banned'
    setBanTarget({ id: user.id, isBanned })
    setBanModalOpen(true)
  }

  const handleConfirmBan = async () => {
    if (!banTarget) return
    setBanLoading(true)

    try {
      const willBeBanned = !banTarget.isBanned
      const res = await fetch(
        `/api/auth/ban-user?id=${banTarget.id}&ban=${willBeBanned}`,
        { method: 'POST' }
      )

      if (res.ok) {
        // Optimistic update
        setLocalUsers((prev) =>
          prev.map((u) => {
            if (u.id === banTarget.id) {
              return {
                ...u,
                subscription: u.subscription
                  ? { ...u.subscription, status: willBeBanned ? 'banned' : 'active' }
                  : { id: 'manual', plan: 'none', status: willBeBanned ? 'banned' : 'active', expires_at: null },
              }
            }
            return u
          })
        )
        if (selectedUser?.id === banTarget.id) {
          setSelectedUser((prev) =>
            prev
              ? {
                  ...prev,
                  subscription: prev.subscription
                    ? { ...prev.subscription, status: willBeBanned ? 'banned' : 'active' }
                    : null,
                }
              : null
          )
        }
        setBanModalOpen(false)
      } else {
        const err = await res.json()
        alert(err.error || 'Failed to update user status')
      }
    } catch {
      alert('Network error updating user status')
    } finally {
      setBanLoading(false)
    }
  }

  return (
    <div className="space-y-4">
      {/* Control Bar: Search + Filter Tabs */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 p-3 rounded-xl bg-[#131313]">
        {/* Search Input */}
        <div className="relative flex-1 max-w-md">
          <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search by email, name, or ID..."
            className="w-full pl-9 pr-8 py-2 rounded-lg bg-[#181818] text-xs text-zinc-200 placeholder-zinc-500 focus:bg-[#1e1e1e] focus:outline-none focus:ring-1 focus:ring-[#f08327] transition-all"
          />
          {searchTerm && (
            <button
              onClick={() => setSearchTerm('')}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-300"
            >
              <X size={14} />
            </button>
          )}
        </div>

        {/* Filter Tabs */}
        <div className="flex items-center gap-1 overflow-x-auto pb-1 md:pb-0">
          <button
            onClick={() => setStatusFilter('all')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors whitespace-nowrap ${
              statusFilter === 'all'
                ? 'bg-[#222222] text-white font-semibold'
                : 'text-zinc-400 hover:text-zinc-200 hover:bg-[#181818]'
            }`}
          >
            All <span className="ml-1 text-[10px] text-zinc-500">({counts.all})</span>
          </button>
          <button
            onClick={() => setStatusFilter('active')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors whitespace-nowrap ${
              statusFilter === 'active'
                ? 'bg-[#18261e] text-emerald-400 font-semibold'
                : 'text-zinc-400 hover:text-zinc-200 hover:bg-[#181818]'
            }`}
          >
            Active <span className="ml-1 text-[10px] text-zinc-500">({counts.active})</span>
          </button>
          <button
            onClick={() => setStatusFilter('trial')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors whitespace-nowrap ${
              statusFilter === 'trial'
                ? 'bg-[#261f12] text-amber-400 font-semibold'
                : 'text-zinc-400 hover:text-zinc-200 hover:bg-[#181818]'
            }`}
          >
            Trial <span className="ml-1 text-[10px] text-zinc-500">({counts.trial})</span>
          </button>
          <button
            onClick={() => setStatusFilter('banned')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors whitespace-nowrap ${
              statusFilter === 'banned'
                ? 'bg-[#2b1717] text-rose-400 font-semibold'
                : 'text-zinc-400 hover:text-zinc-200 hover:bg-[#181818]'
            }`}
          >
            Banned <span className="ml-1 text-[10px] text-zinc-500">({counts.banned})</span>
          </button>
        </div>
      </div>

      {/* Users Table Container */}
      <div className="rounded-xl bg-[#131313] overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="border-none bg-[#0f0f0f]">
              <TableHead className="py-3 px-4 text-xs font-semibold uppercase text-zinc-400">User</TableHead>
              <TableHead className="py-3 px-4 text-xs font-semibold uppercase text-zinc-400">Subscription</TableHead>
              <TableHead className="py-3 px-4 text-xs font-semibold uppercase text-zinc-400">Status</TableHead>
              <TableHead className="py-3 px-4 text-xs font-semibold uppercase text-zinc-400">Expires</TableHead>
              <TableHead className="py-3 px-4 text-xs font-semibold uppercase text-zinc-400 text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredUsers.map((user) => {
              const sub = user.subscription
              const isBanned = sub?.status === 'banned'
              const isActive = sub?.status === 'active' || sub?.status === 'trial'

              return (
                <TableRow
                  key={user.id}
                  onClick={() => setSelectedUser(user)}
                  className="cursor-pointer hover:bg-[#181818] transition-colors"
                >
                  {/* User Email & Avatar */}
                  <TableCell className="py-3.5 px-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-[#202020] text-zinc-300 font-bold text-xs flex items-center justify-center shrink-0">
                        {user.full_name?.charAt(0) || user.email.charAt(0).toUpperCase()}
                      </div>
                      <div className="min-w-0">
                        <p className="text-xs font-semibold text-white truncate">{user.email}</p>
                        <p className="text-[10px] text-zinc-400 truncate">
                          {user.full_name || 'No display name'}
                        </p>
                      </div>
                    </div>
                  </TableCell>

                  {/* Plan */}
                  <TableCell className="py-3.5 px-4">
                    <span
                      className={`inline-block px-2.5 py-0.5 rounded text-[11px] font-medium ${
                        sub?.plan === 'yearly'
                          ? 'bg-[#231b34] text-purple-300'
                          : sub?.plan === 'monthly'
                          ? 'bg-[#152336] text-blue-300'
                          : 'bg-[#1e1e1e] text-zinc-400'
                      }`}
                    >
                      {sub?.plan ? sub.plan.toUpperCase() : 'FREE'}
                    </span>
                  </TableCell>

                  {/* Status */}
                  <TableCell className="py-3.5 px-4">
                    <span
                      className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded text-[11px] font-medium ${
                        isBanned
                          ? 'bg-[#2b1717] text-rose-400'
                          : isActive
                          ? 'bg-[#15271b] text-emerald-400'
                          : 'bg-[#261f12] text-amber-400'
                      }`}
                    >
                      <span
                        className={`w-1.5 h-1.5 rounded-full ${
                          isBanned ? 'bg-rose-500' : isActive ? 'bg-emerald-500' : 'bg-amber-500'
                        }`}
                      />
                      {sub?.status || 'Active'}
                    </span>
                  </TableCell>

                  {/* Expiration */}
                  <TableCell className="py-3.5 px-4 text-xs font-mono text-zinc-400">
                    {sub?.expires_at ? new Date(sub.expires_at).toLocaleDateString() : ','}
                  </TableCell>

                  {/* Actions */}
                  <TableCell
                    className="py-3.5 px-4 text-right"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => setSelectedUser(user)}
                        className="px-2.5 py-1 rounded-md bg-[#1f1f1f] hover:bg-[#282828] text-xs text-zinc-300 transition-colors"
                      >
                        Inspect
                      </button>
                      <button
                        onClick={() => openBanDialog(user)}
                        className={`px-2.5 py-1 rounded-md text-xs font-medium transition-colors ${
                          isBanned
                            ? 'bg-[#16271c] text-emerald-400 hover:bg-[#1e3627]'
                            : 'bg-[#2b1717] text-rose-400 hover:bg-[#3d1e1e]'
                        }`}
                      >
                        {isBanned ? 'Unban' : 'Ban'}
                      </button>
                    </div>
                  </TableCell>
                </TableRow>
              )
            })}

            {filteredUsers.length === 0 && (
              <TableRow>
                <TableCell colSpan={5} className="py-12 text-center text-xs text-zinc-500">
                  No users found matching your search and filter criteria
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* Slide-Over User Detail Drawer (In-page, No 404!) */}
      {selectedUser && (
        <div className="fixed inset-0 z-50 overflow-hidden">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/70 backdrop-blur-sm transition-opacity"
            onClick={() => setSelectedUser(null)}
          />

          {/* Drawer Panel */}
          <div className="fixed inset-y-0 right-0 max-w-md w-full bg-[#121212] p-6 shadow-2xl flex flex-col justify-between overflow-y-auto">
            <div>
              {/* Drawer Header */}
              <div className="flex items-center justify-between pb-4 border-b border-[#1f1f1f]">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-[#202020] text-[#f08327] font-bold text-xs flex items-center justify-center">
                    {selectedUser.full_name?.charAt(0) || selectedUser.email.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-white tracking-tight">User Account</h3>
                    <p className="text-[11px] text-zinc-400">Inspect credentials & subscription</p>
                  </div>
                </div>
                <button
                  onClick={() => setSelectedUser(null)}
                  className="p-1 rounded-md text-zinc-400 hover:text-white hover:bg-[#202020] transition-colors"
                >
                  <X size={16} />
                </button>
              </div>

              {/* Account Details */}
              <div className="mt-5 space-y-4">
                {/* ID with Copy */}
                <div className="p-3 rounded-lg bg-[#181818]">
                  <p className="text-[10px] uppercase font-semibold text-zinc-500 mb-1">Account UUID</p>
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-mono text-zinc-300 truncate">{selectedUser.id}</span>
                    <button
                      onClick={() => handleCopyId(selectedUser.id)}
                      className="text-zinc-400 hover:text-white p-1"
                      title="Copy User ID"
                    >
                      {copiedId === selectedUser.id ? (
                        <Check size={14} className="text-emerald-400" />
                      ) : (
                        <Copy size={14} />
                      )}
                    </button>
                  </div>
                </div>

                {/* Email & Name */}
                <div className="p-3 rounded-lg bg-[#181818] space-y-2">
                  <div>
                    <p className="text-[10px] uppercase font-semibold text-zinc-500">Email Address</p>
                    <p className="text-xs font-medium text-white mt-0.5">{selectedUser.email}</p>
                  </div>
                  <div>
                    <p className="text-[10px] uppercase font-semibold text-zinc-500">Display Name</p>
                    <p className="text-xs font-medium text-zinc-300 mt-0.5">
                      {selectedUser.full_name || 'Not provided'}
                    </p>
                  </div>
                </div>

                {/* Subscription Card */}
                <div className="p-3 rounded-lg bg-[#181818] space-y-2">
                  <p className="text-[10px] uppercase font-semibold text-zinc-500">Subscription Status</p>
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-white capitalize">
                      {selectedUser.subscription?.plan || 'Free Account'}
                    </span>
                    <span
                      className={`text-[10px] font-semibold px-2 py-0.5 rounded ${
                        selectedUser.subscription?.status === 'active'
                          ? 'bg-[#15271b] text-emerald-400'
                          : selectedUser.subscription?.status === 'banned'
                          ? 'bg-[#2b1717] text-rose-400'
                          : 'bg-[#261f12] text-amber-400'
                      }`}
                    >
                      {selectedUser.subscription?.status || 'Active'}
                    </span>
                  </div>
                  {selectedUser.subscription?.expires_at && (
                    <p className="text-[11px] text-zinc-400 font-mono">
                      Renews / Expires: {new Date(selectedUser.subscription.expires_at).toLocaleDateString()}
                    </p>
                  )}
                </div>

                {/* Quick OTT Tip */}
                <div className="p-3 rounded-lg bg-[#151c27] text-sky-300 text-xs flex items-start gap-2.5">
                  <Tv size={16} className="shrink-0 mt-0.5 text-sky-400" />
                  <p className="text-[11px] leading-relaxed">
                    This user can pair their account with any Android TV or Smart TV using their 6-digit activation code.
                  </p>
                </div>
              </div>
            </div>

            {/* Drawer Actions Footer */}
            <div className="pt-4 border-t border-[#1f1f1f] space-y-2">
              <Button
                variant={selectedUser.subscription?.status === 'banned' ? 'default' : 'destructive'}
                className="w-full"
                onClick={() => {
                  openBanDialog(selectedUser)
                }}
              >
                {selectedUser.subscription?.status === 'banned' ? 'Unban User Account' : 'Ban User Account'}
              </Button>
              <Button
                variant="ghost"
                className="w-full text-xs text-zinc-400"
                onClick={() => setSelectedUser(null)}
              >
                Close Drawer
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Ban / Unban Confirmation Modal */}
      <ConfirmationModal
        open={banModalOpen}
        onOpenChange={setBanModalOpen}
        title={banTarget?.isBanned ? 'Unban User Account?' : 'Ban User Account?'}
        description={
          banTarget?.isBanned
            ? 'This will restore the user’s streaming access and television pairing abilities.'
            : 'This will immediately revoke streaming sessions and prevent TV pairing.'
        }
        confirmText={banTarget?.isBanned ? 'Confirm Unban' : 'Confirm Ban'}
        variant={banTarget?.isBanned ? 'default' : 'destructive'}
        onConfirm={handleConfirmBan}
        loading={banLoading}
      />
    </div>
  )
}
