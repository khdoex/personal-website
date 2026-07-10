// Blind lens taste test — shared game data and scoring.
// Two paths for the X-S20:
//   sigma -> Sigma 18-50mm f/2.8 DC DN, tek seferde
//   fuji  -> XC 15-45 kit ile başla, sonra XF 16-50 f/2.8-4.8
import imagesJson from './images.json'
import duelsJson from './duels.json'

export type LensKey = 'sigma' | 'fuji'

export type GameImage = {
  id: string
  src: string
  lens: LensKey
  author: string
  license: string
  page: string
  theme?: string
  quality?: number
  model?: string // exact lens shown on the reveal screen
}

export const IMAGES = imagesJson as GameImage[]

// Curated cross-lens duels: same theme, one photo per lens.
export type Duel = { theme: string; sigma: string; fuji: string }
export const DUELS = duelsJson as Duel[]

// ── Tuning knobs ──────────────────────────────────────────────
// Verbal answers give 0-2 points each (8 questions ≈ 16 pts max).
// Duels are head-to-head picks: DUEL_WEIGHT points per win.
// Singles measure warmth per lens: IMAGE_WEIGHT max per lens.
export const IMAGE_WEIGHT = 6
export const IMAGES_PER_LENS = 4 // singles per lens per playthrough
export const DUELS_PER_GAME = 10
export const DUEL_WEIGHT = 1.2
// Soft cap per photographer when sampling singles (Commons pools are
// few-shooter — fuji is mostly Benoit Brummer — so this tops up when starved).
export const MAX_PER_AUTHOR = 3

export type Option = {
  label: string
  sigma: number
  fuji: number
  // short clause used inside the report, e.g. "video senin için öncelik"
  tag: string
}

export type Question = { id: string; text: string; options: Option[] }

export const QUESTIONS: Question[] = [
  {
    id: 'output',
    text: 'Çektiklerini en çok nerede hayal ediyorsun?',
    options: [
      { label: 'Duvarda, baskı albümde — durağan ve zamansız', sigma: 0, fuji: 1, tag: 'kareleri baskıda, duvarda hayal ediyorsun' },
      { label: "Instagram'da — fotoğraf da video da", sigma: 1, fuji: 0, tag: 'fotoğrafla videoyu birlikte düşünüyorsun' },
      { label: 'Reels ve vloglarda — akan, hareketli anlar', sigma: 2, fuji: 0, tag: 'video senin için ciddi bir öncelik' },
    ],
  },
  {
    id: 'candlelight',
    text: 'Mum ışığında bir doğum günü. Işıklar kapalı, pasta geliyor. Sen?',
    options: [
      { label: 'O an benim: telefon değil, kameram hazırda', sigma: 2, fuji: 0, tag: 'loş ışık senin sahnen' },
      { label: 'Birkaç kare denerim, olmazsa telefona dönerim', sigma: 1, fuji: 0, tag: 'loş ışıkta ara sıra şansını deniyorsun' },
      { label: 'Ben ışıklar açılınca çekerim — gündüz insanıyım', sigma: 0, fuji: 1, tag: 'en çok gün ışığında çekiyorsun' },
    ],
  },
  {
    id: 'portrait',
    text: 'Bir portrede seni en çok ne mutlu eder?',
    options: [
      { label: 'Arka planın eriyip sadece o yüzün kalması', sigma: 2, fuji: 0, tag: 'eriyen arka planlara bayılıyorsun' },
      { label: 'Kişiyi mekânıyla birlikte anlatan doğal bir kare', sigma: 0, fuji: 1, tag: 'insanı hikâyesiyle birlikte çekmeyi seviyorsun' },
      { label: 'Portre benlik değil; manzara ve sokak benim işim', sigma: 0, fuji: 1, tag: 'gözün daha çok manzarada ve sokakta' },
    ],
  },
  {
    id: 'shoes',
    text: 'Ayakkabı alırken hangisi sensin?',
    options: [
      { label: 'Bayıldığım o teki alırım, yıllarca giyerim', sigma: 2, fuji: 0, tag: 'doğru olan tek şeyi alıp yıllarca kullananlardansın' },
      { label: 'Önce uygun olanı denerim; seversem iyisine geçerim', sigma: 0, fuji: 2, tag: 'önce deneyip sonra yükseltmek sana mantıklı geliyor' },
      { label: 'Karar veremem — ikisini de isterim', sigma: 0, fuji: 1, tag: 'seçenekleri açık tutmayı seviyorsun' },
    ],
  },
  {
    id: 'vintage',
    text: 'Vintage ve ikinci el dükkânları senin için ne ifade ediyor?',
    options: [
      { label: 'Hazine avı — bulduğum şeyin hikâyesine bayılırım', sigma: 0, fuji: 2, tag: 'ikinci elin hikâyesi sana çekici geliyor' },
      { label: 'Bakarım, beğenirsem alırım ama nadiren', sigma: 1, fuji: 0, tag: 'ikinci ele temkinli yaklaşıyorsun' },
      { label: 'Benlik değil — bana yeni kutu kokusu lazım', sigma: 2, fuji: 0, tag: 'sıfır ve el değmemiş olsun istiyorsun' },
    ],
  },
  {
    id: 'bag',
    text: 'Çantanı toplarken felsefen ne?',
    options: [
      { label: 'Minimal: ne kadar hafif, o kadar özgür', sigma: 0, fuji: 1, tag: 'hafiflik senin için özgürlük demek' },
      { label: 'Ne lazımsa girer; ağırlık beni korkutmaz', sigma: 1, fuji: 0, tag: 'ağırlıktan gözün korkmuyor' },
    ],
  },
  {
    id: 'hobby-start',
    text: 'Yeni bir hobiye başlarken seni ne motive eder?',
    options: [
      { label: 'İlk günden iyi ekipman — kendime yatırım yapmak', sigma: 2, fuji: 0, tag: 'iyi ekipmanla başlamak seni motive ediyor' },
      { label: 'Küçük başlayıp hak ede ede büyümek', sigma: 0, fuji: 2, tag: 'adım adım büyümek sana iyi geliyor' },
    ],
  },
  {
    id: 'one-year',
    text: 'Bir yıl sonrasını hayal et: kameranla aran nasıl?',
    options: [
      { label: 'Tek kamera tek lens — hep çantamda, her yerde', sigma: 2, fuji: 0, tag: 'tek ve pratik bir düzen istiyorsun' },
      { label: 'Rafta birkaç lens; o günkü ruh halime göre seçerim', sigma: 0, fuji: 1, tag: 'zamanla lens denemeye açıksın' },
    ],
  },
]

