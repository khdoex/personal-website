'use client'

import { motion, useTransform } from 'framer-motion'
import { useFigureProgress } from './ScrollFigure'
import { behaviorGeometryJoin } from './prompt-injection-defense-data'

const RED = 'rgb(var(--sun))'
const ZERO = 'rgb(var(--muted-dark))'
const TEXT = 'rgb(var(--muted))'
const HEADING = 'rgb(var(--heading))'

function signed(value: number, digits: number) {
  const rounded = Math.abs(value) < 0.5 * 10 ** -digits ? 0 : value
  return `${rounded > 0 ? '+' : ''}${rounded.toFixed(digits)}`
}

export default function PromptDefenseBehaviorGeometryFigure() {
  const progress = useFigureProgress()
  const reveal = useTransform(progress, [0.05, 0.55], [0.12, 1])
  return <div>
    <div className="mb-1 text-center font-mono text-sm text-heading">all three intervals cross zero</div>
    <div className="mb-6 text-center font-mono text-tick text-muted">successful minus suppressed, centered within task direction</div>
    <div className="grid gap-5 md:grid-cols-3">
      {behaviorGeometryJoin.map((metric) => {
        const span = Math.max(Math.abs(metric.lo), Math.abs(metric.hi)) * 1.12
        const sx = (value: number) => 30 + (value + span) / (2 * span) * 260
        return <div key={metric.label} className="rounded-md border border-border bg-surface/30 px-2 pt-3">
          <h3 className="min-h-10 text-center font-mono text-meta text-heading">{metric.label}</h3>
          <svg viewBox="0 0 320 180" className="w-full" role="img" aria-label={`${metric.label}: successful minus suppressed is ${signed(metric.value, metric.digits)}, with interval ${signed(metric.lo, metric.digits)} to ${signed(metric.hi, metric.digits)}.`}>
            <line x1={sx(0)} x2={sx(0)} y1="25" y2="122" stroke={ZERO} strokeWidth="2" />
            <motion.line x1={sx(metric.lo)} x2={sx(metric.hi)} y1="78" y2="78" stroke={RED} strokeWidth="3" style={{ opacity: reveal }} />
            <line x1={sx(metric.lo)} x2={sx(metric.lo)} y1="68" y2="88" stroke={RED} strokeWidth="2" />
            <line x1={sx(metric.hi)} x2={sx(metric.hi)} y1="68" y2="88" stroke={RED} strokeWidth="2" />
            <motion.circle cx={sx(metric.value)} cy="78" r="7" fill={RED} style={{ opacity: reveal }} />
            <text x="160" y="137" textAnchor="middle" fill={HEADING} fontSize="12">{signed(metric.value, metric.digits)}</text>
            <text x="160" y="156" textAnchor="middle" fill={TEXT} fontSize="10">[{signed(metric.lo, metric.digits)}, {signed(metric.hi, metric.digits)}]</text>
            <text x={sx(-span)} y="176" textAnchor="start" fill={TEXT} fontSize="8">suppressed larger</text>
            <text x={sx(span)} y="176" textAnchor="end" fill={TEXT} fontSize="8">successful larger</text>
          </svg>
        </div>
      })}
    </div>
    <div className="mt-4 text-center font-mono text-tick text-muted">12 successful, 84 suppressed · 2,000 base-cluster bootstrap passes · panel widths are not comparable across metrics</div>
  </div>
}
