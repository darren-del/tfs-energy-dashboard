import React from 'react'
import {
  Document, Page, View, Text, StyleSheet,
} from '@react-pdf/renderer'
import { Job } from '@/lib/types'
import { calcJob, calcRoom, formatRands, formatNum } from '@/lib/calculations'
import { getCurrentFitting, getProposedFitting, PROPOSED_FITTINGS } from '@/lib/fittings'

const NAVY = '#252768'
const YELLOW = '#F2C519'
const LIGHT = '#f0f2f8'
const MID = '#8a8db0'

const s = StyleSheet.create({
  page: { fontFamily: 'Helvetica', fontSize: 9, color: '#222', backgroundColor: '#fff', padding: 0 },
  coverPage: { backgroundColor: NAVY, width: '100%', height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', padding: 50 },
  contentPage: { padding: '36 44', display: 'flex', flexDirection: 'column' },

  // Cover
  coverLogo: { fontSize: 22, fontFamily: 'Helvetica-Bold', color: YELLOW, letterSpacing: 4 },
  coverLogoSub: { fontSize: 10, color: '#ffffff60', letterSpacing: 6, marginTop: 2 },
  coverTitle: { fontSize: 36, fontFamily: 'Helvetica-Bold', color: '#fff', marginTop: 60, lineHeight: 1.2 },
  coverClient: { fontSize: 16, color: YELLOW, fontFamily: 'Helvetica-Bold', marginTop: 16 },
  coverDetail: { fontSize: 10, color: '#ffffff80', marginTop: 4 },
  coverDivider: { height: 3, backgroundColor: YELLOW, width: 60, marginTop: 32, marginBottom: 32 },
  coverPrepared: { fontSize: 9, color: '#ffffff60' },

  // Section header
  sectionHeader: { backgroundColor: NAVY, padding: '8 12', marginBottom: 10, borderRadius: 3 },
  sectionHeaderText: { fontSize: 11, fontFamily: 'Helvetica-Bold', color: '#fff', letterSpacing: 1 },
  sectionHeaderSub: { fontSize: 7.5, color: '#ffffff80', marginTop: 1 },

  // Page header
  pageHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16, paddingBottom: 8, borderBottom: `1 solid ${LIGHT}` },
  pageHeaderLogo: { fontSize: 12, fontFamily: 'Helvetica-Bold', color: NAVY },
  pageHeaderSub: { fontSize: 7, color: MID },

  // Tables
  table: { width: '100%', marginBottom: 12 },
  tableHeader: { flexDirection: 'row', backgroundColor: NAVY },
  tableHeaderCell: { fontSize: 7, fontFamily: 'Helvetica-Bold', color: '#fff', padding: '5 6', flex: 1, textAlign: 'center' },
  tableHeaderCellLeft: { fontSize: 7, fontFamily: 'Helvetica-Bold', color: '#fff', padding: '5 6', flex: 2, textAlign: 'left' },
  tableRow: { flexDirection: 'row', borderBottom: `0.5 solid ${LIGHT}` },
  tableRowAlt: { flexDirection: 'row', backgroundColor: LIGHT, borderBottom: `0.5 solid #e4e6f0` },
  tableCell: { fontSize: 7.5, padding: '4.5 6', flex: 1, textAlign: 'center', color: '#333' },
  tableCellLeft: { fontSize: 7.5, padding: '4.5 6', flex: 2, textAlign: 'left', color: '#333' },
  tableCellBold: { fontSize: 7.5, padding: '4.5 6', flex: 1, textAlign: 'center', color: NAVY, fontFamily: 'Helvetica-Bold' },
  tableTotalRow: { flexDirection: 'row', backgroundColor: NAVY, marginTop: 1 },
  tableTotalCell: { fontSize: 8, fontFamily: 'Helvetica-Bold', color: '#fff', padding: '6 6', flex: 1, textAlign: 'center' },
  tableTotalCellLeft: { fontSize: 8, fontFamily: 'Helvetica-Bold', color: '#fff', padding: '6 6', flex: 2, textAlign: 'left' },
  tableTotalCellYellow: { fontSize: 8, fontFamily: 'Helvetica-Bold', color: YELLOW, padding: '6 6', flex: 1, textAlign: 'center' },

  // Executive summary grid
  summaryGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 10 },
  summaryCard: { backgroundColor: LIGHT, borderRadius: 4, padding: '10 12', flex: 1, minWidth: '22%' },
  summaryCardHighlight: { backgroundColor: NAVY, borderRadius: 4, padding: '10 12', flex: 1, minWidth: '22%' },
  summaryCardLabel: { fontSize: 6.5, color: MID, fontFamily: 'Helvetica-Bold', letterSpacing: 0.5, textTransform: 'uppercase', marginBottom: 4 },
  summaryCardLabelLight: { fontSize: 6.5, color: '#ffffff80', fontFamily: 'Helvetica-Bold', letterSpacing: 0.5, textTransform: 'uppercase', marginBottom: 4 },
  summaryCardValue: { fontSize: 13, fontFamily: 'Helvetica-Bold', color: NAVY },
  summaryCardValueYellow: { fontSize: 13, fontFamily: 'Helvetica-Bold', color: YELLOW },
  summaryCardValueWhite: { fontSize: 13, fontFamily: 'Helvetica-Bold', color: '#fff' },

  // Letter / body text
  bodyText: { fontSize: 9, color: '#333', lineHeight: 1.7, marginBottom: 8 },
  bodyTextBold: { fontSize: 9, fontFamily: 'Helvetica-Bold', color: NAVY, marginBottom: 6 },
  bullet: { fontSize: 9, color: '#333', lineHeight: 1.7, marginBottom: 4, paddingLeft: 12 },

  // Quotation
  quoteSubtotalRow: { flexDirection: 'row', borderTop: `1 solid ${NAVY}`, marginTop: 4, paddingTop: 4 },
  quoteVatRow: { flexDirection: 'row', paddingTop: 2 },
  quoteTotalRow: { flexDirection: 'row', backgroundColor: NAVY, padding: '6 6', marginTop: 4, borderRadius: 2 },
  quoteLabel: { fontSize: 8, flex: 3, color: '#333' },
  quoteValue: { fontSize: 8, flex: 1, textAlign: 'right', color: '#333' },
  quoteLabelBold: { fontSize: 8, fontFamily: 'Helvetica-Bold', flex: 3, color: NAVY },
  quoteValueBold: { fontSize: 8, fontFamily: 'Helvetica-Bold', flex: 1, textAlign: 'right', color: NAVY },
  quoteTotalLabel: { fontSize: 9, fontFamily: 'Helvetica-Bold', flex: 3, color: '#fff' },
  quoteTotalValue: { fontSize: 9, fontFamily: 'Helvetica-Bold', flex: 1, textAlign: 'right', color: YELLOW },

  footer: { position: 'absolute', bottom: 24, left: 44, right: 44, flexDirection: 'row', justifyContent: 'space-between', borderTop: `0.5 solid ${LIGHT}`, paddingTop: 6 },
  footerText: { fontSize: 7, color: MID },

  yellowAccent: { height: 2, backgroundColor: YELLOW, width: 40, marginBottom: 10 },
})

