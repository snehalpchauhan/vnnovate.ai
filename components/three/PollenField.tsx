'use client'

import { useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { useIsMobile } from '@/lib/useMediaQuery'

export default function PollenField() {
  const pointsRef = useRef<THREE.Points>(null)
  const isMobile = useIsMobile()
  const count = isMobile ? 120 : 280

  const { geometry, material } = useMemo(() => {
    const COUNT = count
    const geo = new THREE.BufferGeometry()
    const pos = new Float32Array(COUNT * 3)
    const scales = new Float32Array(COUNT)

    for (let i = 0; i < COUNT; i++) {
      pos[i * 3] = (Math.random() - 0.5) * 120
      pos[i * 3 + 1] = Math.random() * 60 + 4
      pos[i * 3 + 2] = (Math.random() - 0.5) * 120
      scales[i] = 0.15 + Math.random() * 0.45
    }
    geo.setAttribute('position', new THREE.BufferAttribute(pos, 3))
    geo.setAttribute('scale', new THREE.BufferAttribute(scales, 1))

    const canvas = document.createElement('canvas')
    canvas.width = 32
    canvas.height = 32
    const ctx = canvas.getContext('2d')!
    const g = ctx.createRadialGradient(16, 16, 1, 16, 16, 15)
    g.addColorStop(0, 'rgba(255, 251, 235, 1)')
    g.addColorStop(0.35, 'rgba(199, 210, 254, 0.55)')
    g.addColorStop(1, 'rgba(199, 210, 254, 0)')
    ctx.fillStyle = g
    ctx.fillRect(0, 0, 32, 32)

    const mat = new THREE.PointsMaterial({
      size: 0.75,
      map: new THREE.CanvasTexture(canvas),
      transparent: true,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
      opacity: 0.85,
    })

    return { geometry: geo, material: mat }
  }, [count])

  useFrame((_, delta) => {
    if (!pointsRef.current) return
    const pos = pointsRef.current.geometry.attributes.position as THREE.BufferAttribute
    for (let i = 0; i < pos.count; i++) {
      let y = pos.getY(i)
      y -= delta * 1.2
      if (y < 2) y = 62
      pos.setY(i, y)
    }
    pos.needsUpdate = true
  })

  return <points ref={pointsRef} geometry={geometry} material={material} />
}
