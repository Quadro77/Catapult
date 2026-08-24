import type { LevelDef } from '../../types.ts'
import { LEVEL_ADOBE } from './adobe.ts'
import { LEVEL_CHALET } from './chalet.ts'
import { LEVEL_CHATEAU } from './chateau.ts'
import { LEVEL_01 } from './level-01.ts'
import { LEVEL_MACHIYA } from './machiya.ts'
import { LEVEL_PALACE } from './palace.ts'

export { LEVEL_01 } from './level-01.ts'

export const LEVEL_LIST: LevelDef[] = [
  LEVEL_01,
  LEVEL_ADOBE,
  LEVEL_MACHIYA,
  LEVEL_CHALET,
  LEVEL_CHATEAU,
  LEVEL_PALACE,
]

export const LEVEL_BY_ID: Record<string, LevelDef> = Object.fromEntries(LEVEL_LIST.map((l) => [l.id, l]))

export const DEFAULT_LEVEL = LEVEL_01