function PageHeader({ clientName }: { clientName: string }) {
  return (
    <View style={s.pageHeader}>
      <View>
        <Text style={s.pageHeaderLogo}>TFS ENERGY</Text>
        <Text style={s.pageHeaderSub}>LED Lighting Audit Report</Text>
      </View>
      <Text style={s.pageHeaderSub}>{clientName}</Text>
    </View>
  )
}

function PageFooter({ page }: { page: string }) {
  return (
    <View style={s.footer} fixed>
      <Text style={s.footerText}>TFS Energy · Confidential · {page}</Text>
      <Text style={s.footerText}>Philip Melton · philip@tfsenergy.co.za</Text>
    </View>
  )
}

function SectionHeader({ title, sub }: { title: string; sub?: string }) {
  return (
    <View style={s.sectionHeader}>
      <Text style={s.sectionHeaderText}>{title.toUpperCase()}</Text>
      {sub ? <Text style={s.sectionHeaderSub}>{sub}</Text> : null}
    </View>
  )
}

// ─── COVER PAGE ──────────────────────────────────────────────────────────────
function CoverPage({ job }: { job: Job }) {
  return (
    <Page size="A4" style={s.page}>
      <View style={s.coverPage}>
        <View>
          <Text style={s.coverLogo}>TFS ENERGY</Text>
          <Text style={s.coverLogoSub}>TOTAL FACILITIES SOLUTIONS</Text>
        </View>

        <View>
          <Text style={s.coverTitle}>LED Lighting{'\n'}Audit Report</Text>
          <View style={s.coverDivider} />
          <Text style={s.coverClient}>{job.clientName}</Text>
          <Text style={s.coverDetail}>{job.siteAddress}</Text>
          <Text style={s.coverDetail}>Audit Date: {job.date}</Text>
        </View>

        <View>
          <Text style={s.coverPrepared}>Prepared by: Philip Melton</Text>
          <Text style={s.coverPrepared}>TFS Energy · philip@tfsenergy.co.za</Text>
          <Text style={s.coverPrepared}>This report is confidential and intended for the named client only.</Text>
        </View>
      </View>
    </Page>
  )
}

// ─── INTRO LETTER ────────────────────────────────────────────────────────────
function IntroLetterPage({ job }: { job: Job }) {
  return (
    <Page size="A4" style={{ ...s.page, ...s.contentPage }}>
      <PageHeader clientName={job.clientName} />
      <SectionHeader title="Introduction" />

      <Text style={s.bodyText}>{job.date}</Text>
      <Text style={{ ...s.bodyText, marginBottom: 16 }}>The Directors{'\n'}{job.clientName}{'\n'}{job.siteAddress}</Text>
      <Text style={s.bodyText}>Dear Sirs,</Text>
      <Text style={{ ...s.bodyTextBold, marginTop: 4 }}>RE: LED Lighting Upgrade — Energy Audit Report</Text>
      <View style={s.yellowAccent} />

      <Text style={s.bodyText}>
        Thank you for the opportunity to conduct a comprehensive energy audit at your premises. Following our site inspection, we are pleased to present this detailed report outlining the potential energy savings and financial benefits that can be realised by upgrading your current lighting infrastructure to modern LED technology.
      </Text>

      <Text style={s.bodyText}>
        LED lighting represents the most significant advancement in energy-efficient lighting available today. In comparison to traditional fluorescent, halogen, and high-pressure sodium fittings, LED technology offers dramatic reductions in energy consumption — typically between 50% and 70% — while delivering superior light quality, longer lamp life, and substantially reduced maintenance costs.
      </Text>

      <Text style={s.bodyText}>
        In the context of South Africa's ongoing Eskom tariff escalations, the financial case for LED conversion has never been stronger. Each successive tariff increase amplifies the return on investment, meaning the savings generated by LED fittings grow year-on-year. This report includes a 4-year financial projection incorporating the applicable Eskom escalation rate so that you can see the compounding benefit over time.
      </Text>

      <Text style={s.bodyText}>
        Our team will manage the project from start to finish — supply of fittings, professional installation by certified electricians, responsible disposal of old fittings, and commissioning. All LED products supplied carry manufacturer warranties and comply with South African National Standards (SANS).
      </Text>

      <Text style={s.bodyText}>
        We trust you will find this report informative and look forward to discussing our proposal with you at your convenience.
      </Text>

      <Text style={{ ...s.bodyText, marginTop: 8 }}>Yours faithfully,</Text>
      <Text style={{ ...s.bodyTextBold, marginTop: 16 }}>Philip Melton</Text>
      <Text style={s.bodyText}>Managing Director · TFS Energy</Text>
      <Text style={s.bodyText}>philip@tfsenergy.co.za</Text>

      <PageFooter page="Introduction" />
    </Page>
  )
}

