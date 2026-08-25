import type { LevelDef, PlacedImage, ProjectSave, TitleButton, WindowDef } from '../types.ts'

export type BakedLevelGeometry = {
  windows: WindowDef[]
  bounds: LevelDef['bounds']
  director: LevelDef['director']
  slingshot: LevelDef['slingshot']
  lives: number
  bonusEvery: number
  angerLimit: number
}

export type BakedGeometry = {
  titleImages: PlacedImage[]
  titleButtons: TitleButton[]
  levels: Record<string, BakedLevelGeometry>
}

export function extractGeometry(save: ProjectSave): BakedGeometry {
  const levels: Record<string, BakedLevelGeometry> = {}
  for (const level of save.levels) {
    levels[level.id] = {
      windows: (level.building.windows ?? []).map((w) => ({ ...w })),
      bounds: { ...level.bounds },
      director: {
        popInterval: [...level.director.popInterval],
        visibleMs: [...level.director.visibleMs],
        maxConcurrent: level.director.maxConcurrent,
        catcherChance: level.director.catcherChance,
        pool: [...level.director.pool],
      },
      slingshot: { ...level.slingshot, origin: { ...level.slingshot.origin } },
      lives: level.lives,
      bonusEvery: level.bonusEvery,
      angerLimit: level.angerLimit,
    }
  }
  return {
    titleImages: save.titleImages.map((p) => ({ ...p })),
    titleButtons: save.titleButtons.map((b) => ({ ...b })),
    levels,
  }
}

export function applyGeometry(project: ProjectSave, baked: BakedGeometry): ProjectSave {
  return {
    ...project,
    titleImages: baked.titleImages.map((p) => ({ ...p })),
    titleButtons: baked.titleButtons.map((b) => ({ ...b })),
    levels: project.levels.map((level) => {
      const geom = baked.levels[level.id]
      if (!geom) return level
      return {
        ...level,
        lives: geom.lives,
        bonusEvery: geom.bonusEvery,
        angerLimit: geom.angerLimit,
        building: { ...level.building, windows: geom.windows.map((w) => ({ ...w })) },
        director: {
          popInterval: [...geom.director.popInterval],
          visibleMs: [...geom.director.visibleMs],
          maxConcurrent: geom.director.maxConcurrent,
          catcherChance: geom.director.catcherChance,
          pool: [...geom.director.pool],
        },
        slingshot: { ...geom.slingshot, origin: { ...geom.slingshot.origin } },
        bounds: { ...geom.bounds },
      }
    }),
  }
}

export function formatBaked(baked: BakedGeometry): string {
  return `import type { BakedGeometry } from './bake.ts'\n\nexport const BAKED: BakedGeometry = ${JSON.stringify(baked, null, 2)}\n`
}
