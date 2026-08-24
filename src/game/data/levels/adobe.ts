import type { LevelDef } from '../../types.ts'
import { win } from './windows.ts'

export const LEVEL_ADOBE: LevelDef = {
  id: 'adobe',
  name: 'Adobe',
  bgKey: 'bg-adobe',
  price: 350,
  blurb: 'Dust and shutters.',
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
      win('f0b0', 0, 0, 720, 230, 72, 88),
      win('f0b1', 0, 1, 860, 230, 72, 88),
      win('f0b2', 0, 2, 1000, 230, 72, 88),
      win('f1b0', 1, 0, 720, 430, 72, 100),
      win('f1b2', 1, 2, 1000, 430, 72, 100),
    ],
  },
  director: {
    popInterval: [800, 1500],
    visibleMs: [850, 1400],
    maxConcurrent: 2,
    catcherChance: 0.35,
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
