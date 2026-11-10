# Image prompt: issue 2019 (rohingya-world-court-malaysia-law)

Chosen by the editor on 2026-11-11: podium microphone on a turnstile ("speaks up for them abroad, gate at home").

Concept notes:
- Hybrid metaphor (one impossible object, not two objects side by side): the microphone stand is the turnstile's centre post.
- Tripod turnstile (three arms from one hub, as at older rail gates) so the single line reads as a turnstile.
- Mic head angled toward the empty right side (abroad); one arm level across the passage (the gate at home).
- No people, no boats, no crowds, no community markers (3R; refugee-imagery clichés avoided).

```
=== ISSUE 2019: Malaysia backs the Rohingya genocide case. Its Immigration Act has no word for refugee. ===

Create a minimalist Pablo Picasso single continuous line drawing on a deep dark navy background exactly #0f0f23. Use one single unbroken bold white line (#FFFFFF) with perfectly consistent stroke weight throughout. The entire drawing must be created as one continuous gesture without the pen ever lifting from the canvas.

Draw a podium microphone on a tall stand, its rounded head tilted toward the right as if mid-speech; the stand runs straight down and becomes the central post of a waist-high tripod turnstile, like an old train-station gate: a small round hub at waist height with three straight rotating arms, one arm held level across the passage, the other two angled down behind it, and the post ending in a short base on the ground. Draw it from a slight three-quarter angle so all three arms read clearly, as one clean, elegant, and confident single continuous line. The line quality should be bold, smooth, and editorial.

At the bottom right corner, seamlessly continue the exact same continuous line into a natural hand-drawn cursive "T4A" signature as the ending tail of the stroke. The T4A signature must feel like an organic part of the single unbroken line, not added separately.

Style: elegant minimalist single-line illustration, contemplative, editorial. No fill, no shading, no extra lines, and no unnecessary details. Keep the composition clean with generous negative space, especially toward the right side of the frame.

Aspect ratio 1.91:1 wide landscape. Ensure the final result matches the clean, consistent quality of previous T4A single continuous line images.

Save as: public/og/backgrounds/issue-2019-bg.png
```

## Alternative under test: handshake that becomes a queue rope

Same template; replace only the "Draw …" paragraph. The editor is rendering both and will keep whichever passes the thumbnail test (about 240 px wide, both halves nameable in a second). Preferred if both pass, because it carries the reframe ("abroad, Malaysia backs the case; at home, a pass").

```
Draw two forearms in suit cuffs meeting in a firm diplomatic handshake on the left side of the frame, the clasp drawn as one simple rounded contour without separate fingers; without a break, the line falls from the clasped hands down to the top of a short stanchion post, swings across in a single low sagging rope to a second stanchion post further right, and drops to the ground, the kind of queue barrier used at an immigration counter, as one clean, elegant, and confident single continuous line. The line quality should be bold, smooth, and editorial.
```

## Notes for either render

If the first render muddles the turnstile: regenerate with "three straight arms spaced evenly around the hub like a peace-sign Y" added after "three straight rotating arms", or drop "slight three-quarter angle" for a side view with the hub drawn as a small circle.

If the render is not 1.91:1: `sharp(input).resize({width:1200, height:630, fit:'cover'}).png().toFile('public/og/backgrounds/issue-2019-bg.png')` (`npm install sharp --no-save`).
