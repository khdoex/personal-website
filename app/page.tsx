import Link from 'next/link'
import AnimatedHeader from '@/components/AnimatedHeader'

export default function Home() {
  return (
    <main className="min-h-screen p-8">
      <AnimatedHeader />
      
      <div className="max-w-2xl mx-auto mt-12 mb-16">
        <h1 className="text-4xl font-bold text-white mb-6">Hey, I'm Kaan 👋</h1>
        
        <p className="text-xl text-gray-300 mb-8 leading-relaxed">

        I'm a data scientist who loves exploring new areas. I'm into music, enjoy working with machine learning, and keep up with everything Karpathy shares. </p>

        <div className="bg-gray-800/50 rounded-lg p-6 mb-12 border border-gray-700/50">
          <h2 className="text-2xl font-semibold text-white mb-4">Current things I am working on:</h2>
          <ul className="space-y-2 text-gray-300">
            <li>🔬 Trying to get better at Kaggle and Data Science</li>
            <li>🛠️ Building the Diktatorial Suite</li>
            <li>
              🎵 Trying to get better music visualizations through Generative AI
              <Link href="/media" className="text-blue-300 hover:underline ml-2">(see videos)</Link>
            </li>
            <li>🔊 Exploring the frontiers of Audio AI</li>
            <li>🤖 Diving into LLM's and agentic approaches</li>
            <li>🎨 Following the magic of Text-to-Image models through research and experimentation</li>
          </ul>
        </div>

        <nav className="space-y-4">
          <Link href="/blog" className="block text-white hover:text-blue-300 text-xl transition-colors">Blog</Link>
          <Link href="/projects" className="block text-white hover:text-blue-300 text-xl transition-colors">Projects</Link>
          <Link href="/resume" className="block text-white hover:text-blue-300 text-xl transition-colors">Resume</Link>
          <Link href="/media" className="block text-white hover:text-blue-300 text-xl transition-colors">Videos</Link>
          <Link 
            href="mailto:kaanhacihaliloglu@gmail.com" 
            className="block text-white hover:text-blue-300 text-xl transition-colors"
          >
            Contact Me
          </Link>
        </nav>
      </div>
    </main>
  )
}