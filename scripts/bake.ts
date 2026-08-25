import { readFileSync, writeFileSync } from 'node:fs'
import { extractGeometry, formatBaked } from '../src/game/data/bake.ts'
import type { ProjectSave } from '../src/game/types.ts'

const src = 'public/editor/project-save.json'
const dest = 'src/game/data/baked.ts'
const save = JSON.parse(readFileSync(src, 'utf8')) as ProjectSave
const baked = extractGeometry(save)
writeFileSync(dest, formatBaked(baked))

console.log(`Baked ${src} → ${dest}`)
console.log(`Title: ${baked.titleImages.length} images, ${baked.titleButtons.length} buttons`)
for (const level of save.levels) {
  const geom = baked.levels[level.id]
  if (!geom) {
    console.log(`  ${level.name} (${level.id}): missing from bake`)
    continue
  }
  const o = geom.slingshot.origin
  const d = geom.director
  const s = geom.slingshot
  console.log(
    `  ${level.name} (${level.id}): ${geom.windows.length} windows, sling (${o.x}, ${o.y}), wall ${geom.bounds.wallRight} ground ${geom.bounds.groundY}`,
  )
  console.log(
    `    ladies ${d.maxConcurrent} at once, spawn ${d.popInterval[0]}–${d.popInterval[1]}ms, stay ${d.visibleMs[0]}–${d.visibleMs[1]}ms, catcher ${Math.round(d.catcherChance * 100)}%`,
  )
  console.log(
    `    catapult power ${s.power} pull ${s.maxPull} gravity ${s.gravity} ghost ${s.ghostT}, lives ${geom.lives} bonus ${geom.bonusEvery} anger ${geom.angerLimit}`,
  )
}
console.log('Defaults locked. Commit baked.ts to ship them.')
