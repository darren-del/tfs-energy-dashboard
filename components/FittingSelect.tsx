'use client'
import { useState, useRef, useEffect } from 'react'
import { Search, ChevronDown, X } from 'lucide-react'
import { CURRENT_FITTINGS } from '@/lib/fittings'

interface FittingSelectProps {
  value: string
  onChange: (code: string) => void
  placeholder?: string
}

export default function FittingSelect({ value, onChange, placeholder = 'Select current fitting type...' }: FittingSelectProps) {
  const [open, setOpen] = useState(false)
  const [search, setSearch] = useState('')
  const ref = useRef<HTMLDivElement>(null)
  const searchRef = useRef<HTMLInputElement>(null)

  const selected = CURRENT_FITTINGS.find(f => f.code === value)
  const filtered = CURRENT_FITTINGS.filter(f =>
    f.label.toLowerCase().includes(search.toLowerCase())
  )

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  useEffect(() => {
    if (open && searchRef.current) setTimeout(() => searchRef.current?.focus(), 50)
  }, [open])

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className={`w-full flex items-center justify-between gap-2 px-4 py-3.5 bg-white border-2 rounded-xl text-left transition-all min-h-[52px] ${
          open ? 'border-[#252768] shadow-[0_0_0_3px_rgba(37,39,104,0.1)]' : 'border-slate-200 hover:border-[#252768]/40'
        }`}
      >
        <span className={`text-sm font-medium ${selected ? 'text-[#1a1c4e]' : 'text-slate-400'}`}>
          {selected ? selected.label : placeholder}
        </span>
        <div className="flex items-center gap-1 flex-shrink-0">
          {selected && (
            <button
              type="button"
              onClick={e => { e.stopPropagation(); onChange(''); setSearch('') }}
              className="text-slate-300 hover:text-slate-500 p-0.5 rounded transition-colors"
            >
              <X size={13} />
            </button>
          )}
          <ChevronDown size={16} className={`text-slate-400 transition-transform duration-200 ${open ? 'rotate-180' : ''}`} />
        </div>
      </button>

      {open && (
        <div className="absolute z-50 w-full mt-1.5 bg-white border border-slate-200 rounded-2xl shadow-2xl shadow-slate-200/80 overflow-hidden">
          {/* Search bar */}
          <div className="p-2 border-b border-slate-100 bg-slate-50">
            <div className="flex items-center gap-2 px-3 py-2 bg-white rounded-xl border border-slate-200">
              <Search size={13} className="text-slate-400 flex-shrink-0" />
              <input
                ref={searchRef}
                type="text"
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Search fitting types..."
                className="flex-1 bg-transparent text-sm outline-none text-slate-900 placeholder-slate-400"
              />
            </div>
          </div>
          {/* Options */}
          <div className="max-h-64 overflow-y-auto">
            {filtered.length === 0 ? (
              <div className="px-4 py-6 text-sm text-slate-400 text-center">No fittings found</div>
            ) : (
              filtered.map(f => (
                <button
                  key={f.code}
                  type="button"
                  onClick={() => { onChange(f.code); setOpen(false); setSearch('') }}
                  className={`w-full text-left px-4 py-3 text-sm transition-colors flex items-center justify-between gap-3 ${
                    f.code === value
                      ? 'bg-[#252768] text-white font-semibold'
                      : 'text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  <span>{f.label}</span>
                  <span className={`text-xs flex-shrink-0 font-medium ${f.code === value ? 'text-white/60' : 'text-slate-400'}`}>
                    {f.watts}W × {f.lamps}
                  </span>
                </button>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  )
}
