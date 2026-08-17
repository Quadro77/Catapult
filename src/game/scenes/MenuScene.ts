import { GAME_HEIGHT, GAME_WIDTH } from '../config.ts'
import { loadCustomArt, loadProject } from '../data/project.ts'
import { playMusic, unlockAnd } from '../systems/Audio.ts'
import { hasTex } from '../systems/chroma.ts'
import { addFullscreenBadge, requestGameFullscreen } from '../systems/fullscreen.ts'
import { addSettingsCog } from '../systems/SettingsMenu.ts'

export class MenuScene extends Phaser.Scene {
  constructor() {
    super({ key: 'Menu' })
  }

  create(): void {
    unlockAnd(this, () => playMusic(this, 'music-title', 0.38, false))
    addSettingsCog(this, { musicKey: 'music-title', musicVol: 0.38, musicLoop: false })
    addFullscreenBadge(this)
    this.cameras.main.setBackgroundColor(0x1a1410)
    const project = loadProject()
    loadCustomArt(this, project.customArt)
    if (project.titleImages.length === 0 && hasTex(this, 'bg-building')) {
      this.placeBg(this.add.image(GAME_WIDTH / 2, GAME_HEIGHT / 2, 'bg-building').setDisplaySize(GAME_WIDTH, GAME_HEIGHT))
    }
    if (!project.titleImages.some((p) => p.id === 'flycat' || p.key === 'title-cat-fly' || p.key === 'cat-fly')) {
      this.drawHiRes('title-cat-fly', 280, 520, -12, 0.28, 13)
    }
    const swap: Record<string, string> = {
      lady: 'title-lady',
      slingshot: 'title-sling',
      'cat-fly': 'title-cat-fly',
      cat: 'title-cat-fly',
    }
    for (const p of project.titleImages) {
      const key = swap[p.key] ?? p.key
      if (!hasTex(this, key)) continue
      const img = this.add.image(p.x, p.y, key).setDepth(p.depth)
      img.setRotation(Phaser.Math.DegToRad(p.rotation))
      if (p.id === 'bg') {
        img.setDisplaySize(GAME_WIDTH, GAME_HEIGHT)
        this.placeBg(img)
      } else {
        img.setScale(p.scale)
        if (this.wantsShadow(p.id, key)) this.dropShadow(img)
      }
    }

    const playAt = project.titleButtons.find((b) => b.id === 'play') ?? { x: GAME_WIDTH / 2, y: 430, rotation: 0 }
    this.makePlay(playAt.x, playAt.y, playAt.rotation)

    this.add
      .text(GAME_WIDTH / 2, GAME_HEIGHT - 28, 'No animals were harmed in the making of this game.', {
        fontFamily: 'Nunito, system-ui',
        fontSize: '16px',
        color: '#fff4e0',
        stroke: '#1a1410',
        strokeThickness: 3,
        padding: { x: 8, y: 4 },
      })
      .setOrigin(0.5)
      .setDepth(41)

    let typed = ''
    const onKey = (e: KeyboardEvent) => {
      if (e.key.length !== 1) return
      typed = (typed + e.key).slice(-6).toLowerCase()
      if (typed === 'smokey') this.scene.start('Editor')
    }
    window.addEventListener('keydown', onKey)
    this.events.once(Phaser.Scenes.Events.SHUTDOWN, () => window.removeEventListener('keydown', onKey))
  }

  private drawHiRes(key: string, x: number, y: number, rot: number, scale: number, depth: number): void {
    if (!hasTex(this, key)) return
    const img = this.add.image(x, y, key).setDepth(depth)
    img.setRotation(Phaser.Math.DegToRad(rot))
    img.setScale(scale)
    this.dropShadow(img)
  }

  private placeBg(img: Phaser.GameObjects.Image): void {
    img.preFX?.addBlur(0, 0.8, 0.8, 0.6)
    this.add.rectangle(GAME_WIDTH / 2, GAME_HEIGHT / 2, GAME_WIDTH, GAME_HEIGHT, 0x1a1410, 0.12).setDepth(img.depth + 0.1)
  }

  private wantsShadow(id: string, key: string): boolean {
    return (
      id === 'title' ||
      id === 'lady' ||
      id === 'sling' ||
      key === 'ui-title' ||
      key === 'lady' ||
      key === 'title-lady' ||
      key === 'slingshot' ||
      key === 'title-sling' ||
      key === 'cat-fly' ||
      key === 'title-cat-fly' ||
      key === 'cat' ||
      key === 'life'
    )
  }

  private dropShadow(img: Phaser.GameObjects.Image): void {
    img.preFX?.addShadow(10, 12, 0.006, 0.8, 0x000000, 8, 0.55)
  }

  private makePlay(x: number, y: number, rotation: number): void {
    const shadow = this.add.rectangle(6, 10, 260, 84, 0x000000, 0.45)
    const box = this.add.rectangle(0, 0, 260, 84, 0xe23d28).setInteractive({ useHandCursor: true })
    box.setStrokeStyle(6, 0x1a1410)
    const text = this.add
      .text(0, 0, 'PLAY', {
        fontFamily: 'Bangers, system-ui',
        fontSize: '52px',
        color: '#fff4e0',
        padding: { x: 12, y: 8 },
      })
      .setOrigin(0.5)
    const c = this.add.container(x, y, [shadow, box, text]).setDepth(40)
    c.setRotation(Phaser.Math.DegToRad(rotation))
    box.on('pointerover', () => box.setFillStyle(0xff5346))
    box.on('pointerout', () => box.setFillStyle(0xe23d28))
    box.on('pointerup', () => {
      requestGameFullscreen()
      this.scene.start('Play')
    })
  }
}
