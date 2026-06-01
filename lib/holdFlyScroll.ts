import { scrollProgressToPixels } from './scrollNavigation'
import { setHoldFlying, unlockIntroCamera } from './scrollStore'

/** Scroll progress per second while Fly is held (full journey ~22s). */
const HOLD_PROGRESS_PER_SEC = 0.048

let holding = false
let holdRaf = 0

export function isHoldFlyActive(): boolean {
  return holding
}

export function startHoldFlyScroll() {
  if (holding) return
  if (typeof window === 'undefined') return

  const maxY = scrollProgressToPixels(1)
  if (window.scrollY >= maxY - 2) return

  holding = true
  setHoldFlying(true)
  unlockIntroCamera()

  let last = performance.now()

  const tick = (now: number) => {
    if (!holding) return

    const dt = Math.min(0.05, (now - last) / 1000)
    last = now

    const step = scrollProgressToPixels(HOLD_PROGRESS_PER_SEC * dt)
    const nextY = Math.min(maxY, window.scrollY + step)
    window.scrollTo(0, nextY)

    if (nextY >= maxY - 1) {
      stopHoldFlyScroll()
      return
    }

    holdRaf = requestAnimationFrame(tick)
  }

  holdRaf = requestAnimationFrame(tick)
}

export function stopHoldFlyScroll() {
  if (!holding) return
  holding = false
  setHoldFlying(false)
  cancelAnimationFrame(holdRaf)
  holdRaf = 0
}
