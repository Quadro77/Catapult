import { GAME_WIDTH } from '../config.ts'
import { getHighScore } from './highScore.ts'

const BOARD_X = 16
const BOARD_Y = 14
const PAD = 16
const COLS = 3
const COL_W = 130
const BOARD_W = PAD * 2 + COL_W * COLS
const BOARD_H = 94
const WOOD = 0x2c1a12
const CREAM = 0xfff4e0
const INK = 0x1a1410
const TRACK = 0x1a100c
const MID_Y = 40
const LIFE_SIZE = 30
const BAR_W = 68
const BAR_H = 14

export class Hud {
  private scene: Phaser.Scene
  private board: Phaser.GameObjects.Container
  private scoreText: Phaser.GameObjects.Text
  private bestText: Phaser.GameObjects.Text
  private banner: Phaser.GameObjects.Text
  private lives: Phaser.GameObjects.Image[] = []
  private ladyIcon: Phaser.GameObjects.Image
  private angerTrack: Phaser.GameObjects.Rectangle
  private angerFill: Phaser.GameObjects.Rectangle
  private angerMax: number

  constructor(scene: Phaser.Scene, lives: number, angerMax: number) {
    this.scene = scene
    this.angerMax = Math.max(1, angerMax)
    this.board = scene.add.container(BOARD_X, BOARD_Y).setDepth(100).setAngle(-1.4)
    const shadow = scene.add.graphics()
    drawSign(shadow, 6, 9, BOARD_W, BOARD_H, 0x000000, 0x000000, 0.4)
    const plate = scene.add.graphics()
    drawSign(plate, 0, 0, BOARD_W, BOARD_H, WOOD, CREAM, 1)
    this.scoreText = scene.add
      .text(colCenter(0), 32, '0', {
        fontFamily: 'Bangers, system-ui',
        fontSize: '36px',
        color: '#fff4e0',
        padding: { x: 8, y: 4 },
      })
      .setOrigin(0.5)
    this.bestText = scene.add
      .text(colCenter(0), 64, bestLabel(getHighScore()), {
        fontFamily: 'Nunito, system-ui',
        fontSize: '13px',
        color: '#e8d2a8',
        padding: { x: 4, y: 2 },
      })
      .setOrigin(0.5)
    this.ladyIcon = scene.add.image(0, MID_Y, 'lady').setDisplaySize(32, 38).setOrigin(0.5)
    this.angerTrack = scene.add.rectangle(0, MID_Y, BAR_W, BAR_H, TRACK).setOrigin(0, 0.5)
    this.angerTrack.setStrokeStyle(3, CREAM)
    this.angerFill = scene.add.rectangle(0, MID_Y, 0, BAR_H - 6, 0xe23d28).setOrigin(0, 0.5)
    this.board.add([
      shadow,
      plate,
      this.scoreText,
      this.bestText,
      this.ladyIcon,
      this.angerTrack,
      this.angerFill,
    ])
    this.layoutAnger()
    this.ensureIcons(lives)
    this.setLives(lives)
    this.setAnger(0)
    this.banner = scene.add
      .text(GAME_WIDTH / 2, 140, '', {
        fontFamily: 'Bangers, system-ui',
        fontSize: '56px',
        color: '#fff4e0',
        stroke: '#1a1410',
        strokeThickness: 8,
        padding: { x: 18, y: 10 },
      })
      .setOrigin(0.5)
      .setDepth(110)
      .setAlpha(0)
  }

  setScore(score: number): void {
    this.scoreText.setText(String(score))
    const best = getHighScore()
    this.bestText.setText(bestLabel(best))
    this.bestText.setColor(score > 0 && score >= best ? '#ffe14a' : '#e8d2a8')
  }

  setLives(lives: number): void {
    this.ensureIcons(lives)
    this.lives.forEach((icon, i) => {
      icon.setVisible(i < lives)
      icon.setAlpha(1)
    })
  }

  setAnger(value: number): void {
    const t = Math.min(1, Math.max(0, value / this.angerMax))
    this.angerFill.width = (BAR_W - 6) * t
    this.angerFill.setFillStyle(t > 0.66 ? 0xe23d28 : t > 0.33 ? 0xe28a2d : 0xf2d36b)
    this.ladyIcon.setTint(t > 0.66 ? 0xff6a55 : t > 0.33 ? 0xffb08a : 0xffffff)
  }

  shout(scene: Phaser.Scene, text: string, color: string, x: number, y: number): void {
    const pop = scene.add
      .text(x, y, text, {
        fontFamily: 'Bangers, system-ui',
        fontSize: '36px',
        color,
        stroke: '#1a1410',
        strokeThickness: 6,
        padding: { x: 14, y: 8 },
      })
      .setOrigin(0.5)
      .setDepth(111)
    scene.tweens.add({
      targets: pop,
      y: y - 56,
      alpha: 0,
      duration: 720,
      ease: 'Quad.out',
      onComplete: () => pop.destroy(),
    })
    this.banner.setText(text)
    this.banner.setColor(color)
    this.banner.setAlpha(1)
    scene.tweens.add({
      targets: this.banner,
      alpha: 0,
      duration: 700,
      delay: 180,
    })
  }

