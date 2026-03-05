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
// =============================================
class SoundEngine {
  private ctx: AudioContext | null = null
  // Pentatonic scale notes (C major pentatonic across octaves)
  private notes: Record<string, number> = {
    C4: 261.63, D4: 293.66, E4: 329.63, G4: 392.00, A4: 440.00,
    C5: 523.25, D5: 587.33, E5: 659.25, G5: 783.99, A5: 880.00,
  }

  private getCtx(): AudioContext {
    if (!this.ctx) this.ctx = new AudioContext()
    if (this.ctx.state === 'suspended') this.ctx.resume()
    return this.ctx
  }

  playNote(noteName: string, duration = 0.5, volume = 0.3) {
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
  }

  playChime(volume = 0.15) {
    const notes = ['E5', 'G5', 'A5']
    notes.forEach((n, i) => {
      setTimeout(() => this.playNote(n, 0.6, volume), i * 120)
    })
  }

  playMelody(noteNames: string[], tempo = 300) {
    noteNames.forEach((n, i) => {
      setTimeout(() => this.playNote(n, 0.8, 0.25), i * tempo)
    })
  }

  playSeaNote(x: number, volume = 0.2) {
    // Map x position (0-400) to pentatonic notes
    const seaNotes = ['C4', 'D4', 'E4', 'G4', 'A4', 'C5', 'D5', 'E5']
    const idx = Math.floor((x / 400) * seaNotes.length)
    const note = seaNotes[Math.min(idx, seaNotes.length - 1)]
    this.playNote(note, 0.8, volume)
  }

  playHeartCatch(volume = 0.2) {
    this.playNote('E5', 0.3, volume)
    setTimeout(() => this.playNote('G5', 0.3, volume), 80)
  }

  playLanternRelease(volume = 0.15) {
    this.playNote('C5', 1.0, volume)
    setTimeout(() => this.playNote('E5', 0.8, volume * 0.7), 200)
  }

  playConfetti() {
    const melody = ['C5', 'E5', 'G5', 'A5', 'G5', 'E5', 'C5', 'E5', 'G5', 'C5']
    melody.forEach((n, i) => {
      setTimeout(() => this.playNote(n, 0.4, 0.2), i * 100)
    })
  }
}

const soundEngine = typeof window !== 'undefined' ? new SoundEngine() : null

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

// =============================================
// SVG FILTERS
// =============================================
function PixelFilters() {
  return (
    <defs>
      <filter id="glow">
        <feGaussianBlur stdDeviation="3" result="blur" />
        <feMerge>
          <feMergeNode in="blur" />
          <feMergeNode in="SourceGraphic" />
        </feMerge>
      </filter>
      <filter id="softGlow">
        <feGaussianBlur stdDeviation="8" result="blur" />
        <feMerge>
          <feMergeNode in="blur" />
          <feMergeNode in="SourceGraphic" />
        </feMerge>
      </filter>
    </defs>
  )
}

// =============================================
// BACKGROUND ELEMENTS (unchanged from original)
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
      x: rng() * 400,
      y: rng() * 200,
      size: 1 + rng() * 2,
      dur: 2 + rng() * 3,
      delay: rng() * 4,
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
      cx: 20 + rng() * 360,
      cy: 350 + rng() * 50,
      dur: 3 + rng() * 4,
      delay: rng() * 6,
      r: 1.2 + rng() * 1.2,
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
      x: rng() * 400,
      startY: -20 - rng() * 80,
      endY: 700 + rng() * 100,
      size: 2.5 + rng() * 3,
      dur: 12 + rng() * 14,
      delay: rng() * 10,
      drift: (rng() - 0.5) * 60,
      color: rng() > 0.5 ? C.flowerPink : C.flowerWhite,
      opacity: 0.35 + rng() * 0.4,
      rotation: i * 30,
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
  { id: 'cat', x: 33, y: 278, w: 14, h: 18, note: 'C4', label: '🐱' },
  { id: 'flowers', x: 268, y: 350, w: 20, h: 18, note: 'E4', label: '🌸' },
  { id: 'flag', x: 335, y: 242, w: 14, h: 20, note: 'G4', label: '🚩' },
  { id: 'lamp', x: 140, y: 344, w: 14, h: 18, note: 'A4', label: '🏮' },
  { id: 'bird', x: 367, y: 340, w: 18, h: 18, note: 'C5', label: '🕊️' },
]

