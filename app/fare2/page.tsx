'use client'

import { useEffect, useState, useMemo, useCallback, useRef } from 'react'

// --- Pixel-art color palette ---
const C = {
  sky1: '#ff6b35', sky2: '#ff8c42', sky3: '#ffb366', sky4: '#ffd4a3',
  sky5: '#ffe8cc', sky6: '#e8d5f5', sun: '#fff4c1', sunGlow: '#ffdd57',
  sea1: '#2d6a4f', sea2: '#40916c', sea3: '#52b788', seaHighlight: '#95d5b2',
  building1: '#8b6f47', building2: '#a0845c', building3: '#c4a97d', buildingLight: '#e8d5b7',
  roof: '#c0392b', roofDark: '#96281b', window: '#ffd580', windowDark: '#cc8800',
  green1: '#588157', green2: '#6b9a5b', green3: '#a7c957',
  flowerPink: '#ffb3c6', flowerWhite: '#fff0f5',
  heartPink: '#ff6b8a', heartRed: '#e63946',
  cloud: 'rgba(255,240,230,0.6)',
  textMain: '#fff8f0', textSub: '#ffd4a3',
  skin: '#f5cba7', skinDark: '#e0a87c', hairDark: '#5c3d2e', hairLight: '#d4a574',
  dressRed: '#e63946', dressPink: '#ffb3c6', shirtBlue: '#4a90d9',
  shirtGreen: '#2d6a4f', pants: '#3d3d3d', cobble: '#9c8b7a',
}

// =============================================
// SOUND ENGINE (lazy init)
// =============================================
// Romantic melodies — user picks from selector
type MelodyNote = { note: string; dur: number }

const SONGS: { name: string; emoji: string; notes: MelodyNote[] }[] = [
  // 1. Für Elise — Beethoven
  { name: 'Für Elise', emoji: '🎹', notes: [
    { note: 'E5', dur: 0.4 }, { note: 'Eb5', dur: 0.4 }, { note: 'E5', dur: 0.4 },
    { note: 'Eb5', dur: 0.4 }, { note: 'E5', dur: 0.4 }, { note: 'B4', dur: 0.4 },
    { note: 'D5', dur: 0.4 }, { note: 'C5', dur: 0.4 }, { note: 'A4', dur: 0.6 },
    { note: 'C4', dur: 0.4 }, { note: 'E4', dur: 0.4 }, { note: 'A4', dur: 0.4 },
    { note: 'B4', dur: 0.6 },
    { note: 'E4', dur: 0.4 }, { note: 'Ab4', dur: 0.4 }, { note: 'B4', dur: 0.4 },
    { note: 'C5', dur: 0.6 },
    { note: 'E5', dur: 0.4 }, { note: 'Eb5', dur: 0.4 }, { note: 'E5', dur: 0.4 },
    { note: 'Eb5', dur: 0.4 }, { note: 'E5', dur: 0.4 }, { note: 'B4', dur: 0.4 },
    { note: 'D5', dur: 0.4 }, { note: 'C5', dur: 0.4 }, { note: 'A4', dur: 0.6 },
  ]},
  // 2. La Vie en Rose
  { name: 'La Vie en Rose', emoji: '🌹', notes: [
    { note: 'G4', dur: 0.5 }, { note: 'A4', dur: 0.4 }, { note: 'C5', dur: 0.6 },
    { note: 'A4', dur: 0.4 }, { note: 'C5', dur: 0.5 }, { note: 'D5', dur: 0.6 },
    { note: 'C5', dur: 0.4 }, { note: 'A4', dur: 0.4 }, { note: 'G4', dur: 0.8 },
    { note: 'G4', dur: 0.4 }, { note: 'A4', dur: 0.4 }, { note: 'C5', dur: 0.5 },
    { note: 'A4', dur: 0.4 }, { note: 'C5', dur: 0.5 }, { note: 'E5', dur: 0.6 },
    { note: 'D5', dur: 0.4 }, { note: 'C5', dur: 0.5 }, { note: 'A4', dur: 0.4 },
    { note: 'G4', dur: 0.8 },
    { note: 'E4', dur: 0.4 }, { note: 'F4', dur: 0.4 }, { note: 'G4', dur: 0.6 },
    { note: 'C5', dur: 0.8 },
  ]},
  // 3. A Thousand Years — Christina Perri (Twilight)
  { name: 'A Thousand Years', emoji: '🌙', notes: [
    { note: 'E4', dur: 0.5 }, { note: 'G4', dur: 0.4 }, { note: 'A4', dur: 0.6 },
    { note: 'G4', dur: 0.4 }, { note: 'E4', dur: 0.6 }, { note: 'D4', dur: 0.4 },
    { note: 'E4', dur: 0.8 },
    { note: 'E4', dur: 0.5 }, { note: 'G4', dur: 0.4 }, { note: 'A4', dur: 0.6 },
    { note: 'B4', dur: 0.4 }, { note: 'C5', dur: 0.6 }, { note: 'B4', dur: 0.4 },
    { note: 'A4', dur: 0.8 },
    { note: 'A4', dur: 0.4 }, { note: 'G4', dur: 0.4 }, { note: 'E4', dur: 0.5 },
    { note: 'D4', dur: 0.4 }, { note: 'C4', dur: 0.6 }, { note: 'D4', dur: 0.4 },
    { note: 'E4', dur: 0.8 },
    { note: 'G4', dur: 0.4 }, { note: 'A4', dur: 0.6 }, { note: 'C5', dur: 0.8 },
  ]},
  // 4. Decode — Paramore (Twilight)
  { name: 'Decode', emoji: '🦇', notes: [
    { note: 'E4', dur: 0.4 }, { note: 'E4', dur: 0.3 }, { note: 'D4', dur: 0.4 },
    { note: 'C4', dur: 0.4 }, { note: 'D4', dur: 0.3 }, { note: 'E4', dur: 0.5 },
    { note: 'E4', dur: 0.3 }, { note: 'G4', dur: 0.4 }, { note: 'F4', dur: 0.4 },
    { note: 'E4', dur: 0.4 }, { note: 'D4', dur: 0.3 }, { note: 'C4', dur: 0.6 },
    { note: 'C4', dur: 0.3 }, { note: 'D4', dur: 0.3 }, { note: 'E4', dur: 0.4 },
    { note: 'E4', dur: 0.3 }, { note: 'F4', dur: 0.4 }, { note: 'G4', dur: 0.5 },
    { note: 'A4', dur: 0.4 }, { note: 'G4', dur: 0.3 }, { note: 'F4', dur: 0.4 },
    { note: 'E4', dur: 0.4 }, { note: 'D4', dur: 0.3 }, { note: 'E4', dur: 0.6 },
    { note: 'G4', dur: 0.4 }, { note: 'A4', dur: 0.5 }, { note: 'G4', dur: 0.3 },
    { note: 'E4', dur: 0.4 }, { note: 'D4', dur: 0.4 }, { note: 'C4', dur: 0.6 },
  ]},
]

let currentSongIndex = 0
let melodyIndex = 0

class SoundEngine {
  private ctx: AudioContext | null = null
  private notes: Record<string, number> = {
    C4: 261.63, D4: 293.66, E4: 329.63, F4: 349.23, G4: 392.00, Ab4: 415.30, A4: 440.00, Bb4: 466.16, B4: 493.88,
    C5: 523.25, D5: 587.33, Eb5: 622.25, E5: 659.25, F5: 698.46, G5: 783.99, A5: 880.00, B5: 987.77,
  }
  private getCtx(): AudioContext {
    if (!this.ctx) this.ctx = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)()
    if (this.ctx.state === 'suspended') this.ctx.resume()
    return this.ctx
  }
  playNote(name: string, dur = 0.5, vol = 0.3) {
    try {
      const ctx = this.getCtx(), freq = this.notes[name]
      if (!freq) return
      const o = ctx.createOscillator(), g = ctx.createGain()
      o.type = 'sine'; o.frequency.value = freq
      g.gain.setValueAtTime(vol, ctx.currentTime)
      g.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + dur)
      o.connect(g); g.connect(ctx.destination); o.start(); o.stop(ctx.currentTime + dur)
    } catch { /* */ }
  }
  playNextMelodyNote() {
    const song = SONGS[currentSongIndex]
    const entry = song.notes[melodyIndex % song.notes.length]
    this.playNote(entry.note, entry.dur, 0.35)
    melodyIndex++
  }
  getSongName() { return SONGS[currentSongIndex].name }
  setSong(idx: number) { currentSongIndex = idx; melodyIndex = 0 }
  playMelody(notes: string[], tempo = 300) { notes.forEach((n, i) => setTimeout(() => this.playNote(n, 0.8, 0.25), i * tempo)) }
  playHeartCatch() { this.playNote('E5', 0.3, 0.2); setTimeout(() => this.playNote('G5', 0.3, 0.2), 80) }
  playLanternRelease() { this.playNote('C5', 1.0, 0.15); setTimeout(() => this.playNote('E5', 0.8, 0.1), 200) }
  playConfetti() { ['C5','E5','G5','A5','G5','E5','C5','E5','G5','C5'].forEach((n, i) => setTimeout(() => this.playNote(n, 0.4, 0.2), i * 100)) }
}
let _snd: SoundEngine | null = null
function snd(): SoundEngine { if (!_snd) _snd = new SoundEngine(); return _snd }

// =============================================
// HELPERS
// =============================================
function seededRandom(seed: number) {
  let s = seed
  return () => { s = (s * 16807) % 2147483647; return s / 2147483647 }
}

interface ViewBox { x: number; y: number; w: number; h: number }

