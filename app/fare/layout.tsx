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
    <>
      <style>{`
        header, nav, footer { display: none !important; visibility: hidden !important; }
        main { padding: 0 !important; margin: 0 !important; min-height: 0 !important; }
        main > * { padding: 0 !important; }
        html, body { overflow: hidden !important; height: 100dvh !important; margin: 0 !important; padding: 0 !important; }
      `}</style>
      <div style={{ position: 'fixed', inset: 0, zIndex: 9999, overflow: 'hidden' }}>
        {children}
      </div>
    </>
  )
}
