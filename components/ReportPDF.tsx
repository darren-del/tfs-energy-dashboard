'use client'
import React from 'react'
import { Document, Page, View, Text, StyleSheet } from '@react-pdf/renderer'
import { Job } from '@/lib/types'
import { calcJob, calcRoom, formatRands, formatNum } from '@/lib/calculations'
import { getCurrentFitting, getProposedFitting } from '@/lib/fittings'

const NAVY = '#252768'
const YELLOW = '#F2C519'
const LIGHT = '#f0f2f8'
const MID = '#9a9cb8'
const MAINT_RATE = 0.04   // maintenance savings = 4% of current electricity cost
const NPV_RATE   = 0.11   // 11% discount rate for NPV

// ── Helpers ──────────────────────────────────────────────────────────────────
function calcIRR(cashFlows: number[]): number {
  let lo = -0.99, hi = 50.0
  for (let i = 0; i < 300; i++) {
    const mid = (lo + hi) / 2
    const npv = cashFlows.reduce((s, cf, n) => s + cf / Math.pow(1 + mid, n), 0)
    if (Math.abs(npv) < 0.01) return mid
    npv > 0 ? (lo = mid) : (hi = mid)
  }
  return (lo + hi) / 2
}

function npv(rate: number, flows: number[]): number {
  return flows.reduce((s, cf, n) => s + cf / Math.pow(1 + rate, n), 0)
}

// Current amp draw per fitting: (lampW × lamps + ballastW) / 253
function currentAmpPerFitting(watts: number, lamps: number, ballast: number): number {
  return (watts * lamps + ballast) / 253
}
// Proposed amp draw per fitting (LED, no ballast): watts / 220
function proposedAmpPerFitting(watts: number): number {
  return watts / 220
}

// ── Styles ────────────────────────────────────────────────────────────────────
const s = StyleSheet.create({
  page: { fontFamily: 'Helvetica', fontSize: 8.5, color: '#222', backgroundColor: '#fff', padding: 0 },
  coverPage: { backgroundColor: NAVY, width: '100%', height: '100%', flexDirection: 'column', justifyContent: 'space-between', padding: 50 },
  contentPage: { padding: '30 40', flexDirection: 'column' },

  // Cover
  coverNote: { backgroundColor: '#1e2055', borderRadius: 4, padding: '10 14', marginBottom: 30 },
  coverNoteText: { fontSize: 8, color: '#ffffff90', lineHeight: 1.6 },
  coverLogo: { fontSize: 20, fontFamily: 'Helvetica-Bold', color: YELLOW, letterSpacing: 3 },
  coverLogoSub: { fontSize: 8, color: '#ffffff50', letterSpacing: 5, marginTop: 2 },
  coverTitle: { fontSize: 30, fontFamily: 'Helvetica-Bold', color: '#fff', marginTop: 40, lineHeight: 1.2 },
  coverClient: { fontSize: 15, color: YELLOW, fontFamily: 'Helvetica-Bold', marginTop: 14 },
  coverDetail: { fontSize: 9, color: '#ffffff80', marginTop: 3 },
  coverDivider: { height: 3, backgroundColor: YELLOW, width: 50, marginTop: 24, marginBottom: 24 },
  coverFooter: { fontSize: 8, color: '#ffffff50' },

  // Page chrome
  pageHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 14, paddingBottom: 6, borderBottom: `1 solid ${LIGHT}` },
  pageHeaderLogo: { fontSize: 11, fontFamily: 'Helvetica-Bold', color: NAVY },
  pageHeaderSub: { fontSize: 6.5, color: MID },
  footer: { position: 'absolute', bottom: 20, left: 40, right: 40, flexDirection: 'row', justifyContent: 'space-between', borderTop: `0.5 solid ${LIGHT}`, paddingTop: 4 },
  footerText: { fontSize: 6.5, color: MID },

  // Section titles
  sectionHeader: { backgroundColor: NAVY, padding: '6 10', marginBottom: 8, borderRadius: 2 },
  sectionHeaderText: { fontSize: 10, fontFamily: 'Helvetica-Bold', color: '#fff', letterSpacing: 0.5 },
  sectionHeaderSub: { fontSize: 6.5, color: '#ffffff80', marginTop: 1 },

  // Body text
  body: { fontSize: 8.5, color: '#333', lineHeight: 1.7, marginBottom: 7 },
  bodyBold: { fontSize: 8.5, fontFamily: 'Helvetica-Bold', color: NAVY, marginBottom: 5 },
  yellowBar: { height: 2, backgroundColor: YELLOW, width: 36, marginBottom: 8 },

  // Tables — shared
  table: { width: '100%', marginBottom: 10 },
  tHead: { flexDirection: 'row', backgroundColor: NAVY },
  tRow: { flexDirection: 'row', borderBottom: `0.5 solid ${LIGHT}` },
  tRowAlt: { flexDirection: 'row', backgroundColor: LIGHT, borderBottom: `0.5 solid #e0e2ed` },
  tTot: { flexDirection: 'row', backgroundColor: NAVY },

  // Cells
  cL: { fontSize: 7, padding: '4 5', flex: 2, textAlign: 'left', color: '#333' },
  cR: { fontSize: 7, padding: '4 5', flex: 1, textAlign: 'right', color: '#333' },
  cC: { fontSize: 7, padding: '4 5', flex: 1, textAlign: 'center', color: '#333' },
  cLh: { fontSize: 6.5, fontFamily: 'Helvetica-Bold', color: '#fff', padding: '4 5', flex: 2, textAlign: 'left' },
  cRh: { fontSize: 6.5, fontFamily: 'Helvetica-Bold', color: '#fff', padding: '4 5', flex: 1, textAlign: 'right' },
  cCh: { fontSize: 6.5, fontFamily: 'Helvetica-Bold', color: '#fff', padding: '4 5', flex: 1, textAlign: 'center' },
  cLt: { fontSize: 7, fontFamily: 'Helvetica-Bold', color: '#fff', padding: '5 5', flex: 2, textAlign: 'left' },
  cRt: { fontSize: 7, fontFamily: 'Helvetica-Bold', color: '#fff', padding: '5 5', flex: 1, textAlign: 'right' },
  cCt: { fontSize: 7, fontFamily: 'Helvetica-Bold', color: '#fff', padding: '5 5', flex: 1, textAlign: 'center' },
  cYt: { fontSize: 7, fontFamily: 'Helvetica-Bold', color: YELLOW, padding: '5 5', flex: 1, textAlign: 'right' },
  cBold: { fontSize: 7, fontFamily: 'Helvetica-Bold', color: NAVY, padding: '4 5', flex: 1, textAlign: 'right' },

  // Executive summary list
  execRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 5, borderBottom: `0.5 solid ${LIGHT}` },
  execLabel: { fontSize: 8.5, color: '#555' },
  execValue: { fontSize: 8.5, fontFamily: 'Helvetica-Bold', color: NAVY },
  execValueYellow: { fontSize: 8.5, fontFamily: 'Helvetica-Bold', color: '#b08a00' },

  // Solution summary
  solSection: { marginBottom: 10 },
  solTitle: { fontSize: 8, fontFamily: 'Helvetica-Bold', color: '#fff', backgroundColor: NAVY, padding: '4 8', marginBottom: 0 },
  solRow: { flexDirection: 'row', borderBottom: `0.5 solid ${LIGHT}` },
  solRowAlt: { flexDirection: 'row', backgroundColor: LIGHT, borderBottom: `0.5 solid #e0e2ed` },
  solRowTot: { flexDirection: 'row', backgroundColor: '#e8eaf5', borderBottom: `1 solid ${NAVY}` },
  solLabel: { fontSize: 7, padding: '4 6', flex: 3, color: '#333' },
  solLabelB: { fontSize: 7, fontFamily: 'Helvetica-Bold', padding: '4 6', flex: 3, color: NAVY },
  solVal: { fontSize: 7, padding: '4 6', flex: 1, textAlign: 'right', color: '#333' },
  solValB: { fontSize: 7, fontFamily: 'Helvetica-Bold', padding: '4 6', flex: 1, textAlign: 'right', color: NAVY },
  solValY: { fontSize: 7, fontFamily: 'Helvetica-Bold', padding: '4 6', flex: 1, textAlign: 'right', color: '#b08a00' },
  solHead: { fontSize: 6.5, fontFamily: 'Helvetica-Bold', padding: '4 6', flex: 1, textAlign: 'right', color: '#fff', backgroundColor: NAVY },
  solHeadL: { fontSize: 6.5, fontFamily: 'Helvetica-Bold', padding: '4 6', flex: 3, textAlign: 'left', color: '#fff', backgroundColor: NAVY },
})

