'use client'

import { motion } from 'framer-motion'
import { useFigureProgress } from './ScrollFigure'

const BLUE = 'rgb(var(--sky))'
const RED = 'rgb(var(--sun))'
const GRID = 'rgb(var(--border))'
const TEXT = 'rgb(var(--muted))'
const HEADING = 'rgb(var(--heading))'

const alpha = [0, 0.5, 1, 2]
const effects = [0, -0.0187, -0.0465, -0.0915]

const copy = {
  en: {
    defense: 'model defense',
    sourceEffect: 'unauthorized source effect',
    smaller: '46% smaller',
    readout: 'frozen internal readout',
    baseToFull: 'base → full defense',
    null: 'grouped-null 95th percentile: 0.590',
    repeated: 'the relationship repeated',
    scoreToMargin: 'direction score → action margin',
    pilot: '8 pilot examples',
    unseen: '24 unseen examples',
    sameSlope: 'same sign, similar observational slope',
    prediction: 'registered prediction: adding the direction should move the margin',
    aboveZero: 'above zero',
    changed: 'what happened when I changed the state',
    positiveSide: 'registered positive side',
    strength: 'intervention strength α',
    marginChange: 'change in X − U margin',
    zeroBoundary: 'zero was the registered boundary',
    failed: 'the registered positive causal claim failed',
    random: 'random directions',
    randomResult: 'effect exceeded the 95th percentile',
    swap: 'label-swap directions',
    swapResult: 'effect did not exceed the 95th percentile',
    fullState: 'full-state control',
    fullStateResult: 'interval crossed zero',
    boundary: 'the data reject the predicted positive effect; the controls do not license a reverse-mechanism claim',
  },
  tr: {
    defense: 'model savunması',
    sourceEffect: 'yetkisiz source etkisi',
    smaller: '%46 daha küçük',
    readout: 'sabitlenen internal readout',
    baseToFull: 'base → tam savunma',
    null: 'grouped-null %95 sınırı: 0.590',
    repeated: 'ilişki tekrarlandı',
    scoreToMargin: 'direction score → action margin',
    pilot: '8 pilot örnek',
    unseen: '24 görülmemiş örnek',
    sameSlope: 'aynı işaret, benzer observational slope',
    prediction: 'kayıtlı tahmin: direction eklendiğinde margin',
    aboveZero: 'sıfırın üstüne çıkmalıydı',
    changed: "state'i değiştirdiğimde ne oldu?",
    positiveSide: 'kayıtlı pozitif taraf',
    strength: 'intervention gücü α',
    marginChange: 'X − U margin değişimi',
    zeroBoundary: 'kayıtlı sınır sıfırdı',
    failed: 'kayıtlı pozitif causal iddia başarısız oldu',
    random: 'random directionlar',
    randomResult: '%95 sınırını geçti',
    swap: 'label-swap directionlar',
    swapResult: '%95 sınırını geçmedi',
    fullState: 'full-state control',
    fullStateResult: 'interval sıfırı kesti',
    boundary: 'veri beklenen pozitif etkiyi reddediyor; kontroller ters bir mekanizma iddiasına da izin vermiyor',
  },
} as const

