const MUSIC: Record<string, Phaser.Sound.BaseSound> = {}
const PREF_KEY = 'catapult-audio-prefs'

export type AudioPrefs = {
  music: boolean
  sfx: boolean
}

let prefs: AudioPrefs = { music: true, sfx: true }

export function loadAudioPrefs(): AudioPrefs {
  try {
    const raw = localStorage.getItem(PREF_KEY)
    if (raw) prefs = { ...prefs, ...(JSON.parse(raw) as Partial<AudioPrefs>) }
  } catch {
    /* keep defaults */
  }
  return prefs
}

export function getAudioPrefs(): AudioPrefs {
  return prefs
}

export function setAudioPrefs(next: Partial<AudioPrefs>): AudioPrefs {
  prefs = { ...prefs, ...next }
  localStorage.setItem(PREF_KEY, JSON.stringify(prefs))
  if (!prefs.music) stopAllMusic()
  return prefs
}

export function playSfx(scene: Phaser.Scene, key: string, volume = 1): void {
  if (!prefs.sfx) return
  if (!scene.cache.audio.exists(key)) return
  scene.sound.stopByKey(key)
  scene.sound.play(key, { volume })
}

export function stopSfx(scene: Phaser.Scene, key: string): void {
  scene.sound.stopByKey(key)
}

export function playMusic(scene: Phaser.Scene, key: string, volume = 0.35, loop = true): void {
  if (!prefs.music) {
    stopAllMusic()
    return
  }
  if (!scene.cache.audio.exists(key)) return
  if (MUSIC[key]?.isPlaying) return
  stopAllMusic()
  let track = MUSIC[key]
  if (!track) {
    track = scene.sound.add(key, { loop, volume })
    MUSIC[key] = track
  }
  track.play({ loop, volume })
}

export function stopMusic(key: string): void {
  const track = MUSIC[key]
  if (track?.isPlaying) track.stop()
}

export function stopAllMusic(): void {
  for (const track of Object.values(MUSIC)) {
    if (track.isPlaying) track.stop()
  }
}

export function unlockAnd(scene: Phaser.Scene, fn: () => void): void {
  if (scene.sound.locked) {
    scene.sound.once(Phaser.Sound.Events.UNLOCKED, fn)
    scene.events.once(Phaser.Scenes.Events.SHUTDOWN, () => {
      scene.sound.off(Phaser.Sound.Events.UNLOCKED, fn)
    })
    return
  }
  fn()
}
