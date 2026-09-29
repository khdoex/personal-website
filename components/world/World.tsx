'use client'

import { usePathname } from 'next/navigation'
import { useEffect, useRef } from 'react'
import type { WorldLabels } from '@/lib/content-types'
import type { CaptionKey, Engine } from './engine/engine'
import { setWorldControls, worldStore } from './store'

const CAPTIONS = ['saturn', 'blackHole', 'transformer', 'refusal', 'harmful', 'harmless'] as const satisfies readonly CaptionKey[]
// Annotations inside the model scene sit centred on their point; the rest
// hang off theirs on a tick.
const CENTRED = new Set<CaptionKey>(['transformer', 'refusal', 'harmful', 'harmless'])

/**
 * Tells the engine where the page's stations are (the elements marked
 * data-station), how tall the page is, and where its text column ends, so a
 * scene can be framed into the space the text leaves free.
 */
function measureInto(engine: Engine) {
  let textEdge = 0
  const anchors = Array.from(document.querySelectorAll<HTMLElement>('[data-station]')).map((el) => {
    const r = el.getBoundingClientRect()
    textEdge = Math.max(textEdge, r.right)
    return { id: el.dataset.station ?? '', top: r.top + window.scrollY, height: r.height }
  })
  engine.setAnchors(anchors, document.documentElement.scrollHeight, textEdge)
  engine.setScroll(window.scrollY)
}

/**
 * The planet behind every page. Mounted once in the root layout, so it
 * survives client-side navigation and each route change becomes a camera
 * move rather than a reload. The page is server-rendered and complete
 * without it: this only adds the canvas, and only after hydration, from a
 * separate chunk.
 */
export default function World({ labels }: { labels: WorldLabels }) {
  const host = useRef<HTMLDivElement>(null)
  const placeRef = useRef<HTMLDivElement>(null)
  const placeTextRef = useRef<HTMLSpanElement>(null)
  const captionRefs = useRef<Partial<Record<CaptionKey, HTMLElement>>>({})
  const tokenRefs = useRef<HTMLElement[]>([])
  const engine = useRef<Engine | null>(null)
  const pathname = usePathname()
  const path = useRef(pathname)
  path.current = pathname
  // The engine is built once; it reads the label copy through a ref.
  const copy = useRef(labels)
  copy.current = labels

  useEffect(() => {
    let cancelled = false
    let frame = 0
    const root = document.documentElement
    const params = new URLSearchParams(location.search)
    const nav = navigator as Navigator & { connection?: { saveData?: boolean } }

    const fail = () => {
      root.setAttribute('data-intro', 'done')
      worldStore.set({ failed: true })
    }

    const measure = () => {
      cancelAnimationFrame(frame)
      frame = requestAnimationFrame(() => {
        const e = engine.current
        if (!e) return
        measureInto(e)
      })
    }
    const onScroll = () => engine.current?.setScroll(window.scrollY)
    const onResize = () => {
      engine.current?.resize()
      measure()
    }
    const observer = new ResizeObserver(measure)

    // Save-Data asks for less, and a 3D world is a lot: the CSS sky stays.
    if (nav.connection?.saveData) {
      fail()
      return
    }

    import('./engine/engine')
      .then(({ Engine }) => {
        if (cancelled || !host.current) return
        try {
          const debug = params.get('debug')
          engine.current = new Engine(host.current, {
            intro: root.getAttribute('data-intro') === 'play' ? 'full' : 'none',
            reducedMotion: matchMedia('(prefers-reduced-motion: reduce)').matches,
            route: path.current,
            labels: {
              place: placeRef.current,
              placeText: placeTextRef.current,
              names: copy.current.places,
              captions: captionRefs.current,
              tokens: tokenRefs.current.filter(Boolean),
            },
            quality: params.get('quality'),
            debug: debug === null ? null : debug === 'paused' ? 'paused' : 'on',
          })
        } catch {
          fail()
          return
        }
        ;(window as unknown as { __worldBooted: boolean }).__worldBooted = true
        setWorldControls({
          skip: () => engine.current?.skip(),
          replay: () => engine.current?.replay(),
          highlight: (i) => engine.current?.setHighlight(i),
        })
        window.addEventListener('scroll', onScroll, { passive: true })
        window.addEventListener('resize', onResize)
        observer.observe(document.body)
        measure()
      })
      .catch(fail)

    return () => {
      cancelled = true
      cancelAnimationFrame(frame)
      window.removeEventListener('scroll', onScroll)
      window.removeEventListener('resize', onResize)
      observer.disconnect()
      setWorldControls(null)
      engine.current?.dispose()
      engine.current = null
    }
  }, [])

  useEffect(() => {
    const e = engine.current
    if (!e) return
    e.setRoute(pathname)
    // The new page has rendered by now; its sections are where the camera
    // will be told to look.
    const id = requestAnimationFrame(() => measureInto(e))
    return () => cancelAnimationFrame(id)
  }, [pathname])

  // Every label starts invisible; the engine pins each one to its point in
  // the scene and fades it in when that point is on screen.
  return (
    <>
      <div ref={host} className="world" aria-hidden />
      <div aria-hidden className="world-labels">
        <div ref={placeRef} className="world-label" style={{ opacity: 0 }}>
          <span className="world-label-tick" />
          <span ref={placeTextRef} className="world-label-text">
            {labels.places.istanbul} · 41.0°N 28.9°E
          </span>
        </div>
        {CAPTIONS.map((key) => (
          <div
            key={key}
            ref={(el) => {
              if (el) captionRefs.current[key] = el
            }}
            className={`world-label world-caption ${CENTRED.has(key) ? 'world-center' : ''}`}
            style={{ opacity: 0 }}
          >
            <span className="world-label-tick" />
            <span className="world-label-text">{labels.captions[key]}</span>
          </div>
        ))}
        <div
          ref={(el) => {
            if (el) captionRefs.current.answer = el
          }}
          className="world-label world-answer world-center"
          style={{ opacity: 0 }}
        >
          <span className="world-label-tick" />
          <span className="world-label-text">→ {labels.answer}</span>
        </div>
        {labels.prompt.map((word, i) => (
          <div
            key={`${word}-${i}`}
            ref={(el) => {
              if (el) tokenRefs.current[i] = el
            }}
            className="world-token"
            style={{ opacity: 0 }}
          >
            <span>{word}</span>
          </div>
        ))}
      </div>
    </>
  )
}
