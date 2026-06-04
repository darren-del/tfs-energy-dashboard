'use client'
import { useState } from 'react'
import { pdf } from '@react-pdf/renderer'
import { X, FileText, ChevronDown, ChevronUp } from 'lucide-react'
import { Job, ReportTextOverrides } from '@/lib/types'
import { getDefaultTexts } from '@/lib/reportDefaults'
import ReportPDF from './ReportPDF'

interface FieldDef {
  key: keyof ReportTextOverrides
  label: string
  rows: number
  hint?: string
}

interface SectionDef {
  title: string
  pageNumber: string
  fields: FieldDef[]
}

const SECTIONS: SectionDef[] = [
  {
    title: 'Cover Page',
    pageNumber: 'Page 1',
    fields: [
      { key: 'coverNote', label: 'Cover Note / Disclaimer', rows: 9,
        hint: 'Appears in the shaded box on the cover page.' },
    ],
  },
  {
    title: 'Introduction Letter',
    pageNumber: 'Page 2',
    fields: [
      { key: 'letterPara1', label: 'Opening Paragraph', rows: 6 },
      { key: 'letterPara2', label: 'Quality Statement', rows: 3 },
      { key: 'letterMaintTitle', label: 'Maintenance Savings — Heading', rows: 1 },
      { key: 'letterMaintPoints', label: 'Maintenance Points (one per line)', rows: 4,
        hint: 'Each line becomes a numbered point.' },
      { key: 'letterTariffComment', label: 'Eskom / Tariff Commentary', rows: 5 },
    ],
  },
  {
    title: 'Project Overview',
    pageNumber: 'Page 3',
    fields: [
      { key: 'overviewPoints', label: 'Overview Bullet Points (one per line)', rows: 10,
        hint: 'Each line becomes a numbered bullet. Pages 4+ are generated from audit data.' },
    ],
  },
]

export default function ReportPreviewModal({
  job,
  logoSrc,
  onClose,
}: {
  job: Job
  logoSrc?: string
  onClose: () => void
}) {
  const [overrides, setOverrides] = useState<ReportTextOverrides>(() => getDefaultTexts(job))
  const [generating, setGenerating] = useState(false)
  const [expanded, setExpanded] = useState<Record<string, boolean>>({
    'Cover Page': true,
    'Introduction Letter': false,
    'Project Overview': false,
  })

  function update(key: keyof ReportTextOverrides, value: string) {
    setOverrides(prev => ({ ...prev, [key]: value }))
  }

  function toggle(title: string) {
    setExpanded(e => ({ ...e, [title]: !e[title] }))
  }

  async function generate() {
    setGenerating(true)
    try {
      const blob = await pdf(<ReportPDF job={job} textOverrides={overrides} logoSrc={logoSrc} />).toBlob()
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `TFS-Energy-${job.clientName.replace(/[^a-z0-9]/gi, '-')}-Audit.pdf`
      a.click()
      URL.revokeObjectURL(url)
      onClose()
    } finally {
      setGenerating(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center bg-black/60 backdrop-blur-sm overflow-y-auto py-8 px-4">
      <div className="w-full max-w-2xl bg-white rounded-2xl shadow-2xl my-auto">

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200">
          <div>
            <h2 className="text-sm font-bold text-[#252768]">Review &amp; Edit Report Text</h2>
            <p className="text-xs text-slate-400 mt-0.5">Edit the narrative for pages 1–3, then generate your PDF</p>
          </div>
          <button onClick={onClose} className="p-2 rounded-lg hover:bg-slate-100 transition-colors">
            <X size={15} className="text-slate-500" />
          </button>
        </div>

        {/* Sections */}
        <div className="px-6 py-4 space-y-2.5">
          {SECTIONS.map(section => (
            <div key={section.title} className="border border-slate-200 rounded-xl overflow-hidden">
              <button
                onClick={() => toggle(section.title)}
                className="w-full flex items-center justify-between px-4 py-3 bg-[#f0f2f8] hover:bg-[#e8eaf5] transition-colors text-left"
              >
                <div className="flex items-center gap-3">
                  <span className="text-[10px] font-bold text-[#252768] bg-[#252768]/10 px-2 py-0.5 rounded-full">
                    {section.pageNumber}
                  </span>
                  <span className="text-sm font-semibold text-[#252768]">{section.title}</span>
                </div>
                {expanded[section.title]
                  ? <ChevronUp size={14} className="text-slate-400 shrink-0" />
                  : <ChevronDown size={14} className="text-slate-400 shrink-0" />}
              </button>

              {expanded[section.title] && (
                <div className="p-4 space-y-4 bg-white">
                  {section.fields.map(field => (
                    <div key={field.key}>
                      <label className="block text-xs font-semibold text-slate-600 mb-1">
                        {field.label}
                      </label>
                      {field.hint && (
                        <p className="text-[10px] text-slate-400 mb-1.5">{field.hint}</p>
                      )}
                      <textarea
                        rows={field.rows}
                        value={overrides[field.key]}
                        onChange={e => update(field.key, e.target.value)}
                        className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-700 font-mono leading-relaxed focus:border-[#252768] focus:ring-2 focus:ring-[#252768]/10 outline-none resize-y transition-all"
                        spellCheck
                      />
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-slate-200 bg-[#f8f9fc] rounded-b-2xl">
          <p className="text-[10px] text-slate-400 max-w-xs leading-relaxed">
            Pages 4+ are generated directly from your audit data and cannot be edited here.
          </p>
          <div className="flex gap-2 shrink-0">
            <button
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-slate-500 hover:text-slate-700 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={generate}
              disabled={generating}
              className="flex items-center gap-2 px-5 py-2 bg-[#252768] text-white text-sm font-bold rounded-xl hover:bg-[#1e2055] disabled:opacity-60 disabled:cursor-wait transition-all"
            >
              <FileText size={13} />
              {generating ? 'Generating…' : 'Generate PDF'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
