'use client'

import { motion } from 'framer-motion'
import { useFigureProgress } from './ScrollFigure'
import { defenseTransfer } from './prompt-injection-defense-data'

const TASK = '#d98e48'
const WRAPPER = '#5ec4ff'
const GRID = '#2f3b47'
const TEXT = '#8aa0b1'
const HEADING = '#e8eef4'

interface Arm {
  label: string
  task: readonly number[]
  taskNull: readonly number[]
  wrapper: readonly number[]
  wrapperNull: readonly number[]
  taskCrossover: number
  wrapperCrossover: number
}

function path(values: readonly number[], sx: (layer: number) => number, sy: (value: number) => number) {
  return values.map((value, layer) => `${layer === 0 ? 'M' : 'L'}${sx(layer).toFixed(1)},${sy(value).toFixed(1)}`).join(' ')
}

function Panel({ data }: { data: Arm }) {
  const progress = useFigureProgress()
  const x = 48
  const y = 38
  const w = 438
  const h = 225
  const sx = (layer: number) => x + layer / 28 * w
  const sy = (value: number) => y + (0.45 - value) / 1.1 * h
  const taskMargin = data.task.map((value, layer) => value - data.taskNull[layer])
  const wrapperMargin = data.wrapper.map((value, layer) => value - data.wrapperNull[layer])
  return <svg viewBox="0 0 520 335" className="w-full" role="img" aria-label={`${data.label}: margin over the grouped null. Wrapper-held-out transfer crosses at layer ${data.wrapperCrossover}; task-held-out transfer crosses at layer ${data.taskCrossover}.`}>
    <text x={x} y="20" fill={HEADING} fontSize="14" fontFamily="var(--font-mono), monospace">{data.label}</text>
    <rect x={x} y={y} width={w} height={sy(0) - y} fill={WRAPPER} opacity="0.035" />
    {[-0.6, 0, 0.4].map((tick) => <g key={tick}>
      <line x1={x} x2={x + w} y1={sy(tick)} y2={sy(tick)} stroke={GRID} />
      <text x={x - 8} y={sy(tick) + 3} textAnchor="end" fill={TEXT} fontSize="11">{tick > 0 ? '+' : ''}{tick.toFixed(1)}</text>
    </g>)}
    {[0, 7, 14, 21, 28].map((tick) => <g key={tick}>
      <line x1={sx(tick)} x2={sx(tick)} y1={y} y2={y + h} stroke={GRID} opacity="0.45" />
      <text x={sx(tick)} y={y + h + 18} textAnchor="middle" fill={TEXT} fontSize="11">{tick}</text>
    </g>)}
    <line x1={x} x2={x + w} y1={sy(0)} y2={sy(0)} stroke="#aeb8c1" strokeWidth="1.5" />
    <text x={x + w - 4} y={sy(0) - 7} textAnchor="end" fill="#aeb8c1" fontSize="10">zero = grouped-null boundary</text>
    <motion.path d={path(taskMargin, sx, sy)} fill="none" stroke={TASK} strokeWidth="2.8" strokeLinejoin="round" style={{ pathLength: progress }} />
    <motion.path d={path(wrapperMargin, sx, sy)} fill="none" stroke={WRAPPER} strokeWidth="2.8" strokeLinejoin="round" style={{ pathLength: progress }} />
    <line x1={sx(data.taskCrossover)} x2={sx(data.taskCrossover)} y1={y} y2={y + h} stroke={TASK} strokeDasharray="2 4" opacity="0.7" />
    <line x1={sx(data.wrapperCrossover)} x2={sx(data.wrapperCrossover)} y1={y} y2={y + h} stroke={WRAPPER} strokeDasharray="2 4" opacity="0.7" />
    <text x={sx(data.taskCrossover) + 5} y={y + h - 8} fill={TASK} fontSize="10">task L{data.taskCrossover}</text>
    <text x={sx(data.wrapperCrossover) + 5} y={y + h - 24} fill={WRAPPER} fontSize="10">wording L{data.wrapperCrossover}</text>
    <text x={x + w / 2} y="304" textAnchor="middle" fill={TEXT} fontSize="11">residual-stream layer</text>
    <text x="12" y={y + h / 2} transform={`rotate(-90 12 ${y + h / 2})`} textAnchor="middle" fill={TEXT} fontSize="11">auroc margin over null</text>
  </svg>
}

export default function PromptDefenseTransferFigure() {
  return <div>
    <div className="grid gap-6 md:grid-cols-2">
      <Panel data={defenseTransfer.baseline} />
      <Panel data={defenseTransfer.primary} />
    </div>
    <div className="flex flex-wrap justify-center gap-x-6 gap-y-1 font-mono text-[10px] text-muted">
      <span><span className="mr-1.5 inline-block h-0.5 w-6 align-middle" style={{ background: WRAPPER }} />new attack wording</span>
      <span><span className="mr-1.5 inline-block h-0.5 w-6 align-middle" style={{ background: TASK }} />new task direction</span>
      <span><span className="mr-1.5 inline-block w-6 border-t border-muted-dark align-middle" />above zero beats grouped-null 95th percentile</span>
    </div>
  </div>
}
