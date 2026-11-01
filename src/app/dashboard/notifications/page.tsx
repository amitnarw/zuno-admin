'use client'

import React, { useState } from 'react'
import {
  Bell,
  Send,
  Users,
  CheckCircle2,
  AlertCircle,
  Clock,
  Sparkles,
  RefreshCw,
  Smartphone,
  Flame,
  Check,
} from 'lucide-react'
import { Button } from '@/components/ui/button'

interface NotificationSegment {
  id: string
  name: string
  description: string
  icon: React.ComponentType<{ size?: number; className?: string }>
}

const segments: NotificationSegment[] = [
  {
    id: 'all',
    name: 'All Users',
    description: 'Broadcast to all registered streaming accounts',
    icon: Users,
  },
  {
    id: 'active_subs',
    name: 'Active Subscribers',
    description: 'Users on an active Monthly or Yearly plan',
    icon: CheckCircle2,
  },
  {
    id: 'expired',
    name: 'Expired Subscriptions',
    description: 'Accounts with past-due or lapsed access',
    icon: AlertCircle,
  },
  {
    id: 'trial',
    name: 'Trial Users',
    description: 'Users currently on their 7-day free trial',
    icon: Clock,
  },
]

const templates = [
  {
    label: 'New Movie Release',
    title: '🍿 New Blockbuster Just Dropped on Zuno!',
    body: 'Stream the latest action-packed premiere in 4K Ultra HD. Tap to watch now.',
  },
  {
    label: 'Trial Ending Soon',
    title: '⏳ 2 Days Left on Your Free Trial',
    body: 'Don’t lose access to unlimited movies and live TV. Upgrade to yearly for only ₹500.',
  },
  {
    label: 'Weekend Binge',
    title: '🔥 What to Stream This Weekend',
    body: 'Check out the top 10 trending series curated specially for your watchlist.',
  },
]

