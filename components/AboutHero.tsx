import Image from 'next/image'
import Canvas from '@/components/layout/Canvas'

/**
 * The top of /about: the heading and the story in the reading column, the
 * portrait in the right track. On a phone the portrait sits above the heading.
 */
export default function AboutHero({ children }: { children: React.ReactNode }) {
  return (
    <Canvas className="pt-16 md:pt-24 pb-16">
      <div className="lg:col-start-3 lg:row-start-1">
        <Image
          src="/images/kaan-hacihaliloglu.png"
          alt="Kaan Hacihaliloglu"
          width={1086}
          height={1448}
          priority
          className="mb-8 h-auto w-full max-w-[12rem] lg:mb-0 lg:max-w-none"
        />
      </div>
      <div className="lg:col-start-2 lg:row-start-1">
        <h1 className="font-serif text-h2 font-normal text-heading">
          about
        </h1>
        {children}
      </div>
    </Canvas>
  )
}