// ── Payload sent from the client at the end of the game ──────
export type Rating = { id: string; rating: 0 | 1 | 2 } // 0 bana göre değil, 1 fena değil, 2 bayıldım
export type DuelPick = { sigma: string; fuji: string; chosen: LensKey | 'skip' }
export type GamePayload = {
  ratings: Rating[]
  duels: DuelPick[]
  answers: number[] // option index per question, aligned with QUESTIONS
}

export type Scores = {
  sigma: number
  fuji: number
  imageAvg: { sigma: number; fuji: number } // 0..2 from singles
  duelWins: { sigma: number; fuji: number; skipped: number }
  verdict: LensKey
  margin: number // 0..1, how decisive
  tags: string[] // clauses supporting the verdict, strongest first
}

const lensById = new Map(IMAGES.map((i) => [i.id, i.lens]))

export function computeScores(p: GamePayload): Scores {
  const sums = { sigma: 0, fuji: 0 }
  const counts = { sigma: 0, fuji: 0 }
  for (const r of p.ratings) {
    const lens = lensById.get(r.id)
    if (!lens) continue
    sums[lens] += r.rating
    counts[lens] += 1
  }
  const imageAvg = {
    sigma: counts.sigma ? sums.sigma / counts.sigma : 0,
    fuji: counts.fuji ? sums.fuji / counts.fuji : 0,
  }

  const duelWins = { sigma: 0, fuji: 0, skipped: 0 }
  for (const d of p.duels) {
    if (d.chosen === 'skip') duelWins.skipped += 1
    else duelWins[d.chosen] += 1
  }

  let sigma = (imageAvg.sigma / 2) * IMAGE_WEIGHT + duelWins.sigma * DUEL_WEIGHT
  let fuji = (imageAvg.fuji / 2) * IMAGE_WEIGHT + duelWins.fuji * DUEL_WEIGHT

  const picked: { opt: Option; toward: LensKey; strength: number }[] = []
  QUESTIONS.forEach((q, i) => {
    const opt = q.options[p.answers[i]]
    if (!opt) return
    sigma += opt.sigma
    fuji += opt.fuji
    if (opt.sigma !== opt.fuji) {
      picked.push({
        opt,
        toward: opt.sigma > opt.fuji ? 'sigma' : 'fuji',
        strength: Math.abs(opt.sigma - opt.fuji),
      })
    }
  })

  const verdict: LensKey = sigma >= fuji ? 'sigma' : 'fuji'
  const total = sigma + fuji
  const margin = total > 0 ? Math.abs(sigma - fuji) / total : 0
  const tags = picked
    .filter((x) => x.toward === verdict)
    .sort((a, b) => b.strength - a.strength)
    .map((x) => x.opt.tag)

  return { sigma, fuji, imageAvg, duelWins, verdict, margin, tags }
}

