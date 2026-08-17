import type { LevelDef, OccupantInstance, WindowDef } from '../types.ts'
import { fitImage, hasTex } from './chroma.ts'

export type WindowSlot = {
  id: string
  floor: number
  bay: number
  x: number
  y: number
  w: number
  h: number
  occupant: OccupantInstance | null
  locked: boolean
  hiding: boolean
  interior: Phaser.GameObjects.Rectangle
  occupantView: Phaser.GameObjects.Image
}

export class Building {
  readonly windows: WindowSlot[] = []
  readonly rect: Phaser.Geom.Rectangle
  groundY: number
  wallRight: number
  wallTop: number
  private scene: Phaser.Scene

  constructor(scene: Phaser.Scene, level: LevelDef) {
    this.scene = scene
    const b = level.building
    this.rect = new Phaser.Geom.Rectangle(b.x, b.y, b.w, b.h)
    this.groundY = level.bounds.groundY
    this.wallRight = level.bounds.wallRight
    this.wallTop = level.bounds.wallTop
    if (hasTex(scene, 'bg-building')) {
      const bg = scene.add.image(640, 360, 'bg-building').setDepth(1)
      bg.setDisplaySize(1280, 720)
    } else {
      this.drawFacade(b.x, b.y, b.w, b.h)
    }
    const defs = b.windows ?? this.layoutWindows(b.floors, b.bays, b.x, b.y, b.w, b.h)
    for (const def of defs) {
      this.windows.push(this.makeWindow(def, hasTex(scene, 'bg-building')))
    }
  }

  hitTest(x: number, y: number): { kind: 'window'; slot: WindowSlot } | { kind: 'wall' } | null {
    for (const slot of this.windows) {
      if (!slot.occupant || slot.locked) continue
      if (x >= slot.x && x <= slot.x + slot.w && y >= slot.y && y <= slot.y + slot.h) {
        return { kind: 'window', slot }
      }
    }
    if (x >= this.wallRight && y >= this.wallTop && y < this.groundY) {
      return { kind: 'wall' }
    }
    return null
  }

  showOccupant(slot: WindowSlot, occupant: OccupantInstance): void {
    slot.occupant = occupant
    slot.hiding = false
    slot.interior.setFillStyle(0xf2d36b, 0)
    slot.occupantView.setTexture(occupant.defId === 'dogCatcher' ? 'catcher' : 'lady')
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

  hideOccupant(slot: WindowSlot): void {
    if (slot.hiding || !slot.occupant) return
    slot.hiding = true
    const leaving = slot.occupant
    this.scene.tweens.add({
      targets: slot.occupantView,
      y: slot.y + slot.h + 24,
      duration: 160,
      ease: 'Quad.in',
      onComplete: () => {
        if (slot.occupant === leaving) {
          slot.occupant = null
          slot.hiding = false
        }
        if (!slot.occupant) {
          slot.occupantView.setVisible(false)
          if (!slot.locked) slot.interior.setFillStyle(0x3a2418, hasTex(this.scene, 'bg-building') ? 0 : 1)
        }
      },
    })
  }

  flashCatch(slot: WindowSlot): void {
    slot.locked = true
    slot.hiding = false
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

  flashCatcher(slot: WindowSlot): void {
    slot.locked = true
    slot.hiding = false
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

  unlock(slot: WindowSlot): void {
    slot.locked = false
    slot.hiding = false
    slot.occupant = null
    slot.occupantView.setTexture('lady')
    this.fitOccupant(slot)
    slot.occupantView.setVisible(false)
    slot.interior.setFillStyle(0x3a2418, hasTex(this.scene, 'bg-building') ? 0 : 1)
  }

  private fitOccupant(slot: WindowSlot): void {
    fitImage(slot.occupantView, slot.w * 1.05, slot.h * 1.35)
  }

  private layoutWindows(
    floors: number,
    bays: number,
    x: number,
    y: number,
    w: number,
    h: number,
  ): WindowDef[] {
    const padX = 58
    const padTop = 52
    const padBot = 78
    const gapX = 30
    const gapY = 26
    const cellW = (w - padX * 2 - gapX * (bays - 1)) / bays
    const cellH = (h - padTop - padBot - gapY * (floors - 1)) / floors
    const out: WindowDef[] = []
    for (let floor = 0; floor < floors; floor += 1) {
      for (let bay = 0; bay < bays; bay += 1) {
        const wx = x + padX + bay * (cellW + gapX)
        const wy = y + padTop + floor * (cellH + gapY)
        out.push({
          id: `f${floor}b${bay}`,
          nx: (wx - x) / w,
          ny: (wy - y) / h,
          nw: cellW / w,
          nh: cellH / h,
        })
      }
    }
    return out
  }

  private makeWindow(def: WindowDef, painted: boolean): WindowSlot {
    const x = this.rect.x + def.nx * this.rect.width
    const y = this.rect.y + def.ny * this.rect.height
    const w = def.nw * this.rect.width
    const h = def.nh * this.rect.height
    const parts = def.id.match(/f(\d+)b(\d+)/)
    const floor = parts ? Number(parts[1]) : 0
    const bay = parts ? Number(parts[2]) : 0
    if (!painted) {
      this.scene.add.rectangle(x + w / 2, y + h / 2, w + 14, h + 14, 0x2f5a38).setDepth(4)
    }
    const interior = this.scene.add
      .rectangle(x + w / 2, y + h / 2, w, h, 0x3a2418, painted ? 0 : 1)
      .setDepth(5)
    const occupantView = this.scene.add.image(x + w / 2, y + h, 'lady').setDepth(7).setVisible(false)
    occupantView.setOrigin(0.5, 1)
    fitImage(occupantView, w * 1.05, h * 1.35)
    return {
      id: def.id,
      floor,
      bay,
      x,
      y,
      w,
      h,
      occupant: null,
      locked: false,
      hiding: false,
      interior,
      occupantView,
    }
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
