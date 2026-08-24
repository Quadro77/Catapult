import { CAT_LIST, CATS, DEFAULT_CAT } from '../data/cats.ts'
import { DEFAULT_LEVEL, LEVEL_BY_ID, LEVEL_LIST } from '../data/levels/index.ts'
import { DAILY_BASE, UPGRADES, upgradeCost } from '../data/shop.ts'
import type { CatDef, LevelDef, UpgradeId } from '../types.ts'

const KEY = 'catapult-player'

export type PlayerSave = {
  coins: number
  ownedCats: string[]
  catId: string
  levels: Partial<Record<UpgradeId, number>>
  ownedLevels: string[]
  levelId: string
  dailyAt: string
  dailyStreak: number
}

const coinFns = new Set<(n: number) => void>()

function blank(): PlayerSave {
  return {
    coins: 0,
    ownedCats: [DEFAULT_CAT.id],
    catId: DEFAULT_CAT.id,
    levels: {},
    ownedLevels: [DEFAULT_LEVEL.id],
    levelId: DEFAULT_LEVEL.id,
    dailyAt: '',
    dailyStreak: 0,
  }
}

export function loadPlayer(): PlayerSave {
  const fallback = blank()
  try {
    const raw = localStorage.getItem(KEY)
    if (!raw) return fallback
    const parsed = JSON.parse(raw) as Partial<PlayerSave>
    const owned = Array.isArray(parsed.ownedCats)
      ? parsed.ownedCats.filter((id) => id in CATS)
      : fallback.ownedCats
    if (!owned.includes(DEFAULT_CAT.id)) owned.unshift(DEFAULT_CAT.id)
    const catId = parsed.catId && owned.includes(parsed.catId) ? parsed.catId : DEFAULT_CAT.id
    const ownedLevels = Array.isArray(parsed.ownedLevels)
      ? parsed.ownedLevels.filter((id) => id in LEVEL_BY_ID)
      : fallback.ownedLevels
    if (!ownedLevels.includes(DEFAULT_LEVEL.id)) ownedLevels.unshift(DEFAULT_LEVEL.id)
    const levelId =
      parsed.levelId && ownedLevels.includes(parsed.levelId) ? parsed.levelId : DEFAULT_LEVEL.id
    return {
      coins: Number.isFinite(parsed.coins) ? Math.max(0, Math.floor(parsed.coins as number)) : fallback.coins,
      ownedCats: owned,
      catId,
      levels: parsed.levels ?? {},
      ownedLevels,
      levelId,
      dailyAt: typeof parsed.dailyAt === 'string' ? parsed.dailyAt : '',
      dailyStreak: Number.isFinite(parsed.dailyStreak) ? Math.max(0, Math.floor(parsed.dailyStreak as number)) : 0,
    }
  } catch {
    return fallback
  }
}

export function savePlayer(next: PlayerSave): void {
  try {
    localStorage.setItem(KEY, JSON.stringify(next))
  } catch {
    /* quota / private mode */
  }
  for (const fn of coinFns) fn(next.coins)
}

export function onCoins(fn: (n: number) => void): () => void {
  coinFns.add(fn)
  return () => {
    coinFns.delete(fn)
  }
}

export function getCoins(): number {
  return loadPlayer().coins
}

export function addCoins(n: number): number {
  if (n <= 0) return getCoins()
  const p = loadPlayer()
  p.coins += Math.floor(n)
  savePlayer(p)
  return p.coins
}

export function spendCoins(n: number): boolean {
  const cost = Math.floor(n)
  const p = loadPlayer()
  if (p.coins < cost) return false
  p.coins -= cost
  savePlayer(p)
  return true
}

export function formatCoins(n: number): string {
  return Math.max(0, Math.floor(n)).toLocaleString('en-US')
}

export function todayStamp(): string {
  const d = new Date()
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

export function dailyReady(): boolean {
  return loadPlayer().dailyAt !== todayStamp()
}

export function claimDaily(): number {
  if (!dailyReady()) return 0
  const p = loadPlayer()
  const yesterday = new Date()
  yesterday.setDate(yesterday.getDate() - 1)
  const y = `${yesterday.getFullYear()}-${String(yesterday.getMonth() + 1).padStart(2, '0')}-${String(yesterday.getDate()).padStart(2, '0')}`
  p.dailyStreak = p.dailyAt === y ? Math.min(7, p.dailyStreak + 1) : 1
  p.dailyAt = todayStamp()
  const reward = DAILY_BASE * p.dailyStreak
  p.coins += reward
  savePlayer(p)
  return reward
}

export function upgradeLevel(id: UpgradeId): number {
  return loadPlayer().levels[id] ?? 0
}

export function buyUpgrade(id: UpgradeId): boolean {
  const def = UPGRADES.find((u) => u.id === id)
  if (!def) return false
  const p = loadPlayer()
  const level = p.levels[id] ?? 0
  if (level >= def.max) return false
  const cost = upgradeCost(def, level)
  if (p.coins < cost) return false
  p.coins -= cost
  p.levels[id] = level + 1
  savePlayer(p)
  return true
}

export function equippedCat(): CatDef {
  return CATS[loadPlayer().catId] ?? DEFAULT_CAT
}

export function ownsCat(id: string): boolean {
  return loadPlayer().ownedCats.includes(id)
}

export function buyCat(id: string): boolean {
  const cat = CATS[id]
  if (!cat) return false
  const p = loadPlayer()
  if (p.ownedCats.includes(id)) return false
  if (p.coins < cat.price) return false
  p.coins -= cat.price
  p.ownedCats.push(id)
  p.catId = id
  savePlayer(p)
  return true
}

export function selectCat(id: string): boolean {
  const p = loadPlayer()
  if (!p.ownedCats.includes(id)) return false
  p.catId = id
  savePlayer(p)
  return true
}

export function garageCats(): CatDef[] {
  return CAT_LIST
}

export function garageLevels(): LevelDef[] {
  return LEVEL_LIST
}

export function ownsLevel(id: string): boolean {
  return loadPlayer().ownedLevels.includes(id)
}

export function equippedLevel(): LevelDef {
  return LEVEL_BY_ID[loadPlayer().levelId] ?? DEFAULT_LEVEL
}

export function equippedLevelId(): string {
  return loadPlayer().levelId
}

export function buyLevel(id: string): boolean {
  const level = LEVEL_BY_ID[id]
  if (!level) return false
  const p = loadPlayer()
  if (p.ownedLevels.includes(id)) return false
  if (p.coins < level.price) return false
  p.coins -= level.price
  p.ownedLevels.push(id)
  p.levelId = id
  savePlayer(p)
  return true
}

export function selectLevel(id: string): boolean {
  const p = loadPlayer()
  if (!p.ownedLevels.includes(id)) return false
  p.levelId = id
  savePlayer(p)
  return true
}
