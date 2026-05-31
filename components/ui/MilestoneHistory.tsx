'use client'

import { useMemo } from 'react'
import { useScrollProgress } from '@/lib/useScrollProgress'
import { PATH_MILESTONES } from '@/lib/pathMilestones'
import { LANDING_SCROLL_HEIGHT_VH } from '@/lib/butterflyScrollPath'

function flyTo(progress: number) {
  const totalPx = (LANDING_SCROLL_HEIGHT_VH / 100) * window.innerHeight
  window.scrollTo({ top: progress * totalPx, behavior: 'smooth' })
}

export default function MilestoneHistory() {
  const { progress } = useScrollProgress()

  const passed = useMemo(
    () => PATH_MILESTONES.filter((m) => progress > m.progress + m.span * 1.5),
    [progress]
  )

  if (passed.length === 0) return null

  return (
    <div className="mh-rail" aria-label="Visited milestones">
      <p className="mh-heading">Journey so far</p>
      <ul className="mh-list">
        {passed.map((m) => (
          <li key={m.id}>
            <button
              type="button"
              className="mh-item"
              onClick={() => flyTo(m.progress)}
              title={`Fly back to: ${m.title}${m.titleAccent ?? ''}`}
              style={{ '--dot-color': m.objectColor } as React.CSSProperties}
            >
              <span className="mh-dot" />
              <span className="mh-label">
                <span className="mh-eyebrow">{m.eyebrow}</span>
                <span className="mh-title">
                  {m.title}
                  {m.titleAccent && (
                    <span style={{ color: m.objectColor }}>{m.titleAccent}</span>
                  )}
                </span>
              </span>
            </button>
          </li>
        ))}
      </ul>
    </div>
  )
}
