import React from 'react'
import { View, Text, Svg, Rect, Line, Path, Circle } from '@react-pdf/renderer'
import { colors } from './theme'
import { formatRands, formatNum } from '@/lib/calculations'

// ── KPICard ───────────────────────────────────────────────────────────────────
export function KPICard({ label, value, sub, tone = 'navy' }: {
  label: string; value: string; sub?: string; tone?: 'navy' | 'light' | 'accent'
}) {
  const isNavy = tone === 'navy'
  const box = {
    flex: 1,
    borderRadius: 4,
    padding: '10 12',
    backgroundColor: isNavy ? colors.navy : colors.light,
    ...(tone === 'accent' ? { borderLeft: `3 solid ${colors.yellow}` } : {}),
  }
  const labelColor = isNavy ? '#ffffff70' : colors.mid
  const valueColor = isNavy ? colors.yellow : colors.navy
  const subColor = isNavy ? '#ffffff60' : colors.inkSoft
  return (
    <View style={box}>
      <Text style={{ fontSize: 6.5, color: labelColor, fontFamily: 'Inter', fontWeight: 600, letterSpacing: 0.6, marginBottom: 4, textTransform: 'uppercase' }}>{label}</Text>
      <Text style={{ fontSize: 15, fontFamily: 'Inter', fontWeight: 800, color: valueColor }}>{value}</Text>
      {sub ? <Text style={{ fontSize: 6.5, color: subColor, marginTop: 3 }}>{sub}</Text> : null}
    </View>
  )
}

// ── DonutGauge ────────────────────────────────────────────────────────────────
function arcPath(cx: number, cy: number, r: number, startDeg: number, endDeg: number): string {
  const rad = (deg: number) => ((deg - 90) * Math.PI) / 180
  const sx = cx + r * Math.cos(rad(startDeg))
  const sy = cy + r * Math.sin(rad(startDeg))
  const ex = cx + r * Math.cos(rad(endDeg))
  const ey = cy + r * Math.sin(rad(endDeg))
  const large = endDeg - startDeg > 180 ? 1 : 0
  return `M ${sx} ${sy} A ${r} ${r} 0 ${large} 1 ${ex} ${ey}`
}

export function DonutGauge({ pct, label, sublabel, size = 100, stroke = 13 }: {
  pct: number; label?: string; sublabel?: string; size?: number; stroke?: number
}) {
  const cx = size / 2, cy = size / 2, r = (size - stroke) / 2
  const safePct = Number.isFinite(pct) ? Math.max(0, pct) : 0
  const clamped = Math.min(safePct, 99.9)

  return (
    <View style={{ width: size, height: size }}>
      <Svg width={size} height={size}>
        <Circle cx={cx} cy={cy} r={r} stroke={colors.light} strokeWidth={stroke} fill="none" />
        {safePct >= 100 ? (
          <Circle cx={cx} cy={cy} r={r} stroke={colors.yellow} strokeWidth={stroke} fill="none" />
        ) : safePct > 0 ? (
          <Path d={arcPath(cx, cy, r, 0, clamped * 3.6)} stroke={colors.yellow} strokeWidth={stroke} strokeLinecap="round" fill="none" />
        ) : null}
      </Svg>
      <View style={{ position: 'absolute', top: 0, left: 0, width: size, height: size, alignItems: 'center', justifyContent: 'center' }}>
        <Text style={{ fontSize: 18, fontFamily: 'Inter', fontWeight: 800, color: colors.navy }}>
          {safePct > 0 ? `${safePct.toFixed(0)}%` : '—'}
        </Text>
        {sublabel ? <Text style={{ fontSize: 6, color: colors.mid, marginTop: 2, textAlign: 'center', maxWidth: size - 20 }}>{sublabel}</Text> : null}
      </View>
      {label ? <Text style={{ fontSize: 6.5, color: colors.mid, marginTop: 6, textAlign: 'center' }}>{label}</Text> : null}
    </View>
  )
}

