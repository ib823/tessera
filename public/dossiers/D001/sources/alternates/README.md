# D001 Cover Alternates Archive

This folder preserves the five image-generation candidates produced during the D001 cover selection process, plus the unmodified source of the chosen cover. Useful for:

- Re-deriving the cover at a different aspect ratio without re-generating.
- Swapping to an alternate concept if editorial direction changes.
- Reference material for D002 onward when prompting the same image model — visual continuity across the Malaysia Political Mechanics series.

## Files

| File | Concept | Status | Notes |
|---|---|---|---|
| `concept-a-four-figures-FINAL-source.jpg` | A — Four figures + window + crowd | **USED** — chosen cover | Unmodified 1168×784 source. The published cover at `../../fig-cover.png` is this image centre-cropped and resized to 1200×630. |
| `concept-b-door-with-signature.jpg` | B — Slightly-ajar door, burgundy light beam, T4A signature | Strong alternate | Matches the OG image visually. Use if the editorial direction shifts to a more abstract / symbolic cover. |
| `concept-c-empty-chair.jpg` | C — Three figures + empty chair | Strong alternate | The "defection / vacated seat" idea. Good if D002 focuses on the Sheraton Move and you want a thematic visual link. |
| `concept-d-hand-with-cards.jpg` | D — Hand revealing a fan of cards, "30" on middle card | Most pure single-line | Most genuinely Picasso-style line continuity. Could anchor a future dossier on coalition arithmetic (D003 — Patronage Substrate). |
| `concept-b-door-no-signature-REJECTED.jpg` | B variant — door without T4A signature | **REJECTED** | Failed acceptance criterion 5 (no signature). Kept for editorial record only. |

## How these were produced

Generated via Grok (xAI) using the prompts in `engine/output/dossier-D001-image-gen-prompts.md`. All five returned at 1168×784 pixels (1.49:1 aspect). The chosen cover was centre-cropped vertically (171px removed, split top/bottom) to reach the dossier target aspect of 1.91:1, then resized to 1200×630.

## Recipe for series continuity

If you generate D002's cover from the same model, use the **same prompt structure** with only the subject swapped. Visual continuity across the six-dossier series is part of the brand. See `engine/output/dossier-D001-image-gen-prompts.md` §8 for the recipe-log template.

## File on main branch — clean-up note

The five original UUID-named JPGs were uploaded by the editor to `public/og/backgrounds/` on `main` (commit `075aec6`). That folder is for the issues OG pipeline, which expects `issue-XXXX-bg.png` naming and does not pick up these files. They are orphaned there.

The editor can clean them up via a small commit on `main`:

```bash
git checkout main
git pull origin main
git rm public/og/backgrounds/1cab10a1-5324-42bc-8759-84006e4533b6.jpg
git rm public/og/backgrounds/219f0318-4fae-4a4c-b3ce-66f000637e4c.jpg
git rm public/og/backgrounds/4d3d980f-6ce9-47e0-bb39-ac1b8f93ec9e.jpg
git rm public/og/backgrounds/81aa1b97-26c2-4df6-a504-0e774147bbb3.jpg
git rm public/og/backgrounds/97b73798-920f-4a37-9045-9f0943819c28.jpg
git commit -m "Clean up orphaned UUID JPGs — archived under public/dossiers/D001/sources/alternates/"
git push
```

The archived copies are preserved in this folder; nothing is lost.
