/**
 * A section boundary. The 6px tick at the left edge is the same mark the
 * figure components use on an axis.
 */
export default function Rule({ className = '' }: { className?: string }) {
  return (
    <div role="separator" className={`relative h-px w-full bg-border ${className}`}>
      <span aria-hidden className="absolute left-0 top-0 h-1.5 w-px bg-muted-dark" />
    </div>
  )
}
