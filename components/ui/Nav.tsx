'use client'

import { useCallback, useEffect, useState } from 'react'
import { bookCallHref, SITE_CONTACT, whatsappHref } from '@/lib/siteContact'

type DialogKind = 'about' | null

function NavDialog({
  open,
  title,
  onClose,
  children,
}: {
  open: boolean
  title: string
  onClose: () => void
  children: React.ReactNode
}) {
  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', onKey)
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', onKey)
      document.body.style.overflow = prev
    }
  }, [open, onClose])

  if (!open) return null

  return (
    <div
      className="nav-dialog-backdrop"
      onClick={onClose}
      role="presentation"
    >
      <div
        className="nav-dialog"
        role="dialog"
        aria-modal="true"
        aria-labelledby="nav-dialog-title"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          type="button"
          className="nav-dialog__close"
          onClick={onClose}
          aria-label="Close"
        >
          ×
        </button>
        <h2 id="nav-dialog-title" className="nav-dialog__title">
          {title}
        </h2>
        {children}
      </div>
    </div>
  )
}

export default function Nav() {
  const [dialog, setDialog] = useState<DialogKind>(null)
  const close = useCallback(() => setDialog(null), [])

  return (
    <>
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
            <button
              type="button"
              className="nav-sky__link-btn"
              onClick={() => setDialog('about')}
            >
              About
            </button>
            <a
              href={whatsappHref()}
              className="nav-sky__wa"
              target="_blank"
              rel="noopener noreferrer"
            >
              WhatsApp
            </a>
            <a href={bookCallHref()} className="nav-sky__cta">
              Book a Call
            </a>
          </nav>
        </div>
      </header>

      <NavDialog open={dialog === 'about'} title="About Vnnovate.ai" onClose={close}>
        <p className="nav-dialog__lead">
          We design and ship autonomous AI systems — from first idea to production scale.
        </p>
        <p className="nav-dialog__body">
          For over 12 years we have built enterprise-ready software across logistics,
          finance, healthcare, and retail. Today we help teams turn fragmented data and
          manual workflows into AI products that measure real ROI: faster support,
          smarter sales, automated operations, and custom models trained on your domain.
        </p>
        <ul className="nav-dialog__list">
          <li>AI strategy, discovery, and rapid prototyping</li>
          <li>Autonomous agents and workflow automation</li>
          <li>Deep integrations with your existing stack</li>
          <li>Production delivery in weeks, not quarters</li>
        </ul>
        <p className="nav-dialog__stat">
          <strong>50+</strong> AI systems shipped · <strong>12 yrs</strong> building at scale
        </p>
        <div className="nav-dialog__actions">
          <a href={bookCallHref()} className="nav-dialog__btn nav-dialog__btn--primary">
            Book a call
          </a>
          <a
            href={whatsappHref()}
            className="nav-dialog__btn nav-dialog__btn--wa"
            target="_blank"
            rel="noopener noreferrer"
          >
            Chat on WhatsApp
          </a>
        </div>
      </NavDialog>

    </>
  )
}
