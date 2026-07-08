'use client'
import React from 'react'
import { Document } from '@react-pdf/renderer'
import { Job, ReportTextOverrides } from '@/lib/types'
import { getDefaultTexts } from '@/lib/reportDefaults'
import './report/theme' // registers Inter fonts as a side effect before any pdf() render

import { CoverPage } from './report/pages/CoverPage'
import { LetterPage } from './report/pages/LetterPage'
import { OverviewPage } from './report/pages/OverviewPage'
import { ExecutiveSummaryPage } from './report/pages/ExecutiveSummaryPage'
import { CurrentLightingPage } from './report/pages/CurrentLightingPage'
import { ProposedLightingPage } from './report/pages/ProposedLightingPage'
import { CostPage } from './report/pages/CostPage'
import { SavingsPage } from './report/pages/SavingsPage'
import { RoomSavingsPage } from './report/pages/RoomSavingsPage'
import { TenYearProjectionPage } from './report/pages/TenYearProjectionPage'
import { SolutionSummaryPage } from './report/pages/SolutionSummaryPage'
import { AnnualisedSavingsPage } from './report/pages/AnnualisedSavingsPage'
import { NPVPage } from './report/pages/NPVPage'
import { CarbonTaxPage } from './report/pages/CarbonTaxPage'
import { QuotationPage } from './report/pages/QuotationPage'
import { AirconPage } from './report/pages/AirconPage'

export default function ReportPDF({ job, textOverrides, logoSrc }: {
  job: Job
  textOverrides?: ReportTextOverrides
  logoSrc?: string
}) {
  const hasAircons = job.rooms.some(r => {
    const ac = r.aircons; return ac && (ac.btu9000 + ac.btu12000 + ac.btu18000 + ac.btu24000) > 0
  })
  const texts: ReportTextOverrides = textOverrides ?? getDefaultTexts(job)
  return (
    <Document title={`TFS Energy — ${job.clientName} Lighting Audit`} author="Philip Melton — TFS Energy">
      <CoverPage           job={job} texts={texts} logoSrc={logoSrc} />
      <LetterPage          job={job} texts={texts} />
      <OverviewPage        job={job} texts={texts} />
      <ExecutiveSummaryPage job={job} />
      <CurrentLightingPage  job={job} />
      <ProposedLightingPage job={job} />
      <CostPage             job={job} />
      <SavingsPage          job={job} />
      <RoomSavingsPage      job={job} />
      <TenYearProjectionPage job={job} />
      <SolutionSummaryPage  job={job} />
      <AnnualisedSavingsPage job={job} />
      <NPVPage              job={job} />
      <CarbonTaxPage        job={job} />
      <QuotationPage        job={job} />
      {hasAircons && <AirconPage job={job} />}
    </Document>
  )
}
