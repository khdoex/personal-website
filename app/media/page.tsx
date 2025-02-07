'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { useState, useEffect } from 'react'
import * as THREE from 'three'

interface MediaItem {
  id: string
  type: 'image' | 'video' | 'model'
  title: string
  description: string
  url: string
  thumbnail: string
  category: 'Music' | 'AI' | 'Visualization' | '3D'
}

const mediaItems: MediaItem[] = [
  {
    id: '1',
    type: 'video',
    title: 'Ethereal Dance',
    description: 'A heavenly woman found herself in a mesmerizing dance of light and shadow.',
    url: '/videos/Professional_Mode_A_heavenly_woman_found_her_self_.mp4',
    thumbnail: '/backgrounds/91.png',
    category: 'AI'
  },
  {
    id: '2',
    type: 'video',
    title: 'Extended Visualization',
    description: 'An extended journey through abstract visual landscapes.',
    url: '/videos/Extended_Video.mp4',
    thumbnail: '/backgrounds/2.png',
    category: 'Visualization'
  },
  {
    id: '3',
    type: 'image',
    title: 'Neural Dreams 1',
    description: 'AI-generated artwork exploring the boundaries of machine creativity.',
    url: '/backgrounds/1.png',
    thumbnail: '/backgrounds/1.png',
    category: 'AI'
  },
  {
    id: '4',
    type: 'image',
    title: 'Neural Dreams 2',
    description: 'Abstract patterns and forms generated through neural networks.',
    url: '/backgrounds/2.png',
    thumbnail: '/backgrounds/2.png',
    category: 'AI'
  },
  {
    id: '5',
    type: 'image',
    title: 'Neural Dreams 3',
    description: 'Exploring the intersection of art and artificial intelligence.',
    url: '/backgrounds/3.png',
    thumbnail: '/backgrounds/3.png',
    category: 'AI'
  },
  {
    id: '6',
    type: 'image',
    title: 'Geometric Harmony',
    description: 'A study in geometric patterns and visual harmony.',
    url: '/backgrounds/5.png',
    thumbnail: '/backgrounds/5.png',
    category: 'Visualization'
  },
  {
    id: '7',
    type: 'image',
    title: 'Digital Landscape',
    description: 'Abstract digital landscapes created through generative algorithms.',
    url: '/backgrounds/6.png',
    thumbnail: '/backgrounds/6.png',
    category: 'Visualization'
  },
  {
    id: '8',
    type: 'image',
    title: 'Neural Dreams 7',
    description: 'Complex patterns emerging from neural network interactions.',
    url: '/backgrounds/7.png',
    thumbnail: '/backgrounds/7.png',
    category: 'AI'
  },
  {
    id: '9',
    type: 'image',
    title: 'Neural Dreams 8',
    description: 'Exploring the aesthetic possibilities of AI-generated art.',
    url: '/backgrounds/8.png',
    thumbnail: '/backgrounds/8.png',
    category: 'AI'
  },
  {
    id: '10',
    type: 'image',
    title: 'Neural Dreams 9',
    description: 'The convergence of human creativity and machine learning.',
    url: '/backgrounds/9.png',
    thumbnail: '/backgrounds/9.png',
    category: 'AI'
  }
]

const categoryColors = {
  Music: "from-purple-400 to-pink-400",
  AI: "from-blue-400 to-cyan-400",
  Visualization: "from-green-400 to-emerald-400",
  "3D": "from-orange-400 to-red-400"
}

const categoryIcons = {
  Music: "🎵",
  AI: "🤖",
  Visualization: "📊",
  "3D": "🎮"
}

