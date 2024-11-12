'use client'

import { useState } from 'react'
import PageNav from '@/components/PageNav'

export default function Resume() {
  const [isDownloading, setIsDownloading] = useState(false)

  const handleDownload = () => {
    setIsDownloading(true)
    const link = document.createElement('a')
    link.href = '/resume/resume.pdf'
    link.download = 'KaanHacihaliloglu_Resume.pdf'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    setIsDownloading(false)
  }

  return (
    <main className="min-h-screen p-8">
      <PageNav title="Resume" />
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="page-title">Resume</h1>
          <button
            onClick={handleDownload}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors drop-shadow-md"
            disabled={isDownloading}
          >
            {isDownloading ? 'Downloading...' : 'Download PDF'}
          </button>
        </div>
        
        <div className="w-full aspect-[8.5/11] bg-white rounded-lg overflow-hidden shadow-xl">
          <iframe
            src="/resume/resume.pdf#view=FitH"
            className="w-full h-full"
            style={{ border: 'none' }}
          />
        </div>
      </div>
    </main>
  )
} 