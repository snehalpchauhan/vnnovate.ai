'use client'

import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useScrollProgress } from '@/lib/useScrollProgress'
import {
  getMilestoneTextState,
  PATH_MILESTONES,
  type PathMilestone,
} from '@/lib/pathMilestones'
import { LANDING_SCROLL_HEIGHT_VH } from '@/lib/butterflyScrollPath'
import {
  getPassedMilestones,
  getSidebarColumnCount,
  getSidebarSlotRect,
  resolveFoldFromRect,
} from '@/lib/milestoneUi'

type FlyGhost = {
  id: string
  milestone: PathMilestone
  from: DOMRect
  to: DOMRect
  phase: 'start' | 'end'
  tx: number
  ty: number
  sx: number
  sy: number
  o0: number // opacity the card had when the fold began (avoids a pop)
}

let flyRaf = 0
const FOLD_MS = 650

/** Cinematic eased scroll — cubic ease-in-out over `duration` ms. */
function cinematicScrollTo(targetY: number, duration = 2800) {
  cancelAnimationFrame(flyRaf)
  const startY = window.scrollY
  const dist = targetY - startY
  const start = performance.now()

  function easeInOutCubic(t: number) {
    return t < 0.5 ? 4 * t * t * t : 1 - (-2 * t + 2) ** 3 / 2
  }

  function tick(now: number) {
    const elapsed = now - start
    const t = Math.min(elapsed / duration, 1)
    window.scrollTo(0, startY + dist * easeInOutCubic(t))
    if (t < 1) flyRaf = requestAnimationFrame(tick)
    else flyRaf = 0
  }

  flyRaf = requestAnimationFrame(tick)
}

function scrollToProgress(progress: number, fast: boolean) {
  const totalPx = (LANDING_SCROLL_HEIGHT_VH / 100) * window.innerHeight
  const targetY = progress * totalPx
  if (fast) {
    window.scrollTo({ top: targetY, behavior: 'smooth' })
  } else {
    cinematicScrollTo(targetY)
  }
}