// ── PaybackTimeline ───────────────────────────────────────────────────────────
export function PaybackTimeline({ months, horizonMonths, width = 220 }: { months: number; horizonMonths?: number; width?: number }) {
  const valid = Number.isFinite(months) && months > 0
  const horizon = horizonMonths ?? Math.max(24, Math.ceil((valid ? months : 24) / 12) * 12)
  const pct = valid ? Math.min(100, (months / horizon) * 100) : 0
  const markerX = (pct / 100) * width
  const labelW = 74
  const labelLeft = Math.min(Math.max(markerX - labelW / 2, 0), width - labelW)
  const ticks = Array.from({ length: horizon / 6 + 1 }, (_, i) => i * 6)

  return (
    <View style={{ width }}>
      <View style={{ height: 8, width, backgroundColor: colors.light, borderRadius: 4, marginTop: 14, marginBottom: 6 }}>
        {valid && (
          <View style={{ height: 8, width: markerX, backgroundColor: colors.yellow, borderRadius: 4 }} />
        )}
        {valid && (
          <View style={{ position: 'absolute', left: labelLeft, top: -13, width: labelW, alignItems: 'center' }}>
            <Text style={{ fontSize: 6.5, fontFamily: 'Inter', fontWeight: 700, color: colors.navy }}>
              Payback · {formatNum(months, 1)} mo
            </Text>
          </View>
        )}
        {valid && (
          <View style={{ position: 'absolute', left: markerX - 4.5, top: 8, width: 9, height: 9, borderRadius: 4.5, backgroundColor: colors.navy, borderWidth: 1.5, borderColor: '#fff' }} />
        )}
      </View>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', width }}>
        {ticks.map(t => (
          <Text key={t} style={{ fontSize: 5.5, color: colors.mid }}>{t}mo</Text>
        ))}
      </View>
      {!valid && <Text style={{ fontSize: 6.5, color: colors.mid, marginTop: 4 }}>—</Text>}
    </View>
  )
}

// ── ComparisonBars ────────────────────────────────────────────────────────────
function ComparisonPanel({ title, current, proposed, format }: {
  title: string; current: number; proposed: number; format: (n: number) => string
}) {
  const max = Math.max(current, proposed, 1)
  const deltaPct = current > 0 ? ((current - proposed) / current) * 100 : 0
  const bar = (label: string, val: number, color: string) => (
    <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 6 }}>
      <Text style={{ width: 44, fontSize: 6.5, color: colors.inkSoft }}>{label}</Text>
      <View style={{ flex: 1, height: 13, justifyContent: 'center' }}>
        <View style={{
          width: `${Math.max(2, (val / max) * 100)}%`, height: 13, backgroundColor: color,
          borderTopRightRadius: 3, borderBottomRightRadius: 3,
        }} />
      </View>
      <Text style={{ width: 62, fontSize: 7, fontFamily: 'Inter', fontWeight: 600, color: colors.ink, textAlign: 'right' }}>{format(val)}</Text>
    </View>
  )
  return (
    <View style={{ flex: 1, backgroundColor: colors.light, borderRadius: 4, padding: '10 12' }}>
      <Text style={{ fontSize: 7.5, fontFamily: 'Inter', fontWeight: 600, color: colors.navy, marginBottom: 8 }}>{title}</Text>
      {bar('Current', current, colors.navy)}
      {bar('Proposed', proposed, colors.yellow)}
      {deltaPct > 0 && (
        <View style={{ alignSelf: 'flex-start', backgroundColor: colors.yellow, borderRadius: 8, paddingHorizontal: 7, paddingVertical: 2, marginTop: 2 }}>
          <Text style={{ fontSize: 6.5, fontFamily: 'Inter', fontWeight: 700, color: colors.navyDark }}>
            −{deltaPct.toFixed(0)}% vs current
          </Text>
        </View>
      )}
    </View>
  )
}

export function ComparisonBars({ panels }: {
  panels: { title: string; current: number; proposed: number; format: (n: number) => string }[]
}) {
  return (
    <View style={{ flexDirection: 'row', gap: 10 }}>
      {panels.map((p, i) => <ComparisonPanel key={i} {...p} />)}
    </View>
  )
}

