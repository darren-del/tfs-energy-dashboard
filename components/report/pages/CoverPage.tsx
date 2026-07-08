import React from 'react'
import { Page, View, Text, Image, Svg, Circle } from '@react-pdf/renderer'
import { Job, ReportTextOverrides } from '@/lib/types'
import { colors, s } from '../theme'

export function CoverPage({ job, texts, logoSrc }: { job: Job; texts: ReportTextOverrides; logoSrc?: string }) {
  return (
    <Page size="A4" style={s.page}>
      <View style={s.coverPage}>
        {/* Left yellow edge band */}
        <View style={{ position: 'absolute', top: 0, left: 0, bottom: 0, width: 8, backgroundColor: colors.yellow }} />

        {/* Decorative concentric arcs, top-right */}
        <View style={{ position: 'absolute', top: -60, right: -60 }}>
          <Svg width={260} height={260}>
            <Circle cx={130} cy={130} r={110} stroke="#ffffff" strokeOpacity={0.08} strokeWidth={1} fill="none" />
            <Circle cx={130} cy={130} r={80} stroke="#ffffff" strokeOpacity={0.06} strokeWidth={1} fill="none" />
            <Circle cx={130} cy={130} r={50} stroke="#ffffff" strokeOpacity={0.05} strokeWidth={1} fill="none" />
          </Svg>
        </View>

        <View>
          {logoSrc
            ? <Image src={logoSrc} style={{ height: 36, width: 'auto', alignSelf: 'flex-start' }} />
            : <Text style={{ fontSize: 20, fontFamily: 'Inter', fontWeight: 800, color: colors.yellow, letterSpacing: 3 }}>TFS ENERGY</Text>
          }
          <Text style={{ fontSize: 8, color: '#ffffff50', letterSpacing: 5, marginTop: 4, fontFamily: 'Inter' }}>TOTAL FACILITIES SOLUTIONS</Text>
        </View>

        <View>
          <Text style={{ fontSize: 7, fontFamily: 'Inter', fontWeight: 600, color: colors.yellow, letterSpacing: 2, marginBottom: 10 }}>
            ENERGY AUDIT &amp; RETROFIT PROPOSAL
          </Text>
          <Text style={{ fontSize: 34, fontFamily: 'Inter', fontWeight: 800, color: '#fff', lineHeight: 1.15 }}>Lighting Audit Report</Text>
          <Text style={{ fontSize: 16, color: colors.yellow, fontFamily: 'Inter', fontWeight: 700, marginTop: 16 }}>{job.clientName}</Text>
          <Text style={{ fontSize: 9, color: '#ffffff80', marginTop: 4, fontFamily: 'Inter' }}>LED New Retrofit · Energy Efficient Lighting Retrofit Project</Text>

          <View style={{ flexDirection: 'row', gap: 40, marginTop: 22 }}>
            <View>
              <Text style={{ fontSize: 6, color: colors.mid, letterSpacing: 1, fontFamily: 'Inter', fontWeight: 600, marginBottom: 3 }}>SITE</Text>
              <Text style={{ fontSize: 9, color: '#ffffffcc' }}>{job.siteAddress}</Text>
            </View>
            <View>
              <Text style={{ fontSize: 6, color: colors.mid, letterSpacing: 1, fontFamily: 'Inter', fontWeight: 600, marginBottom: 3 }}>DATE</Text>
              <Text style={{ fontSize: 9, color: '#ffffffcc' }}>{job.date}</Text>
            </View>
          </View>
        </View>

        <View style={{ borderLeft: `2 solid ${colors.yellow}`, paddingLeft: 12, marginBottom: 4 }}>
          <Text style={{ fontSize: 8, color: '#ffffff90', lineHeight: 1.6, fontFamily: 'Inter' }}>{texts.coverNote}</Text>
        </View>

        <View style={{ borderTop: '0.5 solid #515286', paddingTop: 10 }}>
          <Text style={{ fontSize: 8, color: '#ffffff50', fontFamily: 'Inter' }}>Prepared by: Philip Melton · 082-525-1796 · pmelton@tfsenergy.co.za</Text>
          <Text style={{ fontSize: 8, color: '#ffffff50', fontFamily: 'Inter', marginTop: 2 }}>TFS Energy cc · PO Box 425, Jukskei Park 2153 · Reg # 2011/064736/24 · VAT # 490-026-1677</Text>
        </View>
      </View>
    </Page>
  )
}
