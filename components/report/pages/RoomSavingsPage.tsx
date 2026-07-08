import React from 'react'
import { Page, View, Text } from '@react-pdf/renderer'
import { Job } from '@/lib/types'
import { calcJob, calcRoom, formatRands } from '@/lib/calculations'
import { colors, s } from '../theme'
import { PH, PF, SH } from '../chrome'
import { HBarChart } from '../charts'

export function RoomSavingsPage({ job }: { job: Job }) {
  const sum = calcJob(job)
  const roomRows = job.rooms
    .map(room => ({
      label: `${room.areaDescription}${room.floor ? ' · ' + room.floor : ''}`,
      value: calcRoom(room, job).annualSavingsRands,
    }))
    .sort((a, b) => b.value - a.value)

  return (
    <Page size="A4" style={{ ...s.page, ...s.contentPage }}>
      <PH client={job.clientName} />
      <SH title="Savings by Area" sub={`${job.clientName} · Annual energy-cost savings ranked by area`} />

      <View style={{ marginBottom: 16 }} wrap={false}>
        <HBarChart rows={roomRows} format={formatRands} />
      </View>

      <View style={s.table}>
        <View style={s.tHead}>
          <Text style={{ ...s.cLh, flex: 3 }}>Area</Text>
          <Text style={s.cRh}>Annual Saving</Text>
          <Text style={s.cRh}>% of Total</Text>
        </View>
        {roomRows.map((r, i) => {
          const pct = sum.totalAnnualSavings > 0 ? (r.value / sum.totalAnnualSavings) * 100 : 0
          const Row = i % 2 === 0 ? s.tRow : s.tRowAlt
          return (
            <View key={i} style={Row} wrap={false}>
              <Text style={{ ...s.cL, flex: 3 }}>{r.label}</Text>
              <Text style={s.cBold}>{formatRands(r.value)}</Text>
              <Text style={s.cR}>{pct.toFixed(1)}%</Text>
            </View>
          )
        })}
        <View style={s.tTot}>
          <Text style={{ ...s.cLt, flex: 3 }}>TOTAL</Text>
          <Text style={s.cYt}>{formatRands(sum.totalAnnualSavings)}</Text>
          <Text style={s.cRt}>100%</Text>
        </View>
      </View>

      <Text style={{ ...s.body, color: colors.mid, fontSize: 7 }}>
        Please note: This report is the intellectual property of TFS Energy and should not be distributed without permission.
      </Text>
      <PF label="Savings by Area" />
    </Page>
  )
}
