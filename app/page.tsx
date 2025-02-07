'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import HeroScene from '@/components/HeroScene';
import { useState, useEffect } from 'react';

const menuItems = [
  { href: "/blog", text: "Blog", icon: "📝", description: "Thoughts and insights" },
  { href: "/projects", text: "Projects", icon: "💡", description: "My work and experiments" },
  { href: "/resume", text: "Resume", icon: "📄", description: "Professional experience" },
  { href: "/media", text: "Media", icon: "🎬", description: "Videos and visuals" },
  { href: "mailto:kaanhacihaliloglu@gmail.com", text: "Contact", icon: "✉️", description: "Get in touch" }
];

function TypewriterEffect({ phrases, finalPhrase, className }: { phrases: string[], finalPhrase: string, className: string }) {
  const [text, setText] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);
  const [loopNum, setLoopNum] = useState(0);
  const [typingSpeed, setTypingSpeed] = useState(150);

  useEffect(() => {
    const currentPhrase = phrases[loopNum % phrases.length];
    
    const handleTyping = () => {
      setText(currentPhrase.substring(0, text.length + (isDeleting ? -1 : 1)));

      if (!isDeleting && text === currentPhrase) {
        if (currentPhrase === finalPhrase) return; // Stop if we reached the final phrase
        
        setTimeout(() => setIsDeleting(true), 1500);
        setTypingSpeed(100);
      } else if (isDeleting && text === '') {
        setIsDeleting(false);
        setLoopNum(loopNum + 1);
        setTypingSpeed(150);
      }
    };

    const timer = setTimeout(handleTyping, typingSpeed);
    return () => clearTimeout(timer);
  }, [text, isDeleting, loopNum, typingSpeed, phrases, finalPhrase]);

  return (
    <div className={className}>
      {text}
    </div>
  );
}

function HeaderTyping() {
  return (
    <TypewriterEffect 
      phrases={['Hey! 👋', 'Hey, I am Kaan', 'i am kaan']}
      finalPhrase="i am kaan"
      className="text-7xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 mb-4 min-h-[6rem]"
    />
  );
}

function SubheaderTyping() {
  return (
    <TypewriterEffect 
      phrases={[
        'Physicist',
        'CS Master Student',
        'Data Science MSc Student, AI Engineer, Data Scientist, Music Nerd'
      ]}
      finalPhrase="Data Science MSc Student, AI Engineer, Data Scientist, Music Nerd"
      className="text-2xl text-gray-300"
    />
  );
}

export default function Home() {
  const [showContent, setShowContent] = useState(false);

  useEffect(() => {
    // Delay showing the content to let both typing animations complete
    const timer = setTimeout(() => setShowContent(true), 8000);
    return () => clearTimeout(timer);
  }, []);

  return (
    <main className="min-h-screen relative overflow-hidden">
      <HeroScene />
      
      <div className="relative z-10 max-w-6xl mx-auto px-6 py-24">
        <div className="mb-16 text-center">
          <HeaderTyping />
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1, delay: 2 }}
            className="max-w-2xl mx-auto"
          >
            <SubheaderTyping />
          </motion.div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-16">
          {menuItems.map((item, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: showContent ? 1 : 0, y: showContent ? 0 : 20 }}
              transition={{ duration: 0.5, delay: showContent ? 0.1 * index : 0 }}
            >
              <Link href={item.href}>
                <motion.div 
                  className="group relative overflow-hidden rounded-2xl backdrop-blur-sm bg-white/5 border border-white/10 p-6 hover:bg-white/10 transition-all duration-500"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 to-purple-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                  <span className="text-3xl mb-4 block">{item.icon}</span>
                  <h3 className="text-xl font-semibold text-white mb-2">{item.text}</h3>
                  <p className="text-gray-400 text-sm">{item.description}</p>
                  <div className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-blue-400 to-purple-400 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-500 origin-left" />
                </motion.div>
              </Link>
            </motion.div>
          ))}
        </div>

        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: showContent ? 1 : 0 }}
          transition={{ duration: 1, delay: 1 }}
          className="backdrop-blur-lg bg-white/5 border border-white/10 rounded-2xl p-8"
        >
          <h2 className="text-2xl font-semibold text-white mb-6">
            Current Explorations
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {[
              { icon: "🔬", text: "Advancing in Kaggle and Data Science" },
              { icon: "🛠️", text: "Building the Diktatorial Suite" },
              { icon: "🎵", text: "Creating AI-powered music visualizations" },
              { icon: "🔊", text: "Exploring Audio AI frontiers" },
              { icon: "🤖", text: "Diving into LLMs and agentic approaches" },
              { icon: "🎨", text: "Experimenting with Text-to-Image models" }
            ].map((item, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: showContent ? 1 : 0, x: showContent ? 0 : -20 }}
                transition={{ duration: 0.5, delay: showContent ? 0.2 * index : 0 }}
                className="flex items-center space-x-4 bg-white/5 backdrop-blur-sm p-4 rounded-xl hover:bg-white/10 transition-all duration-300"
              >
                <span className="text-2xl">{item.icon}</span>
                <span className="text-gray-200">{item.text}</span>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </main>
  );
}