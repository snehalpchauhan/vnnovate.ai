'use client'

import { Canvas } from '@react-three/fiber'
import { Preload } from '@react-three/drei'
import CameraRig from './CameraRig'
import WorldRig from './WorldRig'
import HeroEnvironment from './HeroEnvironment'
import ParticleField from './ParticleField'
import FloatingObjects from './FloatingObjects'
import StreamLines from './StreamLines'

interface Props {
  chapterColor: string
  magnetStrength: number
  activeChapter: string | null
}

export default function Scene({ chapterColor, magnetStrength, activeChapter }: Props) {
  const showChapterObjects =
    activeChapter !== null &&
    !['hero', 'finale', 'warp'].includes(activeChapter)

  return (
    <Canvas
      camera={{ position: [0, 2, 10], fov: 50, near: 0.1, far: 500 }}
      gl={{ antialias: true, alpha: false }}
      style={{ background: '#ffffff' }}
      dpr={[1, 2]}
    >
      <HeroEnvironment />

      <fog attach="fog" args={['#F5F7FF', 40, 200]} />

      <ambientLight intensity={0.45} />
      <directionalLight position={[10, 10, 5]} intensity={0.9} color="#ffffff" />
      <directionalLight position={[-8, -4, -2]} intensity={0.3} color={chapterColor} />
      <pointLight position={[0, 0, -20]} intensity={1.2} color={chapterColor} distance={80} />

      <CameraRig />

      <WorldRig>
        <ParticleField color={chapterColor} />
        <StreamLines color={chapterColor} />

        {showChapterObjects && activeChapter && (
          <FloatingObjects
            chapterKey={activeChapter}
            magnetStrength={magnetStrength}
            chapterColor={chapterColor}
          />
        )}
      </WorldRig>

      <Preload all />
    </Canvas>
  )
}
