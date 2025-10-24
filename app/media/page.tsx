'use client'

import { useState } from 'react'
import { X, Play } from 'lucide-react'
import Link from 'next/link'

interface MediaItem {
  type: 'youtube' | 'local'
  id?: string
  url?: string
  title: string
  description?: string
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
  const [selectedCategory, setSelectedCategory] = useState<string>('all')

  const categories: string[] = ['all', ...new Set(MEDIA_ITEMS.map(item => item.category).filter((c): c is string => Boolean(c)))]
  const filteredItems = selectedCategory === 'all'
    ? MEDIA_ITEMS
    : MEDIA_ITEMS.filter(item => item.category === selectedCategory)

  return (
    <div className="animate-fade-in">
      <div className="max-w-6xl mx-auto px-6 md:px-8 py-16 md:py-24">
        {/* Header */}
        <div className="mb-12 space-y-4">
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-white">
            AI Video Gallery
          </h1>
          <p className="text-lg md:text-xl text-zinc-400 max-w-3xl leading-relaxed">
            Experiments in computer vision, audio processing, generative models, and creative AI
            applications.
          </p>
        </div>

        {/* Category Filter */}
        <div className="flex flex-wrap gap-2 mb-12">
          {categories.map((category) => (
            <button
              key={category}
              onClick={() => setSelectedCategory(category)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                selectedCategory === category
                  ? 'bg-blue-600 text-white'
                  : 'bg-zinc-900 text-zinc-300 hover:bg-zinc-800 border border-zinc-800'
              }`}
            >
              {category === 'all' ? 'All Videos' : category}
            </button>
          ))}
        </div>

        {/* Video Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-16">
          {filteredItems.map((item, index) => (
            <article
              key={index}
              onClick={() => setSelectedVideo(item)}
              className="group cursor-pointer border border-zinc-800 rounded-xl overflow-hidden hover:border-zinc-700 hover:bg-zinc-900/30 transition-all"
            >
              {/* Thumbnail */}
              <div className="aspect-video relative overflow-hidden bg-zinc-900">
                {item.type === 'youtube' ? (
                  <img
                    src={`https://img.youtube.com/vi/${item.id}/maxresdefault.jpg`}
                    alt={item.title}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                    loading="lazy"
                  />
                ) : (
                  <video
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                    muted
                    preload="none"
                    poster="/placeholder.jpg"
                  >
                    <source src={item.url} type="video/mp4" />
                    <source src={item.url} type="video/quicktime" />
                  </video>
                )}

                {/* Play Overlay */}
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <div className="w-16 h-16 bg-white/90 rounded-full flex items-center justify-center">
                    <Play className="w-7 h-7 text-gray-900 ml-1" fill="currentColor" />
                  </div>
                </div>

                {/* Category Badge */}
                {item.category && (
                  <div className="absolute top-3 left-3 px-3 py-1 bg-zinc-900/90 backdrop-blur-sm rounded-full border border-zinc-700">
                    <span className="text-zinc-200 text-xs font-medium">{item.category}</span>
                  </div>
                )}
              </div>

              {/* Content */}
              <div className="p-5 space-y-2">
                <h3 className="font-semibold text-lg text-white group-hover:text-blue-400 transition-colors">
                  {item.title}
                </h3>
                {item.description && (
                  <p className="text-zinc-400 text-sm leading-relaxed">
                    {item.description}
                  </p>
                )}
              </div>
            </article>
          ))}
        </div>

        {/* Video Player Modal */}
        {selectedVideo && (
          <div
            className="fixed inset-0 bg-black/90 flex items-center justify-center z-50 p-4 md:p-8"
            onClick={() => setSelectedVideo(null)}
          >
            <div
              className="relative w-full max-w-4xl"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Close Button */}
              <button
                onClick={() => setSelectedVideo(null)}
                className="absolute -top-12 right-0 p-2 text-white hover:text-gray-300 transition-colors"
              >
                <X size={28} />
              </button>

              {/* Video */}
              <div className="bg-black rounded-lg overflow-hidden">
                {selectedVideo.type === 'youtube' ? (
                  <div className="aspect-video">
                    <iframe
                      src={`https://www.youtube.com/embed/${selectedVideo.id}?autoplay=1`}
                      className="w-full h-full"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                    />
                  </div>
                ) : (
                  <video
                    src={selectedVideo.url}
                    controls
                    autoPlay
                    className="w-full"
                  />
                )}
              </div>

              {/* Video Info */}
              <div className="mt-4 text-white">
                <h3 className="text-xl font-semibold mb-2">{selectedVideo.title}</h3>
                {selectedVideo.description && (
                  <p className="text-gray-300">{selectedVideo.description}</p>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Call to Action */}
        <div className="max-w-2xl mx-auto text-center p-8 border border-zinc-800 rounded-xl bg-zinc-900/30">
          <h3 className="text-2xl font-semibold mb-3 text-white">More AI Experiments Coming</h3>
          <p className="text-zinc-400 mb-6 leading-relaxed">
            I'm constantly experimenting with new AI techniques and models. Follow my research
            progress and technical implementations in my projects section.
          </p>
          <Link
            href="/projects"
            className="inline-flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium transition-colors"
          >
            View Technical Projects
          </Link>
        </div>
      </div>
    </div>
  )
}
