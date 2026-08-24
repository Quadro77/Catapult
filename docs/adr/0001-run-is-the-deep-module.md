# The run is a deep module. PlayScene is an adapter.

PlayScene holds the shot, score, lives, anger, streak, coins, and continue, mixed with Phaser input, tweens, ads, and overlays. We will pull that into an in-process run module and leave the scene as an adapter. Tests hit the run without booting Phaser.

Occupancy, sling math, the wallet, ads, pause, and drawing stay out. A lady missed is an input to the run, not a reason to move Occupant inside it. Continue is a run state. Pause is scene chrome. `runEnd` is a shallow extract and will go away once the run is the test surface.

## Considered options

- **Reducer only** (Outcome in, numbers out; PlayState stays on the scene). Rejected: the bugs live in how fail, continue, and miss are called, not in the three predicates.
- **Occupancy inside the run.** Rejected: hopping windows is a different module. The run receives an Outcome and "lady missed."
- **Phaser inside the run** (overlays, Projectile, Building). Rejected: that is today's scene with a new name.
- **Wallet or shop imports on the run.** Rejected: a run starts from a numbers bag. The scene persists coins.
