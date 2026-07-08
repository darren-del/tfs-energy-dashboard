import React from 'react'
import { Page, View, Text } from '@react-pdf/renderer'
import { Job } from '@/lib/types'
import { calcJob, calcRoom, formatRands } from '@/lib/calculations'
import { getCurrentFitting, getProposedFitting } from '@/lib/fittings'
import { colors, s } from '../theme'
import { PH, PF, SH } from '../chrome'

export function CostPage({ job }: { job: Job }) {
  const sum = calcJob(job)
  const totalUnits = sum.totalProjectCost - job.rooms.reduce((acc, r) => acc + (job.installPerFitting + job.disposalPerFitting) * r.quantity, 0)
  const totalInstDisp = job.rooms.reduce((acc, r) => acc + (job.installPerFitting + job.disposalPerFitting) * r.quantity, 0)

  return (
    <Page size="A4" style={{ ...s.page, ...s.contentPage }}>
      <PH client={job.clientName} />
      <SH title="Cost — Lighting System" sub={`${job.clientName} · Supply, installation and disposal`} />

      <View style={s.table}>
        <View style={s.tHead}>
          <Text style={{ ...s.cLh, flex: 1.5 }}>#</Text>
          <Text style={{ ...s.cLh, flex: 2 }}>Area</Text>
          <Text style={s.cLh}>Current Fitting</Text>
          <Text style={s.cLh}>Proposed Fitting</Text>
          <Text style={s.cCh}>Qty</Text>
          <Text style={s.cRh}>Unit Cost</Text>
          <Text style={s.cRh}>Install</Text>
          <Text style={s.cRh}>Disposal</Text>
          <Text style={s.cRh}>Total</Text>
          <Text style={s.cRh}>Units Only</Text>
          <Text style={s.cRh}>Inst+Disp</Text>
        </View>

        {job.rooms.map((room, i) => {
          const calc = calcRoom(room, job)
          const cf = getCurrentFitting(room.currentFittingCode)
          const pf = getProposedFitting(room.proposedFittingCode)
          const unitCostPer = pf ? pf.unitCost : 0
          const Row = i % 2 === 0 ? s.tRow : s.tRowAlt
          return (
            <View key={room.id} style={Row} wrap={false}>
              <Text style={{ ...s.cL, flex: 1.5 }}>{i + 1}</Text>
              <Text style={{ ...s.cL, flex: 2 }}>{room.areaDescription}</Text>
              <Text style={s.cL}>{cf?.label ?? room.currentFittingCode}</Text>
              <Text style={s.cL}>{pf?.label ?? room.proposedFittingCode}</Text>
              <Text style={s.cC}>{room.quantity}</Text>
              <Text style={s.cR}>{formatRands(unitCostPer)}</Text>
              <Text style={s.cR}>{formatRands(job.installPerFitting)}</Text>
              <Text style={s.cR}>{formatRands(job.disposalPerFitting)}</Text>
              <Text style={s.cBold}>{formatRands(calc.totalRoomCost)}</Text>
              <Text style={s.cR}>{formatRands(calc.unitCost)}</Text>
              <Text style={s.cR}>{formatRands(calc.installCost + calc.disposalCost)}</Text>
            </View>
          )
        })}

        <View style={s.tTot}>
          <Text style={{ ...s.cLt, flex: 1.5 }} />
          <Text style={{ ...s.cLt, flex: 2 }}>TOTAL</Text>
          <Text style={s.cLt} />
          <Text style={s.cLt} />
          <Text style={s.cCt}>{job.rooms.reduce((s, r) => s + r.quantity, 0)}</Text>
          <Text style={s.cRt} />
          <Text style={s.cRt} />
          <Text style={s.cRt} />
          <Text style={s.cYt}>{formatRands(sum.totalProjectCost)}</Text>
          <Text style={s.cRt}>{formatRands(totalUnits)}</Text>
          <Text style={s.cRt}>{formatRands(totalInstDisp)}</Text>
        </View>
      </View>
      <Text style={{ ...s.body, color: colors.mid, fontSize: 7 }}>
        Please note: This report is the intellectual property of TFS Energy and should not be distributed without permission.
      </Text>
      <PF label="Cost Breakdown" />
    </Page>
  )
}
