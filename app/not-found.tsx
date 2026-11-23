import Link from 'next/link'
import Canvas from '@/components/layout/Canvas'
import Gutter from '@/components/layout/Gutter'
import Rule from '@/components/ui/Rule'
import Meta from '@/components/ui/Meta'
import Inline from '@/components/ui/Inline'
import { content } from '@/lib/content.generated'

// The root layout sets a `%s | Kaan Hacihaliloglu` template, so the suffix
// belongs there and not here.
export const metadata = {
  title: 'Not found',
}

export default function NotFound() {
  return (
    <Canvas className="pb-28 pt-24 md:pt-32">
      <Gutter>
        <Meta>404</Meta>
      </Gutter>

      <div className="lg:col-start-2">
        <h1 className="font-serif text-h2 font-normal text-heading">
          {content.notFound.title}
        </h1>
        {content.notFound.body.map((paragraph, i) => (
          <p key={i} className="mt-4 font-serif text-lead text-muted">
            <Inline text={paragraph} />
          </p>
        ))}
      </div>

      <Rule className="col-span-full mt-16" />

      <div className="mt-8 flex flex-wrap gap-x-7 gap-y-3 lg:col-start-2">
        <Link href="/" className="u-link font-mono text-meta text-accent hover:text-heading">
          home
        </Link>
        <Link href="/blog" className="u-link font-mono text-meta text-muted hover:text-accent">
          writing
        </Link>
        <Link href="/projects" className="u-link font-mono text-meta text-muted hover:text-accent">
          projects
        </Link>
        <Link href="/about" className="u-link font-mono text-meta text-muted hover:text-accent">
          about
        </Link>
      </div>
    </Canvas>
  )
}
