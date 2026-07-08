import React from 'react'
import { Page, View, Text } from '@react-pdf/renderer'
import { Job, ReportTextOverrides } from '@/lib/types'
import { colors, s } from '../theme'
import { PH, PF, SH } from '../chrome'

const REFERENCES = [
  { company: 'Alcon Aluminium', contact: 'CEO Mr. Douglas Gray', phone: '082-788-1863' },
  { company: 'Sunbake Bakeries', contact: 'Engineer Mr. Danie Combrink', phone: '079-893-8864' },
  { company: 'Bidvest Lufil Packaging', contact: 'Regional Manager Mr. Kevin Swan', phone: '086-11-58345' },
  { company: 'Macsteel', contact: 'Mr. Daniel Carvalho', phone: '082-371-9082' },
  { company: 'East Balt Bakeries', contact: 'Engineer Mr. Kobus Wentzel', phone: '060-997-8748' },
]

export function OverviewPage({ job, texts }: { job: Job; texts: ReportTextOverrides }) {
  const points = texts.overviewPoints.split('\n').filter(Boolean)
  return (
    <Page size="A4" style={{ ...s.page, ...s.contentPage }}>
      <PH client={job.clientName} />
      <SH title="Overview of Lighting Retrofit Project" sub="Responses to requirements on your current lighting installation" />
      {points.map((p, i) => (
        <View key={i} style={{ flexDirection: 'row', marginBottom: 6, alignItems: 'flex-start' }}>
          <View style={{ width: 16, height: 16, backgroundColor: colors.navy, borderRadius: 8, marginRight: 8, marginTop: 1, flexShrink: 0, alignItems: 'center', justifyContent: 'center' }}>
            <Text style={{ fontSize: 6.5, fontFamily: 'Inter', fontWeight: 700, color: colors.yellow }}>{i + 1}</Text>
          </View>
          <Text style={{ ...s.body, flex: 1, marginBottom: 0 }}>{p}</Text>
        </View>
      ))}

      <View style={{ marginTop: 14 }}>
        <Text style={{ fontSize: 6.5, fontFamily: 'Inter', fontWeight: 600, color: colors.mid, letterSpacing: 1, marginBottom: 6 }}>REFERENCES</Text>
        {REFERENCES.map((r, i) => (
          <View key={i} style={{ flexDirection: 'row', backgroundColor: i % 2 === 0 ? colors.light : '#fff', borderRadius: 3, padding: '6 8', marginBottom: 3 }}>
            <Text style={{ fontSize: 8, color: colors.navy, width: 160, fontFamily: 'Inter', fontWeight: 600 }}>{r.company}</Text>
            <Text style={{ fontSize: 8, color: colors.inkSoft, flex: 1 }}>{r.contact} · {r.phone}</Text>
          </View>
        ))}
      </View>

      <View style={{ marginTop: 16 }}>
        <Text style={s.body}>Best Regards,</Text>
        <Text style={{ ...s.bodyBold, marginTop: 12 }}>Philip Melton</Text>
        <Text style={s.body}>082-525-1796 · pmelton@tfsenergy.co.za</Text>
      </View>
      <PF label="Project Overview" />
    </Page>
  )
}
