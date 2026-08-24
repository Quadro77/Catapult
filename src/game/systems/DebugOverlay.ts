import { GAME_WIDTH, POUCH_HIT_R } from '../config.ts'
import type { Occupancy } from '../occupancy.ts'
import type { Building } from './Building.ts'
import type { Projectile } from './Projectile.ts'
import type { Slingshot } from './Slingshot.ts'

export class DebugOverlay {
  enabled = false
  private gfx: Phaser.GameObjects.Graphics
  private label: Phaser.GameObjects.Text
  private building: Building
  private occupancy: Occupancy
  private sling: Slingshot
  private projectile: Projectile

  constructor(
    scene: Phaser.Scene,
    building: Building,
    occupancy: Occupancy,
    sling: Slingshot,
    projectile: Projectile,
  ) {
    this.building = building
    this.occupancy = occupancy
    this.sling = sling
    this.projectile = projectile
    this.gfx = scene.add.graphics().setDepth(500)
    this.label = scene.add
      .text(GAME_WIDTH / 2, 8, 'DEBUG  ·  press D to hide', {
        fontFamily: 'Nunito, system-ui',
        fontSize: '14px',
        color: '#fff4e0',
        backgroundColor: '#1a1410',
        padding: { x: 8, y: 4 },
      })
      .setOrigin(0.5, 0)
      .setDepth(501)
      .setVisible(false)
    this.gfx.setVisible(false)
    scene.input.keyboard?.on('keydown-D', () => this.toggle())
  }

  toggle(): void {
    this.enabled = !this.enabled
    this.gfx.setVisible(this.enabled)
    this.label.setVisible(this.enabled)
    if (this.enabled) this.draw()
  }

  draw(): void {
    if (!this.enabled) return
    const g = this.gfx
    g.clear()

    g.lineStyle(2, 0x3dff7a, 0.95)
    g.lineBetween(0, this.building.groundY, GAME_WIDTH, this.building.groundY)
    g.fillStyle(0x3dff7a, 0.12)
    g.fillRect(0, this.building.groundY, GAME_WIDTH, 4)

    g.lineStyle(2, 0xff3d6e, 0.95)
    g.lineBetween(this.building.wallRight, this.building.wallTop, this.building.wallRight, this.building.groundY)
    g.lineBetween(0, this.building.wallTop, this.building.wallRight, this.building.wallTop)

    g.lineStyle(2, 0x4dc3ff, 0.95)
    for (const slot of this.building.windows) {
      g.strokeRect(slot.x, slot.y, slot.w, slot.h)
      if (this.occupancy.window(slot.id)?.occupant) {
        g.fillStyle(0x4dc3ff, 0.2)
        g.fillRect(slot.x, slot.y, slot.w, slot.h)
      }
    }

    g.lineStyle(2, 0xffc14d, 0.95)
    g.strokeCircle(this.sling.pouch.x, this.sling.pouch.y, POUCH_HIT_R)
    g.fillStyle(0xffc14d, 0.15)
    g.fillCircle(this.sling.pouch.x, this.sling.pouch.y, POUCH_HIT_R)

    g.lineStyle(2, 0xff7a18, 1)
    g.strokeCircle(this.projectile.x, this.projectile.y, 12)
  }
}
