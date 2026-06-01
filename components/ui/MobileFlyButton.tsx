'use client'

import { PATH_MILESTONES } from '@/lib/pathMilestones'
import { useScrollProgress } from '@/lib/useScrollProgress'
import { useIsMobile } from '@/lib/useMediaQuery'

type Props = {
  onFly: (targetProgress: number) => void
  disabled?: boolean
}

function getFlyTarget(progress: number): number | null {
  if (progress < 0.02) {
    return PATH_MILESTONES[0]?.progress ?? 0.055
  }

  let activeIdx = 0
  let bestDist = Infinity
  PATH_MILESTONES.forEach((m, i) => {
    const d = Math.abs(progress - m.progress)
    if (d < bestDist) {
      bestDist = d
      activeIdx = i
    }
  })

  const next = PATH_MILESTONES[activeIdx + 1]
  return next?.progress ?? null
}

export default function MobileFlyButton({ onFly, disabled }: Props) {
  const isMobile = useIsMobile()
  const { progress } = useScrollProgress()

  if (!isMobile) return null

  const nextTarget = getFlyTarget(progress)
  const atEnd = nextTarget == null

  return (
    <button
      type="button"
      className="mobile-fly-btn"
      disabled={disabled || atEnd}
      onClick={() => {
        if (nextTarget != null) onFly(nextTarget)
      }}
      aria-label={atEnd ? 'Journey complete' : 'Fly to next milestone'}
    >
      <span className="mobile-fly-btn__label">Fly</span>
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden>
        <path
          d="M3 8h10M9 4l4 4-4 4"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </button>
  )
}
