'use client'

import { motion } from 'framer-motion'
import { useFigureProgress } from './ScrollFigure'

const BLUE = 'rgb(var(--sky))'
const AMBER = 'rgb(var(--sun))'
const GRID = 'rgb(var(--border))'
const TEXT = 'rgb(var(--muted))'
const HEADING = 'rgb(var(--heading))'

const scales = [0, 0.5, 1]
const unauthorized = [2.733, 1.654, 1.475]
const authorized = [1.292, 1.268, 1.610]
const auc = [0.9899, 0.9867, 0.9823]

function path(values: number[], sx: (index: number) => number, sy: (value: number) => number) {
  return values.map((value, index) => `${index === 0 ? 'M' : 'L'}${sx(index)},${sy(value)}`).join(' ')
}

function ShiftPanel() {
  const progress = useFigureProgress()
  const x = 54
  const y = 38
  const w = 390
  const h = 230
  const sx = (index: number) => x + index / 2 * w
  const sy = (value: number) => y + (3 - value) / 3 * h

  return (
    <svg viewBox="0 0 480 335" className="w-full" role="img" aria-label="Unauthorized source shift falls from 2.733 to 1.475 as SecAlign strength rises, while the authorized shift stays between 1.268 and 1.610.">
      <text x={x} y="17" fill={HEADING} fontSize="14" fontFamily="var(--font-mono), monospace">what the source does to the action margin</text>
      {[0, 1, 2, 3].map((tick) => <g key={tick}>
        <line x1={x} x2={x + w} y1={sy(tick)} y2={sy(tick)} stroke={GRID} />
        <text x={x - 10} y={sy(tick) + 4} textAnchor="end" fill={TEXT} fontSize="11">+{tick}</text>
      </g>)}
      {scales.map((scale, index) => <g key={scale}>
        <line x1={sx(index)} x2={sx(index)} y1={y} y2={y + h} stroke={GRID} opacity="0.45" />
        <text x={sx(index)} y={y + h + 22} textAnchor="middle" fill={TEXT} fontSize="11">{scale === 0 ? 'base' : scale === 0.5 ? 'half' : 'full'}</text>
      </g>)}
      <motion.path d={path(unauthorized, sx, sy)} fill="none" stroke={AMBER} strokeWidth="3.5" strokeLinejoin="round" style={{ pathLength: progress }} />
      <motion.path d={path(authorized, sx, sy)} fill="none" stroke={BLUE} strokeWidth="3.5" strokeLinejoin="round" style={{ pathLength: progress }} />
      {unauthorized.map((value, index) => <circle key={`u-${index}`} cx={sx(index)} cy={sy(value)} r="5.5" fill={AMBER} />)}
      {authorized.map((value, index) => <circle key={`a-${index}`} cx={sx(index)} cy={sy(value)} r="5.5" fill={BLUE} />)}
      <text x={sx(0) + 10} y={sy(unauthorized[0]) - 11} fill={AMBER} fontSize="11">+2.733</text>
      <text x={sx(2) - 8} y={sy(unauthorized[2]) - 12} textAnchor="end" fill={AMBER} fontSize="11">+1.475</text>
      <text x={sx(2) - 8} y={sy(authorized[2]) + 19} textAnchor="end" fill={BLUE} fontSize="11">+1.610</text>
      <text x={x + w / 2} y="326" textAnchor="middle" fill={TEXT} fontSize="10">SecAlign adapter strength</text>
    </svg>
  )
}

