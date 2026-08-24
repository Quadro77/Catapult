import { LEVEL_01, LEVEL_BY_ID, LEVEL_LIST } from './levels/index.ts'
import type { CustomArt, LevelDef, PlacedImage, ProjectSave, TitleButton } from '../types.ts'

export const DEFAULT_BUTTONS: TitleButton[] = [
  { id: 'play', x: 644, y: 611, rotation: 0 },
  { id: 'editor', x: 216, y: 66, rotation: 0 },
]

export const DEFAULT_TITLE: PlacedImage[] = [
  { id: 'bg', key: 'bg-building', x: 643, y: 364, rotation: 0, scale: 0.714, depth: 1 },
  { id: 'title', key: 'ui-title', x: 654, y: 165, rotation: 0, scale: 0.5200542786151454, depth: 10 },
  { id: 'lady', key: 'lady', x: 1032, y: 476, rotation: 0, scale: 0.721355356629047, depth: 12 },
  { id: 'sling', key: 'slingshot', x: 217, y: 488, rotation: 0, scale: 0.35924657794500753, depth: 12 },
  { id: 'img-1786865887876', key: 'cat-fly', x: 646, y: 385, rotation: 0, scale: 0.4, depth: 15 },
]

let cached: ProjectSave | null = null

export function defaultProject(): ProjectSave {
  return {
    titleImages: DEFAULT_TITLE.map((p) => ({ ...p })),
    titleButtons: DEFAULT_BUTTONS.map((b) => ({ ...b })),
    levels: LEVEL_LIST.map((l) => JSON.parse(JSON.stringify(l)) as LevelDef),
    activeLevelId: LEVEL_01.id,
    customArt: [],
  }
}

function mergeSaved(saved: Partial<ProjectSave>): ProjectSave {
  const base = defaultProject()
  if (Array.isArray(saved.titleImages) && saved.titleImages.length) base.titleImages = saved.titleImages
  if (Array.isArray(saved.titleButtons) && saved.titleButtons.length) base.titleButtons = saved.titleButtons
  if (Array.isArray(saved.levels) && saved.levels.length) {
    const savedIds = new Set(saved.levels.map((l) => l.id))
    const merged = saved.levels.map((l) => hydrateLevel(l))
    for (const l of base.levels) {
      if (!savedIds.has(l.id)) merged.push(l)
    }
    base.levels = merged
  }
  if (saved.activeLevelId) base.activeLevelId = saved.activeLevelId
  if (Array.isArray(saved.customArt)) base.customArt = saved.customArt
  return base
}

export async function loadProjectAsync(): Promise<ProjectSave> {
  try {
    const res = await fetch(`/editor/project-save.json?t=${Date.now()}`, { cache: 'no-store' })
    if (res.ok) {
      cached = mergeSaved((await res.json()) as Partial<ProjectSave>)
      return cached
    }
  } catch {
    /* use default */
  }
  cached = defaultProject()
  return cached
}

export function loadProject(): ProjectSave {
  return cached ?? defaultProject()
}

export function setProject(project: ProjectSave): void {
  cached = project
}

export async function saveProject(project: ProjectSave): Promise<boolean> {
  cached = project
  try {
    const res = await fetch('/__editor/save', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(project),
    })
    return res.ok
  } catch {
    return false
  }
}

export async function clearProject(): Promise<void> {
  const fresh = defaultProject()
  cached = fresh
  await saveProject(fresh)
}

function hydrateLevel(saved: LevelDef): LevelDef {
  const src = LEVEL_BY_ID[saved.id]
  if (!src) {
    return {
      ...saved,
      bgKey: saved.bgKey ?? 'bg-building',
      price: saved.price ?? 0,
      blurb: saved.blurb ?? '',
    }
  }
  return {
    ...src,
    ...saved,
    bgKey: saved.bgKey ?? src.bgKey,
    price: saved.price ?? src.price,
    blurb: saved.blurb ?? src.blurb,
    director: { ...src.director, ...saved.director },
  }
}

export function activeLevel(project: ProjectSave): LevelDef {
  return project.levels.find((l) => l.id === project.activeLevelId) ?? project.levels[0] ?? LEVEL_01
}

export function loadCustomArt(scene: Phaser.Scene, art: CustomArt[]): void {
  for (const item of art) {
    if (scene.textures.exists(item.key)) continue
    if (item.dataUrl) scene.textures.addBase64(item.key, item.dataUrl)
  }
}
