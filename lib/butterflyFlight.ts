import * as THREE from 'three'

export const HERO_SCROLL_END = 0.12

const flightCurve = new THREE.CatmullRomCurve3([
  new THREE.Vector3(-7, 1.5, -4),
  new THREE.Vector3(-3, 3.8, -7),
  new THREE.Vector3(2, 3.2, -10),
  new THREE.Vector3(6, 2, -13),
  new THREE.Vector3(4, 1, -16),
])

const tangent = new THREE.Vector3()

/** Hero scroll progress (0–1 within hero) + idle time for gentle hover */
export function getButterflyFlightT(scrollProgress: number, elapsed: number): number {
  const scrollT = Math.min(scrollProgress / HERO_SCROLL_END, 1)
  const idle = Math.sin(elapsed * 0.35) * 0.04
  return THREE.MathUtils.clamp(scrollT * 0.85 + idle + 0.08, 0, 1)
}

export function getButterflyPosition(
  scrollProgress: number,
  elapsed: number,
  target: THREE.Vector3
): THREE.Vector3 {
  const t = getButterflyFlightT(scrollProgress, elapsed)
  return flightCurve.getPoint(t, target)
}

export function getButterflyRotation(
  scrollProgress: number,
  elapsed: number,
  target: THREE.Euler
): THREE.Euler {
  const t = getButterflyFlightT(scrollProgress, elapsed)
  flightCurve.getTangentAt(t, tangent)
  const yaw = Math.atan2(tangent.x, -tangent.z)
  const pitch = Math.atan2(tangent.y, Math.sqrt(tangent.x * tangent.x + tangent.z * tangent.z))
  target.set(pitch * 0.35, yaw, Math.sin(elapsed * 2) * 0.08)
  return target
}

/** 1 = full hero sky/butterfly, 0 = journey mode */
export function getHeroBlend(scrollProgress: number): number {
  if (scrollProgress <= 0.08) return 1
  if (scrollProgress >= 0.14) return 0
  return 1 - (scrollProgress - 0.08) / 0.06
}
