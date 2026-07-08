import React from 'react'
import { Page, View, Text } from '@react-pdf/renderer'
import { Job, ReportTextOverrides } from '@/lib/types'
import { colors, s } from '../theme'
import { PH, PF, SH } from '../chrome'

export function LetterPage({ job, texts }: { job: Job; texts: ReportTextOverrides }) {
  const maintPoints = texts.letterMaintPoints.split('\n').filter(Boolean)
  return (
    <Page size="A4" style={{ ...s.page, ...s.contentPage }}>
      <PH client={job.clientName} />
      <SH title="Introduction" />
      <Text style={{ ...s.body, textAlign: 'right' }}>{job.date}</Text>
      <Text style={{ ...s.body, marginBottom: 14 }}>The Directors{'\n'}{job.clientName}{'\n'}{job.siteAddress}</Text>
      <Text style={s.body}>Dear Sirs,</Text>
      <Text style={{ ...s.bodyBold, marginTop: 4, fontSize: 10 }}>RE: LED Lighting Upgrade — Energy Audit Report</Text>
      <View style={s.yellowBar} />
      <Text style={s.body}>{texts.letterPara1}</Text>
      <Text style={s.body}>{texts.letterPara2}</Text>
      <Text style={{ ...s.bodyBold, marginTop: 6 }}>{texts.letterMaintTitle}</Text>
      {maintPoints.map((pt, i) => (
        <View key={i} style={{ flexDirection: 'row', marginBottom: 5, alignItems: 'flex-start' }}>
          <View style={{ width: 14, height: 14, backgroundColor: colors.navy, borderRadius: 7, marginRight: 8, marginTop: 1, flexShrink: 0, alignItems: 'center', justifyContent: 'center' }}>
            <Text style={{ fontSize: 6, fontFamily: 'Inter', fontWeight: 700, color: colors.yellow }}>{i + 1}</Text>
          </View>
          <Text style={{ ...s.body, flex: 1, marginBottom: 0 }}>{pt}</Text>
        </View>
      ))}
      <Text style={{ ...s.bodyBold, marginTop: 10 }}>COMMENT ON TARIFF HIKES</Text>
      <Text style={s.body}>{texts.letterTariffComment}</Text>
      <View style={{ borderTop: `0.5 solid ${colors.hairline}`, marginTop: 10, paddingTop: 12 }}>
        <Text style={{ ...s.body, marginBottom: 0 }}>Yours faithfully,</Text>
        <Text style={{ ...s.bodyBold, marginTop: 18 }}>Philip Melton</Text>
        <Text style={s.body}>Managing Director · TFS Energy · 082-525-1796 · pmelton@tfsenergy.co.za</Text>
      </View>
      <PF label="Introduction" />
    </Page>
  )
}
