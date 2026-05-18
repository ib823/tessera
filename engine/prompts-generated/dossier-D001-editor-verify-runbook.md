# D001 Editor Verification Runbook

**Purpose:** the four items left after Stage 6 synthesis that must clear before `published: true`.
**Total time estimate:** 20–40 minutes across two LLM tools.

---

## The four items, mapped to prompts

| # | Item | Prompt file | Target LLM | Output saved to |
|---|---|---|---|---|
| 1 | Resolve Act A1648 vs A1663 | `dossier-D001-editor-verify-batch.txt` (Item 1 inside) | Gemini AND ChatGPT (run twice, compare) | `engine/output/dossier-D001-editor-verify-batch.json` (×2 if cross-check) |
| 2 | Six remaining fig-2 voter counts | `dossier-D001-editor-verify-batch.txt` (Item 2 inside) | Gemini OR ChatGPT (one is enough) | same file |
| 3 | Sarawak SST revenue per year | `dossier-D001-editor-verify-batch.txt` (Item 3 inside) | Gemini OR ChatGPT | same file |
| 4 | Stage 3 re-run on synthesized text | `dossier-D001-stage3-rerun-chatgpt.txt` | ChatGPT (GPT-4o or later with browse) | `engine/output/dossier-D001-stage3-rerun.json` |

Items 1–3 are bundled into a single batch prompt because they're targeted single-fact lookups that one LLM can handle in one pass. Item 4 is the full Stage 3 re-verification with new scoring.

---

## Recommended execution order

### Step A — Run the editor verify batch in Gemini (≈8 min)

1. Open a fresh Gemini chat. Enable Google Search grounding.
2. Use Gemini 2.5 Pro Thinking mode.
3. Open `engine/prompts-generated/dossier-D001-editor-verify-batch.txt`.
4. Copy everything between the "PASTE STARTS HERE" and "PASTE ENDS HERE" dividers.
5. Paste into Gemini. Submit.
6. When the JSON returns, strip any markdown fences and save as `engine/output/dossier-D001-editor-verify-batch-gemini.json`.

### Step B — Run the same batch in ChatGPT (≈8 min)

Same prompt, different LLM. Save as `engine/output/dossier-D001-editor-verify-batch-chatgpt.json`.

Why both: because Gemini and ChatGPT disagreed last time on the Act number. If they agree this round, the answer is solid. If they disagree again, it confirms a real ambiguity that needs human verification of the Federal Gazette.

### Step C — Reconcile and update the dossier (≈5 min)

Compare the two batch outputs. For each item:

- **If Gemini and ChatGPT agree:** the value is solid. Update `src/data/dossiers/D001.json` and `engine/output/dossier-D001-figures.md` with the verified value, remove the [VERIFY] flag.
- **If they disagree:** open the gazette URL or EC PDF directly. Use the primary source. Note the disagreement in the synthesis log.
- **If both return UNVERIFIED:** leave the [VERIFY] flag in place and consider whether the dossier can publish with that specific data point softened (e.g. fig-3 caption could say "range RM2.7bn–RM4bn per year" without per-year numbers if individual years remain UNVERIFIED).

For the Article 49A number specifically: if both LLMs still disagree, the safe move is to use the Act NAME ("Constitution (Amendment) (No. 3) Act 2022") in body text and footnote the Act number as "[A1648 / A1663 — gazette disambiguation pending]". The Act NAME is uncontested.

### Step D — Run Stage 3 rerun in ChatGPT (≈10 min)

1. Open a fresh ChatGPT chat. Enable Browse with Bing.
2. Use GPT-4o or later with the longest-thinking mode available.
3. Open `engine/prompts-generated/dossier-D001-stage3-rerun-chatgpt.txt`.
4. Copy everything between dividers, paste, submit.
5. Save JSON output to `engine/output/dossier-D001-stage3-rerun.json`.
6. Check the new `factual_accuracy_score`. Target: above 85. If still below 85, the `corrections_still_inadequate` array will list what's blocking — fix those before publication.

### Step E — Update dossier and finalize (≈5 min)

After Steps A–D:

1. Update `src/data/dossiers/D001.json`:
   - `stageScores.fc` to the Stage 3 rerun score.
   - Recompute `finalScore` weighted average.
   - If `factual_accuracy_score` from Stage 3 rerun is above 85 and editor batch resolved all [VERIFY] items, change `published` to `true`.
   - Set `sourceDate` to today.
2. Update `engine/output/dossier-D001-figures.md` with the now-verified data.
3. Update `engine/output/dossier-D001-stage6-synthesis.md` with a "Step 7 — editor verification" section logging what changed.
4. Commit and push.

---

## What "ready to publish" looks like

All five must be true:

- [ ] Act number resolved (one of A1648, A1663, or other — with gazette URL on file).
- [ ] All ten fig-2 voter counts verified against EC PRU15 roll.
- [ ] All six fig-3 annual revenue figures verified against Sarawak state budget statements (or fig-3 reframed as a range chart if individual years can't be sourced).
- [ ] Stage 3 rerun returns `factual_accuracy_score` above 85 AND `publication_recommendation: READY_TO_PUBLISH`.
- [ ] Editor walks the LEGAL + ACCURACY CHECK in CLAUDE.md Phase 6 one more time on the final text.

If any are false, do not flip `published: true`. The dossier ships when the whole pipeline is green, not before.

---

## If a prompt fails or stalls

- **LLM truncates output:** reply "continue from where you stopped. Return ONLY the remaining JSON. Do not repeat the preamble." Merge outputs.
- **LLM refuses or returns commentary instead of JSON:** strip the commentary, paste back: "Return the answer ONLY as the JSON object specified. No preface, no explanation, no markdown fences."
- **LLM cannot access the EC PDF directly:** ask it to search news coverage of GE15 constituency results which typically reproduce the voter counts; cross-check at least two sources before accepting.
- **Sarawak SST figures unreachable:** the Sarawak State Budget speeches are PDFs published by the Premier's Department. If those URLs don't return, search for state budget summaries from The Borneo Post, Dayak Daily, or Sarawak Tribune — those outlets reproduce the figures with citation.

---

## After all four items clear

Hand the full package to Claude Design for the visual build:

- `src/data/dossiers/D001.json` — final dossier content
- `engine/output/dossier-D001-figures.md` — final figure specifications with verified data
- `docs/research/t4a-dossier-design.md` — visual identity and layout direction
- `engine/output/dossier-D001-stage6-synthesis.md` — change log so the designer knows what's been verified

Claude Design builds the SVG/PNG figures, the DossierReader.svelte component, and the burgundy edge-bar feed treatment. After visual build, run one final read-through and ship.
