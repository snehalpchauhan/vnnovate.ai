'use client'

import { useRef, useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { getScrollSnapshot } from '@/lib/scrollStore'
import { getHeroBlend } from '@/lib/butterflyFlight'
import { WORLD_LENGTH } from '@/lib/world'

interface Props {
  color: string
  count?: number
}

export default function StreamLines({ color, count = 24 }: Props) {
  const groupRef = useRef<THREE.Group>(null)

  const lines = useMemo(() => {
    return Array.from({ length: count }, (_, i) => {
      const points: THREE.Vector3[] = []
      const x = (Math.random() - 0.5) * 14
      const y = (Math.random() - 0.5) * 8
      const zStart = -Math.random() * WORLD_LENGTH
      for (let j = 0; j < 24; j++) {
        points.push(
          new THREE.Vector3(
            x + (Math.random() - 0.5) * 0.15,
            y + (Math.random() - 0.5) * 0.15,
            zStart - j * 2.5
          )
        )
      }
      const curve = new THREE.CatmullRomCurve3(points)
      const pts = curve.getPoints(48)
      const geo = new THREE.BufferGeometry().setFromPoints(pts)
      return { geo, speed: 0.2 + Math.random() * 0.6, offset: Math.random() * Math.PI * 2, zStart }
    })
  }, [count])

  useFrame(({ clock }) => {
    if (!groupRef.current) return
    const { progress, velocity, warpIntensity } = getScrollSnapshot()
    const journeyBlend = 1 - getHeroBlend(progress)
    groupRef.current.visible = journeyBlend > 0.02
    const t = clock.getElapsedTime()

    groupRef.current.children.forEach((child, i) => {
      const line = lines[i]
      if (!line) return
      const mat = (child as THREE.Line).material as THREE.LineBasicMaterial
      mat.opacity =
        journeyBlend *
        (0.04 + velocity * 0.12 + warpIntensity * 0.2) *
        (0.5 + Math.sin(t * line.speed + line.offset) * 0.5)
    })
  })

  return (
    <group ref={groupRef}>
      {lines.map((l, i) => (
        // @ts-expect-error R3F extends JSX with Three.js primitives
        <line key={i} geometry={l.geo}>
          <lineBasicMaterial color={color} transparent opacity={0.1} />
        </line>
      ))}
    </group>
  )
}