// ── HBarChart ─────────────────────────────────────────────────────────────────
export function HBarChart({ rows, format, maxRows = 12 }: {
  rows: { label: string; value: number }[]; format: (n: number) => string; maxRows?: number
}) {
  let display = rows
  if (rows.length > maxRows) {
    const top = rows.slice(0, maxRows - 1)
    const other = rows.slice(maxRows - 1).reduce((a, r) => a + r.value, 0)
    display = [...top, { label: `Other (${rows.length - (maxRows - 1)} areas)`, value: other }]
  }
  const max = Math.max(...display.map(r => r.value), 1)

  return (
    <View>
      {display.map((r, i) => {
        const isOther = i === display.length - 1 && rows.length > maxRows
        return (
          <View key={i} style={{ flexDirection: 'row', alignItems: 'center', height: 16 }}>
            <Text style={{ width: 130, fontSize: 6.5, color: colors.inkSoft, maxLines: 1 }}>{r.label}</Text>
            <View style={{ flex: 1, justifyContent: 'center' }}>
              <View style={{
                width: `${Math.max(1.5, (r.value / max) * 100)}%`, height: 9,
                backgroundColor: isOther ? colors.mid : colors.navy,
                borderTopRightRadius: 3, borderBottomRightRadius: 3,
              }} />
            </View>
            <Text style={{ width: 58, fontSize: 6.5, fontFamily: 'Inter', fontWeight: 600, color: colors.ink, textAlign: 'right' }}>{format(r.value)}</Text>
          </View>
        )
      })}
    </View>
  )
}

// ── ProjectionChart (replaces CumulativeSavingsChart) ────────────────────────
function niceCeil(v: number): number {
  if (v <= 0) return 1
  const exp = Math.floor(Math.log10(v))
  const base = Math.pow(10, exp)
  const frac = v / base
  const niceFrac = frac <= 1 ? 1 : frac <= 2 ? 2 : frac <= 5 ? 5 : 10
  return niceFrac * base
}

function compactRands(v: number): string {
  if (Math.abs(v) >= 1_000_000) return `R ${(v / 1_000_000).toFixed(v % 1_000_000 === 0 ? 0 : 1)}M`
  if (Math.abs(v) >= 1_000) return `R ${(v / 1_000).toFixed(0)}k`
  return formatRands(v)
}

export function ProjectionChart({ cumulative, investment, breakEvenYr }: {
  cumulative: number[]; investment: number; breakEvenYr: number
}) {
  const chartW = 455
  const chartH = 140
  const gutterW = 40
  const niceMax = niceCeil(Math.max(cumulative[cumulative.length - 1] ?? 0, investment) * 1.05)
  if (niceMax <= 0) return null

  const barW = 26
  const totalW = barW * cumulative.length
  const gap = (chartW - totalW) / (cumulative.length + 1)
  const toH = (v: number) => Math.max(2, (Math.max(0, v) / niceMax) * chartH)
  const investLineY = chartH - (investment / niceMax) * chartH
  const steps = 4
  const tickVals = Array.from({ length: steps + 1 }, (_, i) => (niceMax / steps) * (steps - i))

  const breakEvenIdx = breakEvenYr > 0 ? breakEvenYr - 1 : -1
  const beX = breakEvenIdx >= 0 ? gap + breakEvenIdx * (barW + gap) + barW / 2 : 0
  const beY = breakEvenIdx >= 0 ? chartH - toH(cumulative[breakEvenIdx]) : 0

  return (
    <View wrap={false}>
      <View style={{ flexDirection: 'row' }}>
        <View style={{ width: gutterW, height: chartH + 4, justifyContent: 'space-between', alignItems: 'flex-end', paddingRight: 6 }}>
          {tickVals.map((v, i) => (
            <Text key={i} style={{ fontSize: 5.5, color: colors.mid }}>{compactRands(v)}</Text>
          ))}
        </View>
        <Svg width={chartW} height={chartH + 4}>
          {tickVals.map((v, i) => {
            const y = chartH - (v / niceMax) * chartH
            return <Line key={i} x1={0} y1={y} x2={chartW} y2={y} stroke={colors.hairline} strokeWidth={0.75} />
          })}
          <Line x1={0} y1={investLineY} x2={chartW} y2={investLineY} stroke={colors.yellow} strokeWidth={1.5} />
          {cumulative.map((val, i) => {
            const bh = toH(val)
            const x = gap + i * (barW + gap)
            return <Rect key={i} x={x} y={chartH - bh} width={barW} height={bh} rx={2} fill={colors.navy} />
          })}
          {breakEvenIdx >= 0 && (
            <>
              <Circle cx={beX} cy={beY} r={4} fill={colors.yellow} stroke="#fff" strokeWidth={1.5} />
            </>
          )}
        </Svg>
      </View>
      <View style={{ flexDirection: 'row', marginTop: 2, marginLeft: gutterW }}>
        {cumulative.map((_, i) => (
          <View key={i} style={{ width: barW + gap, paddingLeft: gap / 2 }}>
            <Text style={{ fontSize: 5.5, color: colors.mid, textAlign: 'center' }}>Yr {i + 1}</Text>
          </View>
        ))}
      </View>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 4, marginLeft: gutterW }}>
        <Text style={{ fontSize: 6.5, fontFamily: 'Inter', fontWeight: 600, color: colors.yellowDeep }}>
          Investment · {formatRands(investment)}
        </Text>
        {breakEvenIdx >= 0 && (
          <Text style={{ fontSize: 6.5, fontFamily: 'Inter', fontWeight: 600, color: colors.navy }}>
            Break-even · Yr {breakEvenYr}
          </Text>
        )}
      </View>
    </View>
  )
}

