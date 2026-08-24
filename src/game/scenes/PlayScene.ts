import { GAME_WIDTH, RESULT_MS } from '../config.ts'
import { loadLevel } from '../data/layout.ts'
import { geometry, type LevelSpace } from '../geometry.ts'
import { CATCH_COINS, continueCost, HEIGHT_COINS, MAX_CONTINUES, STREAK_COINS } from '../data/shop.ts'
import { loadout, type Loadout } from '../loadout.ts'
import { Occupancy, type OccupancySlot } from '../occupancy.ts'
import { Run, type FailNext, type RunEvent } from '../run.ts'
import { commercialBreak, gameplayStart, gameplayStop, rewardedBreak } from '../systems/ads.ts'
import { hasTex } from '../systems/chroma.ts'
import { Building } from '../systems/Building.ts'
import { getHighScore, recordHighScore } from '../systems/highScore.ts'
import { Hud } from '../systems/Hud.ts'
import { Projectile } from '../systems/Projectile.ts'
import { addCoins, equippedCat, loadPlayer, spendCoins } from '../systems/progress.ts'
import { checkOutcome } from '../systems/Resolve.ts'
import { DebugOverlay } from '../systems/DebugOverlay.ts'
import { playMusic, playSfx, stopMusic, stopSfx, unlockAnd } from '../systems/Audio.ts'
import { addFullscreenBadge } from '../systems/fullscreen.ts'
import { addSettingsCog } from '../systems/SettingsMenu.ts'
import { Slingshot } from '../systems/Slingshot.ts'
import { addCoinChip, floatCoins } from '../systems/walletChip.ts'
import type { LevelDef, Outcome } from '../types.ts'

export class PlayScene extends Phaser.Scene {
  private level!: LevelDef
  private run!: Run
  private occupancy!: Occupancy
  private building!: Building
  private sling!: Slingshot
  private projectile!: Projectile
  private hud!: Hud
  private debug!: DebugOverlay
  private startBest = 0
  private paused = false
  private pauseLayer: Phaser.GameObjects.Container | null = null
  private continueLayer: Phaser.GameObjects.Container | null = null
  private hitMaxPull = false
  private ready!: Loadout
  private space!: LevelSpace
  private ending = false

  constructor() {
    super({ key: 'Play' })
  }

  create(): void {
    this.level = loadLevel()
    this.startBest = getHighScore()
    this.ending = false
    this.paused = false
    this.continueLayer = null
    this.pauseLayer = null
    this.ready = loadout({
      cat: equippedCat(),
      ranks: loadPlayer().levels,
      sling: this.level.slingshot,
      baseLives: this.level.lives,
    })
    this.run = new Run({
      startLives: this.ready.lives,
      angerLimit: this.level.angerLimit || 3,
      bonusEvery: this.level.bonusEvery,
      coinMul: this.ready.coinMul,
      maxContinues: MAX_CONTINUES,
      catchCoins: CATCH_COINS,
      heightCoins: HEIGHT_COINS,
      streakCoins: STREAK_COINS,
    })
    this.physics.world.gravity.y = this.ready.gravity
    this.drawSky()
    this.space = geometry(this.level)
    this.occupancy = new Occupancy(this.space.windows, this.level.director)
    this.building = new Building(this, this.space, (id) => this.occupancy.finishHide(id), this.level.bgKey)
    unlockAnd(this, () => playMusic(this, 'music-play', 0.32))
    this.sling = new Slingshot(this, this.level, this.ready)
    this.projectile = new Projectile(this, this.ready, this.sling.origin.x, this.sling.origin.y)
    this.projectile.park(this.sling.origin.x, this.sling.origin.y)
    this.hud = new Hud(this, this.run.lives, this.level.angerLimit || 3)
    this.hud.setScore(0)
    this.debug = new DebugOverlay(this, this.building, this.occupancy, this.sling, this.projectile)
    addSettingsCog(this, { musicKey: 'music-play', musicVol: 0.32, musicLoop: true })
    addFullscreenBadge(this)
    addCoinChip(this)
    this.bindInput()
    this.bindPause()
    gameplayStart()
    this.events.once(Phaser.Scenes.Events.SHUTDOWN, () => gameplayStop())
  }

