'use client'

import { useEffect } from 'react'
import { getLandingScrollHeightVh, hasFinePointer, isMobileViewport } from '@/lib/viewport'

/** Sets document classes + CSS var for scroll height (desktop unchanged). */
export default function MobileBodyClass() {
  useEffect(() => {
    const root = document.documentElement

    const apply = () => {
      const mobile = isMobileViewport()
      root.classList.toggle('is-mobile', mobile)
      root.classList.toggle('is-touch', !hasFinePointer())
      root.style.setProperty(
        '--landing-scroll-vh',
        `${getLandingScrollHeightVh()}`
      )
    }

    apply()
    window.addEventListener('resize', apply)
    const mq = window.matchMedia('(max-width: 768px)')
    mq.addEventListener('change', apply)
    return () => {
      window.removeEventListener('resize', apply)
      mq.removeEventListener('change', apply)
    }
  }, [])

  return null
}
