'use client'

import { useMemo } from 'react'
import { PATH_MILESTONES } from '@/lib/pathMilestones'
import { scrollToProgress } from '@/lib/scrollNavigation'
import { useScrollProgress } from '@/lib/useScrollProgress'
import { useIsMobile } from '@/lib/useMediaQuery'

export default function MobileJourneyBar() {
  const isMobile = useIsMobile()
  const { progress } = useScrollProgress()

  const activeIndex = useMemo(() => {
    let best = 0
    let bestDist = Infinity
    PATH_MILESTONES.forEach((m, i) => {
      const d = Math.abs(progress - m.progress)
      if (d < bestDist) {
        bestDist = d
        best = i
      }
    })
    return best
  }, [progress])

  if (!isMobile) return null

  const active = PATH_MILESTONES[activeIndex]

  return (
    <nav className="mobile-journey" aria-label="Journey progress">
      <div className="mobile-journey__meta">
        <span className="mobile-journey__step">
          {activeIndex + 1} / {PATH_MILESTONES.length}
        </span>
        <span className="mobile-journey__label">
          {active?.title}
          {active?.titleAccent ?? ''}
        </span>
      </div>

      <div
        className="mobile-journey__track"
        role="progressbar"
        aria-valuenow={Math.round(progress * 100)}
        aria-valuemin={0}
        aria-valuemax={100}
      >
        <div
          className="mobile-journey__fill"
          style={{ width: `${Math.min(100, progress * 100)}%` }}
        />
      </div>

      <div className="mobile-journey__dots" role="list">
        {PATH_MILESTONES.map((m, i) => {
          const done = progress > m.progress + m.span
          const isActive = i === activeIndex
          return (
            <button
              key={m.id}
              type="button"
              role="listitem"
              className={[
                'mobile-journey__dot',
                done ? 'is-done' : '',
                isActive ? 'is-active' : '',
              ]
                .filter(Boolean)
                .join(' ')}
              style={{ '--dot-color': m.objectColor } as React.CSSProperties}
              onClick={() => scrollToProgress(m.progress, true)}
              aria-label={`${m.title}${m.titleAccent ?? ''}`}
              aria-current={isActive ? 'step' : undefined}
            />
          )
        })}
      </div>
    </nav>
  )
}
