import { GAME_HEIGHT, GAME_WIDTH } from '../config.ts'
import type { Outcome } from '../types.ts'
import type { Building } from './Building.ts'
import type { Projectile } from './Projectile.ts'

export function checkOutcome(projectile: Projectile, building: Building): Outcome | null {
  if (projectile.resolved) return null
  const x = projectile.x
  const y = projectile.y
  if (y >= building.groundY) return { kind: 'splat', reason: 'ground' }
  if (x < -40 || x > GAME_WIDTH + 40 || y > GAME_HEIGHT + 40 || y < -120) {
    return { kind: 'splat', reason: 'bounds' }
  }
  const hit = building.hitTest(x, y)
  if (!hit) return null
  if (hit.kind === 'wall') return { kind: 'splat', reason: 'wall' }
  if (hit.slot.occupant?.defId === 'oldLady') return { kind: 'catch', windowId: hit.slot.id }
  if (hit.slot.occupant) return { kind: 'catcher', windowId: hit.slot.id }
  return null
}
