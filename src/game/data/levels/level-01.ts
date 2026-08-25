import type { LevelDef } from '../../types.ts'
import { BAKED } from '../baked.ts'

export const LEVEL_01: LevelDef = {
  id: 'brownstone-1',
  name: 'Brownstone',
  bgKey: 'bg-building',
  price: 0,
  blurb: 'The first stoop.',
  lives: BAKED.levels['brownstone-1'].lives,
  bonusEvery: BAKED.levels['brownstone-1'].bonusEvery,
  angerLimit: BAKED.levels['brownstone-1'].angerLimit,
  building: {
    floors: 3,
    bays: 3,
    x: 0,
    y: 0,
    w: 1280,
    h: 720,
    windows: BAKED.levels['brownstone-1'].windows,
  },
  director: BAKED.levels['brownstone-1'].director,
  slingshot: BAKED.levels['brownstone-1'].slingshot,
  bounds: BAKED.levels['brownstone-1'].bounds,
}
