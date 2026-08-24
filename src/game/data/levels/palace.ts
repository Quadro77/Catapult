import type { LevelDef } from '../../types.ts'
import { win } from './windows.ts'

export const LEVEL_PALACE: LevelDef = {
  id: 'palace',
  name: 'Palace',
  bgKey: 'bg-palace',
  price: 14000,
  blurb: 'Red columns.',
  lives: 3,
  bonusEvery: 9,
  angerLimit: 3,
  building: {
    floors: 2,
    bays: 3,
    x: 0,
    y: 0,
    w: 1280,
    h: 720,
    windows: [
      win('f0b0', 0, 0, 500, 240, 84, 92),
      win('f0b1', 0, 1, 680, 240, 84, 92),
      win('f0b2', 0, 2, 860, 240, 84, 92),
      win('f1b0', 1, 0, 500, 430, 84, 104),
      win('f1b1', 1, 1, 680, 430, 84, 104),
      win('f1b2', 1, 2, 860, 430, 84, 104),
    ],
  },
  director: {
    popInterval: [420, 800],
    visibleMs: [480, 800],
    maxConcurrent: 4,
    catcherChance: 0.58,
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
