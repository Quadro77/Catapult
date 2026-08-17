import { OCCUPANTS } from '../data/occupants.ts'
import type { LevelDef, OccupantInstance } from '../types.ts'
import type { Building, WindowSlot } from './Building.ts'

export class Director {
  private building: Building
  private interval: [number, number]
  private visibleMs: [number, number]
  private maxConcurrent: number
  private catcherChance: number
  private cooldown: number
  private elapsed = 0
  private onPop: (() => void) | null
  private onMiss: (() => void) | null

  constructor(building: Building, level: LevelDef, onPop?: () => void, onMiss?: () => void) {
    this.building = building
    this.interval = level.director.popInterval
    this.visibleMs = level.director.visibleMs
    this.maxConcurrent = level.director.maxConcurrent
    this.catcherChance = level.director.catcherChance ?? 0.25
    this.cooldown = 420
    this.onPop = onPop ?? null
    this.onMiss = onMiss ?? null
  }

  update(dt: number): void {
    this.elapsed += dt
    this.cooldown -= dt
    for (const slot of this.building.windows) {
      if (slot.occupant && !slot.hiding && this.elapsed >= slot.occupant.until && !slot.locked) {
        const missedLady = slot.occupant.defId === 'oldLady'
        this.building.hideOccupant(slot)
        if (missedLady) this.onMiss?.()
      }
    }
    const active = this.building.windows.filter((w) => w.occupant && !w.locked).length
    if (this.cooldown <= 0 && active < this.maxConcurrent) {
      this.pop()
      this.cooldown = this.rand(this.interval[0], this.interval[1])
    }
  }

  occupantAt(slot: WindowSlot): OccupantInstance | null {
    return slot.occupant
  }

  private pop(): void {
    const open = this.building.windows.filter((w) => !w.occupant && !w.locked)
    if (open.length === 0) return
    const slot = open[Math.floor(Math.random() * open.length)]
    const defId = Math.random() < this.catcherChance ? 'dogCatcher' : 'oldLady'
    if (!slot || !defId || !OCCUPANTS[defId]) return
    const occupant: OccupantInstance = {
      defId,
      windowId: slot.id,
      until: this.elapsed + this.rand(this.visibleMs[0], this.visibleMs[1]),
    }
    this.building.showOccupant(slot, occupant)
    this.onPop?.()
  }

  private rand(min: number, max: number): number {
    return min + Math.random() * (max - min)
  }
}
