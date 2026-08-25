# Catapult

A slingshot game: launch a cat at occupants in a building's windows.

## Language

**Run**:
One play attempt, from first shot until the player is out of lives and either continues or stops. Holds the shot, the score, lives, anger, streak, coins earned this attempt, and continues used.
_Avoid_: game, session, playthrough, match, PlayScene

**Shot**:
One launch during a run, from aim until an outcome. The sling does the pull. The run owns whether a shot may start, fly, or resolve — leaving aim without a flight ends the pull.
_Avoid_: turn, throw, launch

**Sling**:
The pull-and-release. Origin, pouch, bands, and ghost trail. Not the shot.
_Avoid_: slingshot, catapult, launcher

**Pull**:
The stretch of the sling during aim. An interrupt cancels it; it does not fire.
_Avoid_: drag, charge, wind-up

**Flight**:
The cat is in the air after a pull that fired.
_Avoid_: projectile phase, in air

**Outcome**:
The result of one shot: a catch, a catcher, or a splat.
_Avoid_: hit, collision, result

**Catch**:
The cat reached an old lady. The run scores, the streak grows, coins are paid.
_Avoid_: score, save, success

**Catcher**:
The cat reached a dog catcher. The run loses a point and the streak dies.
_Avoid_: fail, miss, dog

**Splat**:
The cat hit the wall, the ground, or left the world. The run loses a life.
_Avoid_: miss, crash, out of bounds

**Score**:
How many catches this run, minus catchers. Not coins.
_Avoid_: points, payout

**Streak**:
Consecutive catches this run. A catcher or splat kills it.
_Avoid_: combo, multiplier

**Life**:
One splat or furious miss spends one. Zero lives is continue.
_Avoid_: health, HP

**Continue**:
A state of the run after lives hit zero: keep going (ad or coins) or stop. The overlay is not the continue.
_Avoid_: pause, resume, extra life

**Pause**:
Scene chrome that freezes drawing and input. Not a run state. Not a continue.
_Avoid_: continue, halt

**Interrupt**:
The run leaves aim without a flight. The pull cancels. The pouch returns.
_Avoid_: cancel shot, abort, escape

**Anger**:
How furious the old ladies are after being left uncaught. At the level's limit, the run loses a life.
_Avoid_: rage, fury, miss count

**Furious**:
Anger hit the level's limit. The run loses a life.
_Avoid_: rage quit, anger overflow

**Coin**:
Currency a run earns. The wallet keeps them. The cattery spends them.
_Avoid_: money, gold, cash, points

**Payout**:
Coins from one catch: base, height, streak, then the cat's multiplier.
_Avoid_: reward, score bonus

**Wallet**:
Persistent coins across runs. The run does not own the wallet.
_Avoid_: balance, purse, bank

**High score**:
Best score kept across runs.
_Avoid_: record, best run

**Occupant**:
Someone who appears in a window for a while: an old lady or a dog catcher. Occupancy is not the run.
_Avoid_: sprite, enemy, NPC, WindowSlot

**Old lady**:
The occupant you catch.
_Avoid_: granny, target, civilian

**Dog catcher**:
The occupant that is a catcher. Extra: does not count toward the lady cap. Has their own hole and stay; occupies only while a lady occupies.
_Avoid_: enemy, cop, dog

**Occupancy**:
Who is in which window, for how long, what a hit means, and what a miss means. The Level sets how many old ladies may occupy. A Catcher does not count toward that number.
_Avoid_: Director, WindowSlot, Building, at once, preset

**Stay**:
How long an occupant occupies before they hide.
_Avoid_: visibleMs, lifetime, duration

**Hole**:
Empty time after a lady leaves before occupancy may fill that missing lady. Each missing lady has her own hole, including before each first lady at the start of a run; if two holes end together, one occupies and the other waits.
_Avoid_: spawn gap, popInterval, cooldown, burst-fill

**Miss**:
An old lady hid uncaught. An input to the run. Anger grows.
_Avoid_: timeout, despawn, expire

**Cat**:
The projectile you equip. Mass, drag, size, and how much a catch pays.
_Avoid_: sprite, character, projectile

**Upgrade**:
A purchased rank: power, stretch, aim, soft paws, or nine lives.
_Avoid_: perk, skill, buff, CatapultMods

**Rank**:
How far one Upgrade has been bought.
_Avoid_: level

**Power**:
A sling rank. How hard a launch is.

**Stretch**:
A sling rank. How long a pull may be.

**Aim**:
A sling rank. How far the ghost trail looks. Also the run phase while the player pulls. The rank is "aim"; the phase is "aiming".

**Soft paws**:
A sling rank. Extra slop around an occupied window.

**Nine lives**:
A sling rank. Extra lives at the start of a run.

**Loadout**:
This cat, these upgrade ranks, and this level's sling, finished into the numbers a shot and a run use.
_Avoid_: mods, equippedMods, loadout mapping

**Ghost trail**:
The dotted preview of the flight during aim.
_Avoid_: trajectory, aim line, path

**Cattery**:
Where the player buys and equips the loadout: cats, upgrades, levels, and coins.
_Avoid_: Garage, Shop, store

**Daily**:
A coin claim in the cattery, once per day. Streak grows if claimed yesterday.
_Avoid_: login bonus, reward

**Coin pack**:
Real-money coins in the cattery: pouch, sack, chest, or vault.
_Avoid_: IAP, SKU, product

**Window**:
A hole in the building. Floor and bay are data on the window, not a name.
_Avoid_: WinRect, slot, hit box

**Floor**:
Which storey a window sits on. Height payout uses it. Not a name.
_Avoid_: row, storey name

**Bay**:
Which column a window sits in. Not a name.
_Avoid_: column, slot

**Geometry**:
The windows, ground, wall, and sling origin of a level, in screen space.
_Avoid_: layout, config bounds, screenWindows

**Building**:
The face of a level: its rect, floors, bays, and windows. Occupancy lives in those windows. The building is not the run.
_Avoid_: map, background

**Level**:
A building you equip for a run: its look, windows, occupant timing, sling, and bounds.
_Avoid_: map, stage, scene, background, block

**Level edit**:
The working copy of a Level. Windows, bounds, and sling live here. Persist writes one Level back.
_Avoid_: EditorScene, WinRect

**Bake**:
Copy Geometry, ladies, catapult, and lives from the Project into TypeScript defaults. One way: save → defaults. Reset restores the last bake.
_Avoid_: rewrite save, sync both ways

**Project**:
The editor's save: title art, levels, and custom art. Not the player's wallet.
_Avoid_: save file, campaign
