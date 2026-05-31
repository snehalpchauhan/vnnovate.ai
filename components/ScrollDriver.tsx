'use client'

import { useLayoutEffect } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import {
  decayScrollVelocity,
  resetScrollStore,
  setScrollProgress,
  unlockIntroCamera,
} from '@/lib/scrollStore'

gsap.registerPlugin(ScrollTrigger)

/**
 * Binds page scroll to normalized progress via GSAP ScrollTrigger (scrubbed).
 * 3D reads scrollStore in useFrame; React UI subscribes via useScrollProgress.
 */
export default function ScrollDriver() {
  useLayoutEffect(() => {
    const container = document.querySelector('.scroll-container')
    if (!container) return

    resetScrollStore()
    window.scrollTo(0, 0)

    const trigger = ScrollTrigger.create({
      trigger: container,
      start: 'top top',
      end: 'bottom bottom',
      scrub: 1.15,
      onUpdate: (self) => {
        setScrollProgress(self.progress)
      },
    })

    setScrollProgress(trigger.progress)

    let raf = 0
    let lastTick = performance.now()
    const tickVelocity = (now: number) => {
      const dt = Math.min(0.05, (now - lastTick) / 1000)
      lastTick = now
      decayScrollVelocity(dt)
      raf = requestAnimationFrame(tickVelocity)
    }
    raf = requestAnimationFrame(tickVelocity)

    const onScrollInput = () => unlockIntroCamera()
    window.addEventListener('wheel', onScrollInput, { passive: true })
    window.addEventListener('touchstart', onScrollInput, { passive: true })

    return () => {
      cancelAnimationFrame(raf)
      trigger.kill()
      window.removeEventListener('wheel', onScrollInput)
      window.removeEventListener('touchstart', onScrollInput)
      resetScrollStore()
    }
  }, [])

  return null
}
