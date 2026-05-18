# D001 Image Generation — Complete Prompt Package

**Use this to replace the SVG-rendered placeholder cover at `public/dossiers/D001/fig-cover.png` with a real Picasso continuous-line illustration from your image model of choice.**

The SVG cover currently in the repo is a polished fallback so the build doesn't break. It is intentionally simple and will be visibly lower-fidelity than what a modern image model can produce. The canonical T4A image style is hand-drawn-feeling, expressive line work that only an image model can deliver convincingly.

This document gives you complete, paste-ready prompts for the major image models, plus three alternative cover concepts in case the primary one doesn't land on first try.

---

## 0. Quick-start workflow

1. Pick a model from §2 (Midjourney v6+ recommended for line-art fidelity).
2. Pick a concept from §3 (Concept A is the spec'd version).
3. Copy the model-specific prompt below the concept.
4. Generate. If the first result fails the acceptance criteria in §5, re-prompt using the failure-mode notes in §6.
5. Download the result. Resize/crop to 1200×630 if needed (most models give you square or close-to-square output).
6. Save as `public/dossiers/D001/fig-cover.png` (overwrite the SVG-rendered placeholder).
7. Verify with `npm run validate-dossiers && npm run dev` then visit `/dossier/D001` and check the hero.

---

## 1. The canonical T4A image style — constants across all dossiers

These constants apply to every illustration in the dossier series. Do not vary them — they are the visual identity of T4A and exist for a reason.

| Constant | Value | Why |
|---|---|---|
| **Background colour** | `#0f0f23` (deep dark navy, nearly black) | Editorial gravity; readable on phone in any lighting |
| **Stroke colour** | `#FFFFFF` (pure white) | Maximum contrast against navy |
| **Stroke style** | Single continuous line, perfectly consistent stroke weight | The Picasso reference; unmistakably editorial |
| **Stroke quality** | Bold, smooth, confident; no breaks, no fills, no shading | One unbroken gesture from start to finish |
| **Aspect ratio** | 1.91:1 (1200 × 630 px) | Open Graph standard; also the dossier's hero aspect |
| **Composition** | Subject centre-left; generous negative space on the right | Reserved for the T4A signature and editorial breathing room |
| **Signature** | Cursive `T4A` in lower-right, continuing the same stroke | Brand mark; must feel organic to the line, not added separately |
| **Emotional register** | Contemplative, composed, editorial; never slumped, weeping, or chaotic | T4A is non-partisan analysis, not protest art |
| **3R discipline** | No religious symbols, royal regalia, songkok/kippah/turban, etc. | Editorial neutrality |

---

## 2. Recommended image models, in order

| Model | Strength for this task | How to access |
|---|---|---|
| **Midjourney v6 / v6.1** | Best continuous-line fidelity; understands "one unbroken stroke"; honours `--style raw` | midjourney.com or Discord |
| **DALL-E 3** (via ChatGPT Plus or Sora) | Strong on the conceptual scene; line-quality slightly noisier than MJ | chatgpt.com (with image) |
| **Google Imagen 3 / Imagen 4** | Increasingly clean line work; very obedient to colour specs | gemini.google.com or aistudio.google.com |
| **Sora (image mode)** | Cinematic composition; line-art can be a hit-or-miss style | sora.com |
| **Ideogram 2.0** | Excellent if you want any embedded text (the T4A signature) to be crisp | ideogram.ai |

If you have access to multiple, run the prompt through two and pick the better result. Midjourney + DALL-E is a good combo for cross-check.

---

## 3. Cover concepts and prompts

### CONCEPT A (PRIMARY) — Four figures around a negotiation table

The spec'd version. Editorial idea: the room you cannot see. Four suited figures seated around a table from a three-quarter angle, a window at the rear through which a faint distant crowd is suggested by the same continuous line.

#### MIDJOURNEY v6 / v6.1

Paste this into Midjourney (the entire block, including parameters):

```
A minimalist Pablo Picasso single continuous line drawing on a deep dark navy background exactly #0f0f23. One single unbroken bold white line #FFFFFF with perfectly consistent stroke weight throughout, drawn as one continuous gesture without the pen lifting. Four figures in suits seated around a rectangular table from a three-quarter angle. A single window at the rear of the room. Through the window, the outlines of a distant crowd faintly suggested by the same continuous line. Figures poised, composed, contemplative — not slumped or weeping. The room is composed, not chaotic. At the bottom right, the same line continues seamlessly into a hand-drawn cursive T4A signature as the ending tail of the stroke. Elegant, minimalist, editorial. No fill, no shading, no extra lines, no unnecessary details. Generous negative space toward the right side of the frame. --ar 1.91:1 --style raw --v 6.1 --s 50 --no fill, shading, color, gradient, texture, photorealism
```

#### DALL-E 3 (via ChatGPT)

```
Create a minimalist Pablo Picasso single continuous line drawing on a deep dark navy background exactly #0f0f23. The drawing must use one single unbroken bold white line (#FFFFFF) with perfectly consistent stroke weight throughout — the entire drawing created as one continuous gesture without the pen lifting from the canvas.

Subject: four figures in suits seated around a rectangular table, viewed from a three-quarter angle. At the rear of the room, a single window through which the outlines of a distant crowd are faintly suggested by the same continuous line. The figures are poised, contemplative, composed — not slumped, weeping, or chaotic.

At the bottom right corner, the line continues seamlessly into a natural hand-drawn cursive "T4A" signature as the ending tail of the stroke. The T4A signature must feel like an organic part of the single unbroken line, not added separately.

Style: elegant minimalist single-line illustration. Contemplative. Editorial. No fill. No shading. No extra lines. No unnecessary details. Generous negative space, especially toward the right side of the frame.

Aspect ratio: 1.91:1 wide landscape (will be saved at 1200×630).
```

#### Google Imagen / Gemini

```
Generate a 1200×630 image: a minimalist single continuous line drawing in the style of Pablo Picasso, drawn as one unbroken bold white line on a deep dark navy background (background exactly #0f0f23, line exactly #FFFFFF). The stroke weight is perfectly consistent throughout — a single continuous gesture with no pen lifts. The drawing depicts four figures in suits seated around a rectangular table from a three-quarter angle, with a single window at the rear of the room through which a distant crowd is faintly suggested by the same continuous line. The figures are poised and contemplative, not slumped. The room is composed. At the bottom right of the frame, the same continuous line forms a natural cursive T4A signature as the tail of the stroke. The composition leaves generous negative space on the right side. No fill, no shading, no additional lines, no decorative elements.
```

#### Sora (image mode)

```
A minimalist editorial illustration: one continuous white line on a deep dark navy background, in the style of Pablo Picasso. The line, of perfectly consistent bold weight, traces four figures in suits seated around a rectangular table from a three-quarter angle. Behind them, a single window through which a distant crowd is suggested by the same continuous line. The line concludes in a hand-drawn cursive "T4A" signature in the bottom right corner. The figures are composed and contemplative. The composition has generous negative space on the right. No fill, no shading, no extra detail. Aspect ratio 1.91:1.
```

#### Ideogram 2.0

```
Picasso-style single continuous line drawing. Background #0f0f23 deep navy. One unbroken white line #FFFFFF, consistent bold stroke weight. Subject: four suited figures seated around a long rectangular table, three-quarter view. Rear of room: a single window with the silhouette of a distant crowd suggested by the same line. Contemplative, editorial register. Bottom-right corner: the same line forms a cursive "T4A" signature as its tail. Negative space dominant on the right. Aspect ratio 1.91:1. No fill, no shading, no colour beyond white-on-navy.
```

---

### CONCEPT B (ALTERNATIVE) — The slightly-ajar door (matches the upgraded OG)

If the four-figures composition doesn't land cleanly, this is the alternative. The OG image already uses a door as the architectural mark; a matching cover gives the dossier a unified visual signature.

Editorial idea: the same "room you cannot see" — but rendered as a closed door with a sliver of light spilling from it. Simpler, more abstract, easier for image models to render cleanly.

#### MIDJOURNEY v6 / v6.1

```
Minimalist Pablo Picasso single continuous line drawing on a deep dark navy background exactly #0f0f23. One unbroken bold white line #FFFFFF, perfectly consistent stroke weight. The line traces a tall closed door in a darkened hallway, viewed straight-on, slightly ajar — a thin sliver of warm burgundy light spilling from the gap. A small door handle. The bottom-right corner: the same line continues seamlessly into a cursive T4A signature as the tail of the stroke. Contemplative, editorial. Generous negative space. No fill, no shading. --ar 1.91:1 --style raw --v 6.1 --s 50 --no clutter, decoration, color, gradient
```

#### DALL-E 3

```
A minimalist single continuous line drawing in the style of Pablo Picasso, on a deep dark navy background exactly #0f0f23. One unbroken bold white line (#FFFFFF) of perfectly consistent stroke weight. The line traces a tall closed door, slightly ajar, with a thin sliver of warm burgundy light spilling from the gap (the light is the only non-white element, drawn in burgundy #9B2C2C as five or six short radiating rays). A small door handle. At the bottom-right corner, the line continues into a hand-drawn cursive "T4A" signature as the tail. Contemplative, editorial, minimalist. No fill. No shading. No extra detail. Generous negative space. Aspect ratio 1.91:1.
```

---

### CONCEPT C (ALTERNATIVE) — An empty chair at a long table

Editorial idea: the seat that was vacated, the defection that defines the dossier. A long conference table seen from a low angle, three figures seated, one chair empty with the chair pulled back.

#### MIDJOURNEY v6 / v6.1

```
A minimalist Pablo Picasso single continuous line drawing on a deep dark navy background exactly #0f0f23. One unbroken bold white line #FFFFFF, perfectly consistent stroke weight, drawn as one continuous gesture. A long rectangular conference table viewed from a low three-quarter angle. Three suited figures seated, contemplative; one chair pulled back and empty, suggesting recent departure. At the rear, a window through which faint outlines of a distant crowd are barely visible. The line concludes in a hand-drawn cursive T4A signature at the bottom-right. Editorial, minimalist, composed. No fill, no shading, no clutter. --ar 1.91:1 --style raw --v 6.1 --s 50 --no color, gradient, texture, photorealism
```

---

### CONCEPT D (ALTERNATIVE) — A single hand revealing playing-card seat counts

Editorial idea: the negotiating leverage of a pivotal player. A single hand holds a fan of three playing cards face-down, except one card flipped to reveal a number (the seat count). The whole scene drawn as one continuous line.

#### MIDJOURNEY v6 / v6.1

```
A minimalist Pablo Picasso single continuous line drawing on a deep dark navy background exactly #0f0f23. One unbroken bold white line #FFFFFF of perfectly consistent stroke weight. The line traces a single hand from the wrist up, holding a fan of three playing cards face-down. The middle card is flipped face-up to reveal a large number "30" hand-lettered in the same line style. The hand is composed, fingers steady. The line concludes in a hand-drawn cursive T4A signature at the bottom-right. Editorial, minimalist, generous negative space. No fill, no shading, no decoration. --ar 1.91:1 --style raw --v 6.1 --s 50 --no color, gradient
```

---

## 4. OG image — replacing the door element (optional)

The current OG at `public/dossiers/D001/og-1200x630.png` is already typography-led and ships clean. The right-side architectural mark (the door) is rendered in SVG. If you want a higher-fidelity hero element, generate the door as a Picasso continuous-line illustration and the OG renderer will composite it.

**This is optional.** The current OG is shippable. Only do this if you have spare cycles and want to push the OG visual to magazine-cover register.

### MIDJOURNEY prompt for OG hero element only

```
A minimalist Pablo Picasso single continuous line drawing on a deep dark navy background exactly #0f0f23. One unbroken bold white line #FFFFFF, perfectly consistent stroke weight, drawn as one gesture. Subject: a tall closed door, slightly ajar, viewed straight-on. A thin sliver of warm burgundy light (#9B2C2C, rendered as 4-5 short radiating rays) spilling from the gap. A small door handle. Centred composition, the door fills 70% of the frame height. No T4A signature. Square aspect ratio. Used as a composite element. --ar 1:1 --style raw --v 6.1 --s 30 --no clutter, decoration, color outside burgundy beam
```

Save as `public/dossiers/D001/og-door-element.png` (1080×1080 square). The OG SVG can then reference it and re-render via `npm run render-dossier-images`.

---

## 5. Acceptance criteria

Before saving any generated image to `public/dossiers/D001/fig-cover.png`, walk this checklist. Reject and re-prompt if any answer is "no."

- [ ] **One unbroken line.** Trace the line with your eye from one corner to another. Are there any breaks, gaps, or jumps? If yes, reject.
- [ ] **Consistent stroke weight.** Is the line the same thickness throughout? If it varies dramatically, reject.
- [ ] **No fill, no shading, no colour gradient.** The image must be white-line-on-navy only. Burgundy is permitted only for an intentional accent element (e.g. light spilling from a door, per Concept B). Reject if the model added shading, fill, or rainbow strokes.
- [ ] **Composition leaves negative space on the right.** The subject sits centre or centre-left. The right ~30% of the frame is mostly empty navy. If the subject fills the entire frame, reject.
- [ ] **T4A signature present in lower-right** (for cover, not the OG hero element). The signature must look hand-drawn, continuous with the rest of the line, and not pasted in as a separate element. If absent, ambiguous, or printed as a typed-out wordmark, reject.
- [ ] **Emotional register matches.** Contemplative, composed, editorial. Reject if figures are slumped, screaming, weeping, or stylised in any cartoonish way.
- [ ] **3R discipline.** No religious symbols, no royal regalia, no community-identifying features (turban, kippah, songkok, etc.). Suit-and-tie or abstract figures only. Reject if any are present.
- [ ] **Aspect ratio 1.91:1.** If the model output is square, crop centre to 1200×630 (lose top and bottom equally) or re-prompt with `--ar 1.91:1` explicitly. If you must crop, ensure the subject and T4A signature both survive.
- [ ] **Final PNG dimensions: exactly 1200 × 630.** Use the fastest available resizer (ImageMagick, sharp, GIMP, even Preview.app's crop tool). The renderer expects exactly these dimensions.

---

## 6. Common failure modes and how to re-prompt

| Failure | Why it happens | Re-prompt strategy |
|---|---|---|
| Line is broken into multiple strokes | Model interpreted "one continuous line" as artistic style label only | Add: "the pen does NOT lift from the canvas at any point. Trace from start to finish as one unbroken gesture." |
| Stroke weight varies dramatically | Model added emphasis where it shouldn't | Add: "weight is perfectly uniform throughout. No tapering, no thickening, no calligraphic variation." |
| Background is grey or black, not navy | Model defaults to neutral background | Specify hex code more aggressively: "the background is the exact hex colour #0f0f23, NOT black, NOT grey. A specific dark navy with a hint of blue-purple." |
| T4A signature shown as printed text, not handwritten | Model rendered it as a typed wordmark | Specify: "the signature must be cursive, hand-drawn, flowing — like a writer's signature on a letter. Not printed type. Not a logo. A handwritten 'T4A' continuous with the rest of the line." |
| Composition crowded, no negative space | Model maximises detail by default | Specify: "the right 30 to 40 per cent of the frame is empty navy — generous negative space. Do not add any decorative elements there." |
| Figures look identifiable as specific politicians | Model overfits to "Malaysian politicians in suits" | Specify: "the figures are abstract suited silhouettes, generic, no facial features beyond the line's natural outline. Not portraits of any real person." |
| Image-text rendering broken on T4A signature | Some models struggle with text inside illustrations | Move to Ideogram or DALL-E 3 (both stronger at embedded text), OR generate without signature and composite the signature separately in SVG. |
| Result feels generic / stock-illustration | Style cues were too loose | Anchor to specific references: "in the style of Pablo Picasso's 1949 'Dove of Peace' single-line drawings. Confident, editorial, minimalist." |
| Burgundy light beam in Concept B comes out wrong colour | Models drift on exact hex | "The light beam is burgundy #9B2C2C — a deep wine red, NOT bright red, NOT pink, NOT orange. Restrained, editorial." |

---

## 7. After you have the image

```bash
# 1. Save the model output as 1200×630 PNG to:
#    public/dossiers/D001/fig-cover.png
#    (overwrite the SVG-rendered placeholder)

# 2. Verify dimensions
file public/dossiers/D001/fig-cover.png
# Expected: PNG image data, 1200 x 630, 8-bit/color RGB(A), non-interlaced

# 3. Re-run the validator
node scripts/validate-dossiers.mjs
# Expected: zero errors

# 4. Optional — if you also replaced the OG door element:
node scripts/render-dossier-images.mjs
# This re-rasterises the OG SVG with the new door

# 5. Start the dev server and walk the reader
npm run dev
# Visit http://localhost:4321/dossier/D001
# Verify: cover renders crisply at retina, no broken layout

# 6. Build production
npm run build
# Expected: clean build

# 7. Commit
git add public/dossiers/D001/fig-cover.png
git commit -m "Replace D001 cover with Picasso continuous-line illustration"
git push
```

---

## 8. If you want to iterate further

If you produce a cover you love, save the model + prompt + settings you used to `engine/output/dossier-D001-image-gen-log.md` so the same recipe can be replayed for D002, D003, etc. The Malaysia Political Mechanics series benefits from visual continuity — six dossiers, all using the same image model + similar prompt structure + recognisably the same hand.

This is how T4A's image identity stays coherent across the series without requiring an in-house illustrator.

---

## 9. One-line summary if you're brand new to this

Open Midjourney. Paste the **CONCEPT A → Midjourney v6 / v6.1** prompt from §3 above. Generate. If the result clears the §5 checklist, save it as `public/dossiers/D001/fig-cover.png`. If not, try the failure-mode notes in §6 and re-prompt. That's the whole workflow.
