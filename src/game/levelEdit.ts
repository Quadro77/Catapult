import { geometry, toWindowDefs, type ScreenWindow } from './geometry.ts'
import type { LevelDef } from './types.ts'

export class LevelEdit {
  readonly level: LevelDef
  windows: ScreenWindow[]
  slingX: number

  private constructor(level: LevelDef, windows: ScreenWindow[], slingX: number) {
    this.level = level
    this.windows = windows
    this.slingX = slingX
  }

  static open(level: LevelDef): LevelEdit {
    const space = geometry(level)
    return new LevelEdit(level, space.windows, space.sling.x)
  }

  addWindow(): ScreenWindow {
    const used = new Set(this.windows.map((w) => w.id))
    let n = this.windows.length
    while (used.has(`w${n}`)) n += 1
    const added: ScreenWindow = {
      id: `w${n}`,
      floor: 0,
      bay: n,
      x: 700,
      y: 200,
      w: 80,
      h: 100,
    }
    this.windows.push(added)
    return added
  }

  removeWindow(id: string): boolean {
    const next = this.windows.filter((w) => w.id !== id)
    if (next.length === this.windows.length) return false
    this.windows = next
    return true
  }

  moveWindow(id: string, x: number, y: number): void {
    const w = this.window(id)
    if (!w) return
    w.x = Math.round(x)
    w.y = Math.round(y)
  }

  resizeWindow(id: string, w: number, h: number): void {
    const slot = this.window(id)
    if (!slot) return
    slot.w = Math.round(Math.max(24, w))
    slot.h = Math.round(Math.max(24, h))
  }

  setGround(y: number): void {
    this.level.bounds.groundY = Math.round(clamp(y, 400, 710))
  }

  setWall(x: number): void {
    this.level.bounds.wallRight = Math.round(clamp(x, 700, 1270))
  }

  setRoof(y: number): void {
    this.level.bounds.wallTop = Math.round(clamp(y, 0, 200))
  }

  setSlingX(x: number): void {
    this.slingX = Math.round(clamp(x, 80, 400))
  }

  window(id: string): ScreenWindow | undefined {
    return this.windows.find((w) => w.id === id)
  }

  commit(): LevelDef {
    this.level.building.windows = toWindowDefs(this.windows, this.level.building)
    this.level.slingshot.origin.x = this.slingX
    return this.level
  }
}

function clamp(n: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, n))
}
