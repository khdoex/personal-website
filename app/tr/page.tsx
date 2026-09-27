import Link from 'next/link'
import Reveal from '@/components/motion/Reveal'
import JsonLd from '@/components/JsonLd'
import { PERSON } from '@/lib/site'
import { breadcrumbNode, graph, pageMetadata, profilePageNode } from '@/lib/seo'

// Turkish landing. Exists so Turkish queries ("kaan yapay zeka",
// "kaan hacıhaliloğlu") land on a page actually written in Turkish, paired
// with the English homepage through hreflang.
export const metadata = pageMetadata({
  absoluteTitle: 'Kaan Hacıhaliloğlu (kaanhho) · Yapay Zeka Mühendisi',
  description:
    'Kaan Hacıhaliloğlu (Hacihaliloglu, kaanhho): İstanbul’da yapay zeka mühendisi. Büyük dil modellerinde reddetme davranışını mekanistik yorumlanabilirlikle araştırıyor, SCL’de yapay zeka ile pazar araştırması motoru geliştiriyor.',
  path: '/tr',
  type: 'profile',
  locale: 'tr_TR',
  languages: { en: '/', tr: '/tr', 'x-default': '/' },
})

const story = [
  <>
    fizik okudum, bana kapatamadığım bir alışkanlık bıraktı: altta gerçekte ne
    oluyor diye sormak. bugün yapay zekanın çoğu, kimsenin tam olarak açıp
    okuyamadığı modellerin üstünde çalışıyor. bu ya korkutucu ya da ilginç, ben
    ilginç olanı seçtim.
  </>,
  <>
    şu an sabancı üniversitesi&apos;nde veri bilimi yüksek lisansı yapıyorum,
    tezim büyük dil modellerinde (llm) reddetme yönü üzerine. bir model
    &quot;bu konuda yardımcı olamam&quot; dediğinde içeride belirli bir şey
    oluyor ve bu, aktivasyon uzayında bir yön olarak gösterilebiliyor.
    jailbreak&apos;lerin modeli bu yönden nasıl uzaklaştırdığını ve bunun
    savunma (ya da saldırı) için ne anlama geldiğini haritalıyorum.
  </>,
  <>
    SCL&apos;de (synthetic consumer lab) yapay zeka mühendisiyim: yapay zeka
    tabanlı bir pazar araştırması motoru kuruyorum, gerçek tüketiciler gibi
    davranan sentetik tüketiciler. yazması bile garip bir cümle. backend,
    frontend, ajanlar, istatistik, hepsi bende. SoundBoost&apos;ta da derin
    öğrenmeyle çalışan bir ses mastering platformunun yapay zeka tarafındayım.
  </>,
  <>
    lisansı boğaziçi&apos;nde fizikte bitirdim, EarthML grubunda transformer
    modelleriyle deprem tespiti üzerine çalıştık. arada padova&apos;da
    bilgisayar bilimleri yüksek lisansına başladım, olmadı. neden olmadığını{' '}
    <Link href="/blog/master" className="u-link text-heading hover:text-accent">
      blogda yazdım
    </Link>
    .
  </>,
]

const facts = [
  { label: 'şu an', value: 'yapay zeka mühendisi, SCL (synthetic consumer lab) ve SoundBoost' },
  { label: 'araştırma', value: 'mekanistik yorumlanabilirlik, llm güvenliği, reddetme yönü' },
  { label: 'eğitim', value: 'sabancı üniversitesi (veri bilimi yl), boğaziçi üniversitesi (fizik lisans)' },
  { label: 'araçlar', value: 'python, pytorch, transformerlens, nnsight, fastapi, laravel, typescript' },
  { label: 'diller', value: 'türkçe (ana dil), ingilizce' },
  { label: 'kullanıcı adı', value: 'kaanhho (x, hugging face, linkedin), khdoex (github)' },
]

export default function Turkish() {
  return (
    <div lang="tr">
      <JsonLd
        data={graph(
          profilePageNode({
            path: '/tr',
            name: `${PERSON.nameTr} · ${PERSON.jobTitleTr}`,
            inLanguage: 'tr',
          }),
          breadcrumbNode([{ name: 'Türkçe', path: '/tr' }])
        )}
      />
      <section className="max-w-3xl mx-auto px-6 md:px-8 pt-24 md:pt-32 pb-28">
        <Reveal>
          <h1 className="font-mono text-lg font-semibold text-heading">
            kaan hacıhaliloğlu
          </h1>
          <p className="font-mono text-xs text-muted-dark mt-2">
            yapay zeka mühendisi · istanbul · kaanhho
          </p>
        </Reveal>

        <div className="space-y-5 mt-8 max-w-xl">
          {story.map((paragraph, i) => (
            <Reveal key={i} delay={i === 0 ? 0.08 : 0}>
              <p className="text-base leading-relaxed">{paragraph}</p>
            </Reveal>
          ))}
        </div>

        <Reveal className="mt-14">
          <p className="font-mono text-xs text-muted-dark mb-2">kısaca</p>
          <dl className="border-y border-border divide-y divide-border">
            {facts.map((fact) => (
              <div
                key={fact.label}
                className="grid md:grid-cols-[8rem_1fr] gap-x-6 gap-y-1 py-3"
              >
                <dt className="font-mono text-xs text-muted-dark pt-0.5">
                  {fact.label}
                </dt>
                <dd className="text-sm text-foreground">{fact.value}</dd>
              </div>
            ))}
          </dl>
        </Reveal>

        <Reveal>
          <div className="flex flex-wrap items-center gap-x-7 gap-y-3 mt-10 font-mono text-[13px]">
            <Link href="/blog" className="u-link text-heading hover:text-accent">
              yazılar →
            </Link>
            <Link href="/projects" className="u-link text-muted hover:text-accent">
              projeler
            </Link>
            <Link href="/resume" className="u-link text-muted hover:text-accent">
              cv
            </Link>
            <a href={`mailto:${PERSON.email}`} className="u-link text-muted hover:text-accent">
              e-posta
            </a>
            <Link href="/" hrefLang="en" className="u-link text-muted hover:text-accent">
              english
            </Link>
          </div>
        </Reveal>
      </section>
    </div>
  )
}
