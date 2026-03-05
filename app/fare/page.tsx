'use client'

import { useEffect, useState, useMemo, useCallback, useRef } from 'react'

// --- Pixel-art color palette (warm sunset + sage green) ---
const C = {
  sky1: '#ff6b35',
  sky2: '#ff8c42',
  sky3: '#ffb366',
  sky4: '#ffd4a3',
  sky5: '#ffe8cc',
  sky6: '#e8d5f5',
  sun: '#fff4c1',
  sunGlow: '#ffdd57',
  sea1: '#2d6a4f',
  sea2: '#40916c',
  sea3: '#52b788',
  seaHighlight: '#95d5b2',
  building1: '#8b6f47',
  building2: '#a0845c',
  building3: '#c4a97d',
  buildingLight: '#e8d5b7',
  roof: '#c0392b',
  roofDark: '#96281b',
  window: '#ffd580',
  windowDark: '#cc8800',
  green1: '#588157',
  green2: '#6b9a5b',
  green3: '#a7c957',
  flowerPink: '#ffb3c6',
  flowerWhite: '#fff0f5',
  heartPink: '#ff6b8a',
  heartRed: '#e63946',
  cloud: 'rgba(255,240,230,0.6)',
  textMain: '#fff8f0',
  textSub: '#ffd4a3',
}

// =============================================
// SOUND ENGINE — Web Audio API pentatonic notes
// Lazy-init: AudioContext only created on first user gesture
// =============================================
class SoundEngine {
  private ctx: AudioContext | null = null
  private notes: Record<string, number> = {
    C4: 261.63, D4: 293.66, E4: 329.63, G4: 392.00, A4: 440.00,
    C5: 523.25, D5: 587.33, E5: 659.25, G5: 783.99, A5: 880.00,
  }

  private getCtx(): AudioContext {
    if (!this.ctx) this.ctx = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)()
    if (this.ctx.state === 'suspended') this.ctx.resume()
    return this.ctx
  }

  playNote(noteName: string, duration = 0.5, volume = 0.3) {
    try {
      const ctx = this.getCtx()
      const freq = this.notes[noteName]
      if (!freq) return
      const osc = ctx.createOscillator()
      const gain = ctx.createGain()
      osc.type = 'sine'
      osc.frequency.value = freq
      gain.gain.setValueAtTime(volume, ctx.currentTime)
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration)
      osc.connect(gain)
      gain.connect(ctx.destination)
      osc.start()
      osc.stop(ctx.currentTime + duration)
    } catch { /* audio not available */ }
  }

  playMelody(noteNames: string[], tempo = 300) {
    noteNames.forEach((n, i) => {
      setTimeout(() => this.playNote(n, 0.8, 0.25), i * tempo)
    })
  }

  playSeaNote(x: number) {
    const seaNotes = ['C4', 'D4', 'E4', 'G4', 'A4', 'C5', 'D5', 'E5']
    const idx = Math.min(Math.floor((x / 400) * seaNotes.length), seaNotes.length - 1)
    this.playNote(seaNotes[idx], 0.8, 0.2)
  }

  playHeartCatch() {
    this.playNote('E5', 0.3, 0.2)
    setTimeout(() => this.playNote('G5', 0.3, 0.2), 80)
  }

  playLanternRelease() {
    this.playNote('C5', 1.0, 0.15)
    setTimeout(() => this.playNote('E5', 0.8, 0.1), 200)
  }

  playConfetti() {
    const m = ['C5', 'E5', 'G5', 'A5', 'G5', 'E5', 'C5', 'E5', 'G5', 'C5']
    m.forEach((n, i) => setTimeout(() => this.playNote(n, 0.4, 0.2), i * 100))
  }
}

// Lazy singleton — only created when first accessed
let _soundEngine: SoundEngine | null = null
function getSoundEngine(): SoundEngine {
  if (!_soundEngine) _soundEngine = new SoundEngine()
  return _soundEngine
}

// =============================================
// HELPER
// =============================================
function seededRandom(seed: number) {
  let s = seed
  return () => {
    s = (s * 16807 + 0) % 2147483647
    return s / 2147483647
  }
}

/** Convert screen coords to SVG viewBox coords */
function screenToSvg(e: React.PointerEvent | PointerEvent, svgEl: SVGSVGElement | null): { x: number; y: number } | null {
  if (!svgEl) return null
  const rect = svgEl.getBoundingClientRect()
  // viewBox is 400x800, fit via xMidYMid slice
  const vbW = 400, vbH = 800
  const scale = Math.max(rect.width / vbW, rect.height / vbH)
  const renderedW = vbW * scale
  const renderedH = vbH * scale
  const offsetX = (rect.width - renderedW) / 2
  const offsetY = (rect.height - renderedH) / 2
  return {
    x: ((e.clientX - rect.left - offsetX) / scale),
    y: ((e.clientY - rect.top - offsetY) / scale),
  }
}

// =============================================
// SVG FILTERS
// =============================================
function PixelFilters() {
  return (
    <defs>
      <filter id="glow">
        <feGaussianBlur stdDeviation="3" result="blur" />
        <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
      </filter>
      <filter id="softGlow">
        <feGaussianBlur stdDeviation="8" result="blur" />
        <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
      </filter>
    </defs>
  )
}

// =============================================
// BACKGROUND ELEMENTS
// =============================================
function Sky() {
  return (
    <g>
      <defs>
        <linearGradient id="skyGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={C.sky6} />
          <stop offset="20%" stopColor={C.sky5} />
          <stop offset="40%" stopColor={C.sky4} />
          <stop offset="60%" stopColor={C.sky3} />
          <stop offset="80%" stopColor={C.sky2} />
          <stop offset="100%" stopColor={C.sky1} />
        </linearGradient>
      </defs>
      <rect x="0" y="0" width="400" height="800" fill="url(#skyGrad)" />
    </g>
  )
}

