function magentaAlpha(r: number, g: number, b: number): number {
  const chroma = Math.min(r, b) - g
  if (r > 200 && b > 170 && g < 80) return 0
  if (r > 170 && b > 140 && g < 115 && chroma > 45) return 0
  if (r > 145 && b > 115 && g < 150 && chroma > 28) {
    return Math.max(0, 255 - chroma * 4)
  }
  return 255
}

export function hasTex(scene: Phaser.Scene, key: string): boolean {
  return scene.textures.exists(key) && scene.textures.get(key).key !== '__MISSING'
}

export function texKey(scene: Phaser.Scene, key: string): string | null {
  if (hasTex(scene, key)) return key
  if (hasTex(scene, `raw-${key}`)) return `raw-${key}`
  return null
}

export function fitImage(img: Phaser.GameObjects.Image, maxW: number, maxH: number): void {
  const fw = img.frame.width
  const fh = img.frame.height
  if (fw <= 0 || fh <= 0) return
  img.setScale(Math.min(maxW / fw, maxH / fh))
}

export function cropOpaque(scene: Phaser.Scene, srcKey: string, destKey: string): boolean {
  if (!scene.textures.exists(srcKey)) return false
  const src = scene.textures.get(srcKey).getSourceImage() as HTMLImageElement | HTMLCanvasElement
  const w = src.width
  const h = src.height
  const scratch = document.createElement('canvas')
  scratch.width = w
  scratch.height = h
  const ctx = scratch.getContext('2d', { willReadFrequently: true })
  if (!ctx) return false
  ctx.drawImage(src, 0, 0)
  const img = ctx.getImageData(0, 0, w, h)
  const d = img.data
  let minX = w
  let minY = h
  let maxX = 0
  let maxY = 0
  for (let y = 0; y < h; y += 1) {
    for (let x = 0; x < w; x += 1) {
      const i = (y * w + x) * 4
      const r = d[i]
      const g = d[i + 1]
      const b = d[i + 2]
      const white = r > 245 && g > 245 && b > 245
      if (white) d[i + 3] = 0
      if (d[i + 3] > 16) {
        if (x < minX) minX = x
        if (y < minY) minY = y
        if (x > maxX) maxX = x
        if (y > maxY) maxY = y
      }
    }
  }
  ctx.putImageData(img, 0, 0)
  if (maxX <= minX || maxY <= minY) return false
  const pad = 4
  const sx = Math.max(0, minX - pad)
  const sy = Math.max(0, minY - pad)
  const sw = Math.min(w - sx, maxX - minX + 1 + pad * 2)
  const sh = Math.min(h - sy, maxY - minY + 1 + pad * 2)
  const out = document.createElement('canvas')
  out.width = sw
  out.height = sh
  const octx = out.getContext('2d')
  if (!octx) return false
  octx.drawImage(scratch, sx, sy, sw, sh, 0, 0, sw, sh)
  if (scene.textures.exists(destKey)) scene.textures.remove(destKey)
  scene.textures.addCanvas(destKey, out)
  return true
}

export function keyAndCrop(scene: Phaser.Scene, srcKey: string, destKey: string): boolean {
  if (!scene.textures.exists(srcKey)) return false
  const src = scene.textures.get(srcKey).getSourceImage() as HTMLImageElement | HTMLCanvasElement
  const w = src.width
  const h = src.height
  const scratch = document.createElement('canvas')
  scratch.width = w
  scratch.height = h
  const ctx = scratch.getContext('2d', { willReadFrequently: true })
  if (!ctx) return false
  ctx.drawImage(src, 0, 0)
  const img = ctx.getImageData(0, 0, w, h)
  const d = img.data
  let minX = w
  let minY = h
  let maxX = 0
  let maxY = 0
  for (let y = 0; y < h; y += 1) {
    for (let x = 0; x < w; x += 1) {
      const i = (y * w + x) * 4
      const a = magentaAlpha(d[i], d[i + 1], d[i + 2])
      d[i + 3] = Math.min(d[i + 3], a)
      if (d[i + 3] > 16) {
        if (x < minX) minX = x
        if (y < minY) minY = y
        if (x > maxX) maxX = x
        if (y > maxY) maxY = y
      }
    }
  }
  ctx.putImageData(img, 0, 0)
  if (maxX <= minX || maxY <= minY) return false
  const pad = 2
  const sx = Math.max(0, minX - pad)
  const sy = Math.max(0, minY - pad)
  const sw = Math.min(w - sx, maxX - minX + 1 + pad * 2)
  const sh = Math.min(h - sy, maxY - minY + 1 + pad * 2)
  const out = document.createElement('canvas')
  out.width = sw
  out.height = sh
  const octx = out.getContext('2d')
  if (!octx) return false
  octx.drawImage(scratch, sx, sy, sw, sh, 0, 0, sw, sh)
  if (scene.textures.exists(destKey)) scene.textures.remove(destKey)
  scene.textures.addCanvas(destKey, out)
  return true
}
