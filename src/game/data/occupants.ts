import type { OccupantDef, OccupantId } from '../types.ts'

export const OCCUPANTS: Record<OccupantId, OccupantDef> = {
  oldLady: {
    id: 'oldLady',
    label: 'Granny',
    color: 0xf2a0c8,
    accent: 0xc45a9a,
  },
  dogCatcher: {
    id: 'dogCatcher',
    label: 'Catcher',
    color: 0x5a6e32,
    accent: 0x3a4a22,
  },
}
