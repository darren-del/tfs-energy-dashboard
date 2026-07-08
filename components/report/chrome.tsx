import React from 'react'
import { View, Text } from '@react-pdf/renderer'
import { colors, s } from './theme'

export function PH({ client }: { client: string }) {
  return (
    <View fixed>
      <View style={s.pageHeader}>
        <View>
          <Text style={s.pageHeaderLogo}>TFS ENERGY</Text>
          <Text style={s.pageHeaderSub}>LED Lighting Audit Report</Text>
        </View>
        <Text style={s.pageHeaderSub}>{client}</Text>
      </View>
      <View style={s.pageHeaderRule}>
        <View style={{ width: 40, backgroundColor: colors.yellow }} />
        <View style={{ flex: 1, backgroundColor: colors.hairline }} />
      </View>
    </View>
  )
}

export function PF({ label }: { label: string }) {
  return (
    <View style={s.footer} fixed>
      <Text style={s.footerText}>TFS Energy · {label} · Confidential</Text>
      <Text style={s.footerText} render={({ pageNumber, totalPages }) => `${pageNumber} of ${totalPages}`} />
    </View>
  )
}

export function SH({ title, sub }: { title: string; sub?: string }) {
  return (
    <View style={s.sectionHeader}>
      <View style={s.sectionHeaderTick} />
      <View>
        <Text style={s.sectionHeaderText}>{title}</Text>
        {sub ? <Text style={s.sectionHeaderSub}>{sub}</Text> : null}
      </View>
    </View>
  )
}
