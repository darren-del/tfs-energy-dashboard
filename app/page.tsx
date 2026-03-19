'use client'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { getJobs } from '@/lib/storage'
import { calcJob, formatRands, formatNum } from '@/lib/calculations'
import { Job } from '@/lib/types'
import NavBar from '@/components/NavBar'
import StatsCard from '@/components/StatsCard'
import { Zap, MapPin, TrendingUp, Clock, Plus, ChevronRight, Building2, Calendar, ArrowUpRight } from 'lucide-react'

export default function DashboardPage() {
  const [jobs, setJobs] = useState<Job[]>([])
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    getJobs().then(j => { setJobs(j); setMounted(true) })
  }, [])

  const summaries = jobs.map(j => ({ job: j, summary: calcJob(j) }))
  const totalSavings = summaries.reduce((s, x) => s + x.summary.totalAnnualSavings, 0)
  const roiJobs = summaries.filter(x => x.summary.roiMonths > 0)
  const avgRoi = roiJobs.length > 0 ? roiJobs.reduce((s, x) => s + x.summary.roiMonths, 0) / roiJobs.length : 0

  return (
    <div className="min-h-screen bg-[#f0f2f8]">
      <NavBar />

      {/* Hero */}
      <div className="bg-[#252768] relative overflow-hidden">
        {/* decorative circles from the logo motif */}
        <div className="absolute -right-20 -top-20 w-72 h-72 rounded-full border-[40px] border-[#F2C519]/8 pointer-events-none" />
        <div className="absolute -right-8 -top-8 w-44 h-44 rounded-full bg-[#F2C519]/5 pointer-events-none" />
        <div className="absolute right-32 bottom-0 w-20 h-20 rounded-full bg-[#F2C519]/10 pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10 relative">
          <div className="flex items-end justify-between gap-4">
            <div>
              <p className="text-[#F2C519] text-xs font-bold uppercase tracking-[0.2em] mb-2">Lighting Audit System</p>
              <h1 className="font-display font-bold text-4xl text-white leading-tight">
                Audit Dashboard
              </h1>
              <p className="text-white/50 text-sm mt-2 font-medium">
                Manage site audits, track savings, and generate proposals
              </p>
            </div>
            <Link
              href="/jobs/new"
              className="hidden sm:flex items-center gap-2 bg-[#F2C519] hover:bg-[#d4a900] text-[#252768] font-bold px-5 py-2.5 rounded-xl shadow-lg transition-all whitespace-nowrap text-sm"
            >
              <Plus size={15} />
              New Audit
            </Link>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 space-y-6">

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 -mt-2">
          {[
            {
              label: 'Total Audits',
              value: formatNum(jobs.length),
              icon: <Building2 size={18} />,
              accent: 'default' as const,
            },
            {
              label: 'Sites Audited',
              value: formatNum(jobs.length),
              sub: 'unique sites',
              icon: <MapPin size={18} />,
              accent: 'navy' as const,
            },
            {
              label: 'Total Annual Savings',
              value: formatRands(totalSavings),
              sub: 'across all jobs',
              icon: <TrendingUp size={18} />,
              accent: 'yellow' as const,
            },
            {
              label: 'Avg. ROI Payback',
              value: avgRoi > 0 ? `${formatNum(avgRoi, 1)} mo` : '—',
              sub: 'months to payback',
              icon: <Clock size={18} />,
              accent: 'blue' as const,
            },
          ].map(s => (
            <StatsCard key={s.label} {...s} />
          ))}
        </div>

        {/* Jobs */}
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-gradient-to-r from-[#252768]/3 to-transparent">
            <div>
              <h2 className="font-display font-bold text-[#252768] text-xl">All Audits</h2>
              <p className="text-xs text-slate-400 font-medium">{jobs.length} {jobs.length === 1 ? 'job' : 'jobs'} recorded</p>
            </div>
            <Link
              href="/jobs/new"
              className="flex items-center gap-1.5 text-xs font-bold text-[#252768] hover:text-[#F2C519] hover:bg-[#252768] px-3 py-1.5 rounded-lg border border-[#252768]/20 hover:border-[#252768] transition-all"
            >
              <Plus size={12} /> New
            </Link>
          </div>

          {jobs.length === 0 ? (
            <div className="py-20 flex flex-col items-center text-center px-6">
              {/* Logo icon large */}
              <div className="relative w-20 h-20 mb-5 opacity-20">
                <Image src="/tfs-logo-icon.png" alt="" fill className="object-contain" />
              </div>
              <h3 className="font-display font-bold text-[#252768] text-xl mb-2">No audits yet</h3>
              <p className="text-slate-400 text-sm mb-6 max-w-xs leading-relaxed">
                Start your first lighting audit to calculate LED savings and generate professional client proposals.
              </p>
              <Link
                href="/jobs/new"
                className="flex items-center gap-2 bg-[#252768] hover:bg-[#1a1c4e] text-white font-bold px-6 py-3 rounded-xl shadow transition-all text-sm"
              >
                <Plus size={15} />
                Create First Audit
              </Link>
            </div>
          ) : (
            <>
              {/* Desktop table */}
              <div className="hidden md:block overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-slate-100">
                      <th className="text-left text-xs font-bold text-slate-400 uppercase tracking-widest px-6 py-3.5">Client</th>
                      <th className="text-left text-xs font-bold text-slate-400 uppercase tracking-widest px-4 py-3.5">Site</th>
                      <th className="text-left text-xs font-bold text-slate-400 uppercase tracking-widest px-4 py-3.5">Date</th>
                      <th className="text-right text-xs font-bold text-slate-400 uppercase tracking-widest px-4 py-3.5">Rooms</th>
                      <th className="text-right text-xs font-bold text-slate-400 uppercase tracking-widest px-4 py-3.5">Annual Savings</th>
                      <th className="text-right text-xs font-bold text-slate-400 uppercase tracking-widest px-4 py-3.5">ROI</th>
                      <th className="text-center text-xs font-bold text-slate-400 uppercase tracking-widest px-4 py-3.5">Status</th>
                      <th className="px-4 py-3.5 w-10"></th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                    {summaries.map(({ job, summary }) => (
                      <tr
                        key={job.id}
                        className="hover:bg-[#252768]/3 transition-colors group cursor-pointer"
                        onClick={() => window.location.href = `/jobs/${job.id}`}
                      >
                        <td className="px-6 py-4">
                          <p className="font-bold text-sm text-[#1a1c4e]">{job.clientName}</p>
                          <p className="text-xs text-slate-400 font-medium mt-0.5">{job.contactPerson}</p>
                        </td>
                        <td className="px-4 py-4">
                          <p className="text-sm text-slate-600 max-w-[200px] truncate font-medium">{job.siteAddress}</p>
                        </td>
                        <td className="px-4 py-4">
                          <p className="text-sm text-slate-500 font-medium">{job.date}</p>
                        </td>
                        <td className="px-4 py-4 text-right">
                          <span className="text-sm font-bold text-slate-700">{job.rooms.length}</span>
                        </td>
                        <td className="px-4 py-4 text-right">
                          <span className={`text-sm font-bold ${summary.totalAnnualSavings > 0 ? 'text-[#252768]' : 'text-slate-300'}`}>
                            {summary.totalAnnualSavings > 0 ? formatRands(summary.totalAnnualSavings) : '—'}
                          </span>
                        </td>
                        <td className="px-4 py-4 text-right">
                          <span className="text-sm text-slate-500 font-medium">
                            {summary.roiMonths > 0 ? `${formatNum(summary.roiMonths, 1)} mo` : '—'}
                          </span>
                        </td>
                        <td className="px-4 py-4 text-center">
                          <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold ${
                            job.status === 'complete'
                              ? 'bg-[#252768]/10 text-[#252768]'
                              : 'bg-[#F2C519]/20 text-[#9a7a00]'
                          }`}>
                            {job.status === 'complete' ? 'Complete' : 'Draft'}
                          </span>
                        </td>
                        <td className="px-4 py-4">
                          <div className="w-8 h-8 rounded-lg bg-slate-100 group-hover:bg-[#252768] group-hover:text-white text-slate-400 flex items-center justify-center transition-all">
                            <ChevronRight size={14} />
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Mobile cards */}
              <div className="md:hidden divide-y divide-slate-100">
                {summaries.map(({ job, summary }) => (
                  <Link key={job.id} href={`/jobs/${job.id}`} className="flex items-center gap-3.5 px-4 py-4 hover:bg-slate-50 transition-colors">
                    <div className="w-11 h-11 bg-[#252768] rounded-xl flex items-center justify-center flex-shrink-0 shadow-sm">
                      <Zap size={16} className="text-[#F2C519]" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-bold text-sm text-[#1a1c4e] truncate">{job.clientName}</p>
                      <div className="flex items-center gap-2 text-xs text-slate-400 font-medium mt-0.5">
                        <Calendar size={11} />
                        <span>{job.date}</span>
                        <span>·</span>
                        <span>{job.rooms.length} rooms</span>
                      </div>
                    </div>
                    <div className="text-right flex-shrink-0">
                      {summary.totalAnnualSavings > 0 && (
                        <p className="text-sm font-bold text-[#252768]">{formatRands(summary.totalAnnualSavings)}</p>
                      )}
                      <span className={`text-xs px-2 py-0.5 rounded-full font-bold ${
                        job.status === 'complete' ? 'bg-[#252768]/10 text-[#252768]' : 'bg-[#F2C519]/20 text-[#9a7a00]'
                      }`}>
                        {job.status === 'complete' ? 'Complete' : 'Draft'}
                      </span>
                    </div>
                    <ChevronRight size={14} className="text-slate-300 flex-shrink-0" />
                  </Link>
                ))}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