// ── Page chrome ───────────────────────────────────────────────────────────────
function PH({ client }: { client: string }) {
  return (
    <View style={s.pageHeader} fixed>
      <View>
        <Text style={s.pageHeaderLogo}>TFS ENERGY</Text>
        <Text style={s.pageHeaderSub}>LED Lighting Audit Report</Text>
      </View>
      <Text style={s.pageHeaderSub}>{client}</Text>
    </View>
  )
}

function PF({ label }: { label: string }) {
  return (
    <View style={s.footer} fixed>
      <Text style={s.footerText}>TFS Energy · {label} · Confidential</Text>
      <Text style={s.footerText} render={({ pageNumber, totalPages }) => `${pageNumber} of ${totalPages}`} />
    </View>
  )
}

function SH({ title, sub }: { title: string; sub?: string }) {
  return (
    <View style={s.sectionHeader}>
      <Text style={s.sectionHeaderText}>{title.toUpperCase()}</Text>
      {sub ? <Text style={s.sectionHeaderSub}>{sub}</Text> : null}
    </View>
  )
}

// ── 1. COVER ─────────────────────────────────────────────────────────────────
function CoverPage({ job }: { job: Job }) {
  return (
    <Page size="A4" style={s.page}>
      <View style={s.coverPage}>
        <View>
          <Text style={s.coverLogo}>TFS ENERGY</Text>
          <Text style={s.coverLogoSub}>TOTAL FACILITIES SOLUTIONS</Text>
        </View>

        <View style={s.coverNote}>
          <Text style={s.coverNoteText}>
            Note: There is no charge for this report which has taken professional time and effort to create. All we ask is that
            if ever you decide to proceed in the future, you give us the opportunity to re-quote against anyone else you may engage with.{'\n\n'}
            The price quoted herein includes full installation and project management.{'\n\n'}
            Please note that although we calculate what the correct lux levels will be with a fair amount of accuracy, at any stage when
            we have to increase the quantity of luminaires to achieve a higher lux level, this is for the client's account. Any faulty
            wiring, conduit, fittings or plug points which need replacing will be invoiced as a separate cost to the client.{'\n\n'}
            Our costings are based on the quantities on the initial count. There can be inaccuracies and any changes will be subject to
            discussion with the client and ultimately for the client's account.
          </Text>
        </View>

        <View>
          <Text style={s.coverTitle}>Lighting Audit Report</Text>
          <Text style={s.coverClient}>{job.clientName}</Text>
          <Text style={s.coverDetail}>LED New Retrofit · Energy Efficient Lighting Retrofit Project</Text>
          <View style={s.coverDivider} />
          <Text style={s.coverDetail}>{job.siteAddress}</Text>
          <Text style={s.coverDetail}>{job.date}</Text>
        </View>

        <View>
          <Text style={s.coverFooter}>Prepared by: Philip Melton · 082-525-1796 · pmelton@tfsenergy.co.za</Text>
          <Text style={s.coverFooter}>TFS Energy cc · PO Box 425, Jukskei Park 2153 · Reg # 2011/064736/24 · VAT # 490-026-1677</Text>
        </View>
      </View>
    </Page>
  )
}

// ── 2. DEAR SIRS LETTER ───────────────────────────────────────────────────────
function LetterPage({ job }: { job: Job }) {
  return (
    <Page size="A4" style={{ ...s.page, ...s.contentPage }}>
      <PH client={job.clientName} />
      <SH title="Introduction" />
      <Text style={s.body}>{job.date}</Text>
      <Text style={{ ...s.body, marginBottom: 14 }}>The Directors{'\n'}{job.clientName}{'\n'}{job.siteAddress}</Text>
      <Text style={s.body}>Dear Sirs,</Text>
      <Text style={{ ...s.bodyBold, marginTop: 4 }}>RE: LED Lighting Upgrade — Energy Audit Report</Text>
      <View style={s.yellowBar} />
      <Text style={s.body}>
        Thank you for the opportunity to do a Lighting Energy Efficiency Audit of your facility based on the light quantities as
        required. Please be aware that the calculations attached are mathematical calculations and although they should be very
        accurate, there might be some variances caused by a tariff variance or the number of hours being incorrect. We have taken
        the cost of electricity from your electricity account, used the hours your staff have said your lamps are burning and taken
        the wattages of your current installation and placed them in a spreadsheet which uses straightforward mathematics to
        calculate the numbers.
      </Text>
      <Text style={s.body}>
        We have used energy-saving technology which we view to be most suitable throughout. Quality of product and lifespan is
        important to us as we want the technology to have reliability and longevity. The LED luminaires we recommend are always
        60,000 working hours and above.
      </Text>
      <Text style={{ ...s.bodyBold, marginTop: 4 }}>Savings which will have a substantial effect but not included:</Text>
      <Text style={s.body}>{'  1.  No maintenance or purchase of lights for at least 3 years. No maintenance teams to pay. This frees maintenance\n       staff up to attend to other machinery.'}</Text>
      <Text style={s.body}>{'  2.  No budget expenditure on lights for at least 3 years.'}</Text>
      <Text style={s.body}>{'  3.  Carbon Tax when it is implemented.'}</Text>
      <Text style={{ ...s.bodyBold, marginTop: 8 }}>COMMENT ON TARIFF HIKES</Text>
      <Text style={s.body}>
        Eskom has been awarded increases to recover losses from corruption and loopholes in the MYPD (Multi-Year Price
        Determination) rules by increasing your tariffs by an estimated {job.eskomIncrease}% annually. Each successive increase
        amplifies the return on this investment — the savings generated by LED fittings grow year on year. This report includes
        a 4-year financial projection incorporating the applicable Eskom escalation rate so that you can see the compounding
        benefit over time.
      </Text>
      <Text style={{ ...s.body, marginTop: 10 }}>Yours faithfully,</Text>
      <Text style={{ ...s.bodyBold, marginTop: 18 }}>Philip Melton</Text>
      <Text style={s.body}>Managing Director · TFS Energy · 082-525-1796 · pmelton@tfsenergy.co.za</Text>
      <PF label="Introduction" />
    </Page>
  )
}

