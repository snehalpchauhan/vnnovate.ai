import * as THREE from 'three'

const _prev = new THREE.Vector3()
const _pos = new THREE.Vector3()

export type DottedPathOptions = {
  /** Arc-length of each dot segment */
  dashLength?: number
  /** Arc-length of gap between dashes */
  gapLength?: number
  /** Curve parameter step (smaller = smoother sampling) */
  tStep?: number
}

/**
 * Places dot positions along a curve up to `endT` (0–1) using arc-length dashes.
 */
export function sampleDottedPathPoints(
  curve: THREE.CatmullRomCurve3,
  endT = 1,
  options: DottedPathOptions = {}
): THREE.Vector3[] {
  const dashLength = options.dashLength ?? 0.32
  const gapLength = options.gapLength ?? 0.28
  const tStep = options.tStep ?? 0.002
  const pattern = dashLength + gapLength

  const tEnd = Math.max(0, Math.min(1, endT))
  const dots: THREE.Vector3[] = []
  let arc = 0

  curve.getPointAt(0, _prev)

  for (let t = tStep; t <= tEnd + tStep * 0.5; t += tStep) {
    const clamped = Math.min(t, tEnd)
    curve.getPointAt(clamped, _pos)
    arc += _pos.distanceTo(_prev)
    _prev.copy(_pos)

    if ((arc % pattern) < dashLength) {
      dots.push(_pos.clone())
    }

    if (clamped >= tEnd) break
  }

  return dots
}

/** Dotted segment between two progress values (for trail-only path). */
export function sampleDottedPathSegment(
  curve: THREE.CatmullRomCurve3,
  startT: number,
  endT: number,
  options: DottedPathOptions = {}
): THREE.Vector3[] {
  const t0 = Math.max(0, Math.min(1, startT))
  const t1 = Math.max(t0, Math.min(1, endT))
  if (t1 - t0 < 0.002) return []

  const dashLength = options.dashLength ?? 0.32
  const gapLength = options.gapLength ?? 0.28
  const tStep = options.tStep ?? 0.002
  const pattern = dashLength + gapLength

  const dots: THREE.Vector3[] = []
  let arc = 0

  curve.getPointAt(t0, _prev)

  for (let t = t0 + tStep; t <= t1 + tStep * 0.5; t += tStep) {
    const clamped = Math.min(t, t1)
    curve.getPointAt(clamped, _pos)
    arc += _pos.distanceTo(_prev)
    _prev.copy(_pos)

    if ((arc % pattern) < dashLength) {
      dots.push(_pos.clone())
    }

    if (clamped >= t1) break
  }

  return dots
}
