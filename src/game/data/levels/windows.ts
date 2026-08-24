export function win(
  id: string,
  floor: number,
  bay: number,
  x: number,
  y: number,
  w: number,
  h: number,
): { id: string; floor: number; bay: number; nx: number; ny: number; nw: number; nh: number } {
  return {
    id,
    floor,
    bay,
    nx: x / 1280,
    ny: y / 720,
    nw: w / 1280,
    nh: h / 720,
  }
}
