'use client'

import { useCallback, useMemo } from 'react'
import { useScrollProgress } from '@/lib/useScrollProgress'
import { getMilestoneTextState, PATH_MILESTONES } from '@/lib/pathMilestones'
import { LANDING_SCROLL_HEIGHT_VH } from '@/lib/butterflyScrollPath'

function flyToNext(currentProgress: number) {
  const idx = PATH_MILESTONES.findIndex(
    (m) => Math.abs(m.progress - currentProgress) < 0.04
  )
  const next = PATH_MILESTONES[idx + 1]
  if (!next) return
  const totalPx = (LANDING_SCROLL_HEIGHT_VH / 100) * window.innerHeight
  const targetY = next.progress * totalPx
  window.scrollTo({ top: targetY, behavior: 'smooth' })
}

export default function IntroText() {
  const { progress, velocity } = useScrollProgress()
  const { milestone, blend } = useMemo(
    () => getMilestoneTextState(progress, velocity),
    [progress, velocity]
  )

  const handleFlyNext = useCallback(() => {
    if (milestone) flyToNext(milestone.progress)
  }, [milestone])

  if (!milestone || blend < 0.1) {
    return (
      <div className="milestone-card" aria-hidden>
        <span className="sr-only">Vnnovate.ai</span>
      </div>
    )
  }

  return (
    <div
      className="milestone-card is-visible"
      style={{ opacity: blend, filter: `blur(${(1 - blend) * 5}px)` }}
    >
      {/* Eyebrow */}
      <p className="mc-eyebrow">{milestone.eyebrow}</p>

      {/* Title */}
      <h2 className="mc-title">
        {milestone.title}
        {milestone.titleAccent && (
          <span className="mc-accent">{milestone.titleAccent}</span>
        )}
      </h2>

      {/* Sub-headline */}
      <p className="mc-sub">{milestone.sub}</p>

      {/* Body */}
      <p className="mc-body">{milestone.body}</p>

      {/* Stat pill */}
      {milestone.stat && (
        <div className="mc-stat">
          <span className="mc-stat__value">{milestone.stat}</span>
          {milestone.statLabel && (
            <span className="mc-stat__label">{milestone.statLabel}</span>
          )}
        </div>
      )}

      {/* Actions */}
      <div className="mc-actions">
        {milestone.caseStudyHref && (
          <a
            href={milestone.caseStudyHref}
            className="mc-btn mc-btn--ghost"
            target="_blank"
            rel="noopener noreferrer"
          >
            View case study ↗
          </a>
        )}
        <button
          type="button"
          className="mc-btn mc-btn--fly"
          onClick={handleFlyNext}
        >
          <span>Fly to next</span>
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden>
            <path d="M2 7h10M8 3l4 4-4 4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </button>
      </div>
    </div>
  )
}
