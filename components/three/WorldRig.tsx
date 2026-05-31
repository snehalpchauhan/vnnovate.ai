'use client'

import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { getScrollSnapshot } from '@/lib/scrollStore'

interface Props {
  children: React.ReactNode
}

/**
 * Moves the entire 3D world along +Z as the user scrolls.
 * Camera stays near origin — content streams toward the viewer (journey feel).
 */
export default function WorldRig({ children }: Props) {
  const group = useRef<THREE.Group>(null)
  const smoothZ = useRef(0)

  useFrame(() => {
    if (!group.current) return
    const { distance, warpIntensity } = getScrollSnapshot()
    const targetZ = distance
    const lerp = 0.08 + warpIntensity * 0.25
    smoothZ.current += (targetZ - smoothZ.current) * lerp
    group.current.position.z = smoothZ.current
  })

  return <group ref={group}>{children}</group>
}
