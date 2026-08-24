import assert from 'node:assert/strict'
import { describe, it } from 'node:test'
import { UPGRADES, upgradeCost } from './data/shop.ts'

function def(id: string) {
  const found = UPGRADES.find((row) => row.id === id)
  assert.ok(found)
  return found
}

describe('upgrade catalog', () => {
  it('caps power stretch aim and soft paws at ten', () => {
    assert.equal(def('power').max, 10)
    assert.equal(def('stretch').max, 10)
    assert.equal(def('aim').max, 10)
    assert.equal(def('soft').max, 10)
    assert.equal(def('lives').max, 5)
  })

  it('states what each sling rank does', () => {
    assert.equal(def('power').blurb, 'Harder launches. +3.5% each.')
    assert.equal(def('stretch').blurb, 'Longer pull. +3% each.')
    assert.equal(def('aim').blurb, 'Longer ghost trail. +7% each.')
    assert.equal(def('soft').blurb, 'Bigger window hits. Catchers too.')
    assert.equal(def('lives').blurb, 'Start with extra lives.')
  })

  it('prices the first rank at twice the old base', () => {
    assert.equal(upgradeCost(def('power'), 0), 120)
    assert.equal(upgradeCost(def('stretch'), 0), 160)
    assert.equal(upgradeCost(def('aim'), 0), 90)
    assert.equal(upgradeCost(def('soft'), 0), 140)
    assert.equal(upgradeCost(def('lives'), 0), 280)
  })

  it('keeps the old growth on the second rank', () => {
    assert.equal(upgradeCost(def('power'), 1), 194)
    assert.equal(upgradeCost(def('stretch'), 1), 252)
    assert.equal(upgradeCost(def('aim'), 1), 139)
    assert.equal(upgradeCost(def('soft'), 1), 224)
    assert.equal(upgradeCost(def('lives'), 1), 490)
  })
})
