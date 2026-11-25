'use client'

import { createContext, useContext, useRef, useState, type ReactNode } from 'react'
import { motionValue, type MotionValue } from 'framer-motion'

const FigureProgress = createContext<MotionValue<number> | null>(null)

export function useFigureProgress(): MotionValue<number> {
  const value = useContext(FigureProgress)
  if (!value) {
    throw new Error('useFigureProgress must be used inside <ScrollFigure>')
  }
  return value
}

/**
 * Figure wrapper. Hands its child figure primitives a progress value fixed
 * at 1, so every figure renders in its final state.
 */
export default function ScrollFigure({
  n,
  caption,
  lang = 'en',
  width = 'wide',
  children,
}: {
  n?: number
  caption: string
  lang?: 'en' | 'tr'
  width?: 'reading' | 'wide' | 'bleed'
  children: ReactNode
}) {
  const dialogRef = useRef<HTMLDialogElement>(null)
  const [zoom, setZoom] = useState(1)
  const staticProgress = useRef(motionValue(1)).current

  const copy = lang === 'tr'
    ? { figure: 'şekil', open: 'büyüt', close: 'kapat', zoomOut: 'uzaklaştır', zoomIn: 'yakınlaştır', view: 'şeklin büyütülmüş görünümü' }
    : { figure: 'fig', open: 'expand', close: 'close', zoomOut: 'zoom out', zoomIn: 'zoom in', view: 'expanded figure view' }

  const openDialog = () => {
    setZoom(1)
    dialogRef.current?.showModal()
  }

  const changeZoom = (amount: number) => {
    setZoom((current) => Math.min(2, Math.max(0.75, current + amount)))
  }

  const widths = {
    reading: 'max-w-[660px]',
    wide: 'w-full',
    bleed: 'w-full lg:w-[calc(100%+252px)]',
  }

  return (
    <figure className={`relative my-16 ${widths[width]}`}>
      <div className="border-y border-border py-6 md:py-8">
        <FigureProgress.Provider value={staticProgress}>
          {children}
        </FigureProgress.Provider>
      </div>
      <div className="mt-3 flex items-start justify-between gap-5 font-mono text-meta">
        <figcaption className="max-w-3xl text-muted">
          {n !== undefined && <span className="text-sky">{copy.figure} {n}</span>}
          {n !== undefined && ' · '}
          {caption}
        </figcaption>
        <button
          type="button"
          onClick={openDialog}
          className="u-link shrink-0 text-tick text-muted hover:text-heading"
          aria-label={`${copy.open}${n !== undefined ? `, ${copy.figure} ${n}` : ''}`}
        >
          {copy.open}
        </button>
      </div>
      <dialog
        ref={dialogRef}
        className="figure-dialog m-auto h-[94vh] w-[96vw] max-w-7xl overflow-hidden rounded-lg border border-border bg-background p-0 text-foreground"
        aria-label={copy.view}
        onClose={() => setZoom(1)}
        onMouseDown={(event) => {
          if (event.target === event.currentTarget) event.currentTarget.close()
        }}
      >
        <div className="flex h-full min-h-0 flex-col">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border bg-surface px-4 py-3">
            <p className="m-0 font-mono text-meta text-muted">
              {n !== undefined && <span className="text-sky">{copy.figure} {n} · </span>}
              {caption}
            </p>
            <div className="ml-auto flex shrink-0 items-center gap-2 font-mono text-meta">
              <button
                type="button"
                onClick={() => changeZoom(-0.25)}
                disabled={zoom <= 0.75}
                className="h-8 w-8 rounded border border-border text-muted hover:text-heading disabled:cursor-not-allowed disabled:opacity-30"
                aria-label={copy.zoomOut}
              >
                −
              </button>
              <output className="w-12 text-center text-muted" aria-live="polite">{Math.round(zoom * 100)}%</output>
              <button
                type="button"
                onClick={() => changeZoom(0.25)}
                disabled={zoom >= 2}
                className="h-8 w-8 rounded border border-border text-muted hover:text-heading disabled:cursor-not-allowed disabled:opacity-30"
                aria-label={copy.zoomIn}
              >
                +
              </button>
              <button
                type="button"
                onClick={() => dialogRef.current?.close()}
                className="ml-2 rounded border border-border px-3 py-1.5 text-muted hover:border-muted-dark hover:text-heading"
              >
                {copy.close}
              </button>
            </div>
          </div>
          <div className="min-h-0 flex-1 overflow-auto p-4 md:p-8">
            <div className="mx-auto origin-top" style={{ width: `${zoom * 100}%` }}>
              <FigureProgress.Provider value={staticProgress}>
                {children}
              </FigureProgress.Provider>
            </div>
          </div>
        </div>
      </dialog>
    </figure>
  )
}
