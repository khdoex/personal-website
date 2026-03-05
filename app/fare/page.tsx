'use client'

import { useEffect, useState, useMemo } from 'react'

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

function seededRandom(seed: number) {
  let s = seed
  return () => {
    s = (s * 16807 + 0) % 2147483647
    return s / 2147483647
  }
}

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

function Building() {
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
    </g>
  )
}

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

function FloatingHearts() {
  const hearts = useMemo(() => {
    const rng = seededRandom(99)
    return Array.from({ length: 10 }, () => ({
      x: 80 + rng() * 240,
      startY: 700,
      endY: 50 + rng() * 150,
      size: 3.5 + rng() * 4,
      dur: 10 + rng() * 10,
      delay: rng() * 14,
      drift: (rng() - 0.5) * 50,
      color: rng() > 0.5 ? C.heartPink : C.heartRed,
    }))
  }, [])

  return (
    <g>
      {hearts.map((h, i) => (
        <g key={`heart-${i}`}>
          <g>
            <rect x={-h.size * 0.5} y={0} width={h.size * 0.45} height={h.size * 0.45} fill={h.color} rx="0.5" />
            <rect x={h.size * 0.05} y={0} width={h.size * 0.45} height={h.size * 0.45} fill={h.color} rx="0.5" />
            <rect x={-h.size * 0.25} y={h.size * 0.25} width={h.size * 0.5} height={h.size * 0.45} fill={h.color} rx="0.5" />
          </g>
          <animateTransform attributeName="transform" type="translate" values={`${h.x},${h.startY};${h.x + h.drift},${h.endY}`} dur={`${h.dur}s`} begin={`${h.delay}s`} repeatCount="indefinite" />
          <animate attributeName="opacity" values="0;0.7;0.5;0" dur={`${h.dur}s`} begin={`${h.delay}s`} repeatCount="indefinite" />
        </g>
      ))}
    </g>
  )
}

// --- Main Scene SVG (portrait-first: 400x800 viewBox) ---
function PixelScene() {
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
      <Building />
      <Fireflies />
      <Sea />
      <Boat />
      <FloatingPetals />
      <FloatingHearts />
    </svg>
  )
}

// --- Birthday text overlay (mobile-first) ---
function BirthdayOverlay() {
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
      {/* Title area — top portion of screen */}
      <div className="flex-shrink-0 text-center pt-8 pb-2 px-4 sm:pt-12">
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

      {/* Spacer to push note card toward bottom */}
      <div className="flex-1 min-h-0" />

      {/* Note card — bottom portion, above the sea */}
      <div
        className="flex-shrink-0 mx-5 mb-8 px-6 py-5 rounded-xl pointer-events-auto max-w-sm w-full sm:mb-12 sm:px-8 sm:py-6"
        style={{
          background: 'rgba(33, 39, 51, 0.78)',
          backdropFilter: 'blur(12px)',
          WebkitBackdropFilter: 'blur(12px)',
          border: `1px solid ${C.sea3}33`,
          boxShadow: `0 8px 32px rgba(0,0,0,0.35), inset 0 1px 0 ${C.seaHighlight}18`,
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
            {/* Your note goes here — supports markdown */}
            Your special note will go here...
          </p>
        </div>
      </div>

      {/* Bottom safe area padding for phones with gesture bars */}
      <div style={{ height: 'env(safe-area-inset-bottom, 0px)', flexShrink: 0 }} />
    </div>
  )
}

export default function FarePage() {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) return null

  return (
    <div
      className="fixed inset-0 overflow-hidden"
      style={{ background: C.sky1, cursor: 'default' }}
    >
      <PixelScene />
      <BirthdayOverlay />

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