export default function MilestoneChrome() {
  const { progress, velocity } = useScrollProgress()
  const [isCinematicFly, setIsCinematicFly] = useState(false)

  const { milestone, blend } = useMemo(
    () =>
      getMilestoneTextState(progress, velocity, {
        ignoreVelocity: isCinematicFly,
      }),
    [progress, velocity, isCinematicFly]
  )

  const passed = useMemo(() => getPassedMilestones(progress), [progress])
  const columnCount = getSidebarColumnCount(Math.max(passed.length, 1))

  const cardRef = useRef<HTMLDivElement>(null)
  const lastCardIdRef = useRef<string | null>(null)
  const shownMilestoneRef = useRef<PathMilestone | null>(null)
  const lastShownBlendRef = useRef(1)
  const cinematicTargetRef = useRef<number | null>(null)
  const cardRectCacheRef = useRef<Map<string, DOMRect>>(new Map())
  const foldedIdsRef = useRef<Set<string>>(new Set())
  const flyGhostIdRef = useRef<string | null>(null)
  const [flyGhost, setFlyGhost] = useState<FlyGhost | null>(null)
  const [hiddenIds, setHiddenIds] = useState<Set<string>>(() => new Set())
  const [tilt, setTilt] = useState({ x: 0, y: 0 })

  const isFocused = blend > 0.82
  // Hide the real card only when the ghost is fully covering it (phase='end')
  // so there is never a blank frame between card disappearing and ghost appearing.
  const ghostCoversCard =
    flyGhost !== null &&
    milestone !== null &&
    flyGhost.id === milestone.id &&
    flyGhost.phase === 'end'
  const showCard = milestone && blend >= 0.1 && !ghostCoversCard

  if (milestone) lastCardIdRef.current = milestone.id

  const startFold = useCallback(
    (target: PathMilestone, slotIndex: number, slotTotal: number) => {
      if (flyGhostIdRef.current === target.id) return

      const live = cardRef.current?.getBoundingClientRect()
      const cached = cardRectCacheRef.current.get(target.id)
      const from = resolveFoldFromRect(live, cached)
      if (from.width <= 40 || from.height <= 40) return

      const to = getSidebarSlotRect(slotIndex, slotTotal)

      // Pre-compute transform deltas so CSS only animates `transform` (GPU).
      const tx = to.left - from.left
      const ty = to.top - from.top
      const sx = to.width / from.width
      const sy = to.height / from.height

      // Start the ghost at the card's current opacity so there is no
      // faded→clear pop when the animation begins.
      const o0 = Math.max(0.35, Math.min(1, lastShownBlendRef.current))

      flyGhostIdRef.current = target.id
      setHiddenIds((s) => new Set(s).add(target.id))
      setFlyGhost({
        id: target.id,
        milestone: target,
        from,
        to,
        phase: 'start',
        tx,
        ty,
        sx,
        sy,
        o0,
      })

      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          setFlyGhost((g) => (g ? { ...g, phase: 'end' } : null))
        })
      })
    },
    []
  )

  const clearFold = useCallback((id: string) => {
    flyGhostIdRef.current = null
    setHiddenIds((s) => {
      const next = new Set(s)
      next.delete(id)
      return next
    })
    setFlyGhost(null)
  }, [])

  // Cache the card's full-size position while it's strongly visible.
  useEffect(() => {
    if (!showCard || !milestone || !cardRef.current || blend < 0.35) return
    cardRectCacheRef.current.set(
      milestone.id,
      cardRef.current.getBoundingClientRect()
    )
    shownMilestoneRef.current = milestone
    lastShownBlendRef.current = blend
    // Re-shown (e.g. flew back) → allow it to fold again next time it leaves.
    foldedIdsRef.current.delete(milestone.id)
  }, [showCard, milestone, blend])

  // Fold the moment the card LEAVES (milestone changes / fades), not later when
  // "passed" updates — this removes the hide→reappear gap on manual scroll.
  useEffect(() => {
    const prev = shownMilestoneRef.current
    const leaving =
      prev &&
      (!milestone || milestone.id !== prev.id) &&
      progress > prev.progress &&
      !foldedIdsRef.current.has(prev.id) &&
      flyGhostIdRef.current !== prev.id

    if (leaving && prev) {
      foldedIdsRef.current.add(prev.id)
      // It is always the newest item → lands in the last sidebar slot.
      const ordinal = PATH_MILESTONES.findIndex((m) => m.id === prev.id)
      startFold(prev, ordinal, ordinal + 1)
      shownMilestoneRef.current = null
    }
  }, [milestone, progress, startFold])

  // End fold once — avoid transitionend firing per property (caused flicker).
  useEffect(() => {
    if (!flyGhost || flyGhost.phase !== 'end') return
    const id = flyGhost.id
    const timer = setTimeout(() => clearFold(id), FOLD_MS + 40)
    return () => clearTimeout(timer)
  }, [flyGhost, clearFold])

  // Hold "cinematic" (velocity-ignoring) mode until the SCRUBBED progress
  // actually reaches the target and settles — GSAP scrub lags the window
  // scroll, so a fixed timer ended the fly too early and hid the next card.
  useEffect(() => {
    if (!isCinematicFly) return
    const target = cinematicTargetRef.current
    if (target == null) return

    const arrived = Math.abs(progress - target) < 0.004 && velocity < 0.06
    if (arrived) {
      cinematicTargetRef.current = null
      setIsCinematicFly(false)
      return
    }

    // Safety: never get stuck ignoring velocity.
    const safety = setTimeout(() => {
      cinematicTargetRef.current = null
      setIsCinematicFly(false)
    }, 6000)
    return () => clearTimeout(safety)
  }, [isCinematicFly, progress, velocity])

  const beginCinematicFly = useCallback(
    (targetProgress: number, fast: boolean) => {
      cinematicTargetRef.current = targetProgress
      setIsCinematicFly(true)
      scrollToProgress(targetProgress, fast)
    },
    []
  )

  const handleFlyNext = useCallback(() => {
    if (!milestone) return
    const idx = PATH_MILESTONES.findIndex((m) => m.id === milestone.id)
    const next = PATH_MILESTONES[idx + 1]
    if (!next) return

    // Fold current card immediately, then fly to next milestone.
    foldedIdsRef.current.add(milestone.id)
    startFold(milestone, idx, idx + 1)
    beginCinematicFly(next.progress, false)
  }, [milestone, startFold, beginCinematicFly])

  const handleSidebarFly = useCallback(
    (targetProgress: number) => {
      beginCinematicFly(targetProgress, true)
    },
    [beginCinematicFly]
  )

  const handleCardPointerMove = useCallback(
    (e: React.PointerEvent<HTMLDivElement>) => {
      if (!isFocused || !cardRef.current) return
      const rect = cardRef.current.getBoundingClientRect()
      const px = (e.clientX - rect.left) / rect.width - 0.5
      const py = (e.clientY - rect.top) / rect.height - 0.5
      setTilt({ x: px * 10, y: -py * 7 })
    },
    [isFocused]
  )

  const handleCardPointerLeave = useCallback(() => {
    setTilt({ x: 0, y: 0 })
  }, [])

  const cardMotionStyle = useMemo(() => {
    if (!showCard || !milestone) return undefined
    const enterLift = (1 - blend) * 32
    const enterTilt = (1 - blend) * 14
    const depth = -70 + blend * 95
    const scale = 0.86 + blend * 0.14
    return {
      opacity: blend,
      filter: `blur(${(1 - blend) * 4}px)`,
      transform: [
        `rotateX(${tilt.y + enterTilt}deg)`,
        `rotateY(${tilt.x}deg)`,
        `translateY(${enterLift}px)`,
        `translateZ(${depth}px)`,
        `scale(${scale})`,
      ].join(' '),
      '--mc-blend': blend,
      '--mc-glow': milestone.objectColor,
    } as React.CSSProperties
  }, [showCard, milestone, blend, tilt])

  return (
    <>
      {/* ── Main milestone card (3D scene) ── */}
      <div className="milestone-scene" aria-hidden={!showCard}>
        <div
          ref={cardRef}
          className={[
            'milestone-card',
            showCard ? 'is-visible' : '',
            isFocused ? 'is-focused' : '',
          ]
            .filter(Boolean)
            .join(' ')}
          style={cardMotionStyle}
          onPointerMove={handleCardPointerMove}
          onPointerLeave={handleCardPointerLeave}
          aria-hidden={!showCard}
        >
        {showCard && milestone ? (
          <div key={milestone.id} className="milestone-card__inner">
            <div
              className="mc-icon-strip mc-anim"
              style={{ '--mc-color': milestone.objectColor } as React.CSSProperties}
            >
              <span className="mc-icon" aria-hidden>{milestone.icon}</span>
              <p className="mc-eyebrow">{milestone.eyebrow}</p>
            </div>

            <h2 className="mc-title mc-anim">
              {milestone.title}
              {milestone.titleAccent && (
                <span className="mc-accent">{milestone.titleAccent}</span>
              )}
            </h2>
            <p className="mc-sub mc-anim">{milestone.sub}</p>
            <p className="mc-body mc-anim">{milestone.body}</p>

            {milestone.stat && (
              <div className="mc-stat mc-anim">
                <span
                  className="mc-stat__value"
                  style={{ color: milestone.objectColor }}
                >
                  {milestone.stat}
                </span>
                {milestone.statLabel && (
                  <span className="mc-stat__label">{milestone.statLabel}</span>
                )}
              </div>
            )}

            <div className="mc-services mc-anim">
              {milestone.services.map((s) => (
                <span
                  key={s}
                  className="mc-chip"
                  style={{ '--chip-color': milestone.objectColor } as React.CSSProperties}
                >
                  {s}
                </span>
              ))}
            </div>

            <div className="mc-actions mc-anim">
              <a
                href="mailto:hello@vnnovate.ai"
                className="mc-btn mc-btn--contact"
                style={{ '--mc-color': milestone.objectColor } as React.CSSProperties}
              >
                <svg width="13" height="13" viewBox="0 0 13 13" fill="none" aria-hidden>
                  <rect x="1" y="3" width="11" height="8" rx="1.5" stroke="currentColor" strokeWidth="1.4"/>
                  <path d="M1 4l5.5 4L12 4" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/>
                </svg>
                {milestone.contactCta}
              </a>
              {milestone.caseStudyHref && (
                <a
                  href={milestone.caseStudyHref}
                  className="mc-btn mc-btn--ghost"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Case study ↗
                </a>
              )}
              <button
                type="button"
                className="mc-btn mc-btn--fly"
                onClick={handleFlyNext}
              >
                <span>Fly on</span>
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden>
                  <path
                    d="M2 7h10M8 3l4 4-4 4"
                    stroke="currentColor"
                    strokeWidth="1.6"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </button>
            </div>
          </div>
        ) : null}
        </div>
      </div>

      {/* ── Fold fly ghost ── */}
      {flyGhost && (
        <div
          className="milestone-fly"
          style={
            {
              /* Ghost is pinned at FROM position and only moves via transform */
              left: `${flyGhost.from.left}px`,
              top: `${flyGhost.from.top}px`,
              width: `${flyGhost.from.width}px`,
              height: `${flyGhost.from.height}px`,
              '--tx': `${flyGhost.tx}px`,
              '--ty': `${flyGhost.ty}px`,
              '--sx': flyGhost.sx,
              '--sy': flyGhost.sy,
              '--o0': flyGhost.o0,
              '--dot-color': flyGhost.milestone.objectColor,
            } as React.CSSProperties
          }
          data-phase={flyGhost.phase}
        >
          <div className="milestone-fly__inner">
            <span className="milestone-fly__icon" aria-hidden>
              {flyGhost.milestone.icon}
            </span>
            <span className="milestone-fly__text">
              <span className="milestone-fly__eyebrow">{flyGhost.milestone.eyebrow}</span>
              <span className="milestone-fly__title">
                {flyGhost.milestone.title}
                {flyGhost.milestone.titleAccent}
              </span>
            </span>
          </div>
        </div>
      )}

      {/* ── Sidebar history ── */}
      {passed.length > 0 && (
        <div
          className="mh-rail"
          style={{ '--mh-cols': columnCount } as React.CSSProperties}
          aria-label="Visited milestones"
        >
          <p className="mh-heading">Journey so far</p>
          <ul className="mh-list">
            {passed.map((m, i) => {
              if (hiddenIds.has(m.id)) return null
              return (
                <li key={m.id}>
                  <button
                    type="button"
                    className={[
                      'mh-item mh-item--landed',
                      i === passed.length - 1 ? 'mh-item--latest' : '',
                    ]
                      .filter(Boolean)
                      .join(' ')}
                    onClick={() => handleSidebarFly(m.progress)}
                    title={`Fly back to: ${m.title}${m.titleAccent ?? ''}`}
                    style={
                      {
                        '--dot-color': m.objectColor,
                        '--land-delay': `${(i % 8) * 0.04}s`,
                      } as React.CSSProperties
                    }
                  >
                    <span className="mh-dot" />
                    <span className="mh-label">
                      <span className="mh-eyebrow">{m.eyebrow}</span>
                      <span className="mh-title">
                        {m.title}
                        {m.titleAccent && (
                          <span style={{ color: m.objectColor }}>
                            {m.titleAccent}
                          </span>
                        )}
                      </span>
                    </span>
                  </button>
                </li>
              )
            })}
          </ul>
        </div>
      )}
    </>
  )
}
