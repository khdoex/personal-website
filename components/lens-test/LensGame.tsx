'use client'

import { useMemo, useState } from 'react'
import {
  GameImage,
  IMAGES,
  IMAGES_PER_LENS,
  LensKey,
  QUESTIONS,
  Rating,
} from '@/lib/lens-test/game'

type Phase = 'intro' | 'images' | 'questions' | 'loading' | 'result'

type ReportResponse = {
  report: string
  verdict: LensKey
  scores: {
    sigma: number
    fuji: number
    imageAvg: { sigma: number; fuji: number }
  }
}

const RATING_LABELS = ['Bana göre değil', 'Fena değil', 'Bayıldım'] as const

const LENS_LABELS: Record<LensKey, string> = {
  sigma: 'Sigma 18-50mm f/2.8',
  fuji: 'Fujifilm XF 18-55mm',
}

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

function sampleImages(): GameImage[] {
  const byLens = (lens: LensKey) =>
    shuffle(IMAGES.filter((i) => i.lens === lens)).slice(0, IMAGES_PER_LENS)
  return shuffle([...byLens('sigma'), ...byLens('fuji')])
}

export default function LensGame() {
  const [phase, setPhase] = useState<Phase>('intro')
  const [name, setName] = useState('')
  const [deck, setDeck] = useState<GameImage[]>([])
  const [imgIndex, setImgIndex] = useState(0)
  const [ratings, setRatings] = useState<Rating[]>([])
  const [qIndex, setQIndex] = useState(0)
  const [answers, setAnswers] = useState<number[]>([])
  const [result, setResult] = useState<ReportResponse | null>(null)
  const [error, setError] = useState(false)
  const [copied, setCopied] = useState(false)

  const toTop = () => window.scrollTo({ top: 0 })

  const start = () => {
    toTop()
    setDeck(sampleImages())
    setImgIndex(0)
    setRatings([])
    setQIndex(0)
    setAnswers([])
    setResult(null)
    setError(false)
    setPhase('images')
  }

  const rate = (rating: 0 | 1 | 2) => {
    const next = [...ratings, { id: deck[imgIndex].id, rating }]
    setRatings(next)
    if (imgIndex + 1 < deck.length) {
      setImgIndex(imgIndex + 1)
    } else {
      toTop()
      setPhase('questions')
    }
  }

  const answer = (optIndex: number) => {
    const next = [...answers, optIndex]
    setAnswers(next)
    if (qIndex + 1 < QUESTIONS.length) {
      setQIndex(qIndex + 1)
    } else {
      submit(next)
    }
  }

  const submit = async (finalAnswers: number[]) => {
    toTop()
    setPhase('loading')
    try {
      const res = await fetch('/api/lens-report', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, ratings, answers: finalAnswers }),
      })
      if (!res.ok) throw new Error()
      setResult(await res.json())
      setPhase('result')
    } catch {
      setError(true)
      setPhase('result')
    }
  }

  const copyResults = async () => {
    if (!result) return
    const lines = [
      `Mercek Testi — ${name || 'isimsiz'}`,
      `Sonuç: ${result.verdict === 'sigma' ? 'Sigma 18-50mm f/2.8' : 'Fuji yolu (XC kit → ikinci el XF 18-55)'}`,
      `Skor: sigma ${result.scores.sigma} / fuji ${result.scores.fuji}`,
      `Kör test ortalamaları: sigma ${result.scores.imageAvg.sigma} / fuji ${result.scores.imageAvg.fuji}`,
      '',
      ...ratings.map((r) => {
        const img = IMAGES.find((i) => i.id === r.id)
        return `${r.id} (${img ? LENS_LABELS[img.lens] : '?'}): ${RATING_LABELS[r.rating]}`
      }),
      '',
      ...QUESTIONS.map((q, i) => `${q.text} -> ${q.options[answers[i]]?.label ?? '-'}`),
    ]
    await navigator.clipboard.writeText(lines.join('\n'))
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const credits = useMemo(() => {
    const shown = new Set(ratings.map((r) => r.id))
    return IMAGES.filter((i) => shown.has(i.id))
  }, [ratings])

  // ── Intro ──────────────────────────────────────────────────
  if (phase === 'intro') {
    return (
      <div className="reveal max-w-xl">
        <header className="mb-12">
          <h1 className="font-mono text-2xl md:text-3xl font-semibold text-heading">
            mercek testi
          </h1>
          <p className="text-muted mt-3 max-w-xl leading-relaxed">
            bir kör tat testi, ama fotoğraf için. gözün hangi lensi seçiyor?
          </p>
        </header>
        <p className="text-foreground leading-relaxed">
          Yeni kameran için iki lens yolu var — ama hangisi{' '}
          <span className="text-heading font-medium">senin</span> yolun?
        </p>
        <ul className="mt-6 space-y-3 text-sm text-muted leading-relaxed">
          <li className="flex gap-3">
            <span className="font-mono text-accent shrink-0">01</span>
            Sana bir dizi fotoğraf göstereceğim. Hangi lensle çekildiklerini
            bilmeyeceksin — sadece içinden geldiği gibi puanla.
          </li>
          <li className="flex gap-3">
            <span className="font-mono text-accent shrink-0">02</span>
            Sonra alışkanlıkların hakkında birkaç kısa soru.
          </li>
          <li className="flex gap-3">
            <span className="font-mono text-accent shrink-0">03</span>
            En sonda sana özel bir rapor: hangi yol, neden.
          </li>
        </ul>
        <div className="mt-10">
          <label className="block font-mono text-xs text-muted mb-2" htmlFor="player-name">
            adın ne?
          </label>
          <input
            id="player-name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            maxLength={40}
            placeholder="…"
            className="w-full max-w-xs bg-surface border border-border rounded px-3 py-2 text-base text-heading placeholder:text-muted-dark focus:border-accent focus:outline-none"
          />
        </div>
        <button
          onClick={start}
          className="mt-8 font-mono text-sm px-6 py-3 rounded border border-accent text-accent hover:bg-accent hover:text-background transition-colors"
        >
          başla →
        </button>
      </div>
    )
  }

  // ── Blind image round ──────────────────────────────────────
  if (phase === 'images') {
    const img = deck[imgIndex]
    const next = deck[imgIndex + 1]
    return (
      <div>
        <div className="flex items-center justify-between font-mono text-xs text-muted mb-4">
          <span>
            fotoğraf {imgIndex + 1} / {deck.length}
          </span>
          <span className="text-muted-dark">hangi lens? bilmiyorsun 😌</span>
        </div>
        <div className="w-full h-1 bg-surface rounded mb-6 overflow-hidden">
          <div
            className="h-full bg-accent transition-all duration-300"
            style={{ width: `${(imgIndex / deck.length) * 100}%` }}
          />
        </div>
        {/* fixed height: rating buttons stay put across portrait/landscape photos */}
        <div className="bg-surface border border-border rounded-lg p-2 h-[46vh] sm:h-[56vh]">
          {/* key forces a fresh fade-in per photo */}
          <img
            key={img.id}
            src={img.src}
            alt="Puanlanacak fotoğraf"
            className="reveal w-full h-full object-contain rounded"
          />
        </div>
        {next && <link rel="preload" as="image" href={next.src} />}
        <div className="grid grid-cols-3 gap-3 mt-6">
          {RATING_LABELS.map((label, i) => (
            <button
              key={label}
              onClick={() => rate(i as 0 | 1 | 2)}
              className="font-mono text-xs sm:text-sm px-2 py-3 rounded border border-border text-foreground hover:border-accent hover:text-accent transition-colors touch-manipulation select-none"
            >
              {label}
            </button>
          ))}
        </div>
      </div>
    )
  }

  // ── Verbal round ───────────────────────────────────────────
  if (phase === 'questions') {
    const q = QUESTIONS[qIndex]
    return (
      <div key={q.id} className="reveal max-w-xl">
        <div className="font-mono text-xs text-muted mb-6">
          soru {qIndex + 1} / {QUESTIONS.length}
        </div>
        <h2 className="text-lg text-heading font-medium leading-snug">{q.text}</h2>
        <div className="flex flex-col gap-3 mt-8">
          {q.options.map((opt, i) => (
            <button
              key={opt.label}
              onClick={() => answer(i)}
              className="text-left px-4 py-3 rounded border border-border text-foreground text-sm hover:border-accent hover:text-heading transition-colors touch-manipulation"
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>
    )
  }

  // ── Loading ────────────────────────────────────────────────
  if (phase === 'loading') {
    return (
      <div className="reveal font-mono text-sm text-muted py-20 text-center">
        raporun yazılıyor<span className="cursor-blink text-accent">▊</span>
      </div>
    )
  }

  // ── Result ─────────────────────────────────────────────────
  if (error || !result) {
    return (
      <div className="reveal max-w-xl">
        <p className="text-foreground">
          Rapor oluşturulurken bir şeyler ters gitti. İnternetini kontrol edip
          tekrar dener misin?
        </p>
        <button
          onClick={() => submit(answers)}
          className="mt-6 font-mono text-sm px-5 py-2.5 rounded border border-accent text-accent hover:bg-accent hover:text-background transition-colors"
        >
          tekrar dene
        </button>
      </div>
    )
  }

  const total = result.scores.sigma + result.scores.fuji
  const sigmaPct = total > 0 ? Math.round((result.scores.sigma / total) * 100) : 50

  return (
    <div className="reveal">
      <div className="font-mono text-xs text-accent mb-3">sonuç</div>
      <h2 className="text-xl md:text-2xl text-heading font-medium leading-snug max-w-xl">
        {result.verdict === 'sigma'
          ? 'Senin yolun: Sigma 18-50mm f/2.8 — tek seferde, doğrudan.'
          : 'Senin yolun: önce XC 15-45 kit, sonra ikinci el XF 18-55.'}
      </h2>

      <div className="mt-8 max-w-xl">
        <div className="flex justify-between font-mono text-[11px] text-muted mb-2">
          <span>sigma {result.scores.sigma}</span>
          <span>fuji {result.scores.fuji}</span>
        </div>
        <div className="w-full h-2 bg-surface rounded overflow-hidden flex">
          <div className="h-full bg-accent" style={{ width: `${sigmaPct}%` }} />
          <div className="h-full bg-amber" style={{ width: `${100 - sigmaPct}%` }} />
        </div>
      </div>

      <div className="prose mt-10 whitespace-pre-line">{result.report}</div>

      <div className="mt-6 flex gap-4">
        <button
          onClick={copyResults}
          className="font-mono text-xs px-4 py-2 rounded border border-border text-muted hover:border-accent hover:text-accent transition-colors"
        >
          {copied ? 'kopyalandı ✓' : 'sonuçları kopyala'}
        </button>
        <button
          onClick={start}
          className="font-mono text-xs px-4 py-2 rounded border border-border text-muted hover:border-accent hover:text-accent transition-colors"
        >
          tekrar oyna
        </button>
      </div>

      <div className="mt-16">
        <h3 className="font-mono text-sm text-heading mb-1">büyük ifşa</h3>
        <p className="text-sm text-muted mb-6">
          Puanladığın fotoğraflar aslında hangi lenslerdendi?
        </p>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {ratings.map((r) => {
            const img = IMAGES.find((i) => i.id === r.id)
            if (!img) return null
            return (
              <figure key={r.id} className="bg-surface border border-border rounded overflow-hidden">
                <img src={img.src} alt="" className="w-full h-24 object-cover" />
                <figcaption className="p-2 font-mono text-[10px] leading-relaxed">
                  <span className={img.lens === 'sigma' ? 'text-accent' : 'text-amber'}>
                    {LENS_LABELS[img.lens]}
                  </span>
                  <br />
                  <span className="text-muted">{RATING_LABELS[r.rating]}</span>
                </figcaption>
              </figure>
            )
          })}
        </div>
        <details className="mt-8">
          <summary className="font-mono text-xs text-muted-dark hover:text-muted">
            fotoğraf kaynakları (Wikimedia Commons) <span className="if-closed">+</span>
            <span className="if-open">−</span>
          </summary>
          <ul className="mt-3 space-y-1 font-mono text-[11px] text-muted-dark">
            {credits.map((c) => (
              <li key={c.id}>
                <a href={c.page} target="_blank" rel="noopener noreferrer" className="hover:text-accent">
                  {c.id}
                </a>{' '}
                — {c.author || 'anonim'} · {c.license}
              </li>
            ))}
          </ul>
        </details>
      </div>
    </div>
  )
}
