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

function ladyCount(occ: Occupancy): number {
  return windows.filter((w) => occ.window(w.id)?.occupant?.defId === 'oldLady').length
}

describe('spawn gap', () => {
  it('pops the first lady after a full spawn gap', () => {
    const occ = occupancy()
    assert.deepEqual(occ.update(99, 0), [])
    const popped = occ.update(1, 0)
    assert.equal(popped[0]?.kind, 'popped')
    if (popped[0]?.kind !== 'popped') return
    assert.equal(popped[0].occupant, 'oldLady')
  })

  it('fills to the lady cap after the first spawn gap', () => {
    const occ = occupancy({ maxConcurrent: 3 })
    occ.update(100, 0)
    assert.equal(ladyCount(occ), 3)
  })

  it('waits a full spawn gap after a lady is unlocked before replacing her', () => {
    const occ = occupancy({ maxConcurrent: 1 })
    occ.update(100, 0)
    occ.lock('a')
    occ.unlock('a')
    occ.update(99, 0)
    assert.equal(ladyCount(occ), 0)
    occ.update(1, 0)
    assert.equal(ladyCount(occ), 1)
  })

  it('does not shorten stay when score grows', () => {
    const occ = occupancy({ visibleMs: [500, 500] })
    occ.update(100, 20)
    assert.equal(occ.window('a')?.occupant?.until, 600)
  })

  it('uses one spawn gap then burst-fills after two ladies leave', () => {
    const occ = occupancy({ maxConcurrent: 2 })
    occ.update(100, 0)
    occ.lock('a')
    occ.unlock('a')
    occ.lock('b')
    occ.unlock('b')
    occ.update(99, 0)
    assert.equal(ladyCount(occ), 0)
    occ.update(1, 0)
    assert.equal(ladyCount(occ), 2)
  })

  it('waits a full spawn gap after a missed lady finishes hiding', () => {
    const occ = occupancy({ maxConcurrent: 1, visibleMs: [50, 50] })
    occ.update(100, 0)
    occ.update(50, 0)
    occ.finishHide('a')
    occ.update(99, 0)
    assert.equal(ladyCount(occ), 0)
    occ.update(1, 0)
    assert.equal(ladyCount(occ), 1)
  })

  it('does not raise catcher chance when score grows', () => {
    const occ = occupancy({ catcherChance: 0 }, () => 0)
    occ.update(100, 20)
    occ.update(50, 20)
    assert.equal(occ.hit({ x: 25, y: 5 }), null)
  })
})

describe('hit', () => {
  it('is a catch on an old lady and a catcher on a dog catcher', () => {
    const occ = occupancy()
    occ.update(100, 0)
    const catchHit = occ.hit({ x: 5, y: 5 })
    assert.deepEqual(catchHit, { kind: 'catch', windowId: 'a' })

    const withCatcher = occupancy({ catcherChance: 1 }, () => 0)
    withCatcher.update(100, 0)
    withCatcher.update(50, 0)
    const catcherHit = withCatcher.hit({ x: 25, y: 5 })
    assert.deepEqual(catcherHit, { kind: 'catcher', windowId: 'b' })
  })

  it('ignores empty and locked windows', () => {
    const occ = occupancy()
    assert.equal(occ.hit({ x: 5, y: 5 }), null)
    occ.update(100, 0)
    occ.lock('a')
    assert.equal(occ.hit({ x: 5, y: 5 }), null)
  })
})

describe('miss', () => {
  it('emits a miss when an unlocked lady expires', () => {
    const occ = occupancy()
    const popped = occ.update(100, 0)
    assert.equal(popped[0]?.kind, 'popped')
    if (popped[0]?.kind !== 'popped') return
    assert.equal(popped[0].occupant, 'oldLady')
    const gone = occ.update(500, 0)
    assert.deepEqual(gone, [{ kind: 'hide', windowId: 'a', missed: true }])
  })

  it('does not miss a locked lady', () => {
    const occ = occupancy()
    occ.update(100, 0)
    occ.lock('a')
    assert.deepEqual(occ.update(500, 0), [])
  })
})

describe('catcher cap', () => {
  it('does not pop a second catcher while one is up', () => {
    const occ = occupancy({ maxConcurrent: 2, catcherChance: 1 }, () => 0)
    occ.update(100, 0)
    occ.update(50, 0)
    const catchers = () => windows.filter((w) => occ.window(w.id)?.occupant?.defId === 'dogCatcher')
    assert.equal(catchers().length, 1)
    occ.update(200, 0)
    assert.equal(catchers().length, 1)
  })

  it('never shares the triggering lady window', () => {
    const occ = occupancy({ catcherChance: 1 }, () => 0)
    occ.update(100, 0)
    occ.update(50, 0)
    assert.equal(occ.window('a')?.occupant?.defId, 'oldLady')
    assert.equal(occ.window('b')?.occupant?.defId, 'dogCatcher')
  })
})

describe('pool', () => {
  it('never pops a catcher the pool does not name', () => {
    const occ = occupancy({ catcherChance: 1, pool: ['oldLady'] }, () => 0)
    occ.update(100, 0)
    occ.update(200, 0)
    assert.equal(occ.hit({ x: 25, y: 5 }), null)
    assert.equal(occ.window('b')?.occupant, null)
  })
})
