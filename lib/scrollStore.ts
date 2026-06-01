import { getWarpIntensity, progressToDistance } from './world'

export type ScrollSnapshot = {
  progress: number
  velocity: number
  distance: number
  warpIntensity: number
  holdFlying: boolean
}

const listeners = new Set<() => void>()

let progress = 0
let velocity = 0
let distance = 0
let warpIntensity = 0

let lastProgress = 0
let lastTime = 0
let introCameraLocked = true
let holdFlying = false

export function isIntroCameraLocked(): boolean {
  return introCameraLocked
}

export function isHoldFlying(): boolean {
  return holdFlying
}

export function setHoldFlying(active: boolean) {
  if (holdFlying === active) return
  holdFlying = active
  notify()
}

export function unlockIntroCamera() {
  introCameraLocked = false
}

export function getScrollSnapshot(): ScrollSnapshot {
  return { progress, velocity, distance, warpIntensity, holdFlying }
}

export function decayScrollVelocity(dt: number) {
  if (velocity <= 0.0005) {
    if (velocity !== 0) {
      velocity = 0
      notify()
    }
    return
  }
  const prev = velocity
  velocity *= Math.exp(-7 * dt)
  if (Math.abs(prev - velocity) > 0.003) notify()
}

export function subscribeScroll(fn: () => void): () => void {
  listeners.add(fn)
  return () => listeners.delete(fn)
}

function notify() {
  listeners.forEach((fn) => fn())
}

export function setScrollProgress(nextProgress: number) {
  const now = performance.now()
  const dt = lastTime > 0 ? (now - lastTime) / 1000 : 0.016
  const dp = nextProgress - lastProgress

  progress = Math.max(0, Math.min(1, nextProgress))
  if (progress < 0.002) progress = 0
  if (progress > 0.03) introCameraLocked = false
  distance = progressToDistance(progress)
  warpIntensity = getWarpIntensity(progress)

  if (dt > 0) {
    const rawV = Math.abs(dp / dt)
    velocity += (Math.min(rawV, 6) - velocity) * 0.4
  }

  // Decay when scroll stops so wings/text react to "stopped".
  if (Math.abs(dp) < 0.0001) {
    velocity *= 0.82
  }

  lastProgress = progress
  lastTime = now
  notify()
}

export function resetScrollStore() {
  progress = 0
  velocity = 0
  distance = 0
  warpIntensity = 0
  lastProgress = 0
  lastTime = 0
  introCameraLocked = true
  holdFlying = false
}
