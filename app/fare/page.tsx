'use client'

import { memo, useCallback, useEffect, useMemo, useRef, useState } from 'react'

const WORLD_W = 400
const WORLD_H = 1500
const CITY_BASE = 760
const COUPLE_CENTER = { x: 210, y: CITY_BASE + 30, r: 50 }

const C = {
  skyTop: '#f7dcc0',
  skyMid: '#efbe84',
  skyBottom: '#d9864d',
  sunCore: '#ffe7a6',
  sunHalo: '#ffd573',
  sunRim: '#ffbc61',
  cloud: 'rgba(255,243,224,0.78)',

  hillFar: '#c09f7e',
  hillMid: '#a68363',
  hillNear: '#88694f',

  wallA: '#9d8363',
  wallB: '#ad906c',
  wallC: '#bea079',
  sideA: '#7e664b',
  sideB: '#8c7256',
  sideC: '#9a7d5f',

  roofFront: '#b34a36',
  roofSide: '#8f3125',
  roofTop: '#cc624a',
  trim: '#d8c39f',

  windowFrame: '#ba8628',
  windowLit: '#f2cf88',
  windowGlow: '#ffd778',

  streetTop: '#7a7160',
  streetBottom: '#655d4f',
  waterTop: '#3f7e6a',
  waterBottom: '#2e5f52',
  waterGlow: '#9fd9a9',

  treeDark: '#3f4a35',
  treeMid: '#526343',
  treeLight: '#647b50',

  skinLight: '#f4d5bf',
  hairDarkBrown: '#4a2d22',

  textMain: '#fff7ea',
  textSub: '#f4dfbf',
  textAccent: '#ffe07e',

  heartPink: '#f28da7',
  heartRed: '#e36b79',

  shadow: 'rgba(30,24,18,0.35)',
  shadowSoft: 'rgba(30,24,18,0.22)',
  silhouette: '#273026',
}

type RoofType = 'gable' | 'tower' | 'flat'
type DetailType = 'clock' | 'cafe' | 'cathedral' | 'balcony' | 'tower'

interface Building {
  x: number
  w: number
  h: number
  depth: number
  roof: RoofType
  tone: 0 | 1 | 2
  windows: { cols: number; rows: number }
  detail: DetailType
}

interface Vec2 {
  x: number
  y: number
}

interface TapHeart {
  id: number
  x: number
  y: number
  sx: number
  sy: number
  size: number
  dx: number
  rise: number
  dur: number
  color: string
  born: number
}

interface FireworkBurst {
  id: number
  x: number
  y: number
  dur: number
  color: string
  born: number
}

const LOVE_LINES = [
  'Bitanecik sevgiliiiiim',
  'İyi ki doğdun aşkım benim',
  'İyi ki varsın',
  'İyi ki benim sevgilimsin',
  'Nice mutlu yıllara baltanem benim ❤️❤️❤️❤️❤️',
]

const BUILDINGS: Building[] = [
  { x: 18, w: 60, h: 226, depth: 20, roof: 'tower', tone: 0, windows: { cols: 2, rows: 4 }, detail: 'clock' },
  { x: 86, w: 74, h: 176, depth: 22, roof: 'gable', tone: 1, windows: { cols: 3, rows: 3 }, detail: 'cafe' },
  { x: 166, w: 62, h: 150, depth: 18, roof: 'flat', tone: 2, windows: { cols: 2, rows: 2 }, detail: 'cathedral' },
  { x: 236, w: 92, h: 194, depth: 25, roof: 'gable', tone: 1, windows: { cols: 3, rows: 3 }, detail: 'balcony' },
  { x: 326, w: 46, h: 218, depth: 18, roof: 'tower', tone: 0, windows: { cols: 1, rows: 4 }, detail: 'tower' },
]

const CLOUDS = [
  { x: -38, y: 148, s: 0.88, d: 78 },
  { x: 78, y: 114, s: 0.72, d: 92 },
  { x: 188, y: 134, s: 0.84, d: 88 },
  { x: 302, y: 120, s: 0.68, d: 94 },
]

const NOTE_FREQ: Record<string, number> = {
  C4: 261.63,
  D4: 293.66,
  E4: 329.63,
  F4: 349.23,
  G4: 392.0,
  A4: 440.0,
  B4: 493.88,
  C5: 523.25,
  D5: 587.33,
  E5: 659.25,
  F5: 698.46,
  G5: 783.99,
}

const HAPPY_BDAY: Array<{ note: string | null; beats: number }> = [
  { note: 'G4', beats: 0.8 },
  { note: 'G4', beats: 0.45 },
  { note: 'A4', beats: 1.2 },
  { note: 'G4', beats: 1.2 },
  { note: 'C5', beats: 1.2 },
  { note: 'B4', beats: 2 },

  { note: 'G4', beats: 0.8 },
  { note: 'G4', beats: 0.45 },
  { note: 'A4', beats: 1.2 },
  { note: 'G4', beats: 1.2 },
  { note: 'D5', beats: 1.2 },
  { note: 'C5', beats: 2 },

  { note: 'G4', beats: 0.8 },
  { note: 'G4', beats: 0.45 },
  { note: 'G5', beats: 1.2 },
  { note: 'E5', beats: 1.2 },
  { note: 'C5', beats: 1.2 },
  { note: 'B4', beats: 1.2 },
  { note: 'A4', beats: 2 },

  { note: 'F5', beats: 0.8 },
  { note: 'F5', beats: 0.45 },
  { note: 'E5', beats: 1.2 },
  { note: 'C5', beats: 1.2 },
  { note: 'D5', beats: 1.2 },
  { note: 'C5', beats: 2.1 },
]

function clamp(v: number, min: number, max: number) {
  return Math.min(max, Math.max(min, v))
}

function seededRandom(seed: number) {
  let s = seed
  return () => {
    s = (s * 1664525 + 1013904223) >>> 0
    return s / 4294967295
  }
}

class BirthdayMusicEngine {
  private ctx: AudioContext | null = null
  private running = false
  private timer: number | null = null
  private readonly beatSec = 0.34

  private getCtx() {
    if (!this.ctx) {
      const AC = window.AudioContext || (window as Window & { webkitAudioContext?: typeof AudioContext }).webkitAudioContext
      if (!AC) return null
      this.ctx = new AC()
    }

    if (this.ctx.state === 'suspended') {
      void this.ctx.resume()
    }

    return this.ctx
  }

  private playNoteAt(ctx: AudioContext, note: string, when: number, dur: number) {
    const freq = NOTE_FREQ[note]
    if (!freq) return

    const o1 = ctx.createOscillator()
    const o2 = ctx.createOscillator()
    const g = ctx.createGain()

    o1.type = 'triangle'
    o2.type = 'sine'
    o1.frequency.setValueAtTime(freq, when)
    o2.frequency.setValueAtTime(freq * 2, when)

    g.gain.setValueAtTime(0.0001, when)
    g.gain.exponentialRampToValueAtTime(0.08, when + 0.03)
    g.gain.exponentialRampToValueAtTime(0.0001, when + dur)

    o1.connect(g)
    o2.connect(g)
    g.connect(ctx.destination)

    o1.start(when)
    o2.start(when)
    o1.stop(when + dur)
    o2.stop(when + dur)
  }

  private playCycle() {
    if (!this.running) return
    const ctx = this.getCtx()
    if (!ctx) return

    let t = ctx.currentTime + 0.06
    for (const step of HAPPY_BDAY) {
      const d = step.beats * this.beatSec
      if (step.note) this.playNoteAt(ctx, step.note, t, d)
      t += d
    }

    const nextMs = Math.max(1200, (t - ctx.currentTime + 0.45) * 1000)
    this.timer = window.setTimeout(() => this.playCycle(), nextMs)
  }

  start() {
    if (this.running) return
    this.running = true
    this.playCycle()
  }

  stop() {
    this.running = false
    if (this.timer !== null) {
      clearTimeout(this.timer)
      this.timer = null
    }
    if (this.ctx && this.ctx.state === 'running') {
      void this.ctx.suspend()
    }
  }

  dispose() {
    this.stop()
    if (this.ctx) {
      void this.ctx.close()
      this.ctx = null
    }
  }
}

