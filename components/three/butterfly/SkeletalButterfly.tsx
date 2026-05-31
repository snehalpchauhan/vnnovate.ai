'use client'

import { useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { createWingTextures } from '@/lib/wingTextures'
import { butterflyRefs } from '@/lib/butterflyRefs'

const FLAP_FREQ = 2.2
const FLEX_AMP = 0.28
const TRANSMISSION = 0.55

export default function SkeletalButterfly() {
  const root = useRef<THREE.Group>(null)
  const leftWingRoot = useRef<THREE.Group>(null)
  const rightWingRoot = useRef<THREE.Group>(null)
  const wingMaterialRef = useRef<THREE.MeshPhysicalMaterial | null>(null)
  const flightTime = useRef(0)
  const targetPos = useRef(new THREE.Vector3(0, 8, 0))
  const smoothPos = useRef(new THREE.Vector3(0, 8, 0))

  const textures = useMemo(() => {
    if (typeof document === 'undefined') return null
    return createWingTextures('vnnovate')
  }, [])

  const bodyMaterial = useMemo(() => {
    const mat = new THREE.MeshStandardMaterial({
      color: 0x0f172a,
      roughness: 0.75,
      metalness: 0.2,
    })
    if (typeof document !== 'undefined') {
      const canvas = document.createElement('canvas')
      canvas.width = 128
      canvas.height = 128
      const ctx = canvas.getContext('2d')!
      ctx.fillStyle = '#808080'
      ctx.fillRect(0, 0, 128, 128)
      for (let i = 0; i < 800; i++) {
        ctx.fillStyle = Math.random() > 0.5 ? '#fff' : '#000'
        ctx.fillRect(Math.random() * 128, Math.random() * 128, 2, 2)
      }
      mat.bumpMap = new THREE.CanvasTexture(canvas)
      mat.bumpMap.wrapS = mat.bumpMap.wrapT = THREE.RepeatWrapping
      mat.bumpMap.repeat.set(4, 12)
    }
    return mat
  }, [])

  const wingMaterial = useMemo(() => {
    if (!textures) return null
    const mat = new THREE.MeshPhysicalMaterial({
      map: textures.diffuseTexture,
      bumpMap: textures.bumpTexture,
      bumpScale: 0.045,
      side: THREE.DoubleSide,
      roughness: 0.22,
      metalness: 0.1,
      transmission: TRANSMISSION,
      thickness: 0.1,
      iridescence: 1,
      iridescenceIOR: 1.45,
      iridescenceThicknessRange: [380, 800],
      sheen: 0.8,
      sheenRoughness: 0.4,
      sheenColor: new THREE.Color('#c7d2fe'),
    })

    mat.onBeforeCompile = (shader) => {
      shader.uniforms.uTime = { value: 0 }
      shader.uniforms.uFlapFreq = { value: FLAP_FREQ }
      shader.uniforms.uFlexAmp = { value: FLEX_AMP }
      mat.userData.shader = shader

      shader.vertexShader =
        `
        uniform float uTime;
        uniform float uFlapFreq;
        uniform float uFlexAmp;
      ` + shader.vertexShader

      shader.vertexShader = shader.vertexShader.replace(
        '#include <begin_vertex>',
        `
        #include <begin_vertex>
        float dist = abs(position.x);
        float wave = sin(uTime * uFlapFreq - dist * 1.8);
        transformed.z += wave * dist * dist * uFlexAmp;
      `
      )
    }

    wingMaterialRef.current = mat
    return mat
  }, [textures])

  const wingGeometry = useMemo(() => {
    const g = new THREE.PlaneGeometry(3.6, 2.6, 32, 32)
    g.translate(1.8, 0, 0)
    return g
  }, [])

  useFrame((_, delta) => {
    if (!root.current || !leftWingRoot.current || !rightWingRoot.current) return

    flightTime.current += delta
    const t = flightTime.current

    targetPos.current.set(
      Math.sin(t * 0.45) * 12 + Math.cos(t * 0.1) * 4,
      7 + Math.cos(t * 0.65) * 3.5 + Math.sin(t * 0.2) * 1.5,
      -t * 2.2 + Math.sin(t * 0.3) * 8
    )

    smoothPos.current.lerp(targetPos.current, 0.08)
    root.current.position.copy(smoothPos.current)

    butterflyRefs.velocity.subVectors(smoothPos.current, butterflyRefs.lastPosition).divideScalar(
      Math.max(delta, 0.001)
    )
    butterflyRefs.lastPosition.copy(smoothPos.current)
    butterflyRefs.position.copy(smoothPos.current)
    butterflyRefs.flightTime = t

    const vel = butterflyRefs.velocity
    if (vel.lengthSq() > 0.001) {
      const targetYaw = Math.atan2(vel.x, vel.z)
      let diff = targetYaw - root.current.rotation.y
      while (diff < -Math.PI) diff += Math.PI * 2
      while (diff > Math.PI) diff -= Math.PI * 2
      root.current.rotation.y += diff * 0.1
      root.current.rotation.z += (-vel.x * 0.08 - root.current.rotation.z) * 0.08
      root.current.rotation.x += (vel.y * 0.04 - root.current.rotation.x) * 0.08
    }

    const flap = Math.sin(t * FLAP_FREQ * Math.PI * 2)
    leftWingRoot.current.rotation.z = flap * 0.8
    rightWingRoot.current.rotation.z = -flap * 0.8

    const shader = wingMaterialRef.current?.userData?.shader as
      | { uniforms: { uTime: { value: number }; uFlapFreq: { value: number }; uFlexAmp: { value: number } } }
      | undefined
    if (shader) {
      shader.uniforms.uTime.value = t
      shader.uniforms.uFlapFreq.value = FLAP_FREQ
      shader.uniforms.uFlexAmp.value = FLEX_AMP
    }
  })

  if (!wingMaterial) return null

  return (
    <group ref={root}>
      <mesh material={bodyMaterial} rotation={[Math.PI / 2, 0, 0]} castShadow receiveShadow>
        <cylinderGeometry args={[0.2, 0.24, 1.2, 12]} />
      </mesh>
      <mesh material={bodyMaterial} position={[0, 0, -1.5]} rotation={[-Math.PI / 2, 0, 0]} castShadow>
        <coneGeometry args={[0.18, 2, 10]} />
      </mesh>
      <mesh material={bodyMaterial} position={[0, 0, 0.85]} castShadow>
        <sphereGeometry args={[0.25, 12, 12]} />
      </mesh>

      <mesh position={[-0.16, 0.12, 0.95]}>
        <sphereGeometry args={[0.11, 8, 8]} />
        <meshStandardMaterial color={0x1e1b4b} roughness={0.05} metalness={0.9} />
      </mesh>
      <mesh position={[0.16, 0.12, 0.95]}>
        <sphereGeometry args={[0.11, 8, 8]} />
        <meshStandardMaterial color={0x1e1b4b} roughness={0.05} metalness={0.9} />
      </mesh>

      <group ref={leftWingRoot} position={[-0.15, 0.1, 0.1]}>
        <mesh geometry={wingGeometry} material={wingMaterial} scale={[-1, 1, 1]} castShadow receiveShadow />
      </group>
      <group ref={rightWingRoot} position={[0.15, 0.1, 0.1]}>
        <mesh geometry={wingGeometry} material={wingMaterial} castShadow receiveShadow />
      </group>
    </group>
  )
}