/** Screen coords → SVG viewBox coords (handles xMidYMid slice) */
function screenToSvg(clientX: number, clientY: number, svgEl: SVGSVGElement | null, vb: ViewBox): { x: number; y: number } | null {
  if (!svgEl) return null
  const r = svgEl.getBoundingClientRect()
  const scale = Math.max(r.width / vb.w, r.height / vb.h)
  const ox = (r.width - vb.w * scale) / 2
  const oy = (r.height - vb.h * scale) / 2
  return { x: vb.x + (clientX - r.left - ox) / scale, y: vb.y + (clientY - r.top - oy) / scale }
}

function clampVB(vb: ViewBox): ViewBox {
  const w = Math.min(400, Math.max(400 / 3.5, vb.w))
  const ratio = typeof window !== 'undefined' ? window.innerHeight / window.innerWidth : 2
  const h = Math.min(800, Math.max(w, w * Math.min(2.5, Math.max(0.8, ratio))))
  const x = Math.max(0, Math.min(400 - w, vb.x))
  const y = Math.max(0, Math.min(800 - h, vb.y))
  return { x, y, w, h }
}

// =============================================
// SVG FILTERS
// =============================================
function Defs() {
  return (
    <defs>
      <filter id="glow"><feGaussianBlur stdDeviation="3" result="b" /><feMerge><feMergeNode in="b" /><feMergeNode in="SourceGraphic" /></feMerge></filter>
      <filter id="softGlow"><feGaussianBlur stdDeviation="8" result="b" /><feMerge><feMergeNode in="b" /><feMergeNode in="SourceGraphic" /></feMerge></filter>
      <linearGradient id="skyGrad" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stopColor={C.sky6} /><stop offset="20%" stopColor={C.sky5} /><stop offset="40%" stopColor={C.sky4} />
        <stop offset="60%" stopColor={C.sky3} /><stop offset="80%" stopColor={C.sky2} /><stop offset="100%" stopColor={C.sky1} />
      </linearGradient>
      <linearGradient id="seaGrad" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stopColor={C.seaHighlight} stopOpacity="0.4" /><stop offset="30%" stopColor={C.sea3} stopOpacity="0.3" /><stop offset="100%" stopColor={C.sea1} stopOpacity="0" />
      </linearGradient>
      <linearGradient id="sunRef" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stopColor={C.sunGlow} stopOpacity="0.45" /><stop offset="100%" stopColor={C.sunGlow} stopOpacity="0" />
      </linearGradient>
    </defs>
  )
}

// =============================================
// BACKGROUND
// =============================================
function Background() {
  const stars = useMemo(() => { const r = seededRandom(13); return Array.from({ length: 30 }, () => ({ x: r() * 400, y: r() * 200, s: 1 + r() * 2, d: 2 + r() * 3, dl: r() * 4 })) }, [])
  const clouds = [{ x: 20, y: 50, s: 0.9, d: 70 }, { x: 180, y: 30, s: 0.6, d: 90 }, { x: 300, y: 70, s: 0.75, d: 80 }, { x: 100, y: 100, s: 0.5, d: 95 }]
  const birds = [{ x: 60, y: 120, d: 20, dl: 0 }, { x: 68, y: 126, d: 20, dl: 0.3 }, { x: 280, y: 150, d: 25, dl: 5 }, { x: 288, y: 156, d: 25, dl: 5.4 }, { x: 170, y: 90, d: 18, dl: 8 }]

  return (
    <g>
      {/* Sky */}
      <rect x="0" y="0" width="400" height="800" fill="url(#skyGrad)" />
      {/* Stars */}
      {stars.map((s, i) => <rect key={`s${i}`} x={s.x} y={s.y} width={s.s} height={s.s} fill="#fff8f0" rx="0.3"><animate attributeName="opacity" values="0.1;0.5;0.1" dur={`${s.d}s`} begin={`${s.dl}s`} repeatCount="indefinite" /></rect>)}
      {/* Sun */}
      <circle cx="200" cy="370" r="80" fill={C.sky3} opacity="0.15" filter="url(#softGlow)"><animate attributeName="r" values="80;88;80" dur="6s" repeatCount="indefinite" /></circle>
      <circle cx="200" cy="370" r="55" fill={C.sunGlow} opacity="0.25" filter="url(#softGlow)"><animate attributeName="r" values="55;62;55" dur="4s" repeatCount="indefinite" /></circle>
      <circle cx="200" cy="370" r="35" fill={C.sunGlow} opacity="0.4" filter="url(#glow)"><animate attributeName="r" values="35;38;35" dur="3s" repeatCount="indefinite" /></circle>
      <circle cx="200" cy="370" r="24" fill={C.sun} opacity="0.95"><animate attributeName="r" values="24;26;24" dur="5s" repeatCount="indefinite" /></circle>
      {/* Clouds */}
      {clouds.map((c, i) => (
        <g key={`c${i}`} opacity="0.6" transform={`scale(${c.s})`}><g>
          <animateTransform attributeName="transform" type="translate" values={`${c.x},${c.y};${c.x + 500},${c.y}`} dur={`${c.d}s`} repeatCount="indefinite" />
          <rect x="0" y="8" width="6" height="6" fill={C.cloud} rx="1" /><rect x="6" y="4" width="6" height="10" fill={C.cloud} rx="1" />
          <rect x="12" y="0" width="10" height="14" fill={C.cloud} rx="1" /><rect x="22" y="2" width="8" height="12" fill={C.cloud} rx="1" />
          <rect x="30" y="4" width="8" height="10" fill={C.cloud} rx="1" /><rect x="38" y="6" width="6" height="8" fill={C.cloud} rx="1" />
        </g></g>
      ))}
      {/* Birds */}
      {birds.map((b, i) => (
        <g key={`b${i}`} opacity="0.5">
          <polyline points="-3,0 0,-2 3,0" fill="none" stroke="#5c4a3a" strokeWidth="1.5" strokeLinecap="round">
            <animate attributeName="points" values="-3,0 0,-2 3,0;-3,-1 0,0 3,-1;-3,0 0,-2 3,0" dur="0.8s" repeatCount="indefinite" />
          </polyline>
          <animateTransform attributeName="transform" type="translate" values={`${b.x},${b.y};${b.x + 200},${b.y - 15}`} dur={`${b.d}s`} begin={`${b.dl}s`} repeatCount="indefinite" />
        </g>
      ))}
    </g>
  )
}

// =============================================
// DETAILED CITY with hidden treasure scenes
// =============================================
interface TreasureSpot {
  id: string; cx: number; cy: number; r: number; note: string
}

const TREASURE_SPOTS: TreasureSpot[] = [
  { id: 'dancing', cx: 47, cy: 387, r: 20, note: 'C4' },   // couple dancing
  { id: 'pizza', cx: 107, cy: 390, r: 20, note: 'E4' },     // couple eating pizza
  { id: 'vintage', cx: 205, cy: 382, r: 20, note: 'G4' },   // vintage shop
  { id: 'walking', cx: 285, cy: 394, r: 20, note: 'C5' },   // couple walking
]
const TREASURE_MELODY = ['C4', 'E4', 'G4', 'A4', 'C5', 'E5', 'G5', 'E5', 'C5']

