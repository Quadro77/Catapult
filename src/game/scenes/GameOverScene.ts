import { GAME_WIDTH } from '../config.ts'
import { playSfx } from '../systems/Audio.ts'
import { rewardedBreak } from '../systems/ads.ts'
import { addFullscreenBadge } from '../systems/fullscreen.ts'
import { addCoins, formatCoins } from '../systems/progress.ts'
import { getHighScore, recordHighScore } from '../systems/highScore.ts'
import { addCoinChip } from '../systems/walletChip.ts'

type GameOverData = {
  score?: number
  prevBest?: number
  coins?: number
}

export class GameOverScene extends Phaser.Scene {
  private doubled = false
  private runCoins = 0
  private earned?: Phaser.GameObjects.Text
  private doubleBg?: Phaser.GameObjects.Rectangle
  private doubleTxt?: Phaser.GameObjects.Text

  constructor() {
    super({ key: 'GameOver' })
  }

  create(data: GameOverData): void {
    const score = data.score ?? 0
    const prevBest = data.prevBest ?? getHighScore()
    const best = recordHighScore(score)
    const isNew = score > 0 && score > prevBest
    this.runCoins = data.coins ?? 0
    this.doubled = this.runCoins <= 0
    playSfx(this, 'sfx-gameover')
    addFullscreenBadge(this)
    addCoinChip(this)
    this.cameras.main.setBackgroundColor(0x1a1410)
    this.add
      .text(GAME_WIDTH / 2, 130, "THAT'S ALL, FOLKS", {
        fontFamily: 'Bangers, system-ui',
        fontSize: '64px',
        color: '#e23d28',
        stroke: '#fff4e0',
        strokeThickness: 8,
        padding: { x: 20, y: 12 },
      })
      .setOrigin(0.5)
      .setAngle(-3)

    this.add
      .text(GAME_WIDTH / 2, 230, String(score), {
        fontFamily: 'Bangers, system-ui',
        fontSize: '100px',
        color: '#fff4e0',
        padding: { x: 16, y: 10 },
      })
      .setOrigin(0.5)

    this.add
      .text(GAME_WIDTH / 2, 300, score === 1 ? 'CAT DELIVERED' : 'CATS DELIVERED', {
        fontFamily: 'Nunito, system-ui',
        fontSize: '22px',
        color: '#c4b8a4',
      })
      .setOrigin(0.5)

    this.add
      .text(GAME_WIDTH / 2, 338, isNew ? 'NEW BEST!' : `BEST ${best}`, {
        fontFamily: 'Bangers, system-ui',
        fontSize: '26px',
        color: isNew ? '#ffe14a' : '#e8d2a8',
        stroke: '#1a1410',
        strokeThickness: 4,
        padding: { x: 10, y: 4 },
      })
      .setOrigin(0.5)

    this.earned = this.add
      .text(GAME_WIDTH / 2, 378, `EARNED $${formatCoins(this.runCoins)}`, {
        fontFamily: 'Bangers, system-ui',
        fontSize: '28px',
        color: '#ffe14a',
        stroke: '#1a1410',
        strokeThickness: 4,
        padding: { x: 8, y: 4 },
      })
      .setOrigin(0.5)

    if (!this.doubled) {
      const pair = this.button(GAME_WIDTH / 2, 440, 'DOUBLE COINS', 0x2d8a2d, () => {
        void this.doubleUp()
      })
      this.doubleBg = pair.bg
      this.doubleTxt = pair.txt
    }
    this.button(GAME_WIDTH / 2, this.doubled ? 450 : 520, 'AGAIN', 0xe23d28, () => this.scene.start('Play'))
    this.button(GAME_WIDTH / 2 - 140, 600, 'GARAGE', 0xc45a12, () => this.scene.start('Shop'))
    this.button(GAME_WIDTH / 2 + 140, 600, 'MENU', 0x3a5aaa, () => this.scene.start('Menu'))
  }

  private async doubleUp(): Promise<void> {
    if (this.doubled) return
    const ok = await rewardedBreak()
    if (!ok) return
    this.doubled = true
    addCoins(this.runCoins)
    this.runCoins *= 2
    playSfx(this, 'sfx-bonus')
    this.earned?.setText(`EARNED $${formatCoins(this.runCoins)}`)
    this.doubleBg?.destroy()
    this.doubleTxt?.destroy()
  }

  private button(
    x: number,
    y: number,
    label: string,
    color: number,
    onClick: () => void,
  ): { bg: Phaser.GameObjects.Rectangle; txt: Phaser.GameObjects.Text } {
    const bg = this.add.rectangle(x, y, 240, 64, color).setInteractive({ useHandCursor: true })
    bg.setStrokeStyle(6, 0xfff4e0)
    const txt = this.add
      .text(x, y, label, {
        fontFamily: 'Bangers, system-ui',
        fontSize: '32px',
        color: '#fff4e0',
        padding: { x: 10, y: 6 },
      })
      .setOrigin(0.5)
    bg.on('pointerup', onClick)
    return { bg, txt }
  }
}