function Stars() {
  const stars = useMemo(() => {
    const rng = seededRandom(13)
    return Array.from({ length: 30 }, () => ({
      x: rng() * 400, y: rng() * 200,
      size: 1 + rng() * 2, dur: 2 + rng() * 3, delay: rng() * 4,
    }))
  }, [])

  return (
    <g>
      {stars.map((s, i) => (
        <rect key={`star-${i}`} x={s.x} y={s.y} width={s.size} height={s.size} fill="#fff8f0" rx="0.3">
          <animate attributeName="opacity" values="0.1;0.5;0.1" dur={`${s.dur}s`} begin={`${s.delay}s`} repeatCount="indefinite" />
        </rect>
      ))}
    </g>
  )
}

function Sun() {
  return (
    <g>
      <circle cx="200" cy="370" r="80" fill={C.sky3} opacity="0.15" filter="url(#softGlow)">
        <animate attributeName="r" values="80;88;80" dur="6s" repeatCount="indefinite" />
      </circle>
      <circle cx="200" cy="370" r="55" fill={C.sunGlow} opacity="0.25" filter="url(#softGlow)">
        <animate attributeName="r" values="55;62;55" dur="4s" repeatCount="indefinite" />
      </circle>
      <circle cx="200" cy="370" r="35" fill={C.sunGlow} opacity="0.4" filter="url(#glow)">
        <animate attributeName="r" values="35;38;35" dur="3s" repeatCount="indefinite" />
      </circle>
      <circle cx="200" cy="370" r="24" fill={C.sun} opacity="0.95">
        <animate attributeName="r" values="24;26;24" dur="5s" repeatCount="indefinite" />
      </circle>
    </g>
  )
}

function Clouds() {
  const clouds = [
    { x: 20, y: 50, scale: 0.9, dur: 70 },
    { x: 180, y: 30, scale: 0.6, dur: 90 },
    { x: 300, y: 70, scale: 0.75, dur: 80 },
    { x: 100, y: 100, scale: 0.5, dur: 95 },
  ]
  return (
    <g>
      {clouds.map((c, i) => (
        <g key={i} opacity="0.6" transform={`scale(${c.scale})`}>
          <g>
            <animateTransform attributeName="transform" type="translate" values={`${c.x},${c.y};${c.x + 500},${c.y}`} dur={`${c.dur}s`} repeatCount="indefinite" />
            <rect x="0" y="8" width="6" height="6" fill={C.cloud} rx="1" />
            <rect x="6" y="4" width="6" height="10" fill={C.cloud} rx="1" />
            <rect x="12" y="0" width="10" height="14" fill={C.cloud} rx="1" />
            <rect x="22" y="2" width="8" height="12" fill={C.cloud} rx="1" />
            <rect x="30" y="4" width="8" height="10" fill={C.cloud} rx="1" />
            <rect x="38" y="6" width="6" height="8" fill={C.cloud} rx="1" />
          </g>
        </g>
      ))}
    </g>
  )
}

function Birds() {
  const birds = [
    { x: 60, y: 120, dur: 20, delay: 0 },
    { x: 68, y: 126, dur: 20, delay: 0.3 },
    { x: 280, y: 150, dur: 25, delay: 5 },
    { x: 288, y: 156, dur: 25, delay: 5.4 },
    { x: 170, y: 90, dur: 18, delay: 8 },
  ]
  return (
    <g>
      {birds.map((b, i) => (
        <g key={`bird-${i}`} opacity="0.5">
          <polyline points="-3,0 0,-2 3,0" fill="none" stroke="#5c4a3a" strokeWidth="1.5" strokeLinecap="round">
            <animate attributeName="points" values="-3,0 0,-2 3,0;-3,-1 0,0 3,-1;-3,0 0,-2 3,0" dur="0.8s" repeatCount="indefinite" />
          </polyline>
          <animateTransform attributeName="transform" type="translate" values={`${b.x},${b.y};${b.x + 200},${b.y - 15}`} dur={`${b.dur}s`} begin={`${b.delay}s`} repeatCount="indefinite" />
        </g>
      ))}
    </g>
  )
}

function Boat() {
  return (
    <g>
      <animateTransform attributeName="transform" type="translate" values="120,430;280,426;120,430" dur="30s" repeatCount="indefinite" />
      <polygon points="-8,3 -6,7 6,7 8,3" fill={C.building1} />
      <polygon points="0,3 0,-8 6,1" fill="#fff8f0" opacity="0.9" />
      <line x1="0" y1="-8" x2="0" y2="7" stroke={C.building1} strokeWidth="1" />
    </g>
  )
}

function Fireflies() {
  const flies = useMemo(() => {
    const rng = seededRandom(77)
    return Array.from({ length: 15 }, () => ({
      cx: 20 + rng() * 360, cy: 350 + rng() * 50,
      dur: 3 + rng() * 4, delay: rng() * 6, r: 1.2 + rng() * 1.2,
    }))
  }, [])
  return (
    <g>
      {flies.map((f, i) => (
        <circle key={`ff-${i}`} cx={f.cx} cy={f.cy} r={f.r} fill={C.sunGlow} filter="url(#glow)">
          <animate attributeName="opacity" values="0;0.8;0" dur={`${f.dur}s`} begin={`${f.delay}s`} repeatCount="indefinite" />
          <animate attributeName="cy" values={`${f.cy};${f.cy - 8};${f.cy}`} dur={`${f.dur + 1}s`} begin={`${f.delay}s`} repeatCount="indefinite" />
        </circle>
      ))}
    </g>
  )
}

