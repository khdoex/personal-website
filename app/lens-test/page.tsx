import LensGame from '@/components/lens-test/LensGame'

export const metadata = {
  title: 'Mercek Testi | Kaan Hacihaliloglu',
  description:
    'Kör lens testi: fotoğraf zevkine göre Fujifilm X-S20 için hangi lens yolunun sana uyduğunu bul.',
  robots: { index: false, follow: false },
}

export default function LensTestPage() {
  return (
    <div className="max-w-3xl mx-auto px-6 md:px-8 pt-8 md:pt-24 pb-28">
      <LensGame />
    </div>
  )
}