// ─── PROJECT OVERVIEW ─────────────────────────────────────────────────────────
function ProjectOverviewPage({ job }: { job: Job }) {
  const bullets = [
    'All LED luminaires supplied carry a minimum 2-year manufacturer warranty, with selected products carrying up to 5-year warranties.',
    'Installation will be carried out by registered and qualified electricians in accordance with South African Occupational Health & Safety Act requirements.',
    'Lux levels will be maintained or improved in all areas. Where existing lux levels are insufficient, the LED specification has been adjusted accordingly.',
    'All existing fluorescent and other non-LED fittings will be responsibly decommissioned and disposed of in accordance with applicable environmental regulations.',
    'LED fittings produce minimal UV emissions and contain no mercury, making them safer for occupants and the environment.',
    'LED technology offers an average rated life of 50,000 hours — significantly longer than fluorescent (10,000 hours) and incandescent (1,000 hours) alternatives, drastically reducing maintenance and re-lamping costs.',
    `Eskom tariff escalation of ${job.eskomIncrease}% per annum has been used in this report's financial projections, consistent with recent regulatory price determinations.`,
    'All pricing in this report is quoted exclusive of VAT unless otherwise stated. VAT at the standard rate of 15% is applicable to the quoted total.',
  ]

  return (
    <Page size="A4" style={{ ...s.page, ...s.contentPage }}>
      <PageHeader clientName={job.clientName} />
      <SectionHeader title="Project Overview" sub="Key facts and conditions applicable to this proposal" />

      {bullets.map((b, i) => (
        <View key={i} style={{ flexDirection: 'row', marginBottom: 8, alignItems: 'flex-start' }}>
          <View style={{ width: 18, height: 18, backgroundColor: NAVY, borderRadius: 9, marginRight: 10, marginTop: 1, flexShrink: 0, alignItems: 'center', justifyContent: 'center' }}>
            <Text style={{ fontSize: 7, fontFamily: 'Helvetica-Bold', color: YELLOW }}>{i + 1}</Text>
          </View>
          <Text style={{ ...s.bodyText, flex: 1, marginBottom: 0 }}>{b}</Text>
        </View>
      ))}

      <PageFooter page="Project Overview" />
    </Page>
  )
}

// ─── EXECUTIVE SUMMARY ────────────────────────────────────────────────────────
function ExecutiveSummaryPage({ job }: { job: Job }) {
  const summary = calcJob(job)
  const savingsPct = summary.totalCurrentCostPerYear > 0
    ? (summary.totalAnnualSavings / summary.totalCurrentCostPerYear) * 100
    : 0

  const cards: { label: string; value: string; highlight?: boolean; yellow?: boolean }[] = [
    { label: 'Cost per kWh', value: `R ${job.costPerKwh.toFixed(4)}` },
    { label: 'Current Annual Cost', value: formatRands(summary.totalCurrentCostPerYear) },
    { label: 'Proposed Annual Cost', value: formatRands(summary.totalProposedCostPerYear) },
    { label: 'Annual Savings', value: formatRands(summary.totalAnnualSavings), highlight: true, yellow: true },
    { label: 'Savings %', value: `${savingsPct.toFixed(1)}%`, highlight: true },
    { label: 'Total Project Cost', value: formatRands(summary.totalProjectCost) },
    { label: 'ROI Payback', value: summary.roiMonths > 0 ? `${formatNum(summary.roiMonths, 1)} months` : '—' },
    { label: '4-Year Cumulative Savings', value: formatRands(summary.cumulativeSavings4yr), highlight: true, yellow: true },
    { label: 'Eskom Escalation Used', value: `${job.eskomIncrease}% p.a.` },
  ]

  return (
    <Page size="A4" style={{ ...s.page, ...s.contentPage }}>
      <PageHeader clientName={job.clientName} />
      <SectionHeader title="Executive Summary" sub="Key financial metrics at a glance" />

      <View style={s.summaryGrid}>
        {cards.map(card => (
          <View key={card.label} style={card.highlight ? s.summaryCardHighlight : s.summaryCard}>
            <Text style={card.highlight ? s.summaryCardLabelLight : s.summaryCardLabel}>{card.label}</Text>
            <Text style={card.highlight ? (card.yellow ? s.summaryCardValueYellow : s.summaryCardValueWhite) : s.summaryCardValue}>
              {card.value}
            </Text>
          </View>
        ))}
      </View>

      <View style={{ marginTop: 8 }}>
        <Text style={{ ...s.bodyText, color: MID }}>
          The above figures are based on {job.rooms.length} area{job.rooms.length !== 1 ? 's' : ''} audited across {job.siteAddress}. Current annual costs are calculated at R {job.costPerKwh.toFixed(4)}/kWh × 12 months. Project cost excludes VAT.
        </Text>
      </View>

      <PageFooter page="Executive Summary" />
    </Page>
  )
}

