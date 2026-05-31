import * as THREE from 'three'

export type WingPattern = 'vnnovate' | 'glasswing' | 'monarch' | 'opal'

function drawCapillaryVeins(
  diffCtx: CanvasRenderingContext2D,
  bumpCtx: CanvasRenderingContext2D,
  w: number,
  h: number,
  mainColor = '#000000',
  bumpHigh = '#ffffff'
) {
  const centerX = 50
  const centerY = h / 2
  diffCtx.strokeStyle = mainColor
  diffCtx.lineCap = 'round'
  bumpCtx.strokeStyle = bumpHigh
  bumpCtx.lineCap = 'round'

  const branches = [
    { angle: -0.8, length: 700, thickness: 16 },
    { angle: -0.4, length: 850, thickness: 22 },
    { angle: 0, length: 900, thickness: 25 },
    { angle: 0.3, length: 850, thickness: 22 },
    { angle: 0.6, length: 750, thickness: 18 },
    { angle: 0.9, length: 650, thickness: 14 },
  ]

  for (const branch of branches) {
    const endX = centerX + Math.cos(branch.angle) * branch.length
    const endY = centerY + Math.sin(branch.angle) * branch.length

    diffCtx.lineWidth = branch.thickness
    diffCtx.beginPath()
    diffCtx.moveTo(centerX, centerY)
    diffCtx.bezierCurveTo(
      centerX + 200 * Math.cos(branch.angle),
      centerY + 100 * Math.sin(branch.angle),
      endX - 200 * Math.cos(branch.angle),
      endY - 100 * Math.sin(branch.angle),
      endX,
      endY
    )
    diffCtx.stroke()

    bumpCtx.lineWidth = branch.thickness * 0.7
    bumpCtx.beginPath()
    bumpCtx.moveTo(centerX, centerY)
    bumpCtx.bezierCurveTo(
      centerX + 200 * Math.cos(branch.angle),
      centerY + 100 * Math.sin(branch.angle),
      endX - 200 * Math.cos(branch.angle),
      endY - 100 * Math.sin(branch.angle),
      endX,
      endY
    )
    bumpCtx.stroke()

    for (let k = 1; k <= 5; k++) {
      const t = k / 6
      const subAngle = branch.angle + (k % 2 === 0 ? 0.35 : -0.35)
      const subLen = (1 - t) * 220
      const sx = centerX + Math.cos(branch.angle) * (branch.length * t)
      const sy = centerY + Math.sin(branch.angle) * (branch.length * t)
      const ex = sx + Math.cos(subAngle) * subLen
      const ey = sy + Math.sin(subAngle) * subLen
      diffCtx.lineWidth = branch.thickness * 0.4
      diffCtx.beginPath()
      diffCtx.moveTo(sx, sy)
      diffCtx.lineTo(ex, ey)
      diffCtx.stroke()
      bumpCtx.lineWidth = branch.thickness * 0.3
      bumpCtx.beginPath()
      bumpCtx.moveTo(sx, sy)
      bumpCtx.lineTo(ex, ey)
      bumpCtx.stroke()
    }
  }
}

function drawMicroScales(ctx: CanvasRenderingContext2D, w: number, h: number, color: string) {
  ctx.fillStyle = color
  for (let i = 0; i < 12000; i++) {
    ctx.fillRect(Math.random() * w, Math.random() * h, 1.5 + Math.random() * 2, 1.5 + Math.random() * 2)
  }
}

export function createWingTextures(pattern: WingPattern = 'vnnovate') {
  const size = 1024
  const diffuseCanvas = document.createElement('canvas')
  diffuseCanvas.width = size
  diffuseCanvas.height = size
  const diffuseContext = diffuseCanvas.getContext('2d')!

  const bumpCanvas = document.createElement('canvas')
  bumpCanvas.width = size
  bumpCanvas.height = size
  const bumpContext = bumpCanvas.getContext('2d')!
  bumpContext.fillStyle = '#808080'
  bumpContext.fillRect(0, 0, size, size)

  diffuseContext.clearRect(0, 0, size, size)

  if (pattern === 'vnnovate') {
    const grad = diffuseContext.createRadialGradient(200, 500, 50, 500, 500, 600)
    grad.addColorStop(0, '#a5b4fc')
    grad.addColorStop(0.45, '#6366f1')
    grad.addColorStop(0.7, '#22d3ee')
    grad.addColorStop(0.88, '#312e81')
    grad.addColorStop(0.95, '#0f172a')
    diffuseContext.fillStyle = grad
    diffuseContext.fillRect(0, 0, size, size)
    drawMicroScales(diffuseContext, size, size, 'rgba(255,255,255,0.08)')
    drawCapillaryVeins(diffuseContext, bumpContext, size, size, 'rgba(15,23,42,0.75)')
  } else if (pattern === 'glasswing') {
    diffuseContext.fillStyle = '#000'
    diffuseContext.fillRect(0, 0, size, size)
    const grad = diffuseContext.createRadialGradient(500, 500, 50, 500, 500, 400)
    grad.addColorStop(0, 'rgba(224,242,254,0.35)')
    grad.addColorStop(0.7, 'rgba(255,255,255,0.12)')
    grad.addColorStop(0.88, 'rgba(99,102,241,0.85)')
    grad.addColorStop(0.95, '#0f172a')
    diffuseContext.fillStyle = grad
    diffuseContext.fillRect(0, 0, size, size)
    drawCapillaryVeins(diffuseContext, bumpContext, size, size, 'rgba(49,46,129,0.9)')
  } else if (pattern === 'monarch') {
    const grad = diffuseContext.createRadialGradient(200, 500, 50, 500, 500, 600)
    grad.addColorStop(0, '#f97316')
    grad.addColorStop(0.6, '#ea580c')
    grad.addColorStop(0.85, '#facc15')
    grad.addColorStop(0.9, '#000')
    diffuseContext.fillStyle = grad
    diffuseContext.fillRect(0, 0, size, size)
    drawMicroScales(diffuseContext, size, size, 'rgba(255,255,255,0.06)')
    drawCapillaryVeins(diffuseContext, bumpContext, size, size)
  } else {
    const grad = diffuseContext.createLinearGradient(0, 0, size, size)
    grad.addColorStop(0, '#f472b6')
    grad.addColorStop(0.35, '#c084fc')
    grad.addColorStop(0.65, '#38bdf8')
    grad.addColorStop(1, '#4ade80')
    diffuseContext.fillStyle = grad
    diffuseContext.fillRect(0, 0, size, size)
    drawCapillaryVeins(diffuseContext, bumpContext, size, size, 'rgba(0,0,0,0.75)')
  }

  const diffuseTexture = new THREE.CanvasTexture(diffuseCanvas)
  const bumpTexture = new THREE.CanvasTexture(bumpCanvas)
  diffuseTexture.colorSpace = THREE.SRGBColorSpace
  diffuseTexture.anisotropy = 8
  bumpTexture.anisotropy = 8

  return { diffuseTexture, bumpTexture }
}
