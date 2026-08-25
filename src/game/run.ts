import type { Outcome } from './types.ts'

export type RunRules = {
  startLives: number
  angerLimit: number
  bonusEvery: number
  coinMul: number
  maxContinues: number
  streakCoins: number
}

export type RunPhase = 'idle' | 'aiming' | 'flight' | 'resolving' | 'continue' | 'over'

export type FailNext = 'reload' | 'continue' | 'over'

export type RunEvent =
  | { kind: 'ignored' }
  | { kind: 'aiming' }
  | { kind: 'idle' }
  | { kind: 'flight' }
  | { kind: 'catch'; windowId: string; score: number; streak: number; payout: number; extraLife: boolean; anger: number; lives: number }
  | { kind: 'catcher'; windowId: string; score: number }
  | { kind: 'splat'; reason: 'wall' | 'ground' | 'bounds'; lives: number }
  | { kind: 'anger'; anger: number }
  | { kind: 'furious'; lives: number; next: FailNext }
  | { kind: 'reload' }
  | { kind: 'continue'; continues: number }
  | { kind: 'granted'; lives: number; continues: number }
  | { kind: 'over'; score: number; coins: number }

export class Run {
  private readonly rules: RunRules
  private _phase: RunPhase = 'idle'
  private _score = 0
  private _lives: number
  private _anger = 0
  private _streak = 0
  private _coins = 0
  private _continues = 0
  private pendingSplat = false

  constructor(rules: RunRules) {
    this.rules = rules
    this._lives = rules.startLives
  }

  get phase(): RunPhase {
    return this._phase
  }

  get score(): number {
    return this._score
  }

  get lives(): number {
    return this._lives
  }

  get anger(): number {
    return this._anger
  }

  get streak(): number {
    return this._streak
  }

  get coins(): number {
    return this._coins
  }

  get continues(): number {
    return this._continues
  }

  canAim(): boolean {
    return this._phase === 'idle'
  }

  beginAim(): RunEvent {
    if (this._phase !== 'idle') return { kind: 'ignored' }
    this._phase = 'aiming'
    return { kind: 'aiming' }
  }

  cancelAim(): RunEvent {
    if (this._phase !== 'aiming') return { kind: 'ignored' }
    this._phase = 'idle'
    return { kind: 'idle' }
  }

  fly(): RunEvent {
    if (this._phase !== 'aiming') return { kind: 'ignored' }
    this._phase = 'flight'
    return { kind: 'flight' }
  }

  applyOutcome(input: { outcome: Outcome; reach?: number }): RunEvent {
    if (this._phase !== 'flight') return { kind: 'ignored' }
    this._phase = 'resolving'
    const outcome = input.outcome
    switch (outcome.kind) {
      case 'catch':
        return this.onCatch(outcome.windowId, input.reach ?? 0)
      case 'catcher':
        return this.onCatcher(outcome.windowId)
      case 'splat':
        this._streak = 0
        this.loseLife()
        this.pendingSplat = true
        return { kind: 'splat', reason: outcome.reason, lives: this._lives }
      default: {
        const _exhaustive: never = outcome
        return _exhaustive
      }
    }
  }

  missLady(): RunEvent {
    if (this._phase === 'over' || this._phase === 'resolving' || this._phase === 'continue') {
      return { kind: 'ignored' }
    }
    this._anger += 1
    if (this._anger < this.rules.angerLimit) return { kind: 'anger', anger: this._anger }
    this._anger = 0
    this.loseLife()
    const next = this.afterLifeLost()
    return { kind: 'furious', lives: this._lives, next }
  }

  finishResolve(): RunEvent {
    if (this._phase !== 'resolving') return { kind: 'ignored' }
    if (!this.pendingSplat) {
      this._phase = 'idle'
      return { kind: 'reload' }
    }
    this.pendingSplat = false
    return this.lifeLostEvent(this.afterLifeLost())
  }

  grantContinue(): RunEvent {
    if (this._phase !== 'continue') return { kind: 'ignored' }
    this._continues += 1
    this._lives = 1
    this._phase = 'idle'
    return { kind: 'granted', lives: this._lives, continues: this._continues }
  }

  giveUp(): RunEvent {
    if (this._phase === 'over') return { kind: 'ignored' }
    this._phase = 'over'
    return { kind: 'over', score: this._score, coins: this._coins }
  }

  private onCatch(windowId: string, reach: number): RunEvent {
    this._score += 1
    this._anger = Math.max(0, this._anger - 1)
    const priorStreak = this._streak
    this._streak += 1
    const payout = Math.max(
      1,
      Math.round((reach + priorStreak * this.rules.streakCoins) * this.rules.coinMul),
    )
    this._coins += payout
    const every = this.rules.bonusEvery
    const extraLife = every > 0 && this._score % every === 0
    if (extraLife) this._lives += 1
    return {
      kind: 'catch',
      windowId,
      score: this._score,
      streak: this._streak,
      payout,
      extraLife,
      anger: this._anger,
      lives: this._lives,
    }
  }

  private onCatcher(windowId: string): RunEvent {
    this._score = Math.max(0, this._score - 1)
    this._streak = 0
    return { kind: 'catcher', windowId, score: this._score }
  }

  private loseLife(): void {
    this._lives = Math.max(0, this._lives - 1)
  }

  private afterLifeLost(): FailNext {
    if (this._lives > 0) {
      this._phase = 'idle'
      return 'reload'
    }
    if (this._continues < this.rules.maxContinues) {
      this._phase = 'continue'
      return 'continue'
    }
    this._phase = 'over'
    return 'over'
  }

  private lifeLostEvent(next: FailNext): RunEvent {
    switch (next) {
      case 'reload':
        return { kind: 'reload' }
      case 'continue':
        return { kind: 'continue', continues: this._continues }
      case 'over':
        return { kind: 'over', score: this._score, coins: this._coins }
      default: {
        const _exhaustive: never = next
        return _exhaustive
      }
    }
  }
}
