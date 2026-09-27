import Link from 'next/link'

// rel="me" tells crawlers these profiles belong to the site owner. Paired
// with the same URLs in the Person schema's sameAs, it links the handles
// (khdoex, kaanhho) to this site.
const profiles = [
  { href: 'https://github.com/khdoex', label: 'github' },
  { href: 'https://x.com/kaanhho', label: 'x.com' },
  { href: 'https://www.linkedin.com/in/kaanhho/', label: 'linkedin' },
  { href: 'https://huggingface.co/kaanhho', label: 'huggingface' },
]

export default function Footer() {
  return (
    <footer className="border-t border-border/70 mt-auto">
      <div className="mx-auto w-full max-w-[1168px] px-6 md:px-8 py-10">
        <div className="flex flex-col md:flex-row justify-between items-center gap-4 font-mono text-xs">
          <span className="text-muted">
            &copy; {new Date().getFullYear()} kaan hacihaliloglu · istanbul, 41.0°N 28.9°E
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
