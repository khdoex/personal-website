'use client'

import { useMemo, useState } from 'react'
import {
  Duel,
  DuelPick,
  DUELS,
  DUELS_PER_GAME,
  GameImage,
  IMAGES,
  IMAGES_PER_LENS,
  LensKey,
  MAX_PER_AUTHOR,
  QUESTIONS,
  Rating,
} from '@/lib/lens-test/game'

type Phase = 'intro' | 'duels' | 'images' | 'questions' | 'loading' | 'result'

type ReportResponse = {
  report: string
  verdict: LensKey
  scores: {
    sigma: number
    fuji: number
    imageAvg: { sigma: number; fuji: number }
    duelWins: { sigma: number; fuji: number; skipped: number }
  }
}

const RATING_LABELS = ['Bana göre değil', 'Fena değil', 'Bayıldım'] as const

const LENS_LABELS: Record<LensKey, string> = {
  sigma: 'Sigma 18-50mm f/2.8',
  fuji: 'Fujifilm XF 18-55mm',
}

const imageById = new Map(IMAGES.map((i) => [i.id, i]))

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

// "Trougnouf (Benoit Brummer)" and "trougnouf" are the same person
const normAuthor = (a: string) => a.toLowerCase().replace(/[^a-z]/g, '').slice(0, 9)

function sampleLens(lens: LensKey, exclude: Set<string>): GameImage[] {
  const pool = shuffle(IMAGES.filter((i) => i.lens === lens && !exclude.has(i.id)))
  const byAuthor: Record<string, number> = {}
  const picked: GameImage[] = []
  for (const img of pool) {
    const a = normAuthor(img.author || '?')
    if ((byAuthor[a] ?? 0) >= MAX_PER_AUTHOR) continue
    byAuthor[a] = (byAuthor[a] ?? 0) + 1
    picked.push(img)
    if (picked.length === IMAGES_PER_LENS) return picked
  }
  // author cap starved the sample (few-shooter pool): top up randomly
  for (const img of pool) {
    if (picked.length === IMAGES_PER_LENS) break
    if (!picked.includes(img)) picked.push(img)
  }
  return picked
}

// One duel per theme first, so a single playthrough feels varied
function sampleDuels(): Duel[] {
  const byTheme: Record<string, Duel[]> = {}
  for (const d of shuffle(DUELS)) (byTheme[d.theme] ??= []).push(d)
  const firsts = shuffle(Object.values(byTheme).map((g) => g[0]))
  const rest = shuffle(Object.values(byTheme).flatMap((g) => g.slice(1)))
  return [...firsts, ...rest].slice(0, DUELS_PER_GAME)
}

