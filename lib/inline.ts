// The inline markdown content/site.md allows: [text](href), **strong** and
// *em*. Nothing else is interpreted, and no HTML passes through, so copy can
// never inject markup.

export type InlineToken =
  | { kind: 'text'; text: string }
  | { kind: 'strong'; text: string }
  | { kind: 'em'; text: string }
  | { kind: 'link'; text: string; href: string }

const PATTERN = /\[([^\]]+)\]\(([^)\s]+)\)|\*\*([^*]+)\*\*|\*([^*]+)\*/g

export function tokenizeInline(source: string): InlineToken[] {
  const tokens: InlineToken[] = []
  let last = 0
  for (const m of source.matchAll(PATTERN)) {
    const at = m.index ?? 0
    if (at > last) tokens.push({ kind: 'text', text: source.slice(last, at) })
    if (m[1] !== undefined) tokens.push({ kind: 'link', text: m[1], href: m[2] })
    else if (m[3] !== undefined) tokens.push({ kind: 'strong', text: m[3] })
    else tokens.push({ kind: 'em', text: m[4] })
    last = at + m[0].length
  }
  if (last < source.length) tokens.push({ kind: 'text', text: source.slice(last) })
  return tokens
}

/** The same text with the markdown taken out, for meta tags and feeds. */
export function plainInline(source: string): string {
  return tokenizeInline(source)
    .map((t) => t.text)
    .join('')
}
