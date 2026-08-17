import { GAME_WIDTH, RESULT_MS } from '../config.ts'
import { DEFAULT_CAT } from '../data/cats.ts'
import { loadLevel } from '../data/layout.ts'
import { DEFAULT_MODS } from '../data/upgrades.ts'
import { hasTex } from '../systems/chroma.ts'
import { Building } from '../systems/Building.ts'
import { Director } from '../systems/Director.ts'
import { getHighScore, recordHighScore } from '../systems/highScore.ts'
import { Hud } from '../systems/Hud.ts'
import { Projectile } from '../systems/Projectile.ts'
import { checkOutcome } from '../systems/Resolve.ts'
import { DebugOverlay } from '../systems/DebugOverlay.ts'
import { playMusic, playSfx, stopAllMusic, stopSfx, unlockAnd } from '../systems/Audio.ts'
import { addFullscreenBadge } from '../systems/fullscreen.ts'
import { addSettingsCog } from '../systems/SettingsMenu.ts'
import { Slingshot } from '../systems/Slingshot.ts'
import type { LevelDef, Outcome, PlayState } from '../types.ts'

export class PlayScene extends Phaser.Scene {
  private level!: LevelDef
  private building!: Building
  private director!: Director
  private sling!: Slingshot
  private projectile!: Projectile
  private hud!: Hud
  private debug!: DebugOverlay
  private state: PlayState = 'idle'
  private score = 0
  private startBest = 0
  private lives = 3
  private anger = 0
  private beforePause: PlayState = 'idle'
  private pauseLayer: Phaser.GameObjects.Container | null = null
  private hitMaxPull = false

  constructor() {
    super({ key: 'Play' })
  }

  create(): void {
    this.level = loadLevel()
    this.score = 0
    this.startBest = getHighScore()
    this.lives = this.level.lives
    this.state = 'idle'
    this.physics.world.gravity.y = this.level.slingshot.gravity
    this.drawSky()
    this.building = new Building(this, this.level)
    this.anger = 0
    this.director = new Director(
      this.building,
      this.level,
      () => playSfx(this, 'sfx-pop', 0.7),
      () => this.missLady(),
    )
    unlockAnd(this, () => playMusic(this, 'music-play', 0.32))
    this.sling = new Slingshot(this, this.level, { ...DEFAULT_MODS })
    this.projectile = new Projectile(this, DEFAULT_CAT, this.sling.origin.x, this.sling.origin.y)
    this.projectile.park(this.sling.origin.x, this.sling.origin.y)
    this.hud = new Hud(this, this.lives, this.level.angerLimit || 3)
    this.hud.setScore(0)
    this.debug = new DebugOverlay(this, this.building, this.sling, this.projectile)
    addSettingsCog(this, { musicKey: 'music-play', musicVol: 0.32, musicLoop: true })
    addFullscreenBadge(this)
    this.bindInput()
    this.bindPause()
  }

  update(_time: number, dt: number): void {
    if (this.state === 'paused' || this.state === 'over') return
    this.director.update(dt)
    this.sling.draw()
    this.debug.draw()
    if (this.state === 'aiming' || this.state === 'idle') {
      const stretch = this.sling.pullLength()
      this.projectile.follow(this.sling.pouch.x, this.sling.pouch.y, stretch)
    }
    if (this.state === 'aiming' && this.sling.atMaxPull()) this.hitMaxPull = true
    if (this.state === 'flight') {
      this.projectile.pointAlongVelocity()
      const outcome = checkOutcome(this.projectile, this.building)
      if (outcome) this.applyOutcome(outcome)
    }
  }

  private bindInput(): void {
    this.input.on('pointerdown', (p: Phaser.Input.Pointer) => {
      if (this.state === 'paused') return
      if (this.state !== 'idle') return
      if (!this.sling.contains(p.worldX, p.worldY)) return
      this.state = 'aiming'
      this.hitMaxPull = false
      this.sling.beginPull()
      playSfx(this, 'sfx-pull', 0.7)
      this.sling.dragTo(p.worldX, p.worldY)
    })
    this.input.on('pointermove', (p: Phaser.Input.Pointer) => {
      if (this.state !== 'aiming') return
      this.sling.dragTo(p.worldX, p.worldY)
    })
    this.input.on('pointerup', () => this.release())
    this.input.on('pointerupoutside', () => this.release())
  }

