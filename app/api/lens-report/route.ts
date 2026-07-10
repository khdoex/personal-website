import { NextResponse } from 'next/server'
import {
  computeScores,
  fallbackReport,
  GamePayload,
  IMAGES,
  PATH_NAMES,
  QUESTIONS,
  REPORT_OPENER,
} from '@/lib/lens-test/game'

export const dynamic = 'force-dynamic'

const lensById = new Map(IMAGES.map((i) => [i.id, i.lens]))

function validate(body: unknown): GamePayload | null {
  if (typeof body !== 'object' || body === null) return null
  const b = body as Record<string, unknown>
  if (!Array.isArray(b.ratings) || b.ratings.length > IMAGES.length) return null
  if (!Array.isArray(b.duels) || b.duels.length > 20) return null
  if (!Array.isArray(b.answers) || b.answers.length !== QUESTIONS.length) return null

  const ratings = []
  for (const r of b.ratings) {
    const { id, rating } = (r ?? {}) as Record<string, unknown>
    if (typeof id !== 'string' || !lensById.has(id)) return null
    if (rating !== 0 && rating !== 1 && rating !== 2) return null
    ratings.push({ id, rating })
  }

  const duels = []
  for (const d of b.duels) {
    const { sigma, fuji, chosen } = (d ?? {}) as Record<string, unknown>
    if (typeof sigma !== 'string' || lensById.get(sigma) !== 'sigma') return null
    if (typeof fuji !== 'string' || lensById.get(fuji) !== 'fuji') return null
    if (chosen !== 'sigma' && chosen !== 'fuji' && chosen !== 'skip') return null
    duels.push({ sigma, fuji, chosen })
  }

  const answers = []
  for (let i = 0; i < QUESTIONS.length; i++) {
    const a = b.answers[i]
    if (typeof a !== 'number' || !QUESTIONS[i].options[a]) return null
    answers.push(a)
  }
  return { ratings, duels, answers } as GamePayload
}

async function deepseekReport(p: GamePayload, s: ReturnType<typeof computeScores>) {
  const key = process.env.DEEPSEEK_API_KEY
  if (!key) return null

  const answerLines = QUESTIONS.map(
    (q, i) => `- ${q.text} -> ${q.options[p.answers[i]].label}`
  ).join('\n')

  const system = `Kaan, sevgilisi için tatlı bir kör lens testi hazırladı; sen bu testin sonunda ona kişisel raporu yazan sıcak, esprili, fotoğraftan anlayan sesisin. Rapor doğrudan ona, "sen" diliyle ve sevgiyle yazılacak (hitap: canım, sevgilim gibi — abartmadan). İlk satır aynen şu olacak: "${REPORT_OPENER}" Sonra 4-5 kısa paragraf: önce sonucu söyle, sonra bu sonucun NEDEN onun seçimlerine uyduğunu somut örneklerle anlat (düello seçimleri, tek tek verdiği puanlar, sorulardaki cevapları), en sonda tatlı ve cesaretlendirici bir kapanış. Başlık ve madde işareti kullanma. Teknik terimleri bir cümleyle açıkla, hava atma. Skorları kuru kuru sayma; hikâyeleştir. Para ve fiyat kelimelerini az kullan, seçimin ruhunu anlat.`

  const user = `Karar: Fujifilm X-S20 gövdesi alınacak, iki lens yolu arasında seçim:
1) "sigma": ${PATH_NAMES.sigma} (sabit f/2.8; loş ışık, eriyen arka plan, video için güçlü; tek seferde alınır)
2) "fuji": ${PATH_NAMES.fuji} (kit ile ucuz başlangıç + sonradan ikinci el yükseltme; kademeli yol)

Kör düello sonuçları (aynı temada iki fotoğraf, hangi lens olduğunu bilmeden seçti):
- Sigma'nın karesini seçtiği: ${s.duelWins.sigma}
- Fuji'nin karesini seçtiği: ${s.duelWins.fuji}
- Kararsız kaldığı: ${s.duelWins.skipped}

Tek tek puanladığı karelerde ortalama (0-2):
- Sigma: ${s.imageAvg.sigma.toFixed(2)} / Fuji: ${s.imageAvg.fuji.toFixed(2)}

Sorulara cevapları:
${answerLines}

Hesaplanan sonuç: "${s.verdict}" yolu kazandı (skor ${s.sigma.toFixed(1)} - ${s.fuji.toFixed(1)}${s.margin < 0.08 ? ', kıl payı' : ''}).

Somut alışveriş planı (raporda anlat): sigma yolu = gövde + Sigma 18-50 f/2.8 tek seferde; fuji yolu = gövdeyi XC 15-45 kitiyle al, 6-12 ay sonra ikinci el XF 18-55 f/2.8-4 ekle.`

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
      duelWins: scores.duelWins,
    },
  })
}