function DetailedCity({ foundTreasures, zoom }: { foundTreasures: Set<string>; zoom: number }) {
  const showHints = zoom >= 1.8

  return (
    <g>
      {/* === LEFT CLUSTER === */}
      {/* Bell tower */}
      <rect x="20" y="260" width="40" height="140" fill={C.building2} />
      <rect x="20" y="260" width="40" height="5" fill={C.building3} />
      <polygon points="18,260 40,232 62,260" fill={C.roof} />
      <polygon points="18,260 40,236 40,260" fill={C.roofDark} />
      {[278, 300, 322, 348, 370].map((y, i) => (
        <g key={`tw${i}`}>
          <rect x="33" y={y} width="8" height="12" fill={C.windowDark} />
          <rect x="34" y={y + 1} width="6" height="10" fill={C.window}>
            <animate attributeName="opacity" values="0.7;1;0.7" dur={`${2 + i * 0.3}s`} repeatCount="indefinite" />
          </rect>
        </g>
      ))}
      {/* Flower box on tower window */}
      <rect x="31" y="324" width="12" height="2" fill={C.green2} />
      <rect x="32" y="322" width="3" height="3" fill={C.flowerPink} rx="1" />
      <rect x="37" y="321" width="3" height="4" fill={C.dressRed} rx="1" />

      {/* Main building left */}
      <rect x="60" y="300" width="70" height="100" fill={C.building1} />
      <rect x="60" y="300" width="70" height="4" fill={C.building3} />
      <polygon points="56,300 95,278 134,300" fill={C.roof} />
      <polygon points="56,300 95,282 95,300" fill={C.roofDark} />
      {[72, 92, 112].map((x, i) => (
        <g key={`bw1${i}`}>
          <rect x={x} y="318" width="10" height="14" fill={C.windowDark} />
          <rect x={x + 1} y="319" width="8" height="12" fill={C.window}><animate attributeName="opacity" values="0.6;1;0.6" dur={`${2.5 + i * 0.4}s`} repeatCount="indefinite" /></rect>
          <rect x={x} y="348" width="10" height="14" fill={C.windowDark} />
          <rect x={x + 1} y="349" width="8" height="12" fill={C.window}><animate attributeName="opacity" values="0.8;0.5;0.8" dur={`${3 + i * 0.3}s`} repeatCount="indefinite" /></rect>
        </g>
      ))}
      {/* Laundry line between buildings */}
      <line x1="58" y1="315" x2="22" y2="317" stroke="#fff8f0" strokeWidth="0.4" opacity="0.5" />
      <rect x="35" y="314" width="3" height="4" fill="#fff8f0" opacity="0.4" />
      <rect x="42" y="313" width="4" height="5" fill={C.flowerPink} opacity="0.4" />

      {/* Café awning over left building ground floor */}
      <polygon points="62,375 130,375 128,370 64,370" fill={C.dressRed} opacity="0.8" />
      <polygon points="62,375 130,375 128,370 64,370" fill={C.roofDark} opacity="0.3" />
      {/* Café tables */}
      <rect x="75" y="385" width="8" height="1.5" fill={C.building3} />
      <rect x="78" y="386" width="2" height="7" fill={C.building3} />
      <rect x="118" y="385" width="8" height="1.5" fill={C.building3} />
      <rect x="121" y="386" width="2" height="7" fill={C.building3} />
      {/* Flower pots at café */}
      <rect x="68" y="390" width="4" height="4" fill={C.building3} />
      <rect x="69" y="388" width="3" height="3" fill={C.green2} rx="1" />
      <rect x="128" y="390" width="4" height="4" fill={C.building3} />
      <rect x="129" y="388" width="3" height="3" fill={C.flowerPink} rx="1" />

      {/* === TREASURE 1: Couple dancing in street === */}
      <g opacity={foundTreasures.has('dancing') ? 1 : 0.7}>
        {/* String lights above */}
        <line x1="22" y1="375" x2="58" y2="375" stroke={C.sunGlow} strokeWidth="0.4" opacity="0.6" />
        {[28, 36, 44, 52].map(x => (
          <circle key={`dl${x}`} cx={x} cy="375" r="1" fill={C.sunGlow} opacity="0.7">
            <animate attributeName="opacity" values="0.4;0.9;0.4" dur="2s" begin={`${x * 0.05}s`} repeatCount="indefinite" />
          </circle>
        ))}
        {/* Small plaza floor */}
        <rect x="30" y="392" width="34" height="6" fill={C.cobble} opacity="0.3" rx="1" />
        {/* Woman (red dress) */}
        <rect x="38" y="382" width="3" height="3" fill={C.hairLight} rx="0.5" />
        <rect x="37" y="385" width="5" height="4" fill={C.dressRed} rx="0.3" />
        <rect x="38" y="389" width="2" height="2" fill={C.dressRed} />
        <rect x="41" y="389" width="2" height="2" fill={C.dressRed} />
        {/* Man (green shirt) */}
        <rect x="49" y="382" width="3" height="3" fill={C.hairDark} rx="0.5" />
        <rect x="48" y="385" width="5" height="4" fill={C.shirtGreen} rx="0.3" />
        <rect x="49" y="389" width="2" height="2" fill={C.pants} />
        <rect x="51" y="389" width="2" height="2" fill={C.pants} />
        {/* Joined hands */}
        <rect x="42" y="386" width="6" height="1.5" fill={C.skin} rx="0.5" />
        {/* Discovery glow */}
        {foundTreasures.has('dancing') && (
          <circle cx="47" cy="387" r="18" fill={C.sunGlow} opacity="0.12" filter="url(#softGlow)">
            <animate attributeName="opacity" values="0.08;0.18;0.08" dur="3s" repeatCount="indefinite" />
          </circle>
        )}
      </g>

      {/* Connecting building */}
      <rect x="130" y="330" width="48" height="70" fill={C.building3} />
      <rect x="130" y="330" width="48" height="3" fill={C.buildingLight} />
      <polygon points="128,330 154,314 180,330" fill={C.roof} />
      {[140, 160].map((x, i) => (
        <g key={`bw2${i}`}>
          <rect x={x} y="344" width="8" height="12" fill={C.windowDark} />
          <rect x={x + 1} y="345" width="6" height="10" fill={C.window}><animate attributeName="opacity" values="0.9;0.5;0.9" dur={`${2 + i}s`} repeatCount="indefinite" /></rect>
        </g>
      ))}

      {/* === TREASURE 2: Couple eating pizza === */}
      <g opacity={foundTreasures.has('pizza') ? 1 : 0.7}>
        {/* Table */}
        <rect x="99" y="387" width="16" height="1.5" fill={C.buildingLight} />
        <rect x="106" y="388" width="2" height="6" fill={C.building2} />
        {/* Pizza on table */}
        <circle cx="104" cy="386" r="2" fill={C.sunGlow} opacity="0.8" />
        <rect x="107" y="385" width="3" height="2" fill={C.dressRed} rx="0.5" />
        {/* Woman (pink top) */}
        <rect x="95" y="381" width="3" height="3" fill={C.hairLight} rx="0.5" />
        <rect x="94" y="384" width="5" height="3" fill={C.dressPink} rx="0.3" />
        <rect x="94" y="387" width="5" height="3" fill={C.pants} />
        {/* Man (blue shirt) */}
        <rect x="113" y="381" width="3" height="3" fill={C.hairDark} rx="0.5" />
        <rect x="112" y="384" width="5" height="3" fill={C.shirtBlue} rx="0.3" />
        <rect x="112" y="387" width="5" height="3" fill={C.pants} />
        {/* Candle on table */}
        <rect x="106" y="383" width="1" height="3" fill={C.buildingLight} />
        <circle cx="106.5" cy="382.5" r="0.8" fill={C.sunGlow}>
          <animate attributeName="opacity" values="0.6;1;0.6" dur="1.5s" repeatCount="indefinite" />
        </circle>
        {foundTreasures.has('pizza') && (
          <circle cx="107" cy="390" r="18" fill={C.sunGlow} opacity="0.12" filter="url(#softGlow)">
            <animate attributeName="opacity" values="0.08;0.18;0.08" dur="3s" repeatCount="indefinite" />
          </circle>
        )}
      </g>

      {/* Center gap — street with cobblestones */}
      <g opacity="0.25">
        {Array.from({ length: 12 }, (_, i) => (
          <rect key={`cb${i}`} x={180 + (i % 4) * 10} y={385 + Math.floor(i / 4) * 4} width="8" height="3" fill={C.cobble} rx="0.5" />
        ))}
      </g>

      {/* === TREASURE 3: Vintage shop === */}
      <g opacity={foundTreasures.has('vintage') ? 1 : 0.7}>
        {/* Shop front */}
        <rect x="188" y="365" width="34" height="35" fill={C.building2} />
        <rect x="188" y="365" width="34" height="3" fill={C.buildingLight} />
        {/* Awning */}
        <polygon points="186,370 224,370 222,366 188,366" fill="#7b4a8a" opacity="0.7" />
        {/* Display window */}
        <rect x="191" y="373" width="14" height="12" fill={C.windowDark} />
        <rect x="192" y="374" width="12" height="10" fill={C.window} opacity="0.4" />
        {/* Dress in window */}
        <rect x="195" y="376" width="3" height="1.5" fill={C.flowerPink} rx="0.3" />
        <rect x="194" y="377.5" width="5" height="4" fill={C.dressRed} rx="0.3" />
        {/* Hat in window */}
        <rect x="199" y="376" width="4" height="1" fill={C.hairDark} rx="0.5" />
        <rect x="200" y="375" width="2" height="1.5" fill={C.hairDark} rx="0.5" />
        {/* Door */}
        <rect x="208" y="376" width="10" height="24" fill={C.building1} rx="1" />
        <rect x="209" y="377" width="8" height="8" fill={C.window} opacity="0.3" />
        <circle cx="216" cy="388" r="0.8" fill={C.sunGlow} />
        {/* Shop sign — small plaque */}
        <rect x="193" y="371" width="18" height="2" fill={C.buildingLight} rx="0.5" />
        {/* Open sign glow */}
        <rect x="210" y="379" width="5" height="2" fill={C.sunGlow} opacity="0.4" rx="0.3">
          <animate attributeName="opacity" values="0.3;0.6;0.3" dur="2s" repeatCount="indefinite" />
        </rect>
        {/* Street lamp next to shop */}
        <rect x="186" y="372" width="1" height="26" fill={C.building1} />
        <circle cx="186.5" cy="371" r="2" fill={C.sunGlow} opacity="0.5" filter="url(#glow)">
          <animate attributeName="opacity" values="0.3;0.6;0.3" dur="3s" repeatCount="indefinite" />
        </circle>
        {foundTreasures.has('vintage') && (
          <circle cx="205" cy="382" r="20" fill={C.sunGlow} opacity="0.12" filter="url(#softGlow)">
            <animate attributeName="opacity" values="0.08;0.18;0.08" dur="3s" repeatCount="indefinite" />
          </circle>
        )}
      </g>

      {/* === RIGHT CLUSTER === */}
      <rect x="240" y="290" width="80" height="110" fill={C.building2} />
      <rect x="240" y="290" width="80" height="4" fill={C.building3} />
      <polygon points="236,290 280,264 324,290" fill={C.roof} />
      <polygon points="236,290 280,268 280,290" fill={C.roofDark} />
      {[252, 272, 296].map((x, i) => (
        <g key={`bw3${i}`}>
          <rect x={x} y="306" width="10" height="14" fill={C.windowDark} />
          <rect x={x + 1} y="307" width="8" height="12" fill={C.window}><animate attributeName="opacity" values="0.7;1;0.7" dur={`${2.2 + i * 0.5}s`} repeatCount="indefinite" /></rect>
          <rect x={x} y="336" width="10" height="14" fill={C.windowDark} />
          <rect x={x + 1} y="337" width="8" height="12" fill={C.window}><animate attributeName="opacity" values="0.5;0.9;0.5" dur={`${3 + i * 0.2}s`} repeatCount="indefinite" /></rect>
        </g>
      ))}
      {/* Balcony with cat */}
      <rect x="268" y="362" width="16" height="3" fill={C.building3} />
      <rect x="270" y="350" width="12" height="14" fill={C.windowDark} />
      <rect x="271" y="351" width="10" height="12" fill={C.window}><animate attributeName="opacity" values="0.8;1;0.8" dur="2s" repeatCount="indefinite" /></rect>
      {/* Tiny cat on balcony */}
      <rect x="273" y="360" width="3" height="2" fill={C.hairDark} rx="0.5" />
      <rect x="272" y="359" width="2" height="1.5" fill={C.hairDark} rx="0.5" />

      {/* Waterfront promenade railing */}
      <rect x="240" y="396" width="80" height="1" fill={C.building3} opacity="0.7" />
      {[248, 260, 272, 284, 296, 308].map(x => (
        <rect key={`rail${x}`} x={x} y="392" width="1" height="5" fill={C.building3} opacity="0.5" />
      ))}

      {/* === TREASURE 4: Couple walking hand-in-hand === */}
      <g opacity={foundTreasures.has('walking') ? 1 : 0.7}>
        {/* Woman */}
        <rect x="277" y="387" width="3" height="3" fill={C.hairLight} rx="0.5" />
        <rect x="276" y="390" width="5" height="4" fill={C.dressPink} rx="0.3" />
        <rect x="277" y="394" width="2" height="2" fill={C.dressPink} />
        <rect x="279" y="394" width="2" height="2" fill={C.dressPink} />
        {/* Man */}
        <rect x="287" y="386" width="3" height="3" fill={C.hairDark} rx="0.5" />
        <rect x="286" y="389" width="5" height="4" fill={C.shirtBlue} rx="0.3" />
        <rect x="287" y="393" width="2" height="2.5" fill={C.pants} />
        <rect x="289" y="393" width="2" height="2.5" fill={C.pants} />
        {/* Held hands */}
        <rect x="281" y="391" width="5" height="1.5" fill={C.skin} rx="0.5" />
        {/* Small heart above them */}
        <g opacity="0.6"><animate attributeName="opacity" values="0.3;0.7;0.3" dur="3s" repeatCount="indefinite" />
          <rect x="282" y="383" width="1.5" height="1.5" fill={C.heartPink} rx="0.3" />
          <rect x="283.5" y="383" width="1.5" height="1.5" fill={C.heartPink} rx="0.3" />
          <rect x="282.5" y="384.2" width="1.5" height="1.2" fill={C.heartPink} rx="0.3" />
        </g>
        {foundTreasures.has('walking') && (
          <circle cx="285" cy="392" r="18" fill={C.sunGlow} opacity="0.12" filter="url(#softGlow)">
            <animate attributeName="opacity" values="0.08;0.18;0.08" dur="3s" repeatCount="indefinite" />
          </circle>
        )}
      </g>

      {/* Right tower */}
      <rect x="320" y="270" width="38" height="130" fill={C.building1} />
      <rect x="320" y="270" width="38" height="4" fill={C.building2} />
      <polygon points="318,270 339,242 360,270" fill={C.roof} />
      <polygon points="318,270 339,246 339,270" fill={C.roofDark} />
      <circle cx="339" cy="290" r="7" fill={C.windowDark} />
      <circle cx="339" cy="290" r="5" fill={C.window}><animate attributeName="opacity" values="0.7;1;0.7" dur="4s" repeatCount="indefinite" /></circle>
      {[310, 336, 366].map((y, i) => (
        <g key={`tw2${i}`}>
          <rect x="332" y={y} width="8" height="12" fill={C.windowDark} />
          <rect x="333" y={y + 1} width="6" height="10" fill={C.window}><animate attributeName="opacity" values="0.6;0.9;0.6" dur={`${2.8 + i * 0.4}s`} repeatCount="indefinite" /></rect>
        </g>
      ))}
      {/* Flag on tower */}
      <rect x="339" y="238" width="1" height="8" fill={C.building1} />
      <polygon points="340,238 348,241 340,244" fill={C.dressRed} opacity="0.8" />

      {/* Small rightmost building */}
      <rect x="358" y="340" width="42" height="60" fill={C.building3} />
      <polygon points="356,340 379,324 402,340" fill={C.roof} />
      <rect x="367" y="355" width="8" height="12" fill={C.windowDark} />
      <rect x="368" y="356" width="6" height="10" fill={C.window}><animate attributeName="opacity" values="0.8;0.5;0.8" dur="2.5s" repeatCount="indefinite" /></rect>
      <rect x="383" y="355" width="8" height="12" fill={C.windowDark} />
      <rect x="384" y="356" width="6" height="10" fill={C.window}><animate attributeName="opacity" values="0.6;1;0.6" dur="3s" repeatCount="indefinite" /></rect>

      {/* Waterfront / dock */}
      <rect x="0" y="396" width="400" height="6" fill={C.building1} opacity="0.6" />
      <rect x="0" y="399" width="400" height="3" fill={C.sea2} opacity="0.3" />

      {/* Street lamp posts */}
      {[25, 135, 245, 350].map(x => (
        <g key={`lamp${x}`}>
          <rect x={x} y="378" width="1" height="20" fill={C.building1} />
          <circle cx={x + 0.5} cy="377" r="2" fill={C.sunGlow} opacity="0.4" filter="url(#glow)">
            <animate attributeName="opacity" values="0.25;0.55;0.25" dur="3.5s" repeatCount="indefinite" />
          </circle>
        </g>
      ))}

      {/* Greenery */}
      {[28, 65, 135, 248, 326, 362].map((x, i) => (
        <g key={`v${i}`}>
          <rect x={x + 2} y="392" width="3" height="5" fill={C.green1} />
          <rect x={x - 1} y="390" width="3" height="4" fill={C.green2} />
          <rect x={x + 5} y="391" width="2" height="5" fill={C.green3} />
        </g>
      ))}

      {/* === EXTRA CITY DETAILS === */}

      {/* Chimneys with smoke */}
      <rect x="94" y="274" width="6" height="8" fill={C.building1} />
      {[0,1,2].map(i => (
        <circle key={`smk1-${i}`} cx={97} cy={270 - i * 8} r={2 + i * 1.5} fill="#fff8f0" opacity="0">
          <animate attributeName="opacity" values="0;0.15;0" dur={`${3 + i}s`} begin={`${i * 0.8}s`} repeatCount="indefinite" />
          <animate attributeName="cy" values={`${270 - i * 8};${258 - i * 12}`} dur={`${3 + i}s`} begin={`${i * 0.8}s`} repeatCount="indefinite" />
        </circle>
      ))}
      <rect x="275" y="260" width="5" height="6" fill={C.building1} />
      {[0,1,2].map(i => (
        <circle key={`smk2-${i}`} cx={277} cy={256 - i * 7} r={1.5 + i * 1.2} fill="#fff8f0" opacity="0">
          <animate attributeName="opacity" values="0;0.12;0" dur={`${3.5 + i}s`} begin={`${i * 0.7 + 1}s`} repeatCount="indefinite" />
          <animate attributeName="cy" values={`${256 - i * 7};${244 - i * 11}`} dur={`${3.5 + i}s`} begin={`${i * 0.7 + 1}s`} repeatCount="indefinite" />
        </circle>
      ))}

      {/* Hanging shop signs */}
      <rect x="70" y="372" width="1" height="5" fill={C.building1} />
      <rect x="66" y="377" width="9" height="6" fill={C.buildingLight} rx="0.5" />
      <rect x="68" y="378" width="5" height="4" fill={C.window} opacity="0.4" rx="0.3" />

      <rect x="355" y="348" width="1" height="4" fill={C.building1} />
      <rect x="351" y="352" width="9" height="5" fill={C.buildingLight} rx="0.5" />

      {/* Window shutters on left building */}
      <rect x="70" y="318" width="2" height="14" fill={C.green2} opacity="0.6" />
      <rect x="84" y="318" width="2" height="14" fill={C.green2} opacity="0.6" />

      {/* Balcony flower boxes */}
      {[252, 272, 296].map(x => (
        <g key={`fb${x}`}>
          <rect x={x} y="320" width="10" height="2" fill={C.building3} />
          <rect x={x + 1} y="318" width="3" height="3" fill={C.flowerPink} rx="1" />
          <rect x={x + 5} y="317" width="3" height="4" fill={C.dressRed} rx="1" />
        </g>
      ))}

      {/* Bicycle parked against wall */}
      <circle cx="163" cy="393" r="3" fill="none" stroke={C.building1} strokeWidth="0.8" />
      <circle cx="172" cy="393" r="3" fill="none" stroke={C.building1} strokeWidth="0.8" />
      <line x1="163" y1="393" x2="167" y2="388" stroke={C.building1} strokeWidth="0.6" />
      <line x1="172" y1="393" x2="167" y2="388" stroke={C.building1} strokeWidth="0.6" />
      <line x1="167" y1="388" x2="165" y2="385" stroke={C.building1} strokeWidth="0.6" />

      {/* Bench near waterfront */}
      <rect x="300" y="393" width="14" height="1.5" fill={C.building2} />
      <rect x="302" y="389" width="1.5" height="5" fill={C.building2} />
      <rect x="311" y="389" width="1.5" height="5" fill={C.building2} />
      <rect x="301" y="389" width="12" height="1.5" fill={C.building3} />

      {/* Person sitting on bench reading */}
      <rect x="305" y="385" width="3" height="3" fill={C.hairDark} rx="0.5" />
      <rect x="304" y="388" width="5" height="3" fill={C.shirtBlue} rx="0.3" />
      {/* Book */}
      <rect x="309" y="387" width="3" height="2" fill="#fff8f0" opacity="0.7" />

      {/* Seagulls near waterfront */}
      {[{x:160,y:380,d:15},{x:230,y:375,d:18},{x:340,y:385,d:12}].map((sg,i) => (
        <g key={`sg${i}`} opacity="0.4">
          <polyline points="-2,0 0,-1.5 2,0" fill="none" stroke="#fff8f0" strokeWidth="1" strokeLinecap="round">
            <animate attributeName="points" values="-2,0 0,-1.5 2,0;-2,-0.5 0,0 2,-0.5;-2,0 0,-1.5 2,0" dur="0.6s" repeatCount="indefinite" />
          </polyline>
          <animateTransform attributeName="transform" type="translate" values={`${sg.x},${sg.y};${sg.x+80},${sg.y-10}`} dur={`${sg.d}s`} repeatCount="indefinite" />
        </g>
      ))}

      {/* Potted trees along street */}
      {[90, 230].map(x => (
        <g key={`tree${x}`}>
          <rect x={x} y="389" width="4" height="5" fill={C.building2} />
          <circle cx={x + 2} cy="386" r="5" fill={C.green1} opacity="0.7" />
          <circle cx={x + 4} cy="384" r="3" fill={C.green2} opacity="0.5" />
          <circle cx={x} cy="385" r="3.5" fill={C.green1} opacity="0.6" />
        </g>
      ))}

      {/* Clothesline between right buildings */}
      <line x1="320" y1="335" x2="358" y2="337" stroke="#fff8f0" strokeWidth="0.3" opacity="0.4" />
      <rect x="330" y="334" width="3" height="4" fill={C.dressPink} opacity="0.35" />
      <rect x="338" y="333" width="4" height="5" fill="#fff8f0" opacity="0.3" />
      <rect x="346" y="334" width="3" height="4" fill={C.shirtBlue} opacity="0.35" />

      {/* Zoom-in hint sparkles near undiscovered treasures */}
      {showHints && TREASURE_SPOTS.map(t => !foundTreasures.has(t.id) && (
        <circle key={`hint-${t.id}`} cx={t.cx} cy={t.cy - 12} r="1.5" fill={C.sunGlow} opacity="0">
          <animate attributeName="opacity" values="0;0.5;0" dur="2s" repeatCount="indefinite" />
        </circle>
      ))}
    </g>
  )
}

