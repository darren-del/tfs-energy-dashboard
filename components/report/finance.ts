import { Job } from '@/lib/types'
import { calcJob } from '@/lib/calculations'
import { MAINT_RATE } from '@/lib/reportConstants'

export function calcIRR(cashFlows: number[]): number {
  let lo = -0.99, hi = 50.0
  for (let i = 0; i < 300; i++) {
    const mid = (lo + hi) / 2
    const npvAtMid = cashFlows.reduce((sum, cf, n) => sum + cf / Math.pow(1 + mid, n), 0)
    if (Math.abs(npvAtMid) < 0.01) return mid
    npvAtMid > 0 ? (lo = mid) : (hi = mid)
  }
  return (lo + hi) / 2
}

export function npv(rate: number, flows: number[]): number {
  return flows.reduce((sum, cf, n) => sum + cf / Math.pow(1 + rate, n), 0)
}

// Current amp draw per fitting: (lampW × lamps + ballastW) / 253
export function currentAmpPerFitting(watts: number, lamps: number, ballast: number): number {
  return (watts * lamps + ballast) / 253
}
// Proposed amp draw per fitting (LED, no ballast): watts / 220
export function proposedAmpPerFitting(watts: number): number {
  return watts / 220
}

export interface Projection {
  sum: ReturnType<typeof calcJob>
  maintY1: number
  totalSavingsY1: number
  yearly: number[]      // 10 entries — total savings per year, Eskom-escalated
  cumulative: number[]  // 10 entries — running cumulative savings
  total4yr: number
  total10yr: number
  savingsPct: number    // energy-only % of current cost
  roiMonths: number
  breakEvenYr: number    // 1-indexed year cumulative savings first covers project cost; 0 if never
}

// Centralizes the 10-year escalation math that was previously duplicated in
// ExecutiveSummaryPage and TenYearProjectionPage.
export function buildProjection(job: Job): Projection {
  const sum = calcJob(job)
  const eskom = job.eskomIncrease / 100
  const maintY1 = sum.totalCurrentCostPerYear * MAINT_RATE
  const totalSavingsY1 = sum.totalAnnualSavings + maintY1

  const yearly = Array.from({ length: 10 }, (_, i) => totalSavingsY1 * Math.pow(1 + eskom, i))
  const cumulative: number[] = []
  yearly.forEach((y, i) => cumulative.push((cumulative[i - 1] ?? 0) + y))

  const total10yr = cumulative[9]
  const total4yr = yearly.slice(0, 4).reduce((a, b) => a + b, 0)
  const savingsPct = sum.totalCurrentCostPerYear > 0 ? (sum.totalAnnualSavings / sum.totalCurrentCostPerYear) * 100 : 0
  const roiMonths = totalSavingsY1 > 0 ? sum.totalProjectCost / (totalSavingsY1 / 12) : 0
  const breakEvenYr = cumulative.findIndex(c => c >= sum.totalProjectCost) + 1

  return { sum, maintY1, totalSavingsY1, yearly, cumulative, total4yr, total10yr, savingsPct, roiMonths, breakEvenYr }
}