// ─── CURRENT LIGHTING TABLE ───────────────────────────────────────────────────
function CurrentLightingPage({ job }: { job: Job }) {
  const ballastWatt = job.defaultBallastWatt

  return (
    <Page size="A4" style={{ ...s.page, ...s.contentPage }}>
      <PageHeader clientName={job.clientName} />
      <SectionHeader title="Current Lighting System" sub="Existing fittings and energy consumption by area" />

      <View style={s.table}>
        <View style={s.tableHeader}>
          <Text style={s.tableHeaderCellLeft}>Area</Text>
          <Text style={s.tableHeaderCell}>Fitting Type</Text>
          <Text style={s.tableHeaderCell}>Qty</Text>
          <Text style={s.tableHeaderCell}>Hrs/Day</Text>
          <Text style={s.tableHeaderCell}>Ballast W</Text>
          <Text style={s.tableHeaderCell}>kWh/Day</Text>
          <Text style={s.tableHeaderCell}>kWh/Year</Text>
          <Text style={s.tableHeaderCell}>Cost/Year</Text>
        </View>

        {job.rooms.map((room, i) => {
          const calc = calcRoom(room, job)
          const fitting = getCurrentFitting(room.currentFittingCode)
          const bw = room.ballastWattOverride ?? ballastWatt
          const Row = i % 2 === 0 ? s.tableRow : s.tableRowAlt
          return (
            <View key={room.id} style={Row}>
              <Text style={s.tableCellLeft}>{room.areaDescription}</Text>
              <Text style={s.tableCell}>{fitting?.label ?? room.currentFittingCode}</Text>
              <Text style={s.tableCell}>{room.quantity}</Text>
              <Text style={s.tableCell}>{room.hoursPerDay}</Text>
              <Text style={s.tableCell}>{bw}W</Text>
              <Text style={s.tableCell}>{formatNum(calc.currentKwhPerDay, 2)}</Text>
              <Text style={s.tableCell}>{formatNum(calc.currentKwhPerYear, 0)}</Text>
              <Text style={s.tableCellBold}>{formatRands(calc.currentCostPerYear)}</Text>
            </View>
          )
        })}

        <View style={s.tableTotalRow}>
          <Text style={s.tableTotalCellLeft}>TOTAL</Text>
          <Text style={s.tableTotalCell} />
          <Text style={s.tableTotalCell}>{job.rooms.reduce((s, r) => s + r.quantity, 0)}</Text>
          <Text style={s.tableTotalCell} />
          <Text style={s.tableTotalCell} />
          <Text style={s.tableTotalCell}>{formatNum(calcJob(job).totalCurrentKwhPerYear / 365, 1)}</Text>
          <Text style={s.tableTotalCell}>{formatNum(calcJob(job).totalCurrentKwhPerYear, 0)}</Text>
          <Text style={s.tableTotalCellYellow}>{formatRands(calcJob(job).totalCurrentCostPerYear)}</Text>
        </View>
      </View>

      <PageFooter page="Current Lighting" />
    </Page>
  )
}

// ─── PROPOSED LIGHTING TABLE ──────────────────────────────────────────────────
function ProposedLightingPage({ job }: { job: Job }) {
  const summary = calcJob(job)

  return (
    <Page size="A4" style={{ ...s.page, ...s.contentPage }}>
      <PageHeader clientName={job.clientName} />
      <SectionHeader title="Proposed LED Lighting System" sub="Replacement fittings and projected energy consumption" />

      <View style={s.table}>
        <View style={s.tableHeader}>
          <Text style={s.tableHeaderCellLeft}>Area</Text>
          <Text style={s.tableHeaderCell}>Proposed Fitting</Text>
          <Text style={s.tableHeaderCell}>Qty</Text>
          <Text style={s.tableHeaderCell}>Hrs/Day</Text>
          <Text style={s.tableHeaderCell}>kWh/Day</Text>
          <Text style={s.tableHeaderCell}>kWh/Year</Text>
          <Text style={s.tableHeaderCell}>Cost/Year</Text>
        </View>

        {job.rooms.map((room, i) => {
          const calc = calcRoom(room, job)
          const fitting = getProposedFitting(room.proposedFittingCode)
          const Row = i % 2 === 0 ? s.tableRow : s.tableRowAlt
          return (
            <View key={room.id} style={Row}>
              <Text style={s.tableCellLeft}>{room.areaDescription}</Text>
              <Text style={s.tableCell}>{fitting?.label ?? room.proposedFittingCode}</Text>
              <Text style={s.tableCell}>{room.quantity}</Text>
              <Text style={s.tableCell}>{room.hoursPerDay}</Text>
              <Text style={s.tableCell}>{formatNum(calc.proposedKwhPerDay, 2)}</Text>
              <Text style={s.tableCell}>{formatNum(calc.proposedKwhPerYear, 0)}</Text>
              <Text style={s.tableCellBold}>{formatRands(calc.proposedCostPerYear)}</Text>
            </View>
          )
        })}

        <View style={s.tableTotalRow}>
          <Text style={s.tableTotalCellLeft}>TOTAL</Text>
          <Text style={s.tableTotalCell} />
          <Text style={s.tableTotalCell}>{job.rooms.reduce((s, r) => s + r.quantity, 0)}</Text>
          <Text style={s.tableTotalCell} />
          <Text style={s.tableTotalCell}>{formatNum(summary.totalProposedKwhPerYear / 365, 1)}</Text>
          <Text style={s.tableTotalCell}>{formatNum(summary.totalProposedKwhPerYear, 0)}</Text>
          <Text style={s.tableTotalCellYellow}>{formatRands(summary.totalProposedCostPerYear)}</Text>
        </View>
      </View>

      <PageFooter page="Proposed Lighting" />
    </Page>
  )
}

