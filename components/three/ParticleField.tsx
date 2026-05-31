'use client'

import { useRef, useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { getScrollSnapshot } from '@/lib/scrollStore'
import { getHeroBlend } from '@/lib/butterflyFlight'
import { WORLD_LENGTH } from '@/lib/world'

interface Props {
  count?: number
  color: string
}

export default function ParticleField({ count = 1000, color }: Props) {
  const mesh = useRef<THREE.Points>(null)
  const colorObj = useMemo(() => new THREE.Color(color), [color])

  const positions = useMemo(() => {
    const pos = new Float32Array(count * 3)
    for (let i = 0; i < count; i++) {
      pos[i * 3] = (Math.random() - 0.5) * 24
      pos[i * 3 + 1] = (Math.random() - 0.5) * 14
      pos[i * 3 + 2] = -Math.random() * WORLD_LENGTH
    }
    return pos
  }, [count])

  const baseZ = useRef<Float32Array | null>(null)
  const speeds = useRef<Float32Array | null>(null)

  if (!baseZ.current || baseZ.current.length !== count) {
    baseZ.current = new Float32Array(count)
    speeds.current = new Float32Array(count)
    for (let i = 0; i < count; i++) {
      baseZ.current[i] = positions[i * 3 + 2]
      speeds.current[i] = 0.3 + Math.random() * 1.2
    }
  }

  const geometry = useMemo(() => {
    const geo = new THREE.BufferGeometry()
    geo.setAttribute('position', new THREE.BufferAttribute(positions, 3))
    return geo
  }, [positions])

  const material = useMemo(
    () =>
      new THREE.PointsMaterial({
        size: 0.1,
        color: colorObj,
        transparent: true,
        opacity: 0.75,
        sizeAttenuation: true,
        depthWrite: false,
      }),
    [colorObj]
  )

  useFrame(({ clock }) => {
    if (!mesh.current) return
    const { progress, velocity, warpIntensity, distance } = getScrollSnapshot()
    const journeyBlend = 1 - getHeroBlend(progress)
    const t = clock.getElapsedTime()
    const pos = mesh.current.geometry.attributes.position.array as Float32Array
    const stretch = 1 + velocity * 4 + warpIntensity * 6
    const streamBoost = 0.15 + velocity * 0.08 + warpIntensity * 0.4

    const zBuf = baseZ.current!
    const spdBuf = speeds.current!

    for (let i = 0; i < count; i++) {
      const ox = positions[i * 3]
      const oy = positions[i * 3 + 1]
      const s = spdBuf[i]

      zBuf[i] += streamBoost * s
      if (zBuf[i] > 12) zBuf[i] -= WORLD_LENGTH

      const oz = zBuf[i]
      const parallax = 0.3 + (Math.abs(oz) / WORLD_LENGTH) * 0.7
      pos[i * 3] = ox + Math.sin(t * s * 0.3 + i) * 0.25
      pos[i * 3 + 1] = oy + Math.cos(t * s * 0.2 + i) * 0.2
      pos[i * 3 + 2] = oz + Math.sin(t * s * 0.1 + i) * stretch * 0.15 * parallax
    }

    mesh.current.geometry.attributes.position.needsUpdate = true
    material.color.set(color)
    material.opacity =
      journeyBlend * (0.45 + velocity * 0.08 + warpIntensity * 0.25)
    material.size = 0.08 + warpIntensity * 0.06

    mesh.current.position.z = distance * 0.02
    mesh.current.visible = journeyBlend > 0.02
  })

  return <points ref={mesh} geometry={geometry} material={material} />
}
