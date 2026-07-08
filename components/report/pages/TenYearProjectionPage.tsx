import React from 'react'
import { Page, View, Text } from '@react-pdf/renderer'
import { Job } from '@/lib/types'
import { formatRands, formatNum } from '@/lib/calculations'
import { colors, s } from '../theme'
import { PH, PF, SH } from '../chrome'
import { KPICard, ProjectionChart } from '../charts'
import { buildProjection } from '../finance'

export function TenYearProjectionPage({ job }: { job: Job }) {
  const { sum, yearly, cumulative, total10yr, roiMonths, breakEvenYr } = buildProjection(job)
  const eskom = job.eskomIncrease / 100

  function fr(n: number) { return formatRands(n) }

  return (
    <Page size="A4" style={{ ...s.page, ...s.contentPage }}>
      <PH client={job.clientName} />
      <SH title="10-Year Savings Projection" sub={`${job.clientName} · ${job.eskomIncrease}% annual Eskom escalation applied`} />

      <View style={{ flexDirection: 'row', gap: 8, marginBottom: 14 }}>
        <KPICard label="Year 1 Total Savings" value={fr(yearly[0])} />
        <KPICard label="Total 10-Year Savings" value={fr(total10yr)} />
        <KPICard label="Payback Period" value={roiMonths > 0 ? `${formatNum(roiMonths, 1)} months` : '—'} />
      </View>

      <View style={{ marginBottom: 12 }}>
        <Text style={{ fontSize: 6.5, color: colors.mid, marginBottom: 6 }}>
          Cumulative savings over 10 years, escalated at {job.eskomIncrease}% per annum · Investment: {fr(sum.totalProjectCost)}
        </Text>
        <ProjectionChart cumulative={cumulative} investment={sum.totalProjectCost} breakEvenYr={breakEvenYr} />
      </View>

      <View style={s.table}>
        <View style={s.tHead}>
          <Text style={{ ...s.cCh, flex: 0.5 }}>Yr</Text>
          <Text style={s.cRh}>Annual Energy Savings</Text>
          <Text style={s.cRh}>Annual Total Savings</Text>
          <Text style={s.cRh}>Cumulative Savings</Text>
          <Text style={s.cRh}>Position vs Investment</Text>
        </View>
        {yearly.map((yrTotal, i) => {
          const yrEnergy = sum.totalAnnualSavings * Math.pow(1 + eskom, i)
          const cum = cumulative[i]
          const position = cum - sum.totalProjectCost
          const Row = i % 2 === 0 ? s.tRow : s.tRowAlt
          return (
            <View key={i} style={Row} wrap={false}>
              <Text style={{ ...s.cC, flex: 0.5 }}>{i + 1}</Text>
              <Text style={s.cR}>{fr(yrEnergy)}</Text>
              <Text style={s.cBold}>{fr(yrTotal)}</Text>
              <Text style={s.cR}>{fr(cum)}</Text>
              <Text style={{ ...s.cR, color: position >= 0 ? colors.positive : colors.negative, fontFamily: 'Inter', fontWeight: position >= 0 ? 700 : 400 }}>
                {position >= 0 ? `+${fr(position)}` : fr(position)}
              </Text>
            </View>
          )
        })}
        <View style={s.tTot}>
          <Text style={{ ...s.cCt, flex: 0.5 }}>10yr</Text>
          <Text style={s.cRt}>{fr(yearly.reduce((a, b) => a + b, 0))}</Text>
          <Text style={s.cYt}>{fr(total10yr)}</Text>
          <Text style={s.cYt}>{fr(total10yr)}</Text>
          <Text style={s.cYt}>{fr(total10yr - sum.totalProjectCost)}</Text>
        </View>
      </View>

      <PF label="10-Year Projection" />
    </Page>
  )
}
