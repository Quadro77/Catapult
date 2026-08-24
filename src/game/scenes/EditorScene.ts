import { GAME_HEIGHT, GAME_WIDTH } from '../config.ts'
import { cloneLevel } from '../data/layout.ts'
import { LEVEL_01 } from '../data/levels/level-01.ts'
import { activeLevel, clearProject, defaultProject, loadProject, saveProject } from '../data/project.ts'
import { LevelEdit } from '../levelEdit.ts'
import { stopAllMusic } from '../systems/Audio.ts'
import { addFullscreenBadge } from '../systems/fullscreen.ts'
import { hasTex } from '../systems/chroma.ts'
import { EditorChrome } from '../systems/EditorChrome.ts'
import { EditorPanel } from '../systems/EditorPanel.ts'
import type { ProjectSave } from '../types.ts'

type Drag =
  | { kind: 'move'; id: string; dx: number; dy: number }
  | { kind: 'resize'; id: string; ox: number; oy: number; ow: number; oh: number }
  | { kind: 'ground'; oy: number }
  | { kind: 'wall'; ox: number }
  | { kind: 'roof'; oy: number }
  | { kind: 'sling'; dx: number }

export class EditorScene extends Phaser.Scene {
  private project!: ProjectSave
  private edit!: LevelEdit
  private selected: string | null = null
  private drag: Drag | null = null
  private gfx!: Phaser.GameObjects.Graphics
  private hint!: Phaser.GameObjects.Text
  private panel: EditorPanel | null = null
  private chrome!: EditorChrome

  constructor() {
    super({ key: 'Editor' })
  }

  create(): void {
    stopAllMusic()
    addFullscreenBadge(this)
    this.project = loadProject()
    this.edit = LevelEdit.open(cloneLevel(activeLevel(this.project)))
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
      this.edit.level.id,
      (id) => this.switchLevel(id),
      () => this.addLevel(),
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

  private switchLevel(id: string): void {
    this.persist()
    this.project.activeLevelId = id
    const found = this.project.levels.find((l) => l.id === id)
    if (found) this.edit = LevelEdit.open(found)
    this.chrome.rebuildTabs(this.tabList(), this.edit.level.id, (t) => this.switchLevel(t), () => this.addLevel())
    this.rebuildStage()
  }

  private rebuildStage(): void {
    this.selected = null
    this.drag = null
    this.children.getByName('sling-art')?.destroy()
    this.children.getByName('sling-art-bg')?.destroy()
    this.panel?.destroy()
    this.panel = null
    const bgKey = this.edit.level.bgKey || 'bg-building'
    if (hasTex(this, bgKey)) {
      this.add
        .image(GAME_WIDTH / 2, GAME_HEIGHT / 2, bgKey)
        .setDisplaySize(GAME_WIDTH, GAME_HEIGHT)
        .setName('sling-art-bg')
        .setDepth(1)
    }
    if (hasTex(this, 'slingshot')) {
      this.add
        .image(this.edit.slingX, this.edit.level.bounds.groundY, 'slingshot')
        .setOrigin(0.5, 1)
        .setDisplaySize(200, 320)
        .setName('sling-art')
    }
    this.panel = new EditorPanel(this.edit.level, () => this.refreshHint())
    this.refreshHint()
    this.draw()
  }

  private onDown(p: Phaser.Input.Pointer): void {
    const x = p.worldX
    const y = p.worldY
    const b = this.edit.level.bounds
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
    if (Math.hypot(x - this.edit.slingX, y - (b.groundY - 80)) < 50) {
      this.drag = { kind: 'sling', dx: x - this.edit.slingX }
      this.selected = null
      this.draw()
      return
    }
    for (let i = this.edit.windows.length - 1; i >= 0; i -= 1) {
      const w = this.edit.windows[i]
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
    if (this.drag.kind === 'ground') {
      this.edit.setGround(y - this.drag.oy)
      this.syncSlingArt()
    } else if (this.drag.kind === 'wall') {
      this.edit.setWall(x - this.drag.ox)
    } else if (this.drag.kind === 'roof') {
      this.edit.setRoof(y - this.drag.oy)
    } else if (this.drag.kind === 'sling') {
      this.edit.setSlingX(x - this.drag.dx)
      this.syncSlingArt()
    } else if (this.drag.kind === 'move') {
      this.edit.moveWindow(this.drag.id, x - this.drag.dx, y - this.drag.dy)
    } else if (this.drag.kind === 'resize') {
      this.edit.resizeWindow(this.drag.id, this.drag.ow + (x - this.drag.ox), this.drag.oh + (y - this.drag.oy))
    }
    this.draw()
  }

  private addLevel(): void {
    this.persist()
    const n = this.project.levels.length + 1
    const next = cloneLevel(LEVEL_01)
    next.id = `level-${Date.now()}`
    next.name = `Level ${n}`
    this.project.levels.push(next)
    this.switchLevel(next.id)
  }

  private addWindow(): void {
    this.selected = this.edit.addWindow().id
    this.draw()
  }

  private removeSelected(): void {
    if (!this.selected) return
    this.edit.removeWindow(this.selected)
    this.selected = null
    this.draw()
  }

  private persist(): void {
    const level = this.edit.commit()
    const i = this.project.levels.findIndex((l) => l.id === level.id)
    if (i >= 0) this.project.levels[i] = level
    this.project.activeLevelId = level.id
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
    this.edit = LevelEdit.open(cloneLevel(activeLevel(this.project)))
    this.chrome.rebuildTabs(this.tabList(), this.edit.level.id, (t) => this.switchLevel(t), () => this.addLevel())
    this.rebuildStage()
    this.refreshHint('Reset to defaults')
  }

  private syncSlingArt(): void {
    const art = this.children.getByName('sling-art') as Phaser.GameObjects.Image | null
    if (!art) return
    art.setPosition(this.edit.slingX, this.edit.level.bounds.groundY)
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
    const b = this.edit.level.bounds
    g.lineStyle(3, 0x3dff7a, 1)
    g.lineBetween(0, b.groundY, GAME_WIDTH, b.groundY)
    g.lineStyle(3, 0xff3d6e, 1)
    g.lineBetween(b.wallRight, b.wallTop, b.wallRight, b.groundY)
    g.lineBetween(0, b.wallTop, b.wallRight, b.wallTop)
    for (const w of this.edit.windows) {
      const on = w.id === this.selected
      g.lineStyle(on ? 3 : 2, on ? 0xffe14a : 0x4dc3ff, 1)
      g.fillStyle(on ? 0xffe14a : 0x4dc3ff, 0.18)
      g.fillRect(w.x, w.y, w.w, w.h)
      g.strokeRect(w.x, w.y, w.w, w.h)
      g.fillStyle(0xffe14a, 1)
      g.fillRect(w.x + w.w - 10, w.y + w.h - 10, 10, 10)
    }
    g.lineStyle(2, 0xffc14d, 1)
    g.strokeCircle(this.edit.slingX, b.groundY - 80, 36)
  }
}
