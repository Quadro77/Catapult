import { ART_FILES } from './art.ts'
import { LEVEL_01 } from './levels/level-01.ts'
import type { CustomArt, LevelDef, PlacedImage, ProjectSave, TitleButton } from '../types.ts'

export const DEFAULT_BUTTONS: TitleButton[] = [
  { id: 'play', x: 640, y: 430, rotation: 0 },
  { id: 'editor', x: 640, y: 530, rotation: 0 },
]

export const DEFAULT_TITLE: PlacedImage[] = [
  { id: 'bg', key: 'bg-building', x: 640, y: 360, rotation: 0, scale: 0.714, depth: 1 },
  { id: 'title', key: 'ui-title', x: 640, y: 168, rotation: 0, scale: 0.36, depth: 10 },
  { id: 'lady', key: 'title-lady', x: 150, y: 500, rotation: 0, scale: 0.42, depth: 12 },
  { id: 'sling', key: 'title-sling', x: 160, y: 620, rotation: 0, scale: 0.17, depth: 12 },
  { id: 'flycat', key: 'title-cat-fly', x: 280, y: 520, rotation: -12, scale: 0.28, depth: 13 },
]

let cached: ProjectSave | null = null

export function defaultProject(): ProjectSave {
  return {
    titleImages: DEFAULT_TITLE.map((p) => ({ ...p })),
    titleButtons: DEFAULT_BUTTONS.map((b) => ({ ...b })),
    levels: [JSON.parse(JSON.stringify(LEVEL_01)) as LevelDef],
    activeLevelId: LEVEL_01.id,
    customArt: [],
  }
}

function mergeSaved(saved: Partial<ProjectSave>): ProjectSave {
  const base = defaultProject()
  if (Array.isArray(saved.titleImages) && saved.titleImages.length) base.titleImages = saved.titleImages
  if (Array.isArray(saved.titleButtons) && saved.titleButtons.length) base.titleButtons = saved.titleButtons
  if (Array.isArray(saved.levels) && saved.levels.length) base.levels = saved.levels
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

export async function saveUserImage(file: File, dataUrl: string): Promise<CustomArt | null> {
  const key = `user-${Date.now()}`
  try {
    const res = await fetch('/__editor/image', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ key, dataUrl, name: file.name }),
    })
    if (!res.ok) return { key, dataUrl }
    const out = (await res.json()) as { key: string; file: string }
    return { key: out.key, file: out.file }
  } catch {
    return { key, dataUrl }
  }
}

export async function clearProject(): Promise<void> {
  const fresh = defaultProject()
  cached = fresh
  await saveProject(fresh)
}

export function activeLevel(project: ProjectSave): LevelDef {
  return project.levels.find((l) => l.id === project.activeLevelId) ?? project.levels[0] ?? LEVEL_01
}

export function stockArtKeys(): string[] {
  return ART_FILES.map((a) => a.key)
}

export function loadCustomArt(scene: Phaser.Scene, art: CustomArt[]): void {
  for (const item of art) {
    if (scene.textures.exists(item.key)) continue
    if (item.dataUrl) scene.textures.addBase64(item.key, item.dataUrl)
  }
}

export function availableKeys(scene: Phaser.Scene, extra: CustomArt[]): string[] {
  const keys = new Set([...stockArtKeys(), ...extra.map((a) => a.key)])
  return [...keys].filter((k) => scene.textures.exists(k))
}