function FloatingPetals() {
  const petals = useMemo(() => {
    const rng = seededRandom(42)
    return Array.from({ length: 18 }, (_, i) => ({
      x: rng() * 400, startY: -20 - rng() * 80, endY: 700 + rng() * 100,
      size: 2.5 + rng() * 3, dur: 12 + rng() * 14, delay: rng() * 10,
      drift: (rng() - 0.5) * 60,
      color: rng() > 0.5 ? C.flowerPink : C.flowerWhite,
      opacity: 0.35 + rng() * 0.4, rotation: i * 30,
    }))
  }, [])
  return (
    <g>
      {petals.map((p, i) => (
        <g key={`petal-${i}`} opacity={p.opacity}>
          <rect x="0" y="0" width={p.size} height={p.size * 0.7} fill={p.color} rx="0.8">
            <animateTransform attributeName="transform" type="rotate" values="0;360" dur={`${p.dur * 0.8}s`} repeatCount="indefinite" />
          </rect>
          <animateTransform attributeName="transform" type="translate" values={`${p.x},${p.startY};${p.x + p.drift},${p.endY}`} dur={`${p.dur}s`} begin={`${p.delay}s`} repeatCount="indefinite" />
        </g>
      ))}
    </g>
  )
}

// =============================================
// BUILDINGS (with treasure hunt hotspots)
// =============================================
interface TreasureSpot {
  id: string
  x: number
  y: number
  w: number
  h: number
  note: string
  label: string
}

const TREASURE_SPOTS: TreasureSpot[] = [
  { id: 'cat', x: 33, y: 278, w: 14, h: 18, note: 'C4', label: 'cat' },
  { id: 'flowers', x: 268, y: 350, w: 20, h: 18, note: 'E4', label: 'flowers' },
  { id: 'flag', x: 335, y: 242, w: 14, h: 20, note: 'G4', label: 'flag' },
  { id: 'lamp', x: 140, y: 344, w: 14, h: 18, note: 'A4', label: 'lamp' },
  { id: 'bird', x: 367, y: 340, w: 18, h: 18, note: 'C5', label: 'dove' },
]

const TREASURE_MELODY = ['C4', 'E4', 'G4', 'A4', 'C5', 'E5', 'G5', 'E5', 'C5']

// Minimum 48x48 SVG-unit hit area (≈44px on most phones)
const MIN_HIT = 48

