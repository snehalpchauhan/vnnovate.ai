'use client'

import dynamic from 'next/dynamic'
import { useEffect, useState } from 'react'
import { getLandingScrollHeightVh } from '@/lib/viewport'
import MobileBodyClass from '@/components/MobileBodyClass'
import ScrollDriver from '@/components/ScrollDriver'
import Nav from '@/components/ui/Nav'
import MilestoneChrome from '@/components/ui/MilestoneChrome'
import MobileJourneyBar from '@/components/ui/MobileJourneyBar'
import ScrollFlyHint from '@/components/ui/ScrollFlyHint'
import SceneLoader from '@/components/ui/SceneLoader'
import IntroHero from '@/components/ui/IntroHero'
import { useCinematicFly } from '@/lib/useCinematicFly'

const ButterflyLandingScene = dynamic(
  () => import('@/components/three/ButterflyLandingScene'),
  { ssr: false }
)

export default function ButterflyLanding() {
  const cinematic = useCinematicFly()
  const [scrollVh, setScrollVh] = useState(() =>
    typeof window !== 'undefined' ? getLandingScrollHeightVh() : 5600
  )

  useEffect(() => {
    const update = () => setScrollVh(getLandingScrollHeightVh())
    update()
    window.addEventListener('resize', update)
    const mq = window.matchMedia('(max-width: 768px)')
    mq.addEventListener('change', update)
    return () => {
      window.removeEventListener('resize', update)
      mq.removeEventListener('change', update)
    }
  }, [])

  return (
    <>
      <MobileBodyClass />
      <ScrollDriver key={scrollVh} />

      <div className="canvas-wrapper">
        <ButterflyLandingScene />
      </div>

      <Nav />

      <div className="ui-overlay">
        <IntroHero beginCinematicFly={cinematic.beginCinematicFly} />
        <MilestoneChrome cinematic={cinematic} />
        <MobileJourneyBar />
        <ScrollFlyHint />
      </div>

      <SceneLoader />

      <div className="landing-vignette" aria-hidden />

      {/* Tall spacer — scroll progress drives the butterfly path */}
      <div
        className="scroll-container scroll-container--landing"
        style={{ height: `${scrollVh}vh` }}
        aria-hidden
      />
    </>
  )
}
