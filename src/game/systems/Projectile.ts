import type { Loadout } from '../loadout.ts'
import { hasTex } from './chroma.ts'

export class Projectile {
  readonly sprite: Phaser.Physics.Arcade.Image
  resolved = false
  private ready: Loadout

  constructor(scene: Phaser.Scene, ready: Loadout, x: number, y: number) {
    this.ready = ready
    this.sprite = scene.physics.add.image(x, y, 'cat')
    this.sprite.setDepth(20)
    this.showIdle()
    const body = this.sprite.body as Phaser.Physics.Arcade.Body
    body.setAllowGravity(false)
    body.setCircle(18, 14, 14)
    body.setBounce(0)
    this.sprite.setDrag(ready.drag)
  }

  launch(x: number, y: number, vx: number, vy: number): void {
    this.resolved = false
    this.sprite.setVisible(true)
    this.sprite.setAlpha(1)
    this.sprite.setScale(1)
    this.sprite.setRotation(0)
    this.sprite.setPosition(x, y)
    this.paint()
    if (hasTex(this.sprite.scene, 'cat-fly')) {
      this.sprite.setTexture('cat-fly')
      const fly = Math.round(this.ready.radius * 3.5)
      this.sprite.setDisplaySize(fly, Math.round(fly * 0.74))
    }
    const body = this.sprite.body as Phaser.Physics.Arcade.Body
    body.enable = true
    body.setAllowGravity(true)
    body.setVelocity(vx / this.ready.mass, vy / this.ready.mass)
  }

  park(x: number, y: number): void {
    this.resolved = false
    const body = this.sprite.body as Phaser.Physics.Arcade.Body
    body.setVelocity(0, 0)
    body.setAllowGravity(false)
    body.enable = false
    this.sprite.setVisible(true)
    this.sprite.setAlpha(1)
    this.sprite.setScale(1)
    this.sprite.setRotation(0)
    this.showIdle()
    this.sprite.setPosition(x, y)
  }

  freeze(): void {
    const body = this.sprite.body as Phaser.Physics.Arcade.Body
    body.setVelocity(0, 0)
    body.setAllowGravity(false)
    body.enable = false
  }

  follow(x: number, y: number, stretch: number): void {
    if (this.sprite.texture.key !== 'cat') this.showIdle()
    this.sprite.setPosition(x, y)
    const stretchAmt = Math.min(stretch / 220, 0.2)
    this.sprite.setScale(this.idleScale * (1 + stretchAmt), this.idleScale * (1 / (1 + stretchAmt * 0.5)))
    this.sprite.setRotation(0)
  }

  pointAlongVelocity(): void {
    const body = this.sprite.body as Phaser.Physics.Arcade.Body
    this.sprite.setRotation(Math.atan2(body.velocity.y, body.velocity.x))
  }

  private idleScale = 1

  private showIdle(): void {
    this.sprite.setTexture('cat')
    const size = Math.round(this.ready.radius * 3.18)
    this.sprite.setDisplaySize(size, size)
    this.paint()
    this.idleScale = this.sprite.scaleX
  }

  private paint(): void {
    if (this.ready.color === 0xf28c28) this.sprite.clearTint()
    else this.sprite.setTint(this.ready.color)
  }

  get x(): number {
    return this.sprite.x
  }

  get y(): number {
    return this.sprite.y
  }
}
