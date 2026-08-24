import assert from 'node:assert/strict'
import { describe, it } from 'node:test'
import { loadout } from './loadout.ts'

const cat = { mass: 1, drag: 0, radius: 22, color: 0xf28c28, coinMul: 2 }
const sling = { maxPull: 100, power: 8, gravity: 980, ghostT: 0.3 }

describe('loadout', () => {
  it('leaves the sling alone at rank zero', () => {
    const ready = loadout({ cat, ranks: {}, sling, baseLives: 3 })
    assert.equal(ready.power, 8)
    assert.equal(ready.maxPull, 100)
    assert.equal(ready.ghostT, 0.3)
    assert.equal(ready.gravity, 980)
    assert.equal(ready.hitPad, 0)
    assert.equal(ready.lives, 3)
    assert.equal(ready.coinMul, 2)
    assert.equal(ready.mass, 1)
  })

  it('applies power, stretch, aim, soft paws, and lives in one place', () => {
    const ready = loadout({
      cat,
      ranks: { power: 2, stretch: 1, aim: 1, soft: 3, lives: 1 },
      sling,
      baseLives: 3,
    })
    assert.equal(ready.power, 8 * (1 + 0.07 * 2))
    assert.equal(ready.maxPull, 100 * (1 + 0.06 * 1))
    assert.equal(ready.ghostT, 0.3 * (1 + 0.14 * 1))
    assert.equal(ready.hitPad, 3 * 1.8)
    assert.equal(ready.lives, 4)
  })
})
