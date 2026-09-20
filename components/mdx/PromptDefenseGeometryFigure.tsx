'use client'

import { motion, useTransform } from 'framer-motion'
import { useFigureProgress } from './ScrollFigure'
import { displacementRetention } from './prompt-injection-defense-data'

const RED = '#dc645c'
const BLUE = '#5ec4ff'
const GRID = '#2f3b47'
const TEXT = '#8aa0b1'

function linePath(values: readonly number[], sx: (layer: number) => number, sy: (value: number) => number) {
  return values.slice(1).map((value, index) => `${index === 0 ? 'M' : 'L'}${sx(index + 1).toFixed(1)},${sy(value).toFixed(1)}`).join(' ')
}

function bandPath(lo: readonly number[], hi: readonly number[], sx: (layer: number) => number, sy: (value: number) => number) {
  const top = hi.slice(1).map((value, index) => `${index === 0 ? 'M' : 'L'}${sx(index + 1).toFixed(1)},${sy(value).toFixed(1)}`)
  const bottom = lo.slice(1).map((value, index) => `L${sx(index + 1).toFixed(1)},${sy(value).toFixed(1)}`).reverse()
  return `${top.join(' ')} ${bottom.join(' ')} Z`
}

function Plot({ compact = false }: { compact?: boolean }) {
  const progress = useFigureProgress()
  const bandOpacity = useTransform(progress, [0, 0.45], [0.04, 0.18])
  const width = compact ? 360 : 840
  const height = compact ? 315 : 350
  const x = compact ? 46 : 66
  const y = compact ? 35 : 30
  const w = compact ? 286 : 735
  const h = compact ? 210 : 250
  const sx = (layer: number) => x + ((layer - 1) / 27) * w
  const sy = (value: number) => y + (1 - value) * h
  const font = compact ? 10 : 11

  return <svg viewBox={`0 0 ${width} ${height}`} className="w-full" role="img" aria-label="Residual displacement magnitude retained by layer. XML plus reminder remains near sixty percent of baseline in the registered late-layer window.">
    <rect x={sx(18)} y={y} width={sx(27) - sx(18)} height={h} fill="#d98e48" opacity="0.07" />
    <text x={(sx(18) + sx(27)) / 2} y={y + 13} textAnchor="middle" fill="#a68262" fontSize={font - 1}>registered measurement window</text>
    <text x={(sx(18) + sx(27)) / 2} y={y + 29} textAnchor="middle" fill={RED} fontSize={font}>average: 62.5% of baseline</text>
    {[0, 0.5, 1].map((tick) => <g key={tick}>
      <line x1={x} x2={x + w} y1={sy(tick)} y2={sy(tick)} stroke={GRID} />
      <text x={x - 8} y={sy(tick) + 3} textAnchor="end" fill={TEXT} fontSize={font}>{Math.round(tick * 100)}%</text>
    </g>)}
    {[1, 7, 13, 19, 25, 28].map((tick) => <g key={tick}>
      <line x1={sx(tick)} x2={sx(tick)} y1={y} y2={y + h} stroke={GRID} opacity="0.45" />
      <text x={sx(tick)} y={y + h + 18} textAnchor="middle" fill={TEXT} fontSize={font}>{tick}</text>
    </g>)}
    <line x1={x} x2={x + w} y1={sy(1)} y2={sy(1)} stroke="#b8c1ca" strokeDasharray="5 5" />
    <text x={x + 5} y={sy(1) + 13} fill="#b8c1ca" fontSize={font - 1}>no-defense baseline = 100%</text>
    <motion.path d={bandPath(displacementRetention.otherLo, displacementRetention.otherHi, sx, sy)} fill={BLUE} style={{ opacity: bandOpacity }} />
    <motion.path d={linePath(displacementRetention.primary, sx, sy)} fill="none" stroke={RED} strokeWidth={compact ? 2.6 : 3.4} strokeLinejoin="round" style={{ pathLength: progress }} />
    <circle cx={sx(27)} cy={sy(displacementRetention.primary[27])} r={compact ? 4 : 5} fill={RED} />
    <text x={sx(27) - 4} y={sy(displacementRetention.primary[27]) - 10} textAnchor="end" fill={RED} fontSize={font}>58% at L27</text>
    <text x={x + w / 2} y={height - 6} textAnchor="middle" fill={TEXT} fontSize={font}>residual-stream layer</text>
    <text x={compact ? 11 : 16} y={y + h / 2} transform={`rotate(-90 ${compact ? 11 : 16} ${y + h / 2})`} textAnchor="middle" fill={TEXT} fontSize={font}>magnitude retained vs baseline</text>
    <g transform={`translate(${compact ? 55 : 570},${compact ? 273 : 318})`}>
      <rect x="0" y="-7" width="22" height="10" fill={BLUE} opacity="0.2" /><text x="29" y="2" fill={TEXT} fontSize={font - 1}>five other prompts, not uncertainty</text>
      <line x1={compact ? 155 : -185} x2={compact ? 177 : -163} y1="-2" y2="-2" stroke={RED} strokeWidth="3" /><text x={compact ? 184 : -156} y="2" fill={TEXT} fontSize={font - 1}>xml + reminder</text>
    </g>
  </svg>
}

export default function PromptDefenseGeometryFigure() {
  return <>
    <div className="hidden sm:block"><Plot /></div>
    <div className="sm:hidden"><Plot compact /></div>
  </>
}
