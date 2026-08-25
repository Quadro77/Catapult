import assert from 'node:assert/strict'
import { describe, it } from 'node:test'
import { geometry, reach, toWindowDefs, type ScreenWindow } from './geometry.ts'

function win(id: string, x: number, y: number): ScreenWindow {
  return { id, floor: 0, bay: 0, x, y, w: 10, h: 10 }
}

const span = [
  win('bl', 0, 100),
  win('br', 100, 100),
  win('tl', 0, 0),
  win('tr', 100, 0),
]

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

describe('reach', () => {
  it('is 0 at the nearest-to-sling window center', () => {
    assert.equal(reach(span, 'bl'), 0)
  })

  it('is 20 at the farthest window center', () => {
    assert.equal(reach(span, 'tr'), 20)
  })

  it('is 10 at the top-left and bottom-right centers', () => {
    assert.equal(reach(span, 'tl'), 10)
    assert.equal(reach(span, 'br'), 10)
  })

  it('is 10 at the mid center of a regular 3 by 3', () => {
    const grid: ScreenWindow[] = []
    for (let row = 0; row < 3; row += 1) {
      for (let col = 0; col < 3; col += 1) {
        grid.push(win(`r${row}c${col}`, col * 50, row * 50))
      }
    }
    assert.equal(reach(grid, 'r1c1'), 10)
  })

  it('is 0 for a single window', () => {
    assert.equal(reach([win('only', 40, 80)], 'only'), 0)
  })

  it('only varies up the screen when every window shares an x', () => {
    const col = [win('low', 0, 100), win('mid', 0, 50), win('high', 0, 0)]
    assert.equal(reach(col, 'low'), 0)
    assert.equal(reach(col, 'mid'), 5)
    assert.equal(reach(col, 'high'), 10)
  })

  it('is 0 for a missing window', () => {
    assert.equal(reach(span, 'nope'), 0)
  })

  it('drops a window when another is placed farther', () => {
    const three = [win('a', 0, 0), win('b', 50, 0), win('c', 100, 0)]
    assert.equal(reach(three, 'b'), 5)
    const four = [...three, win('d', 200, 0)]
    assert.equal(reach(four, 'b'), 3)
  })
})