// =============================================
// SEA
// =============================================
function SeaLayer() {
  return (
    <g>
      <rect x="0" y="400" width="400" height="400" fill={C.sea1} />
      <rect x="0" y="400" width="400" height="400" fill="url(#seaGrad)" />
      <ellipse cx="200" cy="420" rx="50" ry="80" fill="url(#sunRef)"><animate attributeName="rx" values="50;58;50" dur="4s" repeatCount="indefinite" /></ellipse>
      {[0,1,2,3,4,5,6,7,8,9].map(i => (
        <path key={`w${i}`} d={`M-20,${408+i*28} Q30,${403+i*28} 60,${408+i*28} T120,${408+i*28} T180,${408+i*28} T240,${408+i*28} T300,${408+i*28} T360,${408+i*28} T420,${408+i*28}`}
          fill="none" stroke={i<3?C.seaHighlight:C.sea3} strokeWidth="1.2" opacity={0.3-i*0.025}>
          <animateTransform attributeName="transform" type="translate" values={`0,0;${i%2===0?15:-15},${Math.sin(i)*2}`} dur={`${3+i*0.5}s`} repeatCount="indefinite" />
        </path>
      ))}
      {[{x:160,y:415,d:2},{x:190,y:425,d:3},{x:210,y:412,d:2.5},{x:180,y:438,d:1.8},{x:220,y:430,d:3.2},{x:175,y:450,d:2.7}].map((s,i) => (
        <rect key={`sp${i}`} x={s.x} y={s.y} width="2" height="2" fill={C.sun} rx="0.3"><animate attributeName="opacity" values="0;0.8;0" dur={`${s.d}s`} begin={`${i*0.3}s`} repeatCount="indefinite" /></rect>
      ))}
    </g>
  )
}

