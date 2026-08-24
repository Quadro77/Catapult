import { equippedLevelId } from '../systems/progress.ts'
import { LEVEL_01 } from './levels/level-01.ts'
import { activeLevel, loadProject } from './project.ts'
import type { LevelDef } from '../types.ts'

export function cloneLevel(src: LevelDef = LEVEL_01): LevelDef {
  return JSON.parse(JSON.stringify(src)) as LevelDef
}

export function loadLevel(): LevelDef {
  const project = loadProject()
  const found = project.levels.find((l) => l.id === equippedLevelId())
  return cloneLevel(found ?? activeLevel(project))
}
