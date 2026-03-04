'use client'

import { useState } from 'react'
import { Play, X, Maximize2, Minimize2 } from 'lucide-react'

interface MediaItem {
  url: string
  title: string
  description?: string
  category?: string
}

const MEDIA_ITEMS: MediaItem[] = [
  {
    url: '/videos/gallery/Extended_Video.mp4',
    title: 'Dancing Ethereal Creature',
    description: 'Generative AI character animation with fluid motion dynamics',
    category: 'Generative Art'
  },
  {
    url: '/videos/gallery/12-01_00001-audio-1.mov',
    title: 'Audio-Reactive Visual Generation',
    description: 'Real-time visual synthesis responding to audio input',
    category: 'Audio AI'
  },
  {
    url: '/videos/gallery/11-30_00001-audio-1.mov',
    title: 'Generative Music Visualization',
    description: 'ML-driven visual interpretation of musical elements',
    category: 'Audio AI'
  },
  {
    url: '/videos/gallery/Professional_Mode_A_heavenly_woman_found_her_self_.mp4',
    title: 'Heavenly Woman - AI Character Study',
    description: 'Advanced character generation using diffusion models',
    category: 'Character AI'
  },
  {
    url: '/videos/gallery/220ad93e-934b-408e-aaf4-19c5842b10c1-0.mp4',
    title: 'AI Visual Experiment #1',
    description: 'Experimental generative AI visual synthesis',
    category: 'Experimental'
  },
  {
    url: '/videos/gallery/d0db6f7a-a7ad-4ff7-9fa4-6789b49d565a-0.mp4',
    title: 'AI Visual Experiment #2',
    description: 'Advanced neural network visual generation',
    category: 'Experimental'
  },
  {
    url: '/videos/gallery/eb0d5524-f22b-4b10-a131-51088e7a99be-0.mp4',
    title: 'AI Visual Experiment #3',
    description: 'Creative AI-driven visual content generation',
    category: 'Experimental'
  },
]

export default function Media() {
  const [selectedVideo, setSelectedVideo] = useState<MediaItem | null>(null)
  const [isFullscreen, setIsFullscreen] = useState(false)

  return (
    <div className="animate-fade-in">
      <div className="max-w-5xl mx-auto px-6 md:px-8 py-16">
        <div className="mb-12">
          <p className="font-mono text-sm text-accent mb-2">~/media</p>
          <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-white font-mono">
            Media
          </h1>
          <p className="text-muted mt-3 max-w-xl">
            AI experiments in computer vision, audio processing, and generative models.
          </p>
        </div>

        {/* Video Modal */}
        {selectedVideo && (
          <div
            className={`fixed inset-0 bg-background/95 flex items-center justify-center z-50 ${
              isFullscreen ? 'p-0' : 'p-8'
            }`}
          >
            <div className={`relative ${
              isFullscreen ? 'w-screen h-screen' : 'w-auto max-w-[854px] max-h-[80vh]'
            }`}>
              <div className="absolute -top-10 right-0 flex gap-2 z-10">
                <button
                  onClick={() => setIsFullscreen(!isFullscreen)}
                  className="p-1.5 text-muted hover:text-accent rounded transition-colors"
                >
                  {isFullscreen ? <Minimize2 size={18} /> : <Maximize2 size={18} />}
                </button>
                <button
                  onClick={() => { setSelectedVideo(null); setIsFullscreen(false) }}
                  className="p-1.5 text-muted hover:text-red-400 rounded transition-colors"
                >
                  <X size={18} />
                </button>
              </div>

              <video
                src={selectedVideo.url}
                controls
                autoPlay
                className={`${
                  isFullscreen ? 'w-screen h-screen' : 'w-auto max-h-[80vh] rounded-lg border border-border'
                }`}
              />

              {!isFullscreen && (
                <div className="mt-3 px-1">
                  <h3 className="font-mono text-sm font-semibold text-white">{selectedVideo.title}</h3>
                  {selectedVideo.category && (
                    <span className="font-mono text-xs text-accent">{selectedVideo.category}</span>
                  )}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {MEDIA_ITEMS.map((item, index) => (
            <div
              key={index}
              onClick={() => setSelectedVideo(item)}
              className="group cursor-pointer border border-border rounded-lg overflow-hidden hover:border-accent/40 transition-all"
            >
              <div className="aspect-video relative overflow-hidden bg-surface">
                <video
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  muted
                  preload="metadata"
                  onMouseEnter={(e) => {
                    const v = e.target as HTMLVideoElement
                    v.currentTime = 1
                    v.play().catch(() => {})
                  }}
                  onMouseLeave={(e) => {
                    const v = e.target as HTMLVideoElement
                    v.pause()
                    v.currentTime = 0
                  }}
                >
                  <source src={item.url} type="video/mp4" />
                  <source src={item.url} type="video/quicktime" />
                </video>
                <div className="absolute inset-0 bg-surface flex items-center justify-center -z-10">
                  <Play className="w-8 h-8 text-muted" />
                </div>

                <div className="absolute inset-0 bg-background/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <div className="w-12 h-12 border border-accent/50 rounded-full flex items-center justify-center">
                    <Play className="w-5 h-5 text-accent ml-0.5" fill="currentColor" />
                  </div>
                </div>

                {item.category && (
                  <div className="absolute top-2 left-2 px-2 py-0.5 bg-background/80 rounded font-mono text-xs text-accent">
                    {item.category}
                  </div>
                )}
              </div>

              <div className="p-4">
                <h3 className="font-mono text-sm font-semibold text-white group-hover:text-accent transition-colors">
                  {item.title}
                </h3>
                {item.description && (
                  <p className="text-xs text-muted mt-1 leading-relaxed">{item.description}</p>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
