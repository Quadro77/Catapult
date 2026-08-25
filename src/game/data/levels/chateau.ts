import type { LevelDef } from '../../types.ts'
import { BAKED } from '../baked.ts'

export const LEVEL_CHATEAU: LevelDef = {
  id: 'chateau',
  name: 'Chateau',
  bgKey: 'bg-chateau',
  price: 5500,
  blurb: 'Blue shutters.',
  lives: BAKED.levels.chateau.lives,
  bonusEvery: BAKED.levels.chateau.bonusEvery,
  angerLimit: BAKED.levels.chateau.angerLimit,
  building: {
    floors: 2,
    bays: 4,
    x: 0,
    y: 0,
    w: 1280,
    h: 720,
    windows: BAKED.levels.chateau.windows,
  },
  director: BAKED.levels.chateau.director,
  slingshot: BAKED.levels.chateau.slingshot,
  bounds: BAKED.levels.chateau.bounds,
}
