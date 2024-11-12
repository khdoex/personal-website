'use client'

import { Github, Mail, Twitter } from 'lucide-react'

export default function SocialLinks() {
  return (
    <div className="fixed bottom-8 right-8 flex gap-4 z-50">
      <a
        href="https://github.com/khdoex"
        target="_blank"
        rel="noopener noreferrer"
        className="p-2 text-white hover:text-blue-300 transition-colors cursor-pointer rounded-full hover:bg-white/10"
        aria-label="GitHub"
      >
        <Github 
          size={24} 
          className="pointer-events-none"
        />
      </a>
      <a
        href="https://x.com/kaanhho"
        target="_blank"
        rel="noopener noreferrer"
        className="p-2 text-white hover:text-blue-300 transition-colors cursor-pointer rounded-full hover:bg-white/10"
        aria-label="Twitter/X"
      >
        <Twitter 
          size={24}
          className="pointer-events-none"
        />
      </a>
      <a
        href="mailto:kaanhacihaliloglu@gmail.com"
        className="p-2 text-white hover:text-blue-300 transition-colors cursor-pointer rounded-full hover:bg-white/10"
        aria-label="Email"
      >
        <Mail 
          size={24}
          className="pointer-events-none"
        />
      </a>
    </div>
  )
} 