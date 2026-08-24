import type { WindowDef } from './types.ts'

export type ScreenWindow = {
  id: string
  floor: number
  bay: number
  x: number
  y: number
  w: number
  h: number
}

export type LevelSpace = {
  windows: ScreenWindow[]
  groundY: number
  wallRight: number
  wallTop: number
  sling: { x: number; y: number }
  building: { x: number; y: number; w: number; h: number }
}

type GeometryInput = {
  building: {
    x: number
    y: number
    w: number
    h: number
    floors: number
    bays: number
    windows?: Array<{
      id: string
      nx: number
      ny: number
      nw: number
      nh: number
      floor?: number
      bay?: number
    }>
  }
  bounds: { groundY: number; wallRight: number; wallTop: number }
  slingshot: { origin: { x: number; y: number } }
}

export function geometry(level: GeometryInput): LevelSpace {
  const b = level.building
  const defs = b.windows ?? gridWindows(b)
  return {
    windows: defs.map((w) => {
      const place = fromId(w.id)
      return {
        id: w.id,
        floor: w.floor ?? place.floor,
        bay: w.bay ?? place.bay,
        x: b.x + w.nx * b.w,
        y: b.y + w.ny * b.h,
        w: w.nw * b.w,
        h: w.nh * b.h,
      }
    }),
    groundY: level.bounds.groundY,
    wallRight: level.bounds.wallRight,
    wallTop: level.bounds.wallTop,
    sling: { x: level.slingshot.origin.x, y: level.slingshot.origin.y },
    building: { x: b.x, y: b.y, w: b.w, h: b.h },
  }
}

export function toWindowDefs(
  windows: ScreenWindow[],
  building: { x: number; y: number; w: number; h: number },
): WindowDef[] {
  return windows.map((w) => ({
    id: w.id,
    floor: w.floor,
    bay: w.bay,
    nx: (w.x - building.x) / building.w,
    ny: (w.y - building.y) / building.h,
    nw: w.w / building.w,
    nh: w.h / building.h,
  }))
}

function fromId(id: string): { floor: number; bay: number } {
  const parts = id.match(/f(\d+)b(\d+)/)
  return {
    floor: parts ? Number(parts[1]) : 0,
    bay: parts ? Number(parts[2]) : 0,
  }
}

function gridWindows(b: GeometryInput['building']): WindowDef[] {
  const padX = 58
  const padTop = 52
  const padBot = 78
  const gapX = 30
  const gapY = 26
  const { floors, bays, x, y, w, h } = b
  const cellW = (w - padX * 2 - gapX * (bays - 1)) / bays
  const cellH = (h - padTop - padBot - gapY * (floors - 1)) / floors
  const out: WindowDef[] = []
  for (let floor = 0; floor < floors; floor += 1) {
    for (let bay = 0; bay < bays; bay += 1) {
      const wx = x + padX + bay * (cellW + gapX)
      const wy = y + padTop + floor * (cellH + gapY)
      out.push({
        id: `f${floor}b${bay}`,
        floor,
        bay,
        nx: (wx - x) / w,
        ny: (wy - y) / h,
        nw: cellW / w,
        nh: cellH / h,
      })
    }
  }
  return out
}