const TREASURE_MELODY = ['C4', 'E4', 'G4', 'A4', 'C5', 'E5', 'G5', 'E5', 'C5']

function Building({ foundTreasures, onTreasureFind }: { foundTreasures: Set<string>; onTreasureFind: (spot: TreasureSpot) => void }) {
  return (
    <g>
      {/* === Left cluster === */}
      {/* Bell tower */}
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

      {/* Main building left */}
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

      {/* Small connecting building */}
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
      {/* Large right building */}
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
      {/* Balcony */}
      <rect x="268" y="362" width="16" height="3" fill={C.building3} />
      <rect x="270" y="350" width="12" height="14" fill={C.windowDark} />
      <rect x="271" y="351" width="10" height="12" fill={C.window}>
        <animate attributeName="opacity" values="0.8;1;0.8" dur="2s" repeatCount="indefinite" />
      </rect>

      {/* Right tall tower */}
      <rect x="320" y="270" width="38" height="130" fill={C.building1} />
      <rect x="320" y="270" width="38" height="4" fill={C.building2} />
      <polygon points="318,270 339,242 360,270" fill={C.roof} />
      <polygon points="318,270 339,246 339,270" fill={C.roofDark} />
      {/* Clock window */}
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

      {/* Small rightmost building */}
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

      {/* Waterfront / dock line */}
      <rect x="0" y="396" width="400" height="6" fill={C.building1} opacity="0.6" />
      <rect x="0" y="399" width="400" height="3" fill={C.sea2} opacity="0.3" />

      {/* Pixel greenery / vines */}
      {[28, 65, 135, 248, 326, 362].map((x, i) => (
        <g key={`vine-${i}`}>
          <rect x={x + 2} y="390" width="3" height="5" fill={C.green1} />
          <rect x={x - 1} y="388" width="3" height="4" fill={C.green2} />
          <rect x={x + 5} y="389" width="2" height="5" fill={C.green3} />
        </g>
      ))}

      {/* ===== TREASURE HUNT HOTSPOTS ===== */}
      {TREASURE_SPOTS.map(spot => {
        const found = foundTreasures.has(spot.id)
        return (
          <g key={spot.id}>
            {/* Subtle hint glow for undiscovered spots */}
            {!found && (
              <rect
                x={spot.x - 2} y={spot.y - 2}
                width={spot.w + 4} height={spot.h + 4}
                fill={C.sunGlow} opacity="0" rx="2"
              >
                <animate attributeName="opacity" values="0;0.25;0" dur="3s" repeatCount="indefinite" />
              </rect>
            )}
            {/* Found indicator */}
            {found && (
              <g>
                <rect x={spot.x} y={spot.y} width={spot.w} height={spot.h} fill={C.sunGlow} opacity="0.3" rx="1" />
                <circle cx={spot.x + spot.w / 2} cy={spot.y - 4} r="3" fill={C.sunGlow} filter="url(#glow)">
                  <animate attributeName="opacity" values="0.5;1;0.5" dur="2s" repeatCount="indefinite" />
                </circle>
              </g>
            )}
            {/* Clickable area */}
            <rect
              x={spot.x - 4} y={spot.y - 4}
              width={spot.w + 8} height={spot.h + 8}
              fill="transparent"
              style={{ cursor: found ? 'default' : 'pointer' }}
              onClick={() => !found && onTreasureFind(spot)}
            />
          </g>
        )
      })}
    </g>
  )
}

