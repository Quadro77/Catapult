import type { ScreenWindow } from './geometry.ts'
import type { OccupantId, OccupantInstance } from './types.ts'

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
  private hopAt = 0
  private catcherAt = 0
  private catcherQueued = false
  private catcherLadyId: string | null = null
  private lastLadyId: string | null = null

  constructor(windows: OccupancyWindow[], rules: OccupancyRules, rng: () => number = Math.random) {
    this.rules = rules
    this.rng = rng
    this.slots = windows.map((w) => ({ ...w, occupant: null, locked: false, hiding: false }))
    this.hopAt = this.rand(rules.popInterval[0], rules.popInterval[1])
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
    slot.locked = false
    slot.hiding = false
    slot.occupant = null
    if (wasLady) this.scheduleHole()
  }

  finishHide(id: string): boolean {
    const slot = this.window(id)
    if (!slot || slot.locked || !slot.hiding) return false
    const wasLady = slot.occupant?.defId === 'oldLady'
    slot.occupant = null
    slot.hiding = false
    if (wasLady) this.scheduleHole()
    return true
  }

  update(dt: number, _score = 0): OccupancyEvent[] {
    this.elapsed += dt
    const events = this.expire()
    if (this.elapsed >= this.hopAt) {
      while (this.ladyCount() < this.rules.maxConcurrent) {
        const popped = this.popLady()
        if (!popped) break
        events.push(popped)
      }
    }
    if (this.catcherQueued && this.elapsed >= this.catcherAt) {
      const popped = this.popCatcher()
      if (popped) events.push(popped)
    }
    return events
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
    const slot = this.pickWindow()
    if (!slot) return null
    const stay = this.rand(this.rules.visibleMs[0], this.rules.visibleMs[1])
    slot.occupant = { defId: 'oldLady', windowId: slot.id, until: this.elapsed + stay }
    slot.hiding = false
    this.lastLadyId = slot.id
    if (!this.catcherQueued && !this.has('dogCatcher') && this.rng() < this.rules.catcherChance) {
      this.catcherQueued = true
      this.catcherAt = this.elapsed + this.rand(50, 140)
      this.catcherLadyId = slot.id
    }
    return { kind: 'popped', windowId: slot.id, occupant: 'oldLady' }
  }

  private popCatcher(): OccupancyEvent | null {
    this.catcherQueued = false
    if (!this.allows('dogCatcher') || this.has('dogCatcher')) return null
    const lady = this.catcherLadyId ? this.window(this.catcherLadyId) : undefined
    if (!lady?.occupant || lady.occupant.defId !== 'oldLady') return null
    const slot = this.pickWindow(lady.id)
    if (!slot) return null
    slot.occupant = {
      defId: 'dogCatcher',
      windowId: slot.id,
      until: lady.occupant.until + 200,
    }
    slot.hiding = false
    return { kind: 'popped', windowId: slot.id, occupant: 'dogCatcher' }
  }

  private pickWindow(excludeId?: string): OccupancySlot | undefined {
    const free = (w: OccupancySlot) => !w.occupant && !w.locked && w.id !== excludeId
    const fresh = this.slots.filter((w) => free(w) && w.id !== this.lastLadyId)
    const pool = fresh.length > 0 ? fresh : this.slots.filter(free)
    if (pool.length === 0) return undefined
    return pool[Math.floor(this.rng() * pool.length)]
  }

  private scheduleHole(): void {
    if (this.hopAt <= this.elapsed) {
      this.hopAt = this.elapsed + this.rand(this.rules.popInterval[0], this.rules.popInterval[1])
    }
  }

  private ladyCount(): number {
    return this.slots.filter((s) => s.occupant?.defId === 'oldLady').length
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
