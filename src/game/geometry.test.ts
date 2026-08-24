import assert from 'node:assert/strict'
import { describe, it } from 'node:test'
import { geometry, toWindowDefs } from './geometry.ts'

const building = { x: 0, y: 0, w: 100, h: 200, floors: 3, bays: 3 }
const bounds = { groundY: 180, wallRight: 90, wallTop: 10 }
const slingshot = { origin: { x: 20, y: 160 }, maxPull: 1, power: 1, gravity: 1, ghostT: 1 }

describe('geometry', () => {
  it('uses floor and bay from the window, not the id', () => {
    const space = geometry({
      building: {
        ...building,
        windows: [{ id: 'renamed', floor: 2, bay: 1, nx: 0.1, ny: 0.2, nw: 0.3, nh: 0.25 }],
      },
      bounds,
      slingshot,
    })
    assert.deepEqual(space.windows[0], {
      id: 'renamed',
      floor: 2,
      bay: 1,
      x: 10,
      y: 40,
      w: 30,
      h: 50,
    })
    assert.equal(space.groundY, 180)
    assert.equal(space.wallRight, 90)
    assert.equal(space.wallTop, 10)
    assert.deepEqual(space.sling, { x: 20, y: 160 })
  })

  it('fills missing floor and bay from an old id once', () => {
    const space = geometry({
      building: {
        ...building,
        windows: [{ id: 'f1b2', nx: 0, ny: 0, nw: 0.1, nh: 0.1 }],
      },
      bounds,
      slingshot,
    })
    assert.equal(space.windows[0]?.floor, 1)
    assert.equal(space.windows[0]?.bay, 2)
  })

  it('writes floor and bay back on the normalized window', () => {
    const space = geometry({
      building: {
        ...building,
        windows: [{ id: 'w', floor: 1, bay: 0, nx: 0.2, ny: 0.4, nw: 0.1, nh: 0.1 }],
      },
      bounds,
      slingshot,
    })
    const back = toWindowDefs(space.windows, building)
    assert.deepEqual(back[0], { id: 'w', floor: 1, bay: 0, nx: 0.2, ny: 0.4, nw: 0.1, nh: 0.1 })
  })
})
