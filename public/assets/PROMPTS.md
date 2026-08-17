# Catapult — Grok Imagine prompts

Save each result as the **exact filename** into this folder

Do not generate rubber bands, aim dots, score numbers, or lives text. Those are drawn in code.

---

## Paste this on EVERY prompt

```
1940s Looney Tunes theatrical short, Tex Avery squash-and-stretch, thick black ink outlines, flat cel paint, 2-3 tone shading only, saturated butter-yellow tomato-red sky-cyan cream plaster, NO photorealism, NO 3D render, NO cinematic lighting, NO text, NO watermark, NO drop shadow
```

**Sprites** (everything except the background): add this too

```
game sprite, one subject, centered, solid magenta background #FF00FF
```

**Character locks** — copy the matching lock into that character’s prompts, word for word.

Cat: `small orange tabby, oversized head, huge white belly, cream muzzle, four freckles, one bent left ear, huge pupils, short sausage body`

Lady: `tiny round old lady, huge head, tiny body, lavender bun with one knitting needle, crescent reading glasses, pink floral housecoat, pearl earrings, white gloves`

Catcher: `lanky dog catcher, tiny brim hat, long olive-green coat, pencil mustache, sneaky grin, baggy pants, huge butterfly net`

---

## Required (12)

### 1. `bg-building.png`
Full scene. 16:9. Building on the **right**, open street on the **left**.

```
16:9 side-view game background. Right 70 percent is a cream plaster 4-story tenement, exactly 3 identical windows per floor, forest-green frames, flower boxes, fire escape on the far right, stoop at street level. Window openings are empty dark warm-brown rectangles, no people inside. Left 30 percent is open sidewalk and street, red hydrant, tiny distant buildings. Bright noon cartoon sky, two simple white clouds.
[STYLE LOCK]
NO characters, NO slingshot, NO cat, NO text, NO watermark, NO 3D.
```

### 2. `slingshot-frame.png`
Wood Y only. We draw the bands in code.

```
[SPRITE LOCK]
A giant Y-shaped wooden slingshot on a tiny wheeled cart, honey-colored wood, two empty metal hooks on the top forks, no rubber bands, no pouch, no cat, no person. Three-quarter view facing right.
[STYLE LOCK]
```

### 3. `sling-pouch.png`

```
[SPRITE LOCK]
A small empty brown leather slingshot pouch, slightly cupped, no bands, no cat.
[STYLE LOCK]
```

### 4. `cat-idle.png`
Sitting in the pouch.

```
[SPRITE LOCK]
[CAT LOCK], sitting, side view facing right, paws together, slightly worried grin, full body.
[STYLE LOCK]
```

### 5. `cat-stretch.png`
While the player pulls back.

```
[SPRITE LOCK]
[CAT LOCK], body stretched long like taffy horizontally, claws dug in, eyes as dots, mouth a tiny o, full body.
[STYLE LOCK]
```

### 6. `cat-fly.png`
In the air.

```
[SPRITE LOCK]
[CAT LOCK], airborne Superman pose facing right, ears blown back, front paws pointed, back legs trailing, manic grin, full body. NO motion lines.
[STYLE LOCK]
```

### 7. `cat-splat.png`
Hit the wall.

```
[SPRITE LOCK]
[CAT LOCK], accordion-flat pancake body, dizzy swirl eyes, tongue out. NO wall.
[STYLE LOCK]
```

### 8. `lady-peek.png`
Head and shoulders in a window. Faces **left** (toward the slingshot).

```
[SPRITE LOCK]
[LADY LOCK], head and shoulders only, peeking up as if over a windowsill, looking left, wild delighted smile. NO window frame.
[STYLE LOCK]
```

### 9. `lady-catch.png`
Successful hit.

```
[SPRITE LOCK]
[LADY LOCK], head shoulders and arms, both white-gloved hands reaching left to catch something, overjoyed. NO cat, NO window.
[STYLE LOCK]
```

### 10. `lady-celebrate.png`

```
[SPRITE LOCK]
[LADY LOCK], hugging an orange tabby with a white belly to her cheek, both blissed out. NO window.
[STYLE LOCK]
```

### 11. `catcher-pop.png`
Empty-window fail.

```
[SPRITE LOCK]
[CATCHER LOCK], bursting upward, net raised, looking left, head shoulders and net. NO window, NO cat.
[STYLE LOCK]
```

### 12. `catcher-gotcha.png`

```
[SPRITE LOCK]
[CATCHER LOCK], net slammed down over a flattened orange tabby, villain wink. NO window.
[STYLE LOCK]
```

---

## Optional (5)

### 13. `window-lit.png`

```
[SPRITE LOCK]
Square. One cartoon window, forest-green frame, warm butter-yellow room, floral wallpaper, tiny lamp, no people.
[STYLE LOCK]
```

### 14. `window-dark.png`

```
[SPRITE LOCK]
Square. Same forest-green window frame, interior deep warm brown, no people.
[STYLE LOCK]
```

### 15. `vfx-splat.png`

```
[SPRITE LOCK]
A yellow-red jagged cartoon impact star, no characters.
[STYLE LOCK]
```

### 16. `ui-play.png`

```
[SPRITE LOCK]
A chunky red circus-ticket button that says PLAY in bold cream letters, slight tilt.
[STYLE LOCK]
(this one MAY include the word PLAY)
```

### 17. `ui-title.png`

```
The word CATAPULT as a Looney Tunes title card, the first C is a cat tail, cream and tomato-red, thick ink, slight arc, solid magenta background #FF00FF. NO other words.
[STYLE LOCK]
```

---

## How to assemble a prompt

Replace the bracket tags. Example for `cat-fly.png`:

```
game sprite, one subject, centered, solid magenta background #FF00FF. small orange tabby, oversized head, huge white belly, cream muzzle, four freckles, one bent left ear, huge pupils, short sausage body, airborne Superman pose facing right, ears blown back, front paws pointed, back legs trailing, manic grin, full body. NO motion lines. 1940s Looney Tunes theatrical short, Tex Avery squash-and-stretch, thick black ink outlines, flat cel paint, 2-3 tone shading only, saturated butter-yellow tomato-red sky-cyan cream plaster, NO photorealism, NO 3D render, NO cinematic lighting, NO text, NO watermark, NO drop shadow
```

If Imagine ignores the magenta, regenerate and add: `pure flat #FF00FF backdrop, chroma key, no floor, no studio`.