function Building({ foundTreasures, onTreasureFind }: { foundTreasures: Set<string>; onTreasureFind: (spot: TreasureSpot) => void }) {
  return (
    <g>
      {/* === Left cluster === */}
      <rect x="20" y="260" width="40" height="140" fill={C.building2} />
      <rect x="20" y="260" width="40" height="5" fill={C.building3} />
      <polygon points="18,260 40,232 62,260" fill={C.roof} />
      <polygon points="18,260 40,236 40,260" fill={C.roofDark} />
      {[278, 300, 322, 348, 370].map((y, i) => (
        <g key={`tw-${i}`}>
          <rect x="33" y={y} width="8" height="12" fill={C.windowDark} />
          <rect x="34" y={y + 1} width="6" height="10" fill={C.window}>
            <animate attributeName="opacity" values="0.7;1;0.7" dur={`${2 + i * 0.3}s`} repeatCount="indefinite" />
          </rect>
          <rect x="33" y={y} width="8" height="2" fill={C.building3} />
        </g>
      ))}

      <rect x="60" y="300" width="70" height="100" fill={C.building1} />
      <rect x="60" y="300" width="70" height="4" fill={C.building3} />
      <polygon points="56,300 95,278 134,300" fill={C.roof} />
      <polygon points="56,300 95,282 95,300" fill={C.roofDark} />
      {[72, 92, 112].map((x, i) => (
        <g key={`bw1-${i}`}>
          <rect x={x} y="318" width="10" height="14" fill={C.windowDark} />
          <rect x={x + 1} y="319" width="8" height="12" fill={C.window}>
            <animate attributeName="opacity" values="0.6;1;0.6" dur={`${2.5 + i * 0.4}s`} repeatCount="indefinite" />
          </rect>
          <rect x={x} y="348" width="10" height="14" fill={C.windowDark} />
          <rect x={x + 1} y="349" width="8" height="12" fill={C.window}>
            <animate attributeName="opacity" values="0.8;0.5;0.8" dur={`${3 + i * 0.3}s`} repeatCount="indefinite" />
          </rect>
        </g>
      ))}
      <rect x="85" y="378" width="14" height="22" fill={C.windowDark} />
      <rect x="85" y="378" width="14" height="3" fill={C.building3} />

      <rect x="130" y="330" width="48" height="70" fill={C.building3} />
      <rect x="130" y="330" width="48" height="3" fill={C.buildingLight} />
      <polygon points="128,330 154,314 180,330" fill={C.roof} />
      {[140, 160].map((x, i) => (
        <g key={`bw2-${i}`}>
          <rect x={x} y="344" width="8" height="12" fill={C.windowDark} />
          <rect x={x + 1} y="345" width="6" height="10" fill={C.window}>
            <animate attributeName="opacity" values="0.9;0.5;0.9" dur={`${2 + i}s`} repeatCount="indefinite" />
          </rect>
        </g>
      ))}

      {/* === Right cluster === */}
      <rect x="240" y="290" width="80" height="110" fill={C.building2} />
      <rect x="240" y="290" width="80" height="4" fill={C.building3} />
      <polygon points="236,290 280,264 324,290" fill={C.roof} />
      <polygon points="236,290 280,268 280,290" fill={C.roofDark} />
      {[252, 272, 296].map((x, i) => (
        <g key={`bw3-${i}`}>
          <rect x={x} y="306" width="10" height="14" fill={C.windowDark} />
          <rect x={x + 1} y="307" width="8" height="12" fill={C.window}>
            <animate attributeName="opacity" values="0.7;1;0.7" dur={`${2.2 + i * 0.5}s`} repeatCount="indefinite" />
          </rect>
          <rect x={x} y="336" width="10" height="14" fill={C.windowDark} />
          <rect x={x + 1} y="337" width="8" height="12" fill={C.window}>
            <animate attributeName="opacity" values="0.5;0.9;0.5" dur={`${3 + i * 0.2}s`} repeatCount="indefinite" />
          </rect>
        </g>
      ))}
      <rect x="268" y="362" width="16" height="3" fill={C.building3} />
      <rect x="270" y="350" width="12" height="14" fill={C.windowDark} />
      <rect x="271" y="351" width="10" height="12" fill={C.window}>
        <animate attributeName="opacity" values="0.8;1;0.8" dur="2s" repeatCount="indefinite" />
      </rect>

      <rect x="320" y="270" width="38" height="130" fill={C.building1} />
      <rect x="320" y="270" width="38" height="4" fill={C.building2} />
      <polygon points="318,270 339,242 360,270" fill={C.roof} />
      <polygon points="318,270 339,246 339,270" fill={C.roofDark} />
      <circle cx="339" cy="290" r="7" fill={C.windowDark} />
      <circle cx="339" cy="290" r="5" fill={C.window}>
        <animate attributeName="opacity" values="0.7;1;0.7" dur="4s" repeatCount="indefinite" />
      </circle>
      {[310, 336, 366].map((y, i) => (
        <g key={`tw2-${i}`}>
          <rect x="332" y={y} width="8" height="12" fill={C.windowDark} />
          <rect x="333" y={y + 1} width="6" height="10" fill={C.window}>
            <animate attributeName="opacity" values="0.6;0.9;0.6" dur={`${2.8 + i * 0.4}s`} repeatCount="indefinite" />
          </rect>
        </g>
      ))}

      <rect x="358" y="340" width="42" height="60" fill={C.building3} />
      <polygon points="356,340 379,324 402,340" fill={C.roof} />
      <rect x="367" y="355" width="8" height="12" fill={C.windowDark} />
      <rect x="368" y="356" width="6" height="10" fill={C.window}>
        <animate attributeName="opacity" values="0.8;0.5;0.8" dur="2.5s" repeatCount="indefinite" />
      </rect>
      <rect x="383" y="355" width="8" height="12" fill={C.windowDark} />
      <rect x="384" y="356" width="6" height="10" fill={C.window}>
        <animate attributeName="opacity" values="0.6;1;0.6" dur="3s" repeatCount="indefinite" />
      </rect>

      <rect x="0" y="396" width="400" height="6" fill={C.building1} opacity="0.6" />
      <rect x="0" y="399" width="400" height="3" fill={C.sea2} opacity="0.3" />

      {[28, 65, 135, 248, 326, 362].map((x, i) => (
        <g key={`vine-${i}`}>
          <rect x={x + 2} y="390" width="3" height="5" fill={C.green1} />
          <rect x={x - 1} y="388" width="3" height="4" fill={C.green2} />
          <rect x={x + 5} y="389" width="2" height="5" fill={C.green3} />
        </g>
      ))}

      {/* ===== TREASURE HUNT HOTSPOTS — 48x48 SVG-unit min hit area ===== */}
      {TREASURE_SPOTS.map(spot => {
        const found = foundTreasures.has(spot.id)
        const cx = spot.x + spot.w / 2
        const cy = spot.y + spot.h / 2
        const hitW = Math.max(spot.w, MIN_HIT)
        const hitH = Math.max(spot.h, MIN_HIT)
        return (
          <g key={spot.id}>
            {/* Subtle pulsing hint glow */}
            {!found && (
              <rect x={spot.x - 2} y={spot.y - 2} width={spot.w + 4} height={spot.h + 4} fill={C.sunGlow} opacity="0" rx="2">
                <animate attributeName="opacity" values="0;0.3;0" dur="2.5s" repeatCount="indefinite" />
              </rect>
            )}
            {/* Found: golden glow + note sparkle */}
            {found && (
              <g>
                <rect x={spot.x - 1} y={spot.y - 1} width={spot.w + 2} height={spot.h + 2} fill={C.sunGlow} opacity="0.35" rx="1">
                  <animate attributeName="opacity" values="0.35;0.15;0.35" dur="3s" repeatCount="indefinite" />
                </rect>
                <circle cx={cx} cy={spot.y - 6} r="4" fill={C.sunGlow} filter="url(#glow)">
                  <animate attributeName="opacity" values="0.4;0.9;0.4" dur="2s" repeatCount="indefinite" />
                  <animate attributeName="r" values="3;5;3" dur="2s" repeatCount="indefinite" />
                </circle>
                {/* Note label */}
                <text x={cx} y={spot.y - 12} textAnchor="middle" fill={C.sun} fontSize="5" fontFamily="monospace" opacity="0.7">
                  {spot.note}
                </text>
              </g>
            )}
            {/* Large tap target — centered on spot */}
            <rect
              x={cx - hitW / 2} y={cy - hitH / 2}
              width={hitW} height={hitH}
              fill="transparent"
              style={{ cursor: found ? 'default' : 'pointer' }}
              onPointerDown={(e) => {
                if (found) return
                e.stopPropagation()
                onTreasureFind(spot)
              }}
            />
          </g>
        )
      })}
    </g>
  )
}

