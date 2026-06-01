'use client'

import { Canvas } from '@react-three/fiber'
import { Preload } from '@react-three/drei'
import * as THREE from 'three'
import { Suspense } from 'react'
import { useIsMobile } from '@/lib/useMediaQuery'
import HdriEnvironment from './sky/HdriEnvironment'
import GLBButterfly from './butterfly/GLBButterfly'
import ButterflyChaseCamera from './ButterflyChaseCamera'
import PollenField from './PollenField'
import FlightPath from './FlightPath'
import MilestoneObjects from './MilestoneObjects'
import LandscapeMountains from './LandscapeMountains'
import LandscapeTrees from './LandscapeTrees'
import { INTRO_CAMERA_POSITION } from '@/lib/introCamera'

export default function ButterflyLandingScene() {
  const isMobile = useIsMobile()

  return (
    <Canvas
      camera={{
        position: [
          INTRO_CAMERA_POSITION.x,
          INTRO_CAMERA_POSITION.y,
          INTRO_CAMERA_POSITION.z,
        ],
        fov: 50,
        near: 0.01,
        far: 200000,
      }}
      gl={{ antialias: true, alpha: false }}
      style={{ background: 'transparent' }}
      dpr={isMobile ? [1, 1.35] : [1, 2]}
      shadows={!isMobile}
      onCreated={({ gl, scene }) => {
        gl.toneMapping = THREE.ACESFilmicToneMapping
        gl.toneMappingExposure = 1.0
        gl.shadowMap.enabled = !isMobile
        if (!isMobile) gl.shadowMap.type = THREE.PCFShadowMap
        scene.fog = new THREE.Fog(0xc9dff0, isMobile ? 28 : 40, isMobile ? 95 : 125)
      }}
    >
      <HdriEnvironment />

      <Suspense fallback={null}>
        <LandscapeMountains />
        <LandscapeTrees />
      </Suspense>

      <ambientLight intensity={0.15} color="#ffffff" />
      <directionalLight
        position={[40, 60, 20]}
        intensity={0.85}
        color="#fff8ee"
        castShadow={!isMobile}
        shadow-mapSize={isMobile ? [1024, 1024] : [2048, 2048]}
      />

      <FlightPath />
      <MilestoneObjects />
      <ButterflyChaseCamera />
      <Suspense fallback={null}>
        <GLBButterfly />
      </Suspense>
      <PollenField />

      <Preload all />
    </Canvas>
  )
}
