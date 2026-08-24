import { COIN_PACKS, type CoinPack } from '../data/shop.ts'
import { addCoins } from './progress.ts'

type CrazyPay = {
  displayItem?: (id: string) => Promise<{ success?: boolean }>
}

type BuyHook = (id: string) => Promise<boolean>

function packById(id: string): CoinPack | undefined {
  return COIN_PACKS.find((p) => p.id === id)
}

function hook(): BuyHook | undefined {
  return (window as Window & { CatapultBuy?: BuyHook }).CatapultBuy
}

function crazyPay(): CrazyPay | undefined {
  return (window as Window & { CrazyGames?: { SDK?: { payments?: CrazyPay } } }).CrazyGames?.SDK?.payments
}

export function iapReady(): boolean {
  return Boolean(hook() || crazyPay()?.displayItem)
}

export async function buyPack(id: string): Promise<'ok' | 'unavailable' | 'fail'> {
  const pack = packById(id)
  if (!pack) return 'fail'
  const pay = crazyPay()
  if (pay?.displayItem) {
    try {
      const res = await pay.displayItem(pack.id)
      if (res?.success) {
        addCoins(pack.coins)
        return 'ok'
      }
      return 'fail'
    } catch {
      return 'fail'
    }
  }
  const buy = hook()
  if (buy) {
    try {
      const ok = await buy(pack.id)
      if (!ok) return 'fail'
      addCoins(pack.coins)
      return 'ok'
    } catch {
      return 'fail'
    }
  }
  return 'unavailable'
}