// =============================================
// SEA (with musical tap — uses pointer events)
// =============================================
function Sea() {
  return (
    <g>
      <rect x="0" y="400" width="400" height="400" fill={C.sea1} />
      <defs>
        <linearGradient id="seaGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={C.seaHighlight} stopOpacity="0.4" />
          <stop offset="30%" stopColor={C.sea3} stopOpacity="0.3" />
          <stop offset="100%" stopColor={C.sea1} stopOpacity="0" />
        </linearGradient>
        <linearGradient id="sunReflection" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={C.sunGlow} stopOpacity="0.45" />
          <stop offset="100%" stopColor={C.sunGlow} stopOpacity="0" />
        </linearGradient>
      </defs>
      <rect x="0" y="400" width="400" height="400" fill="url(#seaGrad)" />

      <ellipse cx="200" cy="420" rx="50" ry="80" fill="url(#sunReflection)">
        <animate attributeName="rx" values="50;58;50" dur="4s" repeatCount="indefinite" />
      </ellipse>

      {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9].map(i => (
        <path
          key={`wave-${i}`}
          d={`M-20,${408 + i * 28} Q30,${403 + i * 28} 60,${408 + i * 28} T120,${408 + i * 28} T180,${408 + i * 28} T240,${408 + i * 28} T300,${408 + i * 28} T360,${408 + i * 28} T420,${408 + i * 28}`}
          fill="none" stroke={i < 3 ? C.seaHighlight : C.sea3}
          strokeWidth="1.2" opacity={0.3 - i * 0.025}
        >
          <animateTransform attributeName="transform" type="translate" values={`0,0;${i % 2 === 0 ? 15 : -15},${Math.sin(i) * 2}`} dur={`${3 + i * 0.5}s`} repeatCount="indefinite" />
        </path>
      ))}

      {[
        { x: 160, y: 415, d: 2 }, { x: 190, y: 425, d: 3 },
        { x: 210, y: 412, d: 2.5 }, { x: 180, y: 438, d: 1.8 },
        { x: 220, y: 430, d: 3.2 }, { x: 175, y: 450, d: 2.7 },
        { x: 205, y: 445, d: 2.2 }, { x: 150, y: 440, d: 3.5 },
        { x: 230, y: 420, d: 2.8 }, { x: 185, y: 460, d: 1.5 },
      ].map((s, i) => (
        <rect key={`sparkle-${i}`} x={s.x} y={s.y} width="2" height="2" fill={C.sun} rx="0.3">
          <animate attributeName="opacity" values="0;0.8;0" dur={`${s.d}s`} begin={`${i * 0.3}s`} repeatCount="indefinite" />
        </rect>
      ))}
    </g>
  )
}

// =============================================
// INTERACTIVE FLOATING HEARTS (catchable!)
// Using SVG animations for movement, React only for spawn/catch
// =============================================
interface HeartData {
  id: number
  x: number
  startY: number
  endY: number
  size: number
  dur: number
  drift: number
  color: string
}

function CatchableHearts({ hearts, onCatch }: { hearts: HeartData[]; onCatch: (id: number, e: React.PointerEvent) => void }) {
  return (
    <g>
      {hearts.map(h => {
        const hitSize = Math.max(h.size * 3, MIN_HIT)
        return (
          <g key={h.id} opacity="0.85">
            <animateTransform
              attributeName="transform" type="translate"
              values={`${h.x},${h.startY};${h.x + h.drift},${h.endY}`}
              dur={`${h.dur}s`} fill="freeze"
            />
            {/* Heart shape */}
            <rect x={-h.size * 0.5} y={0} width={h.size * 0.45} height={h.size * 0.45} fill={h.color} rx="0.5" />
            <rect x={h.size * 0.05} y={0} width={h.size * 0.45} height={h.size * 0.45} fill={h.color} rx="0.5" />
            <rect x={-h.size * 0.25} y={h.size * 0.25} width={h.size * 0.5} height={h.size * 0.45} fill={h.color} rx="0.5" />
            {/* Generous centered hit area */}
            <rect
              x={-hitSize / 2} y={-hitSize / 3}
              width={hitSize} height={hitSize}
              fill="transparent"
              style={{ cursor: 'pointer' }}
              onPointerDown={(e) => {
                e.stopPropagation()
                onCatch(h.id, e)
              }}
            />
          </g>
        )
      })}
    </g>
  )
}

// =============================================
// WISH LANTERNS — pure SVG animation, no RAF
// =============================================
interface LanternData {
  id: number
  x: number
  startY: number
  word: string
}

function WishLanterns({ lanterns }: { lanterns: LanternData[] }) {
  return (
    <g>
      {lanterns.map(l => (
        <g key={l.id}>
          <animateTransform
            attributeName="transform" type="translate"
            values={`${l.x},${l.startY};${l.x + (Math.random() - 0.5) * 20},${-50}`}
            dur="18s" fill="freeze"
          />
          <animate attributeName="opacity" values="0;1;1;0.7;0" dur="18s" fill="freeze" />
          {/* Lantern body */}
          <ellipse cx="0" cy="0" rx="6" ry="8" fill={C.sunGlow} opacity="0.7" filter="url(#glow)" />
          <ellipse cx="0" cy="0" rx="4" ry="6" fill={C.sun} opacity="0.9" />
          <ellipse cx="0" cy="1" rx="1.5" ry="2" fill="#fff" opacity="0.8">
            <animate attributeName="ry" values="2;2.5;2" dur="0.5s" repeatCount="indefinite" />
          </ellipse>
          <text x="0" y="-14" textAnchor="middle" fill={C.textMain} fontSize="7" fontFamily="monospace" opacity="0.9">
            {l.word}
          </text>
        </g>
      ))}
    </g>
  )
}

// =============================================
// SEA RIPPLES + CATCH BURSTS (visual feedback)
// =============================================
interface Ripple {
  id: number
  x: number
  y: number
}

interface CatchBurst {
  id: number
  x: number
  y: number
  color: string
}

