import { GAME_HEIGHT, GAME_WIDTH } from '../config.ts'
import { AD_COINS, COIN_PACKS, UPGRADES, upgradeCost } from '../data/shop.ts'
import { playSfx, playMusic, unlockAnd } from '../systems/Audio.ts'
import { watchForCoins } from '../systems/ads.ts'
import { addFullscreenBadge } from '../systems/fullscreen.ts'
import { buyPack, iapReady } from '../systems/iap.ts'
import {
  buyCat,
  buyLevel,
  buyUpgrade,
  equippedCat,
  equippedLevel,
  formatCoins,
  garageCats,
  garageLevels,
  getCoins,
  ownsCat,
  ownsLevel,
  selectCat,
  selectLevel,
  upgradeLevel,
} from '../systems/progress.ts'
import { addSettingsCog } from '../systems/SettingsMenu.ts'
import { hasTex } from '../systems/chroma.ts'
import { addCoinChip } from '../systems/walletChip.ts'

type Tab = 'cats' | 'sling' | 'blocks' | 'coins'

export class ShopScene extends Phaser.Scene {
  private tab: Tab = 'cats'
  private layer: Phaser.GameObjects.Container | null = null
  private toast?: Phaser.GameObjects.Text

  constructor() {
    super({ key: 'Shop' })
  }

  init(data: { tab?: Tab }): void {
    this.tab = data.tab ?? 'cats'
    this.layer = null
    this.toast = undefined
  }

  create(): void {
    unlockAnd(this, () => playMusic(this, 'music-title', 0.28, false))
    addSettingsCog(this, { musicKey: 'music-title', musicVol: 0.28, musicLoop: false })
    addFullscreenBadge(this)
    addCoinChip(this)
    this.cameras.main.setBackgroundColor(0x1a1410)
    this.add.rectangle(GAME_WIDTH / 2, GAME_HEIGHT / 2, GAME_WIDTH, GAME_HEIGHT, 0x1a1410, 0.2)
    this.add
      .text(28, 30, 'GARAGE', {
        fontFamily: 'Bangers, system-ui',
        fontSize: '44px',
        color: '#fff4e0',
        stroke: '#1a1410',
        strokeThickness: 6,
        padding: { x: 8, y: 4 },
      })
      .setOrigin(0, 0.5)
      .setAngle(-2)
    const navY = 92
    this.nav(96, navY, 'CATS', 'cats')
    this.nav(252, navY, 'SLING', 'sling')
    this.nav(408, navY, 'BLOCKS', 'blocks')
    this.nav(564, navY, 'COINS', 'coins')
    this.menuBtn(navY)
    this.paint()
  }

  private menuBtn(y: number): void {
    const x = GAME_WIDTH - 140
    const bg = this.add.rectangle(x, y, 160, 48, 0x3a5aaa).setDepth(50).setInteractive({ useHandCursor: true })
    bg.setStrokeStyle(5, 0xfff4e0)
    this.add
      .text(x, y, 'MENU', {
        fontFamily: 'Bangers, system-ui',
        fontSize: '24px',
        color: '#fff4e0',
        padding: { x: 8, y: 4 },
      })
      .setOrigin(0.5)
      .setDepth(51)
    bg.on('pointerup', () => this.scene.start('Menu'))
  }

  private nav(x: number, y: number, label: string, tab: Tab): void {
    const on = this.tab === tab
    const bg = this.add.rectangle(x, y, 150, 44, on ? 0xe23d28 : 0x3a2418).setInteractive({ useHandCursor: true })
    bg.setStrokeStyle(4, 0xfff4e0)
    this.add
      .text(x, y, label, {
        fontFamily: 'Bangers, system-ui',
        fontSize: '26px',
        color: '#fff4e0',
        padding: { x: 6, y: 2 },
      })
      .setOrigin(0.5)
    bg.on('pointerup', () => {
      this.tab = tab
      this.scene.restart({ tab })
    })
  }

  private paint(): void {
    this.layer?.destroy()
    this.layer = this.add.container(0, 0)
    if (this.tab === 'cats') this.paintCats()
    else if (this.tab === 'sling') this.paintSling()
    else if (this.tab === 'blocks') this.paintBlocks()
    else this.paintCoins()
  }

