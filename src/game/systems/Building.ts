import type { LevelSpace, ScreenWindow } from '../geometry.ts'
import type { OccupantId } from '../types.ts'
import { fitImage, hasTex } from './chroma.ts'

export type WindowView = ScreenWindow & {
  interior: Phaser.GameObjects.Rectangle
  occupantView: Phaser.GameObjects.Image
}

export class Building {
  readonly windows: WindowView[] = []
  readonly rect: Phaser.Geom.Rectangle
  groundY: number
  wallRight: number
  wallTop: number
  private scene: Phaser.Scene
  private onHideDone: (id: string) => boolean
  private bgKey: string

  constructor(
    scene: Phaser.Scene,
    space: LevelSpace,
    onHideDone: (id: string) => boolean = () => true,
    bgKey = 'bg-building',
  ) {
    this.scene = scene
    this.onHideDone = onHideDone
    this.bgKey = bgKey
    const b = space.building
    this.rect = new Phaser.Geom.Rectangle(b.x, b.y, b.w, b.h)
    this.groundY = space.groundY
    this.wallRight = space.wallRight
    this.wallTop = space.wallTop
    if (hasTex(scene, bgKey)) {
      const bg = scene.add.image(640, 360, bgKey).setDepth(1)
      bg.setDisplaySize(1280, 720)
    } else {
      this.drawFacade(b.x, b.y, b.w, b.h)
    }
    const painted = hasTex(scene, bgKey)
    for (const win of space.windows) {
      this.windows.push(this.makeWindow(win, painted))
    }
  }

  view(id: string): WindowView | undefined {
    return this.windows.find((w) => w.id === id)
  }

  show(id: string, occupant: OccupantId): void {
    const slot = this.view(id)
    if (!slot) return
    slot.interior.setFillStyle(0xf2d36b, 0)
    slot.occupantView.setTexture(occupant === 'dogCatcher' ? 'catcher' : 'lady')
    slot.occupantView.clearTint()
    slot.occupantView.setOrigin(0.5, 1)
    this.fitOccupant(slot)
    slot.occupantView.setVisible(true)
    slot.occupantView.setAlpha(1)
    slot.occupantView.y = slot.y + slot.h + 24
    this.scene.tweens.add({
      targets: slot.occupantView,
      y: slot.y + slot.h - 2,
      duration: 180,
      ease: 'Back.out',
    })
  }

  hide(id: string): void {
    const slot = this.view(id)
    if (!slot) return
    this.scene.tweens.add({
      targets: slot.occupantView,
      y: slot.y + slot.h + 24,
      duration: 160,
      ease: 'Quad.in',
      onComplete: () => {
        if (!this.onHideDone(id)) return
        slot.occupantView.setVisible(false)
        slot.interior.setFillStyle(0x3a2418, hasTex(this.scene, this.bgKey) ? 0 : 1)
      },
    })
  }

  flashCatch(id: string): void {
    const slot = this.view(id)
    if (!slot) return
    this.scene.tweens.killTweensOf(slot.occupantView)
    slot.occupantView.setVisible(true)
    slot.occupantView.setAlpha(1)
    slot.occupantView.setOrigin(0.5, 1)
    slot.occupantView.y = slot.y + slot.h - 2
    slot.interior.setFillStyle(0xfff4b0, 0)
    if (hasTex(this.scene, 'lady-celebrate')) {
      slot.occupantView.setTexture('lady-celebrate')
      this.fitOccupant(slot)
      slot.occupantView.setScale(slot.occupantView.scaleX * 0.8, slot.occupantView.scaleY * 0.8)
    }
  }

  flashCatcher(id: string): void {
    const slot = this.view(id)
    if (!slot) return
    this.scene.tweens.killTweensOf(slot.occupantView)
    slot.occupantView.setVisible(true)
    slot.occupantView.setAlpha(1)
    slot.occupantView.setOrigin(0.5, 1)
    slot.occupantView.y = slot.y + slot.h - 2
    slot.interior.setFillStyle(0x4a5a28, 0)
    const pose = hasTex(this.scene, 'catcher-gotcha') ? 'catcher-gotcha' : 'catcher'
    slot.occupantView.setTexture(pose)
    slot.occupantView.clearTint()
    this.fitOccupant(slot)
  }

  unlock(id: string): void {
    const slot = this.view(id)
    if (!slot) return
    slot.occupantView.setTexture('lady')
    this.fitOccupant(slot)
    slot.occupantView.setVisible(false)
    slot.interior.setFillStyle(0x3a2418, hasTex(this.scene, this.bgKey) ? 0 : 1)
  }

  private fitOccupant(slot: WindowView): void {
    fitImage(slot.occupantView, slot.w * 1.05, slot.h * 1.35)
  }

  private makeWindow(win: ScreenWindow, painted: boolean): WindowView {
    const { x, y, w, h } = win
    if (!painted) {
      this.scene.add.rectangle(x + w / 2, y + h / 2, w + 14, h + 14, 0x2f5a38).setDepth(4)
    }
    const interior = this.scene.add
      .rectangle(x + w / 2, y + h / 2, w, h, 0x3a2418, painted ? 0 : 1)
      .setDepth(5)
    const occupantView = this.scene.add.image(x + w / 2, y + h, 'lady').setDepth(7).setVisible(false)
    occupantView.setOrigin(0.5, 1)
    fitImage(occupantView, w * 1.05, h * 1.35)
    return { ...win, interior, occupantView }
  }

  private drawFacade(x: number, y: number, w: number, h: number): void {
    const g = this.scene.add.graphics().setDepth(3)
    g.fillStyle(0x3a2a22)
    g.fillRect(x - 18, y + 12, 22, h)
    g.fillStyle(0xe8d2a8)
    g.fillRect(x, y, w, h)
    g.fillStyle(0xd4bc90)
    for (let row = y + 18; row < y + h - 20; row += 22) {
      g.fillRect(x + 8, row, w - 16, 1)
    }
    g.fillStyle(0xc4a878)
    g.fillRect(x, y, w, 16)
    g.fillRect(x - 8, y - 14, w + 16, 18)
    g.fillStyle(0x8a6a44)
    g.fillRect(x + w * 0.42, y + h - 70, 72, 70)
    g.fillStyle(0x3a2418)
    g.fillRect(x + w * 0.42 + 10, y + h - 52, 22, 52)
    g.fillStyle(0x6a6a72)
    g.lineStyle(3, 0x4a4a52)
    const fx = x + w - 28
    for (let i = 0; i < 5; i += 1) {
      const fy = y + 70 + i * 90
      g.strokeRect(fx - 18, fy, 40, 70)
      g.lineBetween(fx - 18, fy + 35, fx + 22, fy + 35)
    }
    g.fillStyle(0xb8b0a4)
    g.fillRect(0, this.groundY, 1280, 720 - this.groundY)
    g.fillStyle(0x6a6a72)
    g.fillRect(0, this.groundY + 18, 1280, 720 - this.groundY)
    g.fillStyle(0xe23d28)
    g.fillRect(118, this.groundY - 36, 18, 36)
    g.fillRect(112, this.groundY - 44, 30, 10)
    g.fillStyle(0xf0c040)
    g.fillCircle(127, this.groundY - 28, 3)
  }
}
