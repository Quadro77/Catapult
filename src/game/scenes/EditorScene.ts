import { GAME_HEIGHT, GAME_WIDTH } from '../config.ts'
import { cloneLevel, windowsToScreen, screenToWindows } from '../data/layout.ts'
import { LEVEL_01 } from '../data/levels/level-01.ts'
import {
  activeLevel,
  availableKeys,
  clearProject,
  defaultProject,
  loadCustomArt,
  loadProject,
  saveProject,
  saveUserImage,
} from '../data/project.ts'
import { stopAllMusic } from '../systems/Audio.ts'
import { addFullscreenBadge } from '../systems/fullscreen.ts'
import { hasTex } from '../systems/chroma.ts'
import { EditorChrome } from '../systems/EditorChrome.ts'
import { EditorPanel } from '../systems/EditorPanel.ts'
import type { LevelDef, PlacedImage, ProjectSave, TitleButton } from '../types.ts'

type WinRect = { id: string; x: number; y: number; w: number; h: number }

type Drag =
  | { kind: 'move'; id: string; dx: number; dy: number }
  | { kind: 'resize'; id: string; ox: number; oy: number; ow: number; oh: number }
  | { kind: 'ground'; oy: number }
  | { kind: 'wall'; ox: number }
  | { kind: 'roof'; oy: number }
  | { kind: 'sling'; dx: number }
  | { kind: 'img-move'; id: string; dx: number; dy: number }
  | { kind: 'img-scale'; id: string; start: number; dist: number }
  | { kind: 'img-rot'; id: string }
  | { kind: 'btn-move'; id: 'play' | 'editor'; dx: number; dy: number }
  | { kind: 'btn-rot'; id: 'play' | 'editor' }

export class EditorScene extends Phaser.Scene {
  private project!: ProjectSave
  private target = ''
  private level!: LevelDef
  private wins: WinRect[] = []
  private selected: string | null = null
  private drag: Drag | null = null
  private gfx!: Phaser.GameObjects.Graphics
  private hint!: Phaser.GameObjects.Text
  private panel: EditorPanel | null = null
  private chrome!: EditorChrome
  private slingX = 188
  private sprites = new Map<string, Phaser.GameObjects.Image>()
  private buttons = new Map<string, Phaser.GameObjects.Container>()

  constructor() {
    super({ key: 'Editor' })
  }

  create(): void {
    stopAllMusic()
    addFullscreenBadge(this)
    this.project = loadProject()
    loadCustomArt(this, this.project.customArt)
    this.level = cloneLevel(activeLevel(this.project))
    this.target = this.level.id
    this.wins = windowsToScreen(this.level)
    this.slingX = this.level.slingshot.origin.x
    this.cameras.main.setBackgroundColor(0x1a1410)
    this.gfx = this.add.graphics().setDepth(400)
    this.hint = this.add
      .text(16, 10, '', {
        fontFamily: 'Nunito, system-ui',
        fontSize: '15px',
        color: '#fff4e0',
        backgroundColor: '#1a1410cc',
        padding: { x: 10, y: 8 },
      })
      .setDepth(500)
    this.chrome = new EditorChrome(
      this.tabList(),
      this.target,
      (id) => this.switchTarget(id),
      () => this.addLevel(),
      availableKeys(this, this.project.customArt),
      (key) => this.addImage(key),
      (file, asBg) => this.uploadImage(file, asBg),
    )
    const onEsc = (e: KeyboardEvent) => {
      if (e.key !== 'Escape') return
      e.preventDefault()
      this.persist()
      this.scene.start('Menu')
    }
    window.addEventListener('keydown', onEsc)
    this.events.once(Phaser.Scenes.Events.SHUTDOWN, () => {
      window.removeEventListener('keydown', onEsc)
      this.panel?.destroy()
      this.chrome.destroy()
    })
    this.input.on('pointerdown', (p: Phaser.Input.Pointer) => this.onDown(p))
    this.input.on('pointermove', (p: Phaser.Input.Pointer) => this.onMove(p))
    this.input.on('pointerup', () => {
      this.drag = null
    })
    this.input.keyboard?.on('keydown-S', () => this.persist())
    this.input.keyboard?.on('keydown-C', () => this.copy())
    this.input.keyboard?.on('keydown-N', () => this.addWindow())
    this.input.keyboard?.on('keydown', (e: KeyboardEvent) => {
      if (e.key === '[') this.nudgeRot(-5)
      if (e.key === ']') this.nudgeRot(5)
    })
    this.input.keyboard?.on('keydown-BACKSPACE', () => this.removeSelected())
    this.input.keyboard?.on('keydown-DELETE', () => this.removeSelected())
    this.input.keyboard?.on('keydown-R', () => this.reset())
    this.input.keyboard?.on('keydown-ESC', () => {
      this.persist()
      this.scene.start('Menu')
    })
    this.input.keyboard?.addKey(Phaser.Input.Keyboard.KeyCodes.ESC)
    this.input.keyboard?.on('keydown-P', () => {
      this.persist()
      this.scene.start('Play')
    })
    this.rebuildStage()
  }

