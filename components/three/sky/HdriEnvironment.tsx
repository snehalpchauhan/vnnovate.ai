'use client'

import { Suspense } from 'react'
import { Environment } from '@react-three/drei'

/** Poly Haven Pure Sky — 2K HDR (4.7MB vs 67MB EXR) for fast first paint. */
export const HDRI_PATH = '/hdri/citrus_orchard_road_puresky_2k.hdr'

export default function HdriEnvironment() {
  return (
    <Suspense fallback={null}>
      <Environment
        files={HDRI_PATH}
        background
        environmentRotation={[0, -0.55, 0]}
        environmentIntensity={0.9}
      />
    </Suspense>
  )
}
