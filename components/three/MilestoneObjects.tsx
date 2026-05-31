'use client'

import { useLayoutEffect, useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import {
  PATH_MILESTONES,
  getMilestoneApproachPose,
  getMilestoneState,
  type MilestoneObjectKind,
  type PathMilestone,
} from '@/lib/pathMilestones'
import { getScrollSnapshot } from '@/lib/scrollStore'

function buildObjectGroup(kind: MilestoneObjectKind, color: string): THREE.Group {
  const g = new THREE.Group()
  const emissive = new THREE.Color(color)

  if (kind === 'orb') {
    const mesh = new THREE.Mesh(
      new THREE.IcosahedronGeometry(0.42, 1),
      new THREE.MeshStandardMaterial({
        color,
        emissive,
        emissiveIntensity: 0.5,
        metalness: 0.55,
        roughness: 0.25,
      })
    )
    mesh.position.y = 0.22
    g.add(mesh)
  } else if (kind === 'prism') {
    const mesh = new THREE.Mesh(
      new THREE.OctahedronGeometry(0.48, 0),
      new THREE.MeshStandardMaterial({
        color,
        emissive,
        emissiveIntensity: 0.5,
        metalness: 0.6,
        roughness: 0.2,
      })
    )
    mesh.position.y = 0.24
    mesh.rotation.set(0.4, 0.6, 0)
    g.add(mesh)
  } else if (kind === 'helix') {
    const mesh = new THREE.Mesh(
      new THREE.TorusKnotGeometry(0.28, 0.09, 64, 12),
      new THREE.MeshStandardMaterial({
        color,
        emissive,
        emissiveIntensity: 0.5,
        metalness: 0.5,
        roughness: 0.3,
      })
    )
    mesh.position.y = 0.2
    g.add(mesh)
  } else {
    const cone = new THREE.Mesh(
      new THREE.ConeGeometry(0.32, 0.7, 4),
      new THREE.MeshStandardMaterial({
        color,
        emissive,
        emissiveIntensity: 0.5,
        metalness: 0.45,
        roughness: 0.35,
      })
    )
    cone.position.y = 0.35
    const base = new THREE.Mesh(
      new THREE.CylinderGeometry(0.2, 0.28, 0.2, 16),
      new THREE.MeshStandardMaterial({
        color: '#FDE68A',
        emissive: new THREE.Color('#FBBF24'),
        emissiveIntensity: 0.5,
        metalness: 0.4,
        roughness: 0.4,
      })
    )
    g.add(cone, base)
  }

  const ring = new THREE.Mesh(
    new THREE.RingGeometry(0.52, 0.58, 32),
    new THREE.MeshBasicMaterial({
      color: '#FACC15',
      transparent: true,
      opacity: 0.35,
      side: THREE.DoubleSide,
      toneMapped: false,
    })
  )
  ring.rotation.x = -Math.PI / 2
  g.add(ring)

  return g
}

type Entry = {
  milestone: PathMilestone
  group: THREE.Group
  materials: THREE.MeshStandardMaterial[]
  ringMat: THREE.MeshBasicMaterial
}

export default function MilestoneObjects() {
  const root = useRef<THREE.Group>(null)
  const entries = useRef<Entry[]>([])

  const configs = useMemo(() => PATH_MILESTONES, [])

  useLayoutEffect(() => {
    const parent = root.current
    if (!parent) return

    entries.current = configs.map((m) => {
      const group = buildObjectGroup(m.objectKind, m.objectColor)
      parent.add(group)

      const materials: THREE.MeshStandardMaterial[] = []
      group.traverse((o) => {
        const mesh = o as THREE.Mesh
        if (mesh.isMesh && mesh.material instanceof THREE.MeshStandardMaterial) {
          materials.push(mesh.material)
        }
      })
      const ring = group.children[group.children.length - 1] as THREE.Mesh
      const ringMat = ring.material as THREE.MeshBasicMaterial

      return { milestone: m, group, materials, ringMat }
    })

    return () => {
      entries.current.forEach((e) => {
        e.group.traverse((o) => {
          const mesh = o as THREE.Mesh
          mesh.geometry?.dispose()
          if (mesh.material) {
            const mats = Array.isArray(mesh.material)
              ? mesh.material
              : [mesh.material]
            mats.forEach((mat) => mat.dispose())
          }
        })
        parent.remove(e.group)
      })
      entries.current = []
    }
  }, [configs])

  useFrame((_, delta) => {
    const { progress } = getScrollSnapshot()
    const { milestone, blend } = getMilestoneState(progress)

    entries.current.forEach((e) => {
      const m = e.milestone
      const pose = getMilestoneApproachPose(m, progress)

      if (!pose) {
        e.group.visible = false
        return
      }

      const { position, yaw, approachScale, reveal } = pose
      const isActive = milestone?.id === m.id
      const active = isActive ? blend : 0

      e.group.visible = true
      e.group.position.copy(position)
      e.group.rotation.set(0, yaw, 0)

      const s = approachScale * (0.22 + active * 0.1)
      e.group.scale.setScalar(Math.max(s, 0.001))
      e.group.rotation.y += delta * (0.35 + active * 0.5)
      if (m.objectKind === 'helix') e.group.rotation.x += delta * 0.2

      e.materials.forEach((mat) => {
        mat.emissiveIntensity = 0.2 + reveal * (0.35 + active * 0.9)
        mat.opacity = reveal
        mat.transparent = true
        mat.depthWrite = false
      })
      // Render milestone objects behind the butterfly (which has renderOrder 10)
      e.group.traverse((o) => { o.renderOrder = 2 })
      e.ringMat.opacity = reveal * (0.2 + active * 0.55)
    })
  })

  return <group ref={root} />
}