  private paintCats(): void {
    const cats = garageCats()
    const picked = equippedCat().id
    const gap = 232
    const start = GAME_WIDTH / 2 - ((cats.length - 1) * gap) / 2
    cats.forEach((cat, i) => {
      const x = start + i * gap
      const y = 360
      const owned = ownsCat(cat.id)
      const selected = picked === cat.id
      const card = this.add.rectangle(x, y, 210, 420, selected ? 0x3a2a18 : 0x2c1a12)
      card.setStrokeStyle(5, selected ? 0xffe14a : 0xfff4e0)
      const shadow = this.add.circle(x + 4, y - 70, 62, 0x000000, 0.35)
      const face = this.add.image(x, y - 78, 'cat').setDisplaySize(110, 110)
      if (cat.color !== 0xf28c28) face.setTint(cat.color)
      const name = this.add
        .text(x, y + 8, cat.name.toUpperCase(), {
          fontFamily: 'Bangers, system-ui',
          fontSize: '30px',
          color: '#fff4e0',
          padding: { x: 6, y: 2 },
        })
        .setOrigin(0.5)
      const blurb = this.add
        .text(x, y + 46, cat.blurb, {
          fontFamily: 'Nunito, system-ui',
          fontSize: '15px',
          color: '#e8d2a8',
          align: 'center',
          wordWrap: { width: 180 },
        })
        .setOrigin(0.5, 0)
      const mul = this.add
        .text(x, y + 92, `x${cat.coinMul.toFixed(2)} COINS`, {
          fontFamily: 'Bangers, system-ui',
          fontSize: '18px',
          color: '#ffe14a',
        })
        .setOrigin(0.5)
      this.layer?.add([card, shadow, face, name, blurb, mul])
      if (selected) {
        this.label(x, y + 150, 'SELECTED', 0x2d8a2d)
      } else if (owned) {
        this.btn(x, y + 150, 'SELECT', 0x2d8a2d, 150, 48, () => {
          selectCat(cat.id)
          playSfx(this, 'sfx-bonus', 0.7)
          this.scene.restart({ tab: 'cats' })
        })
      } else {
        this.btn(x, y + 150, `$${formatCoins(cat.price)}`, getCoins() >= cat.price ? 0xe23d28 : 0x5a3a32, 160, 48, () => {
          if (buyCat(cat.id)) {
            playSfx(this, 'sfx-bonus')
            this.say('NEW CAT!')
            this.scene.restart({ tab: 'cats' })
            return
          }
          playSfx(this, 'sfx-lose', 0.5)
          this.say('NEED MORE COINS')
        })
      }
    })
  }

  private paintBlocks(): void {
    const blocks = garageLevels()
    const picked = equippedLevel().id
    const gapX = 300
    const gapY = 248
    const startX = GAME_WIDTH / 2 - gapX
    const startY = 292
    blocks.forEach((level, i) => {
      const x = startX + (i % 3) * gapX
      const y = startY + Math.floor(i / 3) * gapY
      const owned = ownsLevel(level.id)
      const selected = picked === level.id
      const card = this.add.rectangle(x, y, 270, 228, selected ? 0x3a2a18 : 0x2c1a12)
      card.setStrokeStyle(5, selected ? 0xffe14a : 0xfff4e0)
      const face = hasTex(this, level.bgKey)
        ? this.add.image(x, y - 52, level.bgKey).setDisplaySize(230, 88)
        : this.add.rectangle(x, y - 52, 230, 88, 0x3a2418)
      const name = this.add
        .text(x, y + 14, level.name.toUpperCase(), {
          fontFamily: 'Bangers, system-ui',
          fontSize: '28px',
          color: '#fff4e0',
          padding: { x: 6, y: 2 },
        })
        .setOrigin(0.5)
      const blurb = this.add
        .text(x, y + 44, level.blurb, {
          fontFamily: 'Nunito, system-ui',
          fontSize: '15px',
          color: '#e8d2a8',
        })
        .setOrigin(0.5)
      this.layer?.add([card, face, name, blurb])
      if (selected) {
        this.label(x, y + 86, 'SELECTED', 0x2d8a2d)
      } else if (owned) {
        this.btn(x, y + 86, 'SELECT', 0x2d8a2d, 150, 44, () => {
          selectLevel(level.id)
          playSfx(this, 'sfx-bonus', 0.7)
          this.scene.restart({ tab: 'blocks' })
        })
      } else {
        this.btn(x, y + 86, `$${formatCoins(level.price)}`, getCoins() >= level.price ? 0xe23d28 : 0x5a3a32, 160, 44, () => {
          if (buyLevel(level.id)) {
            playSfx(this, 'sfx-bonus')
            this.say('NEW BLOCK!')
            this.scene.restart({ tab: 'blocks' })
            return
          }
          playSfx(this, 'sfx-lose', 0.5)
          this.say('NEED MORE COINS')
        })
      }
    })
  }

