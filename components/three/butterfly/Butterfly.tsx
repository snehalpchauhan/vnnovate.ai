'use client'

import { useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { getScrollSnapshot } from '@/lib/scrollStore'
import {
  getButterflyFlightT,
  getButterflyPosition,
  getButterflyRotation,
  getHeroBlend,
} from '@/lib/butterflyFlight'
import {
  createLowerWingShape,
  createUpperWingShape,
  wingGeometry,
} from './createWingShape'

function WingPair({
  side,
  upperGeo,
  lowerGeo,
  wingMat,
}: {
  side: 1 | -1
  upperGeo: THREE.ShapeGeometry
  lowerGeo: THREE.ShapeGeometry
  wingMat: THREE.MeshPhysicalMaterial
}) {
  const upperRef = useRef<THREE.Mesh>(null)
  const lowerRef = useRef<THREE.Mesh>(null)

  useFrame(({ clock }) => {
    const flap = Math.sin(clock.getElapsedTime() * 10) * 0.55
    const flapLower = Math.sin(clock.getElapsedTime() * 10 + 0.4) * 0.4
    if (upperRef.current) upperRef.current.rotation.y = side * flap
    if (lowerRef.current) lowerRef.current.rotation.y = side * flapLower
  })

  return (
    <group scale={[side, 1, 1]}>
      <mesh
        ref={upperRef}
        geometry={upperGeo}
        material={wingMat}
        position={[0.08, 0.12, 0]}
        rotation={[0, 0.15, 0]}
      />
      <mesh
        ref={lowerRef}
        geometry={lowerGeo}
        material={wingMat}
        position={[0.06, -0.08, 0.02]}
        rotation={[0, 0.35, -0.1]}
      />
    </group>
  )
}

export default function Butterfly() {
  const groupRef = useRef<THREE.Group>(null)
  const pos = useMemo(() => new THREE.Vector3(), [])
  const euler = useMemo(() => new THREE.Euler(), [])
  const upperGeo = useMemo(() => wingGeometry(createUpperWingShape()), [])
  const lowerGeo = useMemo(() => wingGeometry(createLowerWingShape()), [])

  const wingMat = useMemo(
    () =>
      new THREE.MeshPhysicalMaterial({
        color: new THREE.Color('#6366F1'),
        emissive: new THREE.Color('#818CF8'),
        emissiveIntensity: 0.2,
        metalness: 0.12,
        roughness: 0.18,
        transmission: 0.4,
        thickness: 0.6,
        ior: 1.45,
        iridescence: 1,
        iridescenceIOR: 1.3,
        iridescenceThicknessRange: [100, 450],
        side: THREE.DoubleSide,
        transparent: true,
        opacity: 0.94,
      }),
    []
  )

  const bodyMat = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        color: '#0F172A',
        roughness: 0.45,
        metalness: 0.08,
      }),
    []
  )

  useFrame(({ clock }) => {
    if (!groupRef.current) return
    const { progress } = getScrollSnapshot()
    const heroBlend = getHeroBlend(progress)

    getButterflyPosition(progress, clock.getElapsedTime(), pos)
    getButterflyRotation(progress, clock.getElapsedTime(), euler)

    groupRef.current.position.copy(pos)
    groupRef.current.rotation.copy(euler)
    groupRef.current.visible = heroBlend > 0.02

    const t = getButterflyFlightT(progress, clock.getElapsedTime())
    groupRef.current.scale.setScalar(0.58 + t * 0.12)

    wingMat.opacity = 0.94 * heroBlend
  })

  return (
    <group ref={groupRef}>
      <mesh material={bodyMat} rotation={[Math.PI / 2, 0, 0]}>
        <capsuleGeometry args={[0.07, 0.38, 6, 12]} />
      </mesh>
      <mesh material={bodyMat} position={[0.2, 0, 0.05]}>
        <sphereGeometry args={[0.095, 14, 14]} />
      </mesh>

      <mesh position={[0.24, 0.07, 0.09]} rotation={[0.35, 0.1, 0.25]}>
        <cylinderGeometry args={[0.007, 0.003, 0.22, 6]} />
        <meshStandardMaterial color="#0F172A" />
      </mesh>
      <mesh position={[0.24, 0.07, 0.01]} rotation={[-0.35, -0.1, -0.25]}>
        <cylinderGeometry args={[0.007, 0.003, 0.22, 6]} />
        <meshStandardMaterial color="#0F172A" />
      </mesh>

      <WingPair side={1} upperGeo={upperGeo} lowerGeo={lowerGeo} wingMat={wingMat} />
      <WingPair side={-1} upperGeo={upperGeo} lowerGeo={lowerGeo} wingMat={wingMat} />

      <pointLight intensity={0.6} color="#06B6D4" distance={4} decay={2} />
    </group>
  )
}
