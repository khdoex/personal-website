// Blind lens taste test — shared game data and scoring.
// Two paths for the X-S20:
//   sigma -> Sigma 18-50mm f/2.8 DC DN, tek seferde
//   fuji  -> XC 15-45 kit ile başla, sonra ikinci el XF 18-55 f/2.8-4
import imagesJson from './images.json'

export type LensKey = 'sigma' | 'fuji'

export type GameImage = {
  id: string
  src: string
  lens: LensKey
  author: string
  license: string
  page: string
}

export const IMAGES = imagesJson as GameImage[]

// ── Tuning knobs ──────────────────────────────────────────────
// IMAGE_WEIGHT: how many points the blind image round is worth per lens
// (verbal answers give 0-2 points each, 8 questions ≈ 16 points max).
// Bump this up if her eye should count more than her stated habits.
export const IMAGE_WEIGHT = 8
export const IMAGES_PER_LENS = 8 // shown per playthrough (of 12 in the pool)

export type Option = {
  label: string
  sigma: number
  fuji: number
  // short clause used inside the report, e.g. "videoya da önem veriyorsun"
  tag: string
}

export type Question = { id: string; text: string; options: Option[] }

export const QUESTIONS: Question[] = [
  {
    id: 'photo-video',
    text: 'Bu kamerayla en çok ne çekeceksin?',
    options: [
      { label: 'Çoğunlukla fotoğraf', sigma: 0, fuji: 1, tag: 'önceliğin fotoğraf' },
      { label: 'Fotoğraf da video da', sigma: 1, fuji: 0, tag: 'fotoğrafla videoyu birlikte götürüyorsun' },
      { label: 'Video benim için çok önemli', sigma: 2, fuji: 0, tag: 'video senin için ciddi bir öncelik' },
    ],
  },
  {
    id: 'low-light',
    text: 'Akşam yemekleri, kafeler, konserler... Loş ışıkta ne kadar çekersin?',
    options: [
      { label: 'Sürekli — iç mekân ve gece benim alanım', sigma: 2, fuji: 0, tag: 'loş ışıkta çok çekiyorsun' },
      { label: 'Ara sıra', sigma: 1, fuji: 0, tag: 'ara sıra loş ışığa giriyorsun' },
      { label: 'Genelde gün ışığında dışarıdayım', sigma: 0, fuji: 1, tag: 'çoğunlukla gün ışığında çekiyorsun' },
    ],
  },
  {
    id: 'bokeh',
    text: 'Arka planı yumuşakça eriyen portreler senin için...',
    options: [
      { label: 'Olmazsa olmaz', sigma: 2, fuji: 0, tag: 'eriyen arka planlara bayılıyorsun' },
      { label: 'Güzel olur ama şart değil', sigma: 1, fuji: 1, tag: 'bokeh hoşuna gidiyor ama şart değil' },
      { label: 'Ben daha çok manzara ve sokak çekerim', sigma: 0, fuji: 1, tag: 'gözün daha çok manzarada ve sokakta' },
    ],
  },
  {
    id: 'budget',
    text: 'Bütçe konusunda hangisi sana daha yakın?',
    options: [
      { label: 'Bir kere alayım, bir daha düşünmeyeyim', sigma: 2, fuji: 0, tag: 'tek seferde doğru şeyi almayı seviyorsun' },
      { label: 'Ucuz başlayıp sonra yükseltmek mantıklı', sigma: 0, fuji: 2, tag: 'kademeli yükseltme sana mantıklı geliyor' },
      { label: 'Şu an ne kadar az harcarsam o kadar iyi', sigma: 0, fuji: 2, tag: 'şu an bütçeyi korumak istiyorsun' },
    ],
  },
  {
    id: 'secondhand',
    text: 'İkinci el lens almak sana nasıl hissettiriyor?',
    options: [
      { label: 'Hiç sorun değil, iyi fırsattır', sigma: 0, fuji: 2, tag: 'ikinci el pazarına sıcak bakıyorsun' },
      { label: 'Biraz tedirgin eder', sigma: 1, fuji: 0, tag: 'ikinci el seni biraz tedirgin ediyor' },
      { label: 'Asla — her şeyim sıfır olsun', sigma: 2, fuji: 0, tag: 'sıfır ürün senin için önemli' },
    ],
  },
  {
    id: 'weight',
    text: 'Çantandaki ağırlık ne kadar umurunda?',
    options: [
      { label: 'Ne kadar hafif, o kadar iyi', sigma: 0, fuji: 1, tag: 'hafiflik senin için önemli' },
      { label: 'Birkaç yüz gram dert değil', sigma: 1, fuji: 0, tag: 'ağırlık seni korkutmuyor' },
    ],
  },
  {
    id: 'upgrade-style',
    text: 'Yeni bir hobiye başlarken hangisi sensin?',
    options: [
      { label: 'En iyi ekipmanla başlarım, motivasyonum artar', sigma: 2, fuji: 0, tag: 'iyi ekipmanla başlamak seni motive ediyor' },
      { label: 'Önce öğrenirim, hak edince yükseltirim', sigma: 0, fuji: 2, tag: 'önce öğrenip sonra yükseltmeyi seviyorsun' },
    ],
  },
  {
    id: 'lens-future',
    text: 'İleride kendini nasıl görüyorsun?',
    options: [
      { label: 'Tek pratik lensle her şeyi çekerim', sigma: 2, fuji: 0, tag: 'tek lensle sade bir düzen istiyorsun' },
      { label: 'Zamanla farklı lensler denemek isterim', sigma: 0, fuji: 1, tag: 'zamanla lens denemeye açıksın' },
    ],
  },
]

