export default function Footer() {
  return (
    <footer className="border-t border-border/70 mt-auto">
      <div className="max-w-3xl mx-auto px-6 md:px-8 py-10">
        <div className="flex flex-col md:flex-row justify-between items-center gap-4">
          <span className="font-mono text-xs text-muted-dark">
            &copy; {new Date().getFullYear()} kaan hacihaliloglu — istanbul
          </span>

          <div className="flex items-center gap-5 font-mono text-xs">
            <a
              href="https://github.com/khdoex"
              target="_blank"
              rel="noopener noreferrer"
              className="u-link text-muted hover:text-accent"
            >
              github
            </a>
            <a
              href="https://x.com/kaanhho"
              target="_blank"
              rel="noopener noreferrer"
              className="u-link text-muted hover:text-accent"
            >
              x.com
            </a>
            <a
              href="mailto:kaanhacihaliloglu@gmail.com"
              className="u-link text-muted hover:text-accent"
            >
              email
            </a>
          </div>
        </div>
      </div>
    </footer>
  )
}
