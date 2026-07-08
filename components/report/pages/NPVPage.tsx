import React from 'react'
import { Page, View, Text } from '@react-pdf/renderer'
import { Job } from '@/lib/types'
import { calcJob, formatRands } from '@/lib/calculations'
import { MAINT_RATE, NPV_RATE } from '@/lib/reportConstants'
import { colors, s } from '../theme'
import { PH, PF, SH } from '../chrome'
import { KPICard } from '../charts'
import { npv, calcIRR } from '../finance'

export function NPVPage({ job }: { job: Job }) {
  const sum = calcJob(job)
  const eskom = job.eskomIncrease / 100
  const maintY1 = sum.totalCurrentCostPerYear * MAINT_RATE

  const enSavY1 = sum.totalAnnualSavings
  const enSavY2 = enSavY1 * (1 + eskom)
  const enSavY3 = enSavY2 * (1 + eskom)
  const maintY2 = maintY1 * (1 + eskom)
  const maintY3 = maintY2 * (1 + eskom)
  const cfY1 = enSavY1 + maintY1
  const cfY2 = enSavY2 + maintY2
  const cfY3 = enSavY3 + maintY3

  const cashFlows = [-sum.totalProjectCost, cfY1, cfY2, cfY3]
  const npvVal = npv(NPV_RATE, cashFlows)
  const irrVal = calcIRR(cashFlows)

  function fr(n: number) { return formatRands(n) }

  return (
    <Page size="A4" style={{ ...s.page, ...s.contentPage }}>
      <PH client={job.clientName} />
      <SH title="Net Present Value & Internal Rate of Return" sub={`${job.clientName} · Date: ${job.date}`} />

      <View style={{ flexDirection: 'row', gap: 8, marginBottom: 14 }}>
        <KPICard label="Discount Rate" value={`${(NPV_RATE * 100).toFixed(0)}%`} tone="light" />
        <KPICard label="Net Present Value (NPV)" value={fr(npvVal)} />
        <KPICard label="Internal Rate of Return (IRR)" value={`${(irrVal * 100).toFixed(1)}%`} />
      </View>

      <View style={s.table}>
        <View style={s.tHead}>
          <Text style={s.cLh}>Description</Text>
          <Text style={s.cRh}>Year 0</Text>
          <Text style={s.cRh}>Year 1</Text>
          <Text style={s.cRh}>Year 2</Text>
          <Text style={s.cRh}>Year 3</Text>
        </View>
        {[
          { label: 'Initial Outlay', y0: -sum.totalProjectCost, y1: 0, y2: 0, y3: 0 },
          { label: 'Electricity Savings', y0: 0, y1: enSavY1, y2: enSavY2, y3: enSavY3 },
          { label: 'Maintenance Savings', y0: 0, y1: maintY1, y2: maintY2, y3: maintY3 },
        ].map((row, i) => {
          const Row = i % 2 === 0 ? s.tRow : s.tRowAlt
          return (
            <View key={i} style={Row}>
              <Text style={s.cL}>{row.label}</Text>
              <Text style={{ ...s.cR, color: row.y0 < 0 ? colors.negative : colors.ink }}>{row.y0 !== 0 ? fr(row.y0) : '—'}</Text>
              <Text style={s.cR}>{row.y1 !== 0 ? fr(row.y1) : '—'}</Text>
              <Text style={s.cR}>{row.y2 !== 0 ? fr(row.y2) : '—'}</Text>
              <Text style={s.cR}>{row.y3 !== 0 ? fr(row.y3) : '—'}</Text>
            </View>
          )
        })}
        <View style={s.tTot}>
          <Text style={s.cLt}>Cash Flows</Text>
          <Text style={{ ...s.cYt, color: '#ff9999' }}>{fr(-sum.totalProjectCost)}</Text>
          <Text style={s.cYt}>{fr(cfY1)}</Text>
          <Text style={s.cYt}>{fr(cfY2)}</Text>
          <Text style={s.cYt}>{fr(cfY3)}</Text>
        </View>
      </View>

      <View style={{ backgroundColor: colors.light, borderRadius: 4, padding: '10 14', marginTop: 8 }}>
        <Text style={{ ...s.body, marginBottom: 0 }}>
          A positive NPV of {fr(npvVal)} confirms the project creates value at a {(NPV_RATE * 100).toFixed(0)}% discount rate. An IRR of{' '}
          {(irrVal * 100).toFixed(1)}% significantly exceeds the cost of capital, representing an excellent return on this investment.
        </Text>
      </View>

      <PF label="NPV & IRR" />
    </Page>
  )
}