function MediaGallery() {
  const [selectedItem, setSelectedItem] = useState<MediaItem | null>(null)
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState("")

  const filteredItems = mediaItems
    .filter(item => !selectedCategory || item.category === selectedCategory)
    .filter(item => 
      item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.description.toLowerCase().includes(searchQuery.toLowerCase())
    )

  return (
    <div className="min-h-screen bg-black">
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="max-w-7xl mx-auto px-6 py-24"
      >
        {/* Header */}
        <motion.div 
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="text-center mb-16"
        >
          <h1 className="text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-400 mb-4">
            Media Gallery
          </h1>
          <p className="text-gray-400 text-lg max-w-2xl mx-auto">
            A collection of visualizations, experiments, and creative projects
          </p>
        </motion.div>

        {/* Search and Filter Section */}
        <motion.div 
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="mb-12 space-y-6"
        >
          {/* Search Bar */}
          <div className="relative max-w-xl mx-auto">
            <input
              type="text"
              placeholder="Search media..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full px-6 py-3 bg-white/5 border border-white/10 rounded-full backdrop-blur-sm
                text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-400/50
                transition-all duration-300"
            />
            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400">
              🔍
            </span>
          </div>

          {/* Category Filter */}
          <div className="flex justify-center gap-4 flex-wrap">
            {Object.keys(categoryColors).map((category) => (
              <button
                key={category}
                onClick={() => setSelectedCategory(selectedCategory === category ? null : category)}
                className={`px-4 py-2 rounded-full backdrop-blur-sm transition-all duration-300 flex items-center gap-2
                  ${selectedCategory === category 
                    ? 'bg-white/20 text-white' 
                    : 'bg-white/5 text-gray-400 hover:bg-white/10'}`}
              >
                <span>{categoryIcons[category as keyof typeof categoryIcons]}</span>
                {category}
              </button>
            ))}
          </div>
        </motion.div>

        {/* Gallery Grid */}
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
        >
          {filteredItems.map((item, index) => (
            <motion.div
              key={item.id}
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.1 * index }}
              className="group cursor-pointer"
              onClick={() => setSelectedItem(item)}
            >
              <div className="relative aspect-video overflow-hidden rounded-2xl backdrop-blur-sm bg-white/5 border border-white/10 transition-all duration-500 hover:bg-white/10">
                {/* Thumbnail */}
                <div 
                  className="absolute inset-0 bg-cover bg-center transform group-hover:scale-105 transition-transform duration-500" 
                  style={{ backgroundImage: `url(${item.thumbnail})` }} 
                />
                
                {/* Overlay */}
                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <div className="absolute bottom-0 left-0 right-0 p-6">
                    <div className="flex items-center gap-2 mb-2">
                      <span className={`px-3 py-1 rounded-full text-xs bg-gradient-to-r ${categoryColors[item.category]} bg-opacity-10 text-white flex items-center gap-1`}>
                        {categoryIcons[item.category]} {item.category}
                      </span>
                      <span className="text-sm text-gray-300">
                        {item.type === 'video' ? '🎥 Video' : item.type === 'image' ? '🖼️ Image' : '🎮 3D Model'}
                      </span>
                    </div>
                    <h3 className="text-xl font-semibold text-white mb-2">{item.title}</h3>
                    <p className="text-gray-300 text-sm">{item.description}</p>
                  </div>
                </div>

                {/* Play button for videos */}
                {item.type === 'video' && (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-16 h-16 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center group-hover:bg-white/30 transition-all duration-300">
                      <span className="text-2xl">▶️</span>
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          ))}
        </motion.div>

        {/* Empty State */}
        {filteredItems.length === 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-20"
          >
            <p className="text-gray-400 text-lg">No media items found matching your criteria</p>
          </motion.div>
        )}

        {/* Modal */}
        <AnimatePresence>
          {selectedItem && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90"
              onClick={() => setSelectedItem(null)}
            >
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                className="relative max-w-6xl w-full aspect-video bg-black rounded-2xl overflow-hidden"
                onClick={e => e.stopPropagation()}
              >
                {selectedItem.type === 'video' ? (
                  <video
                    src={selectedItem.url}
                    controls
                    autoPlay
                    className="w-full h-full object-contain"
                  />
                ) : selectedItem.type === 'image' ? (
                  <img
                    src={selectedItem.url}
                    alt={selectedItem.title}
                    className="w-full h-full object-contain"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <p className="text-white">3D Model Viewer Coming Soon</p>
                  </div>
                )}

                {/* Modal Info */}
                <div className="absolute bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-black/80 to-transparent">
                  <h3 className="text-2xl font-semibold text-white mb-2">{selectedItem.title}</h3>
                  <p className="text-gray-300">{selectedItem.description}</p>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  )
}

export default MediaGallery 