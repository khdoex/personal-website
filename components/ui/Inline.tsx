import Link from 'next/link'
import { tokenizeInline } from '@/lib/inline'

/**
 * Renders a string from content/site.md with its inline markdown: links,
 * bold and italics. A link starting with / stays on the site through
 * next/link, a web link opens in a new tab, mailto: opens the mail app.
 */
export default function Inline({
  text,
  linkClassName = 'u-link text-accent hover:text-heading',
}: {
  text: string
  linkClassName?: string
}) {
  return (
    <>
      {tokenizeInline(text).map((token, i) => {
        switch (token.kind) {
          case 'strong':
            return (
              <strong key={i} className="font-semibold text-heading">
                {token.text}
              </strong>
            )
          case 'em':
            return <em key={i}>{token.text}</em>
          case 'link':
            if (token.href.startsWith('/')) {
              return (
                <Link key={i} href={token.href} className={linkClassName}>
                  {token.text}
                </Link>
              )
            }
            return /^https?:/.test(token.href) ? (
              <a
                key={i}
                href={token.href}
                target="_blank"
                rel="noopener noreferrer"
                className={linkClassName}
              >
                {token.text}
              </a>
            ) : (
              <a key={i} href={token.href} className={linkClassName}>
                {token.text}
              </a>
            )
          default:
            return token.text
        }
      })}
    </>
  )
}