// ── 3. PROJECT OVERVIEW + REFERENCES ─────────────────────────────────────────
function OverviewPage({ job }: { job: Job }) {
  const points = [
    'The current view has been replaced in the report with energy-savings globes and fittings on an estimated requirement basis.',
    'We have allowed for new fittings.',
    'We highly recommend the removal of current lights.',
    `The warranty offered is a full 3-year replacement carry-in uninstalled. It is the duty of the client's maintenance department to change out any faulty lights. We have not in 12 years experienced very many faulty products; such is the quality of the luminaires used.`,
    'The reduction in electricity on this report is substantial per annum.',
    'Please note that although we calculate what the correct lux levels will be with a fair amount of accuracy, at any stage when we have to increase the quantity of luminaires to achieve a higher lux level, this is for the client\'s account.',
    `Eskom tariff escalation of ${job.eskomIncrease}% per annum has been used in all financial projections.`,
    'We do not profit from the installation cost. We pass on these costs directly.',
  ]
  const refs = [
    { company: 'Alcon Aluminium', contact: 'CEO Mr. Douglas Gray', phone: '082-788-1863' },
    { company: 'Sunbake Bakeries', contact: 'Engineer Mr. Danie Combrink', phone: '079-893-8864' },
    { company: 'Bidvest Lufil Packaging', contact: 'Regional Manager Mr. Kevin Swan', phone: '086-11-58345' },
    { company: 'Macsteel', contact: 'Mr. Daniel Carvalho', phone: '082-371-9082' },
    { company: 'East Balt Bakeries', contact: 'Engineer Mr. Kobus Wentzel', phone: '060-997-8748' },
  ]
  return (
    <Page size="A4" style={{ ...s.page, ...s.contentPage }}>
      <PH client={job.clientName} />
      <SH title="Overview of Lighting Retrofit Project" sub="Responses to requirements on your current lighting installation" />
      {points.map((p, i) => (
        <View key={i} style={{ flexDirection: 'row', marginBottom: 6, alignItems: 'flex-start' }}>
          <View style={{ width: 16, height: 16, backgroundColor: NAVY, borderRadius: 8, marginRight: 8, marginTop: 1, flexShrink: 0, alignItems: 'center', justifyContent: 'center' }}>
            <Text style={{ fontSize: 6.5, fontFamily: 'Helvetica-Bold', color: YELLOW }}>{i + 1}</Text>
          </View>
          <Text style={{ ...s.body, flex: 1, marginBottom: 0 }}>{p}</Text>
        </View>
      ))}
      <View style={{ marginTop: 12 }}>
        <Text style={{ ...s.bodyBold, marginBottom: 6 }}>References:</Text>
        {refs.map((r, i) => (
          <View key={i} style={{ flexDirection: 'row', marginBottom: 4 }}>
            <Text style={{ fontSize: 8, color: '#333', width: 160, fontFamily: 'Helvetica-Bold' }}>{r.company}</Text>
            <Text style={{ fontSize: 8, color: '#555', flex: 1 }}>{r.contact} · {r.phone}</Text>
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

// ── 4. EXECUTIVE SUMMARY ─────────────────────────────────────────────────────
function ExecutiveSummaryPage({ job }: { job: Job }) {
  const sum = calcJob(job)
  const maintSavings = sum.totalCurrentCostPerYear * MAINT_RATE
  const totalSavingsY1 = sum.totalAnnualSavings + maintSavings
  const totalSavingsY2 = totalSavingsY1 * (1 + job.eskomIncrease / 100)
  const totalSavingsY3 = totalSavingsY2 * (1 + job.eskomIncrease / 100)
  const totalSavingsY4 = totalSavingsY3 * (1 + job.eskomIncrease / 100)
  const total4yr = totalSavingsY1 + totalSavingsY2 + totalSavingsY3 + totalSavingsY4
  const savingsPct = sum.totalCurrentCostPerYear > 0 ? (sum.totalAnnualSavings / sum.totalCurrentCostPerYear) * 100 : 0
  const roiMonths = totalSavingsY1 > 0 ? sum.totalProjectCost / (totalSavingsY1 / 12) : 0
  const eskomLast5 = ((Math.pow(1 + job.eskomIncrease / 100, 5) - 1) * 100).toFixed(1)
  const savingsY1AfterCost = totalSavingsY1 - sum.totalProjectCost

  const rows: { label: string; value: string; yellow?: boolean }[] = [
    { label: 'Actual Cost of Electricity per kWh', value: `R ${job.costPerKwh.toFixed(4)}` },
    { label: 'Current Annual Cost of Lighting Electricity', value: formatRands(sum.totalCurrentCostPerYear) },
    { label: 'Retrofit New Annual Cost of Electricity', value: formatRands(sum.totalProposedCostPerYear) },
    { label: 'Rand Savings (Energy Only)', value: formatRands(sum.totalAnnualSavings), yellow: true },
    { label: 'Percentage Savings', value: `${savingsPct.toFixed(0)}%`, yellow: true },
    { label: 'Cost of Retrofit', value: formatRands(sum.totalProjectCost) },
    { label: 'Actual Cost of Retrofit to Client', value: formatRands(sum.totalProjectCost) },
    { label: 'Savings Year 1 After Retrofit Costs', value: formatRands(savingsY1AfterCost), yellow: savingsY1AfterCost > 0 },
    { label: 'Eskom Annual Increase % Used', value: `${job.eskomIncrease}%` },
    { label: 'Eskom Increases Compounded over 5 Years', value: `${eskomLast5}%` },
    { label: 'Savings Year 2', value: formatRands(totalSavingsY2) },
    { label: 'Savings Year 3', value: formatRands(totalSavingsY3) },
    { label: 'Savings Year 4', value: formatRands(totalSavingsY4) },
    { label: 'Total Savings Over 4 Years', value: formatRands(total4yr), yellow: true },
    { label: 'Return on Investment in Months', value: roiMonths > 0 ? formatNum(roiMonths, 2) : '—', yellow: true },
  ]

  return (
    <Page size="A4" style={{ ...s.page, ...s.contentPage }}>
      <PH client={job.clientName} />
      <SH title="Executive Summary" sub={`${job.clientName} · ${job.date}`} />
      <View style={{ marginBottom: 6 }}>
        {rows.map((r, i) => (
          <View key={i} style={s.execRow}>
            <Text style={s.execLabel}>{r.label}</Text>
            <Text style={r.yellow ? s.execValueYellow : s.execValue}>{r.value}</Text>
          </View>
        ))}
      </View>
      <Text style={{ ...s.body, color: MID, marginTop: 6, fontSize: 7.5 }}>
        Please note: This report is the intellectual property of TFS Energy and should not be distributed without permission.
      </Text>
      <PF label="Executive Summary" />
    </Page>
  )
}

// ── 5. CURRENT LIGHTING TABLE ─────────────────────────────────────────────────
function CurrentLightingPage({ job }: { job: Job }) {
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
        {/* Totals banner */}
        <View style={{ flexDirection: 'row', backgroundColor: '#e8eaf5', padding: '4 6', marginBottom: 4, borderRadius: 2 }}>
          <Text style={{ fontSize: 7, fontFamily: 'Helvetica-Bold', color: NAVY, flex: 1 }}>
            TOTAL FITTINGS: {job.rooms.reduce((s, r) => s + r.quantity, 0)}
          </Text>
          <Text style={{ fontSize: 7, fontFamily: 'Helvetica-Bold', color: NAVY, flex: 1 }}>
            kW/DAY: {formatNum(totalKwhDay, 2)}
          </Text>
          <Text style={{ fontSize: 7, fontFamily: 'Helvetica-Bold', color: NAVY, flex: 1 }}>
            kWh/YEAR: {formatNum(sum.totalCurrentKwhPerYear, 0)}
          </Text>
          <Text style={{ fontSize: 7, fontFamily: 'Helvetica-Bold', color: NAVY, flex: 1 }}>
            COST/YEAR: {formatRands(sum.totalCurrentCostPerYear)}
          </Text>
          <Text style={{ fontSize: 7, fontFamily: 'Helvetica-Bold', color: NAVY, flex: 1 }}>
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
      <Text style={{ ...s.body, color: MID, fontSize: 7 }}>
        Please note: This report is the intellectual property of TFS Energy and should not be distributed without permission.
      </Text>
      <PF label="Current Lighting" />
    </Page>
  )
}

// ── 6. PROPOSED LIGHTING TABLE ────────────────────────────────────────────────
function ProposedLightingPage({ job }: { job: Job }) {
  const sum = calcJob(job)
  const totalKwhDay = sum.totalProposedKwhPerYear / 365
  const totalAmpDraw = job.rooms.reduce((acc, room) => {
    const f = getProposedFitting(room.proposedFittingCode)
    if (!f) return acc
    return acc + proposedAmpPerFitting(f.watts) * room.quantity
  }, 0)

  return (
    <Page size="A4" style={{ ...s.page, ...s.contentPage }}>
      <PH client={job.clientName} />
      <SH title="Proposed Lighting System" sub={`${job.clientName} · Rate per kWh: R ${job.costPerKwh.toFixed(4)}`} />

      <View style={s.table}>
        <View style={{ flexDirection: 'row', backgroundColor: '#e8eaf5', padding: '4 6', marginBottom: 4, borderRadius: 2 }}>
          <Text style={{ fontSize: 7, fontFamily: 'Helvetica-Bold', color: NAVY, flex: 1 }}>
            TOTAL FITTINGS: {job.rooms.reduce((s, r) => s + r.quantity, 0)}
          </Text>
          <Text style={{ fontSize: 7, fontFamily: 'Helvetica-Bold', color: NAVY, flex: 1 }}>
            kWh/YEAR: {formatNum(sum.totalProposedKwhPerYear, 0)}
          </Text>
          <Text style={{ fontSize: 7, fontFamily: 'Helvetica-Bold', color: NAVY, flex: 1 }}>
            COST/YEAR: {formatRands(sum.totalProposedCostPerYear)}
          </Text>
          <Text style={{ fontSize: 7, fontFamily: 'Helvetica-Bold', color: NAVY, flex: 1 }}>
            AMP DRAW: {formatNum(totalAmpDraw, 2)}
          </Text>
        </View>

        <View style={s.tHead}>
          <Text style={{ ...s.cLh, flex: 1.5 }}>#</Text>
          <Text style={{ ...s.cLh, flex: 2 }}>Area</Text>
          <Text style={s.cLh}>Comment</Text>
          <Text style={s.cCh}>Current Fitting</Text>
          <Text style={s.cCh}>Proposed Type</Text>
          <Text style={s.cCh}>Qty</Text>
          <Text style={s.cCh}>Hrs/Day</Text>
          <Text style={s.cCh}>Lamp W</Text>
          <Text style={s.cCh}>kWh/Year</Text>
          <Text style={s.cCh}>R/kWh</Text>
          <Text style={s.cCh}>kWh Cost/Day</Text>
          <Text style={s.cRh}>Cost/Year</Text>
          <Text style={s.cCh}>Amp/Fit</Text>
          <Text style={s.cCh}>Amp Total</Text>
        </View>

        {job.rooms.map((room, i) => {
          const calc = calcRoom(room, job)
          const cf = getCurrentFitting(room.currentFittingCode)
          const pf = getProposedFitting(room.proposedFittingCode)
          const ampPer = pf ? proposedAmpPerFitting(pf.watts) : 0
          const Row = i % 2 === 0 ? s.tRow : s.tRowAlt
          return (
            <View key={room.id} style={Row} wrap={false}>
              <Text style={{ ...s.cL, flex: 1.5 }}>{i + 1}</Text>
              <Text style={{ ...s.cL, flex: 2 }}>{room.areaDescription}</Text>
              <Text style={s.cL}>{room.comments || '—'}</Text>
              <Text style={s.cC}>{cf?.label ?? room.currentFittingCode}</Text>
              <Text style={s.cC}>{pf?.label ?? room.proposedFittingCode}</Text>
              <Text style={s.cC}>{room.quantity}</Text>
              <Text style={s.cC}>{room.hoursPerDay}</Text>
              <Text style={s.cC}>{pf ? pf.watts : '—'}W</Text>
              <Text style={s.cC}>{formatNum(calc.proposedKwhPerYear, 0)}</Text>
              <Text style={s.cC}>R {job.costPerKwh.toFixed(2)}</Text>
              <Text style={s.cC}>{formatNum(calc.proposedKwhPerDay, 2)}</Text>
              <Text style={s.cBold}>{formatRands(calc.proposedCostPerYear)}</Text>
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
          <Text style={s.cCt} />
          <Text style={s.cCt}>{job.rooms.reduce((s, r) => s + r.quantity, 0)}</Text>
          <Text style={s.cCt} />
          <Text style={s.cCt} />
          <Text style={s.cCt}>{formatNum(sum.totalProposedKwhPerYear, 0)}</Text>
          <Text style={s.cCt} />
          <Text style={s.cCt}>{formatNum(totalKwhDay, 2)}</Text>
          <Text style={s.cYt}>{formatRands(sum.totalProposedCostPerYear)}</Text>
          <Text style={s.cCt} />
          <Text style={s.cCt}>{formatNum(totalAmpDraw, 2)}</Text>
        </View>
      </View>
      <Text style={{ ...s.body, color: MID, fontSize: 7 }}>
        Please note: This report is the intellectual property of TFS Energy and should not be distributed without permission.
      </Text>
      <PF label="Proposed Lighting" />
    </Page>
  )
}

// ── 7. COST BREAKDOWN TABLE ───────────────────────────────────────────────────
function CostPage({ job }: { job: Job }) {
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
      <Text style={{ ...s.body, color: MID, fontSize: 7 }}>
        Please note: This report is the intellectual property of TFS Energy and should not be distributed without permission.
      </Text>
      <PF label="Cost Breakdown" />
    </Page>
  )
}

// ── 8. SAVINGS TABLE ──────────────────────────────────────────────────────────
function SavingsPage({ job }: { job: Job }) {
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
              <Text style={{ ...s.cR, color: yr1Net >= 0 ? '#1a7a1a' : '#cc0000' }}>{formatRands(yr1Net)}</Text>
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
      <Text style={{ ...s.body, color: MID, fontSize: 7 }}>
        Please note: This report is the intellectual property of TFS Energy and should not be distributed without permission.
      </Text>
      <PF label="Savings Summary" />
    </Page>
  )
}

// ── 9. SOLUTION SUMMARY (3-year comparison) ───────────────────────────────────
function SolutionSummaryPage({ job }: { job: Job }) {
  const sum = calcJob(job)
  const eskom = job.eskomIncrease / 100
  const maintY1 = sum.totalCurrentCostPerYear * MAINT_RATE
  const maintY2 = maintY1 * (1 + eskom)
  const maintY3 = maintY2 * (1 + eskom)

  // Current costs
  const curY1 = sum.totalCurrentCostPerYear
  const curY2 = curY1 * (1 + eskom)
  const curY3 = curY2 * (1 + eskom)
  const curTerm = curY1 + curY2 + curY3
  const curDay = curY1 / 365
  const curMonth = curY1 / 12

  // LED costs (no escalation — savings increase each year but LED cost stays same)
  const ledY1 = sum.totalProposedCostPerYear
  const ledY2 = ledY1 * (1 + eskom)
  const ledY3 = ledY2 * (1 + eskom)
  const ledTerm = ledY1 + ledY2 + ledY3
  const ledDay = ledY1 / 365
  const ledMonth = ledY1 / 12

  // Savings
  const savEnY1 = curY1 - ledY1
  const savEnY2 = curY2 - ledY2
  const savEnY3 = curY3 - ledY3
  const savEnTerm = savEnY1 + savEnY2 + savEnY3
  const savEnDay = savEnY1 / 365
  const savEnMonth = savEnY1 / 12

  const savTotY1 = savEnY1 + maintY1
  const savTotY2 = savEnY2 + maintY2
  const savTotY3 = savEnY3 + maintY3
  const savTotTerm = savTotY1 + savTotY2 + savTotY3
  const savTotDay = savTotY1 / 365
  const savTotMonth = savTotY1 / 12

  const savPctEn = curY1 > 0 ? ((savEnY1 / curY1) * 100).toFixed(1) : '0'
  const savPctTot = (curY1 + maintY1) > 0 ? ((savTotY1 / (curY1 + maintY1)) * 100).toFixed(1) : '0'

  function fr(n: number) { return formatRands(n) }

  return (
    <Page size="A4" style={{ ...s.page, ...s.contentPage }}>
      <PH client={job.clientName} />
      <SH title="Financial Summary" sub={`Solution Summary — ${job.clientName} · ${job.date}`} />
      <Text style={{ ...s.body, marginBottom: 8 }}>
        Below we demonstrate the savings on our offering compared against your present situation.
      </Text>

      {/* Current */}
      <View style={s.solSection}>
        <Text style={s.solTitle}>COST OF CURRENT 'TRADITIONAL' INSTALLATION OVER THE 3-YEAR TERM</Text>
        <View style={{ flexDirection: 'row' }}>
          <Text style={s.solHeadL}>Item</Text>
          <Text style={s.solHead}>Day</Text>
          <Text style={s.solHead}>Month</Text>
          <Text style={s.solHead}>Year 1</Text>
          <Text style={s.solHead}>Year 2</Text>
          <Text style={s.solHead}>Year 3</Text>
          <Text style={s.solHead}>3-Year Term</Text>
        </View>
        {[
          { label: 'Consumption in R\'s', d: curDay, m: curMonth, y1: curY1, y2: curY2, y3: curY3, t: curTerm },
          { label: 'Material Replacement (maint. saving)', d: maintY1/365, m: maintY1/12, y1: maintY1, y2: maintY2, y3: maintY3, t: maintY1+maintY2+maintY3 },
        ].map((row, i) => (
          <View key={i} style={i % 2 === 0 ? s.solRow : s.solRowAlt}>
            <Text style={s.solLabel}>{row.label}</Text>
            <Text style={s.solVal}>{fr(row.d)}</Text>
            <Text style={s.solVal}>{fr(row.m)}</Text>
            <Text style={s.solVal}>{fr(row.y1)}</Text>
            <Text style={s.solVal}>{fr(row.y2)}</Text>
            <Text style={s.solVal}>{fr(row.y3)}</Text>
            <Text style={s.solValB}>{fr(row.t)}</Text>
          </View>
        ))}
        <View style={s.solRowTot}>
          <Text style={s.solLabelB}>TOTAL</Text>
          <Text style={s.solValB}>{fr(curDay + maintY1/365)}</Text>
          <Text style={s.solValB}>{fr(curMonth + maintY1/12)}</Text>
          <Text style={s.solValB}>{fr(curY1 + maintY1)}</Text>
          <Text style={s.solValB}>{fr(curY2 + maintY2)}</Text>
          <Text style={s.solValB}>{fr(curY3 + maintY3)}</Text>
          <Text style={s.solValY}>{fr(curTerm + maintY1+maintY2+maintY3)}</Text>
        </View>
        <View style={{ flexDirection: 'row', marginTop: 2 }}>
          <Text style={{ ...s.solLabel, color: MID }}>Consumption in kWh</Text>
          <Text style={{ ...s.solVal, color: MID }}>{formatNum(sum.totalCurrentKwhPerYear/365, 2)}</Text>
          <Text style={{ ...s.solVal, color: MID }}>{formatNum(sum.totalCurrentKwhPerYear/12, 0)}</Text>
          <Text style={{ ...s.solVal, color: MID }}>{formatNum(sum.totalCurrentKwhPerYear, 0)}</Text>
          <Text style={{ ...s.solVal, color: MID }}>{formatNum(sum.totalCurrentKwhPerYear, 0)}</Text>
          <Text style={{ ...s.solVal, color: MID }}>{formatNum(sum.totalCurrentKwhPerYear, 0)}</Text>
          <Text style={{ ...s.solValB, color: MID }}>{formatNum(sum.totalCurrentKwhPerYear * 3, 0)}</Text>
        </View>
      </View>

      {/* LED */}
      <View style={s.solSection}>
        <Text style={s.solTitle}>COST OF LED OVER THE SAME TERM</Text>
        <View style={{ flexDirection: 'row' }}>
          <Text style={s.solHeadL}>Item</Text>
          <Text style={s.solHead}>Day</Text>
          <Text style={s.solHead}>Month</Text>
          <Text style={s.solHead}>Year 1</Text>
          <Text style={s.solHead}>Year 2</Text>
          <Text style={s.solHead}>Year 3</Text>
          <Text style={s.solHead}>3-Year Term</Text>
        </View>
        <View style={s.solRow}>
          <Text style={s.solLabel}>Consumption in R&apos;s</Text>
          <Text style={s.solVal}>{fr(ledDay)}</Text>
          <Text style={s.solVal}>{fr(ledMonth)}</Text>
          <Text style={s.solVal}>{fr(ledY1)}</Text>
          <Text style={s.solVal}>{fr(ledY2)}</Text>
          <Text style={s.solVal}>{fr(ledY3)}</Text>
          <Text style={s.solValB}>{fr(ledTerm)}</Text>
        </View>
        <View style={s.solRowAlt}>
          <Text style={s.solLabel}>Material Replacement</Text>
          <Text style={s.solVal}>R 0</Text>
          <Text style={s.solVal}>R 0</Text>
          <Text style={s.solVal}>R 0</Text>
          <Text style={s.solVal}>R 0</Text>
          <Text style={s.solVal}>R 0</Text>
          <Text style={s.solValB}>R 0</Text>
        </View>
        <View style={{ flexDirection: 'row', marginTop: 2 }}>
          <Text style={{ ...s.solLabel, color: MID }}>Consumption in kWh</Text>
          <Text style={{ ...s.solVal, color: MID }}>{formatNum(sum.totalProposedKwhPerYear/365, 2)}</Text>
          <Text style={{ ...s.solVal, color: MID }}>{formatNum(sum.totalProposedKwhPerYear/12, 0)}</Text>
          <Text style={{ ...s.solVal, color: MID }}>{formatNum(sum.totalProposedKwhPerYear, 0)}</Text>
          <Text style={{ ...s.solVal, color: MID }}>{formatNum(sum.totalProposedKwhPerYear, 0)}</Text>
          <Text style={{ ...s.solVal, color: MID }}>{formatNum(sum.totalProposedKwhPerYear, 0)}</Text>
          <Text style={{ ...s.solValB, color: MID }}>{formatNum(sum.totalProposedKwhPerYear * 3, 0)}</Text>
        </View>
      </View>

      {/* Savings */}
      <View style={s.solSection}>
        <Text style={s.solTitle}>THE SAVINGS</Text>
        <View style={{ flexDirection: 'row' }}>
          <Text style={s.solHeadL}>Item</Text>
          <Text style={s.solHead}>Day</Text>
          <Text style={s.solHead}>Month</Text>
          <Text style={s.solHead}>Year 1</Text>
          <Text style={s.solHead}>Year 2</Text>
          <Text style={s.solHead}>Year 3</Text>
          <Text style={s.solHead}>3-Year Term</Text>
        </View>
        {[
          { label: 'Consumption in R\'s', d: savEnDay, m: savEnMonth, y1: savEnY1, y2: savEnY2, y3: savEnY3, t: savEnTerm },
          { label: 'Material Replacement', d: maintY1/365, m: maintY1/12, y1: maintY1, y2: maintY2, y3: maintY3, t: maintY1+maintY2+maintY3 },
        ].map((row, i) => (
          <View key={i} style={i % 2 === 0 ? s.solRow : s.solRowAlt}>
            <Text style={s.solLabel}>{row.label}</Text>
            <Text style={s.solVal}>{fr(row.d)}</Text>
            <Text style={s.solVal}>{fr(row.m)}</Text>
            <Text style={s.solVal}>{fr(row.y1)}</Text>
            <Text style={s.solVal}>{fr(row.y2)}</Text>
            <Text style={s.solVal}>{fr(row.y3)}</Text>
            <Text style={s.solValB}>{fr(row.t)}</Text>
          </View>
        ))}
        <View style={s.solRowTot}>
          <Text style={s.solLabelB}>ANTICIPATED SAVINGS IN R&apos;s ({savPctTot}% total / {savPctEn}% energy)</Text>
          <Text style={s.solValY}>{fr(savTotDay)}</Text>
          <Text style={s.solValY}>{fr(savTotMonth)}</Text>
          <Text style={s.solValY}>{fr(savTotY1)}</Text>
          <Text style={s.solValY}>{fr(savTotY2)}</Text>
          <Text style={s.solValY}>{fr(savTotY3)}</Text>
          <Text style={s.solValY}>{fr(savTotTerm)}</Text>
        </View>
      </View>

      <PF label="Financial Summary" />
    </Page>
  )
}

// ── 10. ANNUALISED SAVINGS MODEL ──────────────────────────────────────────────
function AnnualisedSavingsPage({ job }: { job: Job }) {
  const sum = calcJob(job)
  const eskom = job.eskomIncrease / 100

  const maintY1 = sum.totalCurrentCostPerYear * MAINT_RATE
  const energyY1 = sum.totalAnnualSavings
  const totalY1 = energyY1 + maintY1

  const curCostY1 = sum.totalCurrentCostPerYear
  const curCostY2 = curCostY1 * (1 + eskom)
  const curCostY3 = curCostY2 * (1 + eskom)
  const curCostY4 = curCostY3 * (1 + eskom)

  const ledCostY1 = sum.totalProposedCostPerYear
  const ledCostY2 = ledCostY1 * (1 + eskom)
  const ledCostY3 = ledCostY2 * (1 + eskom)
  const ledCostY4 = ledCostY3 * (1 + eskom)

  const enSavY1 = curCostY1 - ledCostY1
  const enSavY2 = curCostY2 - ledCostY2
  const enSavY3 = curCostY3 - ledCostY3
  const enSavY4 = curCostY4 - ledCostY4

  const maintY2 = maintY1 * (1 + eskom)
  const maintY3 = maintY2 * (1 + eskom)
  const maintY4 = maintY3 * (1 + eskom)

  const totSavY1 = enSavY1 + maintY1
  const totSavY2 = enSavY2 + maintY2
  const totSavY3 = enSavY3 + maintY3
  const totSavY4 = enSavY4 + maintY4

  const cumY1 = totSavY1 - sum.totalProjectCost
  const cumY2 = cumY1 + totSavY2
  const cumY3 = cumY2 + totSavY3
  const cumY4 = cumY3 + totSavY4

  const roiMonths = totSavY1 > 0 ? sum.totalProjectCost / (totSavY1 / 12) : 0
  const monthSavY1Y2 = (totSavY1 + totSavY2) / 24

  function fr(n: number) { return formatRands(n) }
  function row(label: string, y1: number, y2: number, y3: number, y4: number, tot: number, bold?: boolean, yellow?: boolean) {
    const st = bold ? { ...s.solLabel, fontFamily: 'Helvetica-Bold' as const } : s.solLabel
    const vst = yellow ? s.solValY : bold ? s.solValB : s.solVal
    return (
      <View style={s.solRow}>
        <Text style={st}>{label}</Text>
        <Text style={vst}>{fr(y1)}</Text>
        <Text style={vst}>{fr(y2)}</Text>
        <Text style={vst}>{fr(y3)}</Text>
        <Text style={vst}>{fr(y4)}</Text>
        <Text style={vst}>{fr(tot)}</Text>
      </View>
    )
  }

  return (
    <Page size="A4" style={{ ...s.page, ...s.contentPage }}>
      <PH client={job.clientName} />
      <SH title="Annualised Savings Model — ROI Time Frame" sub={`${job.clientName} · ${job.date}`} />

      <View style={s.solSection}>
        <View style={{ flexDirection: 'row' }}>
          <Text style={s.solHeadL}>Description</Text>
          <Text style={s.solHead}>Year 1</Text>
          <Text style={s.solHead}>Year 2</Text>
          <Text style={s.solHead}>Year 3</Text>
          <Text style={s.solHead}>Year 4</Text>
          <Text style={s.solHead}>Totals</Text>
        </View>
        {row('Cost of Lighting Electricity (Current)', curCostY1, curCostY2, curCostY3, curCostY4, curCostY1+curCostY2+curCostY3+curCostY4)}
        {row('Cost of Lighting Electricity (LED)', ledCostY1, ledCostY2, ledCostY3, ledCostY4, ledCostY1+ledCostY2+ledCostY3+ledCostY4)}
        {row('Energy Savings', enSavY1, enSavY2, enSavY3, enSavY4, enSavY1+enSavY2+enSavY3+enSavY4, true)}
        {row('Savings — Non-Cost Replacement & Maintenance', maintY1, maintY2, maintY3, maintY4, maintY1+maintY2+maintY3+maintY4)}
        <View style={s.solRowTot}>
          <Text style={s.solLabelB}>Total Savings</Text>
          <Text style={s.solValY}>{fr(totSavY1)}</Text>
          <Text style={s.solValY}>{fr(totSavY2)}</Text>
          <Text style={s.solValY}>{fr(totSavY3)}</Text>
          <Text style={s.solValY}>{fr(totSavY4)}</Text>
          <Text style={s.solValY}>{fr(totSavY1+totSavY2+totSavY3+totSavY4)}</Text>
        </View>
      </View>

      <View style={{ ...s.solSection, marginTop: 8 }}>
        <View style={{ flexDirection: 'row' }}>
          <Text style={s.solHeadL}>ROI Summary</Text>
          <Text style={s.solHead}>Year 1</Text>
          <Text style={s.solHead}>Year 2</Text>
          <Text style={s.solHead}>Year 3</Text>
          <Text style={s.solHead}>Year 4</Text>
          <Text style={s.solHead} />
        </View>
        <View style={s.solRow}>
          <Text style={s.solLabel}>Total Initial Cost</Text>
          <Text style={s.solValB}>{fr(sum.totalProjectCost)}</Text>
          <Text style={s.solVal} />
          <Text style={s.solVal} />
          <Text style={s.solVal} />
          <Text style={s.solVal} />
        </View>
        <View style={s.solRowAlt}>
          <Text style={s.solLabel}>Deficit from Previous Year</Text>
          <Text style={s.solVal}>R 0</Text>
          <Text style={s.solVal}>{fr(Math.max(0, -cumY1))}</Text>
          <Text style={s.solVal}>{fr(Math.max(0, -cumY2))}</Text>
          <Text style={s.solVal}>{fr(Math.max(0, -cumY3))}</Text>
          <Text style={s.solVal} />
        </View>
        <View style={s.solRowTot}>
          <Text style={s.solLabelB}>TOTAL CUMULATIVE SAVING</Text>
          <Text style={s.solValY}>{fr(cumY1)}</Text>
          <Text style={s.solValY}>{fr(Math.max(cumY1, cumY2))}</Text>
          <Text style={s.solValY}>{fr(Math.max(cumY2, cumY3))}</Text>
          <Text style={s.solValY}>{fr(Math.max(cumY3, cumY4))}</Text>
          <Text style={s.solVal} />
        </View>
        <View style={{ ...s.solRow, marginTop: 6 }}>
          <Text style={s.solLabel}>Annual Savings (incl. maintenance)</Text>
          <Text style={s.solValB}>{fr(totSavY1)}</Text>
          <Text style={s.solValB}>{fr(totSavY2)}</Text>
          <Text style={s.solValB}>{fr(totSavY3)}</Text>
          <Text style={s.solValB}>{fr(totSavY4)}</Text>
          <Text style={s.solVal} />
        </View>
        <View style={s.solRowAlt}>
          <Text style={s.solLabel}>Monthly Savings</Text>
          <Text style={s.solVal}>{fr(totSavY1/12)}</Text>
          <Text style={s.solVal}>{fr(totSavY2/12)}</Text>
          <Text style={s.solVal}>{fr(totSavY3/12)}</Text>
          <Text style={s.solVal}>{fr(totSavY4/12)}</Text>
          <Text style={s.solVal} />
        </View>
        <View style={s.solRow}>
          <Text style={{ ...s.solLabel, fontFamily: 'Helvetica-Bold' }}>Payback ROI in Months</Text>
          <Text style={{ ...s.solValY, flex: 2 }}>{roiMonths > 0 ? formatNum(roiMonths, 2) : '—'}</Text>
          <Text style={s.solVal} />
          <Text style={s.solVal} />
          <Text style={s.solVal} />
        </View>
        <View style={s.solRowAlt}>
          <Text style={s.solLabel}>Initial Investment</Text>
          <Text style={{ ...s.solValB, flex: 2 }}>{fr(sum.totalProjectCost)}</Text>
          <Text style={s.solVal} />
          <Text style={s.solVal} />
          <Text style={s.solVal} />
        </View>
        <View style={s.solRow}>
          <Text style={s.solLabel}>Annual Cash Flows (energy savings only)</Text>
          <Text style={{ ...s.solValB, flex: 2 }}>{fr(enSavY1)}</Text>
          <Text style={s.solVal} />
          <Text style={s.solVal} />
          <Text style={s.solVal} />
        </View>
        <View style={s.solRowAlt}>
          <Text style={s.solLabel}>Monthly Savings (average Yr 1–2)</Text>
          <Text style={{ ...s.solValB, flex: 2 }}>{fr(monthSavY1Y2)}</Text>
          <Text style={s.solVal} />
          <Text style={s.solVal} />
          <Text style={s.solVal} />
        </View>
      </View>

      <PF label="Savings Model" />
    </Page>
  )
}

// ── 11. NPV & IRR ─────────────────────────────────────────────────────────────
function NPVPage({ job }: { job: Job }) {
  const sum = calcJob(job)
  const eskom = job.eskomIncrease / 100
  const maintY1 = sum.totalCurrentCostPerYear * MAINT_RATE

  const enSavY1 = sum.totalAnnualSavings
  const enSavY2 = enSavY1 * (1 + eskom)
  const enSavY3 = enSavY2 * (1 + eskom)
  const maintY2 = maintY1 * (1 + eskom)
  const maintY3 = maintY2 * (1 + eskom)
  const cfY1 = enSavY1 + maintY1
  const cfY2 = enSavY2 + maintY2
  const cfY3 = enSavY3 + maintY3

  const cashFlows = [-sum.totalProjectCost, cfY1, cfY2, cfY3]
  const npvVal = npv(NPV_RATE, cashFlows)
  const irrVal = calcIRR(cashFlows)

  function fr(n: number) { return formatRands(n) }

  return (
    <Page size="A4" style={{ ...s.page, ...s.contentPage }}>
      <PH client={job.clientName} />
      <SH title="Net Present Value & Internal Rate of Return" sub={`${job.clientName} · Date: ${job.date}`} />

      <View style={{ flexDirection: 'row', gap: 16, marginBottom: 14 }}>
        <View style={{ flex: 1, backgroundColor: LIGHT, borderRadius: 4, padding: '10 12' }}>
          <Text style={{ fontSize: 7, color: MID, fontFamily: 'Helvetica-Bold', letterSpacing: 0.5, marginBottom: 4 }}>INTEREST RATE (DISCOUNT RATE)</Text>
          <Text style={{ fontSize: 16, fontFamily: 'Helvetica-Bold', color: NAVY }}>{(NPV_RATE * 100).toFixed(0)}%</Text>
        </View>
        <View style={{ flex: 1, backgroundColor: NAVY, borderRadius: 4, padding: '10 12' }}>
          <Text style={{ fontSize: 7, color: '#ffffff80', fontFamily: 'Helvetica-Bold', letterSpacing: 0.5, marginBottom: 4 }}>NET PRESENT VALUE (NPV)</Text>
          <Text style={{ fontSize: 16, fontFamily: 'Helvetica-Bold', color: YELLOW }}>{fr(npvVal)}</Text>
        </View>
        <View style={{ flex: 1, backgroundColor: NAVY, borderRadius: 4, padding: '10 12' }}>
          <Text style={{ fontSize: 7, color: '#ffffff80', fontFamily: 'Helvetica-Bold', letterSpacing: 0.5, marginBottom: 4 }}>INTERNAL RATE OF RETURN (IRR)</Text>
          <Text style={{ fontSize: 16, fontFamily: 'Helvetica-Bold', color: YELLOW }}>{(irrVal * 100).toFixed(1)}%</Text>
        </View>
      </View>

      <View style={s.table}>
        <View style={s.tHead}>
          <Text style={s.cLh}>Description</Text>
          <Text style={s.cRh}>Year 0</Text>
          <Text style={s.cRh}>Year 1</Text>
          <Text style={s.cRh}>Year 2</Text>
          <Text style={s.cRh}>Year 3</Text>
        </View>
        {[
          { label: 'Initial Outlay', y0: -sum.totalProjectCost, y1: 0, y2: 0, y3: 0 },
          { label: 'Electricity Savings', y0: 0, y1: enSavY1, y2: enSavY2, y3: enSavY3 },
          { label: 'Maintenance Savings', y0: 0, y1: maintY1, y2: maintY2, y3: maintY3 },
        ].map((row, i) => {
          const Row = i % 2 === 0 ? s.tRow : s.tRowAlt
          return (
            <View key={i} style={Row}>
              <Text style={s.cL}>{row.label}</Text>
              <Text style={{ ...s.cR, color: row.y0 < 0 ? '#cc0000' : '#333' }}>{row.y0 !== 0 ? fr(row.y0) : '—'}</Text>
              <Text style={s.cR}>{row.y1 !== 0 ? fr(row.y1) : '—'}</Text>
              <Text style={s.cR}>{row.y2 !== 0 ? fr(row.y2) : '—'}</Text>
              <Text style={s.cR}>{row.y3 !== 0 ? fr(row.y3) : '—'}</Text>
            </View>
          )
        })}
        <View style={s.tTot}>
          <Text style={s.cLt}>Cash Flows</Text>
          <Text style={{ ...s.cYt, color: '#ff9999' }}>{fr(-sum.totalProjectCost)}</Text>
          <Text style={s.cYt}>{fr(cfY1)}</Text>
          <Text style={s.cYt}>{fr(cfY2)}</Text>
          <Text style={s.cYt}>{fr(cfY3)}</Text>
        </View>
      </View>

      <View style={{ backgroundColor: LIGHT, borderRadius: 4, padding: '10 14', marginTop: 8 }}>
        <Text style={{ ...s.body, marginBottom: 0 }}>
          A positive NPV of {fr(npvVal)} confirms the project creates value at a {(NPV_RATE * 100).toFixed(0)}% discount rate. An IRR of{' '}
          {(irrVal * 100).toFixed(1)}% significantly exceeds the cost of capital, representing an excellent return on this investment.
        </Text>
      </View>

      <PF label="NPV & IRR" />
    </Page>
  )
}

// ── 12. CARBON TAX ────────────────────────────────────────────────────────────
function CarbonTaxPage({ job }: { job: Job }) {
  const sum = calcJob(job)
  const CO2_FACTOR = 0.0005925
  const TAX_RATE   = 120

  const curCo2  = sum.totalCurrentKwhPerYear  * CO2_FACTOR
  const ledCo2  = sum.totalProposedKwhPerYear * CO2_FACTOR
  const savCo2  = curCo2 - ledCo2
  const curTax  = curCo2  * TAX_RATE
  const ledTax  = ledCo2  * TAX_RATE
  const savTax  = savCo2  * TAX_RATE

  return (
    <Page size="A4" style={{ ...s.page, ...s.contentPage }}>
      <PH client={job.clientName} />
      <SH title="Carbon Tax Estimate — Lighting Only" sub="Still in discussion — indicative figures only" />

      <Text style={s.body}>
        The initial marginal carbon tax rate will be R{TAX_RATE} per tonne of CO₂e (carbon dioxide equivalent). Electricity carbon
        tonnes are based on every 1,000 kWh equating to 0.5925 CO₂ tonnes.
      </Text>

      <View style={s.table}>
        <View style={s.tHead}>
          <Text style={s.cLh}>Scenario</Text>
          <Text style={s.cRh}>Annual kWh</Text>
          <Text style={s.cRh}>CO₂ Tax per Tonne</Text>
          <Text style={s.cRh}>Carbon Emission Tonnes</Text>
          <Text style={s.cRh}>Carbon Emission Tax Payable</Text>
        </View>
        {[
          { label: 'Current Electricity Usage',                kwh: sum.totalCurrentKwhPerYear,  co2: curCo2, tax: curTax },
          { label: 'Electricity After Recommended Changes',    kwh: sum.totalProposedKwhPerYear, co2: ledCo2, tax: ledTax },
          { label: 'Savings Achieved',                        kwh: sum.totalCurrentKwhPerYear - sum.totalProposedKwhPerYear, co2: savCo2, tax: savTax },
        ].map((row, i) => {
          const Row = i % 2 === 0 ? s.tRow : s.tRowAlt
          return (
            <View key={i} style={Row}>
              <Text style={s.cL}>{row.label}</Text>
              <Text style={s.cR}>{formatNum(row.kwh, 2)}</Text>
              <Text style={s.cR}>R {TAX_RATE}.00</Text>
              <Text style={s.cR}>{formatNum(row.co2, 2)}</Text>
              <Text style={i === 2 ? s.cBold : s.cR}>{formatRands(row.tax)}</Text>
            </View>
          )
        })}
      </View>

      <PF label="Carbon Tax" />
    </Page>
  )
}

// ── 13. QUOTATION (per room, matching Phil's format) ──────────────────────────
function QuotationPage({ job }: { job: Job }) {
  const subtotal = job.rooms.reduce((acc, room) => {
    const calc = calcRoom(room, job)
    return acc + calc.totalRoomCost
  }, 0)
  const vat   = subtotal * 0.15
  const total = subtotal + vat

  return (
    <Page size="A4" style={{ ...s.page, ...s.contentPage }}>
      <PH client={job.clientName} />

      {/* Letterhead block */}
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 12, paddingBottom: 8, borderBottom: `1 solid ${LIGHT}` }}>
        <View>
          <Text style={{ fontSize: 11, fontFamily: 'Helvetica-Bold', color: NAVY }}>TFS Energy cc</Text>
          <Text style={{ fontSize: 8, color: '#555', marginTop: 2 }}>PO Box 425, Jukskei Park 2153</Text>
          <Text style={{ fontSize: 8, color: '#555' }}>Tel: 082-525-1796 · Fax: 086-520-5488</Text>
          <Text style={{ fontSize: 8, color: '#555' }}>VAT No: 490-026-1677 · Reg #: 2011/064736/24</Text>
        </View>
        <View style={{ alignItems: 'flex-end' }}>
          <Text style={{ fontSize: 13, fontFamily: 'Helvetica-Bold', color: NAVY }}>QUOTATION</Text>
          <Text style={{ fontSize: 8, color: '#555', marginTop: 4 }}>Quote Date: {job.date}</Text>
          {job.vatNumber ? <Text style={{ fontSize: 8, color: '#555' }}>Client VAT No: {job.vatNumber}</Text> : null}
        </View>
      </View>

      {/* Bill to */}
      <View style={{ backgroundColor: LIGHT, borderRadius: 3, padding: '8 10', marginBottom: 12 }}>
        <Text style={{ fontSize: 7.5, fontFamily: 'Helvetica-Bold', color: NAVY, marginBottom: 4 }}>BILL TO:</Text>
        <Text style={{ fontSize: 8, color: '#333' }}>Company Name: {job.clientName}</Text>
        {job.contactPerson ? <Text style={{ fontSize: 8, color: '#333' }}>Contact Person: {job.contactPerson}</Text> : null}
        {job.contactNumber ? <Text style={{ fontSize: 8, color: '#333' }}>Contact Number: {job.contactNumber}</Text> : null}
        {job.siteAddress ? <Text style={{ fontSize: 8, color: '#333' }}>Address: {job.siteAddress}</Text> : null}
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

      {/* Totals */}
      <View style={{ alignSelf: 'flex-end', width: 280, marginTop: 8 }}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 5, borderTop: `1 solid ${NAVY}` }}>
          <Text style={{ fontSize: 8.5, fontFamily: 'Helvetica-Bold', color: NAVY }}>TOTAL excl. VAT</Text>
          <Text style={{ fontSize: 8.5, fontFamily: 'Helvetica-Bold', color: NAVY }}>{formatRands(subtotal)}</Text>
        </View>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 4 }}>
          <Text style={{ fontSize: 8, color: '#555' }}>15% VAT</Text>
          <Text style={{ fontSize: 8, color: '#555' }}>{formatRands(vat)}</Text>
        </View>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', backgroundColor: NAVY, padding: '8 8', borderRadius: 3, marginTop: 4 }}>
          <Text style={{ fontSize: 9, fontFamily: 'Helvetica-Bold', color: '#fff' }}>TOTAL INCLUDING VAT</Text>
          <Text style={{ fontSize: 9, fontFamily: 'Helvetica-Bold', color: YELLOW }}>{formatRands(total)}</Text>
        </View>
      </View>

      <Text style={{ ...s.body, color: MID, marginTop: 14, fontSize: 7.5 }}>
        All prices include installation, labour, travel and materials. This quotation is valid for 30 days from the date of this report.
        Payment terms: 50% deposit on acceptance, balance on completion.
      </Text>

      <PF label="Quotation" />
    </Page>
  )
}