export default function PromptReadoutCausalityFigure({ lang = 'en' }: { lang?: 'en' | 'tr' }) {
  const text = copy[lang]
  const progress = useFigureProgress()
  const x = 62
  const y = 45
  const w = 405
  const h = 235
  const sx = (value: number) => x + value / 2 * w
  const sy = (value: number) => y + (0.02 - value) / 0.13 * h
  const line = effects.map((value, index) => `${index === 0 ? 'M' : 'L'}${sx(alpha[index])},${sy(value)}`).join(' ')

  return (
    <div>
      <div className="mb-8 grid gap-px overflow-hidden rounded-lg border border-border bg-border sm:grid-cols-2">
        <div className="bg-background p-5 font-mono">
          <div className="text-tick uppercase tracking-[0.13em] text-muted">{text.defense}</div>
          <div className="mt-3 flex items-baseline justify-between gap-4">
            <span className="text-meta text-muted">{text.sourceEffect}</span>
            <span className="text-base text-sun">2.733 → 1.475</span>
          </div>
          <div className="mt-2 text-right text-tick text-sun">{text.smaller}</div>
        </div>
        <div className="bg-background p-5 font-mono">
          <div className="text-tick uppercase tracking-[0.13em] text-muted">{text.readout}</div>
          <div className="mt-3 flex items-baseline justify-between gap-4">
            <span className="text-meta text-muted">{text.baseToFull}</span>
            <span className="text-base text-sky">0.990 → 0.982</span>
          </div>
          <div className="mt-2 text-right text-tick text-muted">{text.null}</div>
        </div>
      </div>

      <div className="grid gap-8 lg:grid-cols-[0.82fr_1.18fr] lg:gap-10">
        <div className="flex flex-col">
          <div className="font-mono text-sm text-heading">{text.repeated}</div>
          <div className="mt-2 font-mono text-tick uppercase tracking-[0.14em] text-muted">{text.scoreToMargin}</div>

          <div className="mt-7 rounded-lg border border-sky/25 bg-sky/5 p-5">
            <div className="grid grid-cols-2 gap-5 font-mono">
              <div>
                <div className="text-tick text-muted">{text.pilot}</div>
                <div className="mt-2 text-lead text-sky">+0.205</div>
              </div>
              <div className="border-l border-sky/20 pl-5">
                <div className="text-tick text-muted">{text.unseen}</div>
                <div className="mt-2 text-lead text-sky">+0.215</div>
              </div>
            </div>
            <div className="mt-4 h-px bg-gradient-to-r from-transparent via-sky to-sky" />
            <div className="mt-2 text-right font-mono text-tick text-muted">{text.sameSlope}</div>
          </div>

          <div className="mt-5 rounded-md border border-border px-4 py-3 font-mono text-meta leading-relaxed text-muted">
            {text.prediction} <span className="text-sky">{text.aboveZero}</span>
          </div>
        </div>

        <div>
          <svg viewBox="0 0 510 350" className="hidden w-full sm:block" role="img" aria-label="Intervening along the frozen direction produces effects of minus 0.0187, minus 0.0465, and minus 0.0915 as intervention strength increases.">
            <text x={x} y="18" fill={HEADING} fontSize="14" fontFamily="var(--font-mono), monospace">{text.changed}</text>
            <rect x={x} y={y} width={w} height={sy(0) - y} fill={BLUE} opacity="0.045" />
            <text x={x + w - 5} y={sy(0) - 9} textAnchor="end" fill={BLUE} fontSize="10">{text.positiveSide}</text>
            {[0, -0.05, -0.1].map((tick) => <g key={tick}>
              <line x1={x} x2={x + w} y1={sy(tick)} y2={sy(tick)} stroke={tick === 0 ? 'rgb(var(--foreground))' : GRID} strokeWidth={tick === 0 ? 1.5 : 1} />
              <text x={x - 10} y={sy(tick) + 4} textAnchor="end" fill={TEXT} fontSize="11">{tick.toFixed(2)}</text>
            </g>)}
            {alpha.map((value) => <g key={value}>
              <line x1={sx(value)} x2={sx(value)} y1={y} y2={y + h} stroke={GRID} opacity="0.45" />
              <text x={sx(value)} y={y + h + 22} textAnchor="middle" fill={TEXT} fontSize="11">{value}</text>
            </g>)}
            <motion.path d={line} fill="none" stroke={RED} strokeWidth="3.5" strokeLinejoin="round" style={{ pathLength: progress }} />
            {effects.map((value, index) => <circle key={index} cx={sx(alpha[index])} cy={sy(value)} r="5.5" fill={RED} />)}
            <line x1={sx(1)} x2={sx(1)} y1={sy(-0.0203)} y2={sy(-0.0749)} stroke={RED} strokeWidth="2" />
            <line x1={sx(1) - 7} x2={sx(1) + 7} y1={sy(-0.0203)} y2={sy(-0.0203)} stroke={RED} strokeWidth="2" />
            <line x1={sx(1) - 7} x2={sx(1) + 7} y1={sy(-0.0749)} y2={sy(-0.0749)} stroke={RED} strokeWidth="2" />
            <text x={sx(0.5) + 8} y={sy(effects[1]) - 10} fill={RED} fontSize="10">−0.019</text>
            <text x={sx(1) + 10} y={sy(effects[2]) + 5} fill={RED} fontSize="10">−0.047</text>
            <text x={sx(2) - 7} y={sy(effects[3]) - 10} textAnchor="end" fill={RED} fontSize="10">−0.092</text>
            <text x={x + w / 2} y="335" textAnchor="middle" fill={TEXT} fontSize="10">{text.strength}</text>
            <text x="14" y={y + h / 2} transform={`rotate(-90 14 ${y + h / 2})`} textAnchor="middle" fill={TEXT} fontSize="10">{text.marginChange}</text>
          </svg>

          <div className="sm:hidden">
            <div className="font-mono text-sm text-heading">{text.changed}</div>
            <div className="mt-2 font-mono text-tick uppercase tracking-[0.13em] text-muted">{text.zeroBoundary}</div>
            <div className="mt-6 space-y-5">
              {alpha.slice(1).map((value, index) => {
                const effect = effects[index + 1]
                return (
                  <div key={value}>
                    <div className="flex items-baseline justify-between gap-4 font-mono">
                      <span className="text-meta text-muted">α {value}</span>
                      <span className="text-base text-sun">{effect.toFixed(4)}</span>
                    </div>
                    <div className="mt-2 h-2 overflow-hidden rounded-full bg-border/60">
                      <div className="h-full rounded-full bg-sun" style={{ width: `${Math.abs(effect) / 0.1 * 100}%` }} />
                    </div>
                    {value === 1 && <div className="mt-2 font-mono text-tick text-muted">95% interval [−0.0749, −0.0203]</div>}
                  </div>
                )
              })}
            </div>
          </div>

          <div className="rounded-md border border-sun/30 bg-sun/5 px-4 py-3 font-mono text-meta text-sun">
            {text.failed}
          </div>
        </div>
      </div>

      <div className="mt-8 grid gap-px overflow-hidden rounded-lg border border-border bg-border sm:grid-cols-3">
        <div className="bg-background p-4">
          <div className="font-mono text-tick uppercase tracking-[0.13em] text-muted">{text.random}</div>
          <div className="mt-2 font-mono text-meta leading-relaxed text-heading">{text.randomResult}</div>
        </div>
        <div className="bg-background p-4">
          <div className="font-mono text-tick uppercase tracking-[0.13em] text-muted">{text.swap}</div>
          <div className="mt-2 font-mono text-meta leading-relaxed text-sun">{text.swapResult}</div>
        </div>
        <div className="bg-background p-4">
          <div className="font-mono text-tick uppercase tracking-[0.13em] text-muted">{text.fullState}</div>
          <div className="mt-2 font-mono text-meta leading-relaxed text-sun">{text.fullStateResult}</div>
        </div>
      </div>

      <div className="mt-4 text-center font-mono text-tick leading-relaxed text-muted">
        {text.boundary}
      </div>
    </div>
  )
}
