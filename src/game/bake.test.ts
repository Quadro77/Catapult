import assert from 'node:assert/strict'
import { describe, it } from 'node:test'
import { extractGeometry, formatBaked } from './data/bake.ts'
import { LEVEL_ADOBE } from './data/levels/adobe.ts'
import { mergeSaved } from './data/project.ts'
import type { ProjectSave, WindowDef } from './types.ts'

const placed: WindowDef[] = [
  { id: 'x', floor: 0, bay: 0, nx: 0.111, ny: 0.222, nw: 0.05, nh: 0.06 },
]

function saveWithAdobeEdit(): ProjectSave {
  return {
    titleImages: [{ id: 'title', key: 'ui-title', x: 9, y: 8, rotation: 0, scale: 1, depth: 10 }],
    titleButtons: [{ id: 'play', x: 3, y: 4, rotation: 0 }],
    levels: [
      {
        ...LEVEL_ADOBE,
        lives: 7,
        bonusEvery: 4,
        angerLimit: 9,
        building: { ...LEVEL_ADOBE.building, windows: placed },
        director: {
          popInterval: [500, 900],
          visibleMs: [600, 960],
          maxConcurrent: 5,
          catcherChance: 0.2,
          pool: ['oldLady', 'dogCatcher'],
        },
        slingshot: { origin: { x: 111, y: 600 }, maxPull: 200, power: 12, gravity: 700, ghostT: 0.5 },
        bounds: { groundY: 600, wallRight: 1000, wallTop: 10 },
      },
    ],
    activeLevelId: 'adobe',
    customArt: [],
  }
}

describe('bake geometry', () => {
  it('takes windows sling ladies lives and title from the save, not the TypeScript level', () => {
    const baked = extractGeometry(saveWithAdobeEdit())
    const adobe = baked.levels.adobe
    assert.ok(adobe)
    assert.deepEqual(adobe.windows, placed)
    assert.deepEqual(adobe.slingshot, { origin: { x: 111, y: 600 }, maxPull: 200, power: 12, gravity: 700, ghostT: 0.5 })
    assert.deepEqual(adobe.bounds, { groundY: 600, wallRight: 1000, wallTop: 10 })
    assert.deepEqual(adobe.director.popInterval, [500, 900])
    assert.equal(adobe.director.maxConcurrent, 5)
    assert.equal(adobe.director.catcherChance, 0.2)
    assert.equal(adobe.lives, 7)
    assert.equal(adobe.bonusEvery, 4)
    assert.equal(adobe.angerLimit, 9)
    assert.equal(baked.titleImages[0]?.x, 9)
    assert.equal(baked.titleButtons[0]?.y, 4)
    assert.notEqual(adobe.windows[0]?.nx, LEVEL_ADOBE.building.windows?.[0]?.nx)
    assert.notEqual(adobe.slingshot.power, LEVEL_ADOBE.slingshot.power)
    assert.notEqual(adobe.director.maxConcurrent, LEVEL_ADOBE.director.maxConcurrent)
  })

  it('writes a TypeScript module and never mentions the save path', () => {
    const text = formatBaked(extractGeometry(saveWithAdobeEdit()))
    assert.match(text, /export const BAKED/)
    assert.match(text, /0\.111/)
    assert.match(text, /"maxConcurrent": 5/)
    assert.doesNotMatch(text, /project-save/)
  })
})

describe('mergeSaved', () => {
  it('keeps saved windows when they differ from TypeScript defaults', () => {
    const merged = mergeSaved(saveWithAdobeEdit())
    const adobe = merged.levels.find((l) => l.id === 'adobe')
    assert.deepEqual(adobe?.building.windows, placed)
    assert.equal(adobe?.director.maxConcurrent, 5)
    assert.equal(adobe?.slingshot.power, 12)
    assert.equal(adobe?.lives, 7)
  })
})