// ── 14. AIRCON SUMMARY (conditional) ─────────────────────────────────────────
function AirconPage({ job }: { job: Job }) {
  const totals = job.rooms.reduce((acc, r) => ({
    btu9000:  acc.btu9000  + (r.aircons?.btu9000  ?? 0),
    btu12000: acc.btu12000 + (r.aircons?.btu12000 ?? 0),
    btu18000: acc.btu18000 + (r.aircons?.btu18000 ?? 0),
    btu24000: acc.btu24000 + (r.aircons?.btu24000 ?? 0),
  }), { btu9000: 0, btu12000: 0, btu18000: 0, btu24000: 0 })
  const grandTotal = totals.btu9000 + totals.btu12000 + totals.btu18000 + totals.btu24000
  const sizes = [
    { key: 'btu9000'  as const, label: '9,000 BTU',  kw: '2.6 kW' },
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
        <View style={{ marginTop: 10 }}>
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

// ── DOCUMENT ──────────────────────────────────────────────────────────────────
export default function ReportPDF({ job }: { job: Job }) {
  const hasAircons = job.rooms.some(r => {
    const ac = r.aircons; return ac && (ac.btu9000 + ac.btu12000 + ac.btu18000 + ac.btu24000) > 0
  })
  return (
    <Document title={`TFS Energy — ${job.clientName} Lighting Audit`} author="Philip Melton — TFS Energy">
      <CoverPage          job={job} />
      <LetterPage         job={job} />
      <OverviewPage       job={job} />
      <ExecutiveSummaryPage job={job} />
      <CurrentLightingPage  job={job} />
      <ProposedLightingPage job={job} />
      <CostPage           job={job} />
      <SavingsPage        job={job} />
      <SolutionSummaryPage  job={job} />
      <AnnualisedSavingsPage job={job} />
      <NPVPage            job={job} />
      <CarbonTaxPage      job={job} />
      <QuotationPage      job={job} />
      {hasAircons && <AirconPage job={job} />}
    </Document>
  )
}
