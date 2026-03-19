'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import Image from 'next/image'
import { Plus, LayoutDashboard } from 'lucide-react'

export default function NavBar() {
  const path = usePathname()
  const isHome = path === '/'

  return (
    <header className="bg-[#252768] sticky top-0 z-40 shadow-xl shadow-[#252768]/20">
      {/* top accent stripe */}
      <div className="h-1 w-full bg-[#F2C519]" />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">

        {/* Logo */}
        <Link href="/" className="flex items-center gap-3 group">
          <div className="relative w-14 h-14 flex-shrink-0">
            <Image
              src="/tfs-logo-icon.png"
              alt="TFS Energy"
              fill
              className="object-contain drop-shadow-lg"
              sizes="56px"
            />
          </div>
          <div className="flex items-baseline gap-0">
            <span className="font-display font-800 text-2xl tracking-wide text-white leading-none">TFS</span>
            <span className="font-display font-800 text-2xl tracking-wide text-[#F2C519] leading-none ml-1.5">ENERGY</span>
          </div>
        </Link>

        {/* Right actions */}
        <div className="flex items-center gap-2">
          {!isHome && (
            <Link
              href="/"
              className="flex items-center gap-1.5 text-sm font-medium text-white/70 hover:text-white px-3 py-1.5 rounded-lg hover:bg-white/10 transition-all"
            >
              <LayoutDashboard size={15} />
              <span className="hidden sm:inline">Dashboard</span>
            </Link>
          )}
          <Link
            href="/jobs/new"
            className="flex items-center gap-1.5 bg-[#F2C519] hover:bg-[#d4a900] text-[#252768] text-sm font-bold px-4 py-2 rounded-lg shadow transition-all"
          >
            <Plus size={15} />
            New Audit
          </Link>
        </div>
      </div>
    </header>
  )
}
