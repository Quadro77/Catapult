import type { CatDef } from '../types.ts'

export const CAT_LIST: CatDef[] = [
  {
    id: 'tabby',
    name: 'Tabby',
    mass: 1,
    drag: 0,
    radius: 22,
    color: 0xf28c28,
    price: 0,
    blurb: 'The alley regular.',
    coinMul: 1,
  },
  {
    id: 'tuxedo',
    name: 'Tuxedo',
    mass: 0.84,
    drag: 0,
    radius: 20,
    color: 0x3a4258,
    price: 500,
    blurb: 'Light. Snappy. Smug.',
    coinMul: 1.1,
  },
  {
    id: 'calico',
    name: 'Calico',
    mass: 1.12,
    drag: 18,
    radius: 26,
    color: 0xf0a070,
    price: 2200,
    blurb: 'A bigger target.',
    coinMul: 1.2,
  },
  {
    id: 'bombay',
    name: 'Bombay',
    mass: 0.72,
    drag: 0,
    radius: 18,
    color: 0x2a2a32,
    price: 8000,
    blurb: 'A black dart.',
    coinMul: 1.35,
  },
  {
    id: 'goldie',
    name: 'Goldie',
    mass: 0.95,
    drag: 0,
    radius: 24,
    color: 0xffe14a,
    price: 25000,
    blurb: 'Coins cling to her.',
    coinMul: 1.75,
  },
]

export const CATS: Record<string, CatDef> = Object.fromEntries(CAT_LIST.map((c) => [c.id, c]))

export const DEFAULT_CAT = CAT_LIST[0]
