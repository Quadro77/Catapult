import { LEVEL_01 } from './levels/level-01.ts'
import { activeLevel, loadProject, saveProject } from './project.ts'
import type { LevelDef, WindowDef } from '../types.ts'

export function cloneLevel(src: LevelDef = LEVEL_01): LevelDef {
  return JSON.parse(JSON.stringify(src)) as LevelDef
}

export function loadLevel(): LevelDef {
  return cloneLevel(activeLevel(loadProject()))
}

export function saveLevel(level: LevelDef): void {
  const project = loadProject()
  const i = project.levels.findIndex((l) => l.id === level.id)
  if (i >= 0) project.levels[i] = level
  else project.levels.push(level)
  project.activeLevelId = level.id
  void saveProject(project)
}

export function clearSavedLevel(): void {
  const project = loadProject()
  project.levels = project.levels.map((l) => (l.id === project.activeLevelId ? cloneLevel(LEVEL_01) : l))
  void saveProject(project)
}

export function windowsToScreen(level: LevelDef): { id: string; x: number; y: number; w: number; h: number }[] {
  const b = level.building
  const list = b.windows ?? []
  return list.map((w) => ({
    id: w.id,
    x: b.x + w.nx * b.w,
    y: b.y + w.ny * b.h,
    w: w.nw * b.w,
    h: w.nh * b.h,
  }))
}

export function screenToWindows(
  rects: { id: string; x: number; y: number; w: number; h: number }[],
  level: LevelDef,
): WindowDef[] {
  const b = level.building
  return rects.map((r) => ({
    id: r.id,
    nx: (r.x - b.x) / b.w,
    ny: (r.y - b.y) / b.h,
    nw: r.w / b.w,
    nh: r.h / b.h,
  }))
}
