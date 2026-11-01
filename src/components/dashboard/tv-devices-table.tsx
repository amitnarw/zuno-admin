'use client'

import { useState, useMemo } from 'react'
import {
  Tv,
  Search,
  X,
  Copy,
  Check,
  Smartphone,
  Laptop,
  CheckCircle2,
  Clock,
  AlertTriangle,
  RotateCcw,
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

export interface TVDevice {
  id: string
  user_id: string | null
  device_id: string
  pairing_code: string
  paired_at: string | null
  last_seen: string | null
  subscription_status: string | null
  created_at: string
  users?: {
    email: string
    full_name: string | null
  } | null
}

interface TVDevicesTableProps {
  devices: TVDevice[]
  initialSearch?: string
}

export function TVDevicesTable({ devices, initialSearch = '' }: TVDevicesTableProps) {
  const [searchTerm, setSearchTerm] = useState(initialSearch)
  const [statusFilter, setStatusFilter] = useState<'all' | 'paired' | 'pending'>('all')
  const [copiedCode, setCopiedCode] = useState<string | null>(null)

  const [revokeOpen, setRevokeOpen] = useState(false)
  const [revokeTargetId, setRevokeTargetId] = useState<string | null>(null)
  const [revokeLoading, setRevokeLoading] = useState(false)

  // Local state for optimistic update
  const [localDevices, setLocalDevices] = useState<TVDevice[]>(devices)

  const handleCopyCode = (code: string) => {
    navigator.clipboard.writeText(code)
    setCopiedCode(code)
    setTimeout(() => setCopiedCode(null), 2000)
  }

  const isPaired = (d: TVDevice) => d.paired_at !== null && d.user_id !== null

  const filteredDevices = useMemo(() => {
    return localDevices.filter((d) => {
      const matchesSearch =
        !searchTerm ||
        d.device_id.toLowerCase().includes(searchTerm.toLowerCase()) ||
        d.pairing_code.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (d.users?.email && d.users.email.toLowerCase().includes(searchTerm.toLowerCase()))

      if (!matchesSearch) return false

      const paired = isPaired(d)
      if (statusFilter === 'paired' && !paired) return false
      if (statusFilter === 'pending' && paired) return false

      return true
    })
  }, [localDevices, searchTerm, statusFilter])

  const counts = useMemo(() => {
    return {
      all: localDevices.length,
      paired: localDevices.filter((d) => isPaired(d)).length,
      pending: localDevices.filter((d) => !isPaired(d)).length,
    }
  }, [localDevices])

  const handleRevoke = (id: string) => {
    setRevokeTargetId(id)
    setRevokeOpen(true)
  }

  const handleConfirmRevoke = async () => {
    if (!revokeTargetId) return
    setRevokeLoading(true)

    try {
      const res = await fetch(`/api/auth/revoke-device?id=${revokeTargetId}`, {
        method: 'POST',
      })
      if (res.ok) {
        setLocalDevices((prev) =>
          prev.map((d) => {
            if (d.id === revokeTargetId) {
              return { ...d, paired_at: null, user_id: null, users: null }
            }
            return d
          })
        )
        setRevokeOpen(false)
        setRevokeTargetId(null)
      } else {
        const err = await res.json()
        alert(err.error || 'Failed to revoke TV device pairing')
      }
    } catch {
      alert('Network error revoking pairing')
    } finally {
      setRevokeLoading(false)
    }
  }

  return (
    <div className="space-y-4">
      {/* Search & Status Filter */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 p-3 rounded-xl bg-[#131313]">
        <div className="relative flex-1 max-w-md">
          <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search by device ID, pairing code, or user..."
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

        <div className="flex items-center gap-1">
          <button
            onClick={() => setStatusFilter('all')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
              statusFilter === 'all'
                ? 'bg-[#222222] text-white font-semibold'
                : 'text-zinc-400 hover:text-zinc-200 hover:bg-[#181818]'
            }`}
          >
            All TVs <span className="ml-1 text-[10px] text-zinc-500">({counts.all})</span>
          </button>
          <button
            onClick={() => setStatusFilter('paired')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
              statusFilter === 'paired'
                ? 'bg-[#18261e] text-emerald-400 font-semibold'
                : 'text-zinc-400 hover:text-zinc-200 hover:bg-[#181818]'
            }`}
          >
            Paired & Active <span className="ml-1 text-[10px] text-zinc-500">({counts.paired})</span>
          </button>
          <button
            onClick={() => setStatusFilter('pending')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
              statusFilter === 'pending'
                ? 'bg-[#261f12] text-amber-400 font-semibold'
                : 'text-zinc-400 hover:text-zinc-200 hover:bg-[#181818]'
            }`}
          >
            Pending Code <span className="ml-1 text-[10px] text-zinc-500">({counts.pending})</span>
          </button>
        </div>
      </div>

      {/* TV Devices Table */}
      <div className="rounded-xl bg-[#131313] overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="border-none bg-[#0f0f0f]">
              <TableHead className="py-3 px-4 text-xs font-semibold uppercase text-zinc-400">TV Hardware ID</TableHead>
              <TableHead className="py-3 px-4 text-xs font-semibold uppercase text-zinc-400">Pairing Code</TableHead>
              <TableHead className="py-3 px-4 text-xs font-semibold uppercase text-zinc-400">Linked Account</TableHead>
              <TableHead className="py-3 px-4 text-xs font-semibold uppercase text-zinc-400">Status</TableHead>
              <TableHead className="py-3 px-4 text-xs font-semibold uppercase text-zinc-400">Last Seen</TableHead>
              <TableHead className="py-3 px-4 text-xs font-semibold uppercase text-zinc-400 text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredDevices.map((device) => {
              const paired = isPaired(device)
              return (
                <TableRow key={device.id} className="hover:bg-[#181818] transition-colors">
                  {/* Device ID */}
                  <TableCell className="py-3.5 px-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-[#202020] text-zinc-300 flex items-center justify-center shrink-0">
                        <Tv size={15} />
                      </div>
                      <div className="min-w-0">
                        <p className="text-xs font-mono font-medium text-white truncate max-w-[200px]">
                          {device.device_id}
                        </p>
                        <p className="text-[10px] text-zinc-400">Android TV / Smart Display</p>
                      </div>
                    </div>
                  </TableCell>

                  {/* 6-Digit Pairing Code with Copy */}
                  <TableCell className="py-3.5 px-4">
                    <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-md bg-[#1c1c1c]">
                      <span className="text-xs font-mono font-bold tracking-widest text-[#f08327]">
                        {device.pairing_code}
                      </span>
                      <button
                        onClick={() => handleCopyCode(device.pairing_code)}
                        className="text-zinc-400 hover:text-white transition-colors"
                        title="Copy activation code"
                      >
                        {copiedCode === device.pairing_code ? (
                          <Check size={13} className="text-emerald-400" />
                        ) : (
                          <Copy size={13} />
                        )}
                      </button>
                    </div>
                  </TableCell>

                  {/* Linked User */}
                  <TableCell className="py-3.5 px-4">
                    {device.users ? (
                      <div>
                        <p className="text-xs font-semibold text-white">{device.users.email}</p>
                        <p className="text-[10px] text-zinc-400">
                          {device.users.full_name || 'Registered User'}
                        </p>
                      </div>
                    ) : (
                      <span className="text-xs text-zinc-400 italic">Unclaimed code</span>
                    )}
                  </TableCell>

                  {/* Status Pill */}
                  <TableCell className="py-3.5 px-4">
                    <span
                      className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded text-[11px] font-medium ${
                        paired
                          ? 'bg-[#15271b] text-emerald-400'
                          : 'bg-[#261f12] text-amber-400'
                      }`}
                    >
                      <span
                        className={`w-1.5 h-1.5 rounded-full ${
                          paired ? 'bg-emerald-500' : 'bg-amber-500'
                        }`}
                      />
                      {paired ? 'Paired' : 'Awaiting Pair'}
                    </span>
                  </TableCell>

                  {/* Last Seen */}
                  <TableCell className="py-3.5 px-4 text-xs font-mono text-zinc-400">
                    {device.last_seen ? new Date(device.last_seen).toLocaleString() : ','}
                  </TableCell>

                  {/* Action */}
                  <TableCell className="py-3.5 px-4 text-right">
                    {paired ? (
                      <button
                        onClick={() => handleRevoke(device.id)}
                        className="px-2.5 py-1 rounded-md bg-[#2b1717] hover:bg-[#3d1e1e] text-xs font-medium text-rose-400 transition-colors"
                      >
                        Revoke Pairing
                      </button>
                    ) : (
                      <span className="text-xs text-zinc-400">Ready</span>
                    )}
                  </TableCell>
                </TableRow>
              )
            })}

            {filteredDevices.length === 0 && (
              <TableRow>
                <TableCell colSpan={6} className="py-12 text-center text-xs text-zinc-500">
                  No TV devices found matching your search
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* Confirmation Modal */}
      <ConfirmationModal
        open={revokeOpen}
        onOpenChange={setRevokeOpen}
        title="Revoke TV Device Pairing?"
        description="The TV screen will immediately disconnect and display a new activation code. The user will need to pair their device again."
        confirmText="Revoke Pairing"
        variant="destructive"
        onConfirm={handleConfirmRevoke}
        loading={revokeLoading}
      />
    </div>
  )
}
