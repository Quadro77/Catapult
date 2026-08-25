import type { LevelDef } from '../../types.ts'
import { BAKED } from '../baked.ts'

export const LEVEL_PALACE: LevelDef = {
  id: 'palace',
  name: 'Palace',
  bgKey: 'bg-palace',
  price: 14000,
  blurb: 'Red columns.',
  lives: BAKED.levels.palace.lives,
  bonusEvery: BAKED.levels.palace.bonusEvery,
  angerLimit: BAKED.levels.palace.angerLimit,
  building: {
    floors: 2,
    bays: 3,
    x: 0,
    y: 0,
    w: 1280,
    h: 720,
    windows: BAKED.levels.palace.windows,
  },
  director: BAKED.levels.palace.director,
  slingshot: BAKED.levels.palace.slingshot,
  bounds: BAKED.levels.palace.bounds,
}
