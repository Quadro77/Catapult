import type { LevelDef } from '../../types.ts'
import { win } from './windows.ts'

export const LEVEL_CHALET: LevelDef = {
  id: 'chalet',
  name: 'Chalet',
  bgKey: 'bg-chalet',
  price: 2200,
  blurb: 'Snow on the eaves.',
  lives: 3,
  bonusEvery: 24,
  angerLimit: 3,
  building: {
    floors: 2,
    bays: 3,
    x: 0,
    y: 0,
    w: 1280,
    h: 720,
    windows: [
      win('f0b0', 0, 0, 620, 200, 76, 90),
      win('f0b1', 0, 1, 780, 200, 76, 90),
      win('f0b2', 0, 2, 940, 200, 76, 90),
      win('f1b0', 1, 0, 620, 400, 76, 100),
      win('f1b1', 1, 1, 780, 400, 76, 100),
      win('f1b2', 1, 2, 940, 400, 76, 100),
    ],
  },
  director: {
    popInterval: [1700, 3060],
    visibleMs: [1700, 2720],
    maxConcurrent: 1,
    catcherChance: 0.55,
    pool: ['oldLady', 'dogCatcher'],
  },
  slingshot: {
    origin: { x: 200, y: 600 },
    maxPull: 132,
    power: 8,
    gravity: 1800,
    ghostT: 0.25,
  },
  bounds: {
    groundY: 686,
    wallRight: 1240,
    wallTop: 0,
  },
}
