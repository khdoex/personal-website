'use client'

import { useState, useEffect } from 'react'
import YouTube from 'react-youtube'
import { Home, ArrowLeft, Maximize2, Minimize2 } from 'lucide-react'
import Link from 'next/link'
import type { YouTubeEvent } from 'react-youtube'

interface MediaItem {
  type: 'youtube' | 'local'
  id?: string // for YouTube videos
  url?: string // for local videos
  title: string
  thumbnail?: string
}

const MEDIA_ITEMS: MediaItem[] = [
  {
    type: 'youtube',
    id: 'IvkSdmS7HA8',
    title: 'Rezz - Someone Else'
  },
  {
    type: 'local',
    url: '/videos/Extended_Video.mp4',
    title: 'Dancing Etheral Creature',
    thumbnail: '/backgrounds/2.png' // Optional thumbnail for local videos
  },
  {
    type: 'local',
    url: '/videos/12-01_00001-audio-1.mov',
    title: 'Generative Music Visual 1' 
  },
  {
    type: 'local',
    url: '/videos/11-30_00001-audio-1.mov',
    title: 'Generative Music Visual 2'
  },
  {
    type: 'local',
    url: '/videos/Professional_Mode_A_heavenly_woman_found_her_self_.mp4',
    title: 'Heavenly Woman Found Herself'
  },
  // Add more items as needed
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

  return (
    <main className="min-h-screen p-8">
      <div className="flex items-center gap-4 mb-6">
        <Link 
          href="/"
          className="p-2 text-white hover:text-blue-300 transition-colors rounded-full hover:bg-white/10"
        >
          <Home size={24} />
        </Link>
        <Link 
          href="javascript:history.back()"
          className="p-2 text-white hover:text-blue-300 transition-colors rounded-full hover:bg-white/10"
        >
          <ArrowLeft size={24} />
        </Link>
        <h1 className="page-title mb-0">Videos</h1>
      </div>

      {/* Video Player Modal */}
      {selectedVideo && (
        <div 
          className={`fixed inset-0 bg-black/80 flex items-center justify-center z-50 ${
            isFullscreen ? 'p-0' : 'p-8'
          }`}
        >
          <div className={`relative ${
            isFullscreen 
              ? 'w-screen h-screen' 
              : 'w-auto max-w-[854px] max-h-[80vh]'
          }`}>
            <div className="absolute -top-10 right-0 flex gap-2 z-10">
              <button
                onClick={() => setIsFullscreen(!isFullscreen)}
                className="text-white hover:text-blue-300 p-2"
              >
                {isFullscreen ? <Minimize2 size={24} /> : <Maximize2 size={24} />}
              </button>
              <button
                onClick={() => {
                  setSelectedVideo(null)
                  setIsFullscreen(false)
                }}
                className="text-white hover:text-blue-300 p-2"
              >
                Close
              </button>
            </div>
            {selectedVideo.type === 'youtube' ? (
              <div className={`relative ${
                isFullscreen 
                  ? 'w-screen h-screen' 
                  : 'w-[854px] h-[480px]'
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
                    : 'w-auto max-h-[80vh]'
                }`}
              />
            )}
          </div>
        </div>
      )}

      {/* Video Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-8">
        {MEDIA_ITEMS.map((item, index) => (
          <div
            key={index}
            onClick={() => setSelectedVideo(item)}
            className="cursor-pointer group"
          >
            <div className="aspect-video bg-gray-800 relative overflow-hidden rounded-lg">
              {item.type === 'youtube' ? (
                <img
                  src={`https://img.youtube.com/vi/${item.id}/maxresdefault.jpg`}
                  alt={item.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
              ) : (
                <div className="w-full h-full relative">
                  {item.thumbnail ? (
                    <img
                      src={item.thumbnail}
                      alt={item.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  ) : (
                    <div className="absolute inset-0 flex items-center justify-center text-white">
                      <svg
                        className="w-12 h-12"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z"
                        />
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                        />
                      </svg>
                    </div>
                  )}
                </div>
              )}
              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                <span className="text-white text-lg font-medium">
                  {item.title}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </main>
  )
} 