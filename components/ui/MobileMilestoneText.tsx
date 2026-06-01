'use client'

import type { PathMilestone } from '@/lib/pathMilestones'

type Props = {
  milestone: PathMilestone
  blend: number
  isFocused: boolean
}

export default function MobileMilestoneText({ milestone, blend, isFocused }: Props) {
  const t = Math.pow(Math.max(0, Math.min(1, blend)), 0.7)

  return (
    <div
      className={`mobile-m3d${isFocused ? ' is-focused' : ''}`}
      style={
        {
          opacity: blend,
          '--m3d-color': milestone.objectColor,
          '--m3d-depth': `${t}`,
        } as React.CSSProperties
      }
      aria-live="polite"
    >
      <div className="mobile-m3d__stage">
        <p className="mobile-m3d__eyebrow m3d-layer" data-depth="1" style={{ '--layer-i': 1 } as React.CSSProperties}>
          <span className="mobile-m3d__icon" aria-hidden>
            {milestone.icon}
          </span>
          {milestone.eyebrow}
        </p>

        <h2 className="mobile-m3d__title m3d-layer" data-depth="2" style={{ '--layer-i': 2 } as React.CSSProperties}>
          {milestone.title}
          {milestone.titleAccent && (
            <span className="mobile-m3d__accent">{milestone.titleAccent}</span>
          )}
        </h2>

        <p className="mobile-m3d__sub m3d-layer" data-depth="3" style={{ '--layer-i': 3 } as React.CSSProperties}>
          {milestone.sub}
        </p>

        <p className="mobile-m3d__body m3d-layer" data-depth="4" style={{ '--layer-i': 4 } as React.CSSProperties}>
          {milestone.body}
        </p>

        {milestone.stat && (
          <div className="mobile-m3d__stat m3d-layer" data-depth="5" style={{ '--layer-i': 5 } as React.CSSProperties}>
            <span className="mobile-m3d__stat-value">{milestone.stat}</span>
            {milestone.statLabel && (
              <span className="mobile-m3d__stat-label">{milestone.statLabel}</span>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
