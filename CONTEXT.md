# Catapult

A slingshot game: launch a cat at occupants in a building's windows.

## Language

**Run**:
One play attempt, from first shot until the player is out of lives and either continues or stops. Holds the shot, the score, lives, anger, streak, coins earned this attempt, and continues used.
_Avoid_: game, session, playthrough, match, PlayScene

**Shot**:
One launch during a run, from aim until an outcome. The sling does the pull. The run owns whether a shot may start, fly, or resolve — leaving aim without a flight ends the pull.
_Avoid_: turn, throw, launch

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

**Continue**:
A state of the run after lives hit zero: keep going (ad or coins) or stop. The overlay is not the continue.
_Avoid_: pause, resume, extra life

**Anger**:
How furious the old ladies are after being left uncaught. At the level's limit, the run loses a life.
_Avoid_: rage, fury, miss count

**Occupant**:
Someone who appears in a window for a while: an old lady or a dog catcher. Occupancy is not the run.
_Avoid_: sprite, enemy, NPC, WindowSlot

**Occupancy**:
Who is in which window, for how long, what a hit means, and what a miss means. The Level sets how many old ladies may occupy. A Catcher does not count toward that number.
_Avoid_: Director, WindowSlot, Building, at once, preset

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
A sling rank. How far the ghost trail looks.

**Soft paws**:
A sling rank. Extra slop around an occupied window.

**Nine lives**:
A sling rank. Extra lives at the start of a run.

**Loadout**:
This cat, these upgrade ranks, and this level's sling, finished into the numbers a shot and a run use.
_Avoid_: mods, equippedMods, loadout mapping

**Cattery**:
Where the player buys and equips the loadout: cats, upgrades, levels, and coins.
_Avoid_: Garage, Shop, store

**Window**:
A hole in the building. Floor and bay are data on the window, not a name.
_Avoid_: WinRect, slot, hit box

**Geometry**:
The windows, ground, wall, and sling origin of a level, in screen space.
_Avoid_: layout, config bounds, screenWindows

**Level**:
A building you equip for a run: its look, windows, occupant timing, sling, and bounds.
_Avoid_: map, stage, scene, background, block

**Level edit**:
The working copy of a Level. Windows, bounds, and sling live here. Persist writes one Level back.
_Avoid_: EditorScene, WinRect
