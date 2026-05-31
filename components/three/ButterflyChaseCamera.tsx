'use client'

import { useRef } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import * as THREE from 'three'
import { butterflyRefs } from '@/lib/butterflyRefs'
import { CHASE_CAMERA } from '@/lib/cameraConfig'
import {
  INTRO_CAMERA_POSITION,
  INTRO_CAMERA_QUATERNION,
} from '@/lib/introCamera'
import { getButterflyTangentAtProgress } from '@/lib/butterflyScrollPath'
import { getMilestoneFocusFrame, getMilestoneState } from '@/lib/pathMilestones'
import { getScrollSnapshot, isIntroCameraLocked } from '@/lib/scrollStore'

const {
  distance: FOLLOW_DISTANCE,
  side: FOLLOW_SIDE,
  height: FOLLOW_HEIGHT,
  lookAhead: LOOK_AHEAD,
  lookDrop: LOOK_DROP,
} = CHASE_CAMERA

/** Scroll velocity below this begins the arrival focus; ~0 fully focuses. */
const ARRIVAL_VELOCITY = 0.16

const up = new THREE.Vector3(0, 1, 0)
const smoothHeading = new THREE.Vector3(0, 0, 1)
const sideVec = new THREE.Vector3()
const desiredPos = new THREE.Vector3()
const look = new THREE.Vector3()
const chaseCam = new THREE.Vector3()
const chaseLook = new THREE.Vector3()
const focusCam = new THREE.Vector3()
const focusLook = new THREE.Vector3()
const smoothPos = new THREE.Vector3()
const smoothQuat = new THREE.Quaternion()

function smoothstep(x: number) {
  const t = Math.min(1, Math.max(0, x))
  return t * t * (3 - 2 * t)
}

function behindSideFrame(
  anchor: THREE.Vector3,
  tangent: THREE.Vector3,
  distance: number,
  side: number,
  height: number,
  outCam: THREE.Vector3,
  outLook: THREE.Vector3
) {
  const fwd = tangent.clone().normalize()
  sideVec.crossVectors(fwd, up).normalize()

  outCam
    .copy(anchor)
    .addScaledVector(fwd, -distance)
    .addScaledVector(sideVec, side)
  outCam.y += height

  outLook.copy(anchor).addScaledVector(fwd, LOOK_AHEAD)
  outLook.y = anchor.y + LOOK_DROP
}

export default function ButterflyChaseCamera() {
  const { camera } = useThree()
  const introApplied = useRef(false)
  const focusBlendRef = useRef(0)

  useFrame((_, delta) => {
    const { progress, velocity } = getScrollSnapshot()

    if (isIntroCameraLocked()) {
      camera.position.copy(INTRO_CAMERA_POSITION)
      camera.quaternion.copy(INTRO_CAMERA_QUATERNION)
      smoothPos.copy(INTRO_CAMERA_POSITION)
      smoothQuat.copy(INTRO_CAMERA_QUATERNION)
      introApplied.current = true
      focusBlendRef.current = 0
      return
    }

    const pos = butterflyRefs.position
    smoothHeading.copy(getButterflyTangentAtProgress(progress))

    // —— Flight pose: chase behind/above the butterfly ——
    behindSideFrame(
      pos,
      smoothHeading,
      FOLLOW_DISTANCE,
      FOLLOW_SIDE,
      FOLLOW_HEIGHT,
      chaseCam,
      chaseLook
    )

    // —— Arrival: ease into a framed angle as we slow near a milestone ——
    const { milestone, blend } = getMilestoneState(progress)
    let targetFocus = 0
    if (milestone) {
      const slow = smoothstep(1 - Math.min(velocity / ARRIVAL_VELOCITY, 1))
      targetFocus = smoothstep(blend) * slow
    }
    // Smooth the blend itself so the settle/release feels organic.
    focusBlendRef.current +=
      (targetFocus - focusBlendRef.current) * Math.min(1, delta * 4)
    const focusBlend = focusBlendRef.current

    if (focusBlend > 0.001 && milestone) {
      getMilestoneFocusFrame(milestone, focusCam, focusLook)
      desiredPos.lerpVectors(chaseCam, focusCam, focusBlend)
      look.lerpVectors(chaseLook, focusLook, focusBlend)
    } else {
      desiredPos.copy(chaseCam)
      look.copy(chaseLook)
    }

    applyCamera(camera, desiredPos, look, introApplied.current ? 0.09 : 1)
    introApplied.current = true
  })

  return null
}

function applyCamera(
  camera: THREE.Camera,
  targetPos: THREE.Vector3,
  targetLook: THREE.Vector3,
  lerpFactor: number
) {
  if (lerpFactor >= 1) {
    camera.position.copy(targetPos)
    camera.lookAt(targetLook)
    return
  }

  smoothPos.lerp(targetPos, lerpFactor)
  camera.position.copy(smoothPos)

  const m = new THREE.Matrix4().lookAt(camera.position, targetLook, up)
  smoothQuat.setFromRotationMatrix(m)
  camera.quaternion.slerp(smoothQuat, lerpFactor)
}
