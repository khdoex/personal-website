const copy = {
  en: {
    divider: 'the last check uses trusted application state',
    model: 'model',
    modelResult: 'proposes what to do',
    application: 'application',
    applicationResult: 'decides what is allowed',
    layers: [
      { number: '01', title: 'model defense', question: 'Can the model keep the trusted task ahead of the injected one?', result: 'reduces bad proposals', color: 'rgb(var(--accent) / 0.7)' },
      { number: '02', title: 'detector', question: 'Does this input or internal state look suspicious?', result: 'adds a warning signal', color: 'rgb(var(--amber))' },
      { number: '03', title: 'action authorization', question: 'Did the user authorize this tool, recipient, and data flow?', result: 'decides what may happen', color: 'rgb(var(--accent))' },
    ],
  },
  tr: {
    divider: 'son kontrol güvenilir application state kullanır',
    model: 'model',
    modelResult: 'ne yapılacağını önerir',
    application: 'uygulama',
    applicationResult: 'neye izin verildiğine karar verir',
    layers: [
      { number: '01', title: 'model savunması', question: 'Model güvenilir görevi enjekte edilen talimatın önünde tutabiliyor mu?', result: 'kötü önerileri azaltır', color: 'rgb(var(--accent) / 0.7)' },
      { number: '02', title: 'detector', question: 'Bu input veya internal state şüpheli görünüyor mu?', result: 'uyarı sinyali ekler', color: 'rgb(var(--amber))' },
      { number: '03', title: 'action authorization', question: "Kullanıcı bu tool'u, alıcıyı ve data flow'u yetkilendirdi mi?", result: 'ne olabileceğine karar verir', color: 'rgb(var(--accent))' },
    ],
  },
} as const

export default function PromptActionBoundaryFigure({ lang = 'en' }: { lang?: 'en' | 'tr' }) {
  const text = copy[lang]
  return (
    <div>
      <div className="grid gap-3">
        {text.layers.map((layer) => (
          <div key={layer.number} className="grid gap-3 rounded-lg border border-border bg-surface/25 p-4 sm:grid-cols-[3rem_10rem_minmax(0,1fr)_10rem] sm:items-center sm:gap-5 sm:p-5">
            <div className="font-mono text-meta" style={{ color: layer.color }}>{layer.number}</div>
            <div className="font-mono text-sm text-heading">{layer.title}</div>
            <div className="text-sm leading-relaxed text-muted">{layer.question}</div>
            <div className="font-mono text-tick sm:text-right" style={{ color: layer.color }}>{layer.result}</div>
          </div>
        ))}
      </div>

      <div className="my-5 flex items-center gap-4 font-mono text-tick uppercase tracking-[0.14em] text-muted">
        <span className="h-px flex-1 bg-border" />
        <span>{text.divider}</span>
        <span className="h-px flex-1 bg-border" />
      </div>

      <div className="grid gap-px overflow-hidden rounded-lg border border-border bg-border sm:grid-cols-2">
        <div className="bg-background p-5">
          <div className="font-mono text-tick uppercase tracking-[0.14em] text-muted">{text.model}</div>
          <div className="mt-2 font-mono text-base text-heading">{text.modelResult}</div>
        </div>
        <div className="bg-accent/5 p-5">
          <div className="font-mono text-tick uppercase tracking-[0.14em] text-accent">{text.application}</div>
          <div className="mt-2 font-mono text-base text-heading">{text.applicationResult}</div>
        </div>
      </div>
    </div>
  )
}
