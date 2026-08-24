# Occupancy ticks during aim; an interrupt cancels the pull

Ladies keep leaving while the player aims, so Anger can take a life mid-pull. When the run leaves aim without a flight — furious, continue, over, or a dead pointer — the pull ends and the pouch returns. It does not fire. Escape already did this; the other exits must match.

## Considered options

- **Freeze occupancy while aiming.** Rejected: the pressure is intended. Adobe shows the bug first because you hold longer, not because its sling is different.
- **Fire the shot on interrupt.** Rejected: the run already left aim. That would be a shot it did not grant.
