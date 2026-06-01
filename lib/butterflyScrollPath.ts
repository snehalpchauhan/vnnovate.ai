import * as THREE from 'three'

/** Scroll height for the butterfly landing (matches CSS) — scales with milestone count */
export const LANDING_SCROLL_HEIGHT_VH = 5600

const PATH_ORIGIN = new THREE.Vector3(-8.5, 4.35, 3.2)
/** World-space stretch — longer arc between milestone stops */
const PATH_STRETCH = 1.62

const PATH_END = new THREE.Vector3(14.0, 10.65, -5.4)

/** Full left↔right sweeps along the journey (higher = more S-curves). */
const SERPENTINE_WAVES = 2.85
/** Lateral swing in world X (left / right of the overall drift). */
const SERPENTINE_X_AMPLITUDE = 5.25
/** Gentle depth weave so the path isn’t flat in XZ only. */
const SERPENTINE_Z_AMPLITUDE = 1.35
const PATH_CONTROL_POINT_COUNT = 28

/**
 * Serpentine control points: overall drift start→end with sinusoidal
 * left/right (X) and depth (Z) offsets. Envelope fades at ends so intro/finale stay stable.
 */
function buildSerpentineControlPoints(): THREE.Vector3[] {
  const points: THREE.Vector3[] = []
  const count = PATH_CONTROL_POINT_COUNT

  for (let i = 0; i < count; i++) {
    const t = i / (count - 1)
    const p = PATH_ORIGIN.clone().lerp(PATH_END, t)

    const envelope = Math.sin(t * Math.PI)
    const phase = t * Math.PI * 2 * SERPENTINE_WAVES

    p.x += Math.sin(phase) * SERPENTINE_X_AMPLITUDE * envelope
    p.z += Math.cos(phase + Math.PI * 0.3) * SERPENTINE_Z_AMPLITUDE * envelope

    points.push(p)
  }

  return points
}

const RAW_PATH_POINTS = buildSerpentineControlPoints()

const PATH_POINTS = RAW_PATH_POINTS.map((p, i) => {
  if (i === 0) return p.clone()
  return PATH_ORIGIN.clone().add(p.clone().sub(PATH_ORIGIN).multiplyScalar(PATH_STRETCH))
})

export const BUTTERFLY_PATH_START = PATH_POINTS[0]
export const BUTTERFLY_PATH_END = PATH_POINTS[PATH_POINTS.length - 1]

const PATH = new THREE.CatmullRomCurve3(
  [...PATH_POINTS],
  false,
  'centripetal',
  0.5
)

export function getButterflyFlightCurve(): THREE.CatmullRomCurve3 {
  return PATH
}

export function getButterflyPathWaypoints(): readonly THREE.Vector3[] {
  return PATH_POINTS
}

const tangent = new THREE.Vector3()

export function getButterflyPositionAtProgress(
  progress: number,
  _wobbleT = 0
): THREE.Vector3 {
  const p = Math.max(0, Math.min(1, progress))
  return PATH.getPointAt(p)
}

export function getButterflyTangentAtProgress(progress: number): THREE.Vector3 {
  const p = Math.max(0, Math.min(1, progress))
  PATH.getTangentAt(p, tangent)
  return tangent.normalize()
}

export function getButterflyHeadingAtProgress(progress: number): number {
  const tan = getButterflyTangentAtProgress(progress)
  return Math.atan2(tan.x, tan.z)
}
