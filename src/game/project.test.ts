import assert from 'node:assert/strict'
import { describe, it } from 'node:test'
import { defaultProject } from './data/project.ts'

const TABLE = {
  'brownstone-1': {
    maxConcurrent: 3,
    popInterval: [2000, 3600],
    visibleMs: [2000, 3200],
    catcherChance: 0.4,
    gravity: 1500,
    bonusEvery: 9,
    angerLimit: 6,
  },
  adobe: {
    maxConcurrent: 2,
    popInterval: [1900, 3420],
    visibleMs: [1900, 3040],
    catcherChance: 0.45,
    gravity: 1600,
    bonusEvery: 14,
    angerLimit: 5,
  },
  machiya: {
    maxConcurrent: 2,
    popInterval: [1800, 3240],
    visibleMs: [1800, 2880],
    catcherChance: 0.5,
    gravity: 1700,
    bonusEvery: 19,
    angerLimit: 4,
  },
  chalet: {
    maxConcurrent: 1,
    popInterval: [1700, 3060],
    visibleMs: [1700, 2720],
    catcherChance: 0.55,
    gravity: 1800,
    bonusEvery: 24,
    angerLimit: 3,
  },
  chateau: {
    maxConcurrent: 1,
    popInterval: [1600, 2880],
    visibleMs: [1600, 2560],
    catcherChance: 0.6,
    gravity: 1900,
    bonusEvery: 29,
    angerLimit: 2,
  },
  palace: {
    maxConcurrent: 1,
    popInterval: [1500, 2700],
    visibleMs: [1500, 2400],
    catcherChance: 0.65,
    gravity: 2000,
    bonusEvery: 34,
    angerLimit: 1,
  },
} as const

describe('default project', () => {
  it('uses the table occupancy sling lives and anger on every level', () => {
    const project = defaultProject()
    assert.equal(project.levels.length, 6)
    for (const [id, want] of Object.entries(TABLE)) {
      const level = project.levels.find((l) => l.id === id)
      assert.ok(level, id)
      assert.deepEqual(level.director.popInterval, want.popInterval)
      assert.deepEqual(level.director.visibleMs, want.visibleMs)
      assert.equal(level.director.maxConcurrent, want.maxConcurrent)
      assert.equal(level.director.catcherChance, want.catcherChance)
      assert.deepEqual(level.director.pool, ['oldLady', 'dogCatcher'])
      assert.equal(level.slingshot.power, 8)
      assert.equal(level.slingshot.maxPull, 132)
      assert.equal(level.slingshot.gravity, want.gravity)
      assert.equal(level.slingshot.ghostT, 0.25)
      assert.equal(level.lives, 3)
      assert.equal(level.bonusEvery, want.bonusEvery)
      assert.equal(level.angerLimit, want.angerLimit)
    }
  })

  it('bakes brownstone geometry from the level edit', () => {
    const level = defaultProject().levels.find((l) => l.id === 'brownstone-1')
    assert.ok(level)
    assert.equal(level.building.windows?.length, 9)
    assert.equal(level.building.windows?.[0]?.nx, 0.5421875)
    assert.deepEqual(level.slingshot.origin, { x: 243, y: 600 })
    assert.equal(level.bounds.groundY, 686)
    assert.equal(level.bounds.wallRight, 1257)
  })

  it('bakes title placements from the level edit', () => {
    const project = defaultProject()
    assert.equal(project.titleImages.find((p) => p.id === 'title')?.x, 654)
    assert.equal(project.titleImages.find((p) => p.id === 'lady')?.x, 1032)
    assert.equal(project.titleButtons.find((b) => b.id === 'play')?.y, 611)
    assert.equal(project.titleButtons.find((b) => b.id === 'editor')?.x, 216)
  })
})
