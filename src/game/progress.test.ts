import assert from 'node:assert/strict'
import { beforeEach, describe, it } from 'node:test'
import { LEVEL_BY_ID, LEVEL_LIST } from './data/levels/index.ts'
import { defaultProject, setProject } from './data/project.ts'
import { loadLevel } from './data/layout.ts'
import {
  buyLevel,
  equippedLevel,
  equippedLevelId,
  garageLevels,
  ownsLevel,
  savePlayer,
  selectLevel,
} from './systems/progress.ts'

function memoryStore(): void {
  const mem = new Map<string, string>()
  Object.defineProperty(globalThis, 'localStorage', {
    configurable: true,
    value: {
      getItem: (k: string) => mem.get(k) ?? null,
      setItem: (k: string, v: string) => {
        mem.set(k, v)
      },
      removeItem: (k: string) => {
        mem.delete(k)
      },
      clear: () => mem.clear(),
    },
  })
}

describe('garage levels', () => {
  beforeEach(() => {
    memoryStore()
    setProject(defaultProject())
  })

  it('lists six blocks and owns brownstone', () => {
    assert.equal(garageLevels().length, 6)
    assert.equal(ownsLevel('brownstone-1'), true)
    assert.equal(equippedLevel().id, 'brownstone-1')
    for (const level of LEVEL_LIST) {
      if (level.id === 'brownstone-1') continue
      assert.equal(ownsLevel(level.id), false)
    }
  })

  it('buys adobe with coins and selects it', () => {
    savePlayer({
      coins: 400,
      ownedCats: ['tabby'],
      catId: 'tabby',
      levels: {},
      ownedLevels: ['brownstone-1'],
      levelId: 'brownstone-1',
      dailyAt: '',
      dailyStreak: 0,
    })
    assert.equal(buyLevel('adobe'), true)
    assert.equal(ownsLevel('adobe'), true)
    assert.equal(equippedLevelId(), 'adobe')
    assert.equal(buyLevel('adobe'), false)
  })

  it('refuses a block the wallet cannot pay', () => {
    assert.equal(buyLevel('palace'), false)
    assert.equal(ownsLevel('palace'), false)
    assert.equal(equippedLevelId(), 'brownstone-1')
  })

  it('selects only an owned block', () => {
    assert.equal(selectLevel('chalet'), false)
    assert.equal(selectLevel('brownstone-1'), true)
  })

  it('play loads the equipped block', () => {
    savePlayer({
      coins: 400,
      ownedCats: ['tabby'],
      catId: 'tabby',
      levels: {},
      ownedLevels: ['brownstone-1', 'adobe'],
      levelId: 'adobe',
      dailyAt: '',
      dailyStreak: 0,
    })
    const level = loadLevel()
    assert.equal(level.id, 'adobe')
    assert.equal(level.bgKey, LEVEL_BY_ID.adobe?.bgKey)
  })
})
