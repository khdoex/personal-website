import LensGame from '@/components/lens-test/LensGame'

export const metadata = {
  title: 'Mercek Testi | Kaan Hacihaliloglu',
  description:
    'Kör lens testi: fotoğraf zevkine göre Fujifilm X-S20 için hangi lens yolunun sana uyduğunu bul.',
}

export default function LensTestPage() {
  return (
    <div className="max-w-3xl mx-auto px-6 md:px-8 pt-16 md:pt-24 pb-28">
      <header className="mb-12">
        <h1 className="font-mono text-2xl md:text-3xl font-semibold text-heading">
          mercek testi
        </h1>
        <p className="text-muted mt-3 max-w-xl leading-relaxed">
          bir kör tat testi, ama fotoğraf için. gözün hangi lensi seçiyor?
        </p>
      </header>
      <LensGame />
    </div>
  )
}