function WaterDetails() {
  return (
    <g>
      {/* Building reflections in water — blurred, wavy */}
      <g opacity="0.08">
        <rect x="20" y="405" width="40" height="40" fill={C.building2} />
        <rect x="60" y="408" width="70" height="35" fill={C.building1} />
        <rect x="240" y="406" width="80" height="38" fill={C.building2} />
        <rect x="320" y="405" width="38" height="42" fill={C.building1} />
        <animateTransform attributeName="transform" type="translate" values="0,0;3,0;0,0" dur="4s" repeatCount="indefinite" />
      </g>

      {/* Sailboat 1 */}
      <g>
        <animateTransform attributeName="transform" type="translate" values="120,430;280,426;120,430" dur="30s" repeatCount="indefinite" />
        <polygon points="-8,3 -6,7 6,7 8,3" fill={C.building1} />
        <polygon points="0,3 0,-8 6,1" fill="#fff8f0" opacity="0.9" />
        <line x1="0" y1="-8" x2="0" y2="7" stroke={C.building1} strokeWidth="1" />
      </g>

      {/* Small rowing boat */}
      <g>
        <animateTransform attributeName="transform" type="translate" values="320,460;80,465;320,460" dur="50s" repeatCount="indefinite" />
        <ellipse cx="0" cy="2" rx="6" ry="2.5" fill={C.building2} />
        <ellipse cx="0" cy="1" rx="5" ry="1.8" fill={C.building3} />
        {/* Person in boat */}
        <rect x="-1.5" y="-3" width="3" height="3" fill={C.hairDark} rx="0.5" />
        <rect x="-2" y="0" width="4" height="2" fill={C.dressRed} rx="0.3" />
      </g>

      {/* Floating debris / leaves */}
      {[{x:50,y:420,d:25},{x:150,y:445,d:30},{x:300,y:435,d:22},{x:350,y:470,d:35}].map((l,i) => (
        <rect key={`leaf${i}`} x={l.x} y={l.y} width="2" height="1.5" fill={C.green2} opacity="0.25" rx="0.5">
          <animateTransform attributeName="transform" type="translate" values={`0,0;${15 + i * 3},${Math.sin(i) * 3}`} dur={`${l.d}s`} repeatCount="indefinite" />
        </rect>
      ))}
    </g>
  )
}

function Fireflies() {
  const f = useMemo(() => { const r = seededRandom(77); return Array.from({length:15},()=>({cx:20+r()*360,cy:350+r()*50,d:3+r()*4,dl:r()*6,r:1.2+r()*1.2})) }, [])
  return <g>{f.map((v,i)=><circle key={`ff${i}`} cx={v.cx} cy={v.cy} r={v.r} fill={C.sunGlow} filter="url(#glow)"><animate attributeName="opacity" values="0;0.8;0" dur={`${v.d}s`} begin={`${v.dl}s`} repeatCount="indefinite" /><animate attributeName="cy" values={`${v.cy};${v.cy-8};${v.cy}`} dur={`${v.d+1}s`} begin={`${v.dl}s`} repeatCount="indefinite" /></circle>)}</g>
}

function Petals() {
  const p = useMemo(() => { const r = seededRandom(42); return Array.from({length:18},()=>({x:r()*400,sy:-20-r()*80,ey:700+r()*100,sz:2.5+r()*3,d:12+r()*14,dl:r()*10,dr:(r()-0.5)*60,c:r()>0.5?C.flowerPink:C.flowerWhite,o:0.35+r()*0.4})) }, [])
  return <g>{p.map((v,i)=>(
    <g key={`p${i}`} opacity={v.o}><rect x="0" y="0" width={v.sz} height={v.sz*0.7} fill={v.c} rx="0.8"><animateTransform attributeName="transform" type="rotate" values="0;360" dur={`${v.d*0.8}s`} repeatCount="indefinite" /></rect>
    <animateTransform attributeName="transform" type="translate" values={`${v.x},${v.sy};${v.x+v.dr},${v.ey}`} dur={`${v.d}s`} begin={`${v.dl}s`} repeatCount="indefinite" /></g>
  ))}</g>
}

// =============================================
// INTERACTIVE ELEMENTS (pure visual, no event handlers)
// =============================================
interface HeartData { id: number; x: number; sy: number; ey: number; size: number; dur: number; drift: number; color: string; born: number }
interface LanternData { id: number; x: number; sy: number; word: string }
interface Ripple { id: number; x: number; y: number }
interface CatchBurst { id: number; x: number; y: number; color: string }

function Hearts({ hearts }: { hearts: HeartData[] }) {
  return <g style={{pointerEvents:'none'}}>{hearts.map(h=>{
    const s = h.size
    return (
    <g key={h.id} data-hid={h.id}>
      <animateTransform attributeName="transform" type="translate" values={`${h.x},${h.sy};${h.x+h.drift},${h.ey}`} dur={`${h.dur}s`} fill="freeze" />
      {/* Soft glow behind heart */}
      <circle cx={s*0.05} cy={s*0.3} r={s*0.8} fill={h.color} opacity="0.2" filter="url(#glow)">
        <animate attributeName="opacity" values="0.15;0.35;0.15" dur="2s" repeatCount="indefinite" />
      </circle>
      {/* Heart shape — pixel art */}
      <g>
        <animate attributeName="opacity" values="0.9;1;0.9" dur="3s" repeatCount="indefinite" />
        <rect x={-s*0.5} y={0} width={s*0.45} height={s*0.45} fill={h.color} rx="0.8" />
        <rect x={s*0.05} y={0} width={s*0.45} height={s*0.45} fill={h.color} rx="0.8" />
        <rect x={-s*0.25} y={s*0.25} width={s*0.5} height={s*0.45} fill={h.color} rx="0.8" />
        {/* Highlight */}
        <rect x={-s*0.35} y={s*0.08} width={s*0.2} height={s*0.2} fill="#fff" opacity="0.35" rx="0.5" />
        {/* Outline for visibility */}
        <rect x={-s*0.55} y={-s*0.05} width={s*1.1} height={s*0.8} fill="none" stroke="#fff" strokeWidth="0.5" opacity="0.15" rx="1" />
      </g>
    </g>
  )})}</g>
}

