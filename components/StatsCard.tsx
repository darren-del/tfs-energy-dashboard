import { ReactNode } from 'react'

interface StatsCardProps {
  label: string
  value: string
  sub?: string
  icon: ReactNode
  accent?: 'yellow' | 'navy' | 'blue' | 'default'
}

export default function StatsCard({ label, value, sub, icon, accent = 'default' }: StatsCardProps) {
  const iconColors = {
    yellow:  'bg-[#F2C519]/15 text-[#d4a900]',
    navy:    'bg-[#252768]/10 text-[#252768]',
    blue:    'bg-blue-50 text-blue-600',
    default: 'bg-slate-100 text-slate-500',
  }
  const valueColors = {
    yellow:  'text-[#252768]',
    navy:    'text-[#252768]',
    blue:    'text-blue-700',
    default: 'text-[#1a1c4e]',
  }

  return (
    <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-sm hover:shadow-md transition-all hover:-translate-y-0.5 group">
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-widest mb-1.5">{label}</p>
          <p className={`text-2xl font-display font-bold truncate ${valueColors[accent]}`}>{value}</p>
          {sub && <p className="text-xs text-slate-400 mt-0.5 font-medium">{sub}</p>}
        </div>
        <div className={`w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0 transition-colors ${iconColors[accent]}`}>
          {icon}
        </div>
      </div>
    </div>
  )
}
