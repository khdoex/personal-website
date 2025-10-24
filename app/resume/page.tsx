'use client'

import { useState } from 'react'
import { Download } from 'lucide-react'

export default function Resume() {
  const [isDownloading, setIsDownloading] = useState(false)

  const handleDownload = () => {
    setIsDownloading(true)
    const link = document.createElement('a')
    link.href = '/documents/resume.pdf'
    link.download = 'KaanHacihaliloglu_Resume.pdf'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    setIsDownloading(false)
  }

  return (
    <div className="animate-fade-in">
      <div className="max-w-6xl mx-auto px-6 md:px-8 py-16 md:py-24">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
          <div>
            <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-white">Resume</h1>
          </div>
          <button
            onClick={handleDownload}
            className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium transition-colors"
            disabled={isDownloading}
          >
            <Download size={18} />
            {isDownloading ? 'Downloading...' : 'Download PDF'}
          </button>
        </div>

        {/* PDF Viewer */}
        <div className="w-full aspect-[8.5/11] bg-white rounded-xl overflow-hidden shadow-lg border border-zinc-800">
          <iframe
            src="/documents/resume.pdf#view=FitH"
            className="w-full h-full"
            style={{ border: 'none' }}
          />
        </div>
      </div>
    </div>
  )
}
