import Phaser from 'phaser'
import './style.css'
import { GAME_HEIGHT, GAME_WIDTH } from './game/config.ts'
import { BootScene } from './game/scenes/BootScene.ts'
import { GameOverScene } from './game/scenes/GameOverScene.ts'
import { MenuScene } from './game/scenes/MenuScene.ts'
import { EditorScene } from './game/scenes/EditorScene.ts'
import { PlayScene } from './game/scenes/PlayScene.ts'
import { ShopScene } from './game/scenes/ShopScene.ts'
import { bindFullscreenOnFirstTap } from './game/systems/fullscreen.ts'

const parent = document.querySelector<HTMLDivElement>('#game')
if (!parent) throw new Error('missing #game')

bindFullscreenOnFirstTap()

const game = new Phaser.Game({
  type: Phaser.AUTO,
  parent,
  width: GAME_WIDTH,
  height: GAME_HEIGHT,
  backgroundColor: '#1a1410',
  pixelArt: false,
  antialias: true,
  scale: {
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH,
    autoRound: false,
    fullscreenTarget: parent,
  },
  render: {
    antialias: true,
    antialiasGL: true,
    roundPixels: false,
    pixelArt: false,
    mipmapFilter: 'LINEAR_MIPMAP_LINEAR',
    powerPreference: 'high-performance',
  },
  physics: {
    default: 'arcade',
    arcade: {
      gravity: { x: 0, y: 1120 },
      debug: false,
    },
  },
  input: {
    activePointers: 3,
  },
  scene: [BootScene, MenuScene, PlayScene, GameOverScene, ShopScene, EditorScene],
})

const refresh = () => game.scale.refresh()
window.addEventListener('resize', refresh)
window.addEventListener('orientationchange', refresh)
window.visualViewport?.addEventListener('resize', refresh)