// =============================================
// SEA (with musical tap interaction)
// =============================================
function Sea({ onSeaTap }: { onSeaTap: (x: number, y: number) => void }) {
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

      {/* Sun reflection */}
      <ellipse cx="200" cy="420" rx="50" ry="80" fill="url(#sunReflection)">
        <animate attributeName="rx" values="50;58;50" dur="4s" repeatCount="indefinite" />
      </ellipse>

      {/* Wave lines */}
      {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9].map(i => (
        <path
          key={`wave-${i}`}
          d={`M-20,${408 + i * 28} Q30,${403 + i * 28} 60,${408 + i * 28} T120,${408 + i * 28} T180,${408 + i * 28} T240,${408 + i * 28} T300,${408 + i * 28} T360,${408 + i * 28} T420,${408 + i * 28}`}
          fill="none"
          stroke={i < 3 ? C.seaHighlight : C.sea3}
          strokeWidth="1.2"
          opacity={0.3 - i * 0.025}
        >
          <animateTransform attributeName="transform" type="translate" values={`0,0;${i % 2 === 0 ? 15 : -15},${Math.sin(i) * 2}`} dur={`${3 + i * 0.5}s`} repeatCount="indefinite" />
        </path>
      ))}

      {/* Sparkles */}
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

      {/* Invisible tap area for musical sea */}
      <rect
        x="0" y="400" width="400" height="400"
        fill="transparent"
        style={{ cursor: 'pointer' }}
        onClick={(e) => {
          const svg = (e.target as SVGElement).closest('svg')
          if (!svg) return
          const pt = svg.createSVGPoint()
          pt.x = e.clientX
          pt.y = e.clientY
          const svgP = pt.matrixTransform(svg.getScreenCTM()?.inverse())
          onSeaTap(svgP.x, svgP.y)
        }}
      />
    </g>
  )
}

// =============================================
// INTERACTIVE FLOATING HEARTS (catchable!)
// =============================================
interface CatchableHeart {
  id: number
  x: number
  y: number
  size: number
  speed: number
  drift: number
  color: string
  caught: boolean
  fadeOut: boolean
}

function CatchableHearts({ hearts, onCatch }: { hearts: CatchableHeart[]; onCatch: (id: number) => void }) {
  return (
    <g>
      {hearts.map(h => {
        if (h.caught) return null
        return (
          <g
            key={h.id}
            transform={`translate(${h.x}, ${h.y})`}
            style={{ cursor: 'pointer' }}
            opacity={h.fadeOut ? 0.3 : 0.8}
            onClick={() => onCatch(h.id)}
          >
            {/* Heart shape */}
            <rect x={-h.size * 0.5} y={0} width={h.size * 0.45} height={h.size * 0.45} fill={h.color} rx="0.5" />
            <rect x={h.size * 0.05} y={0} width={h.size * 0.45} height={h.size * 0.45} fill={h.color} rx="0.5" />
            <rect x={-h.size * 0.25} y={h.size * 0.25} width={h.size * 0.5} height={h.size * 0.45} fill={h.color} rx="0.5" />
            {/* Larger hit area */}
            <rect x={-h.size} y={-h.size * 0.5} width={h.size * 2.5} height={h.size * 2} fill="transparent" />
          </g>
        )
      })}
    </g>
  )
}

// =============================================
// WISH LANTERNS
// =============================================
interface Lantern {
  id: number
  x: number
  y: number
  targetY: number
  word: string
  opacity: number
}

function WishLanterns({ lanterns }: { lanterns: Lantern[] }) {
  return (
    <g>
      {lanterns.map(l => (
        <g key={l.id} transform={`translate(${l.x}, ${l.y})`} opacity={l.opacity}>
          {/* Lantern body */}
          <ellipse cx="0" cy="0" rx="6" ry="8" fill={C.sunGlow} opacity="0.7" filter="url(#glow)" />
          <ellipse cx="0" cy="0" rx="4" ry="6" fill={C.sun} opacity="0.9" />
          {/* Flame inside */}
          <ellipse cx="0" cy="1" rx="1.5" ry="2" fill="#fff" opacity="0.8">
            <animate attributeName="ry" values="2;2.5;2" dur="0.5s" repeatCount="indefinite" />
          </ellipse>
          {/* Word */}
          <text
            x="0" y="-14"
            textAnchor="middle"
            fill={C.textMain}
            fontSize="7"
            fontFamily="monospace"
            opacity="0.9"
          >
            {l.word}
          </text>
        </g>
      ))}
    </g>
  )
}

// =============================================
// SEA RIPPLES (visual feedback for musical taps)
// =============================================
interface Ripple {
  id: number
  x: number
  y: number
  birth: number
}

