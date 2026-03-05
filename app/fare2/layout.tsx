import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'For You',
  robots: { index: false, follow: false },
}

export default function FareLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="fare-layout">
      <style>{`
        .fare-layout { position: fixed; inset: 0; z-index: 9999; overflow: hidden; }
        nav, footer { display: none !important; }
        main { padding: 0 !important; margin: 0 !important; }
        html, body { overflow: hidden !important; height: 100% !important; }
      `}</style>
      {children}
    </div>
  )
}
