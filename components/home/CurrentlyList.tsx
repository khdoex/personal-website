'use client'

import Meta from '@/components/ui/Meta'
import Inline from '@/components/ui/Inline'
import Reveal from '@/components/motion/Reveal'
import { world } from '@/components/world/store'
import type { CurrentItem } from '@/lib/content-types'

// The same order as the colours of the bridge's lights (pick() in
// components/world/engine/city/bridge.ts).
const TONES = ['text-accent', 'text-sun', 'text-sky']

/**
 * What Kaan is working on, one colour each. Pointing at an entry (or tabbing
 * to its link) lights the whole Bosphorus Bridge in its colour.
 */
export default function CurrentlyList({ items }: { items: CurrentItem[] }) {
  return (
    <ol className="mt-8 space-y-1">
      {items.map((item, i) => (
        <li
          key={item.title}
          onMouseEnter={() => world.highlight(i)}
          onMouseLeave={() => world.highlight(null)}
          onFocus={() => world.highlight(i)}
          onBlur={() => world.highlight(null)}
        >
          <Reveal
            delay={i * 0.08}
            className="-mx-5 rounded-2xl border border-transparent px-5 py-5 transition-colors duration-300 hover:border-border/80 hover:bg-background/40"
          >
            <div className="flex items-center gap-3">
              <span aria-hidden className={`dot ${TONES[i % TONES.length]}`} />
              <Meta tone="date">{item.since}</Meta>
            </div>
            <h3 className="mt-3 font-serif text-h3 font-normal text-heading">
              {item.href ? (
                <a
                  href={item.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="u-link hover:text-accent"
                >
                  {item.title}
                </a>
              ) : (
                item.title
              )}
            </h3>
            <p className="mt-2 font-serif text-sm text-muted">
              <Inline text={item.desc} />
            </p>
          </Reveal>
        </li>
      ))}
    </ol>
  )
}
