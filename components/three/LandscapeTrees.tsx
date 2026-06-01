'use client'

import { useMemo } from 'react'
import { useGLTF } from '@react-three/drei'
import * as THREE from 'three'
import { extractMeshesByKind, normalizeLandscapeGroup } from '@/lib/landscapePack'

const TREE_PACK_PATH = '/models/low_poly_tree_pack.glb'

export default function LandscapeTrees() {
  const { scene } = useGLTF(TREE_PACK_PATH)

  const forest = useMemo(() => {
    const root = extractMeshesByKind(scene, 'tree')
    normalizeLandscapeGroup(
      root,
      16,
      new THREE.Vector3(0, 2.4, -5),
      0.35
    )
    return root
  }, [scene])

  return <primitive object={forest} />
}

useGLTF.preload(TREE_PACK_PATH)
