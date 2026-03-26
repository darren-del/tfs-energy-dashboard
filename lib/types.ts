export interface Job {
  id: string
  clientName: string
  contactPerson: string
  siteAddress: string
  date: string
  vatNumber: string
  contactNumber: string
  email: string
  costPerKwh: number
  eskomIncrease: number
  defaultBallastWatt: number
  installPerFitting: number
  disposalPerFitting: number
  rooms: Room[]
  aircons: { btu9000: number; btu12000: number; btu18000: number; btu24000: number }
  createdAt: string
  status: 'draft' | 'complete'
}

export interface Room {
  id: string
  areaDescription: string
  floor: string
  currentFittingCode: string
  quantity: number
  hoursPerDay: number
  sufficientLighting: boolean
  ballastWattOverride?: number
  proposedFittingCode: string
  comments: string
}

export interface CurrentFitting {
  code: string
  label: string
  watts: number
  lamps: number
}

export interface ProposedFitting {
  code: string
  label: string
  watts: number
  unitCost: number
}

export interface RoomCalculation {
  currentKwhPerDay: number
  currentKwhPerYear: number
  currentCostPerYear: number
  proposedKwhPerDay: number
  proposedKwhPerYear: number
  proposedCostPerYear: number
  annualSavingsRands: number
  energySavingsKwhPerYear: number
  unitCost: number
  installCost: number
  disposalCost: number
  totalRoomCost: number
  co2ReductionTons: number
}

export interface JobSummary {
  totalCurrentCostPerYear: number
  totalProposedCostPerYear: number
  totalAnnualSavings: number
  totalProjectCost: number
  roiMonths: number
  totalCo2Reduction: number
  totalCurrentKwhPerYear: number
  totalProposedKwhPerYear: number
  year1Savings: number
  year2Savings: number
  year3Savings: number
  year4Savings: number
  cumulativeSavings4yr: number
}
