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
              Building Intelligence,
              <br />
              One Model at a Time
            </h1>
            <p className="text-lg md:text-xl text-zinc-400 max-w-2xl leading-relaxed">
              MSc Data Science candidate at Sabanci University. Transforming complex data into
              actionable insights through deep learning, NLP, and cutting-edge AI research.
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <Link
              href="/projects"
              className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium transition-colors"
            >
              Explore My Work
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
              Get in Touch
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
                Research Insights
              </h3>
              <p className="text-zinc-400 leading-relaxed">
                Deep dives into machine learning methodologies, research findings, and practical AI applications
              </p>
              <div className="flex items-center gap-2 text-blue-400 font-medium text-sm">
                Read articles
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
                Project Showcase
              </h3>
              <p className="text-zinc-400 leading-relaxed">
                From Kaggle competitions to production systems—end-to-end ML solutions that deliver results
              </p>
              <div className="flex items-center gap-2 text-blue-400 font-medium text-sm">
                View portfolio
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
                AI Experiments
              </h3>
              <p className="text-zinc-400 leading-relaxed">
                Pushing boundaries with generative models—from audio-reactive visuals to diffusion-based creations
              </p>
              <div className="flex items-center gap-2 text-blue-400 font-medium text-sm">
                Watch demos
                <ArrowRight size={16} />
              </div>
            </div>
          </Link>

          {/* About Card */}
          <div className="p-8 bg-zinc-900/30 border border-zinc-800 rounded-xl">
            <div className="space-y-3">
              <h3 className="text-2xl font-semibold tracking-tight text-white">
                About Me
              </h3>
              <p className="text-zinc-400 leading-relaxed">
                Driven by curiosity and powered by data. Bridging the gap between theoretical research
                and real-world impact through innovative AI solutions.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Current Focus Section */}
      <section className="max-w-4xl mx-auto px-6 md:px-8 pb-24">
        <div className="space-y-8">
          <h2 className="text-3xl md:text-4xl font-bold tracking-tight text-white">
            What I'm Working On
          </h2>

          <div className="grid gap-6">
            <div className="p-6 border border-zinc-800 rounded-lg hover:border-zinc-700 hover:bg-zinc-900/30 transition-all">
              <h3 className="text-lg font-semibold mb-2 text-white">Graduate Research @ Sabanci University</h3>
              <p className="text-zinc-400">
                Exploring novel approaches to predictive modeling and deep learning architectures.
                Focus on scalable solutions for complex, high-dimensional datasets.
              </p>
            </div>

            <div className="p-6 border border-zinc-800 rounded-lg hover:border-zinc-700 hover:bg-zinc-900/30 transition-all">
              <h3 className="text-lg font-semibold mb-2 text-white">SoundBoost.ai — Audio Enhancement Platform</h3>
              <p className="text-zinc-400">
                Building intelligent audio processing pipelines with state-of-the-art ML models.
                Transforming how creators enhance and visualize sound through AI.
              </p>
            </div>

            <div className="p-6 border border-zinc-800 rounded-lg hover:border-zinc-700 hover:bg-zinc-900/30 transition-all">
              <h3 className="text-lg font-semibold mb-2 text-white">Competitive ML on Kaggle</h3>
              <p className="text-zinc-400">
                Competing in data science challenges to sharpen skills in ensemble learning,
                feature engineering, and model optimization under real-world constraints.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