const Defs = memo(function Defs() {
  return (
    <defs>
      <linearGradient id="skyGrad" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stopColor={C.skyTop} />
        <stop offset="48%" stopColor={C.skyMid} />
        <stop offset="100%" stopColor={C.skyBottom} />
      </linearGradient>
      <radialGradient id="sunGrad" cx="50%" cy="50%" r="50%">
        <stop offset="0%" stopColor={C.sunCore} stopOpacity="1" />
        <stop offset="100%" stopColor={C.sunHalo} stopOpacity="0" />
      </radialGradient>
      <linearGradient id="streetGrad" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stopColor={C.streetTop} />
        <stop offset="100%" stopColor={C.streetBottom} />
      </linearGradient>
      <linearGradient id="waterGrad" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stopColor={C.waterTop} />
        <stop offset="100%" stopColor={C.waterBottom} />
      </linearGradient>
      <linearGradient id="hazeGrad" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stopColor={C.skyTop} stopOpacity="0" />
        <stop offset="100%" stopColor={C.skyTop} stopOpacity="0.42" />
      </linearGradient>
      <linearGradient id="skinGrad" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stopColor="#fde9d8" />
        <stop offset="100%" stopColor="#eec4ab" />
      </linearGradient>
      <linearGradient id="hairGrad" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stopColor="#5b382c" />
        <stop offset="100%" stopColor="#3d241b" />
      </linearGradient>
      <linearGradient id="dressGrad" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stopColor="#cc5e74" />
        <stop offset="100%" stopColor="#b14d64" />
      </linearGradient>
      <linearGradient id="jacketGrad" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stopColor="#5a8cba" />
        <stop offset="100%" stopColor="#3b6486" />
      </linearGradient>
      <filter id="glow">
        <feGaussianBlur stdDeviation="2.2" result="b" />
        <feMerge>
          <feMergeNode in="b" />
          <feMergeNode in="SourceGraphic" />
        </feMerge>
      </filter>
      <filter id="softBlur">
        <feGaussianBlur stdDeviation="1.7" />
      </filter>
      <filter id="waterBlur">
        <feGaussianBlur stdDeviation="2.3" />
      </filter>
    </defs>
  )
})

const FloatingMusicNotes = memo(function FloatingMusicNotes({ seed, count, yMin, yMax }: { seed: number; count: number; yMin: number; yMax: number }) {
  const notes = useMemo(() => {
    const rand = seededRandom(seed)
    return Array.from({ length: count }, () => ({
      x: 22 + rand() * 356,
      y: yMin + rand() * (yMax - yMin),
      size: 10 + rand() * 10,
      d: 6 + rand() * 7,
      dl: rand() * 8,
      drift: (rand() - 0.5) * 22,
      glyph: rand() > 0.5 ? '♪' : '♫',
    }))
  }, [seed, count, yMin, yMax])

  return (
    <g>
      {notes.map((n, i) => (
        <text key={`n-${i}`} x={n.x} y={n.y} fill={C.textMain} opacity="0" fontSize={n.size} fontFamily="Georgia, serif">
          <animate attributeName="opacity" values="0;0.45;0" dur={`${n.d}s`} begin={`${n.dl}s`} repeatCount="indefinite" />
          <animate attributeName="y" values={`${n.y};${n.y - 26};${n.y - 40}`} dur={`${n.d}s`} begin={`${n.dl}s`} repeatCount="indefinite" />
          <animate attributeName="x" values={`${n.x};${n.x + n.drift};${n.x + n.drift * 1.2}`} dur={`${n.d}s`} begin={`${n.dl}s`} repeatCount="indefinite" />
          {n.glyph}
        </text>
      ))}
    </g>
  )
})

const SkyLayer = memo(function SkyLayer() {
  const stars = useMemo(() => {
    const rand = seededRandom(7)
    return Array.from({ length: 46 }, () => ({
      x: rand() * WORLD_W,
      y: 30 + rand() * 230,
      r: 0.6 + rand() * 1.3,
      d: 2 + rand() * 3,
      dl: rand() * 5,
    }))
  }, [])

  return (
    <g>
      <rect x="0" y="0" width={WORLD_W} height={WORLD_H} fill="url(#skyGrad)" />

      <circle cx="204" cy="250" r="126" fill="url(#sunGrad)" opacity="0.7" />
      <circle cx="204" cy="250" r="46" fill={C.sunCore} opacity="0.9" filter="url(#glow)">
        <animate attributeName="r" values="46;49;46" dur="8s" repeatCount="indefinite" />
      </circle>
      <circle cx="204" cy="250" r="58" fill="none" stroke={C.sunRim} strokeOpacity="0.28" strokeWidth="2" />

      {stars.map((s, i) => (
        <circle key={`st-${i}`} cx={s.x} cy={s.y} r={s.r} fill="#fff6df" opacity="0.3">
          <animate attributeName="opacity" values="0.1;0.46;0.1" dur={`${s.d}s`} begin={`${s.dl}s`} repeatCount="indefinite" />
        </circle>
      ))}

      {CLOUDS.map((c, i) => (
        <g key={`cl-${i}`} transform={`scale(${c.s})`} opacity="0.76">
          <g>
            <animateTransform attributeName="transform" type="translate" values={`${c.x},${c.y};${c.x + 520},${c.y}`} dur={`${c.d}s`} repeatCount="indefinite" />
            <rect x="0" y="9" width="8" height="6" fill={C.cloud} rx="2" />
            <rect x="7" y="4" width="11" height="11" fill={C.cloud} rx="3" />
            <rect x="16" y="0" width="15" height="15" fill={C.cloud} rx="4" />
            <rect x="29" y="4" width="11" height="10" fill={C.cloud} rx="3" />
            <rect x="39" y="8" width="8" height="6" fill={C.cloud} rx="2" />
          </g>
        </g>
      ))}

      <g opacity="0.45">
        {[{ x: 44, y: 314, d: 20, dl: 0 }, { x: 58, y: 324, d: 19, dl: 0.4 }, { x: 256, y: 286, d: 23, dl: 4 }, { x: 270, y: 295, d: 24, dl: 4.2 }].map((b, i) => (
          <g key={`bird-${i}`}>
            <polyline points="-3,0 0,-2 3,0" fill="none" stroke="#6d5038" strokeWidth="1.2" strokeLinecap="round">
              <animate attributeName="points" values="-3,0 0,-2 3,0;-3,-1 0,0 3,-1;-3,0 0,-2 3,0" dur="0.82s" repeatCount="indefinite" />
            </polyline>
            <animateTransform attributeName="transform" type="translate" values={`${b.x},${b.y};${b.x + 165},${b.y - 14}`} dur={`${b.d}s`} begin={`${b.dl}s`} repeatCount="indefinite" />
          </g>
        ))}
      </g>

      <FloatingMusicNotes seed={33} count={12} yMin={120} yMax={460} />
    </g>
  )
})

const HillsLayer = memo(function HillsLayer() {
  return (
    <g>
      <path d="M-20,430 Q34,382 86,412 Q136,376 188,404 Q238,370 286,398 Q334,362 420,398 L420,490 L-20,490 Z" fill={C.hillFar} opacity="0.52" />
      <path d="M-20,486 Q40,444 98,468 Q156,432 214,456 Q272,424 328,448 Q368,434 420,452 L420,550 L-20,550 Z" fill={C.hillMid} opacity="0.68" />
      <path d="M-20,546 Q52,504 118,530 Q184,496 248,522 Q312,492 372,514 Q396,506 420,516 L420,600 L-20,600 Z" fill={C.hillNear} opacity="0.84" />

      <g opacity="0.24">
        {[10, 25, 44, 62, 84, 106, 128, 150, 172, 194, 220, 246, 270, 294, 320, 344, 366, 388].map((x, i) => (
          <g key={`tree-s-${x}`}>
            <rect x={x} y={508 + Math.sin(i * 0.7) * 10} width="2" height="13" fill={C.treeDark} />
            <circle cx={x + 1} cy={504 + Math.sin(i * 0.7) * 10} r="5" fill={i % 2 ? C.treeMid : C.treeLight} />
          </g>
        ))}
      </g>

      <rect x="0" y="500" width={WORLD_W} height="120" fill="url(#hazeGrad)" />
    </g>
  )
})