function SeaRipples({ ripples }: { ripples: Ripple[] }) {
  return (
    <g>
      {ripples.map(r => (
        <g key={r.id}>
          <circle cx={r.x} cy={r.y} r="3" fill="none" stroke={C.seaHighlight} strokeWidth="1">
            <animate attributeName="r" from="3" to="25" dur="1.2s" fill="freeze" />
            <animate attributeName="opacity" from="0.7" to="0" dur="1.2s" fill="freeze" />
          </circle>
          <circle cx={r.x} cy={r.y} r="3" fill="none" stroke={C.sun} strokeWidth="0.8">
            <animate attributeName="r" from="3" to="18" dur="0.9s" fill="freeze" />
            <animate attributeName="opacity" from="0.5" to="0" dur="0.9s" fill="freeze" />
          </circle>
        </g>
      ))}
    </g>
  )
}

// =============================================
// CONFETTI BURST
// =============================================
function ConfettiBurst({ active }: { active: boolean }) {
  const particles = useMemo(() => {
    const rng = seededRandom(555)
    const colors = [C.heartPink, C.heartRed, C.sunGlow, C.sun, C.flowerPink, C.seaHighlight, '#fff']
    return Array.from({ length: 50 }, () => ({
      x: 180 + rng() * 40,
      y: 350 + rng() * 40,
      dx: (rng() - 0.5) * 300,
      dy: -100 - rng() * 400,
      size: 2 + rng() * 4,
      color: colors[Math.floor(rng() * colors.length)],
      rotation: rng() * 360,
      dur: 2 + rng() * 2,
    }))
  }, [])

  if (!active) return null

  return (
    <g>
      {particles.map((p, i) => (
        <rect
          key={`confetti-${i}`}
          x="0" y="0"
          width={p.size} height={p.size * 0.6}
          fill={p.color}
          rx="0.5"
        >
          <animateTransform
            attributeName="transform"
            type="translate"
            values={`${p.x},${p.y};${p.x + p.dx},${p.y + p.dy}`}
            dur={`${p.dur}s`}
            fill="freeze"
          />
          <animateTransform
            attributeName="transform"
            type="rotate"
            values={`0;${p.rotation}`}
            dur={`${p.dur}s`}
            fill="freeze"
            additive="sum"
          />
          <animate attributeName="opacity" values="1;1;0" dur={`${p.dur}s`} fill="freeze" />
        </rect>
      ))}
    </g>
  )
}

// =============================================
// MAIN SCENE
// =============================================
function PixelScene({
  foundTreasures,
  onTreasureFind,
  onSeaTap,
  hearts,
  onHeartCatch,
  lanterns,
  ripples,
  confettiActive,
}: {
  foundTreasures: Set<string>
  onTreasureFind: (spot: TreasureSpot) => void
  onSeaTap: (x: number, y: number) => void
  hearts: CatchableHeart[]
  onHeartCatch: (id: number) => void
  lanterns: Lantern[]
  ripples: Ripple[]
  confettiActive: boolean
}) {
  return (
    <svg
      viewBox="0 0 400 800"
      xmlns="http://www.w3.org/2000/svg"
      className="absolute inset-0 w-full h-full"
      preserveAspectRatio="xMidYMid slice"
      style={{ imageRendering: 'auto' }}
    >
      <PixelFilters />
      <Sky />
      <Stars />
      <Sun />
      <Clouds />
      <Birds />
      <Building foundTreasures={foundTreasures} onTreasureFind={onTreasureFind} />
      <Fireflies />
      <Sea onSeaTap={onSeaTap} />
      <Boat />
      <SeaRipples ripples={ripples} />
      <FloatingPetals />
      <CatchableHearts hearts={hearts} onCatch={onHeartCatch} />
      <WishLanterns lanterns={lanterns} />
      <ConfettiBurst active={confettiActive} />
    </svg>
  )
}

// =============================================
// GAME UI OVERLAY
// =============================================
const WISH_WORDS = ['Wishing', 'you', 'endless', 'joy', 'love', 'and', 'magic', 'forever']

