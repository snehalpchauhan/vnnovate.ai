/** Shared breakpoints — keep in sync with CSS media queries. */
export const MOBILE_MAX_WIDTH = 768
export const MOBILE_MEDIA = `(max-width: ${MOBILE_MAX_WIDTH}px)` as const

export const LANDING_SCROLL_HEIGHT_VH_DESKTOP = 5600
export const LANDING_SCROLL_HEIGHT_VH_MOBILE = 4000

export function isMobileViewport(width = typeof window !== 'undefined' ? window.innerWidth : 1200): boolean {
  return width <= MOBILE_MAX_WIDTH
}

export function getLandingScrollHeightVh(width = typeof window !== 'undefined' ? window.innerWidth : 1200): number {
  return isMobileViewport(width)
    ? LANDING_SCROLL_HEIGHT_VH_MOBILE
    : LANDING_SCROLL_HEIGHT_VH_DESKTOP
}

export function hasFinePointer(): boolean {
  if (typeof window === 'undefined') return true
  return window.matchMedia('(pointer: fine)').matches
}
