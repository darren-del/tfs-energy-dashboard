import React from 'react'
import { Page, View, Text } from '@react-pdf/renderer'
import { Job } from '@/lib/types'
import { calcJob, formatRands, formatNum } from '@/lib/calculations'
import { CARBON_TAX_RATE, GRID_CO2_T_PER_KWH, CAR_TCO2_PER_YEAR, TREE_SEEDLING_TCO2_10YR, KM_TCO2_PER_KM } from '@/lib/reportConstants'
import { colors, s } from '../theme'
import { PH, PF, SH } from '../chrome'
import { ComparisonBars, EquivalencyTile } from '../charts'

export function CarbonTaxPage({ job }: { job: Job }) {
  const sum = calcJob(job)

  const curCo2 = sum.totalCurrentKwhPerYear * GRID_CO2_T_PER_KWH
  const ledCo2 = sum.totalProposedKwhPerYear * GRID_CO2_T_PER_KWH
  const savCo2 = curCo2 - ledCo2
  const curTax = curCo2 * CARBON_TAX_RATE
  const ledTax = ledCo2 * CARBON_TAX_RATE
  const savTax = savCo2 * CARBON_TAX_RATE

  const treeCount = Math.round(savCo2 / TREE_SEEDLING_TCO2_10YR)
  const carCount = Math.round(savCo2 / CAR_TCO2_PER_YEAR)
  const kmCount = Math.round(savCo2 / KM_TCO2_PER_KM)

  return (
    <Page size="A4" style={{ ...s.page, ...s.contentPage }}>
      <PH client={job.clientName} />
      <SH title="Carbon Tax Estimate — Lighting Only" sub="Still in discussion — indicative figures only" />

      <View style={{ backgroundColor: colors.light, borderLeft: `3 solid ${colors.yellow}`, borderRadius: 4, padding: '12 16', marginBottom: 14 }}>
        <Text style={{ fontSize: 6.5, fontFamily: 'Inter', fontWeight: 600, color: colors.mid, letterSpacing: 0.6, marginBottom: 4, textTransform: 'uppercase' }}>
          Annual carbon reduction
        </Text>
        <Text style={{ fontSize: 22, fontFamily: 'Inter', fontWeight: 800, color: colors.navy }}>
          {formatNum(savCo2, 2)} tonnes CO₂e avoided every year
        </Text>
      </View>

      <View style={{ marginBottom: 14 }}>
        <ComparisonBars panels={[
          { title: 'Annual CO₂e emissions (tonnes/yr)', current: curCo2, proposed: ledCo2, format: n => formatNum(n, 1) },
        ]} />
      </View>

      <View style={{ flexDirection: 'row', gap: 10, marginBottom: 14 }}>
        <EquivalencyTile icon="tree" value={`${formatNum(treeCount, 0)}`} label="tree seedlings grown 10 years" />
        <EquivalencyTile icon="car" value={`${formatNum(carCount, 0)}`} label="cars taken off the road for a year" />
        <EquivalencyTile icon="road" value={`${formatNum(kmCount, 0)} km`} label="of driving avoided" />
      </View>
      <Text style={{ fontSize: 6.5, color: colors.mid, marginBottom: 12 }}>
        Equivalencies per US EPA GHG Equivalencies Calculator; indicative only.
      </Text>

      <Text style={s.body}>
        The initial marginal carbon tax rate will be R{CARBON_TAX_RATE} per tonne of CO₂e (carbon dioxide equivalent). Electricity carbon
        tonnes are based on every 1,000 kWh equating to {(GRID_CO2_T_PER_KWH * 1000).toFixed(4)} CO₂ tonnes.
      </Text>

      <View style={s.table}>
        <View style={s.tHead}>
          <Text style={s.cLh}>Scenario</Text>
          <Text style={s.cRh}>Annual kWh</Text>
          <Text style={s.cRh}>CO₂ Tax per Tonne</Text>
          <Text style={s.cRh}>Carbon Emission Tonnes</Text>
          <Text style={s.cRh}>Carbon Emission Tax Payable</Text>
        </View>
        {[
          { label: 'Current Electricity Usage', kwh: sum.totalCurrentKwhPerYear, co2: curCo2, tax: curTax },
          { label: 'Electricity After Recommended Changes', kwh: sum.totalProposedKwhPerYear, co2: ledCo2, tax: ledTax },
          { label: 'Savings Achieved', kwh: sum.totalCurrentKwhPerYear - sum.totalProposedKwhPerYear, co2: savCo2, tax: savTax },
        ].map((row, i) => {
          const Row = i % 2 === 0 ? s.tRow : s.tRowAlt
          return (
            <View key={i} style={Row}>
              <Text style={s.cL}>{row.label}</Text>
              <Text style={s.cR}>{formatNum(row.kwh, 2)}</Text>
              <Text style={s.cR}>R {CARBON_TAX_RATE}.00</Text>
              <Text style={s.cR}>{formatNum(row.co2, 2)}</Text>
              <Text style={i === 2 ? s.cBold : s.cR}>{formatRands(row.tax)}</Text>
            </View>
          )
        })}
      </View>

      <PF label="Carbon Tax" />
    </Page>
  )
}
