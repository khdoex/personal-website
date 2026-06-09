export const metadata = {
  title: 'Resume | Kaan Hacihaliloglu',
}

export default function Resume() {
  return (
    <div className="max-w-3xl mx-auto px-6 md:px-8 pt-16 md:pt-24 pb-28">
      <header className="mb-10 flex flex-col md:flex-row md:items-end md:justify-between gap-6">
        <div>
          <p className="reveal font-mono text-[13px] tracking-[0.2em] uppercase text-muted" style={{ '--d': 0 } as React.CSSProperties}>
            Resume
          </p>
          <h1 className="reveal font-display text-4xl md:text-6xl tracking-tight text-foreground mt-4" style={{ '--d': 1 } as React.CSSProperties}>
            The paper trail<em className="text-accent">.</em>
          </h1>
        </div>
        <a
          href="/documents/resume.pdf"
          download="KaanHacihaliloglu_Resume.pdf"
          className="reveal u-link font-mono text-sm text-accent hover:text-accent-light shrink-0"
          style={{ '--d': 2 } as React.CSSProperties}
        >
          download pdf ↓
        </a>
      </header>

      <div className="reveal w-full aspect-[8.5/11] border border-border rounded-lg overflow-hidden bg-white" style={{ '--d': 3 } as React.CSSProperties}>
        <iframe
          src="/documents/resume.pdf#view=FitH"
          className="w-full h-full"
          style={{ border: 'none' }}
          title="Resume"
        />
      </div>
    </div>
  )
}
