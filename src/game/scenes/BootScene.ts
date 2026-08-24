import { ART_FILES } from '../data/art.ts'
import { bootAds } from '../systems/ads.ts'
import { loadAudioPrefs } from '../systems/Audio.ts'
import { loadProjectAsync } from '../data/project.ts'
import { SOUND_FILES } from '../data/sounds.ts'
import { keyAndCrop } from '../systems/chroma.ts'
import { makeTextures } from '../systems/textures.ts'

export class BootScene extends Phaser.Scene {
  constructor() {
    super({ key: 'Boot' })
  }

  preload(): void {
    for (const art of ART_FILES) {
      this.load.image(art.chroma ? `raw-${art.key}` : art.key, art.file)
    }
    for (const snd of SOUND_FILES) {
      this.load.audio(snd.key, snd.file)
    }
  }

  async create(): Promise<void> {
    loadAudioPrefs()
    bootAds()
    makeTextures(this)
    for (const key of this.textures.getTextureKeys()) {
      if (key.startsWith('__')) continue
      this.textures.get(key).setFilter(Phaser.Textures.FilterMode.LINEAR)
    }
    for (const art of ART_FILES) {
      if (!art.chroma) continue
      if (!keyAndCrop(this, `raw-${art.key}`, art.key) && this.textures.exists(`raw-${art.key}`)) {
        this.textures.addImage(art.key, this.textures.get(`raw-${art.key}`).getSourceImage() as HTMLImageElement)
      }
    }
    const project = await loadProjectAsync()
    for (const item of project.customArt) {
      if (item.file && !this.textures.exists(item.key)) this.load.image(item.key, item.file)
    }
    if (project.customArt.some((a) => a.file && !this.textures.exists(a.key))) {
      this.load.once(Phaser.Loader.Events.COMPLETE, () => this.scene.start('Menu'))
      this.load.start()
      return
    }
    this.scene.start('Menu')
  }
}
