/** Desktop chase — aerial view from above/side. */
export const CHASE_CAMERA = {
  distance: 2.9,
  side: 1.1,
  height: 1.55,
  lookAhead: 1.0,
  lookDrop: -0.35,
} as const

/** Mobile chase — behind the butterfly, butterfly reads bottom-center. */
export const MOBILE_CHASE_CAMERA = {
  distance: 2.35,
  side: 0.12,
  height: 0.72,
  lookAhead: 0.55,
  lookDrop: 0.08,
} as const
