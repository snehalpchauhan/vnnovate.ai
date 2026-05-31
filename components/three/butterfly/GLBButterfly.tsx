'use client'

import { useEffect, useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { useGLTF, useAnimations } from '@react-three/drei'
import * as THREE from 'three'
import { butterflyRefs } from '@/lib/butterflyRefs'
import {
  BUTTERFLY_PATH_START,
  getButterflyHeadingAtProgress,
  getButterflyPositionAtProgress,
} from '@/lib/butterflyScrollPath'
import {
  getMilestoneProgressGap,
  getMilestoneState,
  WING_FLAPS_PER_MILESTONE,
} from '@/lib/pathMilestones'
import { getScrollSnapshot, isIntroCameraLocked } from '@/lib/scrollStore'

const MODEL_PATH = '/models/butterfly.glb'
/**
 * Hardcoded scale. The rigged mesh renders at its native geometry size (~125
 * units; the rig's 100x is cancelled by the bind matrices). 0.6 / 125 ≈ 0.0048.
 * Tune this one number if size is off.
 */
const MODEL_SCALE = 0.0048
/** Model faces +Z by default; flight yaw aligns via outer.rotation.y */
const MODEL_YAW = 0

export default function GLBButterfly() {
  const outer = useRef<THREE.Group>(null)
  const inner = useRef<THREE.Group>(null)
  const { scene, animations } = useGLTF(MODEL_PATH)

  // Strip root translation tracks: the clip flies the butterfly forward then
  // loops back ("reset"). We only want wing-flap (rotation); position is ours.
  const flapAnimations = useMemo(() => {
    return animations.map((clip) => {
      const c = clip.clone()
      c.tracks = c.tracks.filter((t) => !t.name.endsWith('.position'))
      return c
    })
  }, [animations])

  const { actions, names } = useAnimations(flapAnimations, inner)

  const flightTime = useRef(0)
  const targetPos = useRef(BUTTERFLY_PATH_START.clone())
  const smoothPos = useRef(BUTTERFLY_PATH_START.clone())
  const flapAction = useRef<THREE.AnimationAction | null>(null)
  const flapCycleDuration = useRef(1)
  const wingSpeed = useRef(0.05)
  const lastProgress = useRef(0)

  /** Barely moving wings when scroll is paused. */
  const FLAP_IDLE = 0.025
  const FLAP_MAX = 4.2
  /** Global wing speed multiplier — lower = slower flaps. */
  const FLAP_SCALE = 0.52

  // Use the loaded scene directly — do NOT clone. scene.clone() breaks skinned
  useMemo(() => {
    scene.traverse((o) => {
      const mesh = o as THREE.Mesh
      if (mesh.isMesh) {
        mesh.castShadow = true
        mesh.receiveShadow = true
        mesh.frustumCulled = false
        // Render butterfly on top of milestone objects so it never gets hidden
        // behind them when paths cross.
        mesh.renderOrder = 10
      }
    })
  }, [scene])

  useEffect(() => {
    if (!names.length) return
    let best = names[0]
    let bestDur = 0
    for (const n of names) {
      const d = actions[n]?.getClip().duration ?? 0
      if (d > bestDur) {
        bestDur = d
        best = n
      }
    }
    const action = actions[best]
    const clipDuration = action?.getClip().duration ?? 1
    flapCycleDuration.current = clipDuration * 2
    flapAction.current = action ?? null
    action?.reset().setLoop(THREE.LoopPingPong, Infinity).play()
    action?.setEffectiveTimeScale(FLAP_IDLE)
    return () => {
      action?.stop()
      flapAction.current = null
    }
  }, [actions, names])

  useFrame((_, delta) => {
    if (!outer.current) return
    const dt = Math.min(delta, 0.05)
    flightTime.current += dt
    const t = flightTime.current

    const { progress } = getScrollSnapshot()
    const { milestone, blend: milestoneBlend } = getMilestoneState(progress)
    butterflyRefs.milestoneBlend = milestoneBlend
    butterflyRefs.milestoneId = milestone?.id ?? null

    // Tie wing beats to scroll progress: ~4 flaps per milestone segment.
    const progressRate =
      Math.abs(progress - lastProgress.current) / Math.max(dt, 0.001)
    lastProgress.current = progress

    const milestoneGap = getMilestoneProgressGap()
    const cycle = flapCycleDuration.current
    let targetFlap =
      (WING_FLAPS_PER_MILESTONE * progressRate * cycle * FLAP_SCALE) /
      milestoneGap

    if (progressRate < 0.00006) {
      targetFlap = FLAP_IDLE
    }

    targetFlap = Math.min(FLAP_MAX, Math.max(FLAP_IDLE, targetFlap))
    wingSpeed.current += (targetFlap - wingSpeed.current) * Math.min(1, dt * 10)
    flapAction.current?.setEffectiveTimeScale(wingSpeed.current)

    targetPos.current.copy(getButterflyPositionAtProgress(progress, t))

    // Hold still at path start until the user scrolls (avoids micro-drift / spin at load).
    if (isIntroCameraLocked()) {
      smoothPos.current.copy(targetPos.current)
      outer.current.position.copy(targetPos.current)
      butterflyRefs.position.copy(targetPos.current)
      butterflyRefs.velocity.set(0, 0, 0)
      butterflyRefs.lastPosition.copy(targetPos.current)

      outer.current.rotation.y = getButterflyHeadingAtProgress(progress)
      return
    }

    smoothPos.current.lerp(targetPos.current, 0.18)
    outer.current.position.copy(smoothPos.current)

    butterflyRefs.velocity
      .subVectors(smoothPos.current, butterflyRefs.lastPosition)
      .divideScalar(Math.max(dt, 0.001))
    butterflyRefs.lastPosition.copy(smoothPos.current)
    butterflyRefs.position.copy(smoothPos.current)
    butterflyRefs.flightTime = t

    const targetYaw = getButterflyHeadingAtProgress(progress)
    let diff = targetYaw - outer.current.rotation.y
    while (diff < -Math.PI) diff += Math.PI * 2
    while (diff > Math.PI) diff -= Math.PI * 2
    outer.current.rotation.y += diff * 0.1
  })

  return (
    <group
      ref={outer}
      position={[BUTTERFLY_PATH_START.x, BUTTERFLY_PATH_START.y, BUTTERFLY_PATH_START.z]}
    >
      <group rotation={[0, MODEL_YAW, 0]}>
        <group ref={inner} scale={MODEL_SCALE}>
          <primitive object={scene} />
        </group>
      </group>
    </group>
  )
}

useGLTF.preload(MODEL_PATH)