// ─── COST BREAKDOWN TABLE ─────────────────────────────────────────────────────
function CostBreakdownPage({ job }: { job: Job }) {
  const summary = calcJob(job)

  return (
    <Page size="A4" style={{ ...s.page, ...s.contentPage }}>
      <PageHeader clientName={job.clientName} />
      <SectionHeader title="Cost Breakdown" sub="Supply, installation and disposal costs per area" />

      <View style={s.table}>
        <View style={s.tableHeader}>
          <Text style={s.tableHeaderCellLeft}>Area</Text>
          <Text style={s.tableHeaderCell}>Current Fitting</Text>
          <Text style={s.tableHeaderCell}>Proposed Fitting</Text>
          <Text style={s.tableHeaderCell}>Qty</Text>
          <Text style={s.tableHeaderCell}>Unit Cost</Text>
          <Text style={s.tableHeaderCell}>Install</Text>
          <Text style={s.tableHeaderCell}>Disposal</Text>
          <Text style={s.tableHeaderCell}>Room Total</Text>
        </View>

        {job.rooms.map((room, i) => {
          const calc = calcRoom(room, job)
          const current = getCurrentFitting(room.currentFittingCode)
          const proposed = getProposedFitting(room.proposedFittingCode)
          const Row = i % 2 === 0 ? s.tableRow : s.tableRowAlt
          return (
            <View key={room.id} style={Row}>
              <Text style={s.tableCellLeft}>{room.areaDescription}</Text>
              <Text style={s.tableCell}>{current?.label ?? room.currentFittingCode}</Text>
              <Text style={s.tableCell}>{proposed?.label ?? room.proposedFittingCode}</Text>
              <Text style={s.tableCell}>{room.quantity}</Text>
              <Text style={s.tableCell}>{formatRands(calc.unitCost)}</Text>
              <Text style={s.tableCell}>{formatRands(calc.installCost)}</Text>
              <Text style={s.tableCell}>{formatRands(calc.disposalCost)}</Text>
              <Text style={s.tableCellBold}>{formatRands(calc.totalRoomCost)}</Text>
            </View>
          )
        })}

        <View style={s.tableTotalRow}>
          <Text style={s.tableTotalCellLeft}>TOTAL PROJECT COST (excl. VAT)</Text>
          <Text style={s.tableTotalCell} />
          <Text style={s.tableTotalCell} />
          <Text style={s.tableTotalCell}>{job.rooms.reduce((s, r) => s + r.quantity, 0)}</Text>
          <Text style={s.tableTotalCell} />
          <Text style={s.tableTotalCell} />
          <Text style={s.tableTotalCell} />
          <Text style={s.tableTotalCellYellow}>{formatRands(summary.totalProjectCost)}</Text>
        </View>
      </View>

      <PageFooter page="Cost Breakdown" />
    </Page>
  )
}

// ─── SAVINGS SUMMARY TABLE ────────────────────────────────────────────────────
function SavingsSummaryPage({ job }: { job: Job }) {
  const summary = calcJob(job)

  return (
    <Page size="A4" style={{ ...s.page, ...s.contentPage }}>
      <PageHeader clientName={job.clientName} />
      <SectionHeader title="Savings Summary" sub="Annual savings, project cost and payback period by area" />

      <View style={s.table}>
        <View style={s.tableHeader}>
          <Text style={s.tableHeaderCellLeft}>Area</Text>
          <Text style={s.tableHeaderCell}>Current Cost/Yr</Text>
          <Text style={s.tableHeaderCell}>Proposed Cost/Yr</Text>
          <Text style={s.tableHeaderCell}>Annual Savings</Text>
          <Text style={s.tableHeaderCell}>Project Cost</Text>
          <Text style={s.tableHeaderCell}>ROI (months)</Text>
        </View>

        {job.rooms.map((room, i) => {
          const calc = calcRoom(room, job)
          const roi = calc.annualSavingsRands > 0
            ? calc.totalRoomCost / (calc.annualSavingsRands / 12)
            : 0
          const Row = i % 2 === 0 ? s.tableRow : s.tableRowAlt
          return (
            <View key={room.id} style={Row}>
              <Text style={s.tableCellLeft}>{room.areaDescription}</Text>
              <Text style={s.tableCell}>{formatRands(calc.currentCostPerYear)}</Text>
              <Text style={s.tableCell}>{formatRands(calc.proposedCostPerYear)}</Text>
              <Text style={s.tableCellBold}>{formatRands(calc.annualSavingsRands)}</Text>
              <Text style={s.tableCell}>{formatRands(calc.totalRoomCost)}</Text>
              <Text style={s.tableCell}>{roi > 0 ? formatNum(roi, 1) : '—'}</Text>
            </View>
          )
        })}

        <View style={s.tableTotalRow}>
          <Text style={s.tableTotalCellLeft}>TOTAL</Text>
          <Text style={s.tableTotalCell}>{formatRands(summary.totalCurrentCostPerYear)}</Text>
          <Text style={s.tableTotalCell}>{formatRands(summary.totalProposedCostPerYear)}</Text>
          <Text style={s.tableTotalCellYellow}>{formatRands(summary.totalAnnualSavings)}</Text>
          <Text style={s.tableTotalCell}>{formatRands(summary.totalProjectCost)}</Text>
          <Text style={s.tableTotalCell}>{summary.roiMonths > 0 ? formatNum(summary.roiMonths, 1) : '—'}</Text>
        </View>
      </View>

      <PageFooter page="Savings Summary" />
    </Page>
  )
}

