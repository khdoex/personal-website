/**
 * A home page section's mark: its number in sun gold, a hairline, its name.
 * The instrument register, like every label on the site.
 */
export default function SectionLabel({ n, label }: { n: string; label: string }) {
  return (
    <p className="flex items-center gap-3 font-mono text-meta tracking-[0.04em]">
      <span className="tabular-nums text-sun">{n}</span>
      <span aria-hidden className="h-px w-8 bg-border" />
      <span className="text-muted">{label}</span>
    </p>
  )
}