function Building3D({ b, index }: { b: Building; index: number }) {
  const front = [C.wallA, C.wallB, C.wallC][b.tone]
  const side = [C.sideA, C.sideB, C.sideC][b.tone]
  const top = C.trim
  const roofY = CITY_BASE - b.h
  const dx = b.depth
  const dy = b.depth * 0.56

  const winW = Math.max(7, (b.w - 14) / b.windows.cols - 4)
  const winH = Math.max(13, (b.h - 56) / b.windows.rows - 4)
  const xStep = (b.w - 14) / b.windows.cols
  const yStep = (b.h - 48) / b.windows.rows

  const detail = (() => {
    if (b.detail === 'clock') {
      return (
        <g>
          <circle cx={b.x + b.w / 2} cy={roofY + 34} r="11" fill={C.trim} opacity="0.6" />
          <circle cx={b.x + b.w / 2} cy={roofY + 34} r="8.6" fill="none" stroke={C.windowFrame} strokeWidth="1" opacity="0.45" />
          <line x1={b.x + b.w / 2} y1={roofY + 34} x2={b.x + b.w / 2} y2={roofY + 29} stroke={C.sideA} strokeWidth="0.9" />
          <line x1={b.x + b.w / 2} y1={roofY + 34} x2={b.x + b.w / 2 + 3.3} y2={roofY + 35.5} stroke={C.sideA} strokeWidth="0.9" />
        </g>
      )
    }

    if (b.detail === 'cafe') {
      return (
        <g>
          <polygon points={`${b.x + 4},${CITY_BASE - 24} ${b.x + b.w - 4},${CITY_BASE - 24} ${b.x + b.w - 6},${CITY_BASE - 32} ${b.x + 6},${CITY_BASE - 32}`} fill={C.roofFront} opacity="0.82" />
          <rect x={b.x + 10} y={CITY_BASE - 18} width="10" height="2" fill={C.trim} />
          <rect x={b.x + b.w - 20} y={CITY_BASE - 18} width="10" height="2" fill={C.trim} />
        </g>
      )
    }

    if (b.detail === 'cathedral') {
      return (
        <g>
          <circle cx={b.x + b.w / 2} cy={roofY + 44} r="9" fill="#c89d52" opacity="0.7" />
          <circle cx={b.x + b.w / 2} cy={roofY + 44} r="5.5" fill={C.windowLit} opacity="0.58" />
          <rect x={b.x + b.w / 2 - 6} y={CITY_BASE - 30} width="12" height="30" fill={side} rx="2" />
          <rect x={b.x + b.w / 2 - 4} y={CITY_BASE - 27} width="8" height="10" fill={C.windowLit} opacity="0.38" />
        </g>
      )
    }

    if (b.detail === 'balcony') {
      return (
        <g>
          <rect x={b.x + b.w * 0.42} y={CITY_BASE - 74} width="20" height="3" fill={C.trim} />
          <rect x={b.x + b.w * 0.44} y={CITY_BASE - 77} width="16" height="16" fill={C.sideA} />
          <rect x={b.x + b.w * 0.45} y={CITY_BASE - 76} width="14" height="13" fill={C.windowLit} opacity="0.5" />
          <rect x={b.x + b.w * 0.44} y={CITY_BASE - 71} width="4" height="4" fill="#b34d67" rx="1" />
          <rect x={b.x + b.w * 0.52} y={CITY_BASE - 72} width="4" height="5" fill="#58744e" rx="1" />
        </g>
      )
    }

    return (
      <g>
        <rect x={b.x + b.w / 2 - 1} y={roofY - 46} width="2" height="11" fill={side} />
        <polygon points={`${b.x + b.w / 2 + 1},${roofY - 46} ${b.x + b.w / 2 + 11},${roofY - 41} ${b.x + b.w / 2 + 1},${roofY - 36}`} fill={C.roofTop} />
      </g>
    )
  })()

  return (
    <g>
      <polygon points={`${b.x},${CITY_BASE} ${b.x + b.w},${CITY_BASE} ${b.x + b.w + dx * 1.8},${CITY_BASE + 30} ${b.x + dx * 0.8},${CITY_BASE + 30}`} fill={C.shadowSoft} />

      <polygon points={`${b.x + b.w},${roofY} ${b.x + b.w + dx},${roofY - dy} ${b.x + b.w + dx},${CITY_BASE - dy} ${b.x + b.w},${CITY_BASE}`} fill={side} />
      <polygon points={`${b.x},${roofY} ${b.x + b.w},${roofY} ${b.x + b.w + dx},${roofY - dy} ${b.x + dx},${roofY - dy}`} fill={top} opacity="0.66" />

      <rect x={b.x} y={roofY} width={b.w} height={b.h} fill={front} />
      <rect x={b.x} y={roofY} width={b.w} height="4" fill={C.trim} opacity="0.72" />

      {b.roof === 'gable' && (
        <g>
          <polygon points={`${b.x - 2},${roofY} ${b.x + b.w / 2},${roofY - 34} ${b.x + b.w + 2},${roofY}`} fill={C.roofFront} />
          <polygon points={`${b.x + b.w},${roofY} ${b.x + b.w + dx},${roofY - dy} ${b.x + b.w / 2 + dx},${roofY - 34 - dy} ${b.x + b.w / 2},${roofY - 34}`} fill={C.roofSide} />
        </g>
      )}

      {b.roof === 'tower' && (
        <g>
          <polygon points={`${b.x - 1},${roofY} ${b.x + b.w / 2},${roofY - 38} ${b.x + b.w + 1},${roofY}`} fill={C.roofFront} />
          <polygon points={`${b.x + b.w / 2},${roofY - 38} ${b.x + b.w / 2 + dx},${roofY - 38 - dy} ${b.x + b.w + dx},${roofY - dy} ${b.x + b.w},${roofY}`} fill={C.roofSide} />
        </g>
      )}

      {b.roof === 'flat' && (
        <g>
          <rect x={b.x - 1} y={roofY - 8} width={b.w + 2} height="8" fill={C.trim} />
          <polygon points={`${b.x + b.w + 1},${roofY - 8} ${b.x + b.w + dx + 1},${roofY - 8 - dy} ${b.x + b.w + dx + 1},${roofY - dy} ${b.x + b.w + 1},${roofY}`} fill={side} />
        </g>
      )}

      {Array.from({ length: b.windows.rows }).map((_, row) =>
        Array.from({ length: b.windows.cols }).map((__, col) => {
          const wx = b.x + 7 + col * xStep
          const wy = roofY + 18 + row * yStep
          const flicker = 2.3 + ((index + row + col) % 4) * 0.4
          return (
            <g key={`w-${index}-${row}-${col}`}>
              <rect x={wx} y={wy} width={winW} height={winH} fill={C.windowFrame} />
              <rect x={wx + 1.1} y={wy + 1.1} width={winW - 2.2} height={winH - 2.2} fill={C.windowLit}>
                <animate attributeName="opacity" values="0.62;0.96;0.62" dur={`${flicker}s`} repeatCount="indefinite" />
              </rect>
            </g>
          )
        }),
      )}

      {detail}
    </g>
  )
}

const CityDecor = memo(function CityDecor() {
  return (
    <g>
      <line x1="16" y1="560" x2="380" y2="574" stroke="#f4d7b3" strokeWidth="0.7" opacity="0.35" />

      <g opacity="0.58">
        {[30, 46, 62, 78, 94, 110].map((x, i) => (
          <circle key={`light-l-${x}`} cx={x} cy="736" r="1.4" fill={C.windowGlow}>
            <animate attributeName="opacity" values="0.4;0.9;0.4" dur={`${2 + i * 0.2}s`} repeatCount="indefinite" />
          </circle>
        ))}
        <line x1="28" y1="736" x2="112" y2="736" stroke={C.windowGlow} strokeWidth="0.4" opacity="0.5" />
      </g>

      <g opacity="0.62">
        <ellipse cx="200" cy="766" rx="13" ry="4.5" fill="#7bb08b" opacity="0.35" />
        <rect x="197" y="754" width="6" height="12" fill={C.sideB} />
        <ellipse cx="200" cy="754" rx="10" ry="4" fill={C.trim} opacity="0.7" />
        <circle cx="196" cy="750" r="1" fill="#9fd9c9" opacity="0">
          <animate attributeName="opacity" values="0;0.7;0" dur="2s" repeatCount="indefinite" />
          <animate attributeName="cy" values="750;757" dur="2s" repeatCount="indefinite" />
        </circle>
        <circle cx="204" cy="749" r="1" fill="#9fd9c9" opacity="0">
          <animate attributeName="opacity" values="0;0.7;0" dur="2.4s" begin="0.3s" repeatCount="indefinite" />
          <animate attributeName="cy" values="749;757" dur="2.4s" begin="0.3s" repeatCount="indefinite" />
        </circle>
      </g>

      <g opacity="0.45">
        {[248, 270, 292].map((x, i) => (
          <g key={`bal-fl-${x}`}>
            <rect x={x} y="688" width="10" height="2" fill={C.trim} />
            <rect x={x + 1} y="686" width="3" height="3" fill="#cf6d8c" rx="1" />
            <rect x={x + 5} y="685" width="3" height="4" fill="#5a7a4e" rx="1" />
            <circle cx={x + 7.5} cy={683.6} r="0.7" fill="#ffcf78" opacity="0.4">
              <animate attributeName="opacity" values="0.2;0.55;0.2" dur={`${2.2 + i * 0.3}s`} repeatCount="indefinite" />
            </circle>
          </g>
        ))}
      </g>
    </g>
  )
})

