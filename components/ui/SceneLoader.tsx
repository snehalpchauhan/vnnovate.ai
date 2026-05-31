'use client'

import { useEffect, useRef, useState } from 'react'
import { useProgress } from '@react-three/drei'

const MIN_VISIBLE_MS = 600

export default function SceneLoader() {
  const { active, progress } = useProgress()
  const [phase, setPhase] = useState<'loading' | 'fading' | 'done'>('loading')
  const [dots, setDots] = useState(0)
  const mountedAt = useRef(performance.now())

  // Animate loading dots
  useEffect(() => {
    const id = setInterval(() => setDots((d) => (d + 1) % 4), 420)
    return () => clearInterval(id)
  }, [])

  // Fade out once drei reports all assets loaded (with a small minimum
  // on-screen time so the loader doesn't flash on fast connections).
  useEffect(() => {
    if (phase !== 'loading') return
    const ready = !active && progress >= 100
    if (!ready) return

    const elapsed = performance.now() - mountedAt.current
    const wait = Math.max(0, MIN_VISIBLE_MS - elapsed)

    const fadeTimer = setTimeout(() => setPhase('fading'), wait)
    const doneTimer = setTimeout(() => setPhase('done'), wait + 800)
    return () => {
      clearTimeout(fadeTimer)
      clearTimeout(doneTimer)
    }
  }, [active, progress, phase])

  // Safety net: never trap the user behind the loader.
  useEffect(() => {
    const hardStop = setTimeout(() => setPhase('done'), 12000)
    return () => clearTimeout(hardStop)
  }, [])

  if (phase === 'done') return null

  return (
    <div className={`scene-loader ${phase === 'fading' ? 'scene-loader--fading' : ''}`}>
      {/* Butterfly SVG silhouette */}
      <svg
        className="scene-loader__butterfly"
        viewBox="0 0 80 56"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden
      >
        {/* Left wings */}
        <path
          d="M40 28 C32 18, 12 10, 6 22 C2 30, 14 38, 26 34 C32 32, 38 30, 40 28Z"
          fill="url(#lg1)"
          opacity="0.9"
        />
        <path
          d="M40 28 C34 22, 16 16, 12 26 C8 34, 20 40, 30 36 C35 34, 39 30, 40 28Z"
          fill="url(#lg1)"
          opacity="0.55"
        />
        {/* Right wings */}
        <path
          d="M40 28 C48 18, 68 10, 74 22 C78 30, 66 38, 54 34 C48 32, 42 30, 40 28Z"
          fill="url(#lg2)"
          opacity="0.9"
        />
        <path
          d="M40 28 C46 22, 64 16, 68 26 C72 34, 60 40, 50 36 C45 34, 41 30, 40 28Z"
          fill="url(#lg2)"
          opacity="0.55"
        />
        {/* Body */}
        <ellipse cx="40" cy="28" rx="2.2" ry="8" fill="#4f46e5" />
        <defs>
          <linearGradient id="lg1" x1="6" y1="10" x2="40" y2="40" gradientUnits="userSpaceOnUse">
            <stop stopColor="#818cf8" />
            <stop offset="1" stopColor="#6366f1" />
          </linearGradient>
          <linearGradient id="lg2" x1="74" y1="10" x2="40" y2="40" gradientUnits="userSpaceOnUse">
            <stop stopColor="#22d3ee" />
            <stop offset="1" stopColor="#6366f1" />
          </linearGradient>
        </defs>
      </svg>

      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src="/logo.svg" alt="Vnnovate.ai" className="scene-loader__logo" />

      <p className="scene-loader__status">
        Preparing your journey{'.'
          .repeat(dots)
          .padEnd(3, '\u00a0')}
      </p>

      <div className="scene-loader__bar">
        <div
          className="scene-loader__fill"
          style={{ width: `${Math.max(8, Math.round(progress))}%` }}
        />
      </div>
    </div>
  )
}
