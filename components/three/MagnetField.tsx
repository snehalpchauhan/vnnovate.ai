'use client'

import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'

interface Props {
  active: boolean
  color: string
}

export default function MagnetField({ active, color }: Props) {
  const ref = useRef<THREE.Mesh>(null)
  const ringRef = useRef<THREE.Mesh>(null)
  const groupRef = useRef<THREE.Group>(null)

  useFrame(({ clock }) => {
    if (!ref.current || !ringRef.current || !groupRef.current) return
    const t = clock.getElapsedTime()
    const scale = active ? 1 + Math.sin(t * 2) * 0.08 : 0
    ref.current.scale.setScalar(scale)
    ringRef.current.scale.setScalar(scale * 1.6)
    ringRef.current.rotation.z = t * 0.5
    groupRef.current.visible = active || scale > 0.01
  })

  return (
    <group ref={groupRef} position={[0, 0, 0]}>
      <mesh ref={ref}>
        <sphereGeometry args={[0.35, 32, 32]} />
        <meshStandardMaterial
          color={color}
          emissive={color}
          emissiveIntensity={2}
          transparent
          opacity={0.9}
        />
      </mesh>
      <mesh ref={ringRef} rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[1.2, 0.025, 8, 64]} />
        <meshStandardMaterial
          color={color}
          emissive={color}
          emissiveIntensity={1}
          transparent
          opacity={0.45}
        />
      </mesh>
    </group>
  )
}
