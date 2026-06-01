'use client'

import { useEffect, useState } from 'react'
import { useScrollProgress } from '@/lib/useScrollProgress'

export default function IntroHero() {
  const { progress } = useScrollProgress()
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const t = setTimeout(() => setVisible(true), 420)
    return () => clearTimeout(t)
  }, [])

  // Fade out as soon as user starts scrolling — well before the first
  // milestone (≈0.055) so the two never overlap on screen.
  const scrolled = progress > 0.008
  const show = visible && !scrolled

  return (
    <div
      className={`intro-hero ${show ? 'intro-hero--visible' : ''}`}
      aria-hidden={!show}
    >
      {/* Centered glass card */}
      <div className="intro-hero__center">
        <p className="intro-hero__eyebrow">Intelligent systems, engineered</p>

        <h1 className="intro-hero__headline">
          Where AI meets <span className="intro-hero__accent">ambition</span>
        </h1>

        <p className="intro-hero__sub">
          We design and ship autonomous AI products — from first idea to production.
          12 years of delivery. Built for the era that is here now.
        </p>

        <div className="intro-hero__actions">
          <button
            type="button"
            className="intro-hero__btn intro-hero__btn--primary"
            onClick={() => window.scrollBy({ top: window.innerHeight * 0.6, behavior: 'smooth' })}
          >
            Begin the journey ↑
          </button>
        </div>
      </div>

      {/* Scroll chevron at bottom center */}
      <div className="intro-hero__chevron" aria-hidden>
        <span />
        <span />
      </div>
    </div>
  )
}
