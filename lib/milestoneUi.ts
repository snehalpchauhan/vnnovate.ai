import { PATH_MILESTONES, type PathMilestone } from './pathMilestones'
import { isMobileViewport } from './viewport'

/** Milestones the user has already flown past. */
export function getPassedMilestones(progress: number): PathMilestone[] {
  return PATH_MILESTONES.filter((m) => progress > m.progress + m.span * 1.5)
}

/** Estimate sidebar slot position for fold animation (multi-column). */
export function getSidebarSlotRect(
  index: number,
  totalCount: number,
  itemHeight = 44,
  itemWidth = 168,
  columnGap = 10,
  railLeft = 22,
  railTopOffset = -12
): DOMRect {
  const columnCount = getSidebarColumnCount(totalCount)
  const itemsPerColumn = Math.ceil(totalCount / columnCount)
  const col = Math.floor(index / itemsPerColumn)
  const row = index % itemsPerColumn

  const listTop =
    window.innerHeight * 0.5 - (itemsPerColumn * itemHeight) / 2 + railTopOffset + 28
  const x = railLeft + col * (itemWidth + columnGap)
  const y = listTop + row * (itemHeight + 4)

  return new DOMRect(x, y, itemWidth, 38)
}

export function getSidebarColumnCount(passedCount: number): number {
  if (passedCount <= 8) return 1
  if (passedCount <= 16) return 2
  if (passedCount <= 24) return 3
  return 4
}

/** Fallback card rect when scroll is too fast to read live DOM dimensions. */
export function getDefaultMilestoneCardRect(): DOMRect {
  if (isMobileViewport()) {
    const width = Math.min(window.innerWidth * 0.94, 420)
    const height = Math.min(window.innerHeight * 0.46, 440)
    const left = (window.innerWidth - width) / 2
    const bottomInset = Math.max(100, window.innerHeight * 0.14)
    const top = window.innerHeight - height - bottomInset
    return new DOMRect(left, top, width, height)
  }

  const width = Math.min(window.innerWidth * 0.58, 640)
  const height = Math.min(window.innerHeight * 0.52, 520)
  const left = window.innerWidth - width - window.innerWidth * 0.04
  const top = window.innerHeight - height - window.innerHeight * 0.08
  return new DOMRect(left, top, width, height)
}

/** Pick the best source rect for the fold animation. */
export function resolveFoldFromRect(
  live: DOMRect | null | undefined,
  cached: DOMRect | undefined
): DOMRect {
  if (live && live.width > 40 && live.height > 40) return live
  if (cached && cached.width > 40 && cached.height > 40) return cached
  return getDefaultMilestoneCardRect()
}
