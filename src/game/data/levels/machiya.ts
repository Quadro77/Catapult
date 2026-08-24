import type { LevelDef } from '../../types.ts'
import { win } from './windows.ts'

export const LEVEL_MACHIYA: LevelDef = {
  id: 'machiya',
  name: 'Machiya',
  bgKey: 'bg-machiya',
  price: 900,
  blurb: 'Paper and lanterns.',
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
      win('f0b0', 0, 0, 560, 220, 80, 90),
      win('f0b1', 0, 1, 720, 220, 80, 90),
      win('f0b2', 0, 2, 880, 220, 80, 90),
      win('f1b0', 1, 0, 560, 420, 80, 100),
      win('f1b1', 1, 1, 720, 420, 80, 100),
      win('f1b2', 1, 2, 880, 420, 80, 100),
    ],
  },
  director: {
    popInterval: [700, 1300],
    visibleMs: [750, 1200],
    maxConcurrent: 2,
    catcherChance: 0.42,
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