  private tabList(): { id: string; label: string }[] {
    return this.project.levels.map((l) => ({ id: l.id, label: l.name }))
  }

  private switchTarget(id: string): void {
    this.persist()
    this.target = id
    this.project.activeLevelId = id
    const found = this.project.levels.find((l) => l.id === id)
    if (found) {
      this.level = found
      this.wins = windowsToScreen(this.level)
      this.slingX = this.level.slingshot.origin.x
    }
    this.chrome.rebuildTabs(this.tabList(), this.target, (t) => this.switchTarget(t), () => this.addLevel())
    this.rebuildStage()
  }

  private rebuildStage(): void {
    this.selected = null
    this.drag = null
    for (const img of this.sprites.values()) img.destroy()
    this.sprites.clear()
    for (const btn of this.buttons.values()) btn.destroy()
    this.buttons.clear()
    this.children.getByName('sling-art')?.destroy()
    this.children.getByName('sling-art-bg')?.destroy()
    this.panel?.destroy()
    this.panel = null
    this.chrome.setAddVisible(false)
    if (hasTex(this, 'bg-building')) {
      this.add.image(GAME_WIDTH / 2, GAME_HEIGHT / 2, 'bg-building').setDisplaySize(GAME_WIDTH, GAME_HEIGHT).setName('sling-art-bg').setDepth(1)
    }
    if (hasTex(this, 'slingshot')) {
      this.add.image(this.slingX, this.level.bounds.groundY, 'slingshot').setOrigin(0.5, 1).setDisplaySize(200, 320).setName('sling-art')
    }
    this.panel = new EditorPanel(this.level, () => this.refreshHint())
    this.refreshHint()
    this.draw()
  }

  private spawn(p: PlacedImage): void {
    if (!hasTex(this, p.key)) return
    const img = this.add.image(p.x, p.y, p.key).setDepth(p.depth)
    img.setRotation(Phaser.Math.DegToRad(p.rotation))
    img.setScale(p.scale)
    img.setData('pid', p.id)
    this.sprites.set(p.id, img)
  }

  private titleBtn(id: string): TitleButton | undefined {
    return this.project.titleButtons.find((b) => b.id === id)
  }

  private placed(id: string): PlacedImage | undefined {
    return this.project.titleImages.find((p) => p.id === id)
  }

