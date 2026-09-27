'use client'

import { motion, useTransform } from 'framer-motion'
import { useFigureProgress } from './ScrollFigure'

const copy = {
  en: {
    title: "what appeared in the model's answer?",
    subtitle: 'the same 96 attacks, before and after adding the system-prompt defense',
    before: 'before defense',
    beforeNote: 'no system prompt',
    after: 'after defense',
    afterNote: 'xml boundary + reminder',
    summaryAttack: "attacker's task",
    summaryUser: "user's task",
    rows: [
      { label: "attacker's task appeared", baseline: 94, defense: 12, change: '82 fewer answers', color: 'rgb(var(--amber))' },
      { label: "user's task appeared", baseline: 42, defense: 84, change: '42 more answers', color: 'rgb(var(--accent))' },
    ],
  },
  tr: {
    title: 'modelin cevabında ne göründü?',
    subtitle: 'aynı 96 saldırı, system-prompt savunmasından önce ve sonra',
    before: 'savunmadan önce',
    beforeNote: 'system prompt yok',
    after: 'savunmadan sonra',
    afterNote: 'xml sınırı + görev hatırlatması',
    summaryAttack: 'saldırganın görevi',
    summaryUser: 'kullanıcının görevi',
    rows: [
      { label: 'saldırganın görevi cevapta göründü', baseline: 94, defense: 12, change: '82 cevap daha az', color: 'rgb(var(--amber))' },
      { label: 'kullanıcının görevi cevapta göründü', baseline: 42, defense: 84, change: '42 cevap daha fazla', color: 'rgb(var(--accent))' },
    ],
  },
} as const

function ResultBar({
  value,
  color,
  delay,
}: {
  value: number
  color: string
  delay: number
}) {
  const progress = useFigureProgress()
  const width = useTransform(progress, [delay, Math.min(delay + 0.48, 1)], ['0%', `${value / 96 * 100}%`])

  return (
    <div className="relative h-2 overflow-hidden rounded-full bg-border/60">
      <motion.div className="absolute inset-y-0 left-0 rounded-full" style={{ width, backgroundColor: color }} />
    </div>
  )
}

export default function PromptDefenseOutcomeFigure({ lang = 'en' }: { lang?: 'en' | 'tr' }) {
  const text = copy[lang]
  return (
    <div>
      <div className="border-b border-border pb-4 font-mono">
        <div className="text-sm text-heading">{text.title}</div>
        <div className="mt-1 text-tick text-muted">{text.subtitle}</div>
      </div>

      <div className="divide-y divide-border">
        {text.rows.map((row, rowIndex) => (
          <div key={row.label} className="py-7 first:pt-6 last:pb-6">
            <div className="mb-5 flex flex-wrap items-baseline justify-between gap-x-6 gap-y-1 font-mono">
              <div className="text-sm text-heading">{row.label}</div>
              <div className="text-meta" style={{ color: row.color }}>{row.change}</div>
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-[6.5rem_minmax(0,1fr)_3.75rem] items-center gap-3 sm:grid-cols-[9rem_minmax(0,1fr)_4.5rem] sm:gap-4">
                <div className="font-mono">
                  <div className="text-meta text-muted">{text.before}</div>
                  <div className="mt-1 text-tick text-muted">{text.beforeNote}</div>
                </div>
                <ResultBar value={row.baseline} color={row.color} delay={0.05 + rowIndex * 0.08} />
                <span className="text-right font-mono text-sm text-muted">{row.baseline}<span className="text-tick text-muted"> / 96</span></span>
              </div>

              <div className="grid grid-cols-[6.5rem_minmax(0,1fr)_3.75rem] items-center gap-3 sm:grid-cols-[9rem_minmax(0,1fr)_4.5rem] sm:gap-4">
                <div className="font-mono">
                  <div className="text-meta text-heading">{text.after}</div>
                  <div className="mt-1 text-tick text-muted">{text.afterNote}</div>
                </div>
                <ResultBar value={row.defense} color={row.color} delay={0.2 + rowIndex * 0.08} />
                <span className="text-right font-mono text-base text-heading">{row.defense}<span className="text-tick text-muted"> / 96</span></span>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="grid gap-3 border-t border-border pt-5 font-mono text-meta sm:grid-cols-2">
        <div className="rounded-md bg-amber/5 px-4 py-3 text-muted">
          {text.summaryAttack}: <span className="text-amber">94 → 12</span>
        </div>
        <div className="rounded-md bg-accent/5 px-4 py-3 text-muted">
          {text.summaryUser}: <span className="text-accent">42 → 84</span>
        </div>
      </div>
    </div>
  )
}
