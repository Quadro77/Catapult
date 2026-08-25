import type { ScreenWindow } from './geometry.ts'
import type { OccupantId, OccupantInstance } from './types.ts'

const POP_BEAT = 180

export type OccupancyRules = {
  popInterval: [number, number]
  visibleMs: [number, number]
  maxConcurrent: number
  catcherChance: number
  pool: OccupantId[]
}

export type OccupancyWindow = ScreenWindow

export type OccupancySlot = OccupancyWindow & {
  occupant: OccupantInstance | null
  locked: boolean
  hiding: boolean
}

export type OccupancyEvent =
  | { kind: 'popped'; windowId: string; occupant: OccupantId }
  | { kind: 'hide'; windowId: string; missed: boolean }

export class Occupancy {
  private readonly rules: OccupancyRules
  private readonly rng: () => number
  private readonly slots: OccupancySlot[]
  private elapsed = 0
  private ladyHoles: number[] = []
  private catcherAt = 0
  private catcherDue = false
  private lastLadyId: string | null = null

  constructor(windows: OccupancyWindow[], rules: OccupancyRules, rng: () => number = Math.random) {
    this.rules = rules
    this.rng = rng
    this.slots = windows.map((w) => ({ ...w, occupant: null, locked: false, hiding: false }))
    for (let i = 0; i < rules.maxConcurrent; i++) {
      this.ladyHoles.push(this.rand(rules.popInterval[0], rules.popInterval[1]))
    }
    this.catcherAt = this.rand(rules.popInterval[0], rules.popInterval[1])
  }

  window(id: string): OccupancySlot | undefined {
    return this.slots.find((s) => s.id === id)
  }

  floor(id: string): number | undefined {
    return this.window(id)?.floor
  }

  hit(input: { x: number; y: number; pad?: number }): { kind: 'catch' | 'catcher'; windowId: string } | null {
    const pad = input.pad ?? 0
    for (const slot of this.slots) {
      if (!slot.occupant || slot.locked) continue
      if (
        input.x >= slot.x - pad &&
        input.x <= slot.x + slot.w + pad &&
        input.y >= slot.y - pad &&
        input.y <= slot.y + slot.h + pad
      ) {
        return {
          kind: slot.occupant.defId === 'oldLady' ? 'catch' : 'catcher',
          windowId: slot.id,
        }
      }
    }
    return null
  }

  lock(id: string): void {
    const slot = this.window(id)
    if (!slot) return
    slot.locked = true
    slot.hiding = false
  }

  unlock(id: string): void {
    const slot = this.window(id)
    if (!slot) return
    const wasLady = slot.occupant?.defId === 'oldLady'
    const wasCatcher = slot.occupant?.defId === 'dogCatcher'
    slot.locked = false
    slot.hiding = false
    slot.occupant = null
    if (wasLady) this.scheduleHole()
    if (wasCatcher) this.scheduleCatcherHole()
  }

  finishHide(id: string): boolean {
    const slot = this.window(id)
    if (!slot || slot.locked || !slot.hiding) return false
    const wasLady = slot.occupant?.defId === 'oldLady'
    const wasCatcher = slot.occupant?.defId === 'dogCatcher'
    slot.occupant = null
    slot.hiding = false
    if (wasLady) this.scheduleHole()
    if (wasCatcher) this.scheduleCatcherHole()
    return true
  }

  update(dt: number, _score = 0): OccupancyEvent[] {
    this.elapsed += dt
    const events = this.expire()
    const lone = this.hideLoneCatcher()
    if (lone) events.push(lone)
    this.rollCatcherHole()
    if (this.ladyHoles.some((h) => h <= this.elapsed) && this.ladyCount() < this.rules.maxConcurrent) {
      const popped = this.popLady()
      if (popped) events.push(popped)
    } else {
      const popped = this.popCatcher()
      if (popped) events.push(popped)
    }
    return events
  }

