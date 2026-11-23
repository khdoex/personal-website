import Image from 'next/image'
import Canvas from '@/components/layout/Canvas'

/**
 * Blended portrait scene: the photo dissolves into the page background on
 * the right.
 */
export default function AboutHero({ children }: { children: React.ReactNode }) {
  const mask =
    'radial-gradient(80% 90% at 62% 38%, black 30%, transparent 76%)'

  return (
    <section className="relative overflow-hidden">
      <div
        aria-hidden
        className="pointer-events-none absolute right-0 top-0 h-full w-[78%] sm:w-[52%] max-w-xl opacity-90"
      >
        <Image
          src="/images/kaan-hacihaliloglu.png"
          alt=""
          width={1086}
          height={1448}
          priority
          className="h-full w-full object-cover object-top"
          style={{
            WebkitMaskImage: mask,
            maskImage: mask,
            filter: 'saturate(0.75) contrast(1.02)',
          }}
        />
      </div>

      <Canvas className="relative pt-24 md:pt-32 pb-16">
        <div className="col-span-full xl:[grid-column:2/3] max-w-md sm:max-w-lg">
          <h1 className="font-serif text-h2 font-normal text-heading">
            about
          </h1>
          {children}
        </div>
      </Canvas>
    </section>
  )
}
