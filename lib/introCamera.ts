import * as THREE from 'three'
import {
  BUTTERFLY_PATH_START,
  getButterflyTangentAtProgress,
} from './butterflyScrollPath'
import { MOBILE_FRAME_DOWN } from './cameraConfig'

/**
 * Intro framing uses the same logic as getMilestoneFocusFrame but applied
 * to the butterfly start position.  The look-target is shifted hard to the
 * screen-right so the butterfly ends up in the bottom-left of the viewport.
 *
 *  focusSide    – how far camera steps to the right of the butterfly
 *  focusBehind  – how far camera steps behind the butterfly
 *  focusHeight  – how high above the butterfly the camera sits
 *  composeLift  – look-target lifted above butterfly
 *  composeRight – look-target shifted right in screen space (pushes butterfly left)
 */
const INTRO = {
  focusSide: 2.4,
  focusBehind: 1.6,
  focusHeight: 1.55,
  composeLift: 0.85,
  composeRight: 2.1,
}

/** Mobile intro — camera behind butterfly, butterfly bottom-center on screen. */
const MOBILE_INTRO = {
  focusSide: 0,
  focusBehind: 2.05,
  focusHeight: 1.95 + MOBILE_FRAME_DOWN,
  composeLift: 0.15,
  composeRight: 0,
}

const _up = new THREE.Vector3(0, 1, 0)

function buildIntroFrame(opts: typeof INTRO) {
  const fwd = getButterflyTangentAtProgress(0).clone().normalize()
  const side = new THREE.Vector3().crossVectors(fwd, _up).normalize()

  const camPos = BUTTERFLY_PATH_START.clone()
    .addScaledVector(side, opts.focusSide)
    .addScaledVector(fwd, -opts.focusBehind)
  camPos.y += opts.focusHeight

  const viewDir = new THREE.Vector3().subVectors(BUTTERFLY_PATH_START, camPos).normalize()
  const screenRight = new THREE.Vector3().crossVectors(viewDir, _up).normalize()

  const target = BUTTERFLY_PATH_START.clone()
    .addScaledVector(_up, opts.composeLift)
    .addScaledVector(screenRight, opts.composeRight)

  const cam = new THREE.PerspectiveCamera()
  cam.position.copy(camPos)
  cam.lookAt(target)

  return { camPos, quat: cam.quaternion.clone() }
}

const desktopIntro = buildIntroFrame(INTRO)
export const INTRO_CAMERA_POSITION = desktopIntro.camPos
export const INTRO_CAMERA_QUATERNION = desktopIntro.quat

const mobileIntro = buildIntroFrame(MOBILE_INTRO)
export const MOBILE_INTRO_CAMERA_POSITION = mobileIntro.camPos
export const MOBILE_INTRO_CAMERA_QUATERNION = mobileIntro.quat
