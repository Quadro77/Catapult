import { GAME_HEIGHT, GAME_WIDTH } from '../config.ts'

export function isGameFullscreen(): boolean {
  const doc = document as Document & { webkitFullscreenElement?: Element | null }
  return Boolean(document.fullscreenElement ?? doc.webkitFullscreenElement)
}

export function requestGameFullscreen(): void {
  if (isGameFullscreen()) return
  const root = document.documentElement as HTMLElement & {
    webkitRequestFullscreen?: () => Promise<void> | void
    webkitRequestFullScreen?: () => Promise<void> | void
  }
  const req = root.requestFullscreen?.bind(root) ?? root.webkitRequestFullscreen?.bind(root) ?? root.webkitRequestFullScreen?.bind(root)
  if (!req) return
  void Promise.resolve(req()).catch(() => undefined)
}

export function exitGameFullscreen(): void {
  const doc = document as Document & { webkitExitFullscreen?: () => Promise<void> | void }
  if (!isGameFullscreen()) return
  const exit = document.exitFullscreen?.bind(document) ?? doc.webkitExitFullscreen?.bind(document)
  if (!exit) return
  void Promise.resolve(exit()).catch(() => undefined)
}

export function toggleGameFullscreen(): void {
  if (isGameFullscreen()) exitGameFullscreen()
  else requestGameFullscreen()
}

export function bindFullscreenOnFirstTap(): void {
  const go = () => {
    requestGameFullscreen()
    window.removeEventListener('pointerdown', go)
    window.removeEventListener('touchend', go)
  }
  window.addEventListener('pointerdown', go, { once: true })
  window.addEventListener('touchend', go, { once: true })
}

export function onFullscreenChange(fn: () => void): () => void {
  const events = ['fullscreenchange', 'webkitfullscreenchange'] as const
  for (const ev of events) document.addEventListener(ev, fn)
  return () => {
    for (const ev of events) document.removeEventListener(ev, fn)
  }
}

export function addFullscreenBadge(scene: Phaser.Scene): void {
  const x = GAME_WIDTH - 28
  const y = GAME_HEIGHT - 28
  const icon = scene.add.graphics().setDepth(610)
  const hit = scene.add.rectangle(x, y, 44, 44, 0x000000, 0).setDepth(611).setInteractive({ useHandCursor: true })
  let color = 0xfff4e0

  const paint = () => {
    icon.clear()
    drawFullscreenIcon(icon, x, y, 20, 0x1a1410, 7, isGameFullscreen())
    drawFullscreenIcon(icon, x, y, 20, color, 3.5, isGameFullscreen())
  }

  hit.on('pointerover', () => {
    color = 0xffe14a
    paint()
  })
  hit.on('pointerout', () => {
    color = 0xfff4e0
    paint()
  })
  hit.on('pointerdown', (p: Phaser.Input.Pointer) => p.event?.stopPropagation())
  hit.on('pointerup', () => toggleGameFullscreen())

  const off = onFullscreenChange(paint)
  scene.events.once(Phaser.Scenes.Events.SHUTDOWN, off)
  paint()
}

function drawFullscreenIcon(
  g: Phaser.GameObjects.Graphics,
  cx: number,
  cy: number,
  size: number,
  color: number,
  width: number,
  exit: boolean,
): void {
  const a = size / 2
  const arm = size * 0.4
  const inset = exit ? arm : 0
  const out = exit ? 0 : arm
  g.lineStyle(width, color, 1)
  const corner = (hx: number, hy: number) => {
    g.beginPath()
    g.moveTo(cx + hx * (a - out), cy + hy * (a - inset))
    g.lineTo(cx + hx * (a - inset), cy + hy * (a - inset))
    g.lineTo(cx + hx * (a - inset), cy + hy * (a - out))
    g.strokePath()
  }
  corner(-1, -1)
  corner(1, -1)
  corner(-1, 1)
  corner(1, 1)
}
