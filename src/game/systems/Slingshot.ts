import { GHOST_DOTS, MIN_PULL, POUCH_HIT_R } from '../config.ts'
import type { CatapultMods, LevelDef } from '../types.ts'
import { fitImage, texKey } from './chroma.ts'

export class Slingshot {
  readonly origin: Phaser.Math.Vector2
  pouch: Phaser.Math.Vector2
  pulling = false
  private scene: Phaser.Scene
  private maxPull: number
  private power: number
  private gravity: number
  private ghostT: number
  private frame: Phaser.GameObjects.Graphics
  private bands: Phaser.GameObjects.Graphics
  private ghost: Phaser.GameObjects.Graphics
  private pouchView: Phaser.GameObjects.Arc
  private leftFork: Phaser.Math.Vector2
  private rightFork: Phaser.Math.Vector2

  constructor(scene: Phaser.Scene, level: LevelDef, mods: CatapultMods) {
    this.scene = scene
    this.origin = new Phaser.Math.Vector2(level.slingshot.origin.x, level.slingshot.origin.y)
    this.pouch = this.origin.clone()
    this.maxPull = level.slingshot.maxPull * mods.maxPull
    this.power = level.slingshot.power * mods.power
    this.gravity = level.slingshot.gravity
    this.ghostT = level.slingshot.ghostT * mods.ghostT
    this.leftFork = new Phaser.Math.Vector2(this.origin.x - 28, this.origin.y - 96)
    this.rightFork = new Phaser.Math.Vector2(this.origin.x + 28, this.origin.y - 96)
    this.frame = scene.add.graphics().setDepth(15)
    this.bands = scene.add.graphics().setDepth(18)
    this.ghost = scene.add.graphics().setDepth(14)
    const slingKey = texKey(scene, 'slingshot')
    if (slingKey) {
      const groundY = level.bounds.groundY
      const prop = scene.add.image(this.origin.x, groundY, slingKey).setDepth(15)
      prop.setOrigin(0.5, 1)
      fitImage(prop, 200, 320)
      const top = groundY - prop.displayHeight
      const cx = this.origin.x
      this.leftFork.set(cx - prop.displayWidth * 0.3, top + prop.displayHeight * 0.035)
      this.rightFork.set(cx + prop.displayWidth * 0.3, top + prop.displayHeight * 0.035)
      this.origin.set((this.leftFork.x + this.rightFork.x) / 2, this.leftFork.y)
      this.pouch.copy(this.origin)
    } else {
      this.drawFrame()
      this.drawShooter()
    }
    this.pouchView = scene.add.circle(this.origin.x, this.origin.y, 14, 0x6a4020).setDepth(19)
  }

  contains(x: number, y: number): boolean {
    return Phaser.Math.Distance.Between(x, y, this.pouch.x, this.pouch.y) <= POUCH_HIT_R
  }

  beginPull(): void {
    this.pulling = true
  }

  dragTo(x: number, y: number): void {
    const dx = x - this.origin.x
    const dy = y - this.origin.y
    const len = Math.hypot(dx, dy)
    const scale = len > this.maxPull ? this.maxPull / len : 1
    this.pouch.set(this.origin.x + dx * scale, this.origin.y + dy * scale)
  }

  release(): { vx: number; vy: number } | null {
    this.pulling = false
    const pull = this.pullLength()
    if (pull < MIN_PULL) {
      this.snapBack()
      return null
    }
    const vx = (this.origin.x - this.pouch.x) * this.power
    const vy = (this.origin.y - this.pouch.y) * this.power
    this.snapBack()
    return { vx, vy }
  }

  cancel(): void {
    this.pulling = false
    this.snapBack()
  }

  pullLength(): number {
    return Phaser.Math.Distance.Between(this.origin.x, this.origin.y, this.pouch.x, this.pouch.y)
  }

  atMaxPull(): boolean {
    return this.pullLength() >= this.maxPull - 0.5
  }

  draw(): void {
    this.pouchView.setPosition(this.pouch.x, this.pouch.y)
    this.bands.clear()
    this.bands.lineStyle(7, 0x3a2415)
    this.bands.beginPath()
    this.bands.moveTo(this.leftFork.x, this.leftFork.y)
    this.bands.lineTo(this.pouch.x, this.pouch.y)
    this.bands.moveTo(this.rightFork.x, this.rightFork.y)
    this.bands.lineTo(this.pouch.x, this.pouch.y)
    this.bands.strokePath()
    this.ghost.clear()
    if (!this.pulling || this.pullLength() < MIN_PULL) return
    const vx = (this.origin.x - this.pouch.x) * this.power
    const vy = (this.origin.y - this.pouch.y) * this.power
    const horizon = 1.15 * this.ghostT
    for (let i = 1; i <= GHOST_DOTS; i += 1) {
      const t = (horizon * i) / GHOST_DOTS
      const x = this.origin.x + vx * t
      const y = this.origin.y + vy * t + 0.5 * this.gravity * t * t
      const r = 5 - i * 0.45
      this.ghost.fillStyle(0xfff4e0, 0.85 - i * 0.12)
      this.ghost.fillCircle(x, y, r)
    }
  }

  private snapBack(): void {
    this.scene.tweens.add({
      targets: this.pouch,
      x: this.origin.x,
      y: this.origin.y,
      duration: 90,
      ease: 'Back.out',
    })
  }

  private drawFrame(): void {
    const g = this.frame
    const o = this.origin
    g.fillStyle(0x6a4020)
    g.fillTriangle(o.x - 10, o.y + 18, o.x + 10, o.y + 18, this.leftFork.x + 4, this.leftFork.y + 8)
    g.fillTriangle(o.x - 10, o.y + 18, o.x + 10, o.y + 18, this.rightFork.x - 4, this.rightFork.y + 8)
    g.fillStyle(0x8a5a30)
    g.fillRect(o.x - 14, o.y + 10, 28, 54)
    g.fillStyle(0x4a4a52)
    g.fillRect(o.x - 28, o.y + 58, 56, 12)
    g.fillCircle(o.x - 22, o.y + 70, 8)
    g.fillCircle(o.x + 22, o.y + 70, 8)
    g.fillStyle(0xc8b060)
    g.fillCircle(this.leftFork.x, this.leftFork.y, 5)
    g.fillCircle(this.rightFork.x, this.rightFork.y, 5)
  }

  private drawShooter(): void {
    const s = this.scene.add.graphics().setDepth(12)
    const x = this.origin.x - 54
    const y = this.origin.y + 28
    s.fillStyle(0xf7d2b8)
    s.fillCircle(x, y - 28, 14)
    s.fillStyle(0x3a5aaa)
    s.fillRoundedRect(x - 12, y - 16, 24, 28, 6)
    s.fillStyle(0x2a2a32)
    s.fillRect(x - 10, y + 10, 8, 18)
    s.fillRect(x + 2, y + 10, 8, 18)
    s.fillStyle(0x1a1208)
    s.fillCircle(x - 5, y - 30, 2)
    s.fillCircle(x + 5, y - 30, 2)
    s.fillStyle(0xe23d28)
    s.fillCircle(x, y - 22, 2)
  }
}
