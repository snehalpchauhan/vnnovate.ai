'use client'

import { useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { getScrollSnapshot } from '@/lib/scrollStore'
import { getHeroBlend } from '@/lib/butterflyFlight'

const skyVertex = /* glsl */ `
  varying vec3 vWorldPosition;
  void main() {
    vec4 worldPosition = modelMatrix * vec4(position, 1.0);
    vWorldPosition = worldPosition.xyz;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`

const skyFragment = /* glsl */ `
  varying vec3 vWorldPosition;
  uniform vec3 uSunDirection;
  uniform float uBlend;

  void main() {
    vec3 dir = normalize(vWorldPosition);
    float h = dir.y * 0.5 + 0.5;

    vec3 zenith = vec3(0.97, 0.98, 1.0);
    vec3 horizon = vec3(0.82, 0.91, 0.98);
    vec3 sky = mix(horizon, zenith, pow(h, 0.65));

    float sunDot = max(dot(dir, uSunDirection), 0.0);
    vec3 sunGlow = vec3(1.0, 0.96, 0.88) * pow(sunDot, 128.0) * 2.2;
    vec3 sunHalo = vec3(0.95, 0.88, 1.0) * pow(sunDot, 8.0) * 0.35;

    vec3 color = sky + sunGlow + sunHalo;
    gl_FragColor = vec4(color, uBlend);
  }
`

export default function WhiteSky() {
  const sunDirection = useMemo(() => new THREE.Vector3(0.25, 0.85, 0.45).normalize(), [])

  const material = useMemo(
    () =>
      new THREE.ShaderMaterial({
        vertexShader: skyVertex,
        fragmentShader: skyFragment,
        uniforms: {
          uSunDirection: { value: sunDirection.clone() },
          uBlend: { value: 1 },
        },
        side: THREE.BackSide,
        depthWrite: false,
        transparent: true,
      }),
    [sunDirection]
  )

  useFrame(() => {
    const { progress } = getScrollSnapshot()
    material.uniforms.uBlend.value = getHeroBlend(progress)
  })

  return (
    <mesh scale={320} renderOrder={-10} material={material}>
      <sphereGeometry args={[1, 48, 32]} />
    </mesh>
  )
}
