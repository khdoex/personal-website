'use client'

import Image from 'next/image'
import { useRef } from 'react'
import {
  motion,
  useReducedMotion,
  useScroll,
  useTransform,
} from 'framer-motion'
import Reveal from '@/components/motion/Reveal'

/**
 * Blended portrait scene: the photo dissolves into the page background on
 * the right and drifts slower than the text on scroll (gentle parallax).
 */
export default function AboutHero({ children }: { children: React.ReactNode }) {
  const ref = useRef<HTMLElement>(null)
  const reduced = useReducedMotion()
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ['start start', 'end start'],
  })
  const y = useTransform(scrollYProgress, [0, 1], [0, 70])
  const opacity = useTransform(scrollYProgress, [0, 0.8], [0.9, 0.35])

  const mask =
    'radial-gradient(80% 90% at 62% 38%, black 30%, transparent 76%)'

  return (
    <section ref={ref} className="relative overflow-hidden">
      <motion.div
        aria-hidden
        style={reduced ? undefined : { y, opacity }}
        className="pointer-events-none absolute right-0 top-0 h-full w-[78%] sm:w-[52%] max-w-xl opacity-90"
      >
        <Image
          src="/images/kaan.png"
          alt=""
          width={1086}
          height={1448}
          priority
          className="h-full w-full object-cover object-top"
          style={{
            WebkitMaskImage: mask,
            maskImage: mask,
            filter: 'saturate(0.75) contrast(1.02)',
          }}
        />
      </motion.div>

      <div className="relative max-w-3xl mx-auto px-6 md:px-8 pt-24 md:pt-32 pb-16">
        <Reveal>
          <h1 className="font-mono text-lg font-semibold text-heading">
            about
          </h1>
        </Reveal>
        <div className="max-w-md sm:max-w-lg">{children}</div>
      </div>
    </section>
  )
}