// ── Payload sent from the client at the end of the game ──────
export type Rating = { id: string; rating: 0 | 1 | 2 } // 0 bana göre değil, 1 fena değil, 2 bayıldım
export type GamePayload = {
  name: string
  ratings: Rating[]
  answers: number[] // option index per question, aligned with QUESTIONS
}

export type Scores = {
  sigma: number
  fuji: number
  imageAvg: { sigma: number; fuji: number } // 0..2
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

  let sigma = (imageAvg.sigma / 2) * IMAGE_WEIGHT
  let fuji = (imageAvg.fuji / 2) * IMAGE_WEIGHT
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

  return { sigma, fuji, imageAvg, verdict, margin, tags }
}

export const PATH_NAMES: Record<LensKey, string> = {
  sigma: 'Sigma 18-50mm f/2.8 DC DN — tek seferde, doğrudan',
  fuji: 'Fujifilm yolu — önce XC 15-45 kit, sonra ikinci el XF 18-55 f/2.8-4',
}

// Deterministic Turkish report used when DeepSeek is unavailable.
export function fallbackReport(p: GamePayload, s: Scores): string {
  const name = p.name?.trim() || 'Sevgili fotoğrafçı'
  const winAvg = s.imageAvg[s.verdict]
  const loseAvg = s.imageAvg[s.verdict === 'sigma' ? 'fuji' : 'sigma']
  const eyeAgrees = winAvg > loseAvg + 0.1
  const closeCall = s.margin < 0.08

  const eyeSentence =
    s.imageAvg.sigma > s.imageAvg.fuji + 0.1
      ? `Kör testte, hangi lens olduğunu bilmeden, Sigma f/2.8 ile çekilmiş karelere belirgin şekilde daha yüksek puan verdin (ortalama ${s.imageAvg.sigma.toFixed(1)} vs ${s.imageAvg.fuji.toFixed(1)}).`
      : s.imageAvg.fuji > s.imageAvg.sigma + 0.1
        ? `Kör testte, hangi lens olduğunu bilmeden, Fuji 18-55 ile çekilmiş kareleri daha çok beğendin (ortalama ${s.imageAvg.fuji.toFixed(1)} vs ${s.imageAvg.sigma.toFixed(1)}).`
        : `Kör testte iki lensin karelerine neredeyse aynı puanları verdin — gözün ikisini de sevdi, bu aslında güzel bir haber: hangi yolu seçersen seç görüntüden mutlu olacaksın.`

  const why = s.tags.slice(0, 3)
  const whySentence = why.length
    ? `Cevaplarında öne çıkanlar: ${why.join(', ')}.`
    : ''

  const plan =
    s.verdict === 'sigma'
      ? `Önerim net: X-S20 gövdesinin yanına doğrudan Sigma 18-50mm f/2.8 al. Sabit f/2.8 diyafram loş ışıkta ve portrelerde ilk günden yanında olur, tek lensle sade bir çantayla gezersin ve "acaba yükseltsem mi" sorusunu hiç yaşamazsın.`
      : `Önerim net: X-S20'yi XC 15-45 kit lensiyle paketten al — aradaki fark çok küçük, lens neredeyse hediye gelir. İlk aylarda kamerayı ve gözünü tanı; sonra temiz bir ikinci el XF 18-55 f/2.8-4 ile hem daha parlak diyaframa hem de o meşhur Fuji hissine geç. Toplamda daha az öder, iki lensin olur.`

  const closer = closeCall
    ? `Şunu da söyleyeyim: sonuç kıl payıydı. İki yol da sana uyar — bu yüzden içinden hangisi geliyorsa onu seç, yanlış cevap yok.`
    : eyeAgrees
      ? `En güzeli şu: gözünün seçtiğiyle alışkanlıklarının işaret ettiği aynı yönde. İçin rahat olsun.`
      : `İlginç bir detay: gözün kör testte diğer tarafa da göz kırptı. Ama günlük kullanım alışkanlıkların bu kadar netken, doğru seçim bu.`

  return [
    `${name},`,
    eyeSentence,
    whySentence,
    plan,
    closer,
  ]
    .filter(Boolean)
    .join('\n\n')
}
