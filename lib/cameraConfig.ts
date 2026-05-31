/** Shared chase / intro camera tuning — aerial view from above the butterfly. */
export const CHASE_CAMERA = {
  distance: 2.9,
  side: 1.1,
  /** How far above the butterfly the camera sits */
  height: 1.55,
  lookAhead: 1.0,
  /** Look slightly below the butterfly body for a downward tilt */
  lookDrop: -0.35,
} as const
