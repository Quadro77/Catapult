const KEY = 'catapult-high-score'

export function getHighScore(): number {
  try {
    const n = Number(localStorage.getItem(KEY))
    return Number.isFinite(n) && n > 0 ? Math.floor(n) : 0
  } catch {
    return 0
  }
}

export function recordHighScore(score: number): number {
  const best = Math.max(getHighScore(), Math.max(0, Math.floor(score)))
  try {
    localStorage.setItem(KEY, String(best))
  } catch {
    /* ignore quota / private mode */
  }
  return best
}
