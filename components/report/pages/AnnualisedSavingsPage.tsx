import React from 'react'
import { Page, View, Text } from '@react-pdf/renderer'
import { Job } from '@/lib/types'
import { calcJob, formatRands, formatNum } from '@/lib/calculations'
import { MAINT_RATE } from '@/lib/reportConstants'
import { s } from '../theme'
import { PH, PF, SH } from '../chrome'

export function AnnualisedSavingsPage({ job }: { job: Job }) {
  const sum = calcJob(job)
  const eskom = job.eskomIncrease / 100

  const maintY1 = sum.totalCurrentCostPerYear * MAINT_RATE
  const energyY1 = sum.totalAnnualSavings
  const totalY1 = energyY1 + maintY1

  const curCostY1 = sum.totalCurrentCostPerYear
  const curCostY2 = curCostY1 * (1 + eskom)
  const curCostY3 = curCostY2 * (1 + eskom)
  const curCostY4 = curCostY3 * (1 + eskom)

  const ledCostY1 = sum.totalProposedCostPerYear
  const ledCostY2 = ledCostY1 * (1 + eskom)
  const ledCostY3 = ledCostY2 * (1 + eskom)
  const ledCostY4 = ledCostY3 * (1 + eskom)

  const enSavY1 = curCostY1 - ledCostY1
  const enSavY2 = curCostY2 - ledCostY2
  const enSavY3 = curCostY3 - ledCostY3
  const enSavY4 = curCostY4 - ledCostY4

  const maintY2 = maintY1 * (1 + eskom)
  const maintY3 = maintY2 * (1 + eskom)
  const maintY4 = maintY3 * (1 + eskom)

  const totSavY1 = enSavY1 + maintY1
  const totSavY2 = enSavY2 + maintY2
  const totSavY3 = enSavY3 + maintY3
  const totSavY4 = enSavY4 + maintY4

  const cumY1 = totSavY1 - sum.totalProjectCost
  const cumY2 = cumY1 + totSavY2
  const cumY3 = cumY2 + totSavY3
  const cumY4 = cumY3 + totSavY4

  const roiMonths = totSavY1 > 0 ? sum.totalProjectCost / (totSavY1 / 12) : 0
  const monthSavY1Y2 = (totSavY1 + totSavY2) / 24

  function fr(n: number) { return formatRands(n) }
  function row(label: string, y1: number, y2: number, y3: number, y4: number, tot: number, bold?: boolean, yellow?: boolean) {
    const st = bold ? { ...s.solLabel, fontFamily: 'Inter' as const, fontWeight: 700 as const } : s.solLabel
    const vst = yellow ? s.solValY : bold ? s.solValB : s.solVal
    return (
      <View style={s.solRow}>
        <Text style={st}>{label}</Text>
        <Text style={vst}>{fr(y1)}</Text>
        <Text style={vst}>{fr(y2)}</Text>
        <Text style={vst}>{fr(y3)}</Text>
        <Text style={vst}>{fr(y4)}</Text>
        <Text style={vst}>{fr(tot)}</Text>
      </View>
    )
  }

  return (
    <Page size="A4" style={{ ...s.page, ...s.contentPage }}>
      <PH client={job.clientName} />
      <SH title="Annualised Savings Model — ROI Time Frame" sub={`${job.clientName} · ${job.date}`} />

      <View style={s.solSection}>
        <View style={{ flexDirection: 'row' }}>
          <Text style={s.solHeadL}>Description</Text>
          <Text style={s.solHead}>Year 1</Text>
          <Text style={s.solHead}>Year 2</Text>
          <Text style={s.solHead}>Year 3</Text>
          <Text style={s.solHead}>Year 4</Text>
          <Text style={s.solHead}>Totals</Text>
        </View>
        {row('Cost of Lighting Electricity (Current)', curCostY1, curCostY2, curCostY3, curCostY4, curCostY1 + curCostY2 + curCostY3 + curCostY4)}
        {row('Cost of Lighting Electricity (LED)', ledCostY1, ledCostY2, ledCostY3, ledCostY4, ledCostY1 + ledCostY2 + ledCostY3 + ledCostY4)}
        {row('Energy Savings', enSavY1, enSavY2, enSavY3, enSavY4, enSavY1 + enSavY2 + enSavY3 + enSavY4, true)}
        {row('Savings — Non-Cost Replacement & Maintenance', maintY1, maintY2, maintY3, maintY4, maintY1 + maintY2 + maintY3 + maintY4)}
        <View style={s.solRowTot}>
          <Text style={s.solLabelB}>Total Savings</Text>
          <Text style={s.solValY}>{fr(totSavY1)}</Text>
          <Text style={s.solValY}>{fr(totSavY2)}</Text>
          <Text style={s.solValY}>{fr(totSavY3)}</Text>
          <Text style={s.solValY}>{fr(totSavY4)}</Text>
          <Text style={s.solValY}>{fr(totSavY1 + totSavY2 + totSavY3 + totSavY4)}</Text>
        </View>
      </View>

      <View style={{ ...s.solSection, marginTop: 8 }}>
        <View style={{ flexDirection: 'row' }}>
          <Text style={s.solHeadL}>ROI Summary</Text>
          <Text style={s.solHead}>Year 1</Text>
          <Text style={s.solHead}>Year 2</Text>
          <Text style={s.solHead}>Year 3</Text>
          <Text style={s.solHead}>Year 4</Text>
          <Text style={s.solHead} />
        </View>
        <View style={s.solRow}>
          <Text style={s.solLabel}>Total Initial Cost</Text>
          <Text style={s.solValB}>{fr(sum.totalProjectCost)}</Text>
          <Text style={s.solVal} />
          <Text style={s.solVal} />
          <Text style={s.solVal} />
          <Text style={s.solVal} />
        </View>
        <View style={s.solRowAlt}>
          <Text style={s.solLabel}>Deficit from Previous Year</Text>
          <Text style={s.solVal}>R 0</Text>
          <Text style={s.solVal}>{fr(Math.max(0, -cumY1))}</Text>
          <Text style={s.solVal}>{fr(Math.max(0, -cumY2))}</Text>
          <Text style={s.solVal}>{fr(Math.max(0, -cumY3))}</Text>
          <Text style={s.solVal} />
        </View>
        <View style={s.solRowTot}>
          <Text style={s.solLabelB}>TOTAL CUMULATIVE SAVING</Text>
          <Text style={s.solValY}>{fr(cumY1)}</Text>
          <Text style={s.solValY}>{fr(Math.max(cumY1, cumY2))}</Text>
          <Text style={s.solValY}>{fr(Math.max(cumY2, cumY3))}</Text>
          <Text style={s.solValY}>{fr(Math.max(cumY3, cumY4))}</Text>
          <Text style={s.solVal} />
        </View>
        <View style={{ ...s.solRow, marginTop: 6 }}>
          <Text style={s.solLabel}>Annual Savings (incl. maintenance)</Text>
          <Text style={s.solValB}>{fr(totSavY1)}</Text>
          <Text style={s.solValB}>{fr(totSavY2)}</Text>
          <Text style={s.solValB}>{fr(totSavY3)}</Text>
          <Text style={s.solValB}>{fr(totSavY4)}</Text>
          <Text style={s.solVal} />
        </View>
        <View style={s.solRowAlt}>
          <Text style={s.solLabel}>Monthly Savings</Text>
          <Text style={s.solVal}>{fr(totSavY1 / 12)}</Text>
          <Text style={s.solVal}>{fr(totSavY2 / 12)}</Text>
          <Text style={s.solVal}>{fr(totSavY3 / 12)}</Text>
          <Text style={s.solVal}>{fr(totSavY4 / 12)}</Text>
          <Text style={s.solVal} />
        </View>
        <View style={s.solRow}>
          <Text style={{ ...s.solLabel, fontFamily: 'Inter', fontWeight: 700 }}>Payback ROI in Months</Text>
          <Text style={{ ...s.solValY, flex: 2 }}>{roiMonths > 0 ? formatNum(roiMonths, 2) : '—'}</Text>
          <Text style={s.solVal} />
          <Text style={s.solVal} />
          <Text style={s.solVal} />
        </View>
        <View style={s.solRowAlt}>
          <Text style={s.solLabel}>Initial Investment</Text>
          <Text style={{ ...s.solValB, flex: 2 }}>{fr(sum.totalProjectCost)}</Text>
          <Text style={s.solVal} />
          <Text style={s.solVal} />
          <Text style={s.solVal} />
        </View>
        <View style={s.solRow}>
          <Text style={s.solLabel}>Annual Cash Flows (energy savings only)</Text>
          <Text style={{ ...s.solValB, flex: 2 }}>{fr(enSavY1)}</Text>
          <Text style={s.solVal} />
          <Text style={s.solVal} />
          <Text style={s.solVal} />
        </View>
        <View style={s.solRowAlt}>
          <Text style={s.solLabel}>Monthly Savings (average Yr 1–2)</Text>
          <Text style={{ ...s.solValB, flex: 2 }}>{fr(monthSavY1Y2)}</Text>
          <Text style={s.solVal} />
          <Text style={s.solVal} />
          <Text style={s.solVal} />
        </View>
      </View>

      <PF label="Savings Model" />
    </Page>
  )
}
