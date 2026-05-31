'use client'

import dynamic from 'next/dynamic'
import { LANDING_SCROLL_HEIGHT_VH } from '@/lib/butterflyScrollPath'
import ScrollDriver from '@/components/ScrollDriver'
import Nav from '@/components/ui/Nav'
import MilestoneChrome from '@/components/ui/MilestoneChrome'
import SceneLoader from '@/components/ui/SceneLoader'
import IntroHero from '@/components/ui/IntroHero'

const ButterflyLandingScene = dynamic(
  () => import('@/components/three/ButterflyLandingScene'),
  { ssr: false }
)

export default function ButterflyLanding() {
  return (
    <>
      <ScrollDriver />

      <div className="canvas-wrapper">
        <ButterflyLandingScene />
      </div>

      <Nav />

      <div className="ui-overlay">
        <IntroHero />
        <MilestoneChrome />
      </div>

      <SceneLoader />

      <div className="landing-vignette" aria-hidden />

      {/* Tall spacer — scroll progress drives the butterfly path */}
      <div
        className="scroll-container scroll-container--landing"
        style={{ height: `${LANDING_SCROLL_HEIGHT_VH}vh` }}
        aria-hidden
      />
    </>
  )
}
