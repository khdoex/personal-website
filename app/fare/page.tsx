'use client'

import { useEffect, useState, useMemo } from 'react'

// --- Pixel-art color palette (warm sunset + sage green) ---
const C = {
  sky1: '#ff6b35',   // deep orange horizon
  sky2: '#ff8c42',   // warm orange
  sky3: '#ffb366',   // golden
  sky4: '#ffd4a3',   // peach
  sky5: '#ffe8cc',   // light peach
  sky6: '#e8d5f5',   // lavender top
  sun: '#fff4c1',
  sunGlow: '#ffdd57',
  sea1: '#2d6a4f',   // deep sage sea
  sea2: '#40916c',   // medium green sea
  sea3: '#52b788',   // bright sea green
  seaHighlight: '#95d5b2',
  seaFoam: '#d8f3dc',
  building1: '#8b6f47', // warm stone
  building2: '#a0845c',
  building3: '#c4a97d',
  buildingLight: '#e8d5b7',
  roof: '#c0392b',
  roofDark: '#96281b',
  window: '#ffd580',
  windowDark: '#cc8800',
  green1: '#588157',  // sage green
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

// --- Helper: seeded random for consistent pixel placements ---
function seededRandom(seed: number) {
  let s = seed
  return () => {
    s = (s * 16807 + 0) % 2147483647
    return s / 2147483647
  }
}

// --- SVG Filters ---
function PixelFilters() {
  return (
    <defs>
      <filter id="pixelate">
        <feFlood x="0" y="0" width="2" height="2" />
        <feComposite width="2" height="2" />
        <feTile result="a" />
        <feComposite in="SourceGraphic" in2="a" operator="in" />
        <feMorphology operator="dilate" radius="1" />
      </filter>
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

// --- Sky gradient background ---
function Sky() {
  return (
    <g>
      <defs>
        <linearGradient id="skyGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={C.sky6} />
          <stop offset="25%" stopColor={C.sky5} />
          <stop offset="50%" stopColor={C.sky4} />
          <stop offset="70%" stopColor={C.sky3} />
          <stop offset="85%" stopColor={C.sky2} />
          <stop offset="100%" stopColor={C.sky1} />
        </linearGradient>
      </defs>
      <rect x="0" y="0" width="800" height="600" fill="url(#skyGrad)" />
    </g>
  )
}

// --- Animated Sun with warm glow ---
function Sun() {
  return (
    <g>
      {/* Outer glow rings */}
      <circle cx="400" cy="310" r="120" fill={C.sky3} opacity="0.15" filter="url(#softGlow)">
        <animate attributeName="r" values="120;130;120" dur="6s" repeatCount="indefinite" />
      </circle>
      <circle cx="400" cy="310" r="80" fill={C.sunGlow} opacity="0.25" filter="url(#softGlow)">
        <animate attributeName="r" values="80;88;80" dur="4s" repeatCount="indefinite" />
      </circle>
      <circle cx="400" cy="310" r="50" fill={C.sunGlow} opacity="0.4" filter="url(#glow)">
        <animate attributeName="r" values="50;54;50" dur="3s" repeatCount="indefinite" />
      </circle>
      {/* Sun body */}
      <circle cx="400" cy="310" r="35" fill={C.sun} opacity="0.95">
        <animate attributeName="r" values="35;37;35" dur="5s" repeatCount="indefinite" />
      </circle>
    </g>
  )
}

// --- Pixel Clouds ---
function Clouds() {
  const clouds = [
    { x: 80, y: 60, scale: 1, dur: 90 },
    { x: 300, y: 40, scale: 0.7, dur: 110 },
    { x: 580, y: 80, scale: 0.85, dur: 100 },
    { x: 700, y: 30, scale: 0.6, dur: 85 },
  ]

  return (
    <g>
      {clouds.map((c, i) => (
        <g key={i} opacity="0.7" transform={`scale(${c.scale})`}>
          <g>
            <animateTransform
              attributeName="transform"
              type="translate"
              values={`${c.x},${c.y};${c.x + 800},${c.y}`}
              dur={`${c.dur}s`}
              repeatCount="indefinite"
            />
            {/* Pixel cloud shape - blocky rectangles */}
            <rect x="0" y="8" width="8" height="8" fill={C.cloud} rx="1" />
            <rect x="8" y="4" width="8" height="12" fill={C.cloud} rx="1" />
            <rect x="16" y="0" width="12" height="16" fill={C.cloud} rx="1" />
            <rect x="28" y="2" width="10" height="14" fill={C.cloud} rx="1" />
            <rect x="38" y="4" width="12" height="12" fill={C.cloud} rx="1" />
            <rect x="50" y="6" width="8" height="10" fill={C.cloud} rx="1" />
            <rect x="58" y="8" width="6" height="8" fill={C.cloud} rx="1" />
          </g>
        </g>
      ))}
    </g>
  )
}

// --- Sea with animated waves ---
function Sea() {
  return (
    <g>
      {/* Deep sea base */}
      <rect x="0" y="360" width="800" height="240" fill={C.sea1} />

      {/* Sea gradient overlay */}
      <defs>
        <linearGradient id="seaGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={C.seaHighlight} stopOpacity="0.4" />
          <stop offset="30%" stopColor={C.sea3} stopOpacity="0.3" />
          <stop offset="100%" stopColor={C.sea1} stopOpacity="0" />
        </linearGradient>
      </defs>
      <rect x="0" y="360" width="800" height="240" fill="url(#seaGrad)" />

      {/* Sun reflection on water */}
      <defs>
        <linearGradient id="sunReflection" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={C.sunGlow} stopOpacity="0.5" />
          <stop offset="100%" stopColor={C.sunGlow} stopOpacity="0" />
        </linearGradient>
      </defs>
      <ellipse cx="400" cy="380" rx="80" ry="60" fill="url(#sunReflection)">
        <animate attributeName="rx" values="80;90;80" dur="4s" repeatCount="indefinite" />
      </ellipse>

      {/* Animated wave lines */}
      {[0, 1, 2, 3, 4, 5, 6, 7].map(i => (
        <path
          key={`wave-${i}`}
          d={`M-50,${370 + i * 22} Q50,${365 + i * 22} 100,${370 + i * 22} T200,${370 + i * 22} T300,${370 + i * 22} T400,${370 + i * 22} T500,${370 + i * 22} T600,${370 + i * 22} T700,${370 + i * 22} T800,${370 + i * 22} T900,${370 + i * 22}`}
          fill="none"
          stroke={i < 3 ? C.seaHighlight : C.sea3}
          strokeWidth="1.5"
          opacity={0.3 - i * 0.03}
        >
          <animateTransform
            attributeName="transform"
            type="translate"
            values={`0,0;${i % 2 === 0 ? 20 : -20},${Math.sin(i) * 2}`}
            dur={`${3 + i * 0.5}s`}
            repeatCount="indefinite"
          />
        </path>
      ))}

      {/* Pixel sparkles on water */}
      {[
        { x: 320, y: 375, d: 2 }, { x: 380, y: 385, d: 3 },
        { x: 420, y: 372, d: 2.5 }, { x: 360, y: 395, d: 1.8 },
        { x: 440, y: 390, d: 3.2 }, { x: 350, y: 410, d: 2.7 },
        { x: 410, y: 405, d: 2.2 }, { x: 300, y: 400, d: 3.5 },
        { x: 460, y: 380, d: 2.8 }, { x: 370, y: 420, d: 1.5 },
      ].map((s, i) => (
        <rect key={`sparkle-${i}`} x={s.x} y={s.y} width="3" height="3" fill={C.sun} rx="0.5">
          <animate attributeName="opacity" values="0;0.8;0" dur={`${s.d}s`} begin={`${i * 0.3}s`} repeatCount="indefinite" />
        </rect>
      ))}
    </g>
  )
}

// --- European Historic Building (Mediterranean / Italian style) ---
function Building() {
  return (
    <g>
      {/* === Left cluster === */}
      {/* Tall tower / bell tower */}
      <rect x="80" y="200" width="50" height="160" fill={C.building2} />
      <rect x="80" y="200" width="50" height="6" fill={C.building3} />
      {/* Tower top - pointed roof */}
      <polygon points="78,200 105,170 132,200" fill={C.roof} />
      <polygon points="78,200 105,175 105,200" fill={C.roofDark} />
      {/* Tower windows */}
      {[220, 245, 270, 300, 325].map((y, i) => (
        <g key={`tw-${i}`}>
          <rect x="95" y={y} width="10" height="14" fill={C.windowDark} rx="0" />
          <rect x="96" y={y + 1} width="8" height="12" fill={C.window} rx="0">
            <animate attributeName="opacity" values="0.7;1;0.7" dur={`${2 + i * 0.3}s`} repeatCount="indefinite" />
          </rect>
          {/* Arch top */}
          <rect x="95" y={y} width="10" height="3" fill={C.building3} />
        </g>
      ))}

      {/* Main building left */}
      <rect x="130" y="250" width="90" height="110" fill={C.building1} />
      <rect x="130" y="250" width="90" height="5" fill={C.building3} />
      {/* Terracotta roof */}
      <polygon points="125,250 175,225 225,250" fill={C.roof} />
      <polygon points="125,250 175,230 175,250" fill={C.roofDark} />
      {/* Windows row */}
      {[145, 170, 195].map((x, i) => (
        <g key={`bw1-${i}`}>
          <rect x={x} y="272" width="12" height="16" fill={C.windowDark} />
          <rect x={x + 1} y="273" width="10" height="14" fill={C.window}>
            <animate attributeName="opacity" values="0.6;1;0.6" dur={`${2.5 + i * 0.4}s`} repeatCount="indefinite" />
          </rect>
          <rect x={x} y="305" width="12" height="16" fill={C.windowDark} />
          <rect x={x + 1} y="306" width="10" height="14" fill={C.window}>
            <animate attributeName="opacity" values="0.8;0.5;0.8" dur={`${3 + i * 0.3}s`} repeatCount="indefinite" />
          </rect>
        </g>
      ))}
      {/* Door */}
      <rect x="160" y="335" width="16" height="25" fill={C.windowDark} rx="0" />
      <rect x="160" y="335" width="16" height="4" fill={C.building3} />

      {/* Small building connecting */}
      <rect x="220" y="280" width="60" height="80" fill={C.building3} />
      <rect x="220" y="280" width="60" height="4" fill={C.buildingLight} />
      <polygon points="218,280 250,262 282,280" fill={C.roof} />
      {[232, 256].map((x, i) => (
        <g key={`bw2-${i}`}>
          <rect x={x} y="295" width="10" height="14" fill={C.windowDark} />
          <rect x={x + 1} y="296" width="8" height="12" fill={C.window}>
            <animate attributeName="opacity" values="0.9;0.5;0.9" dur={`${2 + i}s`} repeatCount="indefinite" />
          </rect>
        </g>
      ))}

      {/* === Right cluster === */}
      {/* Large right building */}
      <rect x="530" y="240" width="100" height="120" fill={C.building2} />
      <rect x="530" y="240" width="100" height="5" fill={C.building3} />
      <polygon points="525,240 580,210 635,240" fill={C.roof} />
      <polygon points="525,240 580,215 580,240" fill={C.roofDark} />
      {/* Windows */}
      {[545, 570, 595].map((x, i) => (
        <g key={`bw3-${i}`}>
          <rect x={x} y="258" width="12" height="16" fill={C.windowDark} />
          <rect x={x + 1} y="259" width="10" height="14" fill={C.window}>
            <animate attributeName="opacity" values="0.7;1;0.7" dur={`${2.2 + i * 0.5}s`} repeatCount="indefinite" />
          </rect>
          <rect x={x} y="290" width="12" height="16" fill={C.windowDark} />
          <rect x={x + 1} y="291" width="10" height="14" fill={C.window}>
            <animate attributeName="opacity" values="0.5;0.9;0.5" dur={`${3 + i * 0.2}s`} repeatCount="indefinite" />
          </rect>
        </g>
      ))}
      {/* Balcony */}
      <rect x="565" y="318" width="20" height="3" fill={C.building3} />
      <rect x="567" y="305" width="16" height="16" fill={C.windowDark} />
      <rect x="568" y="306" width="14" height="14" fill={C.window}>
        <animate attributeName="opacity" values="0.8;1;0.8" dur="2s" repeatCount="indefinite" />
      </rect>

      {/* Right tall tower */}
      <rect x="630" y="220" width="45" height="140" fill={C.building1} />
      <rect x="630" y="220" width="45" height="5" fill={C.building2} />
      <polygon points="628,220 652,188 678,220" fill={C.roof} />
      <polygon points="628,220 652,192 652,220" fill={C.roofDark} />
      {/* Clock / round window */}
      <circle cx="652" cy="242" r="8" fill={C.windowDark} />
      <circle cx="652" cy="242" r="6" fill={C.window}>
        <animate attributeName="opacity" values="0.7;1;0.7" dur="4s" repeatCount="indefinite" />
      </circle>
      {[265, 295, 325].map((y, i) => (
        <g key={`tw2-${i}`}>
          <rect x="644" y={y} width="10" height="14" fill={C.windowDark} />
          <rect x="645" y={y + 1} width="8" height="12" fill={C.window}>
            <animate attributeName="opacity" values="0.6;0.9;0.6" dur={`${2.8 + i * 0.4}s`} repeatCount="indefinite" />
          </rect>
        </g>
      ))}

      {/* Small rightmost building */}
      <rect x="675" y="290" width="55" height="70" fill={C.building3} />
      <polygon points="673,290 702,272 732,290" fill={C.roof} />
      <rect x="690" y="308" width="10" height="14" fill={C.windowDark} />
      <rect x="691" y="309" width="8" height="12" fill={C.window}>
        <animate attributeName="opacity" values="0.8;0.5;0.8" dur="2.5s" repeatCount="indefinite" />
      </rect>
      <rect x="710" y="308" width="10" height="14" fill={C.windowDark} />
      <rect x="711" y="309" width="8" height="12" fill={C.window}>
        <animate attributeName="opacity" values="0.6;1;0.6" dur="3s" repeatCount="indefinite" />
      </rect>

      {/* === Waterfront / dock line === */}
      <rect x="0" y="355" width="800" height="8" fill={C.building1} opacity="0.6" />
      <rect x="0" y="358" width="800" height="4" fill={C.sea2} opacity="0.3" />

      {/* Pixel greenery / vines on buildings */}
      {[90, 135, 225, 540, 640, 685].map((x, i) => (
        <g key={`vine-${i}`}>
          <rect x={x + 2} y="348" width="4" height="6" fill={C.green1} />
          <rect x={x - 2} y="345" width="4" height="5" fill={C.green2} />
          <rect x={x + 6} y="346" width="3" height="6" fill={C.green3} />
        </g>
      ))}
    </g>
  )
}

// --- Floating sakura / flower petals ---
function FloatingPetals() {
  const petals = useMemo(() => {
    const rng = seededRandom(42)
    return Array.from({ length: 20 }, (_, i) => ({
      x: rng() * 800,
      startY: -20 - rng() * 100,
      endY: 500 + rng() * 100,
      size: 3 + rng() * 4,
      dur: 10 + rng() * 12,
      delay: rng() * 10,
      drift: (rng() - 0.5) * 80,
      color: rng() > 0.5 ? C.flowerPink : C.flowerWhite,
      opacity: 0.4 + rng() * 0.4,
    }))
  }, [])

  return (
    <g>
      {petals.map((p, i) => (
        <g key={`petal-${i}`} opacity={p.opacity}>
          <rect x="0" y="0" width={p.size} height={p.size * 0.7} fill={p.color} rx="1"
            transform={`rotate(${i * 30})`}>
            <animateTransform
              attributeName="transform"
              type="rotate"
              values={`0;360`}
              dur={`${p.dur * 0.8}s`}
              repeatCount="indefinite"
            />
          </rect>
          <animateTransform
            attributeName="transform"
            type="translate"
            values={`${p.x},${p.startY};${p.x + p.drift},${p.endY}`}
            dur={`${p.dur}s`}
            begin={`${p.delay}s`}
            repeatCount="indefinite"
          />
        </g>
      ))}
    </g>
  )
}

// --- Floating hearts ---
function FloatingHearts() {
  const hearts = useMemo(() => {
    const rng = seededRandom(99)
    return Array.from({ length: 12 }, (_, i) => ({
      x: 200 + rng() * 400,
      startY: 500,
      endY: 50 + rng() * 100,
      size: 4 + rng() * 5,
      dur: 8 + rng() * 8,
      delay: rng() * 12,
      drift: (rng() - 0.5) * 60,
      color: rng() > 0.5 ? C.heartPink : C.heartRed,
    }))
  }, [])

  return (
    <g>
      {hearts.map((h, i) => (
        <g key={`heart-${i}`}>
          {/* Pixel heart: 3 rects forming a heart shape */}
          <g>
            <rect x={-h.size * 0.5} y={0} width={h.size * 0.45} height={h.size * 0.45} fill={h.color} rx="0.5" />
            <rect x={h.size * 0.05} y={0} width={h.size * 0.45} height={h.size * 0.45} fill={h.color} rx="0.5" />
            <rect x={-h.size * 0.25} y={h.size * 0.25} width={h.size * 0.5} height={h.size * 0.45} fill={h.color} rx="0.5" />
          </g>
          <animateTransform
            attributeName="transform"
            type="translate"
            values={`${h.x},${h.startY};${h.x + h.drift},${h.endY}`}
            dur={`${h.dur}s`}
            begin={`${h.delay}s`}
            repeatCount="indefinite"
          />
          <animate attributeName="opacity" values="0;0.7;0.5;0" dur={`${h.dur}s`} begin={`${h.delay}s`} repeatCount="indefinite" />
        </g>
      ))}
    </g>
  )
}

// --- Pixel birds in the distance ---
function Birds() {
  const birds = [
    { x: 150, y: 100, dur: 25, delay: 0 },
    { x: 160, y: 108, dur: 25, delay: 0.3 },
    { x: 500, y: 130, dur: 30, delay: 5 },
    { x: 510, y: 138, dur: 30, delay: 5.4 },
    { x: 350, y: 80, dur: 20, delay: 8 },
  ]

  return (
    <g>
      {birds.map((b, i) => (
        <g key={`bird-${i}`} opacity="0.5">
          {/* Simple pixel bird: V shape */}
          <polyline
            points="-3,0 0,-2 3,0"
            fill="none"
            stroke="#5c4a3a"
            strokeWidth="1.5"
            strokeLinecap="round"
          >
            <animate attributeName="points" values="-3,0 0,-2 3,0;-3,-1 0,0 3,-1;-3,0 0,-2 3,0" dur="0.8s" repeatCount="indefinite" />
          </polyline>
          <animateTransform
            attributeName="transform"
            type="translate"
            values={`${b.x},${b.y};${b.x + 300},${b.y - 20}`}
            dur={`${b.dur}s`}
            begin={`${b.delay}s`}
            repeatCount="indefinite"
          />
        </g>
      ))}
    </g>
  )
}

// --- Tiny pixel boat on the sea ---
function Boat() {
  return (
    <g>
      <animateTransform
        attributeName="transform"
        type="translate"
        values="300,382;500,378;300,382"
        dur="30s"
        repeatCount="indefinite"
      />
      {/* Hull */}
      <polygon points="-10,4 -8,8 8,8 10,4" fill={C.building1} />
      {/* Sail */}
      <polygon points="0,4 0,-10 8,2" fill="#fff8f0" opacity="0.9" />
      <line x1="0" y1="-10" x2="0" y2="8" stroke={C.building1} strokeWidth="1" />
    </g>
  )
}

// --- Fireflies near the water ---
function Fireflies() {
  const flies = useMemo(() => {
    const rng = seededRandom(77)
    return Array.from({ length: 15 }, (_, i) => ({
      cx: 50 + rng() * 700,
      cy: 300 + rng() * 50,
      dur: 3 + rng() * 4,
      delay: rng() * 6,
      r: 1.5 + rng() * 1.5,
    }))
  }, [])

  return (
    <g>
      {flies.map((f, i) => (
        <circle
          key={`ff-${i}`}
          cx={f.cx}
          cy={f.cy}
          r={f.r}
          fill={C.sunGlow}
          filter="url(#glow)"
        >
          <animate attributeName="opacity" values="0;0.8;0" dur={`${f.dur}s`} begin={`${f.delay}s`} repeatCount="indefinite" />
          <animate attributeName="cy" values={`${f.cy};${f.cy - 10};${f.cy}`} dur={`${f.dur + 1}s`} begin={`${f.delay}s`} repeatCount="indefinite" />
        </circle>
      ))}
    </g>
  )
}

// --- Stars (faint, upper sky) ---
function Stars() {
  const stars = useMemo(() => {
    const rng = seededRandom(13)
    return Array.from({ length: 25 }, () => ({
      x: rng() * 800,
      y: rng() * 150,
      size: 1 + rng() * 2,
      dur: 2 + rng() * 3,
      delay: rng() * 4,
    }))
  }, [])

  return (
    <g>
      {stars.map((s, i) => (
        <rect
          key={`star-${i}`}
          x={s.x}
          y={s.y}
          width={s.size}
          height={s.size}
          fill="#fff8f0"
          rx="0.3"
        >
          <animate attributeName="opacity" values="0.1;0.5;0.1" dur={`${s.dur}s`} begin={`${s.delay}s`} repeatCount="indefinite" />
        </rect>
      ))}
    </g>
  )
}

// --- Main Scene SVG ---
function PixelScene() {
  return (
    <svg
      viewBox="0 0 800 600"
      xmlns="http://www.w3.org/2000/svg"
      className="w-full h-full"
      preserveAspectRatio="xMidYMid slice"
      style={{ imageRendering: 'pixelated' }}
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

// --- Birthday text overlay ---
function BirthdayOverlay() {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const t = setTimeout(() => setVisible(true), 800)
    return () => clearTimeout(t)
  }, [])

  return (
    <div
      className={`absolute inset-0 flex flex-col items-center justify-center pointer-events-none transition-opacity duration-[2000ms] ${visible ? 'opacity-100' : 'opacity-0'}`}
    >
      {/* Top title */}
      <div className="text-center mb-4 pointer-events-none">
        <h1
          className="font-mono tracking-widest drop-shadow-lg"
          style={{
            color: C.textMain,
            fontSize: 'clamp(1.8rem, 5vw, 3.5rem)',
            textShadow: `0 0 30px ${C.sky1}88, 0 2px 10px rgba(0,0,0,0.4)`,
            letterSpacing: '0.15em',
          }}
        >
          Happy Birthday, Lara
        </h1>
        <div
          className="mt-2 font-mono tracking-wider"
          style={{
            color: C.textSub,
            fontSize: 'clamp(0.75rem, 2vw, 1rem)',
            textShadow: '0 1px 8px rgba(0,0,0,0.3)',
          }}
        >
          a little world, just for you
        </div>
      </div>

      {/* Note card */}
      <div
        className="mt-6 mx-4 max-w-md px-8 py-6 rounded-lg pointer-events-auto"
        style={{
          background: 'rgba(33, 39, 51, 0.75)',
          backdropFilter: 'blur(10px)',
          border: `1px solid ${C.sea3}44`,
          boxShadow: `0 8px 32px rgba(0,0,0,0.3), inset 0 1px 0 ${C.seaHighlight}22`,
        }}
      >
        <div
          className="prose prose-sm text-center"
          style={{ color: C.textMain }}
        >
          <p className="font-mono text-sm leading-relaxed italic" style={{ color: C.textSub }}>
            {/* Your note goes here — supports markdown */}
            Your special note will go here...
          </p>
        </div>
      </div>
    </div>
  )
}

// --- Page ---
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

      {/* Vignette overlay for cinematic feel */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: 'radial-gradient(ellipse at center, transparent 50%, rgba(0,0,0,0.3) 100%)',
        }}
      />
    </div>
  )
}
