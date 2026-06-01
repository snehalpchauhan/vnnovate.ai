'use client'

import { useCallback, useEffect } from 'react'
import { startHoldFlyScroll, stopHoldFlyScroll } from '@/lib/holdFlyScroll'
import { useScrollProgress } from '@/lib/useScrollProgress'
import { useIsMobile } from '@/lib/useMediaQuery'

type Props = {
  disabled?: boolean
}

export default function MobileFlyButton({ disabled }: Props) {
  const isMobile = useIsMobile()
  const { progress, holdFlying } = useScrollProgress()

  const atEnd = progress >= 0.995

  const onPressStart = useCallback(
    (e: React.PointerEvent<HTMLButtonElement>) => {
      if (disabled || atEnd) return
      e.preventDefault()
      e.currentTarget.setPointerCapture(e.pointerId)
      startHoldFlyScroll()
    },
    [disabled, atEnd]
  )

  const onPressEnd = useCallback((e: React.PointerEvent<HTMLButtonElement>) => {
    if (e.currentTarget.hasPointerCapture(e.pointerId)) {
      e.currentTarget.releasePointerCapture(e.pointerId)
    }
    stopHoldFlyScroll()
  }, [])

  useEffect(() => {
    return () => stopHoldFlyScroll()
  }, [])

  if (!isMobile) return null

  return (
    <button
      type="button"
      className={`mobile-fly-btn${holdFlying ? ' is-holding' : ''}`}
      disabled={disabled || atEnd}
      onPointerDown={onPressStart}
      onPointerUp={onPressEnd}
      onPointerCancel={onPressEnd}
      onLostPointerCapture={onPressEnd}
      aria-label={atEnd ? 'Journey complete' : 'Hold to fly'}
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
