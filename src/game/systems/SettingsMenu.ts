import { GAME_WIDTH } from '../config.ts'
import { getAudioPrefs, playMusic, setAudioPrefs, stopAllMusic } from './Audio.ts'
import { exitGameFullscreen, isGameFullscreen, onFullscreenChange, requestGameFullscreen } from './fullscreen.ts'

export function addSettingsCog(
  scene: Phaser.Scene,
  opts?: { musicKey?: string; musicVol?: number; musicLoop?: boolean },
): void {
  const depth = 600
  const cog = scene.add
    .text(GAME_WIDTH - 28, 28, '⚙', {
      fontFamily: 'system-ui',
      fontSize: '28px',
      color: '#fff4e0',
      stroke: '#1a1410',
      strokeThickness: 4,
      padding: { x: 6, y: 4 },
    })
    .setOrigin(0.5)
    .setDepth(depth)
    .setInteractive({ useHandCursor: true })

  const panel = scene.add.container(GAME_WIDTH - 16, 50).setDepth(depth).setVisible(false)
  const bg = scene.add.rectangle(0, 0, 200, 152, 0x1a1410, 0.92).setOrigin(1, 0)
  bg.setStrokeStyle(3, 0xfff4e0)
  const title = scene.add
    .text(-190, 8, 'SETTINGS', {
      fontFamily: 'Bangers, system-ui',
      fontSize: '22px',
      color: '#fff4e0',
      padding: { x: 4, y: 2 },
    })
    .setOrigin(0, 0)
  const musicBtn = toggle(scene, -190, 44, 'Music', getAudioPrefs().music, (on) => {
    setAudioPrefs({ music: on })
    if (on && opts?.musicKey) playMusic(scene, opts.musicKey, opts.musicVol ?? 0.35, opts.musicLoop ?? true)
    if (!on) stopAllMusic()
  })
  const sfxBtn = toggle(scene, -190, 78, 'Sound FX', getAudioPrefs().sfx, (on) => {
    setAudioPrefs({ sfx: on })
  })
  const fullBtn = toggle(scene, -190, 112, 'Fullscreen', isGameFullscreen(), (on) => {
    if (on) requestGameFullscreen()
    else exitGameFullscreen()
  })
  panel.add([bg, title, ...musicBtn.nodes, ...sfxBtn.nodes, ...fullBtn.nodes])
  const offFs = onFullscreenChange(() => fullBtn.apply(isGameFullscreen()))
  scene.events.once(Phaser.Scenes.Events.SHUTDOWN, offFs)

  cog.on('pointerup', () => {
    panel.setVisible(!panel.visible)
  })
}

function toggle(
  scene: Phaser.Scene,
  x: number,
  y: number,
  label: string,
  on: boolean,
  set: (v: boolean) => void,
): { nodes: Phaser.GameObjects.GameObject[]; apply: (on: boolean) => void } {
  const name = scene.add
    .text(x, y, label, {
      fontFamily: 'Nunito, system-ui',
      fontSize: '16px',
      color: '#fff4e0',
    })
    .setOrigin(0, 0.5)
  const box = scene.add.rectangle(x + 168, y, 44, 24, on ? 0x2d8a2d : 0x6a4a4a).setOrigin(0.5)
  box.setStrokeStyle(2, 0xfff4e0)
  box.setInteractive({ useHandCursor: true })
  const cap = scene.add
    .text(x + 168, y, on ? 'ON' : 'OFF', {
      fontFamily: 'Nunito, system-ui',
      fontSize: '11px',
      color: '#fff4e0',
    })
    .setOrigin(0.5)
  let state = on
  const apply = (next: boolean) => {
    state = next
    box.setFillStyle(state ? 0x2d8a2d : 0x6a4a4a)
    cap.setText(state ? 'ON' : 'OFF')
  }
  box.on('pointerup', () => {
    apply(!state)
    set(state)
  })
  return { nodes: [name, box, cap], apply }
}