function ReadoutPanel() {
  const progress = useFigureProgress()
  const x = 54
  const y = 38
  const w = 390
  const h = 230
  const sx = (index: number) => x + index / 2 * w
  const sy = (value: number) => y + (1 - value) / 0.5 * h

  return (
    <svg viewBox="0 0 480 335" className="w-full" role="img" aria-label="Frozen readout AUROC remains between 0.9823 and 0.9899 across SecAlign strengths, above the grouped-null 95th percentile of 0.5902.">
      <text x={x} y="17" fill={HEADING} fontSize="14" fontFamily="var(--font-mono), monospace">can the frozen direction still read the difference?</text>
      <rect x={x} y={sy(0.5902)} width={w} height={sy(0.5) - sy(0.5902)} fill="rgb(var(--muted-dark))" opacity="0.14" />
      {[0.5, 0.75, 1].map((tick) => <g key={tick}>
        <line x1={x} x2={x + w} y1={sy(tick)} y2={sy(tick)} stroke={GRID} />
        <text x={x - 10} y={sy(tick) + 4} textAnchor="end" fill={TEXT} fontSize="11">{tick.toFixed(2)}</text>
      </g>)}
      {scales.map((scale, index) => <g key={scale}>
        <line x1={sx(index)} x2={sx(index)} y1={y} y2={y + h} stroke={GRID} opacity="0.45" />
        <text x={sx(index)} y={y + h + 22} textAnchor="middle" fill={TEXT} fontSize="11">{scale === 0 ? 'base' : scale === 0.5 ? 'half' : 'full'}</text>
      </g>)}
      <line x1={x} x2={x + w} y1={sy(0.5902)} y2={sy(0.5902)} stroke="rgb(var(--muted))" strokeDasharray="4 4" />
      <text x={x + 6} y={sy(0.5902) - 8} fill={TEXT} fontSize="10">grouped-null 95th percentile: 0.590</text>
      <motion.path d={path(auc, sx, sy)} fill="none" stroke={BLUE} strokeWidth="3.5" strokeLinejoin="round" style={{ pathLength: progress }} />
      {auc.map((value, index) => <circle key={index} cx={sx(index)} cy={sy(value)} r="5.5" fill={BLUE} />)}
      <text x={sx(0) + 8} y={sy(auc[0]) + 19} fill={BLUE} fontSize="11">0.990</text>
      <text x={sx(2) - 8} y={sy(auc[2]) + 19} textAnchor="end" fill={BLUE} fontSize="11">0.982</text>
      <text x={x + w / 2} y="326" textAnchor="middle" fill={TEXT} fontSize="10">SecAlign adapter strength</text>
    </svg>
  )
}

export default function PromptDefenseReadoutFigure() {
  return (
    <div>
      <div className="hidden gap-8 sm:grid lg:grid-cols-2 lg:gap-5">
        <ShiftPanel />
        <ReadoutPanel />
      </div>

      <div className="space-y-7 sm:hidden">
        <div>
          <div className="font-mono text-sm text-heading">what the source does to the action margin</div>
          <div className="mt-4 grid grid-cols-3 gap-2">
            {scales.map((scale, index) => (
              <div key={scale} className="rounded-md border border-border bg-surface/25 p-3 text-center font-mono">
                <div className="text-tick uppercase tracking-[0.1em] text-muted">{scale === 0 ? 'base' : scale === 0.5 ? 'half' : 'full'}</div>
                <div className="mt-3 text-base text-sun">+{unauthorized[index].toFixed(3)}</div>
                <div className="mt-1 text-meta text-sky">+{authorized[index].toFixed(3)}</div>
              </div>
            ))}
          </div>
          <div className="mt-3 grid grid-cols-2 gap-3 font-mono text-tick text-muted">
            <span><span className="mr-1.5 inline-block h-2 w-2 rounded-full bg-sun" />unauthorized</span>
            <span><span className="mr-1.5 inline-block h-2 w-2 rounded-full bg-sky" />authorized</span>
          </div>
          <div className="mt-4 rounded-md bg-sun/5 px-4 py-3 font-mono text-meta leading-relaxed text-muted">
            unauthorized shift: <span className="text-sun">+2.733 → +1.475</span> at full defense
          </div>
        </div>

        <div className="border-t border-border pt-7">
          <div className="font-mono text-sm text-heading">can the frozen direction still read the difference?</div>
          <div className="mt-4 grid grid-cols-3 gap-2">
            {scales.map((scale, index) => (
              <div key={scale} className="rounded-md border border-sky/25 bg-sky/5 p-3 text-center font-mono">
                <div className="text-tick uppercase tracking-[0.1em] text-muted">{scale === 0 ? 'base' : scale === 0.5 ? 'half' : 'full'}</div>
                <div className="mt-3 text-base text-sky">{auc[index].toFixed(3)}</div>
              </div>
            ))}
          </div>
          <div className="mt-4 rounded-md border border-border px-4 py-3 font-mono text-meta leading-relaxed text-muted">
            grouped-null 95th percentile: <span className="text-heading">0.590</span>
          </div>
        </div>
      </div>

      <div className="mt-5 flex flex-wrap justify-center gap-x-6 gap-y-2 font-mono text-tick text-muted sm:mt-2">
        <span><span className="mr-1.5 inline-block h-0.5 w-6 align-middle" style={{ background: AMBER }} />unauthorized source shift</span>
        <span><span className="mr-1.5 inline-block h-0.5 w-6 align-middle" style={{ background: BLUE }} />authorized shift / frozen readout</span>
        <span className="text-heading">unauthorized shift falls 46%; readout remains</span>
      </div>
    </div>
  )
}