export const PATH_NAMES: Record<LensKey, string> = {
  sigma: 'Sigma 18-50mm f/2.8 DC DN — tek seferde, doğrudan',
  fuji: 'Fujifilm yolu — önce XC 15-45 kit, sonra XF 16-50 f/2.8-4.8',
}

export const REPORT_OPENER = 'Canım sevgilim, test sonuçları diyor ki:'

// Deterministic Turkish report used when DeepSeek is unavailable.
export function fallbackReport(p: GamePayload, s: Scores): string {
  const closeCall = s.margin < 0.08
  const w = s.duelWins

  const duelSentence =
    w.sigma !== w.fuji
      ? `Karşı karşıya turlarında, hangi fotoğrafın hangi lensten çıktığını bilmeden, ${
          w.sigma > w.fuji
            ? `${w.sigma}-${w.fuji} Sigma f/2.8'in karelerini seçtin`
            : `${w.fuji}-${w.sigma} Fuji zoom'un karelerini seçtin`
        }${w.skipped ? ` (${w.skipped} turda da ikisini ayıramadın, ki bu da bir cevap)` : ''}.`
      : `Karşı karşıya turlarında ikisi berabere kaldı — gözün iki lensin diline de sıcak bakıyor.`

  const eyeSentence =
    s.imageAvg.sigma > s.imageAvg.fuji + 0.1
      ? `Tek tek puanladığın karelerde de Sigma'nın fotoğrafları senden daha yüksek not aldı.`
      : s.imageAvg.fuji > s.imageAvg.sigma + 0.1
        ? `Tek tek puanladığın karelerde ise Fuji'nin fotoğrafları senden daha yüksek not aldı.`
        : `Tek tek puanladığın karelerde iki tarafa da neredeyse aynı notu verdin.`

  const why = s.tags.slice(0, 3)
  const whySentence = why.length
    ? `Cevaplarında asıl konuşanlar şunlardı: ${why.join('; ')}.`
    : ''

  const plan =
    s.verdict === 'sigma'
      ? `Senin yolun belli: X-S20'nin yanına doğrudan Sigma 18-50mm f/2.8. Sabit f/2.8 diyafram, mum ışığı ve eriyen arka planlar ilk günden seninle olur; tek lensle sade bir çanta, kafanda tek bir soru bile kalmaz.`
      : `Senin yolun belli: X-S20'yi XC 15-45 kitiyle al — lens neredeyse hediyeye gelir, hafif ve tatlıdır. Kamerayı ve gözünü tanıdıkça, XF 16-50 f/2.8-4.8 ile o meşhur Fuji hissine geçersin. Adım adım gider, sonunda iki lense birden sahip olursun.`

  const closer = closeCall
    ? `Ama şunu bil: sonuç kıl payıydı. İki yol da sana yakışıyor — içinden hangisi geliyorsa o, yanlış cevap yok. Seni seviyorum.`
    : `Gözünle alışkanlıkların aynı kapıyı gösteriyor; için çok rahat olsun. Seni seviyorum.`

  return [REPORT_OPENER, duelSentence + ' ' + eyeSentence, whySentence, plan, closer]
    .filter(Boolean)
    .join('\n\n')
}