// ─── 4-YEAR PROJECTION ────────────────────────────────────────────────────────
function FourYearProjectionPage({ job }: { job: Job }) {
  const summary = calcJob(job)
  const eskom = job.eskomIncrease / 100

  const rows = [
    { label: 'Year 1', savings: summary.year1Savings, cumulative: summary.year1Savings },
    { label: 'Year 2', savings: summary.year2Savings, cumulative: summary.year1Savings + summary.year2Savings },
    { label: 'Year 3', savings: summary.year3Savings, cumulative: summary.year1Savings + summary.year2Savings + summary.year3Savings },
    { label: 'Year 4', savings: summary.year4Savings, cumulative: summary.cumulativeSavings4yr },
  ]

  return (
    <Page size="A4" style={{ ...s.page, ...s.contentPage }}>
      <PageHeader clientName={job.clientName} />
      <SectionHeader title="4-Year Financial Projection" sub={`Includes ${job.eskomIncrease}% annual Eskom tariff escalation`} />

      <View style={s.table}>
        <View style={s.tableHeader}>
          <Text style={{ ...s.tableHeaderCell, flex: 1, textAlign: 'left', paddingLeft: 8 }}>Period</Text>
          <Text style={s.tableHeaderCell}>Eskom Escalation</Text>
          <Text style={s.tableHeaderCell}>Annual Savings</Text>
          <Text style={s.tableHeaderCell}>Cumulative Savings</Text>
        </View>

        {rows.map((row, i) => {
          const escalationFactor = Math.pow(1 + eskom, i)
          const Row = i % 2 === 0 ? s.tableRow : s.tableRowAlt
          return (
            <View key={row.label} style={Row}>
              <Text style={{ ...s.tableCell, flex: 1, textAlign: 'left', paddingLeft: 8, fontFamily: 'Helvetica-Bold', color: NAVY }}>{row.label}</Text>
              <Text style={s.tableCell}>{((escalationFactor - 1) * 100).toFixed(1)}%</Text>
              <Text style={s.tableCellBold}>{formatRands(row.savings)}</Text>
              <Text style={s.tableCell}>{formatRands(row.cumulative)}</Text>
            </View>
          )
        })}

        <View style={s.tableTotalRow}>
          <Text style={{ ...s.tableTotalCellLeft, flex: 1 }}>4-YEAR TOTAL</Text>
          <Text style={s.tableTotalCell} />
          <Text style={s.tableTotalCell} />
          <Text style={s.tableTotalCellYellow}>{formatRands(summary.cumulativeSavings4yr)}</Text>
        </View>
      </View>

      <Text style={{ ...s.bodyText, color: MID, marginTop: 4 }}>
        Note: Savings escalate each year as Eskom tariff increases compound. Year 1 savings are based on current tariff of R {job.costPerKwh.toFixed(4)}/kWh. Project payback is {summary.roiMonths > 0 ? `${formatNum(summary.roiMonths, 1)} months` : 'not applicable'} based on Year 1 savings.
      </Text>

      <PageFooter page="4-Year Projection" />
    </Page>
  )
}