const Promenade = memo(function Promenade() {
  const cobbles = useMemo(() => {
    return Array.from({ length: 60 }, (_, i) => ({
      x: (i % 10) * 40 + 4 + (Math.floor(i / 10) % 2) * 8,
      y: CITY_BASE + 18 + Math.floor(i / 10) * 6,
    }))
  }, [])

  return (
    <g>
      <rect x="0" y={CITY_BASE - 4} width={WORLD_W} height="18" fill={C.trim} opacity="0.4" />
      <rect x="0" y={CITY_BASE + 14} width={WORLD_W} height="72" fill="url(#streetGrad)" />

      <g opacity="0.16">
        {Array.from({ length: 26 }).map((_, i) => (
          <line key={`pers-${i}`} x1={i * 16 - 40} y1={CITY_BASE + 88} x2={200 + (i - 13) * 4} y2={CITY_BASE + 14} stroke="#f0dcc0" strokeWidth="0.9" />
        ))}
      </g>

      <g opacity="0.28">
        {cobbles.map((c, i) => (
          <rect key={`cb-${i}`} x={c.x} y={c.y} width="12" height="2" fill="#9c8f7b" rx="0.5" />
        ))}
      </g>

      {[42, 118, 196, 274, 348].map((x, i) => (
        <g key={`lamp-${x}`}>
          <rect x={x} y={CITY_BASE - 2} width="2" height="34" fill={C.sideA} />
          <rect x={x - 2} y={CITY_BASE - 4} width="6" height="2" fill={C.sideA} rx="1" />
          <circle cx={x + 1} cy={CITY_BASE - 6} r="3" fill={C.windowGlow} opacity="0.42" filter="url(#glow)">
            <animate attributeName="opacity" values="0.28;0.6;0.28" dur={`${3 + i * 0.35}s`} repeatCount="indefinite" />
          </circle>
        </g>
      ))}

      <g>
        <rect x="154" y={CITY_BASE + 18} width="17" height="2" fill={C.trim} />
        <rect x="161" y={CITY_BASE + 20} width="2" height="11" fill={C.sideB} />
        <circle cx="149" cy={CITY_BASE + 32} r="4" fill="none" stroke={C.sideA} strokeWidth="1.3" />
        <circle cx="173" cy={CITY_BASE + 32} r="4" fill="none" stroke={C.sideA} strokeWidth="1.3" />
        <line x1="149" y1={CITY_BASE + 32} x2="161" y2={CITY_BASE + 20} stroke={C.sideA} strokeWidth="1" />
        <line x1="173" y1={CITY_BASE + 32} x2="161" y2={CITY_BASE + 20} stroke={C.sideA} strokeWidth="1" />
      </g>

      {[34, 98, 248, 314, 366].map((x, i) => (
        <g key={`tree-${x}`}>
          <rect x={x} y={CITY_BASE + 8} width="5" height="10" fill={C.sideB} />
          <circle cx={x + 2.5} cy={CITY_BASE + 4} r="6" fill={i % 2 ? C.treeLight : C.treeMid} opacity="0.7" />
          <circle cx={x + 5.2} cy={CITY_BASE + 2.3} r="3.8" fill={C.treeLight} opacity="0.52" />
        </g>
      ))}
    </g>
  )
})

