'use client'

import Link from 'next/link'
import AnimatedHeader from '@/components/AnimatedHeader'
import { ArrowRight, Code, Brain, Music, Database, Sparkles, Play } from 'lucide-react'

export default function Home() {
  // Updated with actually available videos
  const featuredVideos = [
    {
      id: 'featured-1',
      title: 'Audio-Reactive Visual Generation',
      description: 'Real-time visual synthesis responding to audio input',
      videoUrl: '/videos/gallery/12-01_00001-audio-1.mov',
      category: 'Audio AI'
    },
    {
      id: 'featured-2', 
      title: 'Generative Music Visualization',
      description: 'ML-driven visual interpretation of musical elements',
      videoUrl: '/videos/gallery/11-30_00001-audio-1.mov', 
      category: 'Audio AI'
    },
    {
      id: 'featured-3',
      title: 'Ethereal Character Animation',
      description: 'AI-driven character movement and fluid dynamics',
      videoUrl: '/videos/gallery/Extended_Video.mp4',
      category: 'Computer Vision'
    },
    {
      id: 'featured-4',
      title: 'AI Character Study',
      description: 'Advanced character generation using diffusion models',
      videoUrl: '/videos/gallery/Professional_Mode_A_heavenly_woman_found_her_self_.mp4',
      category: 'Deep Learning'
    }
  ]

  return (
    <main className="min-h-screen relative">
      
      <AnimatedHeader />
      
      {/* Hero Section */}
      <section className="max-w-4xl mx-auto px-8 pt-8 pb-16">
        <div className="text-center mb-16">
          <h1 className="text-5xl md:text-6xl font-bold text-white mb-6 drop-shadow-lg">
            Data Scientist & AI Researcher
          </h1>
          <p className="text-xl md:text-2xl text-white/90 mb-8 max-w-3xl mx-auto leading-relaxed drop-shadow-md">
            MSc Data Science student at Sabanci University, specializing in machine learning, 
            NLP, computer vision, audio AI, and generative models for creative applications.
          </p>
          <div className="flex flex-wrap justify-center gap-4 mb-8">
            <span className="px-4 py-2 bg-white/10 backdrop-blur-sm rounded-full text-white/90 border border-white/20">
              Machine Learning Engineer
            </span>
            <span className="px-4 py-2 bg-white/10 backdrop-blur-sm rounded-full text-white/90 border border-white/20">
              AI Engineer
            </span>
            <span className="px-4 py-2 bg-white/10 backdrop-blur-sm rounded-full text-white/90 border border-white/20">
              Kaggle Competitor
            </span>
            <span className="px-4 py-2 bg-white/10 backdrop-blur-sm rounded-full text-white/90 border border-white/20">
              Audio AI Researcher
            </span>
          </div>
          <Link 
            href="/projects" 
            className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-lg font-semibold transition-all duration-300 hover:transform hover:scale-105 shadow-lg"
          >
            View My Work
            <ArrowRight size={20} />
          </Link>
        </div>
      </section>

      {/* About Section */}
      <section className="max-w-4xl mx-auto px-8 mb-16">
        <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-8 border border-white/10 shadow-2xl">
          <h2 className="text-3xl font-bold text-white mb-6 text-center">About Me</h2>
          <div className="grid md:grid-cols-2 gap-8 items-center">
            <div>
              <p className="text-lg text-white/90 mb-6 leading-relaxed">
                I'm pursuing my Master's in Data Science at Sabanci University, where I focus on 
                advancing the intersection of machine learning and creative technologies. My research 
                and projects span competitive data science, audio AI, and generative models.
              </p>
              <p className="text-lg text-white/90 leading-relaxed">
                I believe in the transformative power of AI to enhance human creativity and solve 
                complex real-world problems. Through rigorous research and practical applications, 
                I work to push the boundaries of what's possible in data science.
              </p>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center p-4 bg-white/5 rounded-lg border border-white/10">
                <Database className="w-8 h-8 text-blue-400 mx-auto mb-2" />
                <h3 className="text-white font-semibold">Data Science</h3>
                <p className="text-white/70 text-sm">Advanced Analytics</p>
              </div>
              <div className="text-center p-4 bg-white/5 rounded-lg border border-white/10">
                <Brain className="w-8 h-8 text-green-400 mx-auto mb-2" />
                <h3 className="text-white font-semibold">Machine Learning</h3>
                <p className="text-white/70 text-sm">Deep Learning & AI</p>
              </div>
              <div className="text-center p-4 bg-white/5 rounded-lg border border-white/10">
                <Music className="w-8 h-8 text-purple-400 mx-auto mb-2" />
                <h3 className="text-white font-semibold">Audio AI</h3>
                <p className="text-white/70 text-sm">Music Technology</p>
              </div>
              <div className="text-center p-4 bg-white/5 rounded-lg border border-white/10">
                <Code className="w-8 h-8 text-orange-400 mx-auto mb-2" />
                <h3 className="text-white font-semibold">Development</h3>
                <p className="text-white/70 text-sm">Full-Stack Solutions</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Current Projects Section */}
      <section className="max-w-4xl mx-auto px-8 mb-16">
        <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-8 border border-white/10 shadow-2xl">
          <h2 className="text-3xl font-bold text-white mb-8 text-center">Current Research & Projects</h2>
          <div className="grid gap-6">
            <div className="flex items-start gap-4 p-6 bg-white/5 rounded-xl border border-white/10 hover:bg-white/10 transition-all duration-300">
              <div className="w-12 h-12 bg-blue-500/20 rounded-lg flex items-center justify-center flex-shrink-0">
                <Database className="w-6 h-6 text-blue-400" />
              </div>
              <div>
                <h3 className="text-xl font-semibold text-white mb-2">Advanced Data Science Research</h3>
                <p className="text-white/80 mb-3">
                  Conducting cutting-edge research in machine learning as part of my MSc program at Sabanci University, 
                  focusing on novel approaches to complex data analysis and predictive modeling.
                </p>
                <span className="text-blue-300 text-sm font-medium">Academic Research • Ongoing</span>
              </div>
            </div>

            <div className="flex items-start gap-4 p-6 bg-white/5 rounded-xl border border-white/10 hover:bg-white/10 transition-all duration-300">
              <div className="w-12 h-12 bg-purple-500/20 rounded-lg flex items-center justify-center flex-shrink-0">
                <Music className="w-6 h-6 text-purple-400" />
              </div>
              <div>
                <h3 className="text-xl font-semibold text-white mb-2">SoundBoost.ai Platform</h3>
                <p className="text-white/80 mb-3">
                  Developing an AI-powered audio enhancement platform that leverages advanced machine learning 
                  algorithms to improve audio quality and create intelligent music visualization systems.
                </p>
                <span className="text-purple-300 text-sm font-medium">Product Development • In Progress</span>
              </div>
            </div>

            <div className="flex items-start gap-4 p-6 bg-white/5 rounded-xl border border-white/10 hover:bg-white/10 transition-all duration-300">
              <div className="w-12 h-12 bg-green-500/20 rounded-lg flex items-center justify-center flex-shrink-0">
                <Brain className="w-6 h-6 text-green-400" />
              </div>
              <div>
                <h3 className="text-xl font-semibold text-white mb-2">Competitive Machine Learning</h3>
                <p className="text-white/80 mb-3">
                  Actively participating in Kaggle competitions to push the boundaries of machine learning 
                  performance, focusing on ensemble methods and advanced feature engineering techniques.
                </p>
                <Link href="/projects" className="text-green-300 hover:text-green-200 text-sm font-medium inline-flex items-center gap-1">
                  View Competition Solutions
                  <ArrowRight size={14} />
                </Link>
              </div>
            </div>

            <div className="flex items-start gap-4 p-6 bg-white/5 rounded-xl border border-white/10 hover:bg-white/10 transition-all duration-300">
              <div className="w-12 h-12 bg-orange-500/20 rounded-lg flex items-center justify-center flex-shrink-0">
                <Code className="w-6 h-6 text-orange-400" />
              </div>
              <div>
                <h3 className="text-xl font-semibold text-white mb-2">Generative AI Research</h3>
                <p className="text-white/80 mb-3">
                  Exploring the frontiers of generative artificial intelligence, with focus on text-to-image models, 
                  audio synthesis, and multimodal AI systems for creative applications.
                </p>
                <Link href="/media" className="text-orange-300 hover:text-orange-200 text-sm font-medium inline-flex items-center gap-1">
                  View AI Creations
                  <ArrowRight size={14} />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Navigation Section */}
      <section className="max-w-4xl mx-auto px-8 pb-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { href: "/blog", text: "Research Blog", description: "Insights & Analysis", icon: "📝" },
            { href: "/projects", text: "Projects", description: "Technical Portfolio", icon: "🚀" },
            { href: "/resume", text: "Resume", description: "Professional Background", icon: "📄" },
            { href: "/media", text: "AI Creations", description: "Visual Experiments", icon: "🎨" }
          ].map((link) => (
            <Link 
              key={link.href}
              href={link.href} 
              className="group block p-6 bg-white/5 backdrop-blur-sm rounded-xl border border-white/10 hover:bg-white/10 hover:border-white/20 transition-all duration-300 hover:transform hover:scale-105"
            >
              <div className="text-2xl mb-3">{link.icon}</div>
              <h3 className="text-white font-semibold text-lg mb-2 group-hover:text-blue-300 transition-colors">
                {link.text}
              </h3>
              <p className="text-white/70 text-sm">{link.description}</p>
            </Link>
          ))}
        </div>
      </section>

      {/* Contact Section */}
      <section className="max-w-4xl mx-auto px-8 pb-16">
        <div className="text-center bg-white/5 backdrop-blur-sm rounded-2xl p-8 border border-white/10">
          <h2 className="text-2xl font-bold text-white mb-4">Let's Connect</h2>
          <p className="text-white/80 mb-6">
            Interested in collaboration, research opportunities, or discussing the latest in AI and data science?
          </p>
          <Link 
            href="mailto:kaanhacihaliloglu@gmail.com"
            className="inline-flex items-center gap-2 bg-white/10 hover:bg-white/20 text-white px-6 py-3 rounded-lg font-medium transition-all duration-300 border border-white/20 hover:border-white/30"
          >
            Get In Touch
            <ArrowRight size={18} />
          </Link>
        </div>
      </section>

      {/* AI Video Showcase Section - Updated with Available Videos */}
      <section className="max-w-6xl mx-auto px-8 pb-16">
        <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-8 border border-white/10 shadow-2xl">
          <div className="text-center mb-8">
            <div className="inline-flex items-center gap-2 mb-4">
              <Sparkles className="w-6 h-6 text-purple-400" />
              <h2 className="text-3xl font-bold text-white">AI Video Showcase</h2>
              <Sparkles className="w-6 h-6 text-purple-400" />
            </div>
            <p className="text-white/80 max-w-2xl mx-auto">
              Featured demonstrations of my AI experiments in computer vision, audio processing, and generative models.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            {featuredVideos.map((video) => (
              <Link 
                href="/media" 
                key={video.id} 
                className="group relative bg-gradient-to-br from-blue-500/20 to-purple-500/20 rounded-xl overflow-hidden border border-white/10 hover:border-white/20 transition-all duration-500 hover:transform hover:scale-[1.02]"
              >
                {/* Video Preview */}
                <div className="relative aspect-video bg-black/40 overflow-hidden">
                  <video
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                    muted
                    loop
                    preload="metadata"
                    onMouseEnter={(e) => {
                      const video = e.target as HTMLVideoElement
                      video.currentTime = 2 // Start preview at 2 seconds
                      video.play().catch(() => {
                        // Ignore play errors - will show black screen with play button
                      })
                    }}
                    onMouseLeave={(e) => {
                      const video = e.target as HTMLVideoElement
                      video.pause()
                      video.currentTime = 0
                    }}
                    onError={() => {
                      // Handle video load errors gracefully
                    }}
                  >
                    <source src={video.videoUrl} type="video/mp4" />
                    <source src={video.videoUrl} type="video/quicktime" />
                  </video>
                  
                  {/* Fallback content when video doesn't load */}
                  <div className="absolute inset-0 bg-gradient-to-br from-blue-600/30 to-purple-600/30 flex items-center justify-center">
                    <div className="text-center">
                      <Play className="w-16 h-16 text-white/80 mx-auto mb-2" fill="rgba(255,255,255,0.8)" />
                      <p className="text-white/60 text-sm">{video.category}</p>
                    </div>
                  </div>
                  
                  {/* Category Badge */}
                  <div className="absolute top-3 left-3 px-3 py-1 bg-black/70 backdrop-blur-sm rounded-full z-10">
                    <span className="text-white/90 text-sm font-medium">{video.category}</span>
                  </div>
                  
                  {/* Play Overlay */}
                  <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center z-10">
                    <div className="w-20 h-20 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm border border-white/30 group-hover:scale-110 transition-transform">
                      <Play className="w-10 h-10 text-white ml-1" fill="white" />
                    </div>
                  </div>

                  {/* Click to View Badge */}
                  <div className="absolute bottom-3 right-3 px-3 py-1 bg-blue-600/80 backdrop-blur-sm rounded-full opacity-0 group-hover:opacity-100 transition-opacity z-10">
                    <span className="text-white text-sm font-medium">Click to watch</span>
                  </div>
                </div>

                {/* Video Info */}
                <div className="p-6">
                  <h3 className="text-white font-bold text-lg mb-2 group-hover:text-blue-300 transition-colors">
                    {video.title}
                  </h3>
                  <p className="text-white/70 text-sm leading-relaxed">
                    {video.description}
                  </p>
                </div>
              </Link>
            ))}
          </div>
          
          <div className="text-center">
            <Link 
              href="/media"
              className="inline-flex items-center gap-2 bg-purple-600 hover:bg-purple-700 text-white px-8 py-3 rounded-lg font-semibold transition-all duration-300 hover:transform hover:scale-105"
            >
              Watch All AI Videos
              <ArrowRight size={18} />
            </Link>
          </div>
        </div>
      </section>
    </main>
  )
}