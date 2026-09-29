'use client'

import { useState } from 'react'

/**
 * A cartoon of refusal-direction ablation. Two activation clusters live in
 * a 2D projection; dragging the slider removes the refusal component and
 * the harmful cluster walks across the decision boundary.
 */

// Fixed toy points (no randomness: SSR-stable).
const HARMLESS: [number, number][] = [
  [52, 88], [68, 74], [44, 68], [80, 92], [60, 102], [88, 78],
]
const HARMFUL: [number, number][] = [
  [208, 42], [226, 56], [196, 60], [238, 38], [214, 72], [244, 62],
]

// Unit-ish refusal direction in this projection (harmful sits "up-right" of it).
const DIR = { x: 0.86, y: -0.51 }
// How far along -DIR a fully ablated harmful point travels.
const TRAVEL = 130

export default function RefusalToy() {
  const [strength, setStrength] = useState(0)

  const shifted = HARMFUL.map(([x, y]) => [
    x - DIR.x * TRAVEL * strength,
    y - DIR.y * TRAVEL * strength,
  ])

  const refusing = strength < 0.55

  return (
    <div>
      <svg viewBox="0 0 300 140" className="w-full" role="img" aria-label="toy activation space with a refusal direction">
        {/* decision boundary, perpendicular-ish to the direction */}
        <line x1={148} y1={0} x2={110} y2={140} stroke="rgb(var(--border))" strokeWidth={1} strokeDasharray="4 4" />
        <text x={122} y={132} fill="rgb(var(--muted))" fontSize={8} fontFamily="var(--font-mono), monospace">boundary</text>

        {/* refusal direction arrow */}
        <defs>
          <marker id="arrow" viewBox="0 0 8 8" refX={7} refY={4} markerWidth={6} markerHeight={6} orient="auto-start-reverse">
            <path d="M0,0 L8,4 L0,8 z" fill="rgb(var(--sky))" />
          </marker>
        </defs>
        <line
          x1={150}
          y1={90}
          x2={150 + DIR.x * 52}
          y2={90 + DIR.y * 52}
          stroke="rgb(var(--sky))"
          strokeWidth={1.5}
          markerEnd="url(#arrow)"
          opacity={Math.max(0.25, 1 - strength)}
        />
        <text x={186} y={92} fill="rgb(var(--sky))" fontSize={8} fontFamily="var(--font-mono), monospace" opacity={Math.max(0.25, 1 - strength)}>
          refusal dir
        </text>

        {HARMLESS.map(([x, y], i) => (
          <circle key={`h${i}`} cx={x} cy={y} r={4} fill="rgb(var(--sky))" opacity={0.85} />
        ))}
        {shifted.map(([x, y], i) => (
          <circle
            key={`a${i}`}
            cx={x}
            cy={y}
            r={4}
            fill="rgb(var(--sun))"
            opacity={0.9}
            style={{ transition: 'cx 0.2s ease-out, cy 0.2s ease-out' }}
          />
        ))}
      </svg>

      <div className="mt-4 flex items-center gap-4">
        <span className="font-mono text-tick text-muted shrink-0">ablation</span>
        <input
          type="range"
          min={0}
          max={100}
          value={Math.round(strength * 100)}
          onChange={(e) => setStrength(Number(e.target.value) / 100)}
          className="w-full accent-accent"
          aria-label="ablation strength"
        />
        <span className="font-mono text-tick text-muted w-10 text-right shrink-0">
          {Math.round(strength * 100)}%
        </span>
      </div>

      <div className="mt-4 font-mono text-meta border-t border-border pt-3" aria-live="polite">
        <span className="text-muted">model output: </span>
        <span className={refusing ? 'text-sky' : 'text-sun'}>
          {refusing
            ? '"i can\'t help with that"'
            : '"sure, here is how you would..."'}
        </span>
      </div>

      <p className="mt-3 font-mono text-tick text-muted leading-relaxed">
        drag the slider: removing the refusal component moves harmful
        activations across the boundary, and the model stops refusing.
      </p>
    </div>
  )
}
