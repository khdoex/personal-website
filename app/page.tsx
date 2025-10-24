import Link from 'next/link'
import { ArrowRight } from 'lucide-react'

export default function Home() {
  return (
    <div className="animate-fade-in">
      {/* Hero Section */}
      <section className="max-w-4xl mx-auto px-6 md:px-8 py-24 md:py-32">
        <div className="space-y-8">
          <div className="space-y-4">
            <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight text-white">
              Data Scientist
              <br />
              & AI Researcher
            </h1>
            <p className="text-lg md:text-xl text-zinc-400 max-w-2xl leading-relaxed">
              MSc Data Science student at Sabanci University. Working with machine learning,
              NLP, computer vision, and audio AI.
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <Link
              href="/projects"
              className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium transition-colors"
            >
              View Projects
              <ArrowRight size={18} />
            </Link>
            <Link
              href="/resume"
              className="inline-flex items-center gap-2 border border-zinc-700 hover:border-zinc-600 hover:bg-zinc-800 text-white px-6 py-3 rounded-lg font-medium transition-colors"
            >
              Resume
            </Link>
            <Link
              href="mailto:kaanhacihaliloglu@gmail.com"
              className="inline-flex items-center gap-2 border border-zinc-700 hover:border-zinc-600 hover:bg-zinc-800 text-white px-6 py-3 rounded-lg font-medium transition-colors"
            >
              Contact
            </Link>
          </div>
        </div>
      </section>

      {/* Featured Work Grid */}
      <section className="max-w-4xl mx-auto px-6 md:px-8 pb-24">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Research Blog Card */}
          <Link
            href="/blog"
            className="group block p-8 border border-zinc-800 rounded-xl hover:border-zinc-700 hover:bg-zinc-900/50 transition-all"
          >
            <div className="space-y-3">
              <h3 className="text-2xl font-semibold tracking-tight text-white group-hover:text-blue-400 transition-colors">
                Research Blog
              </h3>
              <p className="text-zinc-400 leading-relaxed">
                Writing about machine learning, data science, and AI research
              </p>
              <div className="flex items-center gap-2 text-blue-400 font-medium text-sm">
                Read posts
                <ArrowRight size={16} />
              </div>
            </div>
          </Link>

          {/* Projects Card */}
          <Link
            href="/projects"
            className="group block p-8 border border-zinc-800 rounded-xl hover:border-zinc-700 hover:bg-zinc-900/50 transition-all"
          >
            <div className="space-y-3">
              <h3 className="text-2xl font-semibold tracking-tight text-white group-hover:text-blue-400 transition-colors">
                Projects
              </h3>
              <p className="text-zinc-400 leading-relaxed">
                Machine learning projects and Kaggle competition solutions
              </p>
              <div className="flex items-center gap-2 text-blue-400 font-medium text-sm">
                View work
                <ArrowRight size={16} />
              </div>
            </div>
          </Link>

          {/* AI Creations Card */}
          <Link
            href="/media"
            className="group block p-8 border border-zinc-800 rounded-xl hover:border-zinc-700 hover:bg-zinc-900/50 transition-all"
          >
            <div className="space-y-3">
              <h3 className="text-2xl font-semibold tracking-tight text-white group-hover:text-blue-400 transition-colors">
                Media
              </h3>
              <p className="text-zinc-400 leading-relaxed">
                Experiments with generative AI, computer vision, and audio processing
              </p>
              <div className="flex items-center gap-2 text-blue-400 font-medium text-sm">
                View gallery
                <ArrowRight size={16} />
              </div>
            </div>
          </Link>

          {/* About Card */}
          <div className="p-8 bg-zinc-900/30 border border-zinc-800 rounded-xl">
            <div className="space-y-3">
              <h3 className="text-2xl font-semibold tracking-tight text-white">
                About
              </h3>
              <p className="text-zinc-400 leading-relaxed">
                Interested in the intersection of machine learning and practical applications.
                Based in Istanbul, Turkey.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Current Focus Section */}
      <section className="max-w-4xl mx-auto px-6 md:px-8 pb-24">
        <div className="space-y-8">
          <h2 className="text-3xl md:text-4xl font-bold tracking-tight text-white">
            Current Work
          </h2>

          <div className="grid gap-6">
            <div className="p-6 border border-zinc-800 rounded-lg hover:border-zinc-700 hover:bg-zinc-900/30 transition-all">
              <h3 className="text-lg font-semibold mb-2 text-white">MSc Research at Sabanci University</h3>
              <p className="text-zinc-400">
                Working on machine learning research as part of my graduate program.
              </p>
            </div>

            <div className="p-6 border border-zinc-800 rounded-lg hover:border-zinc-700 hover:bg-zinc-900/30 transition-all">
              <h3 className="text-lg font-semibold mb-2 text-white">SoundBoost.ai</h3>
              <p className="text-zinc-400">
                Building an audio enhancement platform using machine learning.
              </p>
            </div>

            <div className="p-6 border border-zinc-800 rounded-lg hover:border-zinc-700 hover:bg-zinc-900/30 transition-all">
              <h3 className="text-lg font-semibold mb-2 text-white">Kaggle Competitions</h3>
              <p className="text-zinc-400">
                Participating in data science competitions to practice ensemble methods and feature engineering.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
