'use client'
import { useState, useEffect } from 'react'
import { FileText } from 'lucide-react'
import { Job } from '@/lib/types'
import ReportPreviewModal from './ReportPreviewModal'

export default function DownloadReportButton({ job }: { job: Job }) {
  const [showModal, setShowModal] = useState(false)
  const [logoSrc, setLogoSrc] = useState<string | undefined>()

  useEffect(() => {
    fetch('/tfs-logo-icon.png')
      .then(r => r.blob())
      .then(blob => new Promise<string>((resolve, reject) => {
        const reader = new FileReader()
        reader.onloadend = () => resolve(reader.result as string)
        reader.onerror = reject
        reader.readAsDataURL(blob)
      }))
      .then(setLogoSrc)
      .catch(() => {})
  }, [])

  return (
    <>
      <button
        onClick={() => setShowModal(true)}
        className="hidden sm:flex items-center gap-1.5 text-xs font-bold px-3 py-2 rounded-lg border transition-all border-white/20 text-white/60 hover:bg-white/10 hover:text-white"
      >
        <FileText size={13} />
        Download Report
      </button>

      {showModal && (
        <ReportPreviewModal
          job={job}
          logoSrc={logoSrc}
          onClose={() => setShowModal(false)}
        />
      )}
    </>
  )
}