function VisualEffects({ ripples, catchBursts }: { ripples: Ripple[]; catchBursts: CatchBurst[] }) {
  return (
    <g>
      {/* Sea ripples */}
      {ripples.map(r => (
        <g key={`ripple-${r.id}`}>
          <circle cx={r.x} cy={r.y} r="3" fill="none" stroke={C.seaHighlight} strokeWidth="1.2">
            <animate attributeName="r" from="3" to="28" dur="1s" fill="freeze" />
            <animate attributeName="opacity" from="0.8" to="0" dur="1s" fill="freeze" />
          </circle>
          <circle cx={r.x} cy={r.y} r="3" fill="none" stroke={C.sun} strokeWidth="0.8">
            <animate attributeName="r" from="3" to="18" dur="0.7s" fill="freeze" />
            <animate attributeName="opacity" from="0.5" to="0" dur="0.7s" fill="freeze" />
          </circle>
          {/* Note text flash */}
          <text x={r.x} y={r.y - 8} textAnchor="middle" fill={C.sun} fontSize="6" fontFamily="monospace">
            <animate attributeName="opacity" values="0.8;0" dur="0.8s" fill="freeze" />
            <animateTransform attributeName="transform" type="translate" values={`0,0;0,-12`} dur="0.8s" fill="freeze" />
          </text>
        </g>
      ))}

      {/* Heart catch bursts — satisfying pop! */}
      {catchBursts.map(b => (
        <g key={`burst-${b.id}`}>
          {/* Central flash */}
          <circle cx={b.x} cy={b.y} r="2" fill={b.color}>
            <animate attributeName="r" from="2" to="15" dur="0.4s" fill="freeze" />
            <animate attributeName="opacity" from="0.8" to="0" dur="0.4s" fill="freeze" />
          </circle>
          {/* Particle ring */}
          {[0, 60, 120, 180, 240, 300].map((angle, i) => {
            const rad = (angle * Math.PI) / 180
            const dx = Math.cos(rad) * 18
            const dy = Math.sin(rad) * 18
            return (
              <rect key={i} x={b.x - 1} y={b.y - 1} width="2.5" height="2.5" fill={b.color} rx="0.5">
                <animateTransform attributeName="transform" type="translate" values={`0,0;${dx},${dy}`} dur="0.5s" fill="freeze" />
                <animate attributeName="opacity" from="1" to="0" dur="0.5s" fill="freeze" />
              </rect>
            )
          })}
          {/* "+1" text float */}
          <text x={b.x} y={b.y - 4} textAnchor="middle" fill={C.sun} fontSize="8" fontFamily="monospace" fontWeight="bold">
            <animate attributeName="opacity" values="1;0" dur="0.8s" fill="freeze" />
            <animateTransform attributeName="transform" type="translate" values={`0,0;0,-18`} dur="0.8s" fill="freeze" />
            +1
          </text>
        </g>
      ))}
    </g>
  )
}

// =============================================
// CONFETTI — uses key to force re-mount for replay
// =============================================
function ConfettiBurst({ burstKey }: { burstKey: number }) {
  const particles = useMemo(() => {
    const rng = seededRandom(burstKey * 137 + 555)
    const colors = [C.heartPink, C.heartRed, C.sunGlow, C.sun, C.flowerPink, C.seaHighlight, '#fff']
    return Array.from({ length: 50 }, () => ({
      x: 180 + rng() * 40, y: 350 + rng() * 40,
      dx: (rng() - 0.5) * 300, dy: -100 - rng() * 400,
      size: 2 + rng() * 4,
      color: colors[Math.floor(rng() * colors.length)],
      rotation: rng() * 360, dur: 2 + rng() * 2,
    }))
  }, [burstKey])

  if (burstKey === 0) return null

  return (
    <g>
      {particles.map((p, i) => (
        <rect key={`confetti-${i}`} x="0" y="0" width={p.size} height={p.size * 0.6} fill={p.color} rx="0.5">
          <animateTransform attributeName="transform" type="translate" values={`${p.x},${p.y};${p.x + p.dx},${p.y + p.dy}`} dur={`${p.dur}s`} fill="freeze" />
          <animateTransform attributeName="transform" type="rotate" values={`0;${p.rotation}`} dur={`${p.dur}s`} fill="freeze" additive="sum" />
          <animate attributeName="opacity" values="1;1;0" dur={`${p.dur}s`} fill="freeze" />
        </rect>
      ))}
    </g>
  )
}

// =============================================
// MAIN SCENE SVG
// =============================================
const PixelScene = ({
  svgRef, foundTreasures, onTreasureFind,
  hearts, onHeartCatch, lanterns,
  ripples, catchBursts, confettiBurstKey,
}: {
  svgRef: React.RefObject<SVGSVGElement | null>
  foundTreasures: Set<string>
  onTreasureFind: (spot: TreasureSpot) => void
  hearts: HeartData[]
  onHeartCatch: (id: number, e: React.PointerEvent) => void
  lanterns: LanternData[]
  ripples: Ripple[]
  catchBursts: CatchBurst[]
  confettiBurstKey: number
}) => {
  return (
    <svg
      ref={svgRef}
      viewBox="0 0 400 800"
      xmlns="http://www.w3.org/2000/svg"
      className="absolute inset-0 w-full h-full"
      preserveAspectRatio="xMidYMid slice"
      style={{ imageRendering: 'auto', touchAction: 'none' }}
    >
      <PixelFilters />
      <Sky />
      <Stars />
      <Sun />
      <Clouds />
      <Birds />
      <Building foundTreasures={foundTreasures} onTreasureFind={onTreasureFind} />
      <Fireflies />
      <Sea />
      <Boat />
      <FloatingPetals />
      <CatchableHearts hearts={hearts} onCatch={onHeartCatch} />
      <WishLanterns lanterns={lanterns} />
      <VisualEffects ripples={ripples} catchBursts={catchBursts} />
      <ConfettiBurst burstKey={confettiBurstKey} />
    </svg>
  )
}

// =============================================
// GAME UI OVERLAY
// =============================================
const WISH_WORDS = ['Wishing', 'you', 'endless', 'joy', 'love', 'and', 'magic', 'forever']

