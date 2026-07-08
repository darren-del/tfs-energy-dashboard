import React from 'react'
import { Page, View, Text } from '@react-pdf/renderer'
import { Job } from '@/lib/types'
import { s } from '../theme'
import { PH, PF, SH } from '../chrome'

export function AirconPage({ job }: { job: Job }) {
  const totals = job.rooms.reduce((acc, r) => ({
    btu9000: acc.btu9000 + (r.aircons?.btu9000 ?? 0),
    btu12000: acc.btu12000 + (r.aircons?.btu12000 ?? 0),
    btu18000: acc.btu18000 + (r.aircons?.btu18000 ?? 0),
    btu24000: acc.btu24000 + (r.aircons?.btu24000 ?? 0),
  }), { btu9000: 0, btu12000: 0, btu18000: 0, btu24000: 0 })
  const grandTotal = totals.btu9000 + totals.btu12000 + totals.btu18000 + totals.btu24000
  const sizes = [
    { key: 'btu9000' as const, label: '9,000 BTU', kw: '2.6 kW' },
    { key: 'btu12000' as const, label: '12,000 BTU', kw: '3.5 kW' },
    { key: 'btu18000' as const, label: '18,000 BTU', kw: '5.3 kW' },
    { key: 'btu24000' as const, label: '24,000 BTU', kw: '7.0 kW' },
  ]

  return (
    <Page size="A4" style={{ ...s.page, ...s.contentPage }}>
      <PH client={job.clientName} />
      <SH title="Air Conditioner Audit Summary" sub="Unit counts recorded per BTU capacity across all areas" />
      <View style={s.table}>
        <View style={s.tHead}>
          <Text style={s.cLh}>Capacity</Text>
          <Text style={s.cCh}>kW Equivalent</Text>
          <Text style={s.cCh}>Units on Site</Text>
        </View>
        {sizes.map((sz, i) => {
          const Row = i % 2 === 0 ? s.tRow : s.tRowAlt
          return (
            <View key={sz.key} style={Row}>
              <Text style={s.cL}>{sz.label}</Text>
              <Text style={s.cC}>{sz.kw}</Text>
              <Text style={totals[sz.key] > 0 ? s.cBold : s.cC}>{totals[sz.key]}</Text>
            </View>
          )
        })}
        <View style={s.tTot}>
          <Text style={s.cLt}>TOTAL UNITS ON SITE</Text>
          <Text style={s.cCt} />
          <Text style={s.cYt}>{grandTotal}</Text>
        </View>
      </View>

      {job.rooms.some(r => {
        const ac = r.aircons; return ac && (ac.btu9000 + ac.btu12000 + ac.btu18000 + ac.btu24000) > 0
      }) && (
        <View style={{ marginTop: 12 }}>
          <Text style={{ ...s.bodyBold, marginBottom: 6 }}>Per-Room Breakdown</Text>
          <View style={s.table}>
            <View style={s.tHead}>
              <Text style={s.cLh}>Area</Text>
              <Text style={s.cCh}>9,000 BTU</Text>
              <Text style={s.cCh}>12,000 BTU</Text>
              <Text style={s.cCh}>18,000 BTU</Text>
              <Text style={s.cCh}>24,000 BTU</Text>
              <Text style={s.cCh}>Total</Text>
            </View>
            {job.rooms.filter(r => {
              const ac = r.aircons; return ac && (ac.btu9000 + ac.btu12000 + ac.btu18000 + ac.btu24000) > 0
            }).map((room, i) => {
              const ac = room.aircons!
              const roomTotal = ac.btu9000 + ac.btu12000 + ac.btu18000 + ac.btu24000
              const Row = i % 2 === 0 ? s.tRow : s.tRowAlt
              return (
                <View key={room.id} style={Row}>
                  <Text style={s.cL}>{room.areaDescription}</Text>
                  <Text style={s.cC}>{ac.btu9000}</Text>
                  <Text style={s.cC}>{ac.btu12000}</Text>
                  <Text style={s.cC}>{ac.btu18000}</Text>
                  <Text style={s.cC}>{ac.btu24000}</Text>
                  <Text style={s.cBold}>{roomTotal}</Text>
                </View>
              )
            })}
          </View>
        </View>
      )}
      <PF label="Air Conditioners" />
    </Page>
  )
}
