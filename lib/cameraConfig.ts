/** Desktop chase — aerial view from above/side. */
export const CHASE_CAMERA = {
  distance: 2.9,
  side: 1.1,
  height: 1.55,
  lookAhead: 1.0,
  lookDrop: -0.35,
} as const

/**
 * Mobile chase — camera behind & above, looking down at the butterfly so it
 * sits in the lower third of the screen (just above the Fly button).
 */
export const MOBILE_CHASE_CAMERA = {
  distance: 2.05,
  side: 0,
  /** Camera above the butterfly (behind + elevated). */
  height: 1.95,
  lookAhead: 0.5,
  /** Small lift on look target — fine-tunes vertical screen position. */
  lookLift: 0.15,
} as const