function GameUI({
  heartsCaught, heartsTarget, foundTreasures, totalTreasures,
  lanternsReleased, allComplete, treasureMelodyPlayed,
}: {
  heartsCaught: number; heartsTarget: number
  foundTreasures: number; totalTreasures: number
  lanternsReleased: number; allComplete: boolean
  treasureMelodyPlayed: boolean
}) {
  const pills = [
    { icon: '\u2665', count: heartsCaught, total: heartsTarget, done: heartsCaught >= heartsTarget },
    { icon: '\u2726', count: foundTreasures, total: totalTreasures, done: foundTreasures >= totalTreasures },
    { icon: '\u25D0', count: lanternsReleased, total: WISH_WORDS.length, done: lanternsReleased >= WISH_WORDS.length },
  ]

  return (
    <div className="absolute top-0 left-0 right-0 z-20 pointer-events-none" style={{ paddingTop: 'max(env(safe-area-inset-top, 0px), 8px)' }}>
      <div className="flex justify-center gap-3 px-3 pt-2 flex-wrap">
        {pills.map((p, i) => (
          <div
            key={i}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full font-mono text-xs transition-colors duration-300"
            style={{
              background: 'rgba(33, 39, 51, 0.75)',
              backdropFilter: 'blur(8px)',
              color: p.done ? C.sunGlow : C.textSub,
              border: `1px solid ${p.done ? C.sunGlow + '44' : C.sea3 + '33'}`,
            }}
          >
            <span style={{ fontSize: '14px' }}>{p.icon}</span>
            <span>{p.count}/{p.total}</span>
            {p.done && <span style={{ color: C.sunGlow }}>{'✓'}</span>}
          </div>
        ))}
      </div>

      {!allComplete && (
        <div className="text-center mt-2 px-4">
          <p className="font-mono text-xs tracking-wide" style={{ color: C.textSub, opacity: 0.6, textShadow: '0 1px 4px rgba(0,0,0,0.5)' }}>
            tap hearts, find hidden treasures, touch the sky & sea
          </p>
        </div>
      )}

      {treasureMelodyPlayed && (
        <div className="flex justify-center mt-2">
          <div
            className="px-4 py-2 rounded-lg font-mono text-xs animate-fade-in"
            style={{ background: 'rgba(33, 39, 51, 0.85)', color: C.sunGlow, border: `1px solid ${C.sunGlow}44` }}
          >
            melody unlocked!
          </div>
        </div>
      )}
    </div>
  )
}

// =============================================
// BIRTHDAY OVERLAY
// =============================================
function BirthdayOverlay({ allComplete }: { allComplete: boolean }) {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const t = setTimeout(() => setVisible(true), 800)
    return () => clearTimeout(t)
  }, [])

  return (
    <div
      className={`absolute inset-0 flex flex-col items-center pointer-events-none z-10 transition-opacity duration-[2000ms] ${visible ? 'opacity-100' : 'opacity-0'}`}
      style={{ paddingTop: 'max(env(safe-area-inset-top, 0px), 12px)' }}
    >
      <div className="flex-shrink-0 text-center pt-16 pb-2 px-4 sm:pt-20">
        <h1
          className="font-mono tracking-widest drop-shadow-lg leading-tight"
          style={{
            color: C.textMain,
            fontSize: 'clamp(1.5rem, 7vw, 3.2rem)',
            textShadow: `0 0 30px ${C.sky1}88, 0 2px 10px rgba(0,0,0,0.5)`,
            letterSpacing: '0.12em',
          }}
        >
          Happy Birthday
        </h1>
        <h1
          className="font-mono tracking-widest drop-shadow-lg leading-tight mt-1"
          style={{
            color: C.sunGlow,
            fontSize: 'clamp(1.8rem, 8vw, 3.8rem)',
            textShadow: `0 0 40px ${C.sky1}aa, 0 0 20px ${C.sunGlow}66, 0 2px 10px rgba(0,0,0,0.5)`,
            letterSpacing: '0.15em',
          }}
        >
          Lara
        </h1>
        <div className="mt-3 font-mono tracking-wider" style={{ color: C.textSub, fontSize: 'clamp(0.7rem, 2.5vw, 1rem)', textShadow: '0 1px 8px rgba(0,0,0,0.4)' }}>
          a little world, just for you
        </div>
      </div>

      <div className="flex-1 min-h-0" />

      {/* Completion card */}
      <div
        className={`flex-shrink-0 mx-5 mb-8 px-6 py-5 rounded-xl pointer-events-auto max-w-sm w-full sm:mb-12 sm:px-8 sm:py-6 transition-all duration-1000 ${allComplete ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4 pointer-events-none'}`}
        style={{
          background: 'rgba(33, 39, 51, 0.85)',
          backdropFilter: 'blur(12px)', WebkitBackdropFilter: 'blur(12px)',
          border: `1px solid ${allComplete ? C.sunGlow + '44' : C.sea3 + '33'}`,
          boxShadow: allComplete
            ? `0 8px 32px rgba(0,0,0,0.35), inset 0 1px 0 ${C.sunGlow}28, 0 0 40px ${C.sunGlow}15`
            : `0 8px 32px rgba(0,0,0,0.35)`,
        }}
      >
        <div className="text-center">
          <p className="font-mono leading-relaxed italic m-0" style={{ color: C.textSub, fontSize: 'clamp(0.8rem, 2.8vw, 0.95rem)', lineHeight: '1.7' }}>
            You found all the secrets! This sunset, this melody, these little moments — they&apos;re all for you. Happy birthday, Lara.
          </p>
        </div>
      </div>

      <div style={{ height: 'env(safe-area-inset-bottom, 0px)', flexShrink: 0 }} />
    </div>
  )
}

