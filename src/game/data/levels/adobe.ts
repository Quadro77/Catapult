import type { LevelDef } from '../../types.ts'
import { BAKED } from '../baked.ts'

export const LEVEL_ADOBE: LevelDef = {
  id: 'adobe',
  name: 'Adobe',
  bgKey: 'bg-adobe',
  price: 350,
  blurb: 'Dust and shutters.',
  lives: BAKED.levels.adobe.lives,
  bonusEvery: BAKED.levels.adobe.bonusEvery,
  angerLimit: BAKED.levels.adobe.angerLimit,
  building: {
    floors: 2,
    bays: 3,
    x: 0,
    y: 0,
    w: 1280,
    h: 720,
    windows: BAKED.levels.adobe.windows,
  },
  director: BAKED.levels.adobe.director,
  slingshot: BAKED.levels.adobe.slingshot,
  bounds: BAKED.levels.adobe.bounds,
}
