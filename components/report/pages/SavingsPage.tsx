import React from 'react'
import { Page, View, Text } from '@react-pdf/renderer'
import { Job } from '@/lib/types'
import { calcJob, calcRoom, formatRands, formatNum } from '@/lib/calculations'
import { getProposedFitting } from '@/lib/fittings'
import { MAINT_RATE } from '@/lib/reportConstants'
import { colors, s } from '../theme'
import { PH, PF, SH } from '../chrome'

export function SavingsPage({ job }: { job: Job }) {
  const sum = calcJob(job)
  const eskom = job.eskomIncrease / 100
  const maintSavingsTotal = sum.totalCurrentCostPerYear * MAINT_RATE
  const totalSavingsY1 = sum.totalAnnualSavings + maintSavingsTotal
  const totalSavingsY2 = totalSavingsY1 * (1 + eskom)
  const totalSavingsY3 = totalSavingsY2 * (1 + eskom)
  const totalSavingsY4 = totalSavingsY3 * (1 + eskom)
  const roiMonths = totalSavingsY1 > 0 ? sum.totalProjectCost / (totalSavingsY1 / 12) : 0

  return (
    <Page size="A4" style={{ ...s.page, ...s.contentPage }}>
      <PH client={job.clientName} />
      <SH title="Savings — Lighting System" sub={`${job.clientName} · Includes ${job.eskomIncrease}% annual Eskom escalation`} />

      <View style={s.table}>
        <View style={s.tHead}>
          <Text style={{ ...s.cLh, flex: 1 }}>#</Text>
          <Text style={{ ...s.cLh, flex: 2 }}>Area</Text>
          <Text style={s.cLh}>Proposed Fitting</Text>
          <Text style={s.cCh}>Qty</Text>
          <Text style={s.cRh}>Current Cost/Yr</Text>
          <Text style={s.cRh}>Proposed Cost/Yr</Text>
          <Text style={s.cRh}>Energy Savings</Text>
          <Text style={s.cRh}>Maint Savings</Text>
          <Text style={s.cRh}>Total Savings</Text>
          <Text style={s.cRh}>Project Cost</Text>
          <Text style={s.cRh}>Yr 1 Net</Text>
          <Text style={s.cRh}>Yr 2</Text>
          <Text style={s.cRh}>Yr 3</Text>
          <Text style={s.cRh}>Yr 4</Text>
          <Text style={s.cRh}>ROI (mo)</Text>
        </View>

        {job.rooms.map((room, i) => {
          const calc = calcRoom(room, job)
          const pf = getProposedFitting(room.proposedFittingCode)
          const maint = calc.currentCostPerYear * MAINT_RATE
          const totalS = calc.annualSavingsRands + maint
          const s2 = totalS * (1 + eskom)
          const s3 = s2 * (1 + eskom)
          const s4 = s3 * (1 + eskom)
          const yr1Net = totalS - calc.totalRoomCost
          const roi = totalS > 0 ? calc.totalRoomCost / (totalS / 12) : 0
          const Row = i % 2 === 0 ? s.tRow : s.tRowAlt
          return (
            <View key={room.id} style={Row} wrap={false}>
              <Text style={{ ...s.cL, flex: 1 }}>{i + 1}</Text>
              <Text style={{ ...s.cL, flex: 2 }}>{room.areaDescription}</Text>
              <Text style={s.cL}>{pf?.label ?? room.proposedFittingCode}</Text>
              <Text style={s.cC}>{room.quantity}</Text>
              <Text style={s.cR}>{formatRands(calc.currentCostPerYear)}</Text>
              <Text style={s.cR}>{formatRands(calc.proposedCostPerYear)}</Text>
              <Text style={s.cR}>{formatRands(calc.annualSavingsRands)}</Text>
              <Text style={s.cR}>{formatRands(maint)}</Text>
              <Text style={s.cBold}>{formatRands(totalS)}</Text>
              <Text style={s.cR}>{formatRands(calc.totalRoomCost)}</Text>
              <Text style={{ ...s.cR, color: yr1Net >= 0 ? colors.positive : colors.negative }}>{formatRands(yr1Net)}</Text>
              <Text style={s.cR}>{formatRands(s2)}</Text>
              <Text style={s.cR}>{formatRands(s3)}</Text>
              <Text style={s.cR}>{formatRands(s4)}</Text>
              <Text style={s.cC}>{roi > 0 ? formatNum(roi, 2) : '—'}</Text>
            </View>
          )
        })}

        <View style={s.tTot}>
          <Text style={{ ...s.cLt, flex: 1 }} />
          <Text style={{ ...s.cLt, flex: 2 }}>TOTAL</Text>
          <Text style={s.cLt} />
          <Text style={s.cCt}>{job.rooms.reduce((acc, r) => acc + r.quantity, 0)}</Text>
          <Text style={s.cRt}>{formatRands(sum.totalCurrentCostPerYear)}</Text>
          <Text style={s.cRt}>{formatRands(sum.totalProposedCostPerYear)}</Text>
          <Text style={s.cRt}>{formatRands(sum.totalAnnualSavings)}</Text>
          <Text style={s.cRt}>{formatRands(maintSavingsTotal)}</Text>
          <Text style={s.cYt}>{formatRands(totalSavingsY1)}</Text>
          <Text style={s.cRt}>{formatRands(sum.totalProjectCost)}</Text>
          <Text style={s.cYt}>{formatRands(totalSavingsY1 - sum.totalProjectCost)}</Text>
          <Text style={s.cRt}>{formatRands(totalSavingsY2)}</Text>
          <Text style={s.cRt}>{formatRands(totalSavingsY3)}</Text>
          <Text style={s.cRt}>{formatRands(totalSavingsY4)}</Text>
          <Text style={s.cCt}>{roiMonths > 0 ? formatNum(roiMonths, 2) : '—'}</Text>
        </View>
      </View>
      <Text style={{ ...s.body, color: colors.mid, fontSize: 7 }}>
        Please note: This report is the intellectual property of TFS Energy and should not be distributed without permission.
      </Text>
      <PF label="Savings Summary" />
    </Page>
  )
}
