export const metadata = {
  title: 'Resume | Kaan Hacihaliloglu',
}

export default function Resume() {
  return (
    <div className="max-w-3xl mx-auto px-6 md:px-8 pt-16 md:pt-24 pb-28">
      <header className="mb-10 flex items-baseline justify-between gap-6">
        <h1 className="reveal font-mono text-lg font-semibold text-heading" style={{ '--d': 0 } as React.CSSProperties}>
          resume
        </h1>
        <a
          href="/documents/resume.pdf"
          download="KaanHacihaliloglu_Resume.pdf"
          className="reveal u-link font-mono text-xs text-accent hover:text-heading shrink-0"
          style={{ '--d': 1 } as React.CSSProperties}
        >
          download pdf ↓
        </a>
      </header>

      <div className="reveal w-full aspect-[8.5/11] border border-border rounded-md overflow-hidden bg-white" style={{ '--d': 2 } as React.CSSProperties}>
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
