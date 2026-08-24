import assert from 'node:assert/strict'
import { describe, it } from 'node:test'
import { LevelEdit } from './levelEdit.ts'
import type { LevelDef } from './types.ts'

function stub(): LevelDef {
  return {
    id: 't',
    name: 't',
    bgKey: 'bg-building',
    price: 0,
    blurb: '',
    lives: 3,
    bonusEvery: 9,
    angerLimit: 3,
    building: {
      floors: 1,
      bays: 1,
      x: 0,
      y: 0,
      w: 1000,
      h: 700,
      windows: [{ id: 'a', floor: 1, bay: 0, nx: 0.1, ny: 0.2, nw: 0.1, nh: 0.1 }],
    },
    director: {
      popInterval: [1, 1],
      visibleMs: [1, 1],
      maxConcurrent: 1,
      catcherChance: 0,
      pool: ['oldLady'],
    },
    slingshot: { origin: { x: 100, y: 600 }, maxPull: 1, power: 1, gravity: 1, ghostT: 1 },
    bounds: { groundY: 680, wallRight: 1100, wallTop: 0 },
  }
}

describe('level edit', () => {
  it('adds a window with floor and bay as data', () => {
    const edit = LevelEdit.open(stub())
    const added = edit.addWindow()
    assert.equal(added.floor, 0)
    assert.equal(added.bay, 1)
    assert.equal(edit.windows.length, 2)
  })

  it('keeps floor when the id is not a floor name', () => {
    const edit = LevelEdit.open(stub())
    const next = edit.commit()
    const win = next.building.windows?.[0]
    assert.equal(win?.id, 'a')
    assert.equal(win?.floor, 1)
    assert.equal(win?.bay, 0)
  })

  it('writes bounds and sling x on commit', () => {
    const edit = LevelEdit.open(stub())
    edit.setGround(500)
    edit.setWall(900)
    edit.setRoof(20)
    edit.setSlingX(150)
    const next = edit.commit()
    assert.equal(next.bounds.groundY, 500)
    assert.equal(next.bounds.wallRight, 900)
    assert.equal(next.bounds.wallTop, 20)
    assert.equal(next.slingshot.origin.x, 150)
  })

  it('removes a window', () => {
    const edit = LevelEdit.open(stub())
    assert.equal(edit.removeWindow('a'), true)
    assert.equal(edit.windows.length, 0)
    assert.equal(edit.commit().building.windows?.length, 0)
  })

  it('does not reuse a remaining window id after a delete', () => {
    const edit = LevelEdit.open(stub())
    const first = edit.addWindow()
    edit.addWindow()
    edit.removeWindow(first.id)
    const again = edit.addWindow()
    assert.notEqual(again.id, first.id)
    const ids = edit.windows.map((w) => w.id)
    assert.equal(new Set(ids).size, ids.length)
  })
})