  private onDown(p: Phaser.Input.Pointer): void {
    const x = p.worldX
    const y = p.worldY
    if (this.target === 'title') {
      if (this.selected === 'play' || this.selected === 'editor') {
        const c = this.buttons.get(this.selected)
        if (c) {
          const hx = c.x - Math.sin(c.rotation) * 70
          const hy = c.y - Math.cos(c.rotation) * 70
          if (Phaser.Math.Distance.Between(x, y, hx, hy) < 14) {
            this.drag = { kind: 'btn-rot', id: this.selected }
            return
          }
        }
      }
      if (this.selected) {
        const img = this.sprites.get(this.selected)
        if (img) {
          const hx = img.x - Math.sin(img.rotation) * (img.displayHeight / 2 + 26)
          const hy = img.y - Math.cos(img.rotation) * (img.displayHeight / 2 + 26)
          if (Phaser.Math.Distance.Between(x, y, hx, hy) < 14) {
            this.drag = { kind: 'img-rot', id: this.selected }
            return
          }
          const sx = img.x + Math.cos(img.rotation) * (img.displayWidth / 2)
          const sy = img.y + Math.sin(img.rotation) * (img.displayWidth / 2)
          if (Phaser.Math.Distance.Between(x, y, sx, sy) < 14) {
            this.drag = {
              kind: 'img-scale',
              id: this.selected,
              start: this.placed(this.selected)?.scale ?? 1,
              dist: Math.max(8, Phaser.Math.Distance.Between(x, y, img.x, img.y)),
            }
            return
          }
        }
      }
      const btnHit = [...this.project.titleButtons].reverse().find((b) => {
        const c = this.buttons.get(b.id)
        if (!c) return false
        const w = b.id === 'play' ? 260 : 220
        const h = b.id === 'play' ? 84 : 64
        const dx = x - c.x
        const dy = y - c.y
        const ca = Math.cos(-c.rotation)
        const sa = Math.sin(-c.rotation)
        const lx = dx * ca - dy * sa
        const ly = dx * sa + dy * ca
        return Math.abs(lx) <= w / 2 && Math.abs(ly) <= h / 2
      })
      if (btnHit) {
        this.selected = btnHit.id
        this.drag = { kind: 'btn-move', id: btnHit.id, dx: x - btnHit.x, dy: y - btnHit.y }
        this.draw()
        return
      }
      const hit = [...this.project.titleImages].reverse().find((item) => {
        const img = this.sprites.get(item.id)
        return img ? img.getBounds().contains(x, y) : false
      })
      if (hit) {
        this.selected = hit.id
        this.drag = { kind: 'img-move', id: hit.id, dx: x - hit.x, dy: y - hit.y }
        this.draw()
        return
      }
      this.selected = null
      this.draw()
      return
    }
    const b = this.level.bounds
    if (Math.abs(y - b.groundY) < 10) {
      this.drag = { kind: 'ground', oy: y - b.groundY }
      this.selected = null
      this.draw()
      return
    }
    if (Math.abs(x - b.wallRight) < 10 && y < b.groundY) {
      this.drag = { kind: 'wall', ox: x - b.wallRight }
      this.selected = null
      this.draw()
      return
    }
    if (Math.abs(y - b.wallTop) < 10 && x < b.wallRight) {
      this.drag = { kind: 'roof', oy: y - b.wallTop }
      this.selected = null
      this.draw()
      return
    }
    if (Math.hypot(x - this.slingX, y - (b.groundY - 80)) < 50) {
      this.drag = { kind: 'sling', dx: x - this.slingX }
      this.selected = null
      this.draw()
      return
    }
    for (let i = this.wins.length - 1; i >= 0; i -= 1) {
      const w = this.wins[i]
      if (!w) continue
      if (x >= w.x + w.w - 14 && x <= w.x + w.w + 6 && y >= w.y + w.h - 14 && y <= w.y + w.h + 6) {
        this.selected = w.id
        this.drag = { kind: 'resize', id: w.id, ox: x, oy: y, ow: w.w, oh: w.h }
        this.draw()
        return
      }
      if (x >= w.x && x <= w.x + w.w && y >= w.y && y <= w.y + w.h) {
        this.selected = w.id
        this.drag = { kind: 'move', id: w.id, dx: x - w.x, dy: y - w.y }
        this.draw()
        return
      }
    }
    this.selected = null
    this.draw()
  }