  private hideLoneCatcher(): OccupancyEvent | null {
    if (this.occupyingLadies() > 0) return null
    for (const slot of this.slots) {
      if (slot.occupant?.defId !== 'dogCatcher' || slot.hiding || slot.locked) continue
      slot.hiding = true
      return { kind: 'hide', windowId: slot.id, missed: false }
    }
    return null
  }

  private expire(): OccupancyEvent[] {
    const events: OccupancyEvent[] = []
    for (const slot of this.slots) {
      if (slot.occupant && !slot.hiding && this.elapsed >= slot.occupant.until && !slot.locked) {
        const missed = slot.occupant.defId === 'oldLady'
        slot.hiding = true
        events.push({ kind: 'hide', windowId: slot.id, missed })
      }
    }
    return events
  }

  private popLady(): OccupancyEvent | null {
    if (!this.allows('oldLady')) return null
    const due = this.ladyHoles.findIndex((h) => h <= this.elapsed)
    if (due < 0) return null
    const slot = this.pickWindow()
    if (!slot) return null
    this.ladyHoles.splice(due, 1)
    const stay = this.rand(this.rules.visibleMs[0], this.rules.visibleMs[1])
    slot.occupant = { defId: 'oldLady', windowId: slot.id, until: this.elapsed + stay }
    slot.hiding = false
    this.lastLadyId = slot.id
    this.delayOtherDue()
    return { kind: 'popped', windowId: slot.id, occupant: 'oldLady' }
  }

  private popCatcher(): OccupancyEvent | null {
    if (!this.catcherDue || this.elapsed < this.catcherAt) return null
    if (!this.allows('dogCatcher') || this.has('dogCatcher')) return null
    if (this.occupyingLadies() === 0) return null
    const slot = this.pickWindow()
    if (!slot) return null
    const stay = this.rand(this.rules.visibleMs[0], this.rules.visibleMs[1])
    slot.occupant = { defId: 'dogCatcher', windowId: slot.id, until: this.elapsed + stay }
    slot.hiding = false
    this.catcherDue = false
    this.delayOtherDue()
    return { kind: 'popped', windowId: slot.id, occupant: 'dogCatcher' }
  }

  private pickWindow(): OccupancySlot | undefined {
    const free = (w: OccupancySlot) => !w.occupant && !w.locked
    const fresh = this.slots.filter((w) => free(w) && w.id !== this.lastLadyId)
    const pool = fresh.length > 0 ? fresh : this.slots.filter(free)
    if (pool.length === 0) return undefined
    return pool[Math.floor(this.rng() * pool.length)]
  }

  private scheduleHole(): void {
    this.ladyHoles.push(this.elapsed + this.rand(this.rules.popInterval[0], this.rules.popInterval[1]))
  }

  private scheduleCatcherHole(): void {
    this.catcherDue = false
    this.catcherAt = this.elapsed + this.rand(this.rules.popInterval[0], this.rules.popInterval[1])
  }

  private rollCatcherHole(): void {
    if (this.catcherDue || this.has('dogCatcher') || this.elapsed < this.catcherAt) return
    if (this.rng() < this.rules.catcherChance) this.catcherDue = true
    else this.catcherAt = this.elapsed + this.rand(this.rules.popInterval[0], this.rules.popInterval[1])
  }

  private delayOtherDue(): void {
    this.ladyHoles = this.ladyHoles.map((h) => (h <= this.elapsed ? this.elapsed + POP_BEAT : h))
    if (this.catcherDue && this.catcherAt <= this.elapsed) this.catcherAt = this.elapsed + POP_BEAT
  }

  private ladyCount(): number {
    return this.slots.filter((s) => s.occupant?.defId === 'oldLady').length
  }

  private occupyingLadies(): number {
    return this.slots.filter((s) => s.occupant?.defId === 'oldLady' && !s.hiding).length
  }

  private has(defId: OccupantId): boolean {
    return this.slots.some((w) => w.occupant?.defId === defId)
  }

  private allows(defId: OccupantId): boolean {
    return this.rules.pool.includes(defId)
  }

  private rand(min: number, max: number): number {
    return min + this.rng() * (max - min)
  }
}
