import type { UpgradeId } from './types.ts'

export type LoadoutCat = {
  mass: number
  drag: number
  radius: number
  color: number
  coinMul: number
}

export type LoadoutSling = {
  maxPull: number
  power: number
  gravity: number
  ghostT: number
}

export type Loadout = {
  power: number
  maxPull: number
  gravity: number
  ghostT: number
  hitPad: number
  lives: number
  coinMul: number
  mass: number
  drag: number
  radius: number
  color: number
}

const POWER_PER_RANK = 0.07
const STRETCH_PER_RANK = 0.06
const AIM_PER_RANK = 0.14
const SOFT_PAD_PER_RANK = 1.8

export function loadout(input: {
  cat: LoadoutCat
  ranks: Partial<Record<UpgradeId, number>>
  sling: LoadoutSling
  baseLives: number
}): Loadout {
  const powerRank = input.ranks.power ?? 0
  const stretchRank = input.ranks.stretch ?? 0
  const aimRank = input.ranks.aim ?? 0
  const softRank = input.ranks.soft ?? 0
  const livesRank = input.ranks.lives ?? 0
  return {
    power: input.sling.power * (1 + POWER_PER_RANK * powerRank),
    maxPull: input.sling.maxPull * (1 + STRETCH_PER_RANK * stretchRank),
    gravity: input.sling.gravity,
    ghostT: input.sling.ghostT * (1 + AIM_PER_RANK * aimRank),
    hitPad: SOFT_PAD_PER_RANK * softRank,
    lives: input.baseLives + livesRank,
    coinMul: input.cat.coinMul,
    mass: input.cat.mass,
    drag: input.cat.drag,
    radius: input.cat.radius,
    color: input.cat.color,
  }
}
