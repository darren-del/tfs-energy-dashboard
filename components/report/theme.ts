import { Font, StyleSheet } from '@react-pdf/renderer'

// ── Brand colors ──────────────────────────────────────────────────────────────
export const colors = {
  navy: '#252768',
  navyDark: '#1e2055',
  yellow: '#F2C519',
  yellowDeep: '#b08a00',
  light: '#f0f2f8',
  mid: '#9a9cb8',
  ink: '#26283f',
  inkSoft: '#55586f',
  hairline: '#e3e5f0',
  rowAlt: '#f7f8fc',
  positive: '#1a7a1a',
  negative: '#cc3333',
}

// ── Fonts ─────────────────────────────────────────────────────────────────────
// Static Inter TTFs (react-pdf cannot slice variable fonts). Registered once on
// module load — this module is imported by ReportPDF.tsx before any pdf() call.
Font.register({
  family: 'Inter',
  fonts: [
    { src: '/fonts/Inter-Regular.ttf', fontWeight: 400 },
    { src: '/fonts/Inter-Medium.ttf', fontWeight: 500 },
    { src: '/fonts/Inter-SemiBold.ttf', fontWeight: 600 },
    { src: '/fonts/Inter-Bold.ttf', fontWeight: 700 },
    { src: '/fonts/Inter-ExtraBold.ttf', fontWeight: 800 },
  ],
})
Font.registerHyphenationCallback(word => [word])

// ── Type scale ────────────────────────────────────────────────────────────────
export const type = StyleSheet.create({
  display: { fontSize: 34, fontFamily: 'Inter', fontWeight: 800 },
  hero: { fontSize: 20, fontFamily: 'Inter', fontWeight: 800 },
  h1: { fontSize: 15, fontFamily: 'Inter', fontWeight: 700, color: colors.navy },
  overline: { fontSize: 6.5, fontFamily: 'Inter', fontWeight: 600, letterSpacing: 1.2, color: colors.mid },
  body: { fontSize: 9, fontFamily: 'Inter', fontWeight: 400, lineHeight: 1.65, color: colors.ink },
  small: { fontSize: 7.5, fontFamily: 'Inter', fontWeight: 400, color: colors.inkSoft },
  tableHead: { fontSize: 6.5, fontFamily: 'Inter', fontWeight: 600 },
  tableCell: { fontSize: 7, fontFamily: 'Inter', fontWeight: 400 },
})

