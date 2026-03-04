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
      <div className="max-w-4xl mx-auto px-6 md:px-8 py-16">
        <div className="flex items-center justify-between mb-8">
          <div>
            <p className="font-mono text-sm text-accent mb-2">~/resume</p>
            <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-white font-mono">
              Resume
            </h1>
          </div>
          <button
            onClick={handleDownload}
            className="inline-flex items-center gap-2 bg-accent-deep hover:bg-accent-deep/80 text-white px-4 py-2 rounded font-mono text-sm transition-colors"
            disabled={isDownloading}
          >
            <Download size={14} />
            {isDownloading ? 'downloading...' : 'download_pdf'}
          </button>
        </div>

        <div className="w-full aspect-[8.5/11] border border-border rounded-lg overflow-hidden bg-white">
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
