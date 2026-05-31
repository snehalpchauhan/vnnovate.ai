'use client'

import { useMemo } from 'react'
import { useGLTF } from '@react-three/drei'
import * as THREE from 'three'

const TREE_PACK_PATH = '/models/low_poly_tree_pack.glb'

/** Fit the forest pack to our world scale and sit it under the flight path. */
function normalizeForest(root: THREE.Object3D) {
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
  const scale = 16 / maxDim
  root.scale.setScalar(scale)

  root.updateMatrixWorld(true)
  const grounded = new THREE.Box3().setFromObject(root)
  root.position.y -= grounded.min.y
  root.position.add(new THREE.Vector3(0, 2.4, -5))
  root.rotation.y = 0.35
}

export default function LandscapeTrees() {
  const { scene } = useGLTF(TREE_PACK_PATH)

  const forest = useMemo(() => {
    const root = scene.clone(true)
    normalizeForest(root)
    return root
  }, [scene])

  return <primitive object={forest} />
}

useGLTF.preload(TREE_PACK_PATH)
