import type { LevelDef } from '../../types.ts'
import { BAKED } from '../baked.ts'

export const LEVEL_CHALET: LevelDef = {
  id: 'chalet',
  name: 'Chalet',
  bgKey: 'bg-chalet',
  price: 2200,
  blurb: 'Snow on the eaves.',
  lives: BAKED.levels.chalet.lives,
  bonusEvery: BAKED.levels.chalet.bonusEvery,
  angerLimit: BAKED.levels.chalet.angerLimit,
  building: {
    floors: 2,
    bays: 3,
    x: 0,
    y: 0,
    w: 1280,
    h: 720,
    windows: BAKED.levels.chalet.windows,
  },
  director: BAKED.levels.chalet.director,
  slingshot: BAKED.levels.chalet.slingshot,
  bounds: BAKED.levels.chalet.bounds,
}
