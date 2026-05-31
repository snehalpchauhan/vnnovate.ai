'use client'

import { useMemo } from 'react'
import dynamic from 'next/dynamic'
import { useScrollProgress } from '@/lib/useScrollProgress'
import {
  CHAPTER_COLORS,
  getChapterAtProgress,
  getMagnetStrength,
  INDUSTRY_CHAPTER_KEYS,
} from '@/lib/chapters'
import { getHeroBlend } from '@/lib/butterflyFlight'
import ScrollDriver from '@/components/ScrollDriver'
import Nav from '@/components/ui/Nav'
import HeroText from '@/components/ui/HeroText'
import ChapterPanel from '@/components/ui/ChapterPanel'
import ProgressRail from '@/components/ui/ProgressRail'
import ScrollHint from '@/components/ui/ScrollHint'
import FinaleSection from '@/components/ui/FinaleSection'

const Scene = dynamic(() => import('@/components/three/Scene'), { ssr: false })

export default function VnnovateScene() {
  const { progress, warpIntensity } = useScrollProgress()

  const chapter = useMemo(() => getChapterAtProgress(progress), [progress])
  const currentChapter = chapter.key
  const chapterColor = CHAPTER_COLORS[currentChapter] ?? '#6366F1'

  const magnetStrength = useMemo(
    () => getMagnetStrength(progress, currentChapter),
    [progress, currentChapter]
  )

  const isHero = currentChapter === 'hero'
  const isWarp = currentChapter === 'warp'
  const isFinale = currentChapter === 'finale'
  const isIndustryChapter = INDUSTRY_CHAPTER_KEYS.includes(
    currentChapter as (typeof INDUSTRY_CHAPTER_KEYS)[number]
  )

  const activeChapter3d = isIndustryChapter ? currentChapter : null
  const heroBlend = getHeroBlend(progress)

  return (
    <>
      <ScrollDriver />

      <div className="canvas-wrapper">
        <Scene
          chapterColor={chapterColor}
          magnetStrength={magnetStrength}
          activeChapter={activeChapter3d}
        />
      </div>

      <div className="ui-overlay">
        <Nav />

        <HeroText visible={isHero} />

        {isIndustryChapter && (
          <ChapterPanel currentChapter={currentChapter} progress={progress} />
        )}

        {isIndustryChapter && (
          <ProgressRail currentChapter={currentChapter} progress={progress} />
        )}

        <ScrollHint visible={isHero} />

        <FinaleSection visible={isFinale} />
      </div>

      <div
        className="chapter-tint"
        style={{
          background: isHero
            ? `radial-gradient(ellipse at 50% 30%, #06B6D408 0%, transparent 55%)`
            : `radial-gradient(ellipse at 60% 50%, ${chapterColor}${isWarp ? '22' : '12'} 0%, transparent 70%)`,
          opacity: isHero ? heroBlend : isWarp ? 1 + warpIntensity * 0.5 : 1,
        }}
      />
    </>
  )
}
