import type { LevelDef } from '../../types.ts'
import { win } from './windows.ts'

export const LEVEL_CHATEAU: LevelDef = {
  id: 'chateau',
  name: 'Chateau',
  bgKey: 'bg-chateau',
  price: 5500,
  blurb: 'Blue shutters.',
  lives: 3,
  bonusEvery: 9,
  angerLimit: 3,
  building: {
    floors: 2,
    bays: 4,
    x: 0,
    y: 0,
    w: 1280,
    h: 720,
    windows: [
      win('f0b0', 0, 0, 560, 210, 70, 88),
      win('f0b1', 0, 1, 700, 210, 70, 88),
      win('f0b2', 0, 2, 840, 210, 70, 88),
      win('f0b3', 0, 3, 980, 210, 70, 88),
      win('f1b0', 1, 0, 560, 410, 70, 98),
      win('f1b1', 1, 1, 700, 410, 70, 98),
      win('f1b2', 1, 2, 840, 410, 70, 98),
      win('f1b3', 1, 3, 980, 410, 70, 98),
    ],
  },
  director: {
    popInterval: [520, 950],
    visibleMs: [560, 920],
    maxConcurrent: 3,
    catcherChance: 0.52,
    pool: ['oldLady', 'dogCatcher'],
  },
  slingshot: {
    origin: { x: 200, y: 600 },
    maxPull: 188,
    power: 8.1,
    gravity: 980,
    ghostT: 0.3,
  },
  bounds: {
    groundY: 686,
    wallRight: 1240,
    wallTop: 0,
  },
}
