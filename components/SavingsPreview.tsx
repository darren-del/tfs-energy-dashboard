import { Room, Job } from '@/lib/types'
import { calcRoom, formatRands, formatNum } from '@/lib/calculations'
import { getProposedFitting } from '@/lib/fittings'
import { ArrowRight, TrendingDown, Zap, Leaf } from 'lucide-react'

interface SavingsPreviewProps {
  room: Partial<Room>
  job: Job
}

export default function SavingsPreview({ room, job }: SavingsPreviewProps) {
  if (!room.currentFittingCode || !room.proposedFittingCode || !room.quantity || !room.hoursPerDay) {
    return (
      <div className="bg-white border-2 border-dashed border-slate-200 rounded-2xl p-5 text-center">
        <Zap size={20} className="text-slate-300 mx-auto mb-2" />
        <p className="text-sm text-slate-400 font-medium">Fill in the fitting details above to see your savings preview</p>
      </div>
    )
  }

  const calc = calcRoom(room as Room, job)
  const proposed = getProposedFitting(room.proposedFittingCode)
  const savingsPct = calc.currentCostPerYear > 0
    ? Math.round((calc.annualSavingsRands / calc.currentCostPerYear) * 100)
    : 0

  return (
    <div className="rounded-2xl overflow-hidden shadow-lg border border-[#252768]/10">
      {/* Header */}
      <div className="bg-[#252768] px-5 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Zap size={14} className="text-[#F2C519]" />
          <span className="text-xs font-bold text-white uppercase tracking-widest">Live Savings Preview</span>
        </div>
        {proposed && (
          <div className="flex items-center gap-1.5 text-xs text-white/60">
            <ArrowRight size={11} />
            <span className="font-medium text-white/80">{proposed.label}</span>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="bg-[#1a1c4e] p-4 grid grid-cols-2 gap-3">
        <div className="bg-[#F2C519]/10 border border-[#F2C519]/20 rounded-xl p-3.5">
          <p className="text-xs text-[#F2C519]/70 font-semibold uppercase tracking-wider mb-0.5">Annual Savings</p>
          <p className="text-xl font-display font-bold text-[#F2C519]">{formatRands(calc.annualSavingsRands)}</p>
          <p className="text-xs text-white/40 mt-0.5">{savingsPct}% reduction</p>
        </div>
        <div className="bg-white/5 border border-white/10 rounded-xl p-3.5">
          <p className="text-xs text-white/50 font-semibold uppercase tracking-wider mb-0.5">Project Cost</p>
          <p className="text-xl font-display font-bold text-white">{formatRands(calc.totalRoomCost)}</p>
          <p className="text-xs text-white/40 mt-0.5">{room.quantity} fittings</p>
        </div>
        <div className="bg-white/5 border border-white/10 rounded-xl p-3.5">
          <div className="flex items-center gap-1 mb-0.5">
            <TrendingDown size={11} className="text-blue-400" />
            <p className="text-xs text-white/50 font-semibold uppercase tracking-wider">Energy Saved</p>
          </div>
          <p className="text-base font-display font-bold text-blue-300">{formatNum(calc.energySavingsKwhPerYear, 0)} kWh/yr</p>
        </div>
        <div className="bg-white/5 border border-white/10 rounded-xl p-3.5">
          <div className="flex items-center gap-1 mb-0.5">
            <Leaf size={11} className="text-emerald-400" />
            <p className="text-xs text-white/50 font-semibold uppercase tracking-wider">CO₂ Saved</p>
          </div>
          <p className="text-base font-display font-bold text-emerald-300">{formatNum(calc.co2ReductionTons, 2)} tons/yr</p>
        </div>
      </div>
    </div>
  )
}