  private onMove(p: Phaser.Input.Pointer): void {
    if (!this.drag) return
    const x = p.worldX
    const y = p.worldY
    if (this.drag.kind === 'btn-move') {
      const item = this.titleBtn(this.drag.id)
      const c = this.buttons.get(this.drag.id)
      if (item && c) {
        item.x = Math.round(x - this.drag.dx)
        item.y = Math.round(y - this.drag.dy)
        c.setPosition(item.x, item.y)
      }
    } else if (this.drag.kind === 'btn-rot') {
      const item = this.titleBtn(this.drag.id)
      const c = this.buttons.get(this.drag.id)
      if (item && c) {
        item.rotation = Math.round(Phaser.Math.RadToDeg(Math.atan2(y - c.y, x - c.x)) + 90)
        c.setRotation(Phaser.Math.DegToRad(item.rotation))
      }
    } else if (this.drag.kind === 'img-move') {
      const item = this.placed(this.drag.id)
      const img = this.sprites.get(this.drag.id)
      if (item && img) {
        item.x = Math.round(x - this.drag.dx)
        item.y = Math.round(y - this.drag.dy)
        img.setPosition(item.x, item.y)
      }
    } else if (this.drag.kind === 'img-rot') {
      const item = this.placed(this.drag.id)
      const img = this.sprites.get(this.drag.id)
      if (item && img) {
        item.rotation = Math.round(Phaser.Math.RadToDeg(Math.atan2(y - img.y, x - img.x)) + 90)
        img.setRotation(Phaser.Math.DegToRad(item.rotation))
      }
    } else if (this.drag.kind === 'img-scale') {
      const item = this.placed(this.drag.id)
      const img = this.sprites.get(this.drag.id)
      if (item && img) {
        const dist = Phaser.Math.Distance.Between(x, y, img.x, img.y)
        item.scale = Math.max(0.05, this.drag.start * (dist / this.drag.dist))
        img.setScale(item.scale)
      }
    } else if (this.drag.kind === 'ground') {
      this.level.bounds.groundY = Math.round(Phaser.Math.Clamp(y - this.drag.oy, 400, 710))
      this.syncSlingArt()
    } else if (this.drag.kind === 'wall') {
      this.level.bounds.wallRight = Math.round(Phaser.Math.Clamp(x - this.drag.ox, 700, 1270))
    } else if (this.drag.kind === 'roof') {
      this.level.bounds.wallTop = Math.round(Phaser.Math.Clamp(y - this.drag.oy, 0, 200))
    } else if (this.drag.kind === 'sling') {
      this.slingX = Math.round(Phaser.Math.Clamp(x - this.drag.dx, 80, 400))
      this.syncSlingArt()
    } else if (this.drag.kind === 'move') {
      const d = this.drag
      const w = this.wins.find((n) => n.id === d.id)
      if (w) {
        w.x = Math.round(x - d.dx)
        w.y = Math.round(y - d.dy)
      }
    } else if (this.drag.kind === 'resize') {
      const d = this.drag
      const w = this.wins.find((n) => n.id === d.id)
      if (w) {
        w.w = Math.round(Math.max(24, d.ow + (x - d.ox)))
        w.h = Math.round(Math.max(24, d.oh + (y - d.oy)))
      }
    }
    this.draw()
  }

  private nudgeRot(deg: number): void {
    if (this.target !== 'title' || !this.selected) return
    if (this.selected === 'play' || this.selected === 'editor') {
      const item = this.titleBtn(this.selected)
      const c = this.buttons.get(this.selected)
      if (!item || !c) return
      item.rotation += deg
      c.setRotation(Phaser.Math.DegToRad(item.rotation))
      this.draw()
      return
    }
    const item = this.placed(this.selected)
    const img = this.sprites.get(this.selected)
    if (!item || !img) return
    item.rotation += deg
    img.setRotation(Phaser.Math.DegToRad(item.rotation))
    this.draw()
  }

  private addImage(key: string): void {
    if (this.target !== 'title' || !key) return
    if (key.startsWith('__bg__:')) {
      this.setBackground(key.slice(7))
      return
    }
    const id = `img-${Date.now()}`
    const p: PlacedImage = { id, key, x: 640, y: 360, rotation: 0, scale: 0.4, depth: 15 }
    this.project.titleImages.push(p)
    this.spawn(p)
    this.selected = id
    this.draw()
  }