// ── EquivalencyTile ───────────────────────────────────────────────────────────
function TreeIcon() {
  return (
    <Svg width={22} height={22} viewBox="0 0 24 24">
      <Path d="M12 2 L18 12 L14.5 12 L19 19 L5 19 L9.5 12 L6 12 Z" fill={colors.navy} />
      <Rect x={10.5} y={19} width={3} height={3} fill={colors.navy} />
    </Svg>
  )
}
function CarIcon() {
  return (
    <Svg width={22} height={22} viewBox="0 0 24 24">
      <Path d="M4 16 L5.5 10 Q6 8.5 8 8.5 L16 8.5 Q18 8.5 18.5 10 L20 16 Z" fill={colors.navy} />
      <Rect x={3} y={15} width={18} height={4} rx={1.5} fill={colors.navy} />
      <Circle cx={7.5} cy={19} r={2} fill={colors.navy} />
      <Circle cx={16.5} cy={19} r={2} fill={colors.navy} />
    </Svg>
  )
}
function RoadIcon() {
  return (
    <Svg width={22} height={22} viewBox="0 0 24 24">
      <Path d="M7 20 L10 4 L14 4 L17 20 Z" fill={colors.navy} />
      <Rect x={11} y={5} width={2} height={3} fill={colors.yellow} />
      <Rect x={11} y={11} width={2} height={3} fill={colors.yellow} />
      <Rect x={11} y={17} width={2} height={2} fill={colors.yellow} />
    </Svg>
  )
}

export function EquivalencyTile({ icon, value, label }: { icon: 'tree' | 'car' | 'road'; value: string; label: string }) {
  const Icon = icon === 'tree' ? TreeIcon : icon === 'car' ? CarIcon : RoadIcon
  return (
    <View style={{ flex: 1, alignItems: 'center', backgroundColor: colors.light, borderRadius: 4, padding: '10 8' }}>
      <View style={{ width: 34, height: 34, borderRadius: 17, backgroundColor: '#fff', alignItems: 'center', justifyContent: 'center', marginBottom: 6 }}>
        <Icon />
      </View>
      <Text style={{ fontSize: 12, fontFamily: 'Inter', fontWeight: 800, color: colors.navy }}>{value}</Text>
      <Text style={{ fontSize: 6.5, color: colors.inkSoft, textAlign: 'center', marginTop: 2 }}>{label}</Text>
    </View>
  )
}
