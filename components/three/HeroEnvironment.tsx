'use client'

import WhiteSky from './sky/WhiteSky'
import SoftClouds from './sky/SoftClouds'
import Butterfly from './butterfly/Butterfly'

/** Fixed hero layer: white sky + soft clouds + branded butterfly */
export default function HeroEnvironment() {
  return (
    <group>
      <WhiteSky />
      <SoftClouds />
      <directionalLight position={[8, 18, 10]} intensity={1.6} color="#fffaf0" />
      <directionalLight position={[-6, 8, -4]} intensity={0.35} color="#c7d2fe" />
      <Butterfly />
    </group>
  )
}