  private setBackground(key: string): void {
    if (!hasTex(this, key)) return
    const tex = this.textures.get(key).get()
    const scale = Math.max(GAME_WIDTH / tex.width, GAME_HEIGHT / tex.height)
    const old = this.project.titleImages.find((p) => p.id === 'bg')
    if (old) {
      old.key = key
      old.x = GAME_WIDTH / 2
      old.y = GAME_HEIGHT / 2
      old.rotation = 0
      old.scale = scale
      old.depth = 0
      this.sprites.get('bg')?.destroy()
      this.sprites.delete('bg')
    } else {
      this.project.titleImages.unshift({
        id: 'bg',
        key,
        x: GAME_WIDTH / 2,
        y: GAME_HEIGHT / 2,
        rotation: 0,
        scale,
        depth: 0,
      })
    }
    const placed = this.placed('bg')
    if (placed) this.spawn(placed)
    this.persist()
    this.draw()
    this.refreshHint('Background replaced, same full-screen size.')
  }

  private uploadImage(file: File, asBg = false): void {
    const reader = new FileReader()
    reader.onload = () => {
      const dataUrl = String(reader.result ?? '')
      void saveUserImage(file, dataUrl).then((art) => {
        if (!art) return
        this.project.customArt.push(art)
        const apply = () => {
          if (asBg) this.setBackground(art.key)
          else this.addImage(art.key)
        }
        if (this.textures.exists(art.key)) {
          apply()
          return
        }
        if (art.dataUrl) {
          this.textures.addBase64(art.key, art.dataUrl)
          this.time.delayedCall(80, apply)
          return
        }
        if (art.file) {
          this.load.image(art.key, art.file)
          this.load.once(Phaser.Loader.Events.COMPLETE, apply)
          this.load.start()
        }
      })
    }
    reader.readAsDataURL(file)
  }

  private addLevel(): void {
    this.persist()
    const n = this.project.levels.length + 1
    const next = cloneLevel(LEVEL_01)
    next.id = `level-${Date.now()}`
    next.name = `Level ${n}`
    this.project.levels.push(next)
    this.switchTarget(next.id)
  }

  private addWindow(): void {
    const n = this.wins.length
    this.wins.push({ id: `w${n}`, x: 700, y: 200, w: 80, h: 100 })
    this.selected = `w${n}`
    this.draw()
  }

  private removeSelected(): void {
    if (!this.selected) return
    if (this.target === 'title') {
      if (this.selected === 'play' || this.selected === 'editor') return
      this.project.titleImages = this.project.titleImages.filter((p) => p.id !== this.selected)
      this.sprites.get(this.selected)?.destroy()
      this.sprites.delete(this.selected)
    } else {
      this.wins = this.wins.filter((w) => w.id !== this.selected)
    }
    this.selected = null
    this.draw()
  }

  private persist(): void {
    this.level.building.windows = screenToWindows(this.wins, this.level)
    this.level.slingshot.origin.x = this.slingX
    const i = this.project.levels.findIndex((l) => l.id === this.level.id)
    if (i >= 0) this.project.levels[i] = this.level
    this.project.activeLevelId = this.level.id
    void saveProject(this.project).then((ok) => {
      this.refreshHint(ok ? 'Saved to public/editor/project-save.json' : 'Save failed — run npm run dev')
    })
  }

  private copy(): void {
    this.persist()
    const text = JSON.stringify(this.project, null, 2)
    void navigator.clipboard.writeText(text)
    const blob = new Blob([text], { type: 'application/json' })
    const a = document.createElement('a')
    a.href = URL.createObjectURL(blob)
    a.download = 'catapult-project.json'
    a.click()
    this.refreshHint('Copied + downloaded project JSON')
  }

