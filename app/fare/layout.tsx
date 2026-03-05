export default function FareLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="fare-layout">
      <style>{`
        .fare-layout { position: fixed; inset: 0; z-index: 9999; }
        nav, footer, main { display: none !important; }
      `}</style>
      {children}
    </div>
  )
}
