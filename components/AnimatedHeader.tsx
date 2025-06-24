'use client'

import { motion } from 'framer-motion'

export default function AnimatedHeader() {
  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8, ease: "easeOut" }}
      className="text-center pt-16 pb-8"
    >
      <motion.div
        initial={{ scale: 0.8 }}
        animate={{ scale: 1 }}
        transition={{ duration: 0.6, delay: 0.2 }}
        className="inline-block"
      >
        <h1 className="text-2xl md:text-3xl font-light text-white/80 mb-2 tracking-wider">
          Kaan Hacıhaliloğlu
        </h1>
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: "100%" }}
          transition={{ duration: 0.8, delay: 0.6 }}
          className="h-0.5 bg-gradient-to-r from-blue-500 to-purple-500 mx-auto"
        />
      </motion.div>
    </motion.div>
  )
} 