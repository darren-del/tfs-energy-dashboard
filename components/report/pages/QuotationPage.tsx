import React from 'react'
import { Page, View, Text } from '@react-pdf/renderer'
import { Job } from '@/lib/types'
import { calcRoom, formatRands } from '@/lib/calculations'
import { getProposedFitting } from '@/lib/fittings'
import { colors, s } from '../theme'
import { PH, PF, SH } from '../chrome'

export function QuotationPage({ job }: { job: Job }) {
  const subtotal = job.rooms.reduce((acc, room) => {
    const calc = calcRoom(room, job)
    return acc + calc.totalRoomCost
  }, 0)
  const vat = subtotal * 0.15
  const total = subtotal + vat

  return (
    <Page size="A4" style={{ ...s.page, ...s.contentPage }}>
      <PH client={job.clientName} />

      <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 14, paddingBottom: 10, borderBottom: `0.5 solid ${colors.hairline}` }}>
        <View>
          <Text style={{ fontSize: 11, fontFamily: 'Inter', fontWeight: 700, color: colors.navy }}>TFS Energy cc</Text>
          <Text style={{ fontSize: 8, color: colors.inkSoft, marginTop: 3 }}>PO Box 425, Jukskei Park 2153</Text>
          <Text style={{ fontSize: 8, color: colors.inkSoft }}>Tel: 082-525-1796 · Fax: 086-520-5488</Text>
          <Text style={{ fontSize: 8, color: colors.inkSoft }}>VAT No: 490-026-1677 · Reg #: 2011/064736/24</Text>
        </View>
        <View style={{ alignItems: 'flex-end' }}>
          <Text style={{ fontSize: 13, fontFamily: 'Inter', fontWeight: 700, color: colors.navy }}>QUOTATION</Text>
          <Text style={{ fontSize: 8, color: colors.inkSoft, marginTop: 4 }}>Quote Date: {job.date}</Text>
          {job.vatNumber ? <Text style={{ fontSize: 8, color: colors.inkSoft }}>Client VAT No: {job.vatNumber}</Text> : null}
        </View>
      </View>

      <View style={{ backgroundColor: colors.light, borderRadius: 4, padding: '9 12', marginBottom: 14 }}>
        <Text style={{ fontSize: 7.5, fontFamily: 'Inter', fontWeight: 700, color: colors.navy, marginBottom: 4 }}>BILL TO:</Text>
        <Text style={{ fontSize: 8, color: colors.ink }}>Company Name: {job.clientName}</Text>
        {job.contactPerson ? <Text style={{ fontSize: 8, color: colors.ink }}>Contact Person: {job.contactPerson}</Text> : null}
        {job.contactNumber ? <Text style={{ fontSize: 8, color: colors.ink }}>Contact Number: {job.contactNumber}</Text> : null}
        {job.siteAddress ? <Text style={{ fontSize: 8, color: colors.ink }}>Address: {job.siteAddress}</Text> : null}
      </View>

      <SH title="Quotation" sub="All prices include installation, labour, travel and materials" />

      <View style={s.table}>
        <View style={s.tHead}>
          <Text style={{ ...s.cCh, flex: 0.5 }}>#</Text>
          <Text style={{ ...s.cLh, flex: 3 }}>Product Name</Text>
          <Text style={s.cCh}>Qty</Text>
          <Text style={s.cRh}>Unit Price (incl. install &amp; disposal)</Text>
          <Text style={s.cRh}>Total</Text>
        </View>

        {job.rooms.map((room, i) => {
          const calc = calcRoom(room, job)
          const pf = getProposedFitting(room.proposedFittingCode)
          const unitPrice = room.quantity > 0 ? calc.totalRoomCost / room.quantity : 0
          const Row = i % 2 === 0 ? s.tRow : s.tRowAlt
          return (
            <View key={room.id} style={Row} wrap={false}>
              <Text style={{ ...s.cC, flex: 0.5 }}>{i + 1}</Text>
              <Text style={{ ...s.cL, flex: 3 }}>{pf?.label ?? room.proposedFittingCode}{room.areaDescription ? `  (${room.areaDescription})` : ''}</Text>
              <Text style={s.cC}>{room.quantity}</Text>
              <Text style={s.cR}>{formatRands(unitPrice)}</Text>
              <Text style={s.cBold}>{formatRands(calc.totalRoomCost)}</Text>
            </View>
          )
        })}
      </View>

      <View style={{ alignSelf: 'flex-end', width: 280, marginTop: 8 }}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 5, borderTop: `1 solid ${colors.navy}` }}>
          <Text style={{ fontSize: 8.5, fontFamily: 'Inter', fontWeight: 700, color: colors.navy }}>TOTAL excl. VAT</Text>
          <Text style={{ fontSize: 8.5, fontFamily: 'Inter', fontWeight: 700, color: colors.navy }}>{formatRands(subtotal)}</Text>
        </View>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 4 }}>
          <Text style={{ fontSize: 8, color: colors.inkSoft }}>15% VAT</Text>
          <Text style={{ fontSize: 8, color: colors.inkSoft }}>{formatRands(vat)}</Text>
        </View>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', backgroundColor: colors.navy, padding: '8 8', borderRadius: 3, marginTop: 4 }}>
          <Text style={{ fontSize: 9, fontFamily: 'Inter', fontWeight: 700, color: '#fff' }}>TOTAL INCLUDING VAT</Text>
          <Text style={{ fontSize: 9, fontFamily: 'Inter', fontWeight: 700, color: colors.yellow }}>{formatRands(total)}</Text>
        </View>
      </View>

      <Text style={{ ...s.body, color: colors.mid, marginTop: 14, fontSize: 7.5 }}>
        All prices include installation, labour, travel and materials. This quotation is valid for 30 days from the date of this report.
        Payment terms: 50% deposit on acceptance, balance on completion.
      </Text>

      <PF label="Quotation" />
    </Page>
  )
}