// ─── CARBON TAX ESTIMATE ──────────────────────────────────────────────────────
function CarbonTaxPage({ job }: { job: Job }) {
  const summary = calcJob(job)
  // Carbon tax calculation (inline — different from CO2 reduction stored on calcRoom)
  const CO2_FACTOR = 0.0005925       // tonnes CO2 per kWh
  const CARBON_TAX_RATE = 120        // R/tonne CO2

  const currentCo2 = summary.totalCurrentKwhPerYear * CO2_FACTOR
  const proposedCo2 = summary.totalProposedKwhPerYear * CO2_FACTOR
  const savedCo2 = currentCo2 - proposedCo2

  const currentTax = currentCo2 * CARBON_TAX_RATE
  const proposedTax = proposedCo2 * CARBON_TAX_RATE
  const taxSavings = savedCo2 * CARBON_TAX_RATE

  return (
    <Page size="A4" style={{ ...s.page, ...s.contentPage }}>
      <PageHeader clientName={job.clientName} />
      <SectionHeader title="Carbon Tax Estimate" sub="Indicative carbon cost based on national emission factors" />

      <View style={s.table}>
        <View style={s.tableHeader}>
          <Text style={s.tableHeaderCellLeft}>Scenario</Text>
          <Text style={s.tableHeaderCell}>kWh/Year</Text>
          <Text style={s.tableHeaderCell}>CO₂ Tonnes/Year</Text>
          <Text style={s.tableHeaderCell}>Carbon Tax Payable</Text>
        </View>

        {[
          { label: 'Current (Existing Fittings)', kwh: summary.totalCurrentKwhPerYear, co2: currentCo2, tax: currentTax },
          { label: 'Proposed (LED Fittings)', kwh: summary.totalProposedKwhPerYear, co2: proposedCo2, tax: proposedTax },
        ].map((row, i) => {
          const Row = i % 2 === 0 ? s.tableRow : s.tableRowAlt
          return (
            <View key={row.label} style={Row}>
              <Text style={s.tableCellLeft}>{row.label}</Text>
              <Text style={s.tableCell}>{formatNum(row.kwh, 0)}</Text>
              <Text style={s.tableCell}>{formatNum(row.co2, 2)}</Text>
              <Text style={s.tableCellBold}>{formatRands(row.tax)}</Text>
            </View>
          )
        })}

        <View style={s.tableTotalRow}>
          <Text style={s.tableTotalCellLeft}>ANNUAL CARBON TAX SAVING</Text>
          <Text style={s.tableTotalCell}>{formatNum(summary.totalCurrentKwhPerYear - summary.totalProposedKwhPerYear, 0)}</Text>
          <Text style={s.tableTotalCell}>{formatNum(savedCo2, 2)}</Text>
          <Text style={s.tableTotalCellYellow}>{formatRands(taxSavings)}</Text>
        </View>
      </View>

      <Text style={{ ...s.bodyText, color: MID, marginTop: 4 }}>
        Carbon tax calculated at R{CARBON_TAX_RATE}/tonne CO₂, emission factor {CO2_FACTOR} tonnes CO₂/kWh. Figures are indicative estimates based on national grid average emission intensity. Actual liability may vary based on company-specific assessments under the Carbon Tax Act.
      </Text>

      <PageFooter page="Carbon Tax" />
    </Page>
  )
}

// ─── QUOTATION ────────────────────────────────────────────────────────────────
function QuotationPage({ job }: { job: Job }) {
  // Group rooms by proposed fitting code
  type QuoteGroup = { code: string; label: string; qty: number; unitCost: number; installPerUnit: number; disposalPerUnit: number }
  const groups: Record<string, QuoteGroup> = {}

  for (const room of job.rooms) {
    const fitting = getProposedFitting(room.proposedFittingCode)
    if (!fitting) continue
    if (!groups[room.proposedFittingCode]) {
      groups[room.proposedFittingCode] = {
        code: room.proposedFittingCode,
        label: fitting.label,
        qty: 0,
        unitCost: fitting.unitCost,
        installPerUnit: job.installPerFitting,
        disposalPerUnit: job.disposalPerFitting,
      }
    }
    groups[room.proposedFittingCode].qty += room.quantity
  }

  const lines = Object.values(groups)
  const subtotal = lines.reduce((sum, g) => sum + g.qty * (g.unitCost + g.installPerUnit + g.disposalPerUnit), 0)
  const vat = subtotal * 0.15
  const total = subtotal + vat

  return (
    <Page size="A4" style={{ ...s.page, ...s.contentPage }}>
      <PageHeader clientName={job.clientName} />
      <SectionHeader title="Quotation" sub="LED lighting supply, installation and disposal — grouped by fitting type" />

      <View style={s.table}>
        <View style={s.tableHeader}>
          <Text style={s.tableHeaderCellLeft}>Description</Text>
          <Text style={s.tableHeaderCell}>Qty</Text>
          <Text style={s.tableHeaderCell}>Unit Cost (excl. VAT)</Text>
          <Text style={s.tableHeaderCell}>Install/unit</Text>
          <Text style={s.tableHeaderCell}>Disposal/unit</Text>
          <Text style={s.tableHeaderCell}>Line Total</Text>
        </View>

        {lines.map((g, i) => {
          const lineTotal = g.qty * (g.unitCost + g.installPerUnit + g.disposalPerUnit)
          const Row = i % 2 === 0 ? s.tableRow : s.tableRowAlt
          return (
            <View key={g.code} style={Row}>
              <Text style={s.tableCellLeft}>{g.label}</Text>
              <Text style={s.tableCell}>{g.qty}</Text>
              <Text style={s.tableCell}>{formatRands(g.unitCost)}</Text>
              <Text style={s.tableCell}>{formatRands(g.installPerUnit)}</Text>
              <Text style={s.tableCell}>{formatRands(g.disposalPerUnit)}</Text>
              <Text style={s.tableCellBold}>{formatRands(lineTotal)}</Text>
            </View>
          )
        })}
      </View>

      {/* Totals block */}
      <View style={{ marginTop: 8, alignSelf: 'flex-end', width: 260 }}>
        <View style={s.quoteSubtotalRow}>
          <Text style={s.quoteLabelBold}>Subtotal (excl. VAT)</Text>
          <Text style={s.quoteValueBold}>{formatRands(subtotal)}</Text>
        </View>
        <View style={s.quoteVatRow}>
          <Text style={s.quoteLabel}>VAT (15%)</Text>
          <Text style={s.quoteValue}>{formatRands(vat)}</Text>
        </View>
        <View style={s.quoteTotalRow}>
          <Text style={s.quoteTotalLabel}>TOTAL (incl. VAT)</Text>
          <Text style={s.quoteTotalValue}>{formatRands(total)}</Text>
        </View>
      </View>

      <Text style={{ ...s.bodyText, color: MID, marginTop: 16 }}>
        This quotation is valid for 30 days from the date of this report. Prices are subject to change based on exchange rate fluctuations and supplier availability. Payment terms: 50% deposit on acceptance, balance on completion.
      </Text>

      <PageFooter page="Quotation" />
    </Page>
  )
}

