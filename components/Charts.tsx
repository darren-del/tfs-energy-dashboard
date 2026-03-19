'use client'
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  Area, AreaChart,
} from 'recharts'
import { Job } from '@/lib/types'
import { calcJob, calcRoom } from '@/lib/calculations'

interface ChartsProps { job: Job }

const ChartTooltip = ({ active, payload, label, suffix = '' }: any) => {
  if (!active || !payload?.length) return null
  return (
    <div className="bg-[#1a1c4e] text-white text-xs px-4 py-3 rounded-xl shadow-xl border border-white/10">
      <p className="font-bold text-white/60 mb-1.5 uppercase tracking-wider">{label}</p>
      {payload.map((p: any) => (
        <div key={p.name} className="flex items-center gap-2 mb-0.5">
          <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: p.color }} />
          <span className="text-white/70">{p.name}:</span>
          <span className="font-bold" style={{ color: p.color }}>
            {typeof p.value === 'number'
              ? (suffix === 'R' ? `R ${Math.round(p.value).toLocaleString('en-ZA')}` : `${Math.round(p.value).toLocaleString('en-ZA')} kWh`)
              : p.value}
          </span>
        </div>
      ))}
    </div>
  )
}

export function EnergyComparisonChart({ job }: ChartsProps) {
  const data = job.rooms
    .map(room => {
      const calc = calcRoom(room, job)
      return {
        name: room.areaDescription.length > 14 ? room.areaDescription.slice(0, 14) + '…' : room.areaDescription,
        Current: Math.round(calc.currentKwhPerYear),
        Proposed: Math.round(calc.proposedKwhPerYear),
      }
    })
    .sort((a, b) => b.Current - a.Current)
    .slice(0, 10)

  if (!data.length) return null

  return (
    <ResponsiveContainer width="100%" height={250}>
      <BarChart data={data} margin={{ top: 5, right: 10, left: 0, bottom: 5 }} barCategoryGap="30%">
        <CartesianGrid strokeDasharray="3 3" stroke="#e8eaf6" vertical={false} />
        <XAxis dataKey="name" tick={{ fontSize: 10, fill: '#64748b', fontFamily: 'Barlow' }} tickLine={false} axisLine={false} />
        <YAxis tick={{ fontSize: 10, fill: '#64748b', fontFamily: 'Barlow' }} tickLine={false} axisLine={false} />
        <Tooltip content={(props) => <ChartTooltip {...props} suffix="kWh" />} />
        <Legend wrapperStyle={{ fontSize: '11px', fontFamily: 'Barlow', fontWeight: 500 }} />
        <Bar dataKey="Current" fill="#c8cbe8" radius={[4, 4, 0, 0]} name="Current (kWh)" />
        <Bar dataKey="Proposed" fill="#252768" radius={[4, 4, 0, 0]} name="Proposed (kWh)" />
      </BarChart>
    </ResponsiveContainer>
  )
}

export function SavingsProjectionChart({ job }: ChartsProps) {
  const summary = calcJob(job)
  if (summary.totalAnnualSavings === 0) return null

  const data = [
    { year: 'Year 1', Annual: Math.round(summary.year1Savings), Cumulative: Math.round(summary.year1Savings) },
    { year: 'Year 2', Annual: Math.round(summary.year2Savings), Cumulative: Math.round(summary.year1Savings + summary.year2Savings) },
    { year: 'Year 3', Annual: Math.round(summary.year3Savings), Cumulative: Math.round(summary.year1Savings + summary.year2Savings + summary.year3Savings) },
    { year: 'Year 4', Annual: Math.round(summary.year4Savings), Cumulative: Math.round(summary.cumulativeSavings4yr) },
  ]

  return (
    <ResponsiveContainer width="100%" height={230}>
      <AreaChart data={data} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
        <defs>
          <linearGradient id="cumGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%"  stopColor="#F2C519" stopOpacity={0.25} />
            <stop offset="95%" stopColor="#F2C519" stopOpacity={0.02} />
          </linearGradient>
          <linearGradient id="annualGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%"  stopColor="#252768" stopOpacity={0.15} />
            <stop offset="95%" stopColor="#252768" stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke="#e8eaf6" vertical={false} />
        <XAxis dataKey="year" tick={{ fontSize: 11, fill: '#64748b', fontFamily: 'Barlow' }} tickLine={false} axisLine={false} />
        <YAxis tick={{ fontSize: 10, fill: '#64748b', fontFamily: 'Barlow' }} tickLine={false} axisLine={false} />
        <Tooltip content={(props) => <ChartTooltip {...props} suffix="R" />} />
        <Legend wrapperStyle={{ fontSize: '11px', fontFamily: 'Barlow', fontWeight: 500 }} />
        <Area type="monotone" dataKey="Cumulative" stroke="#F2C519" strokeWidth={2.5} fill="url(#cumGrad)" name="Cumulative" dot={{ fill: '#F2C519', r: 4, strokeWidth: 0 }} />
        <Area type="monotone" dataKey="Annual" stroke="#252768" strokeWidth={2} fill="url(#annualGrad)" name="Annual Savings" dot={{ fill: '#252768', r: 3, strokeWidth: 0 }} />
      </AreaChart>
    </ResponsiveContainer>
  )
}