  update(_time: number, dt: number): void {
    if (this.run.phase === 'over' || this.run.phase === 'continue') return
    if (this.paused) return
    this.tickOccupancy(dt)
    this.sling.draw()
    this.debug.draw()
    if (this.run.phase === 'aiming' || this.run.phase === 'idle') {
      const stretch = this.sling.pullLength()
      this.projectile.follow(this.sling.pouch.x, this.sling.pouch.y, stretch)
    }
    if (this.run.phase === 'aiming' && this.sling.atMaxPull()) this.hitMaxPull = true
    if (this.run.phase === 'flight') {
      this.projectile.pointAlongVelocity()
      const outcome = checkOutcome({
        resolved: this.projectile.resolved,
        x: this.projectile.x,
        y: this.projectile.y,
        pad: this.ready.hitPad,
        groundY: this.space.groundY,
        wallRight: this.space.wallRight,
        wallTop: this.space.wallTop,
        occupancy: this.occupancy,
      })
      if (outcome) this.applyOutcome(outcome)
    }
  }

  private bindInput(): void {
    this.input.on('pointerdown', (p: Phaser.Input.Pointer) => {
      if (this.paused) return
      if (!this.run.canAim()) return
      if (!this.sling.contains(p.worldX, p.worldY)) return
      if (this.run.beginAim().kind === 'ignored') return
      this.hitMaxPull = false
      this.sling.beginPull()
      playSfx(this, 'sfx-pull', 0.7)
      this.sling.dragTo(p.worldX, p.worldY)
    })
    this.input.on('pointermove', (p: Phaser.Input.Pointer) => {
      if (this.run.phase !== 'aiming') return
      this.sling.dragTo(p.worldX, p.worldY)
    })
    this.input.on('pointerup', (p: Phaser.Input.Pointer) => this.release(p))
    this.input.on('pointerupoutside', (p: Phaser.Input.Pointer) => this.release(p))
    const onPointerCancel = () => this.interruptAim()
    window.addEventListener('pointercancel', onPointerCancel, true)
    this.events.once(Phaser.Scenes.Events.SHUTDOWN, () => {
      window.removeEventListener('pointercancel', onPointerCancel, true)
    })
  }

  private release(p?: Phaser.Input.Pointer): void {
    if (this.run.phase !== 'aiming') return
    if (p?.wasCanceled) {
      this.interruptAim()
      return
    }
    stopSfx(this, 'sfx-pull')
    const full = this.hitMaxPull
    const launch = this.sling.release()
    if (!launch) {
      this.run.cancelAim()
      this.hitMaxPull = false
      return
    }
    this.run.fly()
    playSfx(this, 'sfx-launch', 0.85)
    if (full) this.time.delayedCall(100, () => playSfx(this, 'sfx-whip', 0.9))
    this.hitMaxPull = false
    this.projectile.launch(this.sling.origin.x, this.sling.origin.y, launch.vx, launch.vy)
  }

  private endPull(): void {
    stopSfx(this, 'sfx-pull')
    this.sling.cancel()
  }

  private interruptAim(): void {
    this.endPull()
    this.hitMaxPull = false
    if (this.run.phase === 'aiming') this.run.cancelAim()
  }

  private applyOutcome(outcome: Outcome): void {
    this.time.paused = false
    this.physics.world.resume()
    this.projectile.resolved = true
    this.projectile.freeze()
    const slot =
      outcome.kind === 'catch' || outcome.kind === 'catcher' ? this.occupancy.window(outcome.windowId) : undefined
    if (slot) this.occupancy.lock(slot.id)
    const ev = this.run.applyOutcome({ outcome, floor: slot?.floor })
    this.present({ ev, outcome, slot })
  }

  private tickOccupancy(dt: number): void {
    for (const ev of this.occupancy.update(dt, this.run.score)) {
      if (ev.kind === 'popped') {
        this.building.show(ev.windowId, ev.occupant)
        playSfx(this, 'sfx-pop', 0.7)
      } else if (ev.kind === 'hide') {
        this.building.hide(ev.windowId)
        if (ev.missed) this.missLady()
      }
    }
  }

