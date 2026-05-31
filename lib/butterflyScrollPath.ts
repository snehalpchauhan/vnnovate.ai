import * as THREE from 'three'

/** Scroll height for the butterfly landing (matches CSS) — scales with milestone count */
export const LANDING_SCROLL_HEIGHT_VH = 5600

const PATH_ORIGIN = new THREE.Vector3(-8.5, 4.35, 3.2)
/** World-space stretch — longer arc between milestone stops */
const PATH_STRETCH = 1.62

const RAW_PATH_POINTS = [
  new THREE.Vector3(-8.5, 4.35, 3.2),
  new THREE.Vector3(-7.4, 4.85, 2.95),
  new THREE.Vector3(-6.3, 5.35, 2.7),
  new THREE.Vector3(-5.2, 5.85, 2.45),
  new THREE.Vector3(-4.0, 6.35, 2.15),
  new THREE.Vector3(-2.6, 6.85, 1.8),
  new THREE.Vector3(-1.0, 7.3, 1.4),
  new THREE.Vector3(0.6, 7.75, 0.95),
  new THREE.Vector3(2.2, 8.15, 0.5),
  new THREE.Vector3(3.8, 8.5, 0.05),
  new THREE.Vector3(5.4, 8.85, -0.45),
  new THREE.Vector3(6.9, 9.15, -0.95),
  new THREE.Vector3(8.3, 9.45, -1.45),
  new THREE.Vector3(9.6, 9.7, -2.0),
  new THREE.Vector3(10.7, 9.95, -2.6),
  new THREE.Vector3(11.6, 10.15, -3.2),
  new THREE.Vector3(12.4, 10.35, -3.9),
  new THREE.Vector3(13.2, 10.5, -4.6),
  new THREE.Vector3(14.0, 10.65, -5.4),
] as const

const PATH_POINTS = RAW_PATH_POINTS.map((p, i) => {
  if (i === 0) return p.clone()
  return PATH_ORIGIN.clone().add(p.clone().sub(PATH_ORIGIN).multiplyScalar(PATH_STRETCH))
})

export const BUTTERFLY_PATH_START = PATH_POINTS[0]
export const BUTTERFLY_PATH_END = PATH_POINTS[PATH_POINTS.length - 1]

const PATH = new THREE.CatmullRomCurve3([...PATH_POINTS])

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
