import { AD_COINS } from '../data/shop.ts'
import { addCoins } from './progress.ts'

type PokiSDK = {
  init?: () => Promise<void>
  rewardedBreak?: () => Promise<boolean>
  commercialBreak?: () => Promise<void>
  gameplayStart?: () => void
  gameplayStop?: () => void
  gameLoadingFinished?: () => void
}

type CrazyAdCallbacks = {
  adFinished?: () => void
  adError?: (err: unknown) => void
  adStarted?: () => void
}

type CrazySDK = {
  init?: () => Promise<void>
  ad?: {
    requestAd?: (kind: string, cb: CrazyAdCallbacks) => void
  }
}

function poki(): PokiSDK | undefined {
  return (window as Window & { PokiSDK?: PokiSDK }).PokiSDK
}

function crazy(): CrazySDK | undefined {
  return (window as Window & { CrazyGames?: { SDK?: CrazySDK } }).CrazyGames?.SDK
}

let booted = false
let playing = false

export function bootAds(): void {
  if (booted) return
  booted = true
  const p = poki()
  if (p?.init) {
    void p.init().then(() => p.gameLoadingFinished?.())
    return
  }
  void crazy()?.init?.()
}

export function gameplayStart(): void {
  if (playing) return
  playing = true
  poki()?.gameplayStart?.()
}

export function gameplayStop(): void {
  if (!playing) return
  playing = false
  poki()?.gameplayStop?.()
}

const AD_WAIT_MS = 8000

function withTimeout(task: Promise<void>, ms: number): Promise<void> {
  return Promise.race([
    task,
    new Promise<void>((resolve) => {
      setTimeout(resolve, ms)
    }),
  ])
}

export async function commercialBreak(): Promise<void> {
  gameplayStop()
  const p = poki()
  if (p?.commercialBreak) {
    await withTimeout(p.commercialBreak(), AD_WAIT_MS)
    return
  }
  const c = crazy()
  if (c?.ad?.requestAd) {
    await withTimeout(
      new Promise<void>((resolve) => {
        c.ad?.requestAd?.('midgame', {
          adFinished: () => resolve(),
          adError: () => resolve(),
        })
      }),
      AD_WAIT_MS,
    )
  }
}

export async function rewardedBreak(): Promise<boolean> {
  gameplayStop()
  const p = poki()
  if (p?.rewardedBreak) return p.rewardedBreak()
  const c = crazy()
  if (c?.ad?.requestAd) {
    return new Promise((resolve) => {
      c.ad?.requestAd?.('rewarded', {
        adFinished: () => resolve(true),
        adError: () => resolve(false),
      })
    })
  }
  return fallbackBreak()
}

export async function watchForCoins(): Promise<number> {
  const ok = await rewardedBreak()
  if (!ok) return 0
  addCoins(AD_COINS)
  return AD_COINS
}

function fallbackBreak(): Promise<boolean> {
  return new Promise((resolve) => {
    const root = document.createElement('div')
    root.style.cssText =
      'position:fixed;inset:0;z-index:9999;display:flex;align-items:center;justify-content:center;background:#1a1410;font-family:Bangers,system-ui;color:#fff4e0'
    const card = document.createElement('div')
    card.style.cssText = 'text-align:center;max-width:420px;padding:28px'
    const title = document.createElement('div')
    title.style.cssText = 'font-size:42px;letter-spacing:1px'
    title.textContent = 'ALLEY BREAK'
    const body = document.createElement('div')
    body.style.cssText = 'font-family:Nunito,system-ui;font-size:18px;margin-top:12px;color:#e8d2a8'
    body.textContent = 'A real ad plays here on Poki or CrazyGames. That is the money.'
    const bar = document.createElement('div')
    bar.style.cssText =
      'margin:22px auto 0;width:220px;height:10px;background:#3a2418;border:2px solid #fff4e0;border-radius:8px;overflow:hidden'
    const fill = document.createElement('div')
    fill.style.cssText = 'height:100%;width:0;background:#ffe14a'
    bar.appendChild(fill)
    card.append(title, body, bar)
    root.appendChild(card)
    document.body.appendChild(root)
    const start = performance.now()
    const tick = (now: number) => {
      const t = Math.min(1, (now - start) / 3200)
      fill.style.width = `${t * 100}%`
      if (t < 1) {
        requestAnimationFrame(tick)
        return
      }
      root.remove()
      resolve(true)
    }
    requestAnimationFrame(tick)
  })
}
