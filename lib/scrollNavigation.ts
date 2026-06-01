import { getLandingScrollHeightVh } from './viewport'

let flyRaf = 0

/** Cinematic eased scroll — cubic ease-in-out over `duration` ms. */
export function cinematicScrollTo(targetY: number, duration = 2800) {
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

export function scrollProgressToPixels(progress: number): number {
  const totalPx = (getLandingScrollHeightVh() / 100) * window.innerHeight
  return progress * totalPx
}

export function scrollToProgress(progress: number, fast: boolean) {
  const targetY = scrollProgressToPixels(progress)
  if (fast) {
    window.scrollTo({ top: targetY, behavior: 'smooth' })
  } else {
    cinematicScrollTo(targetY)
  }
}
