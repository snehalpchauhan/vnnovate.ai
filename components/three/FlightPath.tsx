'use client'

import { useEffect, useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { getButterflyFlightCurve } from '@/lib/butterflyScrollPath'
import { sampleDottedPathPoints } from '@/lib/dottedPathDots'
import { getMilestoneState } from '@/lib/pathMilestones'
import { getScrollSnapshot } from '@/lib/scrollStore'

const DOT_RADIUS = 0.045
const DASH_OPTS = { dashLength: 0.1, gapLength: 0.22, tStep: 0.0012 }

const COLOR_AHEAD = '#FDE68A'
const COLOR_TRaveled = '#FACC15'
const BASE_AHEAD_OPACITY = 0.52
const BASE_TRAVELED_OPACITY = 0.95
const MILESTONE_FADE = 0.18

export default function FlightPath() {
  const curve = useMemo(() => getButterflyFlightCurve(), [])
  const fullDots = useMemo(
    () => sampleDottedPathPoints(curve, 1, DASH_OPTS),
    [curve]
  )

  const aheadRef = useRef<THREE.InstancedMesh>(null)
  const traveledRef = useRef<THREE.InstancedMesh>(null)
  const aheadMat = useRef<THREE.MeshBasicMaterial>(null)
  const traveledMat = useRef<THREE.MeshBasicMaterial>(null)

  const lastProgress = useRef(-1)
  const dummy = useMemo(() => new THREE.Object3D(), [])
  const dotGeo = useMemo(() => new THREE.SphereGeometry(DOT_RADIUS, 6, 6), [])

  const applyDots = (mesh: THREE.InstancedMesh, dots: THREE.Vector3[]) => {
    dots.forEach((p, i) => {
      dummy.position.copy(p)
      dummy.updateMatrix()
      mesh.setMatrixAt(i, dummy.matrix)
    })
    mesh.count = dots.length
    mesh.instanceMatrix.needsUpdate = true
  }

  useEffect(() => {
    if (aheadRef.current) applyDots(aheadRef.current, fullDots)
    if (traveledRef.current)
      applyDots(traveledRef.current, sampleDottedPathPoints(curve, 0, DASH_OPTS))
    return () => dotGeo.dispose()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [curve, fullDots])

  useFrame(() => {
    const { progress } = getScrollSnapshot()
    const { blend: milestoneBlend } = getMilestoneState(progress)

    const fade = 1 - milestoneBlend * (1 - MILESTONE_FADE)
    if (aheadMat.current) aheadMat.current.opacity = BASE_AHEAD_OPACITY * fade
    if (traveledMat.current) traveledMat.current.opacity = BASE_TRAVELED_OPACITY * fade

    if (Math.abs(progress - lastProgress.current) >= 0.004) {
      lastProgress.current = progress
      if (traveledRef.current) {
        applyDots(
          traveledRef.current,
          sampleDottedPathPoints(curve, progress, DASH_OPTS)
        )
      }
    }
  })

  return (
    <group>
      {/* Full curved route ahead — always visible */}
      <instancedMesh
        ref={aheadRef}
        args={[dotGeo, undefined, fullDots.length]}
        frustumCulled={false}
        renderOrder={2}
      >
        <meshBasicMaterial
          ref={aheadMat}
          color={COLOR_AHEAD}
          transparent
          opacity={BASE_AHEAD_OPACITY}
          toneMapped={false}
          depthWrite={false}
        />
      </instancedMesh>

      {/* Bright dots up to current scroll position */}
      <instancedMesh
        ref={traveledRef}
        args={[dotGeo, undefined, fullDots.length]}
        frustumCulled={false}
        renderOrder={3}
      >
        <meshBasicMaterial
          ref={traveledMat}
          color={COLOR_TRaveled}
          transparent
          opacity={BASE_TRAVELED_OPACITY}
          toneMapped={false}
        />
      </instancedMesh>
    </group>
  )
}
