import * as THREE from 'three'

/** Upper wing silhouette (right side; mirror for left) */
export function createUpperWingShape(): THREE.Shape {
  const s = new THREE.Shape()
  s.moveTo(0, 0)
  s.bezierCurveTo(0.15, 0.35, 0.55, 0.95, 1.35, 0.75)
  s.bezierCurveTo(1.85, 0.55, 2.05, 0.15, 1.55, -0.15)
  s.bezierCurveTo(1.05, -0.35, 0.45, -0.25, 0, 0)
  return s
}

export function createLowerWingShape(): THREE.Shape {
  const s = new THREE.Shape()
  s.moveTo(0, 0)
  s.bezierCurveTo(0.2, 0.1, 0.75, 0.35, 1.05, 0.05)
  s.bezierCurveTo(1.2, -0.2, 0.85, -0.45, 0.35, -0.35)
  s.bezierCurveTo(0.1, -0.28, 0, -0.12, 0, 0)
  return s
}

export function wingGeometry(shape: THREE.Shape): THREE.ShapeGeometry {
  return new THREE.ShapeGeometry(shape, 20)
}
