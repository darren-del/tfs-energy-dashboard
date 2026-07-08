import React from 'react'
import { Page, View, Text } from '@react-pdf/renderer'
import { Job } from '@/lib/types'
import { calcJob, calcRoom, formatRands, formatNum } from '@/lib/calculations'
import { getCurrentFitting } from '@/lib/fittings'
import { colors, s } from '../theme'
import { PH, PF, SH } from '../chrome'
import { currentAmpPerFitting } from '../finance'

export function CurrentLightingPage({ job }: { job: Job }) {
  const sum = calcJob(job)
  const totalKwhDay = sum.totalCurrentKwhPerYear / 365
  const totalAmpDraw = job.rooms.reduce((acc, room) => {
    const f = getCurrentFitting(room.currentFittingCode)
    if (!f) return acc
    const bw = room.ballastWattOverride ?? job.defaultBallastWatt
    return acc + currentAmpPerFitting(f.watts, f.lamps, bw) * room.quantity
  }, 0)

  return (
    <Page size="A4" style={{ ...s.page, ...s.contentPage }}>
      <PH client={job.clientName} />
      <SH title="Current Lighting System — Daily Usage" sub={`Rate per kWh: R ${job.costPerKwh.toFixed(4)}`} />

      <View style={s.table}>
        <View style={{ flexDirection: 'row', backgroundColor: colors.light, padding: '5 6', marginBottom: 6, borderRadius: 3 }}>
          <Text style={{ fontSize: 7, fontFamily: 'Inter', fontWeight: 700, color: colors.navy, flex: 1 }}>
            TOTAL FITTINGS: {job.rooms.reduce((s, r) => s + r.quantity, 0)}
          </Text>
          <Text style={{ fontSize: 7, fontFamily: 'Inter', fontWeight: 700, color: colors.navy, flex: 1 }}>
            kW/DAY: {formatNum(totalKwhDay, 2)}
          </Text>
          <Text style={{ fontSize: 7, fontFamily: 'Inter', fontWeight: 700, color: colors.navy, flex: 1 }}>
            kWh/YEAR: {formatNum(sum.totalCurrentKwhPerYear, 0)}
          </Text>
          <Text style={{ fontSize: 7, fontFamily: 'Inter', fontWeight: 700, color: colors.navy, flex: 1 }}>
            COST/YEAR: {formatRands(sum.totalCurrentCostPerYear)}
          </Text>
          <Text style={{ fontSize: 7, fontFamily: 'Inter', fontWeight: 700, color: colors.navy, flex: 1 }}>
            AMP DRAW: {formatNum(totalAmpDraw, 2)}
          </Text>
        </View>

        <View style={s.tHead}>
          <Text style={{ ...s.cLh, flex: 1.5 }}>#</Text>
          <Text style={{ ...s.cLh, flex: 2 }}>Area</Text>
          <Text style={s.cLh}>Comment</Text>
          <Text style={s.cCh}>Current Type</Text>
          <Text style={s.cCh}>Qty</Text>
          <Text style={s.cCh}>Hrs/Day</Text>
          <Text style={s.cCh}>Lamp W</Text>
          <Text style={s.cCh}>Ballast W</Text>
          <Text style={s.cCh}>kWh/Day</Text>
          <Text style={s.cCh}>kWh/Year</Text>
          <Text style={s.cRh}>Cost/Year</Text>
          <Text style={s.cCh}>Amp/Fit</Text>
          <Text style={s.cCh}>Amp Total</Text>
        </View>

        {job.rooms.map((room, i) => {
          const calc = calcRoom(room, job)
          const f = getCurrentFitting(room.currentFittingCode)
          const bw = room.ballastWattOverride ?? job.defaultBallastWatt
          const ampPer = f ? currentAmpPerFitting(f.watts, f.lamps, bw) : 0
          const Row = i % 2 === 0 ? s.tRow : s.tRowAlt
          return (
            <View key={room.id} style={Row} wrap={false}>
              <Text style={{ ...s.cL, flex: 1.5 }}>{i + 1}</Text>
              <Text style={{ ...s.cL, flex: 2 }}>{room.areaDescription}{room.floor ? `\n${room.floor}` : ''}</Text>
              <Text style={s.cL}>{room.comments || '—'}</Text>
              <Text style={s.cC}>{f?.label ?? room.currentFittingCode}</Text>
              <Text style={s.cC}>{room.quantity}</Text>
              <Text style={s.cC}>{room.hoursPerDay}</Text>
              <Text style={s.cC}>{f ? f.watts * f.lamps : '—'}W</Text>
              <Text style={s.cC}>{bw}W</Text>
              <Text style={s.cC}>{formatNum(calc.currentKwhPerDay, 2)}</Text>
              <Text style={s.cC}>{formatNum(calc.currentKwhPerYear, 0)}</Text>
              <Text style={s.cBold}>{formatRands(calc.currentCostPerYear)}</Text>
              <Text style={s.cC}>{formatNum(ampPer, 2)}</Text>
              <Text style={s.cC}>{formatNum(ampPer * room.quantity, 2)}</Text>
            </View>
          )
        })}

        <View style={s.tTot}>
          <Text style={{ ...s.cLt, flex: 1.5 }} />
          <Text style={{ ...s.cLt, flex: 2 }}>TOTAL</Text>
          <Text style={s.cLt} />
          <Text style={s.cCt} />
          <Text style={s.cCt}>{job.rooms.reduce((s, r) => s + r.quantity, 0)}</Text>
          <Text style={s.cCt} />
          <Text style={s.cCt} />
          <Text style={s.cCt} />
          <Text style={s.cCt}>{formatNum(totalKwhDay, 2)}</Text>
          <Text style={s.cCt}>{formatNum(sum.totalCurrentKwhPerYear, 0)}</Text>
          <Text style={s.cYt}>{formatRands(sum.totalCurrentCostPerYear)}</Text>
          <Text style={s.cCt} />
          <Text style={s.cCt}>{formatNum(totalAmpDraw, 2)}</Text>
        </View>
      </View>
      <Text style={{ ...s.body, color: colors.mid, fontSize: 7 }}>
        Please note: This report is the intellectual property of TFS Energy and should not be distributed without permission.
      </Text>
      <PF label="Current Lighting" />
    </Page>
  )
}