function GameUI({
  heartsCaught,
  heartsTarget,
  foundTreasures,
  totalTreasures,
  lanternsReleased,
  allComplete,
  treasureMelodyPlayed,
}: {
  heartsCaught: number
  heartsTarget: number
  foundTreasures: number
  totalTreasures: number
  lanternsReleased: number
  allComplete: boolean
  treasureMelodyPlayed: boolean
}) {
  return (
    <div className="absolute top-0 left-0 right-0 pointer-events-none" style={{ paddingTop: 'max(env(safe-area-inset-top, 0px), 8px)' }}>
      {/* Progress indicators */}
      <div className="flex justify-center gap-3 px-3 pt-2 flex-wrap">
        {/* Hearts counter */}
        <div
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-full font-mono text-xs"
          style={{
            background: 'rgba(33, 39, 51, 0.7)',
            backdropFilter: 'blur(8px)',
            color: heartsCaught >= heartsTarget ? C.sunGlow : C.textSub,
            border: `1px solid ${heartsCaught >= heartsTarget ? C.sunGlow + '44' : C.sea3 + '33'}`,
          }}
        >
          <span style={{ fontSize: '14px' }}>{'♥'}</span>
          <span>{heartsCaught}/{heartsTarget}</span>
          {heartsCaught >= heartsTarget && <span>{'✓'}</span>}
        </div>

        {/* Treasure counter */}
        <div
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-full font-mono text-xs"
          style={{
            background: 'rgba(33, 39, 51, 0.7)',
            backdropFilter: 'blur(8px)',
            color: foundTreasures >= totalTreasures ? C.sunGlow : C.textSub,
            border: `1px solid ${foundTreasures >= totalTreasures ? C.sunGlow + '44' : C.sea3 + '33'}`,
          }}
        >
          <span style={{ fontSize: '14px' }}>{'✦'}</span>
          <span>{foundTreasures}/{totalTreasures}</span>
          {foundTreasures >= totalTreasures && <span>{'✓'}</span>}
        </div>

        {/* Lanterns counter */}
        <div
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-full font-mono text-xs"
          style={{
            background: 'rgba(33, 39, 51, 0.7)',
            backdropFilter: 'blur(8px)',
            color: lanternsReleased >= WISH_WORDS.length ? C.sunGlow : C.textSub,
            border: `1px solid ${lanternsReleased >= WISH_WORDS.length ? C.sunGlow + '44' : C.sea3 + '33'}`,
          }}
        >
          <span style={{ fontSize: '14px' }}>{'◐'}</span>
          <span>{lanternsReleased}/{WISH_WORDS.length}</span>
          {lanternsReleased >= WISH_WORDS.length && <span>{'✓'}</span>}
        </div>
      </div>

      {/* Hint text */}
      {!allComplete && (
        <div className="text-center mt-2 px-4">
          <p
            className="font-mono text-xs tracking-wide"
            style={{ color: C.textSub, opacity: 0.6, textShadow: '0 1px 4px rgba(0,0,0,0.5)' }}
          >
            tap hearts, find hidden treasures, touch the sky & sea
          </p>
        </div>
      )}

      {/* Treasure melody notification */}
      {treasureMelodyPlayed && (
        <div className="flex justify-center mt-2">
          <div
            className="px-4 py-2 rounded-lg font-mono text-xs"
            style={{
              background: 'rgba(33, 39, 51, 0.85)',
              color: C.sunGlow,
              border: `1px solid ${C.sunGlow}44`,
              animation: 'fadeIn 0.5s ease-out',
            }}
          >
            melody unlocked!
          </div>
        </div>
      )}
    </div>
  )
}

