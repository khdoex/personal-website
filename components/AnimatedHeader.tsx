'use client'

import { motion } from 'framer-motion'

export default function AnimatedHeader() {
  return (
    <motion.h1
      initial={{ opacity: 0, y: -50 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="text-4xl font-bold mb-8"
    >
      Kaan Hacıhaliloğlu
    </motion.h1>
  )
} 