# Bake copies Geometry from the Project into TypeScript defaults

The editor Project is the live Level edit. Bake writes windows, bounds, title placements, ladies, catapult, lives, bonus, and anger into `src/game/data/baked.ts`. Reset restores that bake. Bake never writes the save.

## Considered options

- **Rewrite the save to match TypeScript defaults.** Rejected: unbaked levels clobber editor placements. This is how Adobe and the rest were lost.
- **Keep windows in each level file and in the save.** Rejected: two sources, and an agent will "sync" the wrong way.
- **Save-only, no defaults.** Rejected: Reset and a missing save need a last-known Geometry.
