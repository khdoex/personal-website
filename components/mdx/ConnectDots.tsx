'use client'

import { motion, useTransform, type MotionValue } from 'framer-motion'
import { useFigureProgress } from './ScrollFigure'

interface Dot {
  x: number
  y: number
  color?: 'accent' | 'amber'
  label?: string
}

const COLORS = { accent: '#5ec4ff', amber: '#d98e48' }

function Edge({
  from,
  to,
  index,
  count,
  progress,
}: {
  from: Dot
  to: Dot
  index: number
  count: number
  progress: MotionValue<number>
}) {
  const start = (index / count) * 0.4
  const pathLength = useTransform(progress, [start, start + 0.6], [0, 1])

  return (
    <motion.line
      x1={from.x}
      y1={from.y}
      x2={to.x}
      y2={to.y}
      stroke={COLORS[from.color ?? 'accent']}
      strokeWidth={1.5}
      opacity={0.7}
      style={{ pathLength }}
    />
  )
}

/**
 * SVG dots with connection lines that draw themselves as the reader
 * scrolls. Coordinates live in a 300x120 viewBox.
 */
export default function ConnectDots({
  dots,
  edges,
}: {
  dots: Dot[]
  edges: [number, number][]
}) {
  const progress = useFigureProgress()
  const dotsOpacity = useTransform(progress, [0, 0.25], [0.15, 1])

  return (
    <svg
      viewBox="0 0 300 120"
      className="w-full"
      role="img"
      aria-label="connected points diagram"
    >
      {edges.map(([a, b], i) => (
        <Edge
          key={`${a}-${b}`}
          from={dots[a]}
          to={dots[b]}
          index={i}
          count={edges.length}
          progress={progress}
        />
      ))}
      {dots.map((dot, i) => (
        <motion.g key={i} style={{ opacity: dotsOpacity }}>
          <circle cx={dot.x} cy={dot.y} r={4} fill={COLORS[dot.color ?? 'accent']} />
          {dot.label && (
            <text
              x={dot.x}
              y={dot.y - 10}
              fill="#718ca1"
              fontSize={9}
              fontFamily="var(--font-mono), monospace"
              textAnchor="middle"
            >
              {dot.label}
            </text>
          )}
        </motion.g>
      ))}
    </svg>
  )
}