const FeaturedCouple = memo(function FeaturedCouple({ kissPulse }: { kissPulse: number }) {
  return (
    <g>
      <ellipse cx={COUPLE_CENTER.x} cy={CITY_BASE + 42} rx="28" ry="5" fill={C.shadow} opacity="0.65" />

      <g>
        <animateTransform attributeName="transform" type="translate" values="0,0;1.8,-1.2;0,0;-1.4,-0.7;0,0" dur="2.8s" repeatCount="indefinite" />
        <animateTransform attributeName="transform" type="rotate" values="-1.1 206 800;1.5 206 800;-1.1 206 800" dur="3.2s" repeatCount="indefinite" additive="sum" />

        {/* ===== BOY (right, x≈221) ===== */}
        <g>
          <animateTransform attributeName="transform" type="rotate" values="-0.8 221 800;1 221 800;-0.8 221 800" dur="2.6s" repeatCount="indefinite" additive="sum" />

          {/* Pants */}
          <path d="M217.5 797 L216.8 822 L220.2 822 L220.5 797 Z" fill="#334458" />
          <path d="M222 797 L221.5 822 L224.8 821.5 L225 797 Z" fill="#2a3a50" />
          {/* Shoes */}
          <g>
            <animateTransform attributeName="transform" type="translate" values="0,0;0.5,-0.4;0,0" dur="1.9s" repeatCount="indefinite" />
            <ellipse cx="218.8" cy="822.5" rx="3.3" ry="1.4" fill="#1f2f42" />
          </g>
          <g>
            <animateTransform attributeName="transform" type="translate" values="0,0;-0.5,-0.4;0,0" dur="2.1s" repeatCount="indefinite" />
            <ellipse cx="223.5" cy="822.5" rx="3.3" ry="1.4" fill="#1b293b" />
          </g>

          {/* Jacket body */}
          <path d="M214.5 768 C215.5 765 218 763.5 221 763.5 C224 763.5 226.5 765 227.5 768 L228 797 L214 797 Z" fill="url(#jacketGrad)" />
          {/* Shirt front */}
          <rect x="219" y="764" width="4" height="33" fill="#eee6d8" rx="0.5" />
          {/* Lapels */}
          <path d="M215 768.5 L219 773 L219 797 L214.5 797 Z" fill="#345a7a" opacity="0.9" />
          <path d="M223.5 768.5 L227 773 L227.5 797 L223.5 797 Z" fill="#345a7a" opacity="0.9" />
          {/* Buttons */}
          <circle cx="221" cy="772" r="0.4" fill="#d8cab6" />
          <circle cx="221" cy="776.5" r="0.4" fill="#d8cab6" />
          <circle cx="221" cy="781" r="0.4" fill="#d8cab6" />

          {/* Right arm (away from girl) */}
          <path d="M227 769 C229.5 772 230.5 778 229.5 785 C229 787 227.5 787.5 226.5 786 C227 781 227 775 226.5 770 Z" fill="#3a6283" />

          {/* Neck */}
          <rect x="219.5" y="758" width="3" height="5.5" rx="1.2" fill="url(#skinGrad)" />
          {/* Face */}
          <ellipse cx="221" cy="753.5" rx="5" ry="5.5" fill="url(#skinGrad)" />
          {/* Right ear */}
          <ellipse cx="225.8" cy="754" rx="0.85" ry="1.3" fill="url(#skinGrad)" opacity="0.9" />

          {/* Hair - messy tousled, full volume */}
          {/* Base hair mass covering top and sides */}
          <path d="M214.5 753 C214 749 215 746 217 744 C218.5 742.5 220 742 221 742 C222 742 223.5 742.5 225 744 C227 746 228 749 227.5 753 C227 751 225 749.5 221 749.5 C217 749.5 215 751 214.5 753 Z" fill={C.hairDarkBrown} />
          {/* Messy volume on top - soft wavy tufts */}
          <path d="M216.5 745 C216 743.5 216.5 742 218 741 C218.5 742 218.5 743.5 218 745 Z" fill={C.hairDarkBrown} />
          <path d="M219 744 C219 742 220 740.5 221.5 740 C222 741 221.5 743 220.5 744.5 Z" fill={C.hairDarkBrown} />
          <path d="M222.5 744 C223 742 224.5 741 225.5 741.5 C225.5 742.5 224.5 744 223.5 744.5 Z" fill={C.hairDarkBrown} />
          <path d="M225 745 C226 743 227.5 742.5 228 743 C227.5 744.5 226.5 746 225.5 746.5 Z" fill="#43281f" opacity="0.65" />
          {/* Left side volume - covers ear area */}
          <path d="M214.5 753 C213.5 751 213 749 213.5 747.5 C214 746 215 745 216 744.5 C215 746 214.5 749 214.5 753 Z" fill={C.hairDarkBrown} opacity="0.85" />
          <path d="M214.5 753 C214 755 214.5 756.5 215.5 757 C215.8 755.5 215.5 754 214.5 753 Z" fill={C.hairDarkBrown} opacity="0.6" />
          {/* Right side volume */}
          <path d="M227.5 753 C228.5 751 229 749 228.5 747.5 C228 746 227 745 226 744.5 C227 746 227.5 749 227.5 753 Z" fill="#43281f" opacity="0.7" />
          <path d="M227.5 753 C228 755 227.5 756.5 226.5 757 C226.2 755.5 226.5 754 227.5 753 Z" fill="#43281f" opacity="0.5" />
          {/* Texture strands */}
          <path d="M217 743 C217.5 741.5 219 741 220 742" fill="none" stroke="#5a3a2d" strokeWidth="0.5" strokeLinecap="round" opacity="0.4" />
          <path d="M223 741.5 C224 741 225.5 741.5 226 743" fill="none" stroke="#5a3a2d" strokeWidth="0.5" strokeLinecap="round" opacity="0.35" />

          {/* Eyebrows */}
          <path d="M218.5 752 L220 751.5" stroke="#3f271d" strokeWidth="0.6" strokeLinecap="round" />
          <path d="M222.5 751.5 L224 752" stroke="#3f271d" strokeWidth="0.6" strokeLinecap="round" />
          {/* Eyes */}
          <ellipse cx="219.5" cy="753.5" rx="0.65" ry="0.7" fill="#4f372d" />
          <ellipse cx="223" cy="753.5" rx="0.65" ry="0.7" fill="#4f372d" />
          {/* Nose */}
          <path d="M221 755 C220.6 755.5 220.6 756.1 221 756.5" stroke="#bb8678" strokeWidth="0.4" strokeLinecap="round" fill="none" />
          {/* Cheek blush */}
          <ellipse cx="219" cy="756.5" rx="0.8" ry="0.32" fill="#dd9a95" opacity="0.3" />
          <ellipse cx="223.5" cy="756.5" rx="0.8" ry="0.32" fill="#dd9a95" opacity="0.3" />
          {/* Mouth */}
          <path d="M219.5 758 C220.5 758.6 222 758.6 223 758" stroke="#5a3a2d" strokeWidth="0.5" strokeLinecap="round" fill="none" />
        </g>

        {/* ===== GIRL (left, x≈200) ===== */}
        <g>
          <animateTransform attributeName="transform" type="rotate" values="1 199 800;-1.2 199 800;1 199 800" dur="2.6s" repeatCount="indefinite" additive="sum" />

          {/* Back hair - curly volume on sides, flat on top */}
          <path d="M196 750 C196 747.5 198 746 200.5 746 C203 746 205 747.5 205 750 L205.5 755 C206 758 207 761 207 763 C206.5 765 205 766 203 766 L198 766 C196 766 194.5 765 194 763 C194 761 195 758 195.5 755 Z" fill="url(#hairGrad)" />

          {/* Legs */}
          <path d="M196.5 800 C196 808 196.5 816 197.5 822 L200.2 822 C199.2 816 199 808 199.5 800 Z" fill="#ead0b7" />
          <path d="M201.5 800 C201 808 201.5 816 203 822 L205.5 821.5 C204.5 816 204 808 204.5 800 Z" fill="#e3c8ae" />
          {/* Shoes */}
          <g>
            <animateTransform attributeName="transform" type="translate" values="0,0;0.5,-0.5;0,0" dur="1.85s" repeatCount="indefinite" />
            <ellipse cx="199" cy="822.5" rx="3" ry="1.3" fill="#384555" />
          </g>
          <g>
            <animateTransform attributeName="transform" type="translate" values="0,0;-0.4,-0.4;0,0" dur="2.2s" repeatCount="indefinite" />
            <ellipse cx="204.5" cy="822.5" rx="3" ry="1.3" fill="#344253" />
          </g>

          {/* Dress */}
          <path d="M192.5 768 C194 765 197 763.5 200.5 763.5 C204 763.5 207 765 208.5 768 L210 800 L191 800 Z" fill="url(#dressGrad)" />
          {/* Neckline */}
          <path d="M195 768 C197 766 199.5 765.5 200.5 765.5 C201.5 765.5 204 766 206 768 C203.5 770 198 770 195 768 Z" fill="#cf667b" opacity="0.5" />
          {/* Waist */}
          <path d="M193 776 L208 776" stroke="#8c3348" strokeWidth="0.85" opacity="0.4" />
          {/* Dress stripes */}
          <path d="M192.5 784 C196 785.5 204 785.5 208 784" stroke="#e59aae" strokeWidth="0.85" opacity="0.32" />
          <path d="M192 791 C195.5 792.5 204.5 792.5 208.5 791" stroke="#e89eb1" strokeWidth="0.75" opacity="0.22" />

          {/* Left arm (away from boy) */}
          <path d="M193 769 C190.5 772 189.5 778 190.5 785 C191 786.5 192.5 787 193.5 785.5 C193 781 193.2 775 193.5 770 Z" fill="#c85a6f" />

          {/* Neck */}
          <rect x="199" y="758" width="2.8" height="5.5" rx="1.2" fill="url(#skinGrad)" />
          {/* Face */}
          <ellipse cx="200.5" cy="753.5" rx="5.2" ry="5.8" fill="url(#skinGrad)" />
          {/* Left ear */}
          <ellipse cx="195.5" cy="754" rx="0.85" ry="1.3" fill="url(#skinGrad)" opacity="0.86" />

          {/* Hair - front/top, very thin just covering hairline */}
          <path d="M196.5 750 C197 748.5 198.5 747.5 200.5 747.5 C202.5 747.5 204 748.5 204.5 750 C203.5 749 202 748.5 200.5 748.5 C199 748.5 197.5 749 196.5 750 Z" fill={C.hairDarkBrown} opacity="0.8" />
          {/* Curly side strands - left, bouncy S-curve curls */}
          <path d="M195.5 751 C194 753 193.5 755 194.5 757 C193 758.5 192.5 761 193.5 763 C194 764.5 194.5 765.5 195 766" fill="none" stroke="#472b21" strokeWidth="2.5" strokeLinecap="round" opacity="0.7" />
          <path d="M195 752 C193.5 754 193.5 756.5 194.8 758 C193.5 759.5 193 762 194 764" fill="none" stroke="#5a3a2d" strokeWidth="1.5" strokeLinecap="round" opacity="0.4" />
          {/* Curl loops left */}
          <path d="M194.5 757 C195.5 756 195.5 754.5 194.2 754" fill="none" stroke="#5a3a2d" strokeWidth="0.8" strokeLinecap="round" opacity="0.45" />
          <path d="M193.5 763 C194.5 762 194.5 760.5 193.3 760" fill="none" stroke="#5a3a2d" strokeWidth="0.8" strokeLinecap="round" opacity="0.4" />
          {/* Curly side strands - right, bouncy S-curve curls */}
          <path d="M205.5 751 C207 753 207.5 755 206.5 757 C208 758.5 208.5 761 207.5 763 C207 764.5 206.5 765.5 206 766" fill="none" stroke="#472b21" strokeWidth="2.3" strokeLinecap="round" opacity="0.65" />
          <path d="M206 752 C207.5 754 207.5 756.5 206.2 758 C207.5 759.5 208 762 207 764" fill="none" stroke="#5a3a2d" strokeWidth="1.5" strokeLinecap="round" opacity="0.35" />
          {/* Curl loops right */}
          <path d="M206.5 757 C205.5 756 205.5 754.5 206.8 754" fill="none" stroke="#5a3a2d" strokeWidth="0.8" strokeLinecap="round" opacity="0.45" />
          <path d="M207.5 763 C206.5 762 206.5 760.5 207.7 760" fill="none" stroke="#5a3a2d" strokeWidth="0.8" strokeLinecap="round" opacity="0.4" />

          {/* Eyebrows - delicate arched */}
          <path d="M197.5 751.5 C198.2 751 199 750.8 199.8 751" stroke="#5a3a2d" strokeWidth="0.45" strokeLinecap="round" fill="none" />
          <path d="M201.7 751 C202.5 750.8 203.3 751 204 751.5" stroke="#5a3a2d" strokeWidth="0.45" strokeLinecap="round" fill="none" />
          {/* Eyes - larger with highlights */}
          <ellipse cx="199" cy="753.2" rx="0.9" ry="1" fill="#4d362c" />
          <ellipse cx="202.5" cy="753.2" rx="0.9" ry="1" fill="#4d362c" />
          {/* Eye highlights */}
          <ellipse cx="199.3" cy="752.8" rx="0.3" ry="0.35" fill="#fff" opacity="0.7" />
          <ellipse cx="202.8" cy="752.8" rx="0.3" ry="0.35" fill="#fff" opacity="0.7" />
          {/* Eyelashes */}
          <path d="M197.9 752.5 L197.5 752" stroke="#3f261d" strokeWidth="0.3" strokeLinecap="round" />
          <path d="M198.3 752.2 L198 751.6" stroke="#3f261d" strokeWidth="0.3" strokeLinecap="round" />
          <path d="M203.2 752.2 L203.5 751.6" stroke="#3f261d" strokeWidth="0.3" strokeLinecap="round" />
          <path d="M203.6 752.5 L204 752" stroke="#3f261d" strokeWidth="0.3" strokeLinecap="round" />
          {/* Nose - small cute */}
          <path d="M200.6 754.8 C200.3 755.2 200.3 755.7 200.6 756" stroke="#c09080" strokeWidth="0.35" strokeLinecap="round" fill="none" />
          {/* Cheek blush - rosier */}
          <ellipse cx="198" cy="756" rx="1.2" ry="0.5" fill="#e8918e" opacity="0.3" />
          <ellipse cx="203.5" cy="756" rx="1.2" ry="0.5" fill="#e8918e" opacity="0.3" />
          {/* Smile - wider, happier */}
          <path d="M198.8 757.5 C199.8 758.5 201.7 758.5 202.7 757.5" stroke="#b85a60" strokeWidth="0.5" strokeLinecap="round" fill="none" />
          {/* Lip color hint */}
          <path d="M199.5 757.8 C200.3 758.3 201.2 758.3 202 757.8" fill="#d4777e" opacity="0.25" />
        </g>

        {/* ===== HOLDING HANDS ===== */}
        {/* Girl's right arm reaching to boy */}
        <path d="M208 775 C209.5 778 210.5 781 211.5 784 L210 786 C209 783 207.5 780 206.5 777 Z" fill={C.skinLight} />
        {/* Boy's left arm reaching to girl */}
        <path d="M215 774 C213.5 777 212.5 780 211.5 783 L213 785.5 C214 783 215 780 216 776 Z" fill="#446f93" />
        {/* Clasped hands */}
        <ellipse cx="211.5" cy="785" rx="2.3" ry="1.7" fill="url(#skinGrad)" />
        <path d="M210 784.5 C210.5 785.5 212.5 785.5 213 784.5" stroke="#dfc0a8" strokeWidth="0.35" fill="none" />
      </g>

      <g>
        {[0, 1, 2, 3].map(i => (
          <text key={`dc-note-${i}`} x={183 + i * 11} y={748 - i * 10} fill={C.textMain} fontSize="8" opacity="0" fontFamily="Georgia, serif">
            <animate attributeName="opacity" values="0;0.6;0" dur={`${2.5 + i * 0.35}s`} begin={`${i * 0.45}s`} repeatCount="indefinite" />
            <animate attributeName="y" values={`${748 - i * 10};${740 - i * 10};${732 - i * 10}`} dur={`${2.5 + i * 0.35}s`} begin={`${i * 0.45}s`} repeatCount="indefinite" />
            {i % 2 ? '♪' : '♫'}
          </text>
        ))}
      </g>

      {kissPulse > 0 && (
        <g key={`kiss-pulse-${kissPulse}`}>
          <circle cx={COUPLE_CENTER.x} cy={COUPLE_CENTER.y - 15} r="10" fill={C.windowGlow} opacity="0.22">
            <animate attributeName="r" from="10" to="40" dur="0.85s" fill="freeze" />
            <animate attributeName="opacity" from="0.28" to="0" dur="0.85s" fill="freeze" />
          </circle>
          <text x={COUPLE_CENTER.x} y={COUPLE_CENTER.y - 40} textAnchor="middle" fill={C.textAccent} fontSize="14" fontFamily="Georgia, serif" opacity="0.9">
            <animate attributeName="opacity" values="0;1;0" dur="1.2s" fill="freeze" />
            <animate attributeName="y" values={`${COUPLE_CENTER.y - 26};${COUPLE_CENTER.y - 48}`} dur="1.2s" fill="freeze" />
            💋
          </text>
        </g>
      )}
    </g>
  )
})

