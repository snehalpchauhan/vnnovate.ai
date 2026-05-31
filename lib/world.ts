/** Total scrollable world depth (world units). */
export const WORLD_LENGTH = 400

/** Matches globals.css .scroll-container height */
export const SCROLL_HEIGHT_VH = 700

/** Hero ends, warp runs, then main journey */
export const SCROLL_WARP = { start: 0.12, end: 0.15 } as const

/**
 * Maps normalized scroll progress (0–1) to world distance.
 * Warp zone (12–15%) covers a disproportionate slice of Z for hyperspace feel.
 */
export function progressToDistance(progress: number): number {
  const p = Math.max(0, Math.min(1, progress))
  const { start: warpStart, end: warpEnd } = SCROLL_WARP

  const HERO_DIST = 35
  const WARP_DIST = 85
  const JOURNEY_DIST = WORLD_LENGTH - HERO_DIST - WARP_DIST

  if (p <= warpStart) {
    return (p / warpStart) * HERO_DIST
  }
  if (p <= warpEnd) {
    const t = (p - warpStart) / (warpEnd - warpStart)
    const eased = t * t // power2.in
    return HERO_DIST + eased * WARP_DIST
  }

  const t = (p - warpEnd) / (1 - warpEnd)
  return HERO_DIST + WARP_DIST + t * JOURNEY_DIST
}

/** 0–1 intensity during entry warp */
export function getWarpIntensity(progress: number): number {
  const { start, end } = SCROLL_WARP
  if (progress < start || progress > end) return 0
  return (progress - start) / (end - start)
}

/** World-space Z anchors for chapter content (local coords inside WorldRig) */
export const CHAPTER_WORLD_Z: Record<string, { center: number; span: number }> = {
  hero: { center: -20, span: 40 },
  warp: { center: -75, span: 30 },
  logistics: { center: -130, span: 55 },
  morph_support: { center: -175, span: 25 },
  support: { center: -210, span: 55 },
  morph_sales: { center: -255, span: 25 },
  sales: { center: -290, span: 55 },
  morph_ops: { center: -335, span: 25 },
  ops: { center: -370, span: 55 },
  finale: { center: -395, span: 30 },
}

export function getChapterZoneAtDistance(distance: number): string | null {
  for (const [key, zone] of Object.entries(CHAPTER_WORLD_Z)) {
    const half = zone.span / 2
    if (distance >= -zone.center - half && distance <= -zone.center + half) {
      return key
    }
  }
  return null
}

/** Camera Z — mostly fixed; world moves toward viewer */
export const CAMERA_BASE_Z = 8