  private release(): void {
    if (this.state !== 'aiming') return
    stopSfx(this, 'sfx-pull')
    const full = this.hitMaxPull
    const launch = this.sling.release()
    if (!launch) {
      this.state = 'idle'
      this.hitMaxPull = false
      return
    }
    this.state = 'flight'
    playSfx(this, 'sfx-launch', 0.85)
    if (full) this.time.delayedCall(100, () => playSfx(this, 'sfx-whip', 0.9))
    this.hitMaxPull = false
    this.projectile.launch(this.sling.origin.x, this.sling.origin.y, launch.vx, launch.vy)
  }

  private applyOutcome(outcome: Outcome): void {
    this.time.paused = false
    this.physics.world.resume()
    this.projectile.resolved = true
    this.projectile.freeze()
    this.state = 'resolving'
    if (outcome.kind === 'catch') {
      const slot = this.building.windows.find((w) => w.id === outcome.windowId)
      if (slot) this.building.flashCatch(slot)
      this.score += 1
      recordHighScore(this.score)
      this.hud.setScore(this.score)
      this.anger = Math.max(0, this.anger - 1)
      this.hud.setAnger(this.anger)
      const every = this.level.bonusEvery
      if (every > 0 && this.score % every === 0) {
        this.lives += 1
        this.hud.setLives(this.lives)
        playSfx(this, 'sfx-bonus')
        this.hud.shout(this, 'EXTRA LIFE!', '#ffe14a', this.projectile.x, this.projectile.y - 20)
      } else {
        playSfx(this, 'sfx-catch')
        this.hud.shout(this, 'YOO-HOO!', '#2d8a2d', this.projectile.x, this.projectile.y - 20)
      }
      this.tweens.killTweensOf(this.projectile.sprite)
      this.tweens.add({
        targets: this.projectile.sprite,
        x: slot ? slot.x + slot.w / 2 : this.projectile.x,
        y: slot ? slot.y + slot.h / 2 : this.projectile.y,
        scaleX: 0.2,
        scaleY: 0.2,
        alpha: 0,
        duration: 280,
        ease: 'Back.in',
      })
      this.time.delayedCall(RESULT_MS, () => {
        if (slot) this.building.unlock(slot)
        this.reload()
      })
      return
    }
    if (outcome.kind === 'catcher') {
      const slot = this.building.windows.find((w) => w.id === outcome.windowId)
      if (slot) this.building.flashCatcher(slot)
      this.score = Math.max(0, this.score - 1)
      this.hud.setScore(this.score)
      playSfx(this, 'sfx-catcher')
      this.hud.shout(this, 'GOTCHA!', '#c45a12', this.projectile.x, this.projectile.y - 20)
      this.projectile.sprite.setVisible(false)
      this.time.delayedCall(RESULT_MS, () => {
        if (slot) this.building.unlock(slot)
        this.reload()
      })
      return
    }
    this.loseLife(false)
    playSfx(this, 'sfx-splat')
    this.hud.shout(this, 'SPLAT!', '#e23d28', this.projectile.x, this.projectile.y - 10)
    this.cameras.main.shake(160, 0.008)
    const burst = this.add.image(this.projectile.x, this.projectile.y, 'burst').setDepth(21)
    this.tweens.add({ targets: burst, scale: 1.6, alpha: 0, duration: 360, onComplete: () => burst.destroy() })
    const spr = this.projectile.sprite
    spr.setRotation(0)
    const tall = outcome.reason === 'wall' || (outcome.reason === 'bounds' && (this.projectile.x < 0 || this.projectile.x > GAME_WIDTH))
    this.tweens.add({
      targets: spr,
      scaleX: tall ? spr.scaleX : spr.scaleX * 2,
      scaleY: tall ? spr.scaleY * 2 : spr.scaleY,
      duration: 120,
      onComplete: () => {
        this.tweens.add({
          targets: spr,
          alpha: 0,
          duration: 420,
        })
      },
    })
    this.time.delayedCall(RESULT_MS, () => this.afterFail())
  }

  private missLady(): void {
    if (this.state === 'paused' || this.state === 'over' || this.state === 'resolving') return
    const limit = this.level.angerLimit || 3
    this.anger += 1
    this.hud.setAnger(this.anger)
    if (this.anger < limit) return
    this.anger = 0
    this.hud.setAnger(0)
    this.loseLife()
    this.hud.shout(this, 'SHE IS FURIOUS!', '#e23d28', GAME_WIDTH / 2, 220)
    this.afterFail()
  }

