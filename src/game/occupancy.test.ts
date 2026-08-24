import assert from 'node:assert/strict'
import { describe, it } from 'node:test'
import { Occupancy, type OccupancyRules, type OccupancyWindow } from './occupancy.ts'

const windows: OccupancyWindow[] = [
  { id: 'a', floor: 0, bay: 0, x: 0, y: 0, w: 10, h: 10 },
  { id: 'b', floor: 0, bay: 1, x: 20, y: 0, w: 10, h: 10 },
  { id: 'c', floor: 1, bay: 0, x: 0, y: 20, w: 10, h: 10 },
]

const rules: OccupancyRules = {
  popInterval: [100, 100],
  visibleMs: [500, 500],
  maxConcurrent: 1,
  catcherChance: 0,
  pool: ['oldLady', 'dogCatcher'],
}

function occupancy(over: Partial<OccupancyRules> = {}, rng: () => number = () => 0): Occupancy {
  return new Occupancy(windows, { ...rules, ...over }, rng)
}

describe('hit', () => {
  it('is a catch on an old lady and a catcher on a dog catcher', () => {
    const occ = occupancy()
    occ.update(280, 0)
    const catchHit = occ.hit({ x: 5, y: 5 })
    assert.deepEqual(catchHit, { kind: 'catch', windowId: 'a' })

    const two = occupancy({ maxConcurrent: 2, catcherChance: 1 }, () => 0)
    two.update(280, 0)
    two.update(100, 0)
    const catcherHit = two.hit({ x: 25, y: 5 })
    assert.deepEqual(catcherHit, { kind: 'catcher', windowId: 'b' })
  })

  it('ignores empty and locked windows', () => {
    const occ = occupancy()
    assert.equal(occ.hit({ x: 5, y: 5 }), null)
    occ.update(280, 0)
    occ.lock('a')
    assert.equal(occ.hit({ x: 5, y: 5 }), null)
  })
})

describe('miss', () => {
  it('emits a miss when an unlocked lady expires', () => {
    const occ = occupancy()
    const popped = occ.update(280, 0)
    assert.equal(popped[0]?.kind, 'popped')
    if (popped[0]?.kind !== 'popped') return
    assert.equal(popped[0].occupant, 'oldLady')
    const gone = occ.update(500, 0)
    assert.deepEqual(gone, [{ kind: 'hide', windowId: 'a', missed: true }])
  })

  it('does not miss a locked lady', () => {
    const occ = occupancy()
    occ.update(280, 0)
    occ.lock('a')
    assert.deepEqual(occ.update(500, 0), [])
  })
})

describe('pool', () => {
  it('never pops a catcher the pool does not name', () => {
    const occ = occupancy({ maxConcurrent: 2, catcherChance: 1, pool: ['oldLady'] }, () => 0)
    occ.update(280, 0)
    occ.update(200, 0)
    assert.equal(occ.hit({ x: 25, y: 5 }), null)
    assert.equal(occ.window('b')?.occupant, null)
  })
})
