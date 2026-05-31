import fs from 'fs'

const path = process.argv[2] || 'public/models/butterfly.glb'
const buf = fs.readFileSync(path)

// GLB header: magic(4) version(4) length(4), then chunks: length(4) type(4) data
let off = 12
let json = null
while (off < buf.length) {
  const len = buf.readUInt32LE(off)
  const type = buf.readUInt32LE(off + 4)
  const data = buf.subarray(off + 8, off + 8 + len)
  if (type === 0x4e4f534a) {
    json = JSON.parse(data.toString('utf8'))
    break
  }
  off += 8 + len
}

if (!json) {
  console.log('No JSON chunk found')
  process.exit(1)
}

console.log('=== NODES (name, scale, mesh, skin) ===')
;(json.nodes || []).forEach((n, i) => {
  const s = n.scale ? n.scale.map((v) => +v.toFixed(3)) : null
  if (s || n.mesh != null || n.skin != null) {
    console.log(
      `#${i} ${n.name ?? ''} scale=${s ? JSON.stringify(s) : '-'} mesh=${n.mesh ?? '-'} skin=${n.skin ?? '-'}`
    )
  }
})

console.log('\n=== POSITION accessor bounds (geometry extents) ===')
const accessors = json.accessors || []
;(json.meshes || []).forEach((m, mi) => {
  m.primitives.forEach((p, pi) => {
    const posIdx = p.attributes?.POSITION
    if (posIdx == null) return
    const a = accessors[posIdx]
    if (a?.min && a?.max) {
      const size = a.max.map((v, k) => +(v - a.min[k]).toFixed(2))
      console.log(`mesh#${mi} prim#${pi} size=${JSON.stringify(size)} min=${JSON.stringify(a.min)} max=${JSON.stringify(a.max)}`)
    }
  })
})

console.log('\n=== ANIMATIONS ===')
;(json.animations || []).forEach((a, i) => console.log(`#${i} ${a.name ?? ''} channels=${a.channels.length}`))
