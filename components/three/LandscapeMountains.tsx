'use client'

import { useMemo } from 'react'
import { useGLTF } from '@react-three/drei'
import * as THREE from 'three'
import { getButterflyFlightCurve } from '@/lib/butterflyScrollPath'
import {
  extractMeshesByKind,
  normalizeLandscapeGroup,
} from '@/lib/landscapePack'

const TREE_PACK_PATH = '/models/low_poly_tree_pack.glb'

const MOUNTAIN_SLOTS = [
  { t: 0.08, x: -4, z: -2, scale: 22, rot: 0.1 },
  { t: 0.28, x: 3, z: -6, scale: 26, rot: -0.35 },
  { t: 0.52, x: -2, z: -10, scale: 24, rot: 0.45 },
  { t: 0.74, x: 5, z: -14, scale: 28, rot: -0.2 },
  { t: 0.9, x: 0, z: -18, scale: 25, rot: 0.05 },
] as const

export default function LandscapeMountains() {
  const { scene } = useGLTF(TREE_PACK_PATH)
  const curve = useMemo(() => getButterflyFlightCurve(), [])

  const mountains = useMemo(() => {
    const base = extractMeshesByKind(scene, 'mountain')
    const group = new THREE.Group()

    MOUNTAIN_SLOTS.forEach((slot, i) => {
      const pathPt = curve.getPointAt(slot.t)
      const chunk = base.clone(true)
      normalizeLandscapeGroup(
        chunk,
        slot.scale,
        new THREE.Vector3(
          pathPt.x * 0.55 + slot.x,
          -2.8,
          pathPt.z + slot.z
        ),
        slot.rot
      )
      chunk.traverse((o) => {
        o.renderOrder = -2
      })
      group.add(chunk)
    })

    return group
  }, [scene, curve])

  return <primitive object={mountains} />
}

useGLTF.preload(TREE_PACK_PATH)