  private ensureIcons(count: number): void {
    while (this.lives.length < count) {
      const icon = this.scene.add.image(0, MID_Y, 'life')
      this.board.add(icon)
      this.lives.push(icon)
    }
    this.layoutLives(Math.max(count, 1))
  }

  private layoutLives(count: number): void {
    const span = COL_W - 18
    const gap = count > 3 ? Math.min(LIFE_SIZE, span / count) : 34
    const size = count > 3 ? Math.max(20, gap - 2) : LIFE_SIZE
    const start = colCenter(1) - ((count - 1) * gap) / 2
    this.lives.forEach((icon, i) => {
      icon.setDisplaySize(size, size)
      icon.x = start + i * gap
      icon.y = MID_Y
    })
  }

  private layoutAnger(): void {
    const cx = colCenter(2)
    const group = 32 + 8 + BAR_W
    const left = cx - group / 2
    this.ladyIcon.x = left + 16
    this.ladyIcon.y = MID_Y
    this.angerTrack.x = left + 40
    this.angerTrack.y = MID_Y
    this.angerFill.x = left + 43
    this.angerFill.y = MID_Y
  }
}

function colCenter(i: number): number {
  return PAD + COL_W * i + COL_W / 2
}

function bestLabel(best: number): string {
  return `BEST ${best}`
}

function drawSign(
  g: Phaser.GameObjects.Graphics,
  x: number,
  y: number,
  w: number,
  h: number,
  fill: number,
  stroke: number,
  alpha: number,
): void {
  g.fillStyle(fill, alpha)
  traceSign(g, x, y, w, h, 2.1)
  g.fillPath()
  if (alpha >= 1) {
    g.lineStyle(5, stroke, 1)
    traceSign(g, x, y, w, h, 2.1)
    g.strokePath()
    g.lineStyle(2, INK, 0.85)
    traceSign(g, x + 5, y + 5, w - 10, h - 10, 1.2)
    g.strokePath()
    g.fillStyle(INK, 1)
    const nails = [
      [x + 14, y + 13],
      [x + w - 14, y + 13],
      [x + 14, y + h - 13],
      [x + w - 14, y + h - 13],
    ]
    for (const [nx, ny] of nails) {
      g.fillCircle(nx, ny, 3.2)
      g.fillStyle(0x8a6a44, 1)
      g.fillCircle(nx - 0.8, ny - 0.8, 1.1)
      g.fillStyle(INK, 1)
    }
  }
}

function traceSign(g: Phaser.GameObjects.Graphics, x: number, y: number, w: number, h: number, amp: number): void {
  const r = 11
  const pts: { x: number; y: number }[] = []
  const push = (px: number, py: number, t: number, ang: number) => {
    const wob = Math.sin(t * Math.PI * 2) * amp + Math.sin(t * Math.PI * 5.4 + 0.7) * amp * 0.35
    pts.push({ x: px + Math.cos(ang) * wob, y: py + Math.sin(ang) * wob })
  }
  const edge = (x0: number, y0: number, x1: number, y1: number, n: number, seed: number, out: number) => {
    for (let i = 0; i <= n; i += 1) {
      const u = i / n
      push(x0 + (x1 - x0) * u, y0 + (y1 - y0) * u, seed + u, out)
    }
  }
  edge(x + r, y, x + w - r, y, 18, 0.2, -Math.PI / 2)
  for (let i = 1; i <= 7; i += 1) {
    const a = -Math.PI / 2 + (i / 8) * (Math.PI / 2)
    push(x + w - r + Math.cos(a) * r, y + r + Math.sin(a) * r, 1.1 + i / 8, a)
  }
  edge(x + w, y + r, x + w, y + h - r, 12, 1.4, 0)
  for (let i = 1; i <= 7; i += 1) {
    const a = 0 + (i / 8) * (Math.PI / 2)
    push(x + w - r + Math.cos(a) * r, y + h - r + Math.sin(a) * r, 2.2 + i / 8, a)
  }
  edge(x + w - r, y + h, x + r, y + h, 18, 2.6, Math.PI / 2)
  for (let i = 1; i <= 7; i += 1) {
    const a = Math.PI / 2 + (i / 8) * (Math.PI / 2)
    push(x + r + Math.cos(a) * r, y + h - r + Math.sin(a) * r, 3.3 + i / 8, a)
  }
  edge(x, y + h - r, x, y + r, 12, 3.7, Math.PI)
  for (let i = 1; i <= 7; i += 1) {
    const a = Math.PI + (i / 8) * (Math.PI / 2)
    push(x + r + Math.cos(a) * r, y + r + Math.sin(a) * r, 4.5 + i / 8, a)
  }
  g.beginPath()
  g.moveTo(pts[0].x, pts[0].y)
  for (let i = 1; i < pts.length; i += 1) g.lineTo(pts[i].x, pts[i].y)
  g.closePath()
}