  private paintSling(): void {
    UPGRADES.forEach((def, i) => {
      const y = 178 + i * 96
      const level = upgradeLevel(def.id)
      const maxed = level >= def.max
      const cost = upgradeCost(def, level)
      const plate = this.add.rectangle(GAME_WIDTH / 2, y, 960, 84, 0x2c1a12)
      plate.setStrokeStyle(4, 0xfff4e0)
      const title = this.add
        .text(200, y - 12, def.name, {
          fontFamily: 'Bangers, system-ui',
          fontSize: '28px',
          color: '#fff4e0',
          padding: { x: 4, y: 2 },
        })
        .setOrigin(0, 0.5)
      const blurb = this.add
        .text(200, y + 18, `${def.blurb}  ${level}/${def.max}`, {
          fontFamily: 'Nunito, system-ui',
          fontSize: '16px',
          color: '#e8d2a8',
        })
        .setOrigin(0, 0.5)
      this.layer?.add([plate, title, blurb])
      for (let p = 0; p < def.max; p += 1) {
        const pip = this.add.rectangle(500 + p * 22, y - 12, 16, 16, p < level ? 0xffe14a : 0x3a2418)
        pip.setStrokeStyle(2, 0xfff4e0)
        this.layer?.add(pip)
      }
      if (maxed) this.label(1020, y, 'MAX', 0x2d8a2d)
      else {
        this.btn(1020, y, `$${formatCoins(cost)}`, getCoins() >= cost ? 0x2d8a2d : 0x5a3a32, 150, 48, () => {
          if (buyUpgrade(def.id)) {
            playSfx(this, 'sfx-bonus')
            this.scene.restart({ tab: 'sling' })
            return
          }
          playSfx(this, 'sfx-lose', 0.5)
          this.say('NEED MORE COINS')
        })
      }
    })
  }

  private paintCoins(): void {
    this.btn(GAME_WIDTH / 2, 188, `WATCH AD  +$${AD_COINS}`, 0x2d8a2d, 420, 72, () => {
      void this.adCoins()
    })
    COIN_PACKS.forEach((pack, i) => {
      const x = 220 + (i % 4) * 280
      const y = 400
      const card = this.add.rectangle(x, y, 250, 220, 0x2c1a12)
      card.setStrokeStyle(5, 0xffe14a)
      const name = this.add
        .text(x, y - 64, pack.name, {
          fontFamily: 'Bangers, system-ui',
          fontSize: '34px',
          color: '#fff4e0',
        })
        .setOrigin(0.5)
      const coins = this.add
        .text(x, y - 18, `$${formatCoins(pack.coins)}`, {
          fontFamily: 'Bangers, system-ui',
          fontSize: '28px',
          color: '#ffe14a',
        })
        .setOrigin(0.5)
      this.layer?.add([card, name, coins])
      this.btn(x, y + 52, pack.price, 0xe23d28, 150, 48, () => {
        void this.buy(pack.id)
      })
    })
    const hint = this.add
      .text(
        GAME_WIDTH / 2,
        560,
        iapReady() ? 'Real money packs. Same trick Hill Climb used.' : 'Paid packs light up on Poki, CrazyGames, or a store hook.',
        {
          fontFamily: 'Nunito, system-ui',
          fontSize: '16px',
          color: '#c4b8a4',
          align: 'center',
          wordWrap: { width: 900 },
        },
      )
      .setOrigin(0.5)
    this.layer?.add(hint)
  }

  private async adCoins(): Promise<void> {
    const n = await watchForCoins()
    if (n > 0) {
      playSfx(this, 'sfx-bonus')
      this.say(`+$${n}`)
      return
    }
    this.say('NO AD READY')
  }

  private async buy(id: string): Promise<void> {
    const res = await buyPack(id)
    if (res === 'ok') {
      playSfx(this, 'sfx-bonus')
      this.say('PURCHASED')
      return
    }
    if (res === 'unavailable') {
      const n = await watchForCoins()
      if (n > 0) {
        playSfx(this, 'sfx-bonus')
        this.say(`NO STORE YET — +$${n} FROM AD`)
        return
      }
      this.say('NO STORE YET — WATCH ADS FOR COINS')
      return
    }
    this.say('PURCHASE FAILED')
  }

  private btn(
    x: number,
    y: number,
    label: string,
    color: number,
    w: number,
    h: number,
    onClick: () => void,
  ): void {
    const bg = this.add.rectangle(x, y, w, h, color).setInteractive({ useHandCursor: true })
    bg.setStrokeStyle(5, 0xfff4e0)
    const text = this.add
      .text(x, y, label, {
        fontFamily: 'Bangers, system-ui',
        fontSize: h > 60 ? '36px' : '24px',
        color: '#fff4e0',
        padding: { x: 8, y: 4 },
      })
      .setOrigin(0.5)
    this.layer?.add([bg, text])
    bg.on('pointerup', onClick)
  }

  private label(x: number, y: number, text: string, color: number): void {
    const bg = this.add.rectangle(x, y, 150, 48, color)
    bg.setStrokeStyle(5, 0xfff4e0)
    const t = this.add
      .text(x, y, text, {
        fontFamily: 'Bangers, system-ui',
        fontSize: '22px',
        color: '#fff4e0',
      })
      .setOrigin(0.5)
    this.layer?.add([bg, t])
  }

  private say(msg: string): void {
    this.toast?.destroy()
    this.toast = this.add
      .text(GAME_WIDTH / 2, GAME_HEIGHT - 36, msg, {
        fontFamily: 'Bangers, system-ui',
        fontSize: '28px',
        color: '#ffe14a',
        stroke: '#1a1410',
        strokeThickness: 6,
        padding: { x: 10, y: 4 },
      })
      .setOrigin(0.5)
      .setDepth(700)
  }
}