// =============================================
// BIRTHDAY OVERLAY (with completion state)
// =============================================
function BirthdayOverlay({ allComplete }: { allComplete: boolean }) {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const t = setTimeout(() => setVisible(true), 800)
    return () => clearTimeout(t)
  }, [])

  return (
    <div
      className={`absolute inset-0 flex flex-col items-center pointer-events-none transition-opacity duration-[2000ms] ${visible ? 'opacity-100' : 'opacity-0'}`}
      style={{ paddingTop: 'max(env(safe-area-inset-top, 0px), 12px)' }}
    >
      {/* Title area — below the game UI */}
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
        <div
          className="mt-3 font-mono tracking-wider"
          style={{
            color: C.textSub,
            fontSize: 'clamp(0.7rem, 2.5vw, 1rem)',
            textShadow: '0 1px 8px rgba(0,0,0,0.4)',
          }}
        >
          a little world, just for you
        </div>
      </div>

      {/* Spacer */}
      <div className="flex-1 min-h-0" />

      {/* Note card — revealed when all games complete */}
      <div
        className={`flex-shrink-0 mx-5 mb-8 px-6 py-5 rounded-xl pointer-events-auto max-w-sm w-full sm:mb-12 sm:px-8 sm:py-6 transition-all duration-1000 ${allComplete ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4 pointer-events-none'}`}
        style={{
          background: 'rgba(33, 39, 51, 0.85)',
          backdropFilter: 'blur(12px)',
          WebkitBackdropFilter: 'blur(12px)',
          border: `1px solid ${allComplete ? C.sunGlow + '44' : C.sea3 + '33'}`,
          boxShadow: allComplete
            ? `0 8px 32px rgba(0,0,0,0.35), inset 0 1px 0 ${C.sunGlow}28, 0 0 40px ${C.sunGlow}15`
            : `0 8px 32px rgba(0,0,0,0.35), inset 0 1px 0 ${C.seaHighlight}18`,
        }}
      >
        <div className="text-center">
          <p
            className="font-mono leading-relaxed italic m-0"
            style={{
              color: C.textSub,
              fontSize: 'clamp(0.8rem, 2.8vw, 0.95rem)',
              lineHeight: '1.7',
            }}
          >
            You found all the secrets! This sunset, this melody, these little moments — they&apos;re all for you. Happy birthday, Lara.
          </p>
        </div>
      </div>

      {/* Bottom safe area */}
      <div style={{ height: 'env(safe-area-inset-bottom, 0px)', flexShrink: 0 }} />
    </div>
  )
}

