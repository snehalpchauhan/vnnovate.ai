'use client'

import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { RoundedBox, Torus, Octahedron, Cone } from '@react-three/drei'
import * as THREE from 'three'
import { getScrollSnapshot } from '@/lib/scrollStore'
import { CHAPTER_WORLD_Z } from '@/lib/world'
import MagnetField from './MagnetField'

interface FloatItem {
  position: [number, number, number]
  rotation: [number, number, number]
  scale: number
  speed: number
  type: number
  color: string
}

interface Props {
  chapterKey: string
  magnetStrength: number
  chapterColor: string
}

const CHAPTER_SHAPES: Record<string, FloatItem[]> = {
  logistics: [
    { position: [-4, 2, 0], rotation: [0.2, 0.4, 0], scale: 0.6, speed: 0.4, type: 0, color: '#F59E0B' },
    { position: [3, -1, -2], rotation: [0.5, 0.2, 0.1], scale: 0.8, speed: 0.3, type: 0, color: '#FCD34D' },
    { position: [-2, -2.5, 1], rotation: [0.1, 0.8, 0.2], scale: 0.5, speed: 0.6, type: 0, color: '#F97316' },
    { position: [5, 1, -3], rotation: [0.3, 0.1, 0.4], scale: 0.7, speed: 0.5, type: 1, color: '#F59E0B' },
    { position: [-5, 0.5, -1], rotation: [0.6, 0.3, 0.1], scale: 0.4, speed: 0.7, type: 2, color: '#FCD34D' },
    { position: [1, 3, -2], rotation: [0.2, 0.5, 0.3], scale: 0.55, speed: 0.45, type: 3, color: '#F97316' },
    { position: [-3, -1, -4], rotation: [0.4, 0.2, 0.5], scale: 0.65, speed: 0.35, type: 0, color: '#F59E0B' },
  ],
  support: [
    { position: [-3, 1.5, 0], rotation: [0.1, 0.3, 0.2], scale: 0.5, speed: 0.5, type: 1, color: '#EC4899' },
    { position: [4, -1, -2], rotation: [0.4, 0.2, 0.1], scale: 0.7, speed: 0.4, type: 2, color: '#F472B6' },
    { position: [-1, -2, -3], rotation: [0.2, 0.6, 0.3], scale: 0.6, speed: 0.6, type: 1, color: '#DB2777' },
    { position: [2, 2.5, -1], rotation: [0.5, 0.1, 0.4], scale: 0.45, speed: 0.55, type: 3, color: '#EC4899' },
    { position: [-4, 0, -2], rotation: [0.3, 0.4, 0.2], scale: 0.8, speed: 0.35, type: 2, color: '#F472B6' },
    { position: [5, -0.5, -4], rotation: [0.1, 0.5, 0.3], scale: 0.55, speed: 0.65, type: 1, color: '#DB2777' },
  ],
  sales: [
    { position: [-2, 2, -1], rotation: [0.3, 0.2, 0.1], scale: 0.6, speed: 0.45, type: 3, color: '#6366F1' },
    { position: [3, -1.5, -2], rotation: [0.1, 0.5, 0.3], scale: 0.7, speed: 0.35, type: 0, color: '#818CF8' },
    { position: [-4, -1, 0], rotation: [0.4, 0.3, 0.2], scale: 0.5, speed: 0.55, type: 2, color: '#4F46E5' },
    { position: [1, 3, -3], rotation: [0.2, 0.4, 0.5], scale: 0.65, speed: 0.4, type: 1, color: '#6366F1' },
    { position: [-3, 0.5, -1], rotation: [0.5, 0.1, 0.3], scale: 0.55, speed: 0.5, type: 3, color: '#818CF8' },
    { position: [4, 1, -2], rotation: [0.3, 0.6, 0.1], scale: 0.75, speed: 0.3, type: 0, color: '#4F46E5' },
  ],
  ops: [
    { position: [-3, 1, -1], rotation: [0.2, 0.3, 0.4], scale: 0.6, speed: 0.4, type: 2, color: '#10B981' },
    { position: [4, -2, -2], rotation: [0.4, 0.1, 0.2], scale: 0.7, speed: 0.5, type: 0, color: '#34D399' },
    { position: [-1, 2.5, 0], rotation: [0.1, 0.5, 0.3], scale: 0.5, speed: 0.6, type: 1, color: '#059669' },
    { position: [2, 0, -3], rotation: [0.3, 0.2, 0.5], scale: 0.65, speed: 0.35, type: 3, color: '#10B981' },
    { position: [-4, -1.5, -1], rotation: [0.5, 0.4, 0.1], scale: 0.55, speed: 0.45, type: 2, color: '#34D399' },
    { position: [3, 2, -2], rotation: [0.2, 0.3, 0.4], scale: 0.8, speed: 0.3, type: 0, color: '#059669' },
  ],
}

function ShapeItem({
  item,
  magnet,
  index,
}: {
  item: FloatItem
  magnet: number
  index: number
}) {
  const ref = useRef<THREE.Mesh>(null)

  useFrame(({ clock }) => {
    if (!ref.current) return
    const t = clock.getElapsedTime()
    const chaos = 1 - magnet

    ref.current.rotation.x += 0.003 * item.speed * chaos
    ref.current.rotation.y += 0.004 * item.speed * chaos

    const driftX = Math.sin(t * item.speed * 0.5 + index) * 0.8 * chaos
    const driftY = Math.cos(t * item.speed * 0.4 + index) * 0.5 * chaos

    const cols = 4
    const row = Math.floor(index / cols)
    const col = index % cols
    const gridX = (col - cols / 2) * 2.5
    const gridY = (row - 1) * 2

    ref.current.position.x = item.position[0] * chaos + gridX * magnet + driftX
    ref.current.position.y = item.position[1] * chaos + gridY * magnet + driftY
    ref.current.position.z = item.position[2]
  })

  const mat = (
    <meshStandardMaterial
      color={item.color}
      roughness={0.2}
      metalness={0.6}
      transparent
      opacity={0.85}
    />
  )

  return (
    <mesh ref={ref} position={item.position} rotation={item.rotation}>
      {item.type === 0 && (
        <RoundedBox args={[1, 1, 1]} radius={0.15}>
          {mat}
        </RoundedBox>
      )}
      {item.type === 1 && <Torus args={[0.5, 0.18, 16, 32]}>{mat}</Torus>}
      {item.type === 2 && <Octahedron args={[0.6]}>{mat}</Octahedron>}
      {item.type === 3 && <Cone args={[0.5, 0.9, 6]}>{mat}</Cone>}
    </mesh>
  )
}

export default function FloatingObjects({ chapterKey, magnetStrength, chapterColor }: Props) {
  const groupRef = useRef<THREE.Group>(null)
  const items = CHAPTER_SHAPES[chapterKey] ?? CHAPTER_SHAPES.logistics
  const zone = CHAPTER_WORLD_Z[chapterKey] ?? CHAPTER_WORLD_Z.logistics

  useFrame(() => {
    if (!groupRef.current) return
    const { distance } = getScrollSnapshot()
    groupRef.current.position.z = zone.center
    const distToZone = Math.abs(distance + zone.center)
    groupRef.current.visible = distToZone < zone.span * 1.2
  })

  return (
    <group ref={groupRef}>
      <MagnetField active={magnetStrength > 0.35} color={chapterColor} />
      {items.map((item, i) => (
        <ShapeItem key={i} item={item} magnet={magnetStrength} index={i} />
      ))}
    </group>
  )
}