const WaterLayer = memo(function WaterLayer() {
  return (
    <g>
      <rect x="0" y="860" width={WORLD_W} height={WORLD_H - 860} fill="url(#waterGrad)" />

      <ellipse cx="206" cy="900" rx="68" ry="126" fill={C.waterGlow} opacity="0.18" filter="url(#softBlur)" />

      <g opacity="0.14" filter="url(#waterBlur)">
        {BUILDINGS.map((b, i) => (
          <rect key={`r-${i}`} x={b.x + 2} y="864" width={b.w - 4} height={66 + i * 5} fill={C.wallC} />
        ))}
      </g>

      {Array.from({ length: 20 }).map((_, i) => (
        <path
          key={`wv-${i}`}
          d={`M-20,${880 + i * 28} Q30,${876 + i * 28} 74,${880 + i * 28} T166,${880 + i * 28} T258,${880 + i * 28} T350,${880 + i * 28} T430,${880 + i * 28}`}
          fill="none"
          stroke={i < 5 ? C.waterGlow : '#78a88e'}
          strokeWidth="1.4"
          opacity={0.34 - i * 0.013}
        >
          <animateTransform attributeName="transform" type="translate" values={`0,0;${i % 2 === 0 ? 13 : -13},0;0,0`} dur={`${4.6 + i * 0.55}s`} repeatCount="indefinite" />
        </path>
      ))}

      <g>
        <animateTransform attributeName="transform" type="translate" values="104,990;286,980;104,990" dur="36s" repeatCount="indefinite" />
        <polygon points="-9,4 -6,8 6,8 9,4" fill={C.sideA} />
        <polygon points="0,4 0,-10 8,2" fill="#f9f0dd" opacity="0.92" />
        <line x1="0" y1="-10" x2="0" y2="8" stroke={C.sideA} strokeWidth="1" />
      </g>
    </g>
  )
})

const ForegroundLayer = memo(function ForegroundLayer() {
  return (
    <g style={{ pointerEvents: 'none' }}>
      <rect x="0" y="840" width={WORLD_W} height="90" fill="rgba(24,21,19,0.26)" />

      <g opacity="0.3" filter="url(#softBlur)">
        <polygon points="0,860 58,860 104,942 0,942" fill={C.silhouette} />
        <polygon points="302,860 400,860 400,942 338,942" fill={C.silhouette} />
      </g>

      <g opacity="0.26">
        {[8, 16, 24, 32, 42, 348, 356, 364, 372, 382].map((x, i) => (
          <path key={`reed-${x}`} d={`M${x},940 Q${x + (i % 2 ? -9 : 9)},${892 - (i % 3) * 9} ${x + (i % 2 ? -4 : 4)},${860 - (i % 4) * 11}`} fill="none" stroke={C.silhouette} strokeWidth="3" strokeLinecap="round" />
        ))}
      </g>
    </g>
  )
})

const HeartsEffect = memo(function HeartsEffect({ hearts }: { hearts: TapHeart[] }) {
  return (
    <div style={{ position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 50, overflow: 'hidden' }}>
      {hearts.map(h => (
        <div
          key={h.id}
          style={{
            position: 'absolute',
            left: h.sx,
            top: h.sy,
            fontSize: h.size,
            lineHeight: 1,
            color: h.color,
            animation: `heartFloat ${h.dur}s ease-out forwards`,
            ['--dx' as string]: `${h.dx}px`,
            ['--rise' as string]: `${-h.rise}px`,
          }}
        >
          ❤️
        </div>
      ))}
      <style>{`
        @keyframes heartFloat {
          0% { opacity: 0; transform: translate(0, 0) scale(0.5); }
          10% { opacity: 1; transform: translate(0, 0) scale(1); }
          70% { opacity: 1; }
          100% { opacity: 0; transform: translate(var(--dx), var(--rise)) scale(0.3); }
        }
      `}</style>
    </div>
  )
})

const FireworksEffect = memo(function FireworksEffect({ fireworks }: { fireworks: FireworkBurst[] }) {
  return (
    <g style={{ pointerEvents: 'none' }}>
      {fireworks.map(f => (
        <g key={f.id}>
          <circle cx={f.x} cy={f.y} r="2" fill={f.color} opacity="0.9">
            <animate attributeName="r" from="2" to="34" dur={`${f.dur}s`} fill="freeze" />
            <animate attributeName="opacity" from="0.9" to="0" dur={`${f.dur}s`} fill="freeze" />
          </circle>
          {[0, 45, 90, 135, 180, 225, 270, 315].map((a, i) => {
            const rad = (a * Math.PI) / 180
            const px = Math.cos(rad) * 34
            const py = Math.sin(rad) * 34
            return (
              <rect key={`p-${f.id}-${i}`} x={f.x - 1.2} y={f.y - 1.2} width="2.4" height="2.4" rx="0.7" fill={i % 2 === 0 ? f.color : C.windowGlow}>
                <animateTransform attributeName="transform" type="translate" values={`0,0;${px},${py}`} dur={`${f.dur}s`} fill="freeze" />
                <animate attributeName="opacity" from="1" to="0" dur={`${f.dur}s`} fill="freeze" />
              </rect>
            )
          })}
        </g>
      ))}
    </g>
  )
})

const Atmosphere = memo(function Atmosphere() {
  return (
    <>
      <div className="absolute inset-0 pointer-events-none z-20" style={{ background: 'radial-gradient(ellipse at center, rgba(255,255,255,0) 32%, rgba(0,0,0,0.38) 100%)' }} />
      <div className="absolute inset-0 pointer-events-none z-20" style={{ background: 'linear-gradient(120deg, rgba(255,243,214,0.22) 0%, rgba(255,243,214,0.06) 44%, rgba(30,23,17,0.24) 100%)', mixBlendMode: 'soft-light' }} />
      <div className="absolute inset-0 pointer-events-none z-20" style={{ backgroundImage: 'repeating-linear-gradient(0deg, rgba(255,255,255,0.05) 0px, rgba(255,255,255,0.05) 1px, transparent 1px, transparent 3px)', opacity: 0.05 }} />
    </>
  )
})