// =============================================
// MAIN PAGE — unified pointer handler, no RAF
// =============================================
export default function FarePage() {
  const [mounted, setMounted] = useState(false)
  const svgRef = useRef<SVGSVGElement | null>(null)

  // Game state
  const [heartsCaught, setHeartsCaught] = useState(0)
  const [foundTreasures, setFoundTreasures] = useState<Set<string>>(new Set())
  const [lanternsReleased, setLanternsReleased] = useState(0)
  const [confettiBurstKey, setConfettiBurstKey] = useState(0)
  const [treasureMelodyPlayed, setTreasureMelodyPlayed] = useState(false)
  const confettiFiredRef = useRef(false)

  // Interactive elements — hearts use SVG animations, no RAF needed
  const [hearts, setHearts] = useState<HeartData[]>([])
  const [lanterns, setLanterns] = useState<LanternData[]>([])
  const [ripples, setRipples] = useState<Ripple[]>([])
  const [catchBursts, setCatchBursts] = useState<CatchBurst[]>([])

  const heartIdRef = useRef(0)
  const lanternIdRef = useRef(0)
  const rippleIdRef = useRef(0)
  const burstIdRef = useRef(0)

  const HEARTS_TARGET = 15

  const allComplete = heartsCaught >= HEARTS_TARGET
    && foundTreasures.size >= TREASURE_SPOTS.length
    && lanternsReleased >= WISH_WORDS.length

  useEffect(() => { setMounted(true) }, [])

  // Heart spawner — creates hearts with SVG animations (no RAF!)
  useEffect(() => {
    if (!mounted) return
    const spawn = () => {
      const r = Math.random
      const heart: HeartData = {
        id: heartIdRef.current++,
        x: 40 + r() * 320,
        startY: 780,
        endY: -40,
        size: 6 + r() * 5,
        dur: 14 + r() * 10,
        drift: (r() - 0.5) * 60,
        color: r() > 0.5 ? C.heartPink : C.heartRed,
      }
      setHearts(prev => {
        // Remove hearts older than 25s (well past their animation)
        const cutoff = heartIdRef.current - 25
        const cleaned = prev.filter(h => h.id > cutoff)
        return [...cleaned, heart]
      })
    }
    spawn()
    const interval = setInterval(spawn, 1800)
    return () => clearInterval(interval)
  }, [mounted])

  // Auto-clean old visual effects
  useEffect(() => {
    if (!mounted) return
    const interval = setInterval(() => {
      const cutoff = rippleIdRef.current - 8
      setRipples(prev => prev.filter(r => r.id > cutoff))
      const burstCutoff = burstIdRef.current - 8
      setCatchBursts(prev => prev.filter(b => b.id > burstCutoff))
    }, 3000)
    return () => clearInterval(interval)
  }, [mounted])

  // Confetti on all complete — uses ref to prevent re-trigger
  useEffect(() => {
    if (allComplete && !confettiFiredRef.current) {
      confettiFiredRef.current = true
      setConfettiBurstKey(k => k + 1)
      getSoundEngine().playConfetti()
    }
  }, [allComplete])

  // Heart catch handler — with catch burst visual feedback
  const handleHeartCatch = useCallback((id: number, e: React.PointerEvent) => {
    setHearts(prev => prev.filter(h => h.id !== id))
    setHeartsCaught(prev => prev + 1)

    // Spawn burst at pointer position in SVG coords
    const pt = screenToSvg(e as unknown as React.PointerEvent, svgRef.current)
    if (pt) {
      setCatchBursts(prev => [...prev, {
        id: burstIdRef.current++,
        x: pt.x, y: pt.y,
        color: Math.random() > 0.5 ? C.heartPink : C.heartRed,
      }])
    }
    getSoundEngine().playHeartCatch()
  }, [])

  // Treasure find handler
  const handleTreasureFind = useCallback((spot: TreasureSpot) => {
    setFoundTreasures(prev => {
      const next = new Set(prev)
      next.add(spot.id)
      getSoundEngine().playNote(spot.note, 1.0, 0.3)
      if (next.size === TREASURE_SPOTS.length) {
        setTimeout(() => {
          getSoundEngine().playMelody(TREASURE_MELODY, 250)
          setTreasureMelodyPlayed(true)
        }, 800)
      }
      return next
    })
  }, [])

  // Unified pointer handler for sky (lanterns) and sea (music)
  const handleScenePointerDown = useCallback((e: React.PointerEvent<HTMLDivElement>) => {
    const pt = screenToSvg(e, svgRef.current)
    if (!pt) return

    // Sea zone: y > 400
    if (pt.y > 400 && pt.x >= 0 && pt.x <= 400) {
      setRipples(prev => [...prev, { id: rippleIdRef.current++, x: pt.x, y: pt.y }])
      getSoundEngine().playSeaNote(pt.x)
      return
    }

    // Sky zone: y < 250 — release lantern
    if (pt.y < 250 && lanternsReleased < WISH_WORDS.length) {
      const word = WISH_WORDS[lanternsReleased]
      setLanterns(prev => [...prev, {
        id: lanternIdRef.current++,
        x: pt.x,
        startY: pt.y,
        word: word || '',
      }])
      setLanternsReleased(prev => prev + 1)
      getSoundEngine().playLanternRelease()
    }
  }, [lanternsReleased])

  if (!mounted) return null

  return (
    <div
      className="fixed inset-0 overflow-hidden"
      style={{ background: C.sky1, touchAction: 'none', userSelect: 'none', WebkitUserSelect: 'none' }}
      onPointerDown={handleScenePointerDown}
    >
      <PixelScene
        svgRef={svgRef}
        foundTreasures={foundTreasures}
        onTreasureFind={handleTreasureFind}
        hearts={hearts}
        onHeartCatch={handleHeartCatch}
        lanterns={lanterns}
        ripples={ripples}
        catchBursts={catchBursts}
        confettiBurstKey={confettiBurstKey}
      />

      {/* Vignette — pointer-events-none, BELOW UI layers */}
      <div className="absolute inset-0 pointer-events-none z-0" style={{ background: 'radial-gradient(ellipse at center, transparent 40%, rgba(0,0,0,0.35) 100%)' }} />

      <BirthdayOverlay allComplete={allComplete} />

      <GameUI
        heartsCaught={heartsCaught}
        heartsTarget={HEARTS_TARGET}
        foundTreasures={foundTreasures.size}
        totalTreasures={TREASURE_SPOTS.length}
        lanternsReleased={lanternsReleased}
        allComplete={allComplete}
        treasureMelodyPlayed={treasureMelodyPlayed}
      />
    </div>
  )
}
