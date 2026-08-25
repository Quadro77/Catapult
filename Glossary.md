# Catapult Glossary

Shared language for humans and agents. Game terms match `CONTEXT.md`. Engineering terms match the Matt Pocock skills this repo uses. When two words mean the same thing, use the bold one.

## Game

A slingshot game: launch a cat at occupants in a building's windows.

### Play

**Run**:
One play attempt, from first shot until the player is out of lives and either continues or stops. Holds the shot, the score, lives, anger, streak, coins earned this attempt, and continues used.
_Avoid_: game, session, playthrough, match, PlayScene

**Shot**:
One launch during a run, from aim until an outcome. The sling does the pull. The run owns whether a shot may start, fly, or resolve — leaving aim without a flight ends the pull.
_Avoid_: turn, throw, launch

**Sling**:
The pull-and-release. Origin, pouch, bands, and ghost trail. Not the shot.
_Avoid_: slingshot (the Phaser class), catapult, launcher

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
_Avoid_: points (ok in speech), payout

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
_Avoid_: cancel shot, abort, escape (Escape is one interrupt, not the only one)

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

### Occupancy

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
Who is in which window, for how long, what a hit means, and what a miss means. The level sets how many old ladies may occupy. A catcher does not count toward that number.
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

### Loadout

**Cat**:
The projectile you equip. Mass, drag, size, and how much a catch pays.
_Avoid_: sprite, character, projectile

**Upgrade**:
A purchased rank: power, stretch, aim, soft paws, or nine lives.
_Avoid_: perk, skill, buff, CatapultMods

**Rank**:
How far one upgrade has been bought.
_Avoid_: level (that word is the building)

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

**Ghost trail**:
The dotted preview of the flight during aim.
_Avoid_: trajectory, aim line, path

**Loadout**:
This cat, these upgrade ranks, and this level's sling, finished into the numbers a shot and a run use.
_Avoid_: mods, equippedMods, loadout mapping

**Cattery**:
Where the player buys and equips the loadout: cats, upgrades, levels, and coins.
_Avoid_: Garage, Shop, store

**Daily**:
A coin claim in the cattery, once per day. Streak grows if claimed yesterday.
_Avoid_: login bonus, reward

**Coin pack**:
Real-money coins in the cattery: pouch, sack, chest, or vault.
_Avoid_: IAP, SKU, product

### Place

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
_Avoid_: map, background (the look is on the level)

**Level**:
A building you equip for a run: its look, windows, occupant timing, sling, and bounds.
_Avoid_: map, stage, scene, background, block

**Level edit**:
The working copy of a level. Windows, bounds, and sling live here. Persist writes one level back.
_Avoid_: EditorScene, WinRect

**Bake**:
Copy Geometry, ladies, catapult, and lives from the Project into TypeScript defaults. One way: save → defaults. Reset restores the last bake.
_Avoid_: rewrite save, sync both ways

**Project**:
The editor's save: title art, levels, and custom art. Not the player's wallet.
_Avoid_: save file, campaign

In this repo, **level** is always the building. Upgrade progress is a **rank**. The save still stores ranks in a field named `levels`; say rank anyway.

---

## Engineering

How we talk about code and work. Use these words exactly.

### Modules

**Module**:
Anything with an interface and an implementation. A function, class, package, or slice. The run is this repo's deep module.
_Avoid_: unit, component, service

**Interface**:
Everything a caller must know to use the module: types, invariants, order, errors, config, and performance. Broader than a TypeScript `interface`.
_Avoid_: API, signature

**Implementation**:
What's inside a module. Distinct from adapter.
_Avoid_: internals (ok in speech), body

**Depth**:
Leverage at the interface. Behaviour a caller can exercise per unit of interface they learn.

**Deep module**:
A small interface over a lot of implementation. The run is one. PlayScene is not.
_Avoid_: rich service, fat controller

**Shallow module**:
An interface nearly as complex as the implementation. A pass-through.
_Avoid_: thin wrapper (as praise)

**Seam**:
Where a module's interface lives. A place you can alter behaviour without editing in that place. Tests live at seams.
_Avoid_: boundary, API surface

**Adapter**:
A concrete thing that satisfies an interface at a seam. PlayScene is an adapter over the run.
_Avoid_: wrapper, impl, backend

**Leverage**:
What callers get from depth. More capability per unit of interface they learn.

**Locality**:
What maintainers get from depth. Change, bugs, and tests concentrate in one place.

**Deletion test**:
Imagine deleting the module. If complexity vanishes, it was a pass-through. If it reappears across callers, it was earning its keep.

### Work

**Grill**:
A relentless interview until a shared understanding. Decisions, not facts. Facts are the agent's job.
_Avoid_: brainstorm, workshop, sync

**Design tree**:
Every decision branches into the decisions that hang off it.

**Frontier**:
Every decision or ticket whose prerequisites are already settled. Work the frontier.
_Avoid_: backlog, next up, TODO list

**Ubiquitous language**:
The game terms in this file and `CONTEXT.md`. Specs, tickets, tests, and talk use these words.
_Avoid_: domain model (the docs), glossary drift

**CONTEXT.md**:
The agent glossary for this game. Same game terms as this file. No implementation details.

**ADR**:
A hard-to-reverse decision that would surprise a future reader, written down because there was a real trade-off.

**Spec**:
The problem, solution, and user stories for a piece of work. Not tickets. Not an ADR.

**Ticket**:
One tracer-bullet slice, sized for one fresh context window, with its blocking edges named.

**Tracer bullet**:
A narrow complete path through every layer. Demoable on its own. Vertical, not a horizontal slice of one layer.
_Avoid_: spike (a spike is throwaway), task, story point

**Blocking edge**:
A ticket that must finish before this one can start.

**Wide refactor**:
One mechanical change whose blast radius fans across the codebase. Sequence it expand–contract, not as a tracer bullet.

**Expand–contract**:
Add the new form beside the old, migrate callers in batches, then delete the old form.

**Prototype**:
Throwaway code that answers a question. Not production. Capture the answer, not the code, on main.
_Avoid_: MVP, spike (close, but prototype is the word)

**Handoff**:
A compact note so a fresh agent can continue. Lives outside the repo.

**TDD**:
Red, then green, one seam, one test, one slice. Refactor is review, not the loop.

**Tautological test**:
The assertion recomputes the expected value the way the code does. It cannot disagree with the code.

**Feedback loop**:
A tight pass/fail signal for this bug. Diagnosis starts here.

**Flow**:
A path through the skills. Idea → grill → spec → tickets → implement is the main one.

**HITL**:
Human in the loop. The agent must not stand in for the human.

**AFK**:
The agent drives alone. `ready-for-agent` means this.

**Re-pitch**:
Stop and say it again in the ubiquitous language. The last message did not land.

**Context pointer**:
A line that names out-of-context material and when to open it. `AGENTS.md` lines are these.

### Triage

**needs-triage**:
A maintainer still has to evaluate this issue.

**needs-info**:
Waiting on the reporter.

**ready-for-agent**:
Fully specified. An AFK agent can take it.

**ready-for-human**:
Needs a human to implement.

**wontfix**:
Will not be actioned.

**Map**:
A wayfinder issue that indexes decision tickets until the way to the destination is clear. Planning, not building.

**Decision ticket**:
A question whose resolution is a decision, not a slice of a build.

**Destination**:
What the end of a map looks like. Named first. Every ticket orients to it.