function KissNotesOverlay({ lines, activeLine, pulseKey, done }: { lines: string[]; activeLine: string; pulseKey: number; done: boolean }) {
  return (
    <div
      className="absolute left-1/2 z-30 pointer-events-none"
      style={{ bottom: 'max(env(safe-area-inset-bottom, 0px), 16px)', transform: 'translateX(-50%)', width: 'min(92vw, 620px)' }}
    >
      <div
        style={{
          padding: '12px 14px',
          borderRadius: 14,
          background: 'rgba(34,28,24,0.62)',
          border: `1px solid ${done ? 'rgba(255,224,126,0.5)' : 'rgba(255,224,126,0.26)'}`,
          boxShadow: done ? '0 0 26px rgba(255,224,126,0.25)' : 'none',
          backdropFilter: 'blur(8px)',
          WebkitBackdropFilter: 'blur(8px)',
          maxHeight: '42vh',
          overflow: 'hidden',
        }}
      >
        {lines.length === 0 ? (
          <div
            style={{
              color: C.textSub,
              fontSize: 'clamp(0.78rem, 2.8vw, 0.95rem)',
              fontFamily: '"IBM Plex Mono", "SFMono-Regular", Menlo, monospace',
              textAlign: 'center',
              letterSpacing: '0.04em',
            }}
          >
            Çifte dokun • her öpücükte yeni bir not açılsın
          </div>
        ) : (
          <>
            <div
              key={`line-${pulseKey}`}
              style={{
                color: C.textMain,
                fontSize: 'clamp(0.95rem, 3.2vw, 1.25rem)',
                fontFamily: '"Cormorant Garamond", "Times New Roman", serif',
                textAlign: 'center',
                textShadow: '0 2px 10px rgba(0,0,0,0.35)',
                marginBottom: 8,
                animation: 'kissLineIn 560ms ease',
                lineHeight: 1.2,
              }}
            >
              {activeLine}
            </div>
            <div
              style={{
                color: C.textSub,
                fontSize: 'clamp(0.68rem, 2.2vw, 0.82rem)',
                fontFamily: '"IBM Plex Mono", "SFMono-Regular", Menlo, monospace',
                lineHeight: 1.45,
              }}
            >
              {lines.map((line, i) => (
                <div key={`saved-${i}`}>
                  {i + 1}. {line}
                </div>
              ))}
            </div>
          </>
        )}
      </div>
      <style>{`@keyframes kissLineIn {0%{opacity:0; transform:translateY(8px)}100%{opacity:1; transform:translateY(0)}}`}</style>
    </div>
  )
}

