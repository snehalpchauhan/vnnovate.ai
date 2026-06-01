/** Desktop chase — aerial view from above/side. */
export const CHASE_CAMERA = {
  distance: 2.9,
  side: 1.1,
  height: 1.55,
  lookAhead: 1.0,
  lookDrop: -0.35,
} as const

/** Mobile chase — behind butterfly; composeLift pushes butterfly to bottom-center. */
export const MOBILE_CHASE_CAMERA = {
  distance: 2.55,
  side: 0.08,
  height: 0.52,
  lookAhead: 0.35,
  lookDrop: 0,
  /** Look target lifted above butterfly (world Y) — higher = butterfly lower on screen. */
  composeLift: 3.75,
} as const
