import assert from 'node:assert/strict'
import { describe, it } from 'node:test'
import { Run, type RunRules } from './run.ts'

const rules: RunRules = {
  startLives: 3,
  angerLimit: 3,
  bonusEvery: 2,
  coinMul: 2,
  maxContinues: 3,
  catchCoins: 20,
  heightCoins: 32,
  streakCoins: 8,
}

function fresh(over: Partial<RunRules> = {}): Run {
  return new Run({ ...rules, ...over })
}

function inFlight(run: Run): void {
  assert.equal(run.beginAim().kind, 'aiming')
  assert.equal(run.fly().kind, 'flight')
}

describe('catch', () => {
  it('scores, grows the streak, pays height and the cat multiplier', () => {
    const run = fresh()
    inFlight(run)
    const ev = run.applyOutcome({ outcome: { kind: 'catch', windowId: 'f0b0' }, floor: 0 })
    assert.equal(ev.kind, 'catch')
    if (ev.kind !== 'catch') return
    assert.equal(ev.windowId, 'f0b0')
    assert.equal(ev.score, 1)
    assert.equal(ev.streak, 1)
    assert.equal(ev.payout, 120)
    assert.equal(ev.extraLife, false)
    assert.equal(ev.anger, 0)
    assert.equal(run.coins, 120)
    assert.equal(run.phase, 'resolving')
  })

  it('grants an extra life on the bonus-every catch', () => {
    const run = fresh()
    inFlight(run)
    run.applyOutcome({ outcome: { kind: 'catch', windowId: 'a' }, floor: 0 })
    assert.equal(run.finishResolve().kind, 'reload')
    inFlight(run)
    const ev = run.applyOutcome({ outcome: { kind: 'catch', windowId: 'b' }, floor: 0 })
    assert.equal(ev.kind, 'catch')
    if (ev.kind !== 'catch') return
    assert.equal(ev.extraLife, true)
    assert.equal(ev.streak, 2)
    assert.equal(ev.payout, 136)
    assert.equal(run.lives, 4)
  })
})

describe('catcher', () => {
  it('drops a point and kills the streak', () => {
    const run = fresh()
    inFlight(run)
    run.applyOutcome({ outcome: { kind: 'catch', windowId: 'a' }, floor: 2 })
    run.finishResolve()
    inFlight(run)
    const ev = run.applyOutcome({ outcome: { kind: 'catcher', windowId: 'x' } })
    assert.equal(ev.kind, 'catcher')
    if (ev.kind !== 'catcher') return
    assert.equal(ev.windowId, 'x')
    assert.equal(ev.score, 0)
    assert.equal(run.streak, 0)
    assert.equal(run.phase, 'resolving')
  })
})

describe('splat', () => {
  it('loses a life and reloads when lives remain', () => {
    const run = fresh()
    inFlight(run)
    const ev = run.applyOutcome({ outcome: { kind: 'splat', reason: 'ground' } })
    assert.equal(ev.kind, 'splat')
    if (ev.kind !== 'splat') return
    assert.equal(ev.lives, 2)
    assert.equal(run.streak, 0)
    assert.equal(run.phase, 'resolving')
    assert.equal(run.finishResolve().kind, 'reload')
    assert.equal(run.phase, 'idle')
  })
})

describe('lady missed', () => {
  it('raises anger and spends a life at the limit', () => {
    const run = fresh()
    assert.equal(run.missLady().kind, 'anger')
    assert.equal(run.anger, 1)
    assert.equal(run.missLady().kind, 'anger')
    const ev = run.missLady()
    assert.equal(ev.kind, 'furious')
    if (ev.kind !== 'furious') return
    assert.equal(ev.lives, 2)
    assert.equal(ev.next, 'reload')
    assert.equal(run.anger, 0)
    assert.equal(run.phase, 'idle')
  })
})

describe('continue', () => {
  it('offers a continue when lives are gone and continues remain', () => {
    const run = fresh({ startLives: 1 })
    inFlight(run)
    run.applyOutcome({ outcome: { kind: 'splat', reason: 'wall' } })
    const ev = run.finishResolve()
    assert.equal(ev.kind, 'continue')
    assert.equal(run.phase, 'continue')
    const granted = run.grantContinue()
    assert.equal(granted.kind, 'granted')
    if (granted.kind !== 'granted') return
    assert.equal(granted.lives, 1)
    assert.equal(granted.continues, 1)
    assert.equal(run.phase, 'idle')
  })

  it('ends the run at max continues', () => {
    const run = fresh({ startLives: 1, maxContinues: 0 })
    inFlight(run)
    run.applyOutcome({ outcome: { kind: 'splat', reason: 'bounds' } })
    const ev = run.finishResolve()
    assert.equal(ev.kind, 'over')
    if (ev.kind !== 'over') return
    assert.equal(ev.score, 0)
    assert.equal(ev.coins, 0)
    assert.equal(run.phase, 'over')
  })
})
