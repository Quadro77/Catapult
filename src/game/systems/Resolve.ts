import { GAME_HEIGHT, GAME_WIDTH } from '../config.ts'
import type { Occupancy } from '../occupancy.ts'
import type { Outcome } from '../types.ts'

export function checkOutcome(input: {
  resolved: boolean
  x: number
  y: number
  pad?: number
  groundY: number
  wallRight: number
  wallTop: number
  occupancy: Occupancy
}): Outcome | null {
  if (input.resolved) return null
  if (input.y >= input.groundY) return { kind: 'splat', reason: 'ground' }
  if (input.x < -40 || input.x > GAME_WIDTH + 40 || input.y > GAME_HEIGHT + 40 || input.y < -120) {
    return { kind: 'splat', reason: 'bounds' }
  }
  const hit = input.occupancy.hit({ x: input.x, y: input.y, pad: input.pad ?? 0 })
  if (hit) return hit
  if (input.x >= input.wallRight && input.y >= input.wallTop && input.y < input.groundY) {
    return { kind: 'splat', reason: 'wall' }
  }
  return null
}
