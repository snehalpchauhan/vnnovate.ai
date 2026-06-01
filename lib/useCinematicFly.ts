'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { scrollToProgress } from '@/lib/scrollNavigation'
import { useScrollProgress } from '@/lib/useScrollProgress'

/** Shared cinematic scroll-to-milestone (used by intro Fly + milestone advance). */
export function useCinematicFly() {
  const { progress, velocity } = useScrollProgress()
  const [isCinematicFly, setIsCinematicFly] = useState(false)
  const targetRef = useRef<number | null>(null)

  const beginCinematicFly = useCallback((targetProgress: number, fast: boolean) => {
    targetRef.current = targetProgress
    setIsCinematicFly(true)
    scrollToProgress(targetProgress, fast)
  }, [])

  useEffect(() => {
    if (!isCinematicFly || targetRef.current == null) return

    const target = targetRef.current
    const arrived = Math.abs(progress - target) < 0.004 && velocity < 0.06
    if (arrived) {
      targetRef.current = null
      setIsCinematicFly(false)
      return
    }

    const safety = setTimeout(() => {
      targetRef.current = null
      setIsCinematicFly(false)
    }, 6000)
    return () => clearTimeout(safety)
  }, [isCinematicFly, progress, velocity])

  return { isCinematicFly, beginCinematicFly }
}
