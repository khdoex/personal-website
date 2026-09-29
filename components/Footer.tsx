import Link from 'next/link'

// rel="me" tells crawlers these profiles belong to the site owner. Paired
// with the same URLs in the Person schema's sameAs, it links the handles
// (khdoex, kaanhho) to this site.
export const profiles = [
  { href: 'https://github.com/khdoex', label: 'github' },
  { href: 'https://x.com/kaanhho', label: 'x.com' },
  { href: 'https://www.linkedin.com/in/kaanhho/', label: 'linkedin' },
  { href: 'https://huggingface.co/kaanhho', label: 'huggingface' },
]

export default function Footer({ line }: { line: string }) {
  return (
    <footer className="site-footer relative z-[1] mt-auto border-t border-border/70 bg-background/60 backdrop-blur-md">
      <div className="mx-auto w-full max-w-[1168px] px-6 md:px-8 py-10">
        <div className="flex flex-col md:flex-row justify-between items-center gap-4 font-mono text-meta">
          <span className="text-muted">
            &copy; {new Date().getFullYear()} {line}
          </span>

          <div className="flex flex-wrap justify-center items-center gap-x-5 gap-y-2">
            {profiles.map((profile) => (
              <a
                key={profile.href}
                href={profile.href}
                target="_blank"
                rel="me noopener noreferrer"
                className="u-link text-muted hover:text-accent"
              >
                {profile.label}
              </a>
            ))}
            <a
              href="mailto:kaanhacihaliloglu@gmail.com"
              rel="me"
              className="u-link text-muted hover:text-accent"
            >
              email
            </a>
            <Link
              href="/tr"
              hrefLang="tr"
              className="u-link text-muted hover:text-accent"
            >
              tr
            </Link>
          </div>
        </div>
      </div>
    </footer>
  )
}