// ─── AIRCON SUMMARY ───────────────────────────────────────────────────────────
function AirconSummaryPage({ job }: { job: Job }) {
  const totals = job.rooms.reduce((acc, r) => ({
    btu9000:  acc.btu9000  + (r.aircons?.btu9000  ?? 0),
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
      <PageHeader clientName={job.clientName} />
      <SectionHeader title="Air Conditioner Audit Summary" sub="Unit counts recorded per BTU capacity across all areas" />

      <View style={s.table}>
        <View style={s.tableHeader}>
          <Text style={s.tableHeaderCellLeft}>Capacity</Text>
          <Text style={s.tableHeaderCell}>kW Equivalent</Text>
          <Text style={s.tableHeaderCell}>Units on Site</Text>
        </View>

        {sizes.map((sz, i) => {
          const count = totals[sz.key]
          const Row = i % 2 === 0 ? s.tableRow : s.tableRowAlt
          return (
            <View key={sz.key} style={Row}>
              <Text style={s.tableCellLeft}>{sz.label}</Text>
              <Text style={s.tableCell}>{sz.kw}</Text>
              <Text style={{ ...s.tableCellBold, ...(count === 0 ? { color: MID } : {}) }}>{count}</Text>
            </View>
          )
        })}

        <View style={s.tableTotalRow}>
          <Text style={s.tableTotalCellLeft}>TOTAL UNITS ON SITE</Text>
          <Text style={s.tableTotalCell} />
          <Text style={s.tableTotalCellYellow}>{grandTotal}</Text>
        </View>
      </View>

      {/* Per-room breakdown */}
      {job.rooms.some(r => {
        const ac = r.aircons
        return ac && (ac.btu9000 + ac.btu12000 + ac.btu18000 + ac.btu24000) > 0
      }) && (
        <View style={{ marginTop: 12 }}>
          <Text style={{ ...s.bodyTextBold, marginBottom: 6 }}>Per-Room Breakdown</Text>
          <View style={s.table}>
            <View style={s.tableHeader}>
              <Text style={s.tableHeaderCellLeft}>Area</Text>
              <Text style={s.tableHeaderCell}>9,000 BTU</Text>
              <Text style={s.tableHeaderCell}>12,000 BTU</Text>
              <Text style={s.tableHeaderCell}>18,000 BTU</Text>
              <Text style={s.tableHeaderCell}>24,000 BTU</Text>
              <Text style={s.tableHeaderCell}>Total</Text>
            </View>
            {job.rooms.filter(r => {
              const ac = r.aircons
              return ac && (ac.btu9000 + ac.btu12000 + ac.btu18000 + ac.btu24000) > 0
            }).map((room, i) => {
              const ac = room.aircons!
              const roomTotal = ac.btu9000 + ac.btu12000 + ac.btu18000 + ac.btu24000
              const Row = i % 2 === 0 ? s.tableRow : s.tableRowAlt
              return (
                <View key={room.id} style={Row}>
                  <Text style={s.tableCellLeft}>{room.areaDescription}</Text>
                  <Text style={s.tableCell}>{ac.btu9000}</Text>
                  <Text style={s.tableCell}>{ac.btu12000}</Text>
                  <Text style={s.tableCell}>{ac.btu18000}</Text>
                  <Text style={s.tableCell}>{ac.btu24000}</Text>
                  <Text style={s.tableCellBold}>{roomTotal}</Text>
                </View>
              )
            })}
          </View>
        </View>
      )}

      <PageFooter page="Air Conditioners" />
    </Page>
  )
}

// ─── MAIN DOCUMENT ────────────────────────────────────────────────────────────
export default function ReportPDF({ job }: { job: Job }) {
  const hasAircons = job.rooms.some(r => {
    const ac = r.aircons
    return ac && (ac.btu9000 + ac.btu12000 + ac.btu18000 + ac.btu24000) > 0
  })

  return (
    <Document title={`TFS Energy — ${job.clientName} Lighting Audit`} author="Philip Melton — TFS Energy">
      <CoverPage job={job} />
      <IntroLetterPage job={job} />
      <ProjectOverviewPage job={job} />
      <ExecutiveSummaryPage job={job} />
      <CurrentLightingPage job={job} />
      <ProposedLightingPage job={job} />
      <CostBreakdownPage job={job} />
      <SavingsSummaryPage job={job} />
      <FourYearProjectionPage job={job} />
      <CarbonTaxPage job={job} />
      <QuotationPage job={job} />
      {hasAircons && <AirconSummaryPage job={job} />}
    </Document>
  )
}
