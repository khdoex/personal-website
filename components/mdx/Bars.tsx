'use client'

import { motion, useTransform, type MotionValue } from 'framer-motion'
import { useFigureProgress } from './ScrollFigure'

interface BarDatum {
  label: string
  value: number // 0..1 of full width
}

function Bar({
  datum,
  index,
  count,
  progress,
}: {
  datum: BarDatum
  index: number
  count: number
  progress: MotionValue<number>
}) {
  const start = (index / count) * 0.5
  const width = useTransform(
    progress,
    [start, start + 0.5],
    ['0%', `${Math.round(datum.value * 100)}%`]
  )

  return (
    <div>
      <span className="font-mono text-tick text-muted">{datum.label}</span>
      <motion.div
        className="h-2.5 rounded-sm mt-1"
        style={{
          width,
          background: 'linear-gradient(90deg, rgb(var(--sky)), rgb(var(--sky) / 0.35))',
        }}
      />
    </div>
  )
}

/** Horizontal bars that grow as the reader scrolls the figure into view. */
export default function Bars({ data }: { data: BarDatum[] }) {
  const progress = useFigureProgress()

  return (
    <div className="space-y-3">
      {data.map((datum, i) => (
        <Bar
          key={datum.label}
          datum={datum}
          index={i}
          count={data.length}
          progress={progress}
        />
      ))}
    </div>
  )
}
