export type OccupantId = 'oldLady' | 'dogCatcher'

export type OccupantDef = {
  id: OccupantId
  label: string
  color: number
  accent: number
}

export type OccupantInstance = {
  defId: OccupantId
  windowId: string
  until: number
}

export type CatDef = {
  id: string
  name: string
  mass: number
  drag: number
  radius: number
  color: number
}

export type CatapultMods = {
  power: number
  elasticity: number
  ghostT: number
  maxPull: number
  multiShot: number
}

export type WindowDef = {
  id: string
  nx: number
  ny: number
  nw: number
  nh: number
}

export type LevelDef = {
  id: string
  name: string
  lives: number
  bonusEvery: number
  angerLimit: number
  building: {
    floors: number
    bays: number
    x: number
    y: number
    w: number
    h: number
    windows?: WindowDef[]
  }
  director: {
    popInterval: [number, number]
    visibleMs: [number, number]
    maxConcurrent: number
    catcherChance: number
    pool: OccupantId[]
  }
  slingshot: {
    origin: { x: number; y: number }
    maxPull: number
    power: number
    gravity: number
    ghostT: number
  }
  bounds: {
    groundY: number
    wallRight: number
    wallTop: number
  }
}

export type Outcome =
  | { kind: 'catch'; windowId: string }
  | { kind: 'catcher'; windowId: string }
  | { kind: 'splat'; reason: 'wall' | 'ground' | 'bounds' }

export type PlayState = 'idle' | 'aiming' | 'flight' | 'resolving' | 'paused' | 'over'

export type PlacedImage = {
  id: string
  key: string
  x: number
  y: number
  rotation: number
  scale: number
  depth: number
}

export type CustomArt = {
  key: string
  file?: string
  dataUrl?: string
}

export type TitleButton = {
  id: 'play' | 'editor'
  x: number
  y: number
  rotation: number
}

export type ProjectSave = {
  titleImages: PlacedImage[]
  titleButtons: TitleButton[]
  levels: LevelDef[]
  activeLevelId: string
  customArt: CustomArt[]
}
