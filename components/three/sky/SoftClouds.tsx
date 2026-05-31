'use client'

import { useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'

const CLOUDS = [
  { pos: [-14, 5, -32] as const, scale: [16, 3.5, 9] as const, speed: 0.06 },
  { pos: [12, 6.5, -40] as const, scale: [20, 4.5, 11] as const, speed: 0.05 },
  { pos: [2, 4, -26] as const, scale: [12, 3, 7] as const, speed: 0.08 },
  { pos: [-8, 7, -48] as const, scale: [24, 5.5, 13] as const, speed: 0.04 },
  { pos: [16, 3.5, -24] as const, scale: [10, 2.5, 6] as const, speed: 0.09 },
  { pos: [0, 8, -55] as const, scale: [28, 6, 14] as const, speed: 0.03 },
]

export default function SoftClouds() {
  const group = useRef<THREE.Group>(null)

  const material = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        color: '#ffffff',
        transparent: true,
        opacity: 0.58,
        roughness: 1,
        metalness: 0,
        depthWrite: false,
      }),
    []
  )

  useFrame(({ clock }) => {
    if (!group.current) return
    const t = clock.getElapsedTime()
    group.current.children.forEach((child, i) => {
      const cfg = CLOUDS[i]
      if (!cfg) return
      child.position.x = cfg.pos[0] + Math.sin(t * cfg.speed + i) * 0.5
      child.position.y = cfg.pos[1] + Math.cos(t * cfg.speed * 0.7 + i) * 0.2
    })
  })

  return (
    <group ref={group}>
      {CLOUDS.map((c, i) => (
        <mesh key={i} position={c.pos} scale={c.scale} material={material}>
          <sphereGeometry args={[1, 16, 12]} />
        </mesh>
      ))}
    </group>
  )
}