  private present(input: { ev: RunEvent; outcome: Outcome; slot: OccupancySlot | undefined }): void {
    const { ev, outcome, slot } = input
    if (ev.kind === 'catch') {
      if (slot) this.building.flashCatch(slot.id)
      recordHighScore(ev.score)
      this.hud.setScore(ev.score)
      this.hud.setAnger(ev.anger)
      if (ev.extraLife) this.hud.setLives(ev.lives)
      addCoins(ev.payout)
      floatCoins(this, this.projectile.x, this.projectile.y - 48, ev.payout)
      if (ev.extraLife) {
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
        if (slot) {
          this.occupancy.unlock(slot.id)
          this.building.unlock(slot.id)
        }
        this.afterResolve()
      })
      return
    }
    if (ev.kind === 'catcher') {
      if (slot) this.building.flashCatcher(slot.id)
      this.hud.setScore(ev.score)
      playSfx(this, 'sfx-catcher')
      this.hud.shout(this, 'GOTCHA!', '#c45a12', this.projectile.x, this.projectile.y - 20)
      this.projectile.sprite.setVisible(false)
      this.time.delayedCall(RESULT_MS, () => {
        if (slot) {
          this.occupancy.unlock(slot.id)
          this.building.unlock(slot.id)
        }
        this.afterResolve()
      })
      return
    }
    if (ev.kind === 'splat') {
      playSfx(this, 'sfx-splat')
      this.hud.setLives(ev.lives)
      this.hud.shout(this, 'SPLAT!', '#e23d28', this.projectile.x, this.projectile.y - 10)
      this.cameras.main.shake(160, 0.008)
      const burst = this.add.image(this.projectile.x, this.projectile.y, 'burst').setDepth(21)
      this.tweens.add({ targets: burst, scale: 1.6, alpha: 0, duration: 360, onComplete: () => burst.destroy() })
      const spr = this.projectile.sprite
      spr.setRotation(0)
      const tall =
        outcome.kind === 'splat' &&
        (outcome.reason === 'wall' ||
          (outcome.reason === 'bounds' && (this.projectile.x < 0 || this.projectile.x > GAME_WIDTH)))
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
      this.time.delayedCall(RESULT_MS, () => this.afterResolve())
    }
  }

  private afterResolve(): void {
    const ev = this.run.finishResolve()
    if (ev.kind === 'reload' || ev.kind === 'continue' || ev.kind === 'over') {
      this.handleFailNext(ev.kind)
    }
  }

  private missLady(): void {
    if (this.paused) return
    const ev = this.run.missLady()
    if (ev.kind === 'ignored') return
    if (ev.kind === 'anger') {
      this.hud.setAnger(ev.anger)
      return
    }
    if (ev.kind !== 'furious') return
    this.hud.setAnger(this.run.anger)
    this.hud.setLives(ev.lives)
    playSfx(this, 'sfx-lose', 0.8)
    this.hud.shout(this, 'SHE IS FURIOUS!', '#e23d28', GAME_WIDTH / 2, 220)
    this.handleFailNext(ev.next)
  }

  private handleFailNext(next: FailNext): void {
    this.endPull()
    if (next === 'reload') {
      this.reload()
      return
    }
    if (next === 'continue') {
      this.offerContinue()
      return
    }
    void this.endRun()
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
    if (this.run.phase === 'over' || this.run.phase === 'continue') return
    if (this.paused) {
      this.resumeGame()
      return
    }
    if (this.run.phase === 'aiming') this.interruptAim()
    this.paused = true
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
      void this.leaveToMenu()
    })
    this.pauseLayer = this.add.container(0, 0, [dim, title, resume, resumeTxt, menu, menuTxt]).setDepth(550)
  }

  private resumeGame(): void {
    this.pauseLayer?.destroy()
    this.pauseLayer = null
    this.physics.world.resume()
    this.tweens.resumeAll()
    this.time.paused = false
    this.paused = false
  }

  private async leaveToMenu(): Promise<void> {
    stopMusic('music-play')
    gameplayStop()
    await commercialBreak()
    this.scene.start('Menu')
  }

  private async endRun(): Promise<void> {
    if (this.ending) return
    this.ending = true
    if (this.run.phase !== 'over') this.run.giveUp()
    this.continueLayer?.destroy()
    this.continueLayer = null
    stopMusic('music-play')
    gameplayStop()
    recordHighScore(this.run.score)
    const payload = { score: this.run.score, prevBest: this.startBest, coins: this.run.coins }
    await commercialBreak()
    if (!this.sys.isActive()) return
    this.scene.start('GameOver', payload)
  }

  private offerContinue(): void {
    if (this.run.phase !== 'continue') return
    if (this.continueLayer?.active) return
    this.continueLayer?.destroy()
    this.continueLayer = null
    this.physics.world.pause()
    this.tweens.pauseAll()
    this.time.paused = true
    gameplayStop()
    const price = continueCost(this.run.continues)
    const dim = this.add.rectangle(GAME_WIDTH / 2, 360, GAME_WIDTH, 720, 0x1a1410, 0.72).setDepth(560)
    const title = this.add
      .text(GAME_WIDTH / 2, 200, 'OUT OF LIVES', {
        fontFamily: 'Bangers, system-ui',
        fontSize: '64px',
        color: '#e23d28',
        stroke: '#fff4e0',
        strokeThickness: 8,
        padding: { x: 16, y: 8 },
      })
      .setOrigin(0.5)
      .setDepth(561)
    const ad = this.add.rectangle(GAME_WIDTH / 2, 340, 360, 72, 0x2d8a2d).setDepth(561).setInteractive({ useHandCursor: true })
    ad.setStrokeStyle(5, 0xfff4e0)
    const adTxt = this.add
      .text(GAME_WIDTH / 2, 340, 'WATCH AD — 1 LIFE', {
        fontFamily: 'Bangers, system-ui',
        fontSize: '28px',
        color: '#fff4e0',
        padding: { x: 8, y: 4 },
      })
      .setOrigin(0.5)
      .setDepth(562)
    const coin = this.add.rectangle(GAME_WIDTH / 2, 430, 360, 72, 0xc45a12).setDepth(561).setInteractive({ useHandCursor: true })
    coin.setStrokeStyle(5, 0xfff4e0)
    const coinTxt = this.add
      .text(GAME_WIDTH / 2, 430, `$${price} — 1 LIFE`, {
        fontFamily: 'Bangers, system-ui',
        fontSize: '28px',
        color: '#fff4e0',
        padding: { x: 8, y: 4 },
      })
      .setOrigin(0.5)
      .setDepth(562)
    const give = this.add.rectangle(GAME_WIDTH / 2, 520, 360, 64, 0x3a5aaa).setDepth(561).setInteractive({ useHandCursor: true })
    give.setStrokeStyle(5, 0xfff4e0)
    const giveTxt = this.add
      .text(GAME_WIDTH / 2, 520, 'GIVE UP', {
        fontFamily: 'Bangers, system-ui',
        fontSize: '28px',
        color: '#fff4e0',
        padding: { x: 8, y: 4 },
      })
      .setOrigin(0.5)
      .setDepth(562)
    ad.on('pointerup', () => {
      void this.continueFromAd()
    })
    coin.on('pointerup', () => {
      if (!spendCoins(price)) {
        this.hud.shout(this, 'NEED MORE COINS', '#ffe14a', GAME_WIDTH / 2, 160)
        return
      }
      playSfx(this, 'sfx-bonus')
      this.grantContinue()
    })
    give.on('pointerup', () => this.endRun())
    this.continueLayer = this.add.container(0, 0, [dim, title, ad, adTxt, coin, coinTxt, give, giveTxt]).setDepth(560)
  }

  private async continueFromAd(): Promise<void> {
    const ok = await rewardedBreak()
    if (!ok) {
      this.hud.shout(this, 'NO AD READY', '#ffe14a', GAME_WIDTH / 2, 160)
      return
    }
    playSfx(this, 'sfx-bonus')
    this.grantContinue()
  }

  private grantContinue(): void {
    const ev = this.run.grantContinue()
    if (ev.kind !== 'granted') return
    this.continueLayer?.destroy()
    this.continueLayer = null
    this.hud.setLives(ev.lives)
    this.physics.world.resume()
    this.tweens.resumeAll()
    this.time.paused = false
    gameplayStart()
    this.reload()
  }

  private reload(): void {
    if (this.run.phase === 'over') return
    this.endPull()
    this.time.paused = false
    this.physics.world.resume()
    this.tweens.killTweensOf(this.projectile.sprite)
    this.projectile.park(this.sling.origin.x, this.sling.origin.y)
  }

  private drawSky(): void {
    if (hasTex(this, this.level.bgKey)) {
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