  private bindPause(): void {
    const onEsc = (e: KeyboardEvent) => {
      if (e.key !== 'Escape') return
      e.preventDefault()
      this.togglePause()
    }
    window.addEventListener('keydown', onEsc)
    this.events.once(Phaser.Scenes.Events.SHUTDOWN, () => window.removeEventListener('keydown', onEsc))
  }

  private togglePause(): void {
    if (this.state === 'over') return
    if (this.state === 'paused') {
      this.resumeGame()
      return
    }
    if (this.state === 'aiming') {
      stopSfx(this, 'sfx-pull')
      this.sling.cancel()
    }
    this.beforePause = this.state === 'aiming' ? 'idle' : this.state
    this.state = 'paused'
    this.physics.world.pause()
    this.tweens.pauseAll()
    this.time.paused = true
    const dim = this.add.rectangle(GAME_WIDTH / 2, 360, GAME_WIDTH, 720, 0x1a1410, 0.62).setDepth(550)
    const title = this.add
      .text(GAME_WIDTH / 2, 250, 'PAUSED', {
        fontFamily: 'Bangers, system-ui',
        fontSize: '72px',
        color: '#fff4e0',
        stroke: '#1a1410',
        strokeThickness: 8,
        padding: { x: 16, y: 10 },
      })
      .setOrigin(0.5)
      .setDepth(551)
    const resume = this.add.rectangle(GAME_WIDTH / 2, 380, 240, 72, 0x2d8a2d).setDepth(551).setInteractive({ useHandCursor: true })
    resume.setStrokeStyle(5, 0xfff4e0)
    const resumeTxt = this.add
      .text(GAME_WIDTH / 2, 380, 'RESUME', {
        fontFamily: 'Bangers, system-ui',
        fontSize: '36px',
        color: '#fff4e0',
        padding: { x: 10, y: 6 },
      })
      .setOrigin(0.5)
      .setDepth(552)
    const menu = this.add.rectangle(GAME_WIDTH / 2, 470, 240, 64, 0x3a5aaa).setDepth(551).setInteractive({ useHandCursor: true })
    menu.setStrokeStyle(5, 0xfff4e0)
    const menuTxt = this.add
      .text(GAME_WIDTH / 2, 470, 'MENU', {
        fontFamily: 'Bangers, system-ui',
        fontSize: '32px',
        color: '#fff4e0',
        padding: { x: 10, y: 6 },
      })
      .setOrigin(0.5)
      .setDepth(552)
    resume.on('pointerup', () => this.resumeGame())
    menu.on('pointerup', () => {
      stopAllMusic()
      this.scene.start('Menu')
    })
    this.pauseLayer = this.add.container(0, 0, [dim, title, resume, resumeTxt, menu, menuTxt]).setDepth(550)
  }

  private resumeGame(): void {
    this.pauseLayer?.destroy()
    this.pauseLayer = null
    this.physics.world.resume()
    this.tweens.resumeAll()
    this.time.paused = false
    this.state = this.beforePause === 'paused' ? 'idle' : this.beforePause
  }

  private loseLife(playSound = true): void {
    this.lives = Math.max(0, this.lives - 1)
    this.hud.setLives(this.lives)
    if (playSound) playSfx(this, 'sfx-lose', 0.8)
  }

  private afterFail(): void {
    if (this.lives <= 0) {
      this.state = 'over'
      stopAllMusic()
      recordHighScore(this.score)
      this.scene.start('GameOver', { score: this.score, prevBest: this.startBest })
      return
    }
    this.reload()
  }

  private reload(): void {
    if (this.state === 'over') return
    this.time.paused = false
    this.physics.world.resume()
    this.tweens.killTweensOf(this.projectile.sprite)
    this.projectile.park(this.sling.origin.x, this.sling.origin.y)
    this.state = 'idle'
  }

  private drawSky(): void {
    if (hasTex(this, 'bg-building')) {
      this.cameras.main.setBackgroundColor(0x1a1410)
      return
    }
    this.cameras.main.setBackgroundColor(0x5ec8f0)
    const g = this.add.graphics().setDepth(0)
    g.fillStyle(0x7fd4f5)
    g.fillRect(0, 0, 1280, 220)
    g.fillStyle(0xffffff, 0.92)
    this.blob(g, 160, 80, 70)
    this.blob(g, 980, 70, 80)
    this.blob(g, 430, 50, 50)
  }

  private blob(g: Phaser.GameObjects.Graphics, x: number, y: number, r: number): void {
    g.fillCircle(x, y, r)
    g.fillCircle(x + r * 0.7, y + 6, r * 0.7)
    g.fillCircle(x - r * 0.65, y + 8, r * 0.6)
  }
}