function Lanterns({ lanterns }: { lanterns: LanternData[] }) {
  return <g style={{pointerEvents:'none'}}>{lanterns.map(l=>(
    <g key={l.id}>
      <animateTransform attributeName="transform" type="translate" values={`${l.x},${l.sy};${l.x},${-50}`} dur="20s" fill="freeze" />
      <animate attributeName="opacity" values="0;1;1;0.7;0" dur="20s" fill="freeze" />
      <ellipse cx="0" cy="0" rx="6" ry="8" fill={C.sunGlow} opacity="0.7" filter="url(#glow)" />
      <ellipse cx="0" cy="0" rx="4" ry="6" fill={C.sun} opacity="0.9" />
      <ellipse cx="0" cy="1" rx="1.5" ry="2" fill="#fff" opacity="0.8"><animate attributeName="ry" values="2;2.5;2" dur="0.5s" repeatCount="indefinite" /></ellipse>
      <text x="0" y="-14" textAnchor="middle" fill={C.textMain} fontSize="7" fontFamily="monospace" opacity="0.9">{l.word}</text>
    </g>
  ))}</g>
}

function Effects({ ripples, bursts }: { ripples: Ripple[]; bursts: CatchBurst[] }) {
  return <g style={{pointerEvents:'none'}}>
    {ripples.map(r=><g key={`rp${r.id}`}>
      <circle cx={r.x} cy={r.y} r="3" fill="none" stroke={C.seaHighlight} strokeWidth="1.2"><animate attributeName="r" from="3" to="28" dur="1s" fill="freeze" /><animate attributeName="opacity" from="0.8" to="0" dur="1s" fill="freeze" /></circle>
      <circle cx={r.x} cy={r.y} r="3" fill="none" stroke={C.sun} strokeWidth="0.8"><animate attributeName="r" from="3" to="18" dur="0.7s" fill="freeze" /><animate attributeName="opacity" from="0.5" to="0" dur="0.7s" fill="freeze" /></circle>
    </g>)}
    {bursts.map(b=><g key={`br${b.id}`}>
      <circle cx={b.x} cy={b.y} r="2" fill={b.color}><animate attributeName="r" from="2" to="15" dur="0.4s" fill="freeze" /><animate attributeName="opacity" from="0.8" to="0" dur="0.4s" fill="freeze" /></circle>
      {[0,60,120,180,240,300].map((a,i)=>{const rad=a*Math.PI/180;return(
        <rect key={i} x={b.x-1} y={b.y-1} width="2.5" height="2.5" fill={b.color} rx="0.5">
          <animateTransform attributeName="transform" type="translate" values={`0,0;${Math.cos(rad)*18},${Math.sin(rad)*18}`} dur="0.5s" fill="freeze" />
          <animate attributeName="opacity" from="1" to="0" dur="0.5s" fill="freeze" />
        </rect>
      )})}
      <text x={b.x} y={b.y-4} textAnchor="middle" fill={C.sun} fontSize="8" fontFamily="monospace" fontWeight="bold">
        <animate attributeName="opacity" values="1;0" dur="0.8s" fill="freeze" />
        <animateTransform attributeName="transform" type="translate" values="0,0;0,-18" dur="0.8s" fill="freeze" />+1</text>
    </g>)}
  </g>
}

function Confetti({ k }: { k: number }) {
  const ps = useMemo(() => {
    const r = seededRandom(k * 137 + 555)
    const cs = [C.heartPink, C.heartRed, C.sunGlow, C.sun, C.flowerPink, C.seaHighlight, '#fff']
    return Array.from({length:50},()=>({x:180+r()*40,y:350+r()*40,dx:(r()-0.5)*300,dy:-100-r()*400,s:2+r()*4,c:cs[Math.floor(r()*cs.length)],rot:r()*360,d:2+r()*2}))
  }, [k])
  if (k === 0) return null
  return <g style={{pointerEvents:'none'}}>{ps.map((p,i)=>(
    <rect key={`cf${i}`} x="0" y="0" width={p.s} height={p.s*0.6} fill={p.c} rx="0.5">
      <animateTransform attributeName="transform" type="translate" values={`${p.x},${p.y};${p.x+p.dx},${p.y+p.dy}`} dur={`${p.d}s`} fill="freeze" />
      <animateTransform attributeName="transform" type="rotate" values={`0;${p.rot}`} dur={`${p.d}s`} fill="freeze" additive="sum" />
      <animate attributeName="opacity" values="1;1;0" dur={`${p.d}s`} fill="freeze" />
    </rect>
  ))}</g>
}

// =============================================
// GAME UI
// =============================================
const WISH_WORDS = ['Seni', 'çok', 'seviyorum', 'bitanem', 'iyi', 'ki', 'doğdun', '❤️']

function GameUI({ hc, ht, ft, tt, lr, allDone, melodyShown, zoom, songIndex, onSongChange }: {
  hc: number; ht: number; ft: number; tt: number; lr: number; allDone: boolean; melodyShown: boolean; zoom: number; songIndex: number; onSongChange: (i: number) => void
}) {
  const pills = [
    { icon: '\u2665', n: hc, t: ht, done: hc >= ht },
    { icon: '\u25D0', n: lr, t: WISH_WORDS.length, done: lr >= WISH_WORDS.length },
  ]
  return (
    <div className="absolute top-0 left-0 right-0 z-30 pointer-events-none" style={{ paddingTop: 'max(env(safe-area-inset-top, 0px), 8px)' }}>
      <div className="flex justify-center gap-2.5 px-3 pt-2 flex-wrap">
        {pills.map((p, i) => (
          <div key={i} className="flex items-center gap-1.5 px-3 py-1.5 rounded-full font-mono text-xs transition-colors duration-300"
            style={{ background: 'rgba(33,39,51,0.75)', backdropFilter: 'blur(8px)', color: p.done ? C.sunGlow : C.textSub, border: `1px solid ${p.done ? C.sunGlow + '44' : C.sea3 + '33'}` }}>
            <span style={{ fontSize: '14px' }}>{p.icon}</span>
            <span>{p.n}/{p.t}</span>
            {p.done && <span style={{ color: C.sunGlow }}>{'\u2713'}</span>}
          </div>
        ))}
      </div>
      {!allDone && (
        <div className="text-center mt-2 px-4">
          <p className="font-mono text-xs tracking-wide" style={{ color: C.textSub, opacity: 0.55, textShadow: '0 1px 4px rgba(0,0,0,0.5)' }}>
            {hc >= ht ? 'gökyüzüne dokun, dilek fenerleri bırak ✨' :
             'kalplere dokun ve yakala ❤️'}
          </p>
          <div className="flex justify-center gap-1.5 mt-1.5 flex-wrap">
            {SONGS.map((s, i) => (
              <button key={i} onClick={(e) => { e.stopPropagation(); onSongChange(i) }}
                className="font-mono transition-all duration-200"
                style={{
                  fontSize: '0.6rem', padding: '2px 8px', borderRadius: '999px',
                  background: i === songIndex ? C.sunGlow + '33' : 'rgba(33,39,51,0.6)',
                  color: i === songIndex ? C.sunGlow : C.textSub,
                  border: `1px solid ${i === songIndex ? C.sunGlow + '66' : 'transparent'}`,
                  opacity: i === songIndex ? 1 : 0.5,
                  textShadow: '0 1px 4px rgba(0,0,0,0.4)',
                }}>
                {s.emoji} {s.name}
              </button>
            ))}
          </div>
        </div>
      )}
      {melodyShown && (
        <div className="flex justify-center mt-2">
          <div className="px-4 py-2 rounded-lg font-mono text-xs animate-fade-in"
            style={{ background: 'rgba(33,39,51,0.85)', color: C.sunGlow, border: `1px solid ${C.sunGlow}44` }}>
            melodi açıldı!
          </div>
        </div>
      )}
    </div>
  )
}

// =============================================
// BIRTHDAY OVERLAY
// =============================================
function BirthdayOverlay({ allDone }: { allDone: boolean }) {
  const [vis, setVis] = useState(false)
  useEffect(() => { const t = setTimeout(() => setVis(true), 800); return () => clearTimeout(t) }, [])
  return (
    <div className={`absolute inset-0 flex flex-col items-center pointer-events-none z-10 transition-opacity duration-[2000ms] ${vis ? 'opacity-100' : 'opacity-0'}`}
      style={{ paddingTop: 'max(env(safe-area-inset-top, 0px), 12px)' }}>
      <div className="flex-shrink-0 text-center pt-14 pb-2 px-4 sm:pt-18">
        <h1 className="font-mono tracking-widest drop-shadow-lg leading-tight"
          style={{ color: C.textMain, fontSize: 'clamp(1.5rem, 7vw, 3.2rem)', textShadow: `0 0 30px ${C.sky1}88, 0 2px 10px rgba(0,0,0,0.5)`, letterSpacing: '0.12em' }}>
          İyi Ki Doğdun
        </h1>
        <h1 className="font-mono tracking-widest drop-shadow-lg leading-tight mt-1"
          style={{ color: C.sunGlow, fontSize: 'clamp(1.8rem, 8vw, 3.8rem)', textShadow: `0 0 40px ${C.sky1}aa, 0 0 20px ${C.sunGlow}66, 0 2px 10px rgba(0,0,0,0.5)`, letterSpacing: '0.15em' }}>
          Bitanem 💖
        </h1>
        <div className="mt-3 font-mono tracking-wider" style={{ color: C.textSub, fontSize: 'clamp(0.7rem, 2.5vw, 1rem)', textShadow: '0 1px 8px rgba(0,0,0,0.4)' }}>
          sana özel küçük bir dünya
        </div>
      </div>
      <div className="flex-1 min-h-0" />
      <div className={`flex-shrink-0 mx-5 mb-8 px-6 py-5 rounded-xl pointer-events-auto max-w-sm w-full sm:mb-12 sm:px-8 sm:py-6 transition-all duration-1000 ${allDone ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4 pointer-events-none'}`}
        style={{ background: 'rgba(33,39,51,0.85)', backdropFilter: 'blur(12px)', WebkitBackdropFilter: 'blur(12px)',
          border: `1px solid ${allDone ? C.sunGlow + '44' : C.sea3 + '33'}`,
          boxShadow: allDone ? `0 8px 32px rgba(0,0,0,0.35), inset 0 1px 0 ${C.sunGlow}28, 0 0 40px ${C.sunGlow}15` : '0 8px 32px rgba(0,0,0,0.35)' }}>
        <div className="text-center">
          <p className="font-mono leading-relaxed italic m-0" style={{ color: C.textSub, fontSize: 'clamp(0.8rem, 2.8vw, 0.95rem)', lineHeight: '1.7' }}>
            Tüm sırları buldun! Bu gün batımı, bu melodi, bu küçük anlar — hepsi senin için. İyi ki doğdun bitanem ❤️❤️❤️❤️❤️
          </p>
        </div>
      </div>
      <div style={{ height: 'env(safe-area-inset-bottom, 0px)', flexShrink: 0 }} />
    </div>
  )
}

