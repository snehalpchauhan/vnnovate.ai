'use client'

const LINKS = [
  { label: 'Services', href: '#services' },
  { label: 'Case Studies', href: '#case-studies' },
  { label: 'About', href: '#about' },
] as const

export default function Nav() {
  return (
    <header className="nav-sky" role="banner">
      <div className="nav-sky__inner">
        <a href="/" className="nav-brand" aria-label="Vnnovate.ai home">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/logo.svg"
            alt="Vnnovate.ai"
            className="nav-logo-img"
            width={116}
            height={80}
          />
        </a>

        <nav className="nav-sky__links" aria-label="Main">
          {LINKS.map((link) => (
            <a key={link.href} href={link.href} className="nav-sky__link">
              {link.label}
            </a>
          ))}
          <button type="button" className="nav-sky__cta">
            Book a Call
          </button>
        </nav>
      </div>
    </header>
  )
}