export default function NotificationsPage() {
  const [segment, setSegment] = useState('all')
  const [title, setTitle] = useState('')
  const [body, setBody] = useState('')
  const [sending, setSending] = useState(false)
  const [sentMessage, setSentMessage] = useState<string | null>(null)

  // Demo sent log history
  const [sentLogs, setSentLogs] = useState([
    {
      id: '1',
      title: 'Weekend Movie Night: Top Releases',
      segment: 'All Users',
      sentAt: 'Yesterday at 7:30 PM',
      delivered: '14,200 devices',
    },
    {
      id: '2',
      title: 'Exclusive Live Channel Added',
      segment: 'Active Subscribers',
      sentAt: 'Oct 28, 2026',
      delivered: '3,380 devices',
    },
  ])

  const applyTemplate = (tmpl: { title: string; body: string }) => {
    setTitle(tmpl.title)
    setBody(tmpl.body)
  }

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!title || !body) return

    setSending(true)
    setSentMessage(null)

    try {
      const res = await fetch('/api/notifications/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ segment, title, body }),
      })

      if (res.ok) {
        const segObj = segments.find((s) => s.id === segment)
        const segName = segObj ? segObj.name : segment
        setSentMessage(`Push notification queued and dispatched to ${segName}!`)

        // Add to local history log
        setSentLogs((prev) => [
          {
            id: String(Date.now()),
            title,
            segment: segName,
            sentAt: 'Just now',
            delivered: 'Dispatched via FCM',
          },
          ...prev,
        ])

        setTitle('')
        setBody('')
        setTimeout(() => setSentMessage(null), 5000)
      } else {
        const err = await res.json()
        alert(err.error || 'Failed to send notification')
      }
    } catch {
      alert('Network error sending push alert')
    } finally {
      setSending(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2">
        <div>
          <h1 className="text-xl font-bold text-white tracking-tight">Push Notification Studio</h1>
          <p className="text-xs text-zinc-400 mt-0.5">
            Compose and broadcast instant push messages to Android and iOS mobile app users
          </p>
        </div>
      </div>

      {/* Split Studio Grid: Left Form, Right Smartphone Simulator */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left: Notification Composer (7 Cols) */}
        <div className="lg:col-span-7 space-y-5">
          {/* Audience Segment Selection */}
          <div className="p-5 rounded-xl bg-[#131313] space-y-3">
            <p className="text-[11px] font-semibold uppercase tracking-wider text-zinc-400">
              1. Target Audience Segment
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {segments.map((seg) => {
                const Icon = seg.icon
                const isSelected = segment === seg.id
                return (
                  <button
                    key={seg.id}
                    type="button"
                    onClick={() => setSegment(seg.id)}
                    className={`flex items-start gap-3 p-3 rounded-lg text-left transition-colors cursor-pointer ${
                      isSelected
                        ? 'bg-[#1e1e1e] text-white'
                        : 'bg-[#181818] text-zinc-400 hover:text-zinc-200 hover:bg-[#1a1a1a]'
                    }`}
                  >
                    <div
                      className={`w-7 h-7 rounded-md flex items-center justify-center shrink-0 ${
                        isSelected ? 'bg-[#f08327] text-white' : 'bg-[#222222] text-zinc-400'
                      }`}
                    >
                      <Icon size={14} />
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs font-semibold text-white">{seg.name}</p>
                      <p className="text-[10px] text-zinc-400 truncate mt-0.5">{seg.description}</p>
                    </div>
                  </button>
                )
              })}
            </div>
          </div>

          {/* Composer Form */}
          <form onSubmit={handleSend} className="p-5 rounded-xl bg-[#131313] space-y-4">
            <div className="flex items-center justify-between">
              <p className="text-[11px] font-semibold uppercase tracking-wider text-zinc-400">
                2. Message Content
              </p>
              {/* Presets */}
              <div className="flex items-center gap-1.5 overflow-x-auto">
                <span className="text-[10px] text-zinc-500 mr-1">Templates:</span>
                {templates.map((tmpl) => (
                  <button
                    key={tmpl.label}
                    type="button"
                    onClick={() => applyTemplate(tmpl)}
                    className="px-2 py-0.5 rounded text-[10px] bg-[#1a1a1a] hover:bg-[#252525] text-zinc-300 transition-colors whitespace-nowrap"
                  >
                    {tmpl.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Notification Title */}
            <div>
              <div className="flex justify-between text-xs mb-1">
                <label className="text-zinc-300 font-medium">Notification Title</label>
                <span className="text-[10px] text-zinc-500">{title.length} / 65</span>
              </div>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                maxLength={65}
                placeholder="e.g. New Telugu Blockbuster Added Today"
                className="w-full px-3.5 py-2.5 rounded-lg bg-[#181818] text-xs text-white placeholder-zinc-500 focus:bg-[#1e1e1e] focus:outline-none focus:ring-1 focus:ring-[#f08327] transition-all"
                required
              />
            </div>

            {/* Notification Body */}
            <div>
              <div className="flex justify-between text-xs mb-1">
                <label className="text-zinc-300 font-medium">Message Body</label>
                <span className="text-[10px] text-zinc-500">{body.length} / 180</span>
              </div>
              <textarea
                value={body}
                onChange={(e) => setBody(e.target.value)}
                maxLength={180}
                rows={3}
                placeholder="Write message copy that entices users to open the app..."
                className="w-full px-3.5 py-2.5 rounded-lg bg-[#181818] text-xs text-white placeholder-zinc-500 focus:bg-[#1e1e1e] focus:outline-none focus:ring-1 focus:ring-[#f08327] transition-all resize-y"
                required
              />
            </div>

            {/* Submit Button */}
            <Button
              type="submit"
              disabled={sending || !title || !body}
              className="w-full py-2.5 bg-[#f08327] hover:bg-[#d9721c] text-white font-semibold text-xs transition-colors flex items-center justify-center gap-2"
            >
              {sending ? (
                <>
                  <RefreshCw size={14} className="animate-spin" />
                  Broadcasting via FCM Gateway...
                </>
              ) : (
                <>
                  <Send size={14} />
                  Send Push Notification Now
                </>
              )}
            </Button>

            {sentMessage && (
              <div className="p-3 rounded-lg bg-[#16271c] text-emerald-400 text-xs flex items-center gap-2">
                <CheckCircle2 size={16} />
                <span>{sentMessage}</span>
              </div>
            )}
          </form>
        </div>

        {/* Right: Realistic Smartphone Lockscreen Preview (5 Cols) */}
        <div className="lg:col-span-5 p-5 rounded-xl bg-[#131313] flex flex-col items-center">
          <div className="w-full flex items-center justify-between pb-3 mb-4 border-b border-[#1c1c1c]">
            <div className="flex items-center gap-2">
              <Smartphone size={16} className="text-[#f08327]" />
              <h2 className="text-xs font-bold uppercase tracking-wider text-zinc-300">
                Live Device Preview
              </h2>
            </div>
            <span className="text-[10px] font-mono text-zinc-400">Lockscreen</span>
          </div>

          {/* Phone Shell */}
          <div className="w-full max-w-[280px] rounded-3xl bg-[#080808] p-4 shadow-2xl space-y-4">
            {/* Phone Notch / Status Bar */}
            <div className="flex items-center justify-between text-[10px] font-mono text-zinc-400 px-2 pt-1">
              <span>9:41</span>
              <div className="w-16 h-3.5 bg-[#141414] rounded-full mx-auto" />
              <span>5G 100%</span>
            </div>

            {/* Lockscreen Time */}
            <div className="text-center pt-2 pb-3">
              <p className="text-3xl font-light tracking-tight text-white">09:41</p>
              <p className="text-[10px] text-zinc-400 font-medium">Sunday, November 1</p>
            </div>

            {/* Notification Banner Container */}
            <div className="p-3 rounded-2xl bg-[#161616] text-white shadow-lg space-y-1.5 transition-all">
              {/* Header */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <div className="w-4 h-4 rounded-md bg-[#f08327] flex items-center justify-center text-[9px] font-bold text-white">
                    Z
                  </div>
                  <span className="text-[11px] font-bold tracking-tight text-zinc-200">Zuno</span>
                </div>
                <span className="text-[10px] text-zinc-400 font-mono">now</span>
              </div>

              {/* Title & Body */}
              <div>
                <p className="text-xs font-semibold text-white leading-tight">
                  {title || 'New Content Available'}
                </p>
                <p className="text-[11px] text-zinc-300 leading-snug mt-0.5 line-clamp-3">
                  {body || 'Stream latest premieres and live TV channels on your devices.'}
                </p>
              </div>
            </div>

            {/* Bottom Swipe Indicator */}
            <div className="pt-6 pb-1 flex justify-center">
              <div className="w-24 h-1 bg-zinc-700 rounded-full" />
            </div>
          </div>

          <p className="text-[10px] text-zinc-400 mt-4 text-center">
            Renders dynamically in real time as you type title and body
          </p>
        </div>
      </div>

      {/* Sent Campaign Logs Table */}
      <div className="p-5 rounded-xl bg-[#131313]">
        <div className="flex items-center justify-between pb-3 mb-3 border-b border-[#1c1c1c]">
          <div className="flex items-center gap-2">
            <Bell size={16} className="text-[#f08327]" />
            <h2 className="text-sm font-bold text-white tracking-tight">Recent Dispatched Alerts</h2>
          </div>
          <span className="text-xs text-zinc-400 font-mono">FCM Cloud Gateway</span>
        </div>

        <div className="space-y-2">
          {sentLogs.map((log) => (
            <div
              key={log.id}
              className="flex items-center justify-between p-3 rounded-lg bg-[#181818]"
            >
              <div>
                <p className="text-xs font-semibold text-white">{log.title}</p>
                <p className="text-[10px] text-zinc-400 mt-0.5">Audience: {log.segment}</p>
              </div>
              <div className="text-right">
                <span className="text-[10px] font-medium text-emerald-400 bg-[#16271c] px-2 py-0.5 rounded">
                  {log.delivered}
                </span>
                <p className="text-[10px] font-mono text-zinc-400 mt-1">{log.sentAt}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
