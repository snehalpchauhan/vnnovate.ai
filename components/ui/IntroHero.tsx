'use client'

import { useEffect, useState } from 'react'
import { PATH_MILESTONES } from '@/lib/pathMilestones'
import { useScrollProgress } from '@/lib/useScrollProgress'
import { useIsMobile } from '@/lib/useMediaQuery'

type Props = {
  beginCinematicFly: (targetProgress: number, fast: boolean) => void
}

export default function IntroHero({ beginCinematicFly }: Props) {
  const { progress } = useScrollProgress()
  const isMobile = useIsMobile()
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const t = setTimeout(() => setVisible(true), 420)
    return () => clearTimeout(t)
  }, [])

  const scrolled = progress > 0.008
  const show = visible && !scrolled

  if (!show) return null

  if (isMobile) {
    return (
      <div
        className={`intro-hero intro-hero--visible intro-hero--mobile`}
        aria-hidden={!show}
      >
        <p className="intro-hero__mobile-eyebrow">Intelligent systems, engineered</p>
        <h1 className="intro-hero__mobile-headline">
          Where AI meets <span className="intro-hero__accent">ambition</span>
        </h1>
      </div>
    )
  }

  return (
    <div
      className={`intro-hero ${show ? 'intro-hero--visible' : ''}`}
      aria-hidden={!show}
    >
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
            onClick={() =>
              beginCinematicFly(PATH_MILESTONES[0]?.progress ?? 0.055, false)
            }
          >
            Begin the journey ↑
          </button>
        </div>
      </div>

      <div className="intro-hero__chevron" aria-hidden>
        <span />
        <span />
      </div>
    </div>
  )
}
