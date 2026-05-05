'use client'
import { useState } from 'react'
import { pdf } from '@react-pdf/renderer'
import { FileText } from 'lucide-react'
import { Job } from '@/lib/types'
import ReportPDF from './ReportPDF'

export default function DownloadReportButton({ job }: { job: Job }) {
  const [loading, setLoading] = useState(false)

  async function handleDownload() {
    setLoading(true)
    try {
      const blob = await pdf(<ReportPDF job={job} />).toBlob()
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `TFS-Energy-${job.clientName.replace(/[^a-z0-9]/gi, '-')}-Audit.pdf`
      a.click()
      URL.revokeObjectURL(url)
    } finally {
      setLoading(false)
    }
  }

  return (
    <button
      onClick={handleDownload}
      disabled={loading}
      className="hidden sm:flex items-center gap-1.5 text-xs font-bold px-3 py-2 rounded-lg border transition-all border-white/20 text-white/60 hover:bg-white/10 hover:text-white disabled:opacity-50 disabled:cursor-wait"
    >
      <FileText size={13} />
      {loading ? 'Generating…' : 'Download Report'}
    </button>
  )
}
