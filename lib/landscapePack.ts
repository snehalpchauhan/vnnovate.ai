import * as THREE from 'three'

/** Large wide meshes in the tree pack are mountain / hill backdrops. */
export function isMountainMesh(mesh: THREE.Mesh): boolean {
  const geom = mesh.geometry
  if (!geom.boundingBox) geom.computeBoundingBox()
  const bb = geom.boundingBox!
  if (!bb) return false

  const size = new THREE.Vector3()
  bb.getSize(size)
  const maxDim = Math.max(size.x, size.y, size.z)
  const vol = size.x * size.y * size.z
  const widthDepth = Math.max(size.x, size.z)

  if (maxDim > 520) return true
  if (vol > 4_500_000) return true
  if (widthDepth > 280 && size.y > 80 && size.y / widthDepth < 0.85) return true

  return false
}

export function extractMeshesByKind(
  source: THREE.Object3D,
  kind: 'mountain' | 'tree'
): THREE.Group {
  const root = new THREE.Group()
  source.updateMatrixWorld(true)

  source.traverse((obj) => {
    const mesh = obj as THREE.Mesh
    if (!mesh.isMesh) return
    const mountain = isMountainMesh(mesh)
    if (kind === 'mountain' ? !mountain : mountain) return

    const clone = mesh.clone()
    clone.material = mesh.material
    clone.applyMatrix4(mesh.matrixWorld)
    root.add(clone)
  })

  return root
}

/** Scale to world units, ground on Y=0, optional offset. */
export function normalizeLandscapeGroup(
  root: THREE.Object3D,
  targetSize: number,
  position: THREE.Vector3,
  rotationY = 0
) {
  root.traverse((o) => {
    const mesh = o as THREE.Mesh
    if (mesh.isMesh) {
      mesh.castShadow = true
      mesh.receiveShadow = true
    }
  })

  root.updateMatrixWorld(true)
  const box = new THREE.Box3().setFromObject(root)
  const center = new THREE.Vector3()
  const size = new THREE.Vector3()
  box.getCenter(center)
  box.getSize(size)

  root.position.sub(center)
  const maxDim = Math.max(size.x, size.y, size.z) || 1
  root.scale.setScalar(targetSize / maxDim)

  root.updateMatrixWorld(true)
  const grounded = new THREE.Box3().setFromObject(root)
  root.position.y -= grounded.min.y
  root.position.add(position)
  root.rotation.y = rotationY
}