export default function LensGame() {
  const [phase, setPhase] = useState<Phase>('intro')
  const [duelDeck, setDuelDeck] = useState<Duel[]>([])
  const [duelIndex, setDuelIndex] = useState(0)
  const [duelPicks, setDuelPicks] = useState<DuelPick[]>([])
  const [duelFlip, setDuelFlip] = useState<boolean[]>([])
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
    const duels = sampleDuels()
    const used = new Set(duels.flatMap((d) => [d.sigma, d.fuji]))
    setDuelDeck(duels)
    setDuelFlip(duels.map(() => Math.random() < 0.5)) // random sigma/fuji position
    setDeck(shuffle([...sampleLens('sigma', used), ...sampleLens('fuji', used)]))
    setDuelIndex(0)
    setDuelPicks([])
    setImgIndex(0)
    setRatings([])
    setQIndex(0)
    setAnswers([])
    setResult(null)
    setError(false)
    setPhase('duels')
  }

  const pickDuel = (chosen: LensKey | 'skip') => {
    const d = duelDeck[duelIndex]
    const next = [...duelPicks, { sigma: d.sigma, fuji: d.fuji, chosen }]
    setDuelPicks(next)
    if (duelIndex + 1 < duelDeck.length) {
      setDuelIndex(duelIndex + 1)
    } else {
      toTop()
      setPhase('images')
    }
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
        body: JSON.stringify({ ratings, duels: duelPicks, answers: finalAnswers }),
      })
      if (!res.ok) throw new Error()
      setResult(await res.json())
      setError(false)
      setPhase('result')
    } catch {
      setError(true)
      setPhase('result')
    }
  }

  const copyResults = async () => {
    if (!result) return
    const lines = [
      'Mercek Testi — sonuçlar',
      `Sonuç: ${result.verdict === 'sigma' ? 'Sigma 18-50mm f/2.8' : 'Fuji yolu (XC kit → ikinci el XF 18-55)'}`,
      `Skor: sigma ${result.scores.sigma} / fuji ${result.scores.fuji}`,
      `Düellolar: sigma ${result.scores.duelWins.sigma} / fuji ${result.scores.duelWins.fuji} / kararsız ${result.scores.duelWins.skipped}`,
      `Tekli puan ortalamaları: sigma ${result.scores.imageAvg.sigma} / fuji ${result.scores.imageAvg.fuji}`,
      '',
      ...duelPicks.map((d, i) => `düello ${i + 1} (${duelDeck[i]?.theme}): ${d.chosen === 'skip' ? 'kararsız' : LENS_LABELS[d.chosen as LensKey]}`),
      '',
      ...ratings.map((r) => {
        const img = imageById.get(r.id)
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
    const shown = new Set([
      ...ratings.map((r) => r.id),
      ...duelPicks.flatMap((d) => [d.sigma, d.fuji]),
    ])
    return IMAGES.filter((i) => shown.has(i.id))
  }, [ratings, duelPicks])

  // ── Intro ──────────────────────────────────────────────────
  if (phase === 'intro') {
    return (
      <div className="reveal max-w-xl">
        <header className="mb-10">
          <h1 className="font-mono text-2xl md:text-3xl font-semibold text-heading">
            mercek testi
          </h1>
          <p className="text-accent mt-4 text-lg leading-relaxed">
            Hoş geldin canım sevgilim.
          </p>
        </header>
        <p className="text-foreground leading-relaxed">
          Bu test senin için hazırlandı. Yeni kameran için iki lens yolu var —
          ama hangisi <span className="text-heading font-medium">senin</span> yolun?
          Bunu ne ben söyleyeceğim ne de internet; kendi gözün söyleyecek.
        </p>
        <ul className="mt-6 space-y-3 text-sm text-muted leading-relaxed">
          <li className="flex gap-3">
            <span className="font-mono text-accent shrink-0">01</span>
            Önce düellolar: iki fotoğraf, aynı tema. Hangisi içine dokunuyorsa ona dokun.
            Hangi lensle çekildiklerini bilmeyeceksin.
          </li>
          <li className="flex gap-3">
            <span className="font-mono text-accent shrink-0">02</span>
            Sonra tek tek kareler — içinden geldiği gibi puanla.
          </li>
          <li className="flex gap-3">
            <span className="font-mono text-accent shrink-0">03</span>
            Birkaç küçük soru. Doğru cevap yok, sadece sen varsın.
          </li>
          <li className="flex gap-3">
            <span className="font-mono text-accent shrink-0">04</span>
            Ve en sonda: sana özel yazılmış sonuç raporu.
          </li>
        </ul>
        <button
          onClick={start}
          className="mt-10 font-mono text-sm px-8 py-3.5 rounded border border-accent text-accent hover:bg-accent hover:text-background transition-colors touch-manipulation"
        >
          hadi başlayalım →
        </button>
      </div>
    )
  }

  // ── Duel round ─────────────────────────────────────────────
  if (phase === 'duels') {
    const d = duelDeck[duelIndex]
    const a = imageById.get(duelFlip[duelIndex] ? d.fuji : d.sigma)!
    const b = imageById.get(duelFlip[duelIndex] ? d.sigma : d.fuji)!
    const nextD = duelDeck[duelIndex + 1]
    return (
      <div>
        <div className="flex items-center justify-between font-mono text-xs text-muted mb-3">
          <span>
            düello {duelIndex + 1} / {duelDeck.length}
          </span>
          <span className="text-muted-dark">hangisi içine dokunuyor?</span>
        </div>
        <div className="w-full h-1 bg-surface rounded mb-4 overflow-hidden">
          <div
            className="h-full bg-accent transition-all duration-300"
            style={{ width: `${(duelIndex / duelDeck.length) * 100}%` }}
          />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {[a, b].map((img) => (
            <button
              key={`${duelIndex}-${img.id}`}
              onClick={() => pickDuel(img.lens)}
              className="reveal bg-surface border border-border rounded-lg p-1.5 hover:border-accent active:border-accent transition-colors touch-manipulation"
            >
              <img
                src={img.src}
                alt="Seçenek"
                className="w-full h-[26vh] sm:h-[44vh] object-contain rounded"
              />
            </button>
          ))}
        </div>
        {nextD && (
          <>
            <link rel="preload" as="image" href={imageById.get(nextD.sigma)!.src} />
            <link rel="preload" as="image" href={imageById.get(nextD.fuji)!.src} />
          </>
        )}
        <div className="mt-3 text-center">
          <button
            onClick={() => pickDuel('skip')}
            className="font-mono text-xs px-4 py-2 text-muted-dark hover:text-muted transition-colors touch-manipulation"
          >
            kararsızım, geç →
          </button>
        </div>
      </div>
    )
  }

  // ── Single-image round ─────────────────────────────────────
  if (phase === 'images') {
    const img = deck[imgIndex]
    const next = deck[imgIndex + 1]
    return (
      <div>
        <div className="flex items-center justify-between font-mono text-xs text-muted mb-3">
          <span>
            kare {imgIndex + 1} / {deck.length}
          </span>
          <span className="text-muted-dark">içinden geldiği gibi</span>
        </div>
        <div className="w-full h-1 bg-surface rounded mb-4 overflow-hidden">
          <div
            className="h-full bg-accent transition-all duration-300"
            style={{ width: `${(imgIndex / deck.length) * 100}%` }}
          />
        </div>
        {/* fixed height: rating buttons stay put across portrait/landscape photos */}
        <div className="bg-surface border border-border rounded-lg p-2 h-[46vh] sm:h-[56vh]">
          <img
            key={img.id}
            src={img.src}
            alt="Puanlanacak fotoğraf"
            className="reveal w-full h-full object-contain rounded"
          />
        </div>
        {next && <link rel="preload" as="image" href={next.src} />}
        <div className="grid grid-cols-3 gap-3 mt-5">
          {RATING_LABELS.map((label, i) => (
            <button
              key={label}
              onClick={() => rate(i as 0 | 1 | 2)}
              className="font-mono text-xs sm:text-sm px-2 py-3.5 rounded border border-border text-foreground hover:border-accent hover:text-accent transition-colors touch-manipulation select-none"
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
              className="text-left px-4 py-3.5 rounded border border-border text-foreground text-sm hover:border-accent hover:text-heading transition-colors touch-manipulation"
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
        raporun yazılıyor canım<span className="cursor-blink text-accent">▊</span>
      </div>
    )
  }

  // ── Result ─────────────────────────────────────────────────
  if (error || !result) {
    return (
      <div className="reveal max-w-xl">
        <p className="text-foreground">
          Rapor oluşturulurken bir şeyler ters gitti. İnterneti kontrol edip
          tekrar dener misin?
        </p>
        <button
          onClick={() => submit(answers)}
          className="mt-6 font-mono text-sm px-5 py-2.5 rounded border border-accent text-accent hover:bg-accent hover:text-background transition-colors touch-manipulation"
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
          className="font-mono text-xs px-4 py-2.5 rounded border border-border text-muted hover:border-accent hover:text-accent transition-colors touch-manipulation"
        >
          {copied ? 'kopyalandı ✓' : "sonuçları Kaan'a gönder"}
        </button>
        <button
          onClick={start}
          className="font-mono text-xs px-4 py-2.5 rounded border border-border text-muted hover:border-accent hover:text-accent transition-colors touch-manipulation"
        >
          tekrar oyna
        </button>
      </div>

      <div className="mt-16">
        <h3 className="font-mono text-sm text-heading mb-1">büyük ifşa</h3>
        <p className="text-sm text-muted mb-6">
          Düellolarda ve karelerde aslında hangisini seçtin?
        </p>
        <div className="space-y-3 mb-10">
          {duelPicks.map((d, i) => {
            const s = imageById.get(d.sigma)!
            const f = imageById.get(d.fuji)!
            return (
              <div key={i} className="flex items-center gap-3 bg-surface border border-border rounded p-2">
                {[s, f].map((img) => (
                  <img
                    key={img.id}
                    src={img.src}
                    alt=""
                    className={`w-20 h-14 object-cover rounded ${
                      d.chosen === img.lens ? 'ring-2 ring-accent' : 'opacity-50'
                    }`}
                  />
                ))}
                <div className="font-mono text-[11px] leading-relaxed text-muted">
                  {d.chosen === 'skip' ? (
                    'kararsız kaldın'
                  ) : (
                    <>
                      seçimin:{' '}
                      <span className={d.chosen === 'sigma' ? 'text-accent' : 'text-amber'}>
                        {LENS_LABELS[d.chosen as LensKey]}
                      </span>
                    </>
                  )}
                </div>
              </div>
            )
          })}
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {ratings.map((r) => {
            const img = imageById.get(r.id)
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
