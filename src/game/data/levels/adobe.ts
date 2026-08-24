import type { LevelDef } from '../../types.ts'
import { win } from './windows.ts'

export const LEVEL_ADOBE: LevelDef = {
  id: 'adobe',
  name: 'Adobe',
  bgKey: 'bg-adobe',
  price: 350,
  blurb: 'Dust and shutters.',
  lives: 3,
  bonusEvery: 14,
  angerLimit: 5,
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
    popInterval: [1900, 3420],
    visibleMs: [1900, 3040],
    maxConcurrent: 2,
    catcherChance: 0.45,
    pool: ['oldLady', 'dogCatcher'],
  },
  slingshot: {
    origin: { x: 200, y: 600 },
    maxPull: 132,
    power: 8,
    gravity: 1600,
    ghostT: 0.25,
  },
  bounds: {
    groundY: 686,
    wallRight: 1240,
    wallTop: 0,
  },
}
