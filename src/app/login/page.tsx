'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Mail, Lock, Eye, EyeOff, ShieldCheck, RefreshCw } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { Logo } from '@/components/ui/logo'
import { Button } from '@/components/ui/button'

export default function LoginPage() {
  const router = useRouter()
  const supabase = createClient()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    const { error: authError } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    setLoading(false)

    if (authError) {
      setError(authError.message)
      return
    }

    router.push('/dashboard')
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#080808] p-4 text-[#f4f4f5]">
      <div className="max-w-sm w-full bg-[#121212] rounded-2xl p-7 shadow-2xl space-y-6">
        {/* Brand Header */}
        <div className="text-center space-y-2">
          <div className="inline-flex justify-center">
            <Logo height={32} />
          </div>
          <p className="text-xs text-zinc-400">
            Internal Operations & Streaming Command Center
          </p>
        </div>

        {error && (
          <div className="p-3 rounded-lg bg-[#2b1717] text-rose-400 text-xs">
            {error}
          </div>
        )}

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-zinc-300 mb-1.5">
              Administrator Email
            </label>
            <div className="relative">
              <Mail size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-500" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                placeholder="admin@zuno.app"
                className="w-full pl-9 pr-3.5 py-2.5 rounded-lg bg-[#181818] text-xs text-white placeholder-zinc-500 focus:bg-[#1e1e1e] focus:outline-none focus:ring-1 focus:ring-[#f08327] transition-all"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-zinc-300 mb-1.5">
              Password
            </label>
            <div className="relative">
              <Lock size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-500" />
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                placeholder="••••••••••••"
                className="w-full pl-9 pr-9 py-2.5 rounded-lg bg-[#181818] text-xs text-white placeholder-zinc-500 focus:bg-[#1e1e1e] focus:outline-none focus:ring-1 focus:ring-[#f08327] transition-all"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-300 p-0.5"
                aria-label="Toggle password visibility"
              >
                {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
              </button>
            </div>
          </div>

          <Button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 bg-[#f08327] hover:bg-[#d9721c] text-white font-semibold text-xs transition-colors flex items-center justify-center gap-2 mt-2"
          >
            {loading ? (
              <>
                <RefreshCw size={14} className="animate-spin" />
                Authenticating...
              </>
            ) : (
              'Sign In to Admin Console'
            )}
          </Button>
        </form>

        {/* Security Notice Footer */}
        <div className="pt-4 border-t border-[#1a1a1a] flex items-center justify-center gap-1.5 text-[11px] text-zinc-500">
          <ShieldCheck size={13} className="text-emerald-500" />
          <span>Encrypted Session · Restricted Access</span>
        </div>
      </div>
    </div>
  )
}
