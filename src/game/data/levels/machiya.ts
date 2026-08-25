import type { LevelDef } from '../../types.ts'
import { BAKED } from '../baked.ts'

export const LEVEL_MACHIYA: LevelDef = {
  id: 'machiya',
  name: 'Machiya',
  bgKey: 'bg-machiya',
  price: 900,
  blurb: 'Paper and lanterns.',
  lives: BAKED.levels.machiya.lives,
  bonusEvery: BAKED.levels.machiya.bonusEvery,
  angerLimit: BAKED.levels.machiya.angerLimit,
  building: {
    floors: 2,
    bays: 3,
    x: 0,
    y: 0,
    w: 1280,
    h: 720,
    windows: BAKED.levels.machiya.windows,
  },
  director: BAKED.levels.machiya.director,
  slingshot: BAKED.levels.machiya.slingshot,
  bounds: BAKED.levels.machiya.bounds,
}
