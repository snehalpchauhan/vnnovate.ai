'use client'

import { useLayoutEffect, useRef } from 'react'
import { useThree } from '@react-three/fiber'
import { Sky } from 'three/examples/jsm/objects/Sky.js'
import * as THREE from 'three'

/** Realistic daytime physical sky (Three.js Sky shader). */
export default function DaySky() {
  const skyRef = useRef<Sky>(null)
  const { scene } = useThree()

  useLayoutEffect(() => {
    const sky = new Sky()
    sky.scale.setScalar(450000)
    skyRef.current = sky
    scene.add(sky)

    const uniforms = sky.material.uniforms
    // Mid-morning: soft blue zenith, warm horizon haze
    uniforms.turbidity.value = 6
    uniforms.rayleigh.value = 2.2
    uniforms.mieCoefficient.value = 0.006
    uniforms.mieDirectionalG.value = 0.85

    const sun = new THREE.Vector3()
    const elevation = 42
    const azimuth = 168
    const phi = THREE.MathUtils.degToRad(90 - elevation)
    const theta = THREE.MathUtils.degToRad(azimuth)
    sun.setFromSphericalCoords(1, phi, theta)
    uniforms.sunPosition.value.copy(sun)

    const horizonColor = new THREE.Color(0xb8d4f0)
    scene.background = horizonColor
    scene.fog = new THREE.Fog(horizonColor, 28, 95)

    return () => {
      scene.remove(sky)
      scene.fog = null
      sky.geometry.dispose()
      sky.material.dispose()
    }
  }, [scene])

  return null
}
