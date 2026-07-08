import React from 'react'
import { Page, View, Text } from '@react-pdf/renderer'
import { Job } from '@/lib/types'
import { calcJob, formatRands, formatNum } from '@/lib/calculations'
import { MAINT_RATE } from '@/lib/reportConstants'
import { colors, s } from '../theme'
import { PH, PF, SH } from '../chrome'

export function SolutionSummaryPage({ job }: { job: Job }) {
  const sum = calcJob(job)
  const eskom = job.eskomIncrease / 100
  const maintY1 = sum.totalCurrentCostPerYear * MAINT_RATE
  const maintY2 = maintY1 * (1 + eskom)
  const maintY3 = maintY2 * (1 + eskom)

  const curY1 = sum.totalCurrentCostPerYear
  const curY2 = curY1 * (1 + eskom)
  const curY3 = curY2 * (1 + eskom)
  const curTerm = curY1 + curY2 + curY3
  const curDay = curY1 / 365
  const curMonth = curY1 / 12

  const ledY1 = sum.totalProposedCostPerYear
  const ledY2 = ledY1 * (1 + eskom)
  const ledY3 = ledY2 * (1 + eskom)
  const ledTerm = ledY1 + ledY2 + ledY3
  const ledDay = ledY1 / 365
  const ledMonth = ledY1 / 12

  const savEnY1 = curY1 - ledY1
  const savEnY2 = curY2 - ledY2
  const savEnY3 = curY3 - ledY3
  const savEnTerm = savEnY1 + savEnY2 + savEnY3
  const savEnDay = savEnY1 / 365
  const savEnMonth = savEnY1 / 12

  const savTotY1 = savEnY1 + maintY1
  const savTotY2 = savEnY2 + maintY2
  const savTotY3 = savEnY3 + maintY3
  const savTotTerm = savTotY1 + savTotY2 + savTotY3
  const savTotDay = savTotY1 / 365
  const savTotMonth = savTotY1 / 12

  const savPctEn = curY1 > 0 ? ((savEnY1 / curY1) * 100).toFixed(1) : '0'
  const savPctTot = (curY1 + maintY1) > 0 ? ((savTotY1 / (curY1 + maintY1)) * 100).toFixed(1) : '0'

  function fr(n: number) { return formatRands(n) }

  return (
    <Page size="A4" style={{ ...s.page, ...s.contentPage }}>
      <PH client={job.clientName} />
      <SH title="Financial Summary" sub={`Solution Summary — ${job.clientName} · ${job.date}`} />
      <Text style={{ ...s.body, marginBottom: 8 }}>
        Below we demonstrate the savings on our offering compared against your present situation.
      </Text>

      <View style={s.solSection}>
        <Text style={s.solTitle}>COST OF CURRENT &apos;TRADITIONAL&apos; INSTALLATION OVER THE 3-YEAR TERM</Text>
        <View style={{ flexDirection: 'row' }}>
          <Text style={s.solHeadL}>Item</Text>
          <Text style={s.solHead}>Day</Text>
          <Text style={s.solHead}>Month</Text>
          <Text style={s.solHead}>Year 1</Text>
          <Text style={s.solHead}>Year 2</Text>
          <Text style={s.solHead}>Year 3</Text>
          <Text style={s.solHead}>3-Year Term</Text>
        </View>
        {[
          { label: 'Consumption in R\'s', d: curDay, m: curMonth, y1: curY1, y2: curY2, y3: curY3, t: curTerm },
          { label: 'Material Replacement (maint. saving)', d: maintY1 / 365, m: maintY1 / 12, y1: maintY1, y2: maintY2, y3: maintY3, t: maintY1 + maintY2 + maintY3 },
        ].map((row, i) => (
          <View key={i} style={i % 2 === 0 ? s.solRow : s.solRowAlt}>
            <Text style={s.solLabel}>{row.label}</Text>
            <Text style={s.solVal}>{fr(row.d)}</Text>
            <Text style={s.solVal}>{fr(row.m)}</Text>
            <Text style={s.solVal}>{fr(row.y1)}</Text>
            <Text style={s.solVal}>{fr(row.y2)}</Text>
            <Text style={s.solVal}>{fr(row.y3)}</Text>
            <Text style={s.solValB}>{fr(row.t)}</Text>
          </View>
        ))}
        <View style={s.solRowTot}>
          <Text style={s.solLabelB}>TOTAL</Text>
          <Text style={s.solValB}>{fr(curDay + maintY1 / 365)}</Text>
          <Text style={s.solValB}>{fr(curMonth + maintY1 / 12)}</Text>
          <Text style={s.solValB}>{fr(curY1 + maintY1)}</Text>
          <Text style={s.solValB}>{fr(curY2 + maintY2)}</Text>
          <Text style={s.solValB}>{fr(curY3 + maintY3)}</Text>
          <Text style={s.solValY}>{fr(curTerm + maintY1 + maintY2 + maintY3)}</Text>
        </View>
        <View style={{ flexDirection: 'row', marginTop: 2 }}>
          <Text style={{ ...s.solLabel, color: colors.mid }}>Consumption in kWh</Text>
          <Text style={{ ...s.solVal, color: colors.mid }}>{formatNum(sum.totalCurrentKwhPerYear / 365, 2)}</Text>
          <Text style={{ ...s.solVal, color: colors.mid }}>{formatNum(sum.totalCurrentKwhPerYear / 12, 0)}</Text>
          <Text style={{ ...s.solVal, color: colors.mid }}>{formatNum(sum.totalCurrentKwhPerYear, 0)}</Text>
          <Text style={{ ...s.solVal, color: colors.mid }}>{formatNum(sum.totalCurrentKwhPerYear, 0)}</Text>
          <Text style={{ ...s.solVal, color: colors.mid }}>{formatNum(sum.totalCurrentKwhPerYear, 0)}</Text>
          <Text style={{ ...s.solValB, color: colors.mid }}>{formatNum(sum.totalCurrentKwhPerYear * 3, 0)}</Text>
        </View>
      </View>

      <View style={s.solSection}>
        <Text style={s.solTitle}>COST OF LED OVER THE SAME TERM</Text>
        <View style={{ flexDirection: 'row' }}>
          <Text style={s.solHeadL}>Item</Text>
          <Text style={s.solHead}>Day</Text>
          <Text style={s.solHead}>Month</Text>
          <Text style={s.solHead}>Year 1</Text>
          <Text style={s.solHead}>Year 2</Text>
          <Text style={s.solHead}>Year 3</Text>
          <Text style={s.solHead}>3-Year Term</Text>
        </View>
        <View style={s.solRow}>
          <Text style={s.solLabel}>Consumption in R&apos;s</Text>
          <Text style={s.solVal}>{fr(ledDay)}</Text>
          <Text style={s.solVal}>{fr(ledMonth)}</Text>
          <Text style={s.solVal}>{fr(ledY1)}</Text>
          <Text style={s.solVal}>{fr(ledY2)}</Text>
          <Text style={s.solVal}>{fr(ledY3)}</Text>
          <Text style={s.solValB}>{fr(ledTerm)}</Text>
        </View>
        <View style={s.solRowAlt}>
          <Text style={s.solLabel}>Material Replacement</Text>
          <Text style={s.solVal}>R 0</Text>
          <Text style={s.solVal}>R 0</Text>
          <Text style={s.solVal}>R 0</Text>
          <Text style={s.solVal}>R 0</Text>
          <Text style={s.solVal}>R 0</Text>
          <Text style={s.solValB}>R 0</Text>
        </View>
        <View style={{ flexDirection: 'row', marginTop: 2 }}>
          <Text style={{ ...s.solLabel, color: colors.mid }}>Consumption in kWh</Text>
          <Text style={{ ...s.solVal, color: colors.mid }}>{formatNum(sum.totalProposedKwhPerYear / 365, 2)}</Text>
          <Text style={{ ...s.solVal, color: colors.mid }}>{formatNum(sum.totalProposedKwhPerYear / 12, 0)}</Text>
          <Text style={{ ...s.solVal, color: colors.mid }}>{formatNum(sum.totalProposedKwhPerYear, 0)}</Text>
          <Text style={{ ...s.solVal, color: colors.mid }}>{formatNum(sum.totalProposedKwhPerYear, 0)}</Text>
          <Text style={{ ...s.solVal, color: colors.mid }}>{formatNum(sum.totalProposedKwhPerYear, 0)}</Text>
          <Text style={{ ...s.solValB, color: colors.mid }}>{formatNum(sum.totalProposedKwhPerYear * 3, 0)}</Text>
        </View>
      </View>

      <View style={s.solSection}>
        <Text style={s.solTitle}>THE SAVINGS</Text>
        <View style={{ flexDirection: 'row' }}>
          <Text style={s.solHeadL}>Item</Text>
          <Text style={s.solHead}>Day</Text>
          <Text style={s.solHead}>Month</Text>
          <Text style={s.solHead}>Year 1</Text>
          <Text style={s.solHead}>Year 2</Text>
          <Text style={s.solHead}>Year 3</Text>
          <Text style={s.solHead}>3-Year Term</Text>
        </View>
        {[
          { label: 'Consumption in R\'s', d: savEnDay, m: savEnMonth, y1: savEnY1, y2: savEnY2, y3: savEnY3, t: savEnTerm },
          { label: 'Material Replacement', d: maintY1 / 365, m: maintY1 / 12, y1: maintY1, y2: maintY2, y3: maintY3, t: maintY1 + maintY2 + maintY3 },
        ].map((row, i) => (
          <View key={i} style={i % 2 === 0 ? s.solRow : s.solRowAlt}>
            <Text style={s.solLabel}>{row.label}</Text>
            <Text style={s.solVal}>{fr(row.d)}</Text>
            <Text style={s.solVal}>{fr(row.m)}</Text>
            <Text style={s.solVal}>{fr(row.y1)}</Text>
            <Text style={s.solVal}>{fr(row.y2)}</Text>
            <Text style={s.solVal}>{fr(row.y3)}</Text>
            <Text style={s.solValB}>{fr(row.t)}</Text>
          </View>
        ))}
        <View style={s.solRowTot}>
          <Text style={s.solLabelB}>ANTICIPATED SAVINGS IN R&apos;s ({savPctTot}% total / {savPctEn}% energy)</Text>
          <Text style={s.solValY}>{fr(savTotDay)}</Text>
          <Text style={s.solValY}>{fr(savTotMonth)}</Text>
          <Text style={s.solValY}>{fr(savTotY1)}</Text>
          <Text style={s.solValY}>{fr(savTotY2)}</Text>
          <Text style={s.solValY}>{fr(savTotY3)}</Text>
          <Text style={s.solValY}>{fr(savTotTerm)}</Text>
        </View>
      </View>

      <PF label="Financial Summary" />
    </Page>
  )
}