export default function FarePage() {
  const [viewportH, setViewportH] = useState(820)
  const [cameraY, setCameraY] = useState(150)
  const [parallax, setParallax] = useState<Vec2>({ x: 0, y: 0 })
  const [musicEnabled, setMusicEnabled] = useState(true)
  const [hasInteracted, setHasInteracted] = useState(false)

  const [kissCount, setKissCount] = useState(0)
  const [noteLines, setNoteLines] = useState<string[]>([])
  const [activeLine, setActiveLine] = useState('')
  const [linePulseKey, setLinePulseKey] = useState(0)
  const [kissPulse, setKissPulse] = useState(0)

  const [tapHearts, setTapHearts] = useState<TapHeart[]>([])
  const [fireworks, setFireworks] = useState<FireworkBurst[]>([])

  const containerRef = useRef<HTMLDivElement | null>(null)
  const targetRef = useRef<Vec2>({ x: 0, y: 0 })
  const currentRef = useRef<Vec2>({ x: 0, y: 0 })
  const musicRef = useRef<BirthdayMusicEngine | null>(null)
  const idRef = useRef({ heart: 0, firework: 0 })
  const kissCountRef = useRef(0)
  const finaleRef = useRef(false)
  const lastKissAtRef = useRef(0)
  const dragRef = useRef({ active: false, pointerId: -1, startClientX: 0, startClientY: 0, startCamera: 0, startTime: 0, moved: false })

  useEffect(() => {
    const onResize = () => {
      const ratio = window.innerHeight / window.innerWidth
      const h = Math.round(clamp(WORLD_W * ratio, 650, 960))
      setViewportH(h)
      setCameraY(prev => clamp(prev, 0, Math.max(0, WORLD_H - h)))
    }

    onResize()
    window.addEventListener('resize', onResize)
    return () => window.removeEventListener('resize', onResize)
  }, [])

  useEffect(() => {
    musicRef.current = new BirthdayMusicEngine()
    return () => {
      musicRef.current?.dispose()
      musicRef.current = null
    }
  }, [])

  useEffect(() => {
    const m = musicRef.current
    if (!m) return
    if (musicEnabled && hasInteracted) m.start()
    else m.stop()
  }, [musicEnabled, hasInteracted])

  useEffect(() => {
    let raf = 0

    const tick = () => {
      const tt = performance.now() * 0.001
      const tx = targetRef.current.x + Math.sin(tt * 0.35) * 0.45
      const ty = targetRef.current.y + Math.cos(tt * 0.31) * 0.35

      const cx = currentRef.current.x + (tx - currentRef.current.x) * 0.1
      const cy = currentRef.current.y + (ty - currentRef.current.y) * 0.1
      currentRef.current = { x: cx, y: cy }

      setParallax(prev => {
        if (Math.abs(prev.x - cx) < 0.01 && Math.abs(prev.y - cy) < 0.01) return prev
        return { x: cx, y: cy }
      })

      raf = requestAnimationFrame(tick)
    }

    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [])

  useEffect(() => {
    const iv = setInterval(() => {
      const now = Date.now()
      setTapHearts(prev => prev.filter(h => now - h.born < h.dur * 1000 + 250))
      setFireworks(prev => prev.filter(f => now - f.born < f.dur * 1000 + 300))
    }, 300)

    return () => clearInterval(iv)
  }, [])

  useEffect(() => {
    kissCountRef.current = kissCount
  }, [kissCount])

  const maxCameraY = Math.max(0, WORLD_H - viewportH)
  const progress = maxCameraY > 0 ? cameraY / maxCameraY : 0

  const updatePointerTarget = useCallback((clientX: number, clientY: number) => {
    const nx = (clientX / window.innerWidth - 0.5) * 2
    const ny = (clientY / window.innerHeight - 0.5) * 2
    targetRef.current = { x: nx * 9, y: ny * 7 }
  }, [])

  const screenToWorld = useCallback((clientX: number, clientY: number) => {
    const el = containerRef.current
    if (!el) return null
    const r = el.getBoundingClientRect()

    const scale = Math.max(r.width / WORLD_W, r.height / viewportH)
    const ox = (r.width - WORLD_W * scale) / 2
    const oy = (r.height - viewportH * scale) / 2

    return {
      x: (clientX - r.left - ox) / scale,
      y: cameraY + (clientY - r.top - oy) / scale,
    }
  }, [cameraY, viewportH])

  const spawnTapHearts = useCallback((sx: number, sy: number, count = 5) => {
    const now = Date.now()
    const newHearts: TapHeart[] = Array.from({ length: count }, () => {
      const size = 20 + Math.random() * 16
      return {
        id: idRef.current.heart++,
        x: 0,
        y: 0,
        sx: sx + (Math.random() - 0.5) * 40,
        sy: sy + (Math.random() - 0.5) * 30,
        size,
        dx: (Math.random() - 0.5) * 80,
        rise: 80 + Math.random() * 100,
        dur: 1.5 + Math.random() * 1,
        color: Math.random() > 0.5 ? C.heartPink : C.heartRed,
        born: now,
      }
    })

    setTapHearts(prev => [...prev, ...newHearts])
  }, [])

  const launchFireworks = useCallback(() => {
    const now = Date.now()
    const colors = ['#ffd778', '#ff9bac', '#9ee3ff', '#fff2be', '#ffb574']
    const baseY = clamp(cameraY + 120, 140, WORLD_H - 360)

    const bursts: FireworkBurst[] = Array.from({ length: 7 }, (_, i) => ({
      id: idRef.current.firework++,
      x: 44 + Math.random() * 312,
      y: baseY + Math.random() * 150,
      dur: 0.9 + Math.random() * 0.5,
      color: colors[i % colors.length] || '#ffd778',
      born: now,
    }))

    setFireworks(prev => [...prev, ...bursts])
  }, [cameraY])

  const onKiss = useCallback(() => {
    const now = Date.now()
    if (now - lastKissAtRef.current < 260) return
    lastKissAtRef.current = now

    setKissPulse(k => k + 1)
    const cx = window.innerWidth / 2
    const cy = window.innerHeight / 2
    spawnTapHearts(cx, cy, 8)

    const current = kissCountRef.current
    if (current >= LOVE_LINES.length) {
      spawnTapHearts(cx, cy - 40, 5)
      return
    }

    const line = LOVE_LINES[current] || ''
    const next = current + 1

    kissCountRef.current = next
    setKissCount(next)
    setActiveLine(line)
    setNoteLines(lines => [...lines, line])
    setLinePulseKey(k => k + 1)

    if (next >= LOVE_LINES.length && !finaleRef.current) {
      finaleRef.current = true
      setTimeout(() => launchFireworks(), 240)
    }
  }, [spawnTapHearts, launchFireworks])

  const onPointerDown = useCallback((e: React.PointerEvent<HTMLDivElement>) => {
    const target = e.target as HTMLElement
    if (target.closest('button')) return

    setHasInteracted(true)
    updatePointerTarget(e.clientX, e.clientY)

    dragRef.current = {
      active: true,
      pointerId: e.pointerId,
      startClientX: e.clientX,
      startClientY: e.clientY,
      startCamera: cameraY,
      startTime: Date.now(),
      moved: false,
    }

    // Spawn hearts immediately on touch/click
    spawnTapHearts(e.clientX, e.clientY, 5)

    // Check if tap is on the couple for kiss
    const pt = screenToWorld(e.clientX, e.clientY)
    if (pt) {
      const dx = pt.x - COUPLE_CENTER.x
      const dy = pt.y - COUPLE_CENTER.y
      if (dx * dx + dy * dy <= COUPLE_CENTER.r * COUPLE_CENTER.r) {
        onKiss()
      }
    }

    try {
      e.currentTarget.setPointerCapture(e.pointerId)
    } catch {
      // Ignore browsers that do not support capture here.
    }
  }, [cameraY, updatePointerTarget, screenToWorld, spawnTapHearts, onKiss])

  const onPointerMove = useCallback((e: React.PointerEvent<HTMLDivElement>) => {
    updatePointerTarget(e.clientX, e.clientY)

    if (!dragRef.current.active || dragRef.current.pointerId !== e.pointerId) return

    const dx = e.clientX - dragRef.current.startClientX
    const dy = e.clientY - dragRef.current.startClientY

    if (Math.abs(dx) > 12 || Math.abs(dy) > 12) {
      dragRef.current.moved = true
    }

    const worldDy = (dy / Math.max(window.innerHeight, 1)) * viewportH
    const next = clamp(dragRef.current.startCamera - worldDy * 1.4, 0, Math.max(0, WORLD_H - viewportH))
    setCameraY(next)
  }, [updatePointerTarget, viewportH])

  const onPointerUp = useCallback((e: React.PointerEvent<HTMLDivElement>) => {
    if (dragRef.current.pointerId !== e.pointerId) return
    dragRef.current.active = false
    dragRef.current.pointerId = -1
  }, [])

  const onPointerCancel = useCallback((e: React.PointerEvent<HTMLDivElement>) => {
    if (dragRef.current.pointerId === e.pointerId) {
      dragRef.current.active = false
      dragRef.current.pointerId = -1
    }
    targetRef.current = { x: 0, y: 0 }
  }, [])

  const onWheel = useCallback((e: React.WheelEvent<HTMLDivElement>) => {
    e.preventDefault()
    setHasInteracted(true)

    const unit = viewportH / Math.max(window.innerHeight, 1)
    setCameraY(prev => clamp(prev + e.deltaY * 0.82 * unit, 0, Math.max(0, WORLD_H - viewportH)))
  }, [viewportH])

  const skyShift = { x: parallax.x * 0.18, y: parallax.y * 0.1 }
  const hillShift = { x: parallax.x * 0.34, y: parallax.y * 0.22 }
  const cityShift = { x: parallax.x * 0.62, y: parallax.y * 0.4 }
  const waterShift = { x: parallax.x * 0.5, y: parallax.y * 0.28 }
  const fgShift = { x: parallax.x * 1.0, y: parallax.y * 0.64 }

  return (
    <div
      ref={containerRef}
      className="fixed inset-0 overflow-hidden"
      style={{ background: C.skyBottom, touchAction: 'none', userSelect: 'none', WebkitUserSelect: 'none' }}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
      onPointerCancel={onPointerCancel}
      onPointerLeave={() => {
        targetRef.current = { x: 0, y: 0 }
      }}
      onWheel={onWheel}
    >
      <svg
        viewBox={`0 ${cameraY} ${WORLD_W} ${viewportH}`}
        xmlns="http://www.w3.org/2000/svg"
        className="absolute inset-0 w-full h-full"
        preserveAspectRatio="xMidYMid slice"
        style={{ imageRendering: 'auto' }}
      >
        <Defs />

        <g transform={`translate(${skyShift.x} ${skyShift.y})`}>
          <SkyLayer />
        </g>

        <g transform={`translate(${hillShift.x} ${hillShift.y})`}>
          <HillsLayer />
        </g>

        <g transform={`translate(${cityShift.x} ${cityShift.y})`}>
          {BUILDINGS.map((b, i) => (
            <Building3D key={`b-${i}`} b={b} index={i} />
          ))}
          <CityDecor />
          <Promenade />
          <FeaturedCouple kissPulse={kissPulse} />
          <FloatingMusicNotes seed={99} count={8} yMin={680} yMax={840} />
        </g>

        <g transform={`translate(${waterShift.x} ${waterShift.y})`}>
          <WaterLayer />
        </g>

        <g transform={`translate(${fgShift.x} ${fgShift.y})`}>
          <ForegroundLayer />
        </g>

        <FireworksEffect fireworks={fireworks} />
      </svg>

      <HeartsEffect hearts={tapHearts} />

      <Atmosphere />

      <div className="absolute inset-x-0 z-30 text-center pointer-events-none" style={{ top: 'max(env(safe-area-inset-top, 0px), 14px)' }}>
        <h1
          className="m-0"
          style={{
            color: C.textMain,
            fontSize: 'clamp(1.55rem, 7.1vw, 3.05rem)',
            letterSpacing: '0.11em',
            fontFamily: '"Cormorant Garamond", "Times New Roman", serif',
            fontWeight: 700,
            textShadow: '0 4px 14px rgba(0,0,0,0.28)',
          }}
        >
          İyi ki doğdun bitanem! 💖💖💖
        </h1>
      </div>

      <div className="absolute right-3 top-3 z-40 flex flex-col items-end gap-2" style={{ paddingTop: 'max(env(safe-area-inset-top, 0px), 0px)' }}>
        <button
          type="button"
          onClick={() => {
            setHasInteracted(true)
            setMusicEnabled(v => !v)
          }}
          className="px-3 py-1.5 rounded-full text-xs"
          style={{
            background: 'rgba(35,30,25,0.72)',
            color: musicEnabled ? C.textAccent : C.textSub,
            border: `1px solid ${musicEnabled ? 'rgba(255,224,126,0.5)' : 'rgba(244,223,191,0.25)'}`,
            fontFamily: '"IBM Plex Mono", "SFMono-Regular", Menlo, monospace',
            letterSpacing: '0.06em',
          }}
        >
          {musicEnabled ? 'Müzik: Açık' : 'Müzik: Kapalı'}
        </button>
        {!hasInteracted && (
          <div style={{ padding: '5px 8px', borderRadius: 8, background: 'rgba(35,30,25,0.6)', color: C.textSub, fontSize: 11, fontFamily: '"IBM Plex Mono", "SFMono-Regular", Menlo, monospace' }}>
            Müziği başlatmak için dokun veya kaydır
          </div>
        )}
      </div>

      <div
        className="absolute right-2 z-40 pointer-events-none"
        style={{
          top: '50%',
          transform: 'translateY(-50%)',
          width: 6,
          height: 140,
          borderRadius: 999,
          background: 'rgba(36,30,24,0.42)',
          border: '1px solid rgba(255,224,126,0.24)',
        }}
      >
        <div
          style={{
            width: '100%',
            height: `${Math.max(10, progress * 100)}%`,
            borderRadius: 999,
            background: 'linear-gradient(180deg, rgba(255,224,126,0.95), rgba(255,175,90,0.88))',
            boxShadow: '0 0 10px rgba(255,224,126,0.3)',
            marginTop: `${(1 - progress) * 100}%`,
            transition: 'margin-top 140ms linear, height 140ms linear',
          }}
        />
      </div>

      <div
        className="absolute left-1/2 z-30 pointer-events-none text-center"
        style={{
          bottom: 'max(env(safe-area-inset-bottom, 0px), 128px)',
          transform: 'translateX(-50%)',
          width: 'min(92vw, 560px)',
          color: C.textSub,
          fontSize: 'clamp(0.67rem, 2.2vw, 0.82rem)',
          fontFamily: '"IBM Plex Mono", "SFMono-Regular", Menlo, monospace',
          letterSpacing: '0.08em',
          opacity: 0.82,
        }}
      >
        Kaydır • Dokun ❤️ • Çifte dokun 💋
      </div>

      {kissPulse > 0 && (
        <div
          key={`kiss-html-${kissPulse}`}
          style={{
            position: 'fixed',
            left: '50%',
            top: '40%',
            transform: 'translate(-50%, -50%)',
            fontSize: 48,
            pointerEvents: 'none',
            zIndex: 55,
            animation: 'kissPopup 1.2s ease-out forwards',
          }}
        >
          💋
        </div>
      )}
      <style>{`
        @keyframes kissPopup {
          0% { opacity: 0; transform: translate(-50%, -50%) scale(0.3); }
          20% { opacity: 1; transform: translate(-50%, -50%) scale(1.2); }
          40% { transform: translate(-50%, -50%) scale(1); }
          100% { opacity: 0; transform: translate(-50%, -80%) scale(0.5); }
        }
      `}</style>

      <KissNotesOverlay lines={noteLines} activeLine={activeLine} pulseKey={linePulseKey} done={kissCount >= LOVE_LINES.length} />
    </div>
  )
}
