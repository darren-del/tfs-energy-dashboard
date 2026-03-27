'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { supabase } from '@/lib/supabase'
import { Lock, LogIn } from 'lucide-react'

const ADMIN_EMAIL = 'admin@tfs-energy.com'

export default function LoginPage() {
  const router = useRouter()
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')

    const { error } = await supabase.auth.signInWithPassword({
      email: ADMIN_EMAIL,
      password,
    })

    if (error) {
      setError('Incorrect password. Please try again.')
      setLoading(false)
    } else {
      router.push('/')
      router.refresh()
    }
  }

  return (
    <div className="min-h-screen bg-[#252768] flex items-center justify-center px-4 relative overflow-hidden">
      {/* Background decorative circles */}
      <div className="absolute -left-24 -top-24 w-96 h-96 rounded-full border-[60px] border-[#F2C519]/5 pointer-events-none" />
      <div className="absolute -right-16 -bottom-16 w-80 h-80 rounded-full border-[50px] border-[#F2C519]/5 pointer-events-none" />
      <div className="absolute right-1/4 top-10 w-24 h-24 rounded-full bg-[#F2C519]/5 pointer-events-none" />

      <div className="w-full max-w-sm relative">
        {/* Logo */}
        <div className="flex flex-col items-center mb-8">
          <div className="relative w-20 h-20 mb-4">
            <Image src="/tfs-logo-icon.png" alt="TFS Energy" fill className="object-contain drop-shadow-lg" sizes="80px" />
          </div>
          <div className="flex items-baseline gap-1.5">
            <span className="font-display font-bold text-3xl text-white tracking-wide">TFS</span>
            <span className="font-display font-bold text-3xl text-[#F2C519] tracking-wide">ENERGY</span>
          </div>
          <p className="text-white/40 text-xs font-medium mt-1 uppercase tracking-widest">Lighting Audit System</p>
        </div>

        {/* Card */}
        <div className="bg-white rounded-2xl shadow-2xl overflow-hidden">
          <div className="h-1 w-full bg-[#F2C519]" />
          <div className="px-8 py-8">
            <div className="flex items-center gap-2 mb-6">
              <div className="w-8 h-8 bg-[#252768] rounded-lg flex items-center justify-center">
                <Lock size={14} className="text-[#F2C519]" />
              </div>
              <div>
                <h1 className="font-display font-bold text-[#252768] text-lg leading-none">Sign In</h1>
                <p className="text-xs text-slate-400 font-medium mt-0.5">Admin access only</p>
              </div>
            </div>

            <form onSubmit={handleLogin} className="space-y-4">
              {/* Username (display only) */}
              <div>
                <label className="block text-[10px] font-bold text-[#252768]/50 uppercase tracking-widest mb-1.5">Username</label>
                <div className="w-full px-4 py-3 bg-slate-50 border-2 border-slate-100 rounded-xl text-slate-400 text-sm font-medium select-none">
                  admin
                </div>
              </div>

              {/* Password */}
              <div>
                <label className="block text-[10px] font-bold text-[#252768]/50 uppercase tracking-widest mb-1.5">Password</label>
                <input
                  type="password"
                  value={password}
                  onChange={e => { setPassword(e.target.value); setError('') }}
                  className="w-full px-4 py-3 bg-white border-2 border-slate-200 rounded-xl text-[#1a1c4e] placeholder-slate-300 focus:border-[#252768] focus:ring-4 focus:ring-[#252768]/8 transition-all text-sm outline-none font-medium"
                  placeholder="Enter password"
                  required
                  autoFocus
                />
                {error && <p className="text-red-500 text-xs mt-1.5 font-medium">{error}</p>}
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full flex items-center justify-center gap-2 bg-[#252768] hover:bg-[#1a1c4e] disabled:opacity-60 text-white font-bold px-6 py-3.5 rounded-xl shadow transition-all text-sm mt-2"
              >
                {loading ? (
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <><LogIn size={15} /> Sign In</>
                )}
              </button>
            </form>
          </div>
        </div>

        <p className="text-center text-white/20 text-xs mt-6 font-medium">
          © {new Date().getFullYear()} TFS Energy. All rights reserved.
        </p>
      </div>
    </div>
  )
}
