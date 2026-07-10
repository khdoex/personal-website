import { NextResponse } from 'next/server'
import {
  computeScores,
  fallbackReport,
  GamePayload,
  IMAGES,
  PATH_NAMES,
  QUESTIONS,
} from '@/lib/lens-test/game'

export const dynamic = 'force-dynamic'

const imageIds = new Set(IMAGES.map((i) => i.id))

function validate(body: unknown): GamePayload | null {
  if (typeof body !== 'object' || body === null) return null
  const b = body as Record<string, unknown>
  if (typeof b.name !== 'string' || b.name.length > 60) return null
  if (!Array.isArray(b.ratings) || b.ratings.length > IMAGES.length) return null
  if (!Array.isArray(b.answers) || b.answers.length !== QUESTIONS.length) return null
  const ratings = []
  for (const r of b.ratings) {
    const { id, rating } = (r ?? {}) as Record<string, unknown>
    if (typeof id !== 'string' || !imageIds.has(id)) return null
    if (rating !== 0 && rating !== 1 && rating !== 2) return null
    ratings.push({ id, rating })
  }
  const answers = []
  for (let i = 0; i < QUESTIONS.length; i++) {
    const a = b.answers[i]
    if (typeof a !== 'number' || !QUESTIONS[i].options[a]) return null
    answers.push(a)
  }
  return { name: b.name, ratings, answers } as GamePayload
}

async function deepseekReport(p: GamePayload, s: ReturnType<typeof computeScores>) {
  const key = process.env.DEEPSEEK_API_KEY
  if (!key) return null

  const answerLines = QUESTIONS.map(
    (q, i) => `- ${q.text} -> ${q.options[p.answers[i]].label}`
  ).join('\n')

  const system = `Sen fotoğrafçılıktan iyi anlayan, sıcak ve esprili bir arkadaşsın. Kısa bir kör lens testi oynayan kişiye, sonuçlarına göre kişisel bir rapor yazacaksın. Türkçe, samimi "sen" diliyle yaz. Başlık ve madde işareti kullanma; 4-5 kısa paragraf yaz. Önce sonucu söyle, sonra bu sonucun NEDEN onun cevaplarına ve görsel zevkine uyduğunu somut örneklerle anlat, en sonda tatlı ve cesaretlendirici bir kapanış yap. Teknik terimleri bir cümleyle açıkla, hava atma. Skorları kuru kuru sayma; hikâyeleştir.`

  const user = `Oyuncunun adı: ${p.name || 'bilinmiyor'}

Karar: Fujifilm X-S20 gövdesi alınacak, iki lens yolu arasında seçim yapılıyor:
1) "sigma": ${PATH_NAMES.sigma} (~daha pahalı ama sabit f/2.8; loş ışık, bokeh, video için güçlü)
2) "fuji": ${PATH_NAMES.fuji} (ucuz başlangıç + sonra ikinci el yükseltme; kademeli, esnek)

Kör görsel test sonucu (hangi lens olduğunu bilmeden fotoğraflara 0-2 puan verdi):
- Sigma f/2.8 karelerine ortalama: ${s.imageAvg.sigma.toFixed(2)} / 2
- Fuji 18-55 karelerine ortalama: ${s.imageAvg.fuji.toFixed(2)} / 2

Sorulara verdiği cevaplar:
${answerLines}

Hesaplanan sonuç: "${s.verdict}" yolu kazandı (skor ${s.sigma.toFixed(1)} - ${s.fuji.toFixed(1)}${s.margin < 0.08 ? ', kıl payı' : ''}).

Bu verdiği cevaplarla tutarlı, kişisel bir rapor yaz. Kazanan yolu net söyle ve somut alışveriş planını anlat (sigma yolu: gövde + Sigma 18-50 f/2.8 tek seferde; fuji yolu: gövdeyi XC 15-45 kitiyle al, 6-12 ay sonra ikinci el XF 18-55 f/2.8-4 ekle).`

  const ctrl = new AbortController()
  const timer = setTimeout(() => ctrl.abort(), 40000)
  try {
    const res = await fetch('https://api.deepseek.com/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${key}`,
      },
      body: JSON.stringify({
        model: 'deepseek-chat',
        messages: [
          { role: 'system', content: system },
          { role: 'user', content: user },
        ],
        temperature: 1.1,
        max_tokens: 900,
      }),
      signal: ctrl.signal,
    })
    if (!res.ok) return null
    const data = (await res.json()) as {
      choices?: { message?: { content?: string } }[]
    }
    return data.choices?.[0]?.message?.content?.trim() || null
  } catch {
    return null
  } finally {
    clearTimeout(timer)
  }
}

export async function POST(req: Request) {
  let body: unknown
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'invalid json' }, { status: 400 })
  }
  const payload = validate(body)
  if (!payload) {
    return NextResponse.json({ error: 'invalid payload' }, { status: 400 })
  }

  const scores = computeScores(payload)
  const report =
    (await deepseekReport(payload, scores)) ?? fallbackReport(payload, scores)

  return NextResponse.json({
    report,
    verdict: scores.verdict,
    scores: {
      sigma: Number(scores.sigma.toFixed(1)),
      fuji: Number(scores.fuji.toFixed(1)),
      imageAvg: {
        sigma: Number(scores.imageAvg.sigma.toFixed(2)),
        fuji: Number(scores.imageAvg.fuji.toFixed(2)),
      },
    },
  })
}
