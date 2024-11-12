import Link from 'next/link'
import AnimatedHeader from '@/components/AnimatedHeader'

export default function Home() {
  return (
    <main className="min-h-screen p-8 relative">
      <div className="absolute inset-0 bg-black/40 -z-[5]" />
      
      <AnimatedHeader />
      
      <div className="max-w-2xl mx-auto mt-12 mb-16 relative">
        <h1 className="text-4xl font-bold text-white mb-6 drop-shadow-lg">
          Hey, I&apos;m Kaan 👋
        </h1>
        
        <p className="text-xl text-white mb-8 leading-relaxed drop-shadow-lg backdrop-blur-sm bg-black/20 p-6 rounded-lg">
          I&apos;m a data scientist who loves exploring new areas. I&apos;m into music, 
          enjoy working with machine learning, and keep up with everything Karpathy shares.
        </p>

        <div className="bg-black/40 backdrop-blur-sm rounded-lg p-6 mb-12 border border-white/10 shadow-xl">
          <h2 className="text-2xl font-semibold text-white mb-4 drop-shadow-lg">
            Current things I am working on:
          </h2>
          <ul className="space-y-3 text-white/90">
            <li className="flex items-start gap-2 drop-shadow-md">
              <span className="mt-1">🔬</span>
              <span>Trying to get better at Kaggle and Data Science</span>
            </li>
            <li className="flex items-start gap-2 drop-shadow-md">
              <span className="mt-1">🛠️</span>
              <span>Building the Diktatorial Suite</span>
            </li>
            <li className="flex items-start gap-2 drop-shadow-md">
              <span className="mt-1">🎵</span>
              <span>
                Trying to get better music visualizations through Generative AI
                <Link href="/media" className="text-blue-300 hover:underline ml-2 inline-block">
                  (see videos)
                </Link>
              </span>
            </li>
            <li className="flex items-start gap-2 drop-shadow-md">
              <span className="mt-1">🔊</span>
              <span>Exploring the frontiers of Audio AI</span>
            </li>
            <li className="flex items-start gap-2 drop-shadow-md">
              <span className="mt-1">🤖</span>
              <span>Diving into LLM&apos;s and agentic approaches</span>
            </li>
            <li className="flex items-start gap-2 drop-shadow-md">
              <span className="mt-1">🎨</span>
              <span>Following the magic of Text-to-Image models through research and experimentation</span>
            </li>
          </ul>
        </div>

        <nav className="space-y-4 bg-black/30 backdrop-blur-sm p-6 rounded-lg">
          {[
            { href: "/blog", text: "Blog" },
            { href: "/projects", text: "Projects" },
            { href: "/resume", text: "Resume" },
            { href: "/media", text: "Videos" },
            { href: "mailto:kaanhacihaliloglu@gmail.com", text: "Contact Me" }
          ].map((link) => (
            <Link 
              key={link.href}
              href={link.href} 
              className="block text-white hover:text-blue-300 text-xl transition-colors drop-shadow-md hover:translate-x-2 duration-300"
            >
              {link.text}
            </Link>
          ))}
        </nav>
      </div>
    </main>
  )
}