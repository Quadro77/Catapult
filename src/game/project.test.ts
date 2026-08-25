import assert from 'node:assert/strict'
import { describe, it } from 'node:test'
import { BAKED } from './data/baked.ts'
import { defaultProject } from './data/project.ts'

describe('default project', () => {
  it('uses baked ladies sling lives and anger on every level', () => {
    const project = defaultProject()
    assert.equal(project.levels.length, 6)
    for (const level of project.levels) {
      const want = BAKED.levels[level.id]
      assert.ok(want, level.id)
      assert.deepEqual(level.director, want.director)
      assert.deepEqual(level.slingshot, want.slingshot)
      assert.equal(level.lives, want.lives)
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
