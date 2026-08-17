import type { CatDef } from '../types.ts'

export const CATS: Record<string, CatDef> = {
  tabby: {
    id: 'tabby',
    name: 'Tabby',
    mass: 1,
    drag: 0,
    radius: 22,
    color: 0xf28c28,
  },
}

export const DEFAULT_CAT = CATS.tabby
