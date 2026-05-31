'use client'

import { useEffect, useState } from 'react'
import { getScrollSnapshot, subscribeScroll, type ScrollSnapshot } from './scrollStore'

/**
 * React-facing scroll state (UI layer). Throttled via rAF in the store subscriber.
 * Do not use inside R3F useFrame — read scrollStore directly there.
 */
export function useScrollProgress(): ScrollSnapshot {
  const [snapshot, setSnapshot] = useState<ScrollSnapshot>(getScrollSnapshot)

  useEffect(() => {
    let raf = 0
    const onChange = () => {
      cancelAnimationFrame(raf)
      raf = requestAnimationFrame(() => setSnapshot(getScrollSnapshot()))
    }

    onChange()
    return subscribeScroll(onChange)
  }, [])

  return snapshot
}
