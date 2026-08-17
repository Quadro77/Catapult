import type { LevelDef } from '../../types.ts'

export const LEVEL_01: LevelDef = {
  id: 'brownstone-1',
  name: 'Brownstone',
  lives: 3,
  bonusEvery: 9,
  angerLimit: 3,
  building: {
    floors: 3,
    bays: 3,
    x: 0,
    y: 0,
    w: 1280,
    h: 720,
    windows: [
      { id: 'f0b0', nx: 0.465, ny: 0.108, nw: 0.070, nh: 0.155 },
      { id: 'f0b1', nx: 0.595, ny: 0.108, nw: 0.070, nh: 0.155 },
      { id: 'f0b2', nx: 0.728, ny: 0.108, nw: 0.070, nh: 0.155 },
      { id: 'f1b0', nx: 0.465, ny: 0.348, nw: 0.070, nh: 0.155 },
      { id: 'f1b1', nx: 0.595, ny: 0.348, nw: 0.070, nh: 0.155 },
      { id: 'f1b2', nx: 0.728, ny: 0.348, nw: 0.070, nh: 0.155 },
      { id: 'f2b0', nx: 0.465, ny: 0.590, nw: 0.070, nh: 0.155 },
      { id: 'f2b1', nx: 0.595, ny: 0.590, nw: 0.070, nh: 0.155 },
      { id: 'f2b2', nx: 0.728, ny: 0.590, nw: 0.070, nh: 0.155 },
    ],
  },
  director: {
    popInterval: [1100, 2300],
    visibleMs: [1100, 1900],
    maxConcurrent: 2,
    catcherChance: 0.25,
    pool: ['oldLady', 'dogCatcher'],
  },
  slingshot: {
    origin: { x: 188, y: 600 },
    maxPull: 188,
    power: 8.1,
    gravity: 980,
    ghostT: 0.3,
  },
  bounds: {
    groundY: 686,
    wallRight: 1110,
    wallTop: 0,
  },
}
