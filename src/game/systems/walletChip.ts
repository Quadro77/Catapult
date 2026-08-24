import { GAME_WIDTH } from '../config.ts'
import { formatCoins, getCoins, onCoins } from './progress.ts'

export function addCoinChip(scene: Phaser.Scene): Phaser.GameObjects.Text {
  const txt = scene.add
    .text(GAME_WIDTH - 64, 28, `$${formatCoins(getCoins())}`, {
      fontFamily: 'Bangers, system-ui',
      fontSize: '26px',
      color: '#ffe14a',
      stroke: '#1a1410',
      strokeThickness: 6,
      padding: { x: 10, y: 4 },
    })
    .setOrigin(1, 0.5)
    .setDepth(600)
  const off = onCoins((n) => txt.setText(`$${formatCoins(n)}`))
  scene.events.once(Phaser.Scenes.Events.SHUTDOWN, off)
  return txt
}

export function floatCoins(scene: Phaser.Scene, x: number, y: number, amount: number): void {
  const pop = scene.add
    .text(x, y, `+$${amount}`, {
      fontFamily: 'Bangers, system-ui',
      fontSize: '30px',
      color: '#ffe14a',
      stroke: '#1a1410',
      strokeThickness: 6,
      padding: { x: 10, y: 4 },
    })
    .setOrigin(0.5)
    .setDepth(120)
  scene.tweens.add({
    targets: pop,
    y: y - 54,
    alpha: 0,
    duration: 780,
    ease: 'Quad.out',
    onComplete: () => pop.destroy(),
  })
}
