import type { UpgradeId } from '../types.ts'

export type UpgradeDef = {
  id: UpgradeId
  name: string
  blurb: string
  max: number
  baseCost: number
  growth: number
}

export type CoinPack = {
  id: string
  name: string
  coins: number
  price: string
}

export const UPGRADES: UpgradeDef[] = [
  { id: 'power', name: 'POWER', blurb: 'Harder launches. +3.5% each.', max: 10, baseCost: 120, growth: 1.62 },
  { id: 'stretch', name: 'STRETCH', blurb: 'Longer pull. +3% each.', max: 10, baseCost: 160, growth: 1.58 },
  { id: 'aim', name: 'AIM', blurb: 'Longer ghost trail. +7% each.', max: 10, baseCost: 90, growth: 1.55 },
  { id: 'soft', name: 'SOFT PAWS', blurb: 'Bigger window hits. Catchers too.', max: 10, baseCost: 140, growth: 1.6 },
  { id: 'lives', name: 'NINE LIVES', blurb: 'Start with extra lives.', max: 5, baseCost: 280, growth: 1.75 },
]

export const COIN_PACKS: CoinPack[] = [
  { id: 'pouch', name: 'POUCH', coins: 1000, price: '$0.99' },
  { id: 'sack', name: 'SACK', coins: 5500, price: '$4.99' },
  { id: 'chest', name: 'CHEST', coins: 12000, price: '$9.99' },
  { id: 'vault', name: 'VAULT', coins: 30000, price: '$19.99' },
]

export const AD_COINS = 150
export const STREAK_COINS = 5
export const CONTINUE_BASE = 80
export const CONTINUE_GROWTH = 1.7
export const MAX_CONTINUES = 3
export const DAILY_BASE = 80

export function upgradeCost(def: UpgradeDef, level: number): number {
  return Math.floor(def.baseCost * def.growth ** level)
}

export function continueCost(used: number): number {
  return Math.floor(CONTINUE_BASE * CONTINUE_GROWTH ** used)
}
