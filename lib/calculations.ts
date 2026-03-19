import { Job, Room, RoomCalculation, JobSummary } from './types'
import { getCurrentFitting, getProposedFitting } from './fittings'

export function calcRoom(room: Room, job: Job): RoomCalculation {
  const currentFitting = getCurrentFitting(room.currentFittingCode)
  const proposedFitting = getProposedFitting(room.proposedFittingCode)

  if (!currentFitting || !proposedFitting) {
    return {
      currentKwhPerDay: 0, currentKwhPerYear: 0, currentCostPerYear: 0,
      proposedKwhPerDay: 0, proposedKwhPerYear: 0, proposedCostPerYear: 0,
      annualSavingsRands: 0, energySavingsKwhPerYear: 0,
      unitCost: 0, installCost: 0, disposalCost: 0, totalRoomCost: 0,
      co2ReductionTons: 0,
    }
  }

  const ballastWatt = room.ballastWattOverride ?? job.defaultBallastWatt
  const totalCurrentWatts = (currentFitting.watts * currentFitting.lamps + ballastWatt) * room.quantity
  const currentKwhPerDay = (totalCurrentWatts * room.hoursPerDay) / 1000
  const currentKwhPerYear = currentKwhPerDay * 365

  const totalProposedWatts = proposedFitting.watts * room.quantity
  const proposedKwhPerDay = (totalProposedWatts * room.hoursPerDay) / 1000
  const proposedKwhPerYear = proposedKwhPerDay * 365

  const energySavingsKwhPerYear = currentKwhPerYear - proposedKwhPerYear

  const currentCostPerYear = currentKwhPerYear * job.costPerKwh * 12
  const proposedCostPerYear = proposedKwhPerYear * job.costPerKwh * 12
  const annualSavingsRands = currentCostPerYear - proposedCostPerYear

  const unitCost = proposedFitting.unitCost * room.quantity
  const installCost = job.installPerFitting * room.quantity
  const disposalCost = job.disposalPerFitting * room.quantity
  const totalRoomCost = unitCost + installCost + disposalCost

  const co2ReductionTons = (energySavingsKwhPerYear * 0.00095)

  return {
    currentKwhPerDay,
    currentKwhPerYear,
    currentCostPerYear,
    proposedKwhPerDay,
    proposedKwhPerYear,
    proposedCostPerYear,
    annualSavingsRands,
    energySavingsKwhPerYear,
    unitCost,
    installCost,
    disposalCost,
    totalRoomCost,
    co2ReductionTons,
  }
}

export function calcJob(job: Job): JobSummary {
  const roomCalcs = job.rooms.map(r => calcRoom(r, job))

  const totalCurrentCostPerYear = roomCalcs.reduce((s, r) => s + r.currentCostPerYear, 0)
  const totalProposedCostPerYear = roomCalcs.reduce((s, r) => s + r.proposedCostPerYear, 0)
  const totalAnnualSavings = roomCalcs.reduce((s, r) => s + r.annualSavingsRands, 0)
  const totalProjectCost = roomCalcs.reduce((s, r) => s + r.totalRoomCost, 0)
  const totalCurrentKwhPerYear = roomCalcs.reduce((s, r) => s + r.currentKwhPerYear, 0)
  const totalProposedKwhPerYear = roomCalcs.reduce((s, r) => s + r.proposedKwhPerYear, 0)
  const totalCo2Reduction = roomCalcs.reduce((s, r) => s + r.co2ReductionTons, 0)

  const roiMonths = totalAnnualSavings > 0 ? (totalProjectCost / (totalAnnualSavings / 12)) : 0

  const eskom = job.eskomIncrease / 100
  const year1Savings = totalAnnualSavings
  const year2Savings = year1Savings * (1 + eskom)
  const year3Savings = year2Savings * (1 + eskom)
  const year4Savings = year3Savings * (1 + eskom)
  const cumulativeSavings4yr = year1Savings + year2Savings + year3Savings + year4Savings

  return {
    totalCurrentCostPerYear,
    totalProposedCostPerYear,
    totalAnnualSavings,
    totalProjectCost,
    roiMonths,
    totalCo2Reduction,
    totalCurrentKwhPerYear,
    totalProposedKwhPerYear,
    year1Savings,
    year2Savings,
    year3Savings,
    year4Savings,
    cumulativeSavings4yr,
  }
}

export function formatRands(val: number): string {
  return 'R ' + Math.round(val).toLocaleString('en-ZA')
}

export function formatNum(val: number, decimals = 0): string {
  return val.toLocaleString('en-ZA', { minimumFractionDigits: decimals, maximumFractionDigits: decimals })
}