// ── Shared StyleSheet ─────────────────────────────────────────────────────────
export const s = StyleSheet.create({
  page: { fontFamily: 'Inter', fontSize: 8.5, color: colors.ink, backgroundColor: '#fff', padding: 0 },
  coverPage: { backgroundColor: colors.navy, width: '100%', height: '100%', flexDirection: 'column', justifyContent: 'space-between', padding: 50 },
  contentPage: { padding: '32 40', flexDirection: 'column' },

  // Page chrome
  pageHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 16 },
  pageHeaderRule: { flexDirection: 'row', height: 1.5, marginBottom: 14 },
  pageHeaderLogo: { fontSize: 11, fontFamily: 'Inter', fontWeight: 700, color: colors.navy },
  pageHeaderSub: { fontSize: 6.5, color: colors.mid },
  footer: { position: 'absolute', bottom: 20, left: 40, right: 40, flexDirection: 'row', justifyContent: 'space-between', borderTop: `0.5 solid ${colors.hairline}`, paddingTop: 5 },
  footerText: { fontSize: 6.5, color: colors.mid },

  // Section header — yellow tick + navy title, no solid bar
  sectionHeader: { flexDirection: 'row', marginBottom: 12, alignItems: 'stretch' },
  sectionHeaderTick: { width: 3, backgroundColor: colors.yellow, borderRadius: 1.5, marginRight: 8 },
  sectionHeaderText: { fontSize: 13, fontFamily: 'Inter', fontWeight: 700, color: colors.navy, letterSpacing: 0.2 },
  sectionHeaderSub: { fontSize: 7, color: colors.mid, marginTop: 2 },

  // Body text
  body: { fontSize: 9, color: colors.ink, lineHeight: 1.65, marginBottom: 7, fontFamily: 'Inter' },
  bodyBold: { fontSize: 9, fontFamily: 'Inter', fontWeight: 700, color: colors.navy, marginBottom: 5 },
  yellowBar: { height: 2.5, backgroundColor: colors.yellow, width: 36, marginBottom: 9, borderRadius: 1.25 },

  // Tables — shared
  table: { width: '100%', marginBottom: 10 },
  tHead: { flexDirection: 'row', backgroundColor: colors.light, borderBottom: `1 solid ${colors.navy}` },
  tRow: { flexDirection: 'row', borderBottom: `0.5 solid ${colors.hairline}` },
  tRowAlt: { flexDirection: 'row', backgroundColor: colors.rowAlt, borderBottom: `0.5 solid ${colors.hairline}` },
  tTot: { flexDirection: 'row', backgroundColor: colors.navy },

  // Cells
  cL: { fontSize: 7, padding: '5 6', flex: 2, textAlign: 'left', color: colors.ink, fontFamily: 'Inter' },
  cR: { fontSize: 7, padding: '5 6', flex: 1, textAlign: 'right', color: colors.ink, fontFamily: 'Inter' },
  cC: { fontSize: 7, padding: '5 6', flex: 1, textAlign: 'center', color: colors.ink, fontFamily: 'Inter' },
  cLh: { fontSize: 6.5, fontFamily: 'Inter', fontWeight: 600, color: colors.navy, padding: '5 6', flex: 2, textAlign: 'left', textTransform: 'uppercase' },
  cRh: { fontSize: 6.5, fontFamily: 'Inter', fontWeight: 600, color: colors.navy, padding: '5 6', flex: 1, textAlign: 'right', textTransform: 'uppercase' },
  cCh: { fontSize: 6.5, fontFamily: 'Inter', fontWeight: 600, color: colors.navy, padding: '5 6', flex: 1, textAlign: 'center', textTransform: 'uppercase' },
  cLt: { fontSize: 7, fontFamily: 'Inter', fontWeight: 700, color: '#fff', padding: '6 6', flex: 2, textAlign: 'left' },
  cRt: { fontSize: 7, fontFamily: 'Inter', fontWeight: 700, color: '#fff', padding: '6 6', flex: 1, textAlign: 'right' },
  cCt: { fontSize: 7, fontFamily: 'Inter', fontWeight: 700, color: '#fff', padding: '6 6', flex: 1, textAlign: 'center' },
  cYt: { fontSize: 7, fontFamily: 'Inter', fontWeight: 700, color: colors.yellow, padding: '6 6', flex: 1, textAlign: 'right' },
  cBold: { fontSize: 7, fontFamily: 'Inter', fontWeight: 700, color: colors.navy, padding: '5 6', flex: 1, textAlign: 'right' },

  // Executive summary detail grid
  execRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 5, borderBottom: `0.5 solid ${colors.hairline}` },
  execLabel: { fontSize: 8, color: colors.inkSoft, fontFamily: 'Inter' },
  execValue: { fontSize: 8, fontFamily: 'Inter', fontWeight: 600, color: colors.navy },
  execValueYellow: { fontSize: 8, fontFamily: 'Inter', fontWeight: 700, color: colors.yellowDeep },

  // Solution summary
  solSection: { marginBottom: 10 },
  solTitle: { fontSize: 8, fontFamily: 'Inter', fontWeight: 700, color: '#fff', backgroundColor: colors.navy, padding: '5 8', marginBottom: 0 },
  solRow: { flexDirection: 'row', borderBottom: `0.5 solid ${colors.hairline}` },
  solRowAlt: { flexDirection: 'row', backgroundColor: colors.rowAlt, borderBottom: `0.5 solid ${colors.hairline}` },
  solRowTot: { flexDirection: 'row', backgroundColor: colors.light, borderBottom: `1 solid ${colors.navy}` },
  solLabel: { fontSize: 7, padding: '5 6', flex: 3, color: colors.ink, fontFamily: 'Inter' },
  solLabelB: { fontSize: 7, fontFamily: 'Inter', fontWeight: 700, padding: '5 6', flex: 3, color: colors.navy },
  solVal: { fontSize: 7, padding: '5 6', flex: 1, textAlign: 'right', color: colors.ink, fontFamily: 'Inter' },
  solValB: { fontSize: 7, fontFamily: 'Inter', fontWeight: 700, padding: '5 6', flex: 1, textAlign: 'right', color: colors.navy },
  solValY: { fontSize: 7, fontFamily: 'Inter', fontWeight: 700, padding: '5 6', flex: 1, textAlign: 'right', color: colors.yellowDeep },
  solHead: { fontSize: 6.5, fontFamily: 'Inter', fontWeight: 600, padding: '5 6', flex: 1, textAlign: 'right', color: colors.navy, backgroundColor: colors.light, textTransform: 'uppercase' },
  solHeadL: { fontSize: 6.5, fontFamily: 'Inter', fontWeight: 600, padding: '5 6', flex: 3, textAlign: 'left', color: colors.navy, backgroundColor: colors.light, textTransform: 'uppercase' },
})