// =============================================
// MAIN PAGE COMPONENT
// =============================================
export default function FarePage() {
  const [mounted, setMounted] = useState(false)

  // Game state
  const [heartsCaught, setHeartsCaught] = useState(0)
  const [foundTreasures, setFoundTreasures] = useState<Set<string>>(new Set())
  const [lanternsReleased, setLanternsReleased] = useState(0)
  const [confettiActive, setConfettiActive] = useState(false)
  const [treasureMelodyPlayed, setTreasureMelodyPlayed] = useState(false)

  // Interactive elements
  const [hearts, setHearts] = useState<CatchableHeart[]>([])
  const [lanterns, setLanterns] = useState<Lantern[]>([])
  const [ripples, setRipples] = useState<Ripple[]>([])

  const heartIdRef = useRef(0)
  const lanternIdRef = useRef(0)
  const rippleIdRef = useRef(0)
  const animFrameRef = useRef<number>(0)

  const HEARTS_TARGET = 15

  const allComplete = heartsCaught >= HEARTS_TARGET
    && foundTreasures.size >= TREASURE_SPOTS.length
    && lanternsReleased >= WISH_WORDS.length

  useEffect(() => {
    setMounted(true)
  }, [])

  // Heart spawner
  useEffect(() => {
    if (!mounted) return
    const spawn = () => {
      const rng = Math.random
      const heart: CatchableHeart = {
        id: heartIdRef.current++,
        x: 40 + rng() * 320,
        y: 750,
        size: 5 + rng() * 5,
        speed: 0.4 + rng() * 0.5,
        drift: (rng() - 0.5) * 0.3,
        color: rng() > 0.5 ? C.heartPink : C.heartRed,
        caught: false,
        fadeOut: false,
      }
      setHearts(prev => [...prev.slice(-20), heart]) // keep max 20
    }

    const interval = setInterval(spawn, 2000)
    spawn() // first one immediately
    return () => clearInterval(interval)
  }, [mounted])

  // Animation loop for hearts and lanterns
  useEffect(() => {
    if (!mounted) return
    let lastTime = performance.now()

    const tick = (now: number) => {
      const dt = (now - lastTime) / 1000
      lastTime = now

      // Move hearts upward
      setHearts(prev =>
        prev
          .map(h => ({
            ...h,
            y: h.y - h.speed * 60 * dt,
            x: h.x + h.drift * 60 * dt,
          }))
          .filter(h => h.y > -30 && !h.caught)
      )

      // Move lanterns upward
      setLanterns(prev =>
        prev
          .map(l => ({
            ...l,
            y: l.y - 0.3 * 60 * dt,
            opacity: l.y < l.targetY ? Math.max(0, l.opacity - 0.005 * 60 * dt) : l.opacity,
          }))
          .filter(l => l.opacity > 0)
      )

      animFrameRef.current = requestAnimationFrame(tick)
    }

    animFrameRef.current = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(animFrameRef.current)
  }, [mounted])

  // Clean up old ripples
  useEffect(() => {
    if (!mounted) return
    const interval = setInterval(() => {
      setRipples(prev => {
        const now = Date.now()
        return prev.filter(r => now - r.birth < 1500)
      })
    }, 2000)
    return () => clearInterval(interval)
  }, [mounted])

  // Trigger confetti + melody when all complete
  useEffect(() => {
    if (allComplete && !confettiActive) {
      setConfettiActive(true)
      soundEngine?.playConfetti()
      setTimeout(() => setConfettiActive(false), 4000)
    }
  }, [allComplete, confettiActive])

  const handleHeartCatch = useCallback((id: number) => {
    setHearts(prev => prev.filter(h => h.id !== id))
    setHeartsCaught(prev => prev + 1)
    soundEngine?.playHeartCatch()
  }, [])

  const handleTreasureFind = useCallback((spot: TreasureSpot) => {
    setFoundTreasures(prev => {
      const next = new Set(prev)
      next.add(spot.id)

      // Play the note
      soundEngine?.playNote(spot.note, 1.0, 0.3)

      // If all found, play the full melody
      if (next.size === TREASURE_SPOTS.length) {
        setTimeout(() => {
          soundEngine?.playMelody(TREASURE_MELODY, 250)
          setTreasureMelodyPlayed(true)
        }, 800)
      }

      return next
    })
  }, [])

  const handleSeaTap = useCallback((x: number, y: number) => {
    // Add ripple
    setRipples(prev => [...prev, { id: rippleIdRef.current++, x, y, birth: Date.now() }])
    // Play note
    soundEngine?.playSeaNote(x)
  }, [])

  const handleSkyTap = useCallback((e: React.MouseEvent | React.TouchEvent) => {
    // Release a wish lantern on sky tap (above buildings, y < 260 in SVG space)
    if (lanternsReleased >= WISH_WORDS.length) return

    const target = e.target as HTMLElement
    // Only trigger on the vignette/background overlay, not on SVG elements
    if (target.tagName === 'svg' || target.closest('svg')) return

    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect()
    let clientX: number, clientY: number
    if ('touches' in e) {
      clientX = e.touches[0].clientX
      clientY = e.touches[0].clientY
    } else {
      clientX = e.clientX
      clientY = e.clientY
    }

    // Convert to relative position
    const relX = ((clientX - rect.left) / rect.width) * 400
    const relY = ((clientY - rect.top) / rect.height) * 800

    // Only in the sky area (above y=260)
    if (relY > 260) return

    const word = WISH_WORDS[lanternsReleased]
    const lantern: Lantern = {
      id: lanternIdRef.current++,
      x: relX,
      y: relY,
      targetY: relY - 200,
      word: word || '',
      opacity: 1,
    }

    setLanterns(prev => [...prev, lantern])
    setLanternsReleased(prev => prev + 1)
    soundEngine?.playLanternRelease()
  }, [lanternsReleased])

  if (!mounted) return null

  return (
    <div
      className="fixed inset-0 overflow-hidden"
      style={{ background: C.sky1, cursor: 'default' }}
      onClick={handleSkyTap}
    >
      <PixelScene
        foundTreasures={foundTreasures}
        onTreasureFind={handleTreasureFind}
        onSeaTap={handleSeaTap}
        hearts={hearts}
        onHeartCatch={handleHeartCatch}
        lanterns={lanterns}
        ripples={ripples}
        confettiActive={confettiActive}
      />
      <BirthdayOverlay allComplete={allComplete} />

      {/* Game UI */}
      <GameUI
        heartsCaught={heartsCaught}
        heartsTarget={HEARTS_TARGET}
        foundTreasures={foundTreasures.size}
        totalTreasures={TREASURE_SPOTS.length}
        lanternsReleased={lanternsReleased}
        allComplete={allComplete}
        treasureMelodyPlayed={treasureMelodyPlayed}
      />

      {/* Vignette overlay */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: 'radial-gradient(ellipse at center, transparent 40%, rgba(0,0,0,0.35) 100%)',
        }}
      />
    </div>
  )
}
