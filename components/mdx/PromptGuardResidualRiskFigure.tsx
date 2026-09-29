'use client'

import { motion, useTransform } from 'framer-motion'
import { useFigureProgress } from './ScrollFigure'
import { detectorRates, detectorResidualRisk } from './prompt-injection-defense-data'

const MISSED = 'rgb(var(--sun))'
const CAUGHT = 'rgb(var(--sun) / 0.55)'
const SUPPRESSED = 'rgb(var(--muted-dark))'
const GRID = 'rgb(var(--border))'
const TEXT = 'rgb(var(--muted))'
const HEADING = 'rgb(var(--heading))'

function ResidualRiskPlot({ compact = false }: { compact?: boolean }) {
  const progress = useFigureProgress()
  const reveal = useTransform(progress, [0.05, 0.55], [0.12, 1])
  const width = compact ? 390 : 650
  const height = compact ? 390 : 390
  const x = compact ? 104 : 150
  const barWidth = compact ? 256 : 450
  const labelX = compact ? 96 : 138
  const yStart = compact ? 38 : 39
  const yStep = compact ? 43 : 43
  const barHeight = compact ? 25 : 25
  const font = compact ? 10 : 11

  return <svg viewBox={`0 0 ${width} ${height}`} className="w-full" role="img" aria-label="Most attacks that remain successful under each prompt defense are detector-negative. Under XML plus reminder, ten of twelve successful attacks are missed.">
    {[0, 48, 96].map((tick) => {
      const tickX = x + tick / 96 * barWidth
      return <g key={tick}><line x1={tickX} x2={tickX} y1="28" y2="342" stroke={GRID} /><text x={tickX} y="365" textAnchor="middle" fill={TEXT} fontSize={font}>{tick}</text></g>
    })}
    {detectorResidualRisk.map((row, index) => {
      const y = yStart + index * yStep
      const missedWidth = row.missed / 96 * barWidth
      const caughtWidth = row.caught / 96 * barWidth
      const suppressedWidth = row.suppressed / 96 * barWidth
      const successes = row.missed + row.caught
      return <g key={row.label}>
        <text x={labelX} y={y + 17} textAnchor="end" fill={row.label.includes('reminder') ? HEADING : TEXT} fontSize={font}>{row.label}</text>
        <motion.rect x={x} y={y} width={missedWidth} height={barHeight} fill={MISSED} style={{ opacity: reveal }} />
        <motion.rect x={x + missedWidth} y={y} width={caughtWidth} height={barHeight} fill={CAUGHT} style={{ opacity: reveal }} />
        <motion.rect x={x + missedWidth + caughtWidth} y={y} width={suppressedWidth} height={barHeight} fill={SUPPRESSED} style={{ opacity: reveal }} />
        <text x={compact ? x + barWidth - 5 : Math.min(158 + missedWidth + caughtWidth, 555)} y={y + 17} textAnchor={compact ? 'end' : 'start'} fill="rgb(var(--sun))" fontSize={compact ? 9 : 10}>{row.missed}/{successes} missed</text>
      </g>
    })}
    <text x={x + barWidth / 2} y="387" textAnchor="middle" fill={TEXT} fontSize={font}>annotated outputs</text>
  </svg>
}

export default function PromptGuardResidualRiskFigure() {
  const progress = useFigureProgress()
  const reveal = useTransform(progress, [0.05, 0.55], [0.12, 1])

  return <div className="grid gap-10 lg:grid-cols-[0.72fr_1.28fr] lg:gap-8">
    <div>
      <h3 className="mb-3 font-mono text-sm text-heading">what the detector flags</h3>
      <svg viewBox="0 0 430 360" className="w-full" role="img" aria-label="Prompt Guard flags published injection and matched imperative text at nearly identical rates, while flagging no clean external data.">
        {[0, 0.5, 1].map((tick) => {
          const x = 145 + tick * 250
          return <g key={tick}><line x1={x} x2={x} y1="34" y2="270" stroke={GRID} /><text x={x} y="292" textAnchor="middle" fill={TEXT} fontSize="10">{Math.round(tick * 100)}%</text></g>
        })}
        {detectorRates.map((row, index) => {
          const y = 78 + index * 78
          const x = 145 + row.value * 250
          const lo = 145 + row.lo * 250
          const hi = 145 + row.hi * 250
          return <g key={row.label}>
            <text x="134" y={y + 4} textAnchor="end" fill={TEXT} fontSize="11">{row.label}</text>
            <motion.line x1={lo} x2={hi} y1={y} y2={y} stroke="rgb(var(--muted))" strokeWidth="2" style={{ opacity: reveal }} />
            <motion.circle cx={x} cy={y} r="7" fill={index === 2 ? SUPPRESSED : MISSED} style={{ opacity: reveal }} />
            <text x={Math.min(x + 12, 397)} y={y + 4} fill={HEADING} fontSize="11">{Math.round(row.value * 100)}%</text>
          </g>
        })}
        <text x="270" y="330" textAnchor="middle" fill={TEXT} fontSize="10">flagged malicious at the frozen threshold</text>
      </svg>
    </div>

    <div>
      <h3 className="mb-3 font-mono text-sm text-heading">what happens to successful attacks</h3>
      <div className="hidden sm:block"><ResidualRiskPlot /></div>
      <div className="sm:hidden"><ResidualRiskPlot compact /></div>
      <div className="flex flex-wrap justify-center gap-x-4 gap-y-1 font-mono text-tick text-muted">
        <span><span className="mr-1.5 inline-block h-2 w-2" style={{ background: MISSED }} />visible attack, detector-negative</span>
        <span><span className="mr-1.5 inline-block h-2 w-2" style={{ background: CAUGHT }} />visible attack, input flagged</span>
        <span><span className="mr-1.5 inline-block h-2 w-2" style={{ background: SUPPRESSED }} />injected task not in answer</span>
      </div>
      <div className="mt-2 text-center font-mono text-tick text-muted">baseline has one output cut off before its behavior could be labeled</div>
    </div>
  </div>
}
