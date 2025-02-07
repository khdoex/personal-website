'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { useState, useEffect } from 'react';

interface BlogPost {
  title: string;
  date: string;
  description: string;
  slug: string;
  category: 'Personal' | 'Tech' | 'Science' | 'AI' | 'Music';
  readTime?: string;
  image?: string;
  language?: 'en' | 'tr';
}

const blogPosts: BlogPost[] = [
  {
    title: "Master",
    date: "2024-03-21",
    description: "Yüksek lisans deneyimim ve bu süreçte aldığım kararlar hakkında düşüncelerim.",
    slug: "master",
    category: "Personal",
    readTime: "5 min read",
    language: "tr"
  },
  {
    title: "Understanding Large Language Models",
    date: "2024-02-10",
    description: "A deep dive into the architecture and capabilities of modern LLMs, exploring their potential and limitations in today's AI landscape.",
    slug: "understanding-llms",
    category: "AI",
    readTime: "8 min read",
    image: "/blog/llm-cover.jpg",
    language: "en"
  },
  {
    title: "The Future of Music Production with AI",
    date: "2024-02-08",
    description: "Exploring how artificial intelligence is revolutionizing music production, from automated mixing to AI-powered composition tools.",
    slug: "future-music-production-ai",
    category: "Music",
    readTime: "6 min read",
    image: "/blog/music-ai.jpg",
    language: "en"
  },
  {
    title: "Quantum Computing: A Primer",
    date: "2024-02-05",
    description: "An introduction to quantum computing principles and their potential impact on computational physics and cryptography.",
    slug: "quantum-computing-primer",
    category: "Science",
    readTime: "10 min read",
    image: "/blog/quantum.jpg"
  },
  {
    title: "Building Modern Web Applications",
    date: "2024-02-01",
    description: "A comprehensive guide to building scalable web applications using Next.js, React, and modern development practices.",
    slug: "modern-web-development",
    category: "Tech",
    readTime: "12 min read",
    image: "/blog/web-dev.jpg"
  }
];

const categoryColors = {
  Personal: "from-pink-400 to-rose-400",
  Tech: "from-blue-400 to-cyan-400",
  Science: "from-purple-400 to-pink-400",
  AI: "from-green-400 to-emerald-400",
  Music: "from-orange-400 to-red-400"
};

const categoryIcons = {
  Personal: "✍️",
  Tech: "💻",
  Science: "🔬",
  AI: "🤖",
  Music: "🎵"
};

export default function BlogPage() {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  const filteredPosts = blogPosts
    .filter(post => !selectedCategory || post.category === selectedCategory)
    .filter(post => 
      post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      post.description.toLowerCase().includes(searchQuery.toLowerCase())
    );

  return (
    <div className="min-h-screen bg-black">
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="max-w-6xl mx-auto px-6 py-24"
      >
        <motion.div 
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="text-center mb-16"
        >
          <h1 className="text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-400 mb-4">
            Blog
          </h1>
          <p className="text-gray-400 text-lg max-w-2xl mx-auto">
            Exploring ideas at the intersection of technology, science, and creativity
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
              placeholder="Search articles..."
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

        {/* Blog Posts Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {filteredPosts.map((post, index) => (
            <motion.article
              key={post.slug}
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.1 * index }}
              className="group"
            >
              <Link href={`/blog/${post.slug}`}>
                <div className="relative overflow-hidden rounded-2xl backdrop-blur-sm bg-white/5 border border-white/10 transition-all duration-500 hover:bg-white/10">
                  {/* Background Gradient */}
                  <div className={`absolute inset-0 bg-gradient-to-r ${categoryColors[post.category]} opacity-0 group-hover:opacity-5 transition-opacity duration-500`} />
                  
                  {/* Content */}
                  <div className="p-6">
                    {/* Header */}
                    <div className="flex items-center gap-4 mb-4">
                      <span className="text-sm text-gray-400">{new Date(post.date).toLocaleDateString(post.language === 'tr' ? 'tr-TR' : 'en-US', { 
                        year: 'numeric', 
                        month: 'long', 
                        day: 'numeric' 
                      })}</span>
                      <span className={`px-3 py-1 rounded-full text-xs bg-gradient-to-r ${categoryColors[post.category]} bg-opacity-10 text-white flex items-center gap-1`}>
                        {categoryIcons[post.category]} {post.category}
                      </span>
                      {post.readTime && (
                        <span className="text-sm text-gray-400">
                          ⏱️ {post.readTime}
                        </span>
                      )}
                      {post.language && (
                        <span className="text-sm text-gray-400">
                          {post.language === 'tr' ? '🇹🇷' : '🇬🇧'}
                        </span>
                      )}
                    </div>
                    
                    {/* Title */}
                    <h2 className="text-2xl font-semibold text-white mb-3 group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-blue-400 group-hover:to-purple-400 transition-all duration-300">
                      {post.title}
                    </h2>
                    
                    {/* Description */}
                    <p className="text-gray-400 line-clamp-2 mb-4">
                      {post.description}
                    </p>
                    
                    {/* Read More */}
                    <div className="flex items-center text-sm text-blue-400 group-hover:text-blue-300 transition-colors duration-300">
                      Read More →
                    </div>
                  </div>
                  
                  {/* Bottom Gradient Line */}
                  <div className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-blue-400 to-purple-400 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-500 origin-left" />
                </div>
              </Link>
            </motion.article>
          ))}
        </div>

        {/* Empty State */}
        {filteredPosts.length === 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-20"
          >
            <p className="text-gray-400 text-lg">No posts found matching your criteria</p>
          </motion.div>
        )}
      </motion.div>
    </div>
  );
} 