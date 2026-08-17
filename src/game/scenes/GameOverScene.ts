import { GAME_WIDTH } from '../config.ts'
import { playSfx } from '../systems/Audio.ts'
import { addFullscreenBadge } from '../systems/fullscreen.ts'
import { getHighScore, recordHighScore } from '../systems/highScore.ts'

type GameOverData = {
  score?: number
  prevBest?: number
}

export class GameOverScene extends Phaser.Scene {
  constructor() {
    super({ key: 'GameOver' })
  }

  create(data: GameOverData): void {
    const score = data.score ?? 0
    const prevBest = data.prevBest ?? getHighScore()
    const best = recordHighScore(score)
    const isNew = score > 0 && score > prevBest
    playSfx(this, 'sfx-gameover')
    addFullscreenBadge(this)
    this.cameras.main.setBackgroundColor(0x1a1410)
    this.add
      .text(GAME_WIDTH / 2, 160, "THAT'S ALL, FOLKS", {
        fontFamily: 'Bangers, system-ui',
        fontSize: '72px',
        color: '#e23d28',
        stroke: '#fff4e0',
        strokeThickness: 8,
        padding: { x: 20, y: 12 },
      })
      .setOrigin(0.5)
      .setAngle(-3)

    this.add
      .text(GAME_WIDTH / 2, 270, String(score), {
        fontFamily: 'Bangers, system-ui',
        fontSize: '120px',
        color: '#fff4e0',
        padding: { x: 16, y: 10 },
      })
      .setOrigin(0.5)

    this.add
      .text(GAME_WIDTH / 2, 350, score === 1 ? 'CAT DELIVERED' : 'CATS DELIVERED', {
        fontFamily: 'Nunito, system-ui',
        fontSize: '22px',
        color: '#c4b8a4',
      })
      .setOrigin(0.5)

    this.add
      .text(GAME_WIDTH / 2, 392, isNew ? 'NEW BEST!' : `BEST ${best}`, {
        fontFamily: 'Bangers, system-ui',
        fontSize: '28px',
        color: isNew ? '#ffe14a' : '#e8d2a8',
        stroke: '#1a1410',
        strokeThickness: 4,
        padding: { x: 10, y: 4 },
      })
      .setOrigin(0.5)

    this.button(GAME_WIDTH / 2, 470, 'AGAIN', 0xe23d28, () => this.scene.start('Play'))
    this.button(GAME_WIDTH / 2, 560, 'MENU', 0x3a5aaa, () => this.scene.start('Menu'))
  }

  private button(x: number, y: number, label: string, color: number, onClick: () => void): void {
    const bg = this.add.rectangle(x, y, 240, 72, color).setInteractive({ useHandCursor: true })
    bg.setStrokeStyle(6, 0xfff4e0)
    this.add
      .text(x, y, label, {
        fontFamily: 'Bangers, system-ui',
        fontSize: '40px',
        color: '#fff4e0',
        padding: { x: 10, y: 6 },
      })
      .setOrigin(0.5)
    bg.on('pointerup', onClick)
  }
}