// =============================================
// ZOOM BUTTONS
// =============================================
function ZoomButtons({ zoom, onZoomIn, onZoomOut }: { zoom: number; onZoomIn: () => void; onZoomOut: () => void }) {
  return (
    <div className="absolute bottom-4 right-3 z-30 flex flex-col gap-2 pointer-events-auto"
      style={{ paddingBottom: 'max(env(safe-area-inset-bottom, 0px), 0px)' }}>
      <button onClick={onZoomIn} disabled={zoom >= 3.5}
        className="w-10 h-10 rounded-full font-mono text-lg flex items-center justify-center transition-opacity"
        style={{ background: 'rgba(33,39,51,0.75)', backdropFilter: 'blur(8px)', color: C.textSub, border: `1px solid ${C.sea3}33`, opacity: zoom >= 3.5 ? 0.3 : 0.8 }}>
        +
      </button>
      <button onClick={onZoomOut} disabled={zoom <= 1}
        className="w-10 h-10 rounded-full font-mono text-lg flex items-center justify-center transition-opacity"
        style={{ background: 'rgba(33,39,51,0.75)', backdropFilter: 'blur(8px)', color: C.textSub, border: `1px solid ${C.sea3}33`, opacity: zoom <= 1 ? 0.3 : 0.8 }}>
        -
      </button>
    </div>
  )
}

