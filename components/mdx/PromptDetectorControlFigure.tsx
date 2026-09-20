'use client'

import { motion, useTransform } from 'framer-motion'
import { useFigureProgress } from './ScrollFigure'

const FLAGGED = 'rgb(var(--amber))'
const ALLOWED = 'rgb(var(--muted-dark))'

const copy = {
  en: {
    title: 'can Prompt Guard tell the attack from a harmless instruction?',
    subtitle: 'same detector, same frozen threshold',
    flagged: 'flagged by detector',
    conclusionStart: 'The harmless lookalike was flagged',
    conclusionStrong: '1.1 percentage points more often',
    conclusionEnd: 'than the real attack.',
    rows: [
      { label: 'actual attack', explanation: 'redirects the model to another task', total: 192, flagged: 88, flaggedLabel: 'caught', allowedLabel: 'missed' },
      { label: 'harmless lookalike', explanation: "written like the attack, but supports the user's task", total: 192, flagged: 90, flaggedLabel: 'false alarms', allowedLabel: 'allowed' },
      { label: 'ordinary clean prose', explanation: 'contains no instruction-like text', total: 64, flagged: 0, flaggedLabel: 'false alarms', allowedLabel: 'allowed' },
    ],
  },
  tr: {
    title: 'Prompt Guard saldırıyla zararsız bir talimatı ayırabiliyor mu?',
    subtitle: 'aynı detector, aynı sabit threshold',
    flagged: 'detector tarafından işaretlendi',
    conclusionStart: 'Zararsız benzer, gerçek saldırıdan',
    conclusionStrong: '1.1 yüzde puan daha sık',
    conclusionEnd: 'işaretlendi.',
    rows: [
      { label: 'gerçek saldırı', explanation: 'modeli başka bir göreve yönlendiriyor', total: 192, flagged: 88, flaggedLabel: 'yakalandı', allowedLabel: 'kaçırıldı' },
      { label: 'zararsız benzer', explanation: 'saldırı gibi yazılmış ama kullanıcının görevini destekliyor', total: 192, flagged: 90, flaggedLabel: 'yanlış alarm', allowedLabel: 'geçirildi' },
      { label: 'sıradan temiz metin', explanation: 'talimat benzeri bir ifade içermiyor', total: 64, flagged: 0, flaggedLabel: 'yanlış alarm', allowedLabel: 'geçirildi' },
    ],
  },
} as const

function OutcomeBar({ flagged, total, delay }: { flagged: number; total: number; delay: number }) {
  const progress = useFigureProgress()
  const reveal = useTransform(progress, [delay, Math.min(delay + 0.45, 1)], [0.12, 1])
  const flaggedPercent = flagged / total * 100

  return (
    <motion.div style={{ opacity: reveal }} className="flex h-2.5 overflow-hidden rounded-full bg-border/60">
      {flagged > 0 && <div style={{ width: `${flaggedPercent}%`, backgroundColor: FLAGGED }} />}
      <div style={{ width: `${100 - flaggedPercent}%`, backgroundColor: ALLOWED }} />
    </motion.div>
  )
}

export default function PromptDetectorControlFigure({ lang = 'en' }: { lang?: 'en' | 'tr' }) {
  const text = copy[lang]
  return (
    <div>
      <div className="border-b border-border pb-4 font-mono">
        <div className="text-sm text-heading">{text.title}</div>
        <div className="mt-1 text-tick text-muted">{text.subtitle}</div>
      </div>

      <div className="divide-y divide-border">
        {text.rows.map((row, index) => {
          const allowed = row.total - row.flagged
          const rate = row.flagged / row.total * 100
          return (
            <div key={row.label} className="py-6 first:pt-6">
              <div className="mb-4 flex flex-wrap items-start justify-between gap-x-5 gap-y-2">
                <div>
                  <div className="font-mono text-sm text-heading">{row.label}</div>
                  <div className="mt-1 font-mono text-tick text-muted">{row.explanation}</div>
                </div>
                <div className="font-mono text-right">
                  <div className="text-base text-heading">{rate.toFixed(rate === 0 ? 0 : 1)}%</div>
                  <div className="text-tick text-muted">{text.flagged}</div>
                </div>
              </div>

              <OutcomeBar flagged={row.flagged} total={row.total} delay={0.05 + index * 0.1} />

              <div className="mt-3 flex flex-wrap justify-between gap-x-5 gap-y-1 font-mono text-tick">
                <span style={{ color: FLAGGED }}>{row.flagged} {row.flaggedLabel}</span>
                <span className="text-muted">{allowed} {row.allowedLabel}</span>
              </div>
            </div>
          )
        })}
      </div>

      <div className="border-t border-border pt-5">
        <div className="rounded-md bg-amber/5 px-4 py-4 font-mono text-meta leading-relaxed text-muted sm:text-sm">
          {text.conclusionStart} <span className="text-amber">{text.conclusionStrong}</span> {text.conclusionEnd}
        </div>
      </div>
    </div>
  )
}
