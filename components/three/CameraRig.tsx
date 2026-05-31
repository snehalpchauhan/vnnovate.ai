'use client'

import { useRef } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import * as THREE from 'three'
import { getScrollSnapshot } from '@/lib/scrollStore'
import { CAMERA_BASE_Z } from '@/lib/world'
import { getButterflyPosition, getHeroBlend } from '@/lib/butterflyFlight'

const butterflyPos = new THREE.Vector3()
const lookAt = new THREE.Vector3()

export default function CameraRig() {
  const { camera } = useThree()
  const smoothX = useRef(0)
  const smoothY = useRef(0)
  const smoothZ = useRef(CAMERA_BASE_Z)
  const smoothRotX = useRef(0)

  useFrame(({ clock }) => {
    const { progress, velocity, warpIntensity } = getScrollSnapshot()
    const heroBlend = getHeroBlend(progress)
    const elapsed = clock.getElapsedTime()

    if (heroBlend > 0.05) {
      getButterflyPosition(progress, elapsed, butterflyPos)
      const targetX = butterflyPos.x * 0.35
      const targetY = butterflyPos.y + 1.2
      const targetZ = CAMERA_BASE_Z + 2

      smoothX.current += (targetX - smoothX.current) * 0.04
      smoothY.current += (targetY - smoothY.current) * 0.04
      smoothZ.current += (targetZ - smoothZ.current) * 0.04

      camera.position.set(smoothX.current, smoothY.current, smoothZ.current)
      lookAt.copy(butterflyPos)
      camera.lookAt(lookAt)
      return
    }

    const sway = 0.4
    const targetX = Math.sin(progress * Math.PI * 2) * sway
    const targetY = Math.cos(progress * Math.PI * 1.5) * sway * 0.6

    smoothX.current += (targetX - smoothX.current) * 0.04
    smoothY.current += (targetY - smoothY.current) * 0.04
    smoothZ.current += (CAMERA_BASE_Z - smoothZ.current) * 0.06

    camera.position.set(smoothX.current, smoothY.current, smoothZ.current)

    const warpPitch = warpIntensity * 0.35 + velocity * 0.04
    const targetRotX = -warpPitch
    smoothRotX.current += (targetRotX - smoothRotX.current) * 0.12
    camera.rotation.x = smoothRotX.current
    camera.rotation.y = 0
    camera.rotation.z = 0
  })

  return null
}