  private reset(): void {
    void clearProject()
    this.project = defaultProject()
    this.level = cloneLevel(activeLevel(this.project))
    this.wins = windowsToScreen(this.level)
    this.slingX = this.level.slingshot.origin.x
    this.target = this.level.id
    this.chrome.rebuildTabs(this.tabList(), this.target, (t) => this.switchTarget(t), () => this.addLevel())
    this.rebuildStage()
    this.refreshHint('Reset to defaults')
  }

  private syncSlingArt(): void {
    const art = this.children.getByName('sling-art') as Phaser.GameObjects.Image | null
    if (!art) return
    art.setPosition(this.slingX, this.level.bounds.groundY)
  }

  private refreshHint(extra = ''): void {
    const lines = [
      'LEVEL  drag boxes  ·  corner = resize',
      'S save   C download   N add window   Del delete   P play   R reset   Esc menu',
      extra,
    ]
    this.hint.setText(lines.filter(Boolean).join('\n'))
  }

  private draw(): void {
    const g = this.gfx
    g.clear()
    if (this.target === 'title') {
      for (const p of this.project.titleImages) {
        const img = this.sprites.get(p.id)
        if (!img) continue
        const on = p.id === this.selected
        g.lineStyle(on ? 3 : 1, on ? 0xffe14a : 0x4dc3ff, on ? 1 : 0.5)
        const b = img.getBounds()
        g.strokeRect(b.x, b.y, b.width, b.height)
        if (!on) continue
        const hx = img.x - Math.sin(img.rotation) * (img.displayHeight / 2 + 26)
        const hy = img.y - Math.cos(img.rotation) * (img.displayHeight / 2 + 26)
        g.lineStyle(2, 0xffe14a, 1)
        g.lineBetween(img.x, img.y, hx, hy)
        g.fillStyle(0xffe14a, 1)
        g.fillCircle(hx, hy, 8)
        const sx = img.x + Math.cos(img.rotation) * (img.displayWidth / 2)
        const sy = img.y + Math.sin(img.rotation) * (img.displayWidth / 2)
        g.fillStyle(0xfff4e0, 1)
        g.fillCircle(sx, sy, 8)
      }
      for (const b of this.project.titleButtons) {
        const c = this.buttons.get(b.id)
        if (!c) continue
        const on = this.selected === b.id
        const w = b.id === 'play' ? 260 : 220
        const h = b.id === 'play' ? 84 : 64
        g.lineStyle(on ? 3 : 1, on ? 0xffe14a : 0x4dc3ff, 1)
        g.save()
        g.translateCanvas(c.x, c.y)
        g.rotateCanvas(c.rotation)
        g.strokeRect(-w / 2, -h / 2, w, h)
        g.restore()
        if (on) {
          const hx = c.x - Math.sin(c.rotation) * 70
          const hy = c.y - Math.cos(c.rotation) * 70
          g.lineStyle(2, 0xffe14a, 1)
          g.lineBetween(c.x, c.y, hx, hy)
          g.fillStyle(0xffe14a, 1)
          g.fillCircle(hx, hy, 8)
        }
      }
      return
    }
    const b = this.level.bounds
    g.lineStyle(3, 0x3dff7a, 1)
    g.lineBetween(0, b.groundY, GAME_WIDTH, b.groundY)
    g.lineStyle(3, 0xff3d6e, 1)
    g.lineBetween(b.wallRight, b.wallTop, b.wallRight, b.groundY)
    g.lineBetween(0, b.wallTop, b.wallRight, b.wallTop)
    for (const w of this.wins) {
      const on = w.id === this.selected
      g.lineStyle(on ? 3 : 2, on ? 0xffe14a : 0x4dc3ff, 1)
      g.fillStyle(on ? 0xffe14a : 0x4dc3ff, 0.18)
      g.fillRect(w.x, w.y, w.w, w.h)
      g.strokeRect(w.x, w.y, w.w, w.h)
      g.fillStyle(0xffe14a, 1)
      g.fillRect(w.x + w.w - 10, w.y + w.h - 10, 10, 10)
    }
    g.lineStyle(2, 0xffc14d, 1)
    g.strokeCircle(this.slingX, b.groundY - 80, 36)
  }
}
