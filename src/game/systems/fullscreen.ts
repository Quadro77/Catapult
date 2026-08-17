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
  const mark = scene.add
    .text(GAME_WIDTH - 16, GAME_HEIGHT - 14, '', {
      fontFamily: 'Bangers, system-ui',
      fontSize: '26px',
      color: '#fff4e0',
      stroke: '#1a1410',
      strokeThickness: 6,
      padding: { x: 12, y: 8 },
    })
    .setOrigin(1, 1)
    .setAngle(-7)
    .setDepth(610)
    .setInteractive({ useHandCursor: true })

  const sync = () => {
    mark.setText(isGameFullscreen() ? 'BACK' : 'FULL')
  }

  mark.on('pointerover', () => mark.setColor('#ffe14a'))
  mark.on('pointerout', () => mark.setColor('#fff4e0'))
  mark.on('pointerdown', (p: Phaser.Input.Pointer) => p.event?.stopPropagation())
  mark.on('pointerup', () => toggleGameFullscreen())

  const off = onFullscreenChange(sync)
  scene.events.once(Phaser.Scenes.Events.SHUTDOWN, off)
  sync()
}
