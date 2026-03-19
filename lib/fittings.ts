import { CurrentFitting, ProposedFitting } from './types'

export const CURRENT_FITTINGS: CurrentFitting[] = [
  { code: 'T8_1L_4FT_36W', label: '1 Lamp 4ft T8 Fixture 36W', watts: 36, lamps: 1 },
  { code: 'T8_2L_4FT_36W', label: '2 Lamp 4ft T8 Fixture 36W', watts: 36, lamps: 2 },
  { code: 'T8_3L_4FT_36W', label: '3 Lamp 4ft T8 Fixture 36W', watts: 36, lamps: 3 },
  { code: 'T8_4L_4FT_36W', label: '4 Lamp 4ft T8 Fixture 36W', watts: 36, lamps: 4 },
  { code: 'T5_2L_4FT_28W', label: '2 Lamp 4ft T5 Fixture 28W', watts: 28, lamps: 2 },
  { code: 'T5_3L_4FT_28W', label: '3 Lamp 4ft T5 Fixture 28W', watts: 28, lamps: 3 },
  { code: 'T5_4L_4FT_28W', label: '4 Lamp 4ft T5 Fixture 28W', watts: 28, lamps: 4 },
  { code: 'CFL_18W', label: 'CFL 18W', watts: 18, lamps: 1 },
  { code: 'CFL_26W', label: 'CFL 26W', watts: 26, lamps: 1 },
  { code: 'INC_100W', label: 'Incandescent 100W', watts: 100, lamps: 1 },
  { code: 'INC_150W', label: 'Incandescent 150W', watts: 150, lamps: 1 },
  { code: 'INC_300W', label: 'Incandescent 300W', watts: 300, lamps: 1 },
  { code: 'HPS_150W', label: 'Street Light HPS 150W', watts: 150, lamps: 1 },
  { code: 'HPS_250W', label: 'Street Light HPS 250W', watts: 250, lamps: 1 },
  { code: 'HPS_400W', label: 'Street Light HPS 400W', watts: 400, lamps: 1 },
  { code: 'HB_400W', label: 'High Bay 400W', watts: 400, lamps: 1 },
  { code: 'HB_250W', label: 'High Bay 250W', watts: 250, lamps: 1 },
  { code: 'FL_500W', label: 'Floodlight 500W Halogen', watts: 500, lamps: 1 },
]

export const PROPOSED_FITTINGS: ProposedFitting[] = [
  { code: 'LED_T8_4FT_18W', label: 'T8 4ft 18W LED Tube', watts: 18, unitCost: 450 },
  { code: 'LED_T5_4FT_20W', label: 'T5 4ft 20W LED Tube', watts: 20, unitCost: 480 },
  { code: 'LED_PANEL_18W', label: 'Recessed 18W LED Panel', watts: 18, unitCost: 650 },
  { code: 'LED_BULKHEAD_15W', label: 'LED Bulkhead 15W', watts: 15, unitCost: 380 },
  { code: 'LED_HIGHBAY_100W', label: '100W LED High Bay', watts: 100, unitCost: 2800 },
  { code: 'LED_HIGHBAY_200W', label: '200W LED High Bay', watts: 200, unitCost: 4200 },
  { code: 'LED_FLOOD_50W', label: '50W LED Floodlight', watts: 50, unitCost: 1200 },
  { code: 'LED_FLOOD_100W', label: '100W LED Floodlight', watts: 100, unitCost: 1800 },
  { code: 'LED_STREET_60W', label: '60W LED Street Light', watts: 60, unitCost: 2200 },
  { code: 'LED_STREET_100W', label: '100W LED Street Light', watts: 100, unitCost: 3200 },
  { code: 'LED_CFL_10W', label: '10W LED GU10 Replacement', watts: 10, unitCost: 220 },
]

export function getAutoProposedFitting(currentCode: string): string {
  if (currentCode.startsWith('T8_')) return 'LED_T8_4FT_18W'
  if (currentCode.startsWith('T5_')) return 'LED_T5_4FT_20W'
  if (currentCode.startsWith('CFL_')) return 'LED_CFL_10W'
  if (currentCode.startsWith('INC_')) return 'LED_PANEL_18W'
  if (currentCode === 'HPS_150W') return 'LED_STREET_60W'
  if (currentCode === 'HPS_250W' || currentCode === 'HPS_400W') return 'LED_STREET_100W'
  if (currentCode === 'HB_250W') return 'LED_HIGHBAY_100W'
  if (currentCode === 'HB_400W') return 'LED_HIGHBAY_200W'
  if (currentCode === 'FL_500W') return 'LED_FLOOD_50W'
  return 'LED_PANEL_18W'
}

export function getCurrentFitting(code: string): CurrentFitting | undefined {
  return CURRENT_FITTINGS.find(f => f.code === code)
}

export function getProposedFitting(code: string): ProposedFitting | undefined {
  return PROPOSED_FITTINGS.find(f => f.code === code)
}
