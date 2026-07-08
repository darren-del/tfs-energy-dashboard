import React from 'react'
import { Page, View, Text } from '@react-pdf/renderer'
import { Job } from '@/lib/types'
import { formatRands, formatNum } from '@/lib/calculations'
import { colors, s } from '../theme'
import { PH, PF, SH } from '../chrome'
import { KPICard, DonutGauge, PaybackTimeline, ComparisonBars } from '../charts'
import { buildProjection } from '../finance'

export function ExecutiveSummaryPage({ job }: { job: Job }) {
  const { sum, yearly, total4yr, total10yr, savingsPct, roiMonths, totalSavingsY1 } = buildProjection(job)
  const eskom = job.eskomIncrease / 100
  const eskomLast5 = ((Math.pow(1 + eskom, 5) - 1) * 100).toFixed(1)
  const savingsY1AfterCost = totalSavingsY1 - sum.totalProjectCost

  const detailRows: { label: string; value: string; yellow?: boolean }[] = [
    { label: 'Actual Cost of Electricity per kWh', value: `R ${job.costPerKwh.toFixed(4)}` },
    { label: 'Current Annual Cost of Lighting Electricity', value: formatRands(sum.totalCurrentCostPerYear) },
    { label: 'Retrofit New Annual Cost of Electricity', value: formatRands(sum.totalProposedCostPerYear) },
    { label: 'Rand Savings (Energy Only)', value: formatRands(sum.totalAnnualSavings), yellow: true },
    { label: 'Cost of Retrofit', value: formatRands(sum.totalProjectCost) },
    { label: 'Savings Year 1 After Retrofit Costs', value: formatRands(savingsY1AfterCost), yellow: savingsY1AfterCost > 0 },
    { label: 'Eskom Annual Increase % Used', value: `${job.eskomIncrease}%` },
    { label: 'Eskom Increases Compounded over 5 Years', value: `${eskomLast5}%` },
    { label: 'Savings Year 2', value: formatRands(yearly[1]) },
    { label: 'Savings Year 3', value: formatRands(yearly[2]) },
    { label: 'Savings Year 4', value: formatRands(yearly[3]) },
    { label: 'Total Savings Over 4 Years', value: formatRands(total4yr), yellow: true },
    { label: 'Savings Year 5', value: formatRands(yearly[4]) },
    { label: 'Savings Year 10', value: formatRands(yearly[9]) },
    { label: 'Total Savings Over 10 Years', value: formatRands(total10yr), yellow: true },
  ]

  return (
    <Page size="A4" style={{ ...s.page, ...s.contentPage }}>
      <PH client={job.clientName} />
      <SH title="Executive Summary" sub={`${job.clientName} · ${job.date}`} />

      {/* KPI row */}
      <View style={{ flexDirection: 'row', gap: 8, marginBottom: 14 }}>
        <KPICard label="Annual Savings Yr 1" value={formatRands(totalSavingsY1)} tone="accent" />
        <KPICard label="% Energy Saved" value={`${savingsPct.toFixed(0)}%`} tone="light" />
        <KPICard label="Investment" value={formatRands(sum.totalProjectCost)} tone="light" />
        <KPICard label="Payback" value={roiMonths > 0 ? `${formatNum(roiMonths, 1)} mo` : '—'} tone="navy" />
      </View>

      {/* Hero band: donut + payback timeline */}
      <View style={{ flexDirection: 'row', gap: 20, marginBottom: 16, alignItems: 'center' }}>
        <DonutGauge pct={savingsPct} sublabel="of lighting energy cost saved" />
        <View style={{ flex: 1 }}>
          <Text style={{ fontSize: 7.5, fontFamily: 'Inter', fontWeight: 600, color: colors.navy, marginBottom: 2 }}>
            Return on Investment
          </Text>
          <Text style={{ fontSize: 6.5, color: colors.inkSoft }}>
            Savings Year 1 after retrofit cost: {formatRands(savingsY1AfterCost)}
          </Text>
          <PaybackTimeline months={roiMonths} width={300} />
        </View>
      </View>

      {/* Detail grid — two columns */}
      <View style={{ flexDirection: 'row', gap: 24, marginBottom: 16 }}>
        <View style={{ flex: 1 }}>
          {detailRows.filter((_, i) => i % 2 === 0).map((r, i) => (
            <View key={i} style={s.execRow}>
              <Text style={s.execLabel}>{r.label}</Text>
              <Text style={r.yellow ? s.execValueYellow : s.execValue}>{r.value}</Text>
            </View>
          ))}
        </View>
        <View style={{ flex: 1 }}>
          {detailRows.filter((_, i) => i % 2 === 1).map((r, i) => (
            <View key={i} style={s.execRow}>
              <Text style={s.execLabel}>{r.label}</Text>
              <Text style={r.yellow ? s.execValueYellow : s.execValue}>{r.value}</Text>
            </View>
          ))}
        </View>
      </View>

      {/* Comparison band */}
      <ComparisonBars panels={[
        { title: 'Energy consumption (kWh/yr)', current: sum.totalCurrentKwhPerYear, proposed: sum.totalProposedKwhPerYear, format: n => formatNum(n, 0) },
        { title: 'Electricity cost (R/yr)', current: sum.totalCurrentCostPerYear, proposed: sum.totalProposedCostPerYear, format: formatRands },
      ]} />

      <Text style={{ ...s.body, color: colors.mid, marginTop: 10, fontSize: 7 }}>
        Please note: This report is the intellectual property of TFS Energy and should not be distributed without permission.
      </Text>
      <PF label="Executive Summary" />
    </Page>
  )
}
