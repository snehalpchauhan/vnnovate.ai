import * as THREE from 'three'
import {
  BUTTERFLY_PATH_START,
  getButterflyTangentAtProgress,
} from './butterflyScrollPath'

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

const _up = new THREE.Vector3(0, 1, 0)
const _fwd = getButterflyTangentAtProgress(0).clone().normalize()
const _side = new THREE.Vector3().crossVectors(_fwd, _up).normalize()

// Camera position: right + behind + up relative to butterfly start
export const INTRO_CAMERA_POSITION = BUTTERFLY_PATH_START.clone()
  .addScaledVector(_side, INTRO.focusSide)
  .addScaledVector(_fwd, -INTRO.focusBehind)
INTRO_CAMERA_POSITION.y += INTRO.focusHeight

// Screen-right derived from view direction (same as milestone focus)
const _viewDir = new THREE.Vector3()
  .subVectors(BUTTERFLY_PATH_START, INTRO_CAMERA_POSITION)
  .normalize()
const _screenRight = new THREE.Vector3()
  .crossVectors(_viewDir, _up)
  .normalize()

// Look target: shifted right in screen-space + lifted → butterfly reads bottom-left
export const INTRO_CAMERA_TARGET = BUTTERFLY_PATH_START.clone()
  .addScaledVector(_up, INTRO.composeLift)
  .addScaledVector(_screenRight, INTRO.composeRight)

const _cam = new THREE.PerspectiveCamera()
_cam.position.copy(INTRO_CAMERA_POSITION)
_cam.lookAt(INTRO_CAMERA_TARGET)
export const INTRO_CAMERA_QUATERNION = _cam.quaternion.clone()