// =============================================
// MAIN PAGE — unified pointer handler, viewBox zoom/pan
// =============================================
export default function FarePage() {
  const [mounted, setMounted] = useState(false)
  const svgRef = useRef<SVGSVGElement | null>(null)

  // ViewBox-based zoom/pan
  const [viewBox, setViewBox] = useState<ViewBox>(() => {
    if (typeof window === 'undefined') return { x: 0, y: 0, w: 400, h: 800 }
    const ratio = window.innerHeight / window.innerWidth
    const h = Math.min(800, Math.max(400, 400 * Math.min(2.5, Math.max(0.8, ratio))))
    return { x: 0, y: Math.max(0, (800 - h) / 2), w: 400, h }
  })
  const zoom = 400 / viewBox.w

  // Game state
  const [heartsCaught, setHeartsCaught] = useState(0)
  const [foundTreasures, setFoundTreasures] = useState<Set<string>>(new Set())
  const [lanternsReleased, setLanternsReleased] = useState(0)
  const [confettiKey, setConfettiKey] = useState(0)
  const [melodyShown, setMelodyShown] = useState(false)
  const [songIndex, setSongIndex] = useState(0)
  const confettiFiredRef = useRef(false)

  // Visual elements
  const [hearts, setHearts] = useState<HeartData[]>([])
  const [lanterns, setLanterns] = useState<LanternData[]>([])
  const [ripples, setRipples] = useState<Ripple[]>([])
  const [bursts, setBursts] = useState<CatchBurst[]>([])

  const idRef = useRef({ h: 0, l: 0, r: 0, b: 0 })

  const HEARTS_TARGET = 8
  const allDone = heartsCaught >= HEARTS_TARGET && lanternsReleased >= WISH_WORDS.length

  // --- Gesture tracking ---
  const ptrsRef = useRef(new Map<number, { x: number; y: number }>())
  const gestRef = useRef({
    isPinch: false, isPan: false,
    startDist: 0, startMid: { x: 0, y: 0 },
    startVB: { x: 0, y: 0, w: 400, h: 800 },
    tapStart: { x: 0, y: 0, time: 0 },
    lastTap: { x: 0, y: 0, time: 0 },
  })
  const tapTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const pendingVB = useRef<ViewBox | null>(null)
  const rafRef = useRef(0)

  function commitVB(vb: ViewBox) {
    pendingVB.current = clampVB(vb)
    if (!rafRef.current) {
      rafRef.current = requestAnimationFrame(() => {
        if (pendingVB.current) setViewBox(pendingVB.current)
        rafRef.current = 0
      })
    }
  }

  useEffect(() => { setMounted(true) }, [])

  // Adapt viewBox to screen size
  useEffect(() => {
    const onResize = () => {
      const ratio = window.innerHeight / window.innerWidth
      const h = Math.min(800, Math.max(400, 400 * Math.min(2.5, Math.max(0.8, ratio))))
      setViewBox(prev => {
        if (prev.w === 400 && Math.abs(prev.h - h) > 10) {
          return { x: 0, y: Math.max(0, (800 - h) / 2), w: 400, h }
        }
        return prev
      })
    }
    window.addEventListener('resize', onResize)
    return () => window.removeEventListener('resize', onResize)
  }, [])

  // Heart spawner
  useEffect(() => {
    if (!mounted) return
    const spawn = () => {
      const r = Math.random
      const now = Date.now()
      setHearts(prev => {
        // Remove expired hearts (animation finished) to prevent ghost taps
        const alive = prev.filter(h => (now - h.born) / 1000 < h.dur)
        return [...alive, {
          id: idRef.current.h++, x: 40 + r() * 320, sy: 780, ey: -40,
          size: 20 + r() * 12, dur: 25 + r() * 15, drift: (r() - 0.5) * 30,
          color: r() > 0.5 ? C.heartPink : C.heartRed, born: now,
        }]
      })
    }
    spawn()
    const iv = setInterval(spawn, 1500)
    return () => clearInterval(iv)
  }, [mounted])

  // Cleanup old effects
  useEffect(() => {
    if (!mounted) return
    const iv = setInterval(() => {
      setRipples(prev => prev.filter(r => r.id > idRef.current.r - 10))
      setBursts(prev => prev.filter(b => b.id > idRef.current.b - 10))
    }, 3000)
    return () => clearInterval(iv)
  }, [mounted])

  // Confetti on complete
  useEffect(() => {
    if (allDone && !confettiFiredRef.current) {
      confettiFiredRef.current = true
      setConfettiKey(k => k + 1)
      snd().playConfetti()
    }
  }, [allDone])

  // Auto-dismiss melody badge after 4s
  useEffect(() => {
    if (!melodyShown) return
    const t = setTimeout(() => setMelodyShown(false), 4000)
    return () => clearTimeout(t)
  }, [melodyShown])

  // --- Get heart's actual screen position from the DOM ---
  // getBoundingClientRect() is guaranteed to reflect SMIL animateTransform positions
  // (getScreenCTM() does NOT include SMIL animations in many browsers)
  const getHeartScreenPos = useCallback((heartId: number): { x: number; y: number } | null => {
    const svg = svgRef.current
    if (!svg) return null
    const el = svg.querySelector(`[data-hid="${heartId}"]`) as SVGGraphicsElement | null
    if (!el) return null
    const rect = el.getBoundingClientRect()
    if (rect.width === 0 && rect.height === 0) return null
    return { x: rect.x + rect.width / 2, y: rect.y + rect.height / 2 }
  }, [])

  // --- Unified game tap handler (called after gesture detection) ---
  const handleGameTap = useCallback((clientX: number, clientY: number) => {
    const pt = screenToSvg(clientX, clientY, svgRef.current, viewBox)
    if (!pt) return

    // Play Für Elise melody note on every tap
    snd().playNextMelodyNote()

    // 1. Hearts — use actual DOM position for accuracy
    for (const heart of hearts) {
      const sp = getHeartScreenPos(heart.id)
      if (!sp) continue
      const sdx = clientX - sp.x, sdy = clientY - sp.y
      // 70px screen radius — generous hit area for easy catching
      if (sdx * sdx + sdy * sdy < 70 * 70) {
        setHearts(prev => prev.filter(h => h.id !== heart.id))
        setHeartsCaught(prev => prev + 1)
        setBursts(prev => [...prev, { id: idRef.current.b++, x: pt.x, y: pt.y, color: heart.color }])
        return
      }
    }

    // 2. Sky zone: release lantern
    if (pt.y < 350 && pt.y > 0 && lanternsReleased < WISH_WORDS.length) {
      const word = WISH_WORDS[lanternsReleased]
      setLanterns(prev => [...prev, { id: idRef.current.l++, x: pt.x, sy: pt.y, word: word || '' }])
      setLanternsReleased(prev => prev + 1)
      return
    }

    // 3. Treasure scenes (optional bonus — only when zoomed)
    for (const spot of TREASURE_SPOTS) {
      if (!foundTreasures.has(spot.id)) {
        const dx = pt.x - spot.cx, dy = pt.y - spot.cy
        const hitR = spot.r + (zoom > 1.5 ? 10 : 5)
        if (dx * dx + dy * dy < hitR * hitR) {
          setFoundTreasures(prev => {
            const next = new Set(prev); next.add(spot.id)
            if (next.size === TREASURE_SPOTS.length) {
              setTimeout(() => { snd().playMelody(TREASURE_MELODY, 250); setMelodyShown(true) }, 800)
            }
            return next
          })
          setBursts(prev => [...prev, { id: idRef.current.b++, x: pt.x, y: pt.y, color: C.sunGlow }])
          return
        }
      }
    }

    // 4. Sea zone: ripple effect
    if (pt.y > 400) {
      setRipples(prev => [...prev, { id: idRef.current.r++, x: pt.x, y: pt.y }])
      return
    }
  }, [viewBox, lanternsReleased, foundTreasures, hearts, getHeartScreenPos, zoom])

  // --- Pointer handlers for zoom/pan + tap detection ---
  const onPtrDown = useCallback((e: React.PointerEvent) => {
    // Don't handle if from zoom buttons
    if ((e.target as HTMLElement).tagName === 'BUTTON') return

    ptrsRef.current.set(e.pointerId, { x: e.clientX, y: e.clientY })
    const g = gestRef.current

    if (ptrsRef.current.size === 1) {
      g.tapStart = { x: e.clientX, y: e.clientY, time: Date.now() }
      g.isPan = false
      g.isPinch = false
      g.startVB = { ...viewBox }
    }
    if (ptrsRef.current.size === 2) {
      const [p1, p2] = Array.from(ptrsRef.current.values())
      g.isPinch = true
      g.startDist = Math.hypot(p2.x - p1.x, p2.y - p1.y)
      g.startMid = { x: (p1.x + p2.x) / 2, y: (p1.y + p2.y) / 2 }
      g.startVB = { ...viewBox }
    }
  }, [viewBox])

  const onPtrMove = useCallback((e: React.PointerEvent) => {
    if (!ptrsRef.current.has(e.pointerId)) return
    ptrsRef.current.set(e.pointerId, { x: e.clientX, y: e.clientY })
    const g = gestRef.current
    const svg = svgRef.current
    if (!svg) return
    const rect = svg.getBoundingClientRect()

    if (ptrsRef.current.size === 2 && g.isPinch) {
      const [p1, p2] = Array.from(ptrsRef.current.values())
      const dist = Math.hypot(p2.x - p1.x, p2.y - p1.y)
      const ratio = g.startDist / dist
      const newW = Math.min(400, Math.max(400 / 3.5, g.startVB.w * ratio))
      const newH = g.startVB.h * (newW / g.startVB.w)

      // Zoom toward pinch midpoint
      const scale = Math.max(rect.width / g.startVB.w, rect.height / g.startVB.h)
      const ox = (rect.width - g.startVB.w * scale) / 2
      const oy = (rect.height - g.startVB.h * scale) / 2
      const midSvgX = g.startVB.x + (g.startMid.x - rect.left - ox) / scale
      const midSvgY = g.startVB.y + (g.startMid.y - rect.top - oy) / scale

      const curMid = { x: (p1.x + p2.x) / 2, y: (p1.y + p2.y) / 2 }
      const newScale = Math.max(rect.width / newW, rect.height / newH)
      const newOx = (rect.width - newW * newScale) / 2
      const newOy = (rect.height - newH * newScale) / 2

      const newX = midSvgX - (curMid.x - rect.left - newOx) / newScale
      const newY = midSvgY - (curMid.y - rect.top - newOy) / newScale

      commitVB({ x: newX, y: newY, w: newW, h: newH })
    } else if (ptrsRef.current.size === 1 && viewBox.w < 399) {
      const dx = e.clientX - g.tapStart.x
      const dy = e.clientY - g.tapStart.y
      if (Math.abs(dx) > 8 || Math.abs(dy) > 8) g.isPan = true

      if (g.isPan) {
        const svgDx = -dx * (g.startVB.w / rect.width)
        const svgDy = -dy * (g.startVB.h / rect.height)
        commitVB({ x: g.startVB.x + svgDx, y: g.startVB.y + svgDy, w: viewBox.w, h: viewBox.h })
      }
    }
  }, [viewBox])

  const doZoomToggle = useCallback((clientX: number, clientY: number) => {
    if (zoom < 1.5) {
      const pt = screenToSvg(clientX, clientY, svgRef.current, viewBox)
      if (pt) {
        const nw = 400 / 2.5
        const ratio = typeof window !== 'undefined' ? window.innerHeight / window.innerWidth : 2
        const nh = nw * Math.min(2.5, Math.max(0.8, ratio))
        commitVB({ x: pt.x - nw / 2, y: pt.y - nh / 2, w: nw, h: nh })
      }
    } else {
      const ratio = typeof window !== 'undefined' ? window.innerHeight / window.innerWidth : 2
      const h = Math.min(800, Math.max(400, 400 * Math.min(2.5, Math.max(0.8, ratio))))
      setViewBox({ x: 0, y: Math.max(0, (800 - h) / 2), w: 400, h })
    }
  }, [zoom, viewBox])

  const onPtrUp = useCallback((e: React.PointerEvent) => {
    ptrsRef.current.delete(e.pointerId)
    const g = gestRef.current

    if (ptrsRef.current.size === 0) {
      const elapsed = Date.now() - g.tapStart.time
      const dist = Math.hypot(e.clientX - g.tapStart.x, e.clientY - g.tapStart.y)

      if (!g.isPan && !g.isPinch && elapsed < 350 && dist < 15) {
        const isTouch = e.pointerType === 'touch'

        if (isTouch) {
          // Touch: support double-tap zoom — delay single-tap to detect second tap
          const now = Date.now()
          const lt = g.lastTap
          if (now - lt.time < 350 && Math.hypot(e.clientX - lt.x, e.clientY - lt.y) < 30) {
            // Double tap → zoom toggle, cancel pending single-tap action
            g.lastTap = { x: 0, y: 0, time: 0 }
            if (tapTimerRef.current) { clearTimeout(tapTimerRef.current); tapTimerRef.current = null }
            doZoomToggle(e.clientX, e.clientY)
          } else {
            g.lastTap = { time: now, x: e.clientX, y: e.clientY }
            // Delay single-tap so double-tap can cancel it
            const cx = e.clientX, cy = e.clientY
            if (tapTimerRef.current) clearTimeout(tapTimerRef.current)
            tapTimerRef.current = setTimeout(() => {
              tapTimerRef.current = null
              handleGameTap(cx, cy)
            }, 250)
          }
        } else {
          // Mouse/pen: fire game action immediately, no double-click zoom
          // (desktop users have scroll wheel for zoom)
          handleGameTap(e.clientX, e.clientY)
        }
      }
      g.isPinch = false
      g.isPan = false
    }
  }, [handleGameTap, doZoomToggle])

  const onPtrCancel = useCallback((e: React.PointerEvent) => {
    ptrsRef.current.delete(e.pointerId)
    if (ptrsRef.current.size === 0) { gestRef.current.isPinch = false; gestRef.current.isPan = false }
  }, [])

  // Zoom buttons
  const zoomIn = useCallback(() => {
    setViewBox(vb => {
      const nw = Math.max(400 / 3.5, vb.w * 0.65)
      const nh = vb.h * (nw / vb.w)
      return clampVB({ x: vb.x + (vb.w - nw) / 2, y: vb.y + (vb.h - nh) / 2, w: nw, h: nh })
    })
  }, [])

  const zoomOut = useCallback(() => {
    setViewBox(vb => {
      const nw = Math.min(400, vb.w * 1.5)
      const nh = vb.h * (nw / vb.w)
      return clampVB({ x: vb.x + (vb.w - nw) / 2, y: vb.y + (vb.h - nh) / 2, w: nw, h: nh })
    })
  }, [])

  // Wheel zoom for desktop
  const onWheel = useCallback((e: React.WheelEvent) => {
    e.preventDefault()
    const factor = e.deltaY > 0 ? 1.15 : 0.85
    const pt = screenToSvg(e.clientX, e.clientY, svgRef.current, viewBox)
    if (!pt) return
    const nw = Math.min(400, Math.max(400 / 3.5, viewBox.w * factor))
    const nh = viewBox.h * (nw / viewBox.w)
    commitVB({ x: pt.x - (pt.x - viewBox.x) * (nw / viewBox.w), y: pt.y - (pt.y - viewBox.y) * (nh / viewBox.h), w: nw, h: nh })
  }, [viewBox])

  if (!mounted) return null

  return (
    <div className="fixed inset-0 overflow-hidden"
      style={{ background: C.sky1, touchAction: 'none', userSelect: 'none', WebkitUserSelect: 'none' }}
      onPointerDown={onPtrDown} onPointerMove={onPtrMove} onPointerUp={onPtrUp} onPointerCancel={onPtrCancel}
      onWheel={onWheel}>
      <svg ref={svgRef} viewBox={`${viewBox.x} ${viewBox.y} ${viewBox.w} ${viewBox.h}`}
        xmlns="http://www.w3.org/2000/svg" className="absolute inset-0 w-full h-full"
        preserveAspectRatio="xMidYMid slice" style={{ imageRendering: 'auto', touchAction: 'none' }}>
        <Defs />
        <Background />
        <DetailedCity foundTreasures={foundTreasures} zoom={zoom} />
        <Fireflies />
        <SeaLayer />
        <WaterDetails />
        <Petals />
        <Hearts hearts={hearts} />
        <Lanterns lanterns={lanterns} />
        <Effects ripples={ripples} bursts={bursts} />
        <Confetti k={confettiKey} />
      </svg>

      <div className="absolute inset-0 pointer-events-none z-0" style={{ background: 'radial-gradient(ellipse at center, transparent 40%, rgba(0,0,0,0.35) 100%)' }} />
      <BirthdayOverlay allDone={allDone} />
      <GameUI hc={heartsCaught} ht={HEARTS_TARGET} ft={foundTreasures.size} tt={TREASURE_SPOTS.length} lr={lanternsReleased} allDone={allDone} melodyShown={melodyShown} zoom={zoom} songIndex={songIndex} onSongChange={(i) => { setSongIndex(i); snd().setSong(i) }} />
      <ZoomButtons zoom={zoom} onZoomIn={zoomIn} onZoomOut={zoomOut} />
    </div>
  )
}
