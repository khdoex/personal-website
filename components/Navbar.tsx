'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion } from 'framer-motion';

const menuItems = [
  { href: "/", text: "Home", icon: "🏠" },
  { href: "/blog", text: "Blog", icon: "📝" },
  { href: "/projects", text: "Projects", icon: "💡" },
  { href: "/resume", text: "Resume", icon: "📄" },
  { href: "/media", text: "Media", icon: "🎬" },
  { href: "mailto:kaanhacihaliloglu@gmail.com", text: "Contact", icon: "✉️" }
];

export default function Navbar() {
  const pathname = usePathname();

  return (
    <motion.nav 
      initial={{ x: -100, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="fixed left-0 top-0 h-screen w-20 backdrop-blur-lg bg-white/5 border-r border-white/10 flex flex-col items-center py-8 z-50"
    >
      <div className="flex-1 flex flex-col items-center gap-6">
        {menuItems.map((item, index) => {
          const isActive = pathname === item.href;
          return (
            <Link 
              key={index} 
              href={item.href}
            >
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: index * 0.1 }}
                className={`relative group p-3 rounded-xl transition-all duration-300 hover:bg-white/10
                  ${isActive ? 'bg-white/20' : 'bg-transparent'}`}
              >
                {/* Glow effect */}
                <div className={`absolute inset-0 rounded-xl bg-gradient-to-r from-blue-500/20 to-purple-500/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 -z-10 blur-md`} />
                
                {/* Icon */}
                <span className="text-2xl">{item.icon}</span>
                
                {/* Tooltip */}
                <div className="absolute left-full ml-4 px-3 py-1 bg-white/10 backdrop-blur-lg rounded-lg 
                  opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none
                  whitespace-nowrap text-sm text-white border border-white/10">
                  {item.text}
                </div>

                {/* Active indicator */}
                {isActive && (
                  <motion.div 
                    layoutId="activeIndicator"
                    className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-gradient-to-b from-blue-400 to-purple-400 rounded-r"
                  />
                )}
              </motion.div>
            </Link>
          );
        })}
      </div>
    </motion.nav>
  );
} 