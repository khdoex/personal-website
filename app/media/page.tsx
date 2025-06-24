
'use client'

import { useState, useEffect } from 'react'
import YouTube from 'react-youtube'
import { Home, ArrowLeft, Maximize2, Minimize2, Play, X } from 'lucide-react'
import Link from 'next/link'
import PageNav from '@/components/PageNav'
import type { YouTubeEvent } from 'react-youtube'

interface MediaItem {
  type: 'youtube' | 'local'
  id?: string // for YouTube videos
  url?: string // for local videos
  title: string
  description?: string
  thumbnail?: string
  category?: string
}

const MEDIA_ITEMS: MediaItem[] = [
  {
    type: 'youtube',
    id: 'IvkSdmS7HA8',
    title: 'Rezz - Someone Else',
    description: 'AI-enhanced music visualization and audio analysis',
    category: 'Music Visualization'
  },
  {
    type: 'local',
    url: '/videos/gallery/Extended_Video.mp4',
    title: 'Dancing Ethereal Creature',
    description: 'Generative AI character animation with fluid motion dynamics',
    category: 'Generative Art'
  },
  {
    type: 'local',
    url: '/videos/gallery/12-01_00001-audio-1.mov',
    title: 'Audio-Reactive Visual Generation',
    description: 'Real-time visual synthesis responding to audio input',
    category: 'Audio AI'
  },
  {
    type: 'local',
    url: '/videos/gallery/11-30_00001-audio-1.mov',
    title: 'Generative Music Visualization',
    description: 'ML-driven visual interpretation of musical elements',
    category: 'Audio AI'
  },
  {
    type: 'local',
    url: '/videos/gallery/Professional_Mode_A_heavenly_woman_found_her_self_.mp4',
    title: 'Heavenly Woman - AI Character Study',
    description: 'Advanced character generation using diffusion models',
    category: 'Character AI'
  },
  {
    type: 'local',
    url: '/videos/gallery/220ad93e-934b-408e-aaf4-19c5842b10c1-0.mp4',
    title: 'AI Visual Experiment #1',
    description: 'Experimental generative AI visual synthesis',
    category: 'Experimental'
  },
  {
    type: 'local',
    url: '/videos/gallery/d0db6f7a-a7ad-4ff7-9fa4-6789b49d565a-0.mp4',
    title: 'AI Visual Experiment #2',
    description: 'Advanced neural network visual generation',
    category: 'Experimental'
  },
  {
    type: 'local',
    url: '/videos/gallery/eb0d5524-f22b-4b10-a131-51088e7a99be-0.mp4',
    title: 'AI Visual Experiment #3',
    description: 'Creative AI-driven visual content generation',
    category: 'Experimental'
  },
]

export default function Media() {
  const [selectedVideo, setSelectedVideo] = useState<MediaItem | null>(null)
  const [isFullscreen, setIsFullscreen] = useState(false)

  const youtubeOpts = {
    height: isFullscreen ? '100%' : '480',
    width: isFullscreen ? '100%' : '854',
    playerVars: {
      autoplay: 1,
      modestbranding: 1,
      rel: 0,
      showinfo: 1,
      controls: 1,
    },
  }

  const categories = [...new Set(MEDIA_ITEMS.map(item => item.category).filter(Boolean))]

  return (
    <main className="min-h-screen relative">
      
      <div className="max-w-6xl mx-auto px-8 py-8">
        <PageNav title="AI Video Gallery" />
        
        {/* Header Section */}
        <div className="text-center mb-12">
          <p className="text-xl text-white/80 max-w-3xl mx-auto leading-relaxed">
            Complete collection of my AI experiments in computer vision, audio processing, generative models, 
            and creative applications. Each video demonstrates different aspects of machine learning research.
          </p>
        </div>

        {/* Categories Filter */}
        <div className="flex flex-wrap justify-center gap-3 mb-12">
          <button className="px-4 py-2 bg-blue-600 text-white rounded-lg font-medium">
            All Videos
          </button>
          {categories.map((category) => (
            <button 
              key={category}
              className="px-4 py-2 bg-white/10 hover:bg-white/20 text-white/80 hover:text-white rounded-lg font-medium transition-colors"
            >
              {category}
            </button>
          ))}
        </div>

        {/* Video Player Modal */}
        {selectedVideo && (
          <div 
            className={`fixed inset-0 bg-black/90 flex items-center justify-center z-50 ${
              isFullscreen ? 'p-0' : 'p-8'
            }`}
          >
            <div className={`relative ${
              isFullscreen 
                ? 'w-screen h-screen' 
                : 'w-auto max-w-[854px] max-h-[80vh]'
            }`}>
              {/* Controls */}
              <div className="absolute -top-12 right-0 flex gap-2 z-10">
                <button
                  onClick={() => setIsFullscreen(!isFullscreen)}
                  className="p-2 text-white hover:text-blue-300 bg-black/50 rounded-lg transition-colors"
                >
                  {isFullscreen ? <Minimize2 size={24} /> : <Maximize2 size={24} />}
                </button>
                <button
                  onClick={() => {
                    setSelectedVideo(null)
                    setIsFullscreen(false)
                  }}
                  className="p-2 text-white hover:text-red-300 bg-black/50 rounded-lg transition-colors"
                >
                  <X size={24} />
                </button>
              </div>
              
              {/* Video Content */}
              {selectedVideo.type === 'youtube' ? (
                <div className={`relative ${
                  isFullscreen 
                    ? 'w-screen h-screen' 
                    : 'w-[854px] h-[480px] rounded-lg overflow-hidden'
                }`}>
                  <YouTube
                    videoId={selectedVideo.id}
                    opts={youtubeOpts}
                    className={`${
                      isFullscreen 
                        ? 'absolute inset-0 w-full h-full' 
                        : 'w-full h-full'
                    }`}
                    onReady={(event: YouTubeEvent) => {
                      event.target.getIframe().focus()
                    }}
                  />
                </div>
              ) : (
                <video
                  src={selectedVideo.url}
                  controls
                  autoPlay
                  className={`${
                    isFullscreen 
                      ? 'w-screen h-screen' 
                      : 'w-auto max-h-[80vh] rounded-lg'
                  }`}
                />
              )}
              
              {/* Video Info */}
              {!isFullscreen && (
                <div className="mt-4 bg-black/50 backdrop-blur-sm rounded-lg p-4">
                  <h3 className="text-white font-semibold text-lg mb-2">{selectedVideo.title}</h3>
                  {selectedVideo.description && (
                    <p className="text-white/80">{selectedVideo.description}</p>
                  )}
                  {selectedVideo.category && (
                    <span className="inline-block mt-2 px-3 py-1 bg-purple-600/20 text-purple-300 rounded-full text-sm">
                      {selectedVideo.category}
                    </span>
                  )}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Media Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {MEDIA_ITEMS.map((item, index) => (
            <div
              key={index}
              onClick={() => setSelectedVideo(item)}
              className="group cursor-pointer bg-white/5 backdrop-blur-sm rounded-2xl overflow-hidden border border-white/10 
                       hover:bg-white/10 transition-all duration-500 hover:border-white/20 hover:transform hover:scale-[1.02]"
            >
              {/* Thumbnail */}
              <div className="aspect-video relative overflow-hidden bg-gradient-to-br from-blue-500/20 to-purple-500/20">
                {item.type === 'youtube' ? (
                  <img
                    src={`https://img.youtube.com/vi/${item.id}/maxresdefault.jpg`}
                    alt={item.title}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                  />
                ) : (
                  <div className="w-full h-full relative">
                    {/* Video preview for local videos */}
                    <video
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                      muted
                      preload="metadata"
                      onMouseEnter={(e) => {
                        const video = e.target as HTMLVideoElement
                        video.currentTime = 1
                        video.play().catch(() => {
                          // Ignore errors
                        })
                      }}
                      onMouseLeave={(e) => {
                        const video = e.target as HTMLVideoElement
                        video.pause()
                        video.currentTime = 0
                      }}
                    >
                      <source src={item.url} type="video/mp4" />
                      <source src={item.url} type="video/quicktime" />
                    </video>
                    
                    {/* Fallback gradient for videos that don't load */}
                    <div className="absolute inset-0 bg-gradient-to-br from-blue-600/30 to-purple-600/30 flex items-center justify-center -z-10">
                      <div className="text-center">
                        <Play className="w-12 h-12 text-white/80 mx-auto mb-2" fill="rgba(255,255,255,0.8)" />
                        <p className="text-white/60 text-sm">{item.category}</p>
                      </div>
                    </div>
                  </div>
                )}
                
                {/* Play Overlay */}
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 
                              flex items-center justify-center">
                  <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm 
                                border border-white/30">
                    <Play className="w-8 h-8 text-white ml-1" fill="currentColor" />
                  </div>
                </div>

                {/* Category Badge */}
                {item.category && (
                  <div className="absolute top-3 left-3 px-3 py-1 bg-black/60 backdrop-blur-sm rounded-full">
                    <span className="text-white/90 text-sm font-medium">{item.category}</span>
                  </div>
                )}

                {/* Duration Badge - Placeholder */}
                <div className="absolute bottom-3 right-3 px-2 py-1 bg-black/80 backdrop-blur-sm rounded text-white text-sm">
                  {item.type === 'youtube' ? '3:45' : '1:20'}
                </div>
              </div>

              {/* Content */}
              <div className="p-6">
                <h3 className="text-white font-bold text-lg mb-2 group-hover:text-blue-300 transition-colors">
                  {item.title}
                </h3>
                {item.description && (
                  <p className="text-white/70 text-sm leading-relaxed mb-3">
                    {item.description}
                  </p>
                )}
                <div className="flex items-center justify-between">
                  <span className="text-white/50 text-xs">
                    {item.type === 'youtube' ? 'YouTube' : 'Original'}
                  </span>
                  <span className="text-blue-300 text-xs font-medium">
                    Click to play
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Call to Action */}
        <div className="mt-16 text-center">
          <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-8 border border-white/10 max-w-2xl mx-auto">
            <h3 className="text-2xl font-bold text-white mb-4">More AI Experiments Coming</h3>
            <p className="text-white/80 mb-6 leading-relaxed">
              I'm constantly experimenting with new AI techniques and models. Follow my research progress 
              and technical implementations in my projects section.
            </p>
            <Link 
              href="/projects"
              className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 
                       rounded-lg font-semibold transition-all duration-300 hover:transform hover:scale-105"
            >
              View Technical Projects
            </Link>
          </div>
        </div>
      </div>
    </main>
  )

} 