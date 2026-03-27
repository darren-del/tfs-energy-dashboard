'use client'
import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import NavBar from '@/components/NavBar'
import StatsCard from '@/components/StatsCard'
import { EnergyComparisonChart, SavingsProjectionChart } from '@/components/Charts'
import { getJob, saveJob, deleteJob } from '@/lib/storage'
import { calcJob, calcRoom, formatRands, formatNum } from '@/lib/calculations'
import { getCurrentFitting, getProposedFitting } from '@/lib/fittings'
import { Job } from '@/lib/types'
import {
  Plus, Trash2, ArrowRight, TrendingUp, Zap, Leaf,
  DollarSign, Clock, Settings, ListOrdered, BarChart2, AlertTriangle,
  Save, CheckCircle2, Building2
} from 'lucide-react'

const inputCls = "w-full px-4 py-3 bg-white border-2 border-slate-200 rounded-xl text-[#1a1c4e] placeholder-slate-300 focus:border-[#252768] focus:ring-4 focus:ring-[#252768]/8 transition-all text-sm outline-none font-medium"

function LoadingScreen() {
  return (
    <div className="min-h-screen bg-[#f0f2f8]">
      <NavBar />
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-[#252768] border-t-[#F2C519] rounded-full animate-spin mx-auto mb-4" />
          <p className="text-slate-400 font-medium text-sm">Loading audit...</p>
        </div>
      </div>
    </div>
  )
}

export default function JobDetailPage() {
  const params = useParams()
  const id = typeof params?.id === 'string' ? params.id : ''
  const router = useRouter()
  const [job, setJob] = useState<Job | null>(null)
  const [notFound, setNotFound] = useState(false)
  const [tab, setTab] = useState<'rooms' | 'summary' | 'settings'>('rooms')
  const [deleteConfirm, setDeleteConfirm] = useState(false)
  const [deleteRoomConfirm, setDeleteRoomConfirm] = useState<string | null>(null)
  const [settingsForm, setSettingsForm] = useState<Partial<Job>>({})
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    if (!id) return
    getJob(id).then(j => {
      if (!j) { setNotFound(true); return }
      setJob(j)
      setSettingsForm(j)
    })
  }, [id])

  if (!job && !notFound) return <LoadingScreen />

  if (notFound) {
    return (
      <div className="min-h-screen bg-[#f0f2f8]">
        <NavBar />
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <p className="text-slate-500 font-medium mb-4">Audit not found.</p>
            <Link href="/" className="bg-[#252768] text-white font-bold px-5 py-2.5 rounded-xl text-sm">Back to Dashboard</Link>
          </div>
        </div>
      </div>
    )
  }

  // At this point job is definitely non-null
  const j = job as Job
  const summary = calcJob(j)

  async function deleteRoom(roomId: string) {
    const updated = { ...j, rooms: j.rooms.filter(r => r.id !== roomId) }
    await saveJob(updated); setJob(updated)
  }

  async function markComplete() {
    const updated = { ...j, status: (j.status === 'complete' ? 'draft' : 'complete') as 'draft' | 'complete' }
    await saveJob(updated); setJob(updated)
  }

  async function saveSettings() {
    const updated = { ...j, ...settingsForm }
    await saveJob(updated); setJob(updated)
    setSaved(true); setTimeout(() => setSaved(false), 2000)
  }

  function setSetting(key: keyof Job, val: string | number) {
    setSettingsForm(f => ({ ...f, [key]: val }))
  }

  const tabs = [
    { id: 'rooms',    label: 'Rooms',    icon: ListOrdered },
    { id: 'summary',  label: 'Summary',  icon: BarChart2 },
    { id: 'settings', label: 'Settings', icon: Settings },
  ] as const

  return (
    <div className="min-h-screen bg-[#f0f2f8] pb-24">
      <NavBar />

      {/* Job hero */}
      <div className="bg-[#252768] relative overflow-hidden">
        <div className="absolute -right-16 -top-16 w-56 h-56 rounded-full border-[35px] border-[#F2C519]/8 pointer-events-none" />
        <div className="absolute right-20 bottom-0 w-16 h-16 rounded-full bg-[#F2C519]/8 pointer-events-none" />

        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-6 relative">
          <div className="flex items-start justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Building2 size={13} className="text-white/40" />
                <span className="text-white/40 text-xs font-bold uppercase tracking-widest">Lighting Audit</span>
                <span className={`text-xs px-2.5 py-0.5 rounded-full font-bold ${
                  j.status === 'complete'
                    ? 'bg-[#F2C519]/20 text-[#F2C519]'
                    : 'bg-white/10 text-white/60'
                }`}>
                  {j.status === 'complete' ? 'Complete' : 'Draft'}
                </span>
              </div>
              <h1 className="font-display font-bold text-3xl text-white leading-tight">{j.clientName}</h1>
              <p className="text-white/50 text-sm mt-1 font-medium">{j.siteAddress} · {j.date}</p>
            </div>
            <div className="flex items-center gap-2 flex-shrink-0">
              <button
                onClick={markComplete}
                className="hidden sm:flex items-center gap-1.5 text-xs font-bold px-3 py-2 rounded-lg border transition-all border-white/20 text-white/60 hover:bg-white/10 hover:text-white"
              >
                <CheckCircle2 size={13} />
                {j.status === 'complete' ? 'Mark Draft' : 'Mark Complete'}
              </button>
              <Link
                href={`/jobs/${id}/rooms/new`}
                className="flex items-center gap-1.5 bg-[#F2C519] hover:bg-[#d4a900] text-[#252768] text-sm font-bold px-4 py-2.5 rounded-xl shadow transition-all"
              >
                <Plus size={14} /> Add Room
              </Link>
            </div>
          </div>

          {j.rooms.length > 0 && (
            <div className="grid grid-cols-3 gap-3 mt-5">
              {[
                { label: 'Annual Savings', value: formatRands(summary.totalAnnualSavings), color: 'text-[#F2C519]' },
                { label: 'Project Cost',   value: formatRands(summary.totalProjectCost),   color: 'text-white' },
                { label: 'ROI Payback',    value: summary.roiMonths > 0 ? `${formatNum(summary.roiMonths, 1)} months` : '—', color: 'text-white/80' },
              ].map(s => (
                <div key={s.label} className="bg-white/8 backdrop-blur rounded-xl px-4 py-3 border border-white/10">
                  <p className="text-[10px] font-bold text-white/40 uppercase tracking-widest mb-0.5">{s.label}</p>
                  <p className={`font-display font-bold text-lg leading-tight ${s.color}`}>{s.value}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white border-b border-slate-200 sticky top-[57px] z-30 shadow-sm">
        <div className="max-w-5xl mx-auto px-4 sm:px-6">
          <div className="flex">
            {tabs.map(t => {
              const Icon = t.icon
              return (
                <button
                  key={t.id}
                  onClick={() => setTab(t.id)}
                  className={`flex items-center gap-1.5 px-5 py-4 text-sm font-bold border-b-2 transition-all ${
                    tab === t.id
                      ? 'border-[#F2C519] text-[#252768]'
                      : 'border-transparent text-slate-400 hover:text-slate-600'
                  }`}
                >
                  <Icon size={14} />
                  {t.label}
                </button>
              )
            })}
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-6">

        {/* ─── ROOMS TAB ─── */}
        {tab === 'rooms' && (
          <div className="space-y-3">
            {j.rooms.length === 0 ? (
              <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm py-16 flex flex-col items-center text-center px-6">
                <div className="w-14 h-14 bg-[#252768]/8 rounded-2xl flex items-center justify-center mb-4">
                  <Zap size={22} className="text-[#252768]/40" />
                </div>
                <h3 className="font-display font-bold text-[#252768] text-xl mb-2">No rooms added yet</h3>
                <p className="text-slate-400 text-sm mb-5 max-w-xs font-medium leading-relaxed">
                  Add each room or area to calculate energy savings for this site.
                </p>
                <Link
                  href={`/jobs/${id}/rooms/new`}
                  className="flex items-center gap-2 bg-[#252768] hover:bg-[#1a1c4e] text-white font-bold px-6 py-3 rounded-xl shadow transition-all text-sm"
                >
                  <Plus size={14} /> Add First Room
                </Link>
              </div>
            ) : (
              <>
                {j.rooms.map((room, i) => {
                  const calc     = calcRoom(room, j)
                  const current  = getCurrentFitting(room.currentFittingCode)
                  const proposed = getProposedFitting(room.proposedFittingCode)
                  return (
                    <div key={room.id} className="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-4 hover:border-[#252768]/20 hover:shadow-md transition-all">
                      <div className="flex items-start gap-3">
                        <div className="w-9 h-9 bg-[#252768] text-white rounded-xl flex items-center justify-center flex-shrink-0 text-sm font-bold font-display">
                          {i + 1}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-2">
                            <div>
                              <p className="font-bold text-[#1a1c4e] text-sm">{room.areaDescription}</p>
                              {room.floor && <p className="text-xs text-slate-400 font-medium mt-0.5">{room.floor}</p>}
                            </div>
                            <div className="text-right flex-shrink-0">
                              <p className="text-sm font-bold text-[#252768]">{formatRands(calc.annualSavingsRands)}</p>
                              <p className="text-xs text-slate-400 font-medium">per year</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2 mt-2.5 flex-wrap">
                            <span className="text-xs bg-slate-100 text-slate-600 px-2.5 py-1 rounded-lg font-semibold">
                              {current?.label || room.currentFittingCode}
                            </span>
                            <ArrowRight size={12} className="text-[#F2C519] flex-shrink-0" />
                            <span className="text-xs bg-[#252768]/8 text-[#252768] px-2.5 py-1 rounded-lg font-semibold">
                              {proposed?.label || room.proposedFittingCode}
                            </span>
                          </div>
                          <div className="flex items-center gap-3 mt-2 text-xs text-slate-400 font-medium">
                            <span>{room.quantity} fitting{room.quantity !== 1 ? 's' : ''}</span>
                            <span>·</span>
                            <span>{room.hoursPerDay}h/day</span>
                            <span>·</span>
                            <span>{formatNum(calc.energySavingsKwhPerYear, 0)} kWh saved/yr</span>
                          </div>
                        </div>
                      </div>
                      <div className="flex justify-end items-center gap-2 mt-2 pt-2 border-t border-slate-50">
                        {deleteRoomConfirm === room.id ? (
                          <>
                            <span className="text-xs text-red-500 font-medium">Remove this room?</span>
                            <button
                              onClick={() => setDeleteRoomConfirm(null)}
                              className="text-xs text-slate-400 hover:text-slate-600 px-2.5 py-1.5 rounded-lg hover:bg-slate-100 transition-all font-medium"
                            >Cancel</button>
                            <button
                              onClick={() => { deleteRoom(room.id); setDeleteRoomConfirm(null) }}
                              className="text-xs text-white bg-red-500 hover:bg-red-600 px-2.5 py-1.5 rounded-lg transition-all font-medium"
                            >Yes, remove</button>
                          </>
                        ) : (
                          <button
                            onClick={() => setDeleteRoomConfirm(room.id)}
                            className="flex items-center gap-1 text-xs text-slate-300 hover:text-red-500 px-2.5 py-1.5 rounded-lg hover:bg-red-50 transition-all font-medium"
                          >
                            <Trash2 size={11} /> Remove
                          </button>
                        )}
                      </div>
                    </div>
                  )
                })}

                <div className="bg-[#252768] text-white rounded-2xl p-5 shadow-lg shadow-[#252768]/20">
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-center">
                    {[
                      { label: 'Rooms',          value: String(j.rooms.length) },
                      { label: 'Total Fittings', value: String(j.rooms.reduce((s, r) => s + r.quantity, 0)) },
                      { label: 'Annual Savings', value: formatRands(summary.totalAnnualSavings), yellow: true },
                      { label: 'Project Cost',   value: formatRands(summary.totalProjectCost) },
                    ].map(s => (
                      <div key={s.label}>
                        <p className="text-[10px] font-bold text-white/40 uppercase tracking-widest mb-0.5">{s.label}</p>
                        <p className={`font-display font-bold text-xl ${s.yellow ? 'text-[#F2C519]' : 'text-white'}`}>{s.value}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </>
            )}

            {/* Aircon cumulative totals */}
            {(() => {
              const totals = j.rooms.reduce((acc, r) => ({
                btu9000:  acc.btu9000  + (r.aircons?.btu9000  ?? 0),
                btu12000: acc.btu12000 + (r.aircons?.btu12000 ?? 0),
                btu18000: acc.btu18000 + (r.aircons?.btu18000 ?? 0),
                btu24000: acc.btu24000 + (r.aircons?.btu24000 ?? 0),
              }), { btu9000: 0, btu12000: 0, btu18000: 0, btu24000: 0 })
              const total = totals.btu9000 + totals.btu12000 + totals.btu18000 + totals.btu24000
              if (total === 0) return null
              return (
                <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
                  <div className="px-6 py-4 border-b border-slate-100 bg-gradient-to-r from-[#252768]/3 to-transparent flex items-center justify-between">
                    <div>
                      <h3 className="font-display font-bold text-[#252768] text-lg">Air Conditioners on Site</h3>
                      <p className="text-xs text-slate-400 font-medium mt-0.5">Cumulative total across all rooms</p>
                    </div>
                    <span className="text-xs font-bold text-[#252768] bg-[#252768]/8 px-3 py-1 rounded-full">{total} total units</span>
                  </div>
                  <div className="p-5 grid grid-cols-2 sm:grid-cols-4 gap-3">
                    {([
                      { key: 'btu9000',  label: '9,000 BTU' },
                      { key: 'btu12000', label: '12,000 BTU' },
                      { key: 'btu18000', label: '18,000 BTU' },
                      { key: 'btu24000', label: '24,000 BTU' },
                    ] as const).map(({ key, label }) => (
                      <div key={key} className="bg-[#f0f2f8] rounded-xl px-4 py-3 text-center">
                        <p className="text-[10px] font-bold text-[#252768]/50 uppercase tracking-widest">{label}</p>
                        <p className="font-display font-bold text-3xl text-[#252768] mt-1">{totals[key]}</p>
                        <p className="text-xs text-slate-400 font-medium">units</p>
                      </div>
                    ))}
                  </div>
                </div>
              )
            })()}
          </div>
        )}

        {/* ─── SUMMARY TAB ─── */}
        {tab === 'summary' && (
          <div className="space-y-5">
            {j.rooms.length === 0 ? (
              <div className="bg-white rounded-2xl p-12 text-center">
                <p className="text-slate-400 font-medium">Add rooms to generate the financial summary.</p>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-2 lg:grid-cols-3 gap-3">
                  <StatsCard label="Current Annual Cost"  value={formatRands(summary.totalCurrentCostPerYear)}  icon={<DollarSign size={16} />} accent="default" />
                  <StatsCard label="Proposed Annual Cost" value={formatRands(summary.totalProposedCostPerYear)} icon={<DollarSign size={16} />} accent="navy" />
                  <StatsCard label="Annual Savings"       value={formatRands(summary.totalAnnualSavings)} sub="electricity cost reduction" icon={<TrendingUp size={16} />} accent="yellow" />
                  <StatsCard label="Total Project Cost"   value={formatRands(summary.totalProjectCost)}         icon={<DollarSign size={16} />} accent="default" />
                  <StatsCard label="ROI Payback"          value={summary.roiMonths > 0 ? `${formatNum(summary.roiMonths, 1)} months` : '—'} icon={<Clock size={16} />} accent="blue" />
                  <StatsCard label="CO₂ Reduction"        value={`${formatNum(summary.totalCo2Reduction, 2)} tons`} sub="per year" icon={<Leaf size={16} />} accent="navy" />
                </div>

                <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-5">
                  <h3 className="font-display font-bold text-[#252768] text-lg mb-0.5">Energy Use by Room</h3>
                  <p className="text-xs text-slate-400 font-medium mb-5">Current vs Proposed kWh/year — top 10 rooms</p>
                  <EnergyComparisonChart job={j} />
                </div>

                <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-5">
                  <h3 className="font-display font-bold text-[#252768] text-lg mb-0.5">4-Year Savings Projection</h3>
                  <p className="text-xs text-slate-400 font-medium mb-5">Includes {j.eskomIncrease}% annual Eskom escalation</p>
                  <SavingsProjectionChart job={j} />
                </div>

                <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
                  <div className="px-5 py-4 border-b border-slate-100 bg-gradient-to-r from-[#252768]/3 to-transparent">
                    <h3 className="font-display font-bold text-[#252768] text-lg">Year-by-Year Savings</h3>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b border-slate-100">
                          <th className="text-left text-xs font-bold text-slate-400 uppercase tracking-widest px-5 py-3.5">Period</th>
                          <th className="text-right text-xs font-bold text-slate-400 uppercase tracking-widest px-4 py-3.5">Annual Savings</th>
                          <th className="text-right text-xs font-bold text-slate-400 uppercase tracking-widest px-4 py-3.5">Cumulative</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-50">
                        {[
                          { label: 'Year 1', val: summary.year1Savings, cum: summary.year1Savings },
                          { label: 'Year 2', val: summary.year2Savings, cum: summary.year1Savings + summary.year2Savings },
                          { label: 'Year 3', val: summary.year3Savings, cum: summary.year1Savings + summary.year2Savings + summary.year3Savings },
                          { label: 'Year 4', val: summary.year4Savings, cum: summary.cumulativeSavings4yr },
                        ].map(row => (
                          <tr key={row.label} className="hover:bg-[#252768]/2 transition-colors">
                            <td className="px-5 py-3.5 font-bold text-sm text-[#252768]">{row.label}</td>
                            <td className="px-4 py-3.5 text-right text-sm font-bold text-[#252768]">{formatRands(row.val)}</td>
                            <td className="px-4 py-3.5 text-right text-sm text-slate-500 font-medium">{formatRands(row.cum)}</td>
                          </tr>
                        ))}
                        <tr className="bg-[#252768]">
                          <td className="px-5 py-4 font-bold text-sm text-white">4-Year Total</td>
                          <td className="px-4 py-4" />
                          <td className="px-4 py-4 text-right font-display font-bold text-[#F2C519] text-base">{formatRands(summary.cumulativeSavings4yr)}</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>

                {(() => {
                  const totals = j.rooms.reduce((acc, r) => ({
                    btu9000:  acc.btu9000  + (r.aircons?.btu9000  ?? 0),
                    btu12000: acc.btu12000 + (r.aircons?.btu12000 ?? 0),
                    btu18000: acc.btu18000 + (r.aircons?.btu18000 ?? 0),
                    btu24000: acc.btu24000 + (r.aircons?.btu24000 ?? 0),
                  }), { btu9000: 0, btu12000: 0, btu18000: 0, btu24000: 0 })
                  const total = totals.btu9000 + totals.btu12000 + totals.btu18000 + totals.btu24000
                  if (total === 0) return null
                  return (
                    <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
                      <div className="px-5 py-4 border-b border-slate-100 bg-gradient-to-r from-[#252768]/3 to-transparent flex items-center justify-between">
                        <h3 className="font-display font-bold text-[#252768] text-lg">Air Conditioners on Site</h3>
                        <span className="text-xs font-bold text-[#252768] bg-[#252768]/8 px-3 py-1 rounded-full">{total} total units</span>
                      </div>
                      <div className="p-5 grid grid-cols-2 sm:grid-cols-4 gap-3">
                        {([
                          { key: 'btu9000',  label: '9,000 BTU' },
                          { key: 'btu12000', label: '12,000 BTU' },
                          { key: 'btu18000', label: '18,000 BTU' },
                          { key: 'btu24000', label: '24,000 BTU' },
                        ] as const).map(({ key, label }) => (
                          <div key={key} className="bg-[#f0f2f8] rounded-xl px-4 py-3 text-center">
                            <p className="text-[10px] font-bold text-[#252768]/50 uppercase tracking-widest">{label}</p>
                            <p className="font-display font-bold text-3xl text-[#252768] mt-1">{totals[key]}</p>
                            <p className="text-xs text-slate-400 font-medium">units</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )
                })()}
              </>
            )}
          </div>
        )}

        {/* ─── SETTINGS TAB ─── */}
        {tab === 'settings' && (
          <div className="space-y-4">
            <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
              <div className="px-5 py-4 border-b border-slate-100 bg-gradient-to-r from-[#252768]/3 to-transparent">
                <h3 className="font-display font-bold text-[#252768] text-lg">Client Details</h3>
              </div>
              <div className="p-5 space-y-4">
                <div className="grid sm:grid-cols-2 gap-4">
                  {(['clientName', 'contactPerson'] as const).map(key => (
                    <div key={key}>
                      <label className="text-[10px] font-bold text-[#252768]/60 uppercase tracking-widest mb-1.5 block">
                        {key === 'clientName' ? 'Client Name' : 'Contact Person'}
                      </label>
                      <input className={inputCls} value={(settingsForm[key] as string) || ''} onChange={e => setSetting(key, e.target.value)} />
                    </div>
                  ))}
                </div>
                <div>
                  <label className="text-[10px] font-bold text-[#252768]/60 uppercase tracking-widest mb-1.5 block">Site Address</label>
                  <input className={inputCls} value={settingsForm.siteAddress || ''} onChange={e => setSetting('siteAddress', e.target.value)} />
                </div>
                <div className="grid sm:grid-cols-2 gap-4">
                  {([
                    { key: 'date',          label: 'Date',           type: 'date' },
                    { key: 'vatNumber',     label: 'VAT Number',     type: 'text' },
                    { key: 'contactNumber', label: 'Contact Number', type: 'text' },
                    { key: 'email',         label: 'Email',          type: 'email' },
                  ] as const).map(({ key, label, type }) => (
                    <div key={key}>
                      <label className="text-[10px] font-bold text-[#252768]/60 uppercase tracking-widest mb-1.5 block">{label}</label>
                      <input type={type} className={inputCls} value={(settingsForm[key] as string) || ''} onChange={e => setSetting(key, e.target.value)} />
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
              <div className="px-5 py-4 border-b border-slate-100 bg-gradient-to-r from-[#252768]/3 to-transparent">
                <h3 className="font-display font-bold text-[#252768] text-lg">Financial Settings</h3>
              </div>
              <div className="p-5">
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {([
                    { key: 'costPerKwh',         label: 'Cost per kWh (R)',        step: '0.01' },
                    { key: 'eskomIncrease',      label: 'Eskom Increase (%)',      step: '1' },
                    { key: 'defaultBallastWatt', label: 'Default Ballast Watt',    step: '1' },
                    { key: 'installPerFitting',  label: 'Install per Fitting (R)', step: '10' },
                    { key: 'disposalPerFitting', label: 'Disposal per Fitting (R)',step: '10' },
                  ] as const).map(({ key, label, step }) => (
                    <div key={key}>
                      <label className="text-[10px] font-bold text-[#252768]/60 uppercase tracking-widest mb-1.5 block">{label}</label>
                      <input type="number" step={step} className={inputCls}
                        value={(settingsForm[key] as number) ?? ''}
                        onChange={e => setSetting(key, parseFloat(e.target.value) || 0)} />
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between gap-3">
              <button
                onClick={() => setDeleteConfirm(true)}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl border-2 border-red-200 text-red-400 text-sm font-bold hover:bg-red-50 hover:border-red-300 transition-all"
              >
                <Trash2 size={14} /> Delete Job
              </button>
              <button
                onClick={saveSettings}
                className={`flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-bold shadow transition-all ${
                  saved
                    ? 'bg-[#F2C519] text-[#252768]'
                    : 'bg-[#252768] hover:bg-[#1a1c4e] text-white shadow-[#252768]/20'
                }`}
              >
                {saved ? <><CheckCircle2 size={14} /> Saved!</> : <><Save size={14} /> Save Changes</>}
              </button>
            </div>

            {deleteConfirm && (
              <div className="bg-red-50 border-2 border-red-200 rounded-2xl p-5">
                <div className="flex items-start gap-3">
                  <AlertTriangle size={18} className="text-red-500 flex-shrink-0 mt-0.5" />
                  <div className="flex-1">
                    <p className="font-bold text-red-700 text-sm">Delete this job permanently?</p>
                    <p className="text-red-500 text-xs mt-0.5 font-medium">All room data will be lost. This cannot be undone.</p>
                    <div className="flex gap-2 mt-3">
                      <button
                        onClick={async () => { await deleteJob(id); router.push('/') }}
                        className="bg-red-500 hover:bg-red-600 text-white text-xs font-bold px-4 py-2 rounded-lg transition-all"
                      >
                        Yes, Delete
                      </button>
                      <button
                        onClick={() => setDeleteConfirm(false)}
                        className="bg-white border border-slate-200 text-slate-600 text-xs font-medium px-4 py-2 rounded-lg transition-all"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Mobile FAB */}
      <Link
        href={`/jobs/${id}/rooms/new`}
        className="fixed bottom-6 right-6 md:hidden flex items-center gap-2 bg-[#F2C519] hover:bg-[#d4a900] text-[#252768] font-bold px-5 py-3.5 rounded-2xl shadow-xl shadow-[#F2C519]/30 transition-all z-50"
      >
        <Plus size={18} /> Add Room
      </Link>
    </div>
  )
}
