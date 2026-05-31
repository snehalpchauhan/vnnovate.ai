import * as THREE from 'three'
import { BUTTERFLY_PATH_START } from './butterflyScrollPath'

/** Shared flight state for chase camera (updated in useFrame, no React state) */
export const butterflyRefs = {
  position: BUTTERFLY_PATH_START.clone(),
  velocity: new THREE.Vector3(),
  lastPosition: BUTTERFLY_PATH_START.clone(),
  flightTime: 0,
  /** 0 = chase flight, 1 = milestone side-shot (Vnnovate text in frame) */
  milestoneBlend: 0,
  milestoneId: null as string | null,
}
