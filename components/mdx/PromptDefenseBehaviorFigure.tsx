'use client'

import { motion, useTransform } from 'framer-motion'
import { useFigureProgress } from './ScrollFigure'
import { defenseBehavior } from './prompt-injection-defense-data'

const BLUE = '#5ec4ff'
const AMBER = '#d98e48'
const TARGET_THEN = '#4a9bc2'
const INJECTED_THEN = '#ce674c'
const UNKNOWN = '#8396a6'
const GRID = '#2f3b47'
const TEXT = '#8aa0b1'
const HEADING = '#e8eef4'

const sequenceColors = [BLUE, TARGET_THEN, INJECTED_THEN, AMBER, UNKNOWN]
const sequenceLabels = ['target only', 'target → injected', 'injected → target', 'injected only', 'right-censored']

export default function PromptDefenseBehaviorFigure() {
  const progress = useFigureProgress()
  const reveal = useTransform(progress, [0.05, 0.55], [0.12, 1])

  return (
    <div className="grid gap-10 lg:grid-cols-2 lg:gap-8">
      <div>
        <h3 className="mb-3 font-mono text-sm text-heading">which task appeared anywhere?</h3>
        <svg viewBox="0 0 560 430" className="w-full" role="img" aria-label="Target and injected task addressing rates across seven system-prompt defenses.">
          <rect x="0" y="226" width="548" height="36" rx="4" fill="#5ec4ff" opacity="0.045" />
          {[0, 0.5, 1].map((tick) => {
            const x = 178 + tick * 350
            return <g key={tick}>
              <line x1={x} x2={x} y1="30" y2="382" stroke={GRID} />
              <text x={x} y="406" textAnchor="middle" fill={TEXT} fontSize="12">{Math.round(tick * 100)}%</text>
            </g>
          })}
          {defenseBehavior.map((row, index) => {
            const y = 52 + index * 48
            const targetX = 178 + row.target * 350
            const injectedX = 178 + row.injected * 350
            return <g key={row.key}>
              <text x="164" y={y + 4} textAnchor="end" fill={row.key.includes('reminder') ? HEADING : TEXT} fontSize="14">{row.label}</text>
              <motion.line x1={targetX} x2={injectedX} y1={y} y2={y} stroke="#52616e" strokeWidth="2" style={{ opacity: reveal }} />
              <motion.circle cx={targetX} cy={y} r="6" fill={BLUE} style={{ opacity: reveal }} />
              <motion.rect x={injectedX - 5.5} y={y - 5.5} width="11" height="11" rx="1" fill={AMBER} style={{ opacity: reveal }} />
            </g>
          })}
          <circle cx="204" cy="421" r="5" fill={BLUE} />
          <text x="216" y="425" fill={TEXT} fontSize="10">target addressed</text>
          <rect x="343" y="416" width="10" height="10" rx="1" fill={AMBER} />
          <text x="360" y="425" fill={TEXT} fontSize="10">injected addressed</text>
        </svg>
      </div>

      <div>
        <h3 className="mb-3 font-mono text-sm text-heading">what did each answer contain?</h3>
        <svg viewBox="0 0 560 430" className="w-full" role="img" aria-label="First-answer sequence composition across seven system-prompt defenses.">
          <rect x="0" y="225" width="548" height="36" rx="4" fill="#5ec4ff" opacity="0.045" />
          {[0, 0.5, 1].map((tick) => {
            const x = 154 + tick * 374
            return <g key={tick}>
              <line x1={x} x2={x} y1="30" y2="382" stroke={GRID} />
              <text x={x} y="406" textAnchor="middle" fill={TEXT} fontSize="12">{Math.round(tick * 100)}%</text>
            </g>
          })}
          {defenseBehavior.map((row, index) => {
            const y = 37 + index * 48
            let left = 154
            return <g key={row.key}>
              <text x="142" y={y + 18} textAnchor="end" fill={row.key.includes('reminder') ? HEADING : TEXT} fontSize="14">{row.label}</text>
              {row.sequence.map((count, segment) => {
                const width = count / 96 * 374
                const x = left
                left += width
                return <motion.rect key={segment} x={x} y={y} width={Math.max(width, 0)} height="28" fill={sequenceColors[segment]} style={{ opacity: reveal }} />
              })}
            </g>
          })}
        </svg>
        <div className="flex flex-wrap justify-center gap-x-4 gap-y-1 font-mono text-[10px] text-muted">
          {sequenceLabels.map((label, index) => <span key={label}><span className="mr-1.5 inline-block h-2 w-2" style={{ background: sequenceColors[index] }} />{label}</span>)}
        </div>
      </div>
    </div>
  )
}
