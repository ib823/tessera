# Next steps — underreporting series (issues 2001, 2002 + Dossier D002)

This branch (`claude/malaysia-underreporting-analysis-PBO9F`) holds three review-ready DRAFTS plus the
source research. None is published. This file is the operator checklist to take them live, in order.

## Current state

| Artifact | File | Published | Validators |
|---|---|---|---|
| Research report | `docs/research/malaysia-underreported-data-forecasts.md` | n/a | n/a |
| Issue 2001 — diabetes/obesity | `src/data/issues/2001.json` | false | issues ✓, language 0 warns |
| Issue 2002 — rice target gap | `src/data/issues/2002.json` | false | issues ✓, language 0 warns |
| Dossier D002 — Uncapped Ledger | `src/data/dossiers/D002.json` | false | dossiers ✓, astro check ✓ |

Charts: `public/og/backgrounds/issue-2001-bg.png`, `issue-2002-bg.png`, `public/dossiers/D002/fig-*.png`.
Briefs: `engine/briefs/{diabetes-obesity-nhms-signal,rice-self-sufficiency-target-gap,the-uncapped-ledger}.md`.

## Why these are drafts (the gate)

Per the T4A Accuracy Standard, no issue ships until its specifics are verified against PRIMARY sources by an
independent stage. Two blockers remain on all three:
1. **External Stage 2 (Bias) + Stage 3 (Fact) have not been run.** Prompts are generated and waiting (below).
2. **The primary PDFs (DOSM, MOF, IKU) returned HTTP 403 to automated fetch.** Their figures are currently
   corroborated via named secondary outlets quoting them. Each must be opened manually and the table/page
   confirmed before publish. The per-issue briefs list exactly which numbers need this.

One claim was already DROPPED at the gate: the diabetes "the 2019 decline was a changed measurement
definition" framing could not be verified, so issue 2001 makes no such claim. Do not reintroduce it without
a primary source.

## STEP 1 — Run the cross-LLM review (per artifact)

Stages 4 and 5 are retired by default (see `docs/adr/0004-retire-stages-4-and-5.md`); only run 2 and 3.
Paste each file's contents into the named tool, then save the JSON reply.

**Issue 2001 (diabetes/obesity):**
- Stage 2 → Gemini: `engine/prompts-generated/diabetes-obesity-nhms-signal-stage2-browser.txt`
  → save reply to `engine/output/diabetes-obesity-nhms-signal-stage2.json`
- Stage 3 → ChatGPT: `engine/prompts-generated/diabetes-obesity-nhms-signal-stage3-browser.txt`
  → save reply to `engine/output/diabetes-obesity-nhms-signal-stage3.json`

**Issue 2002 (rice):**
- Stage 2 → Gemini: `engine/prompts-generated/rice-self-sufficiency-target-gap-stage2-browser.txt`
  → save to `engine/output/rice-self-sufficiency-target-gap-stage2.json`
- Stage 3 → ChatGPT: `engine/prompts-generated/rice-self-sufficiency-target-gap-stage3-browser.txt`
  → save to `engine/output/rice-self-sufficiency-target-gap-stage3.json`

**Dossier D002 (Uncapped Ledger):**
- Stage 2 → Gemini: `engine/prompts-generated/the-uncapped-ledger-stage2-browser.txt`
  → save to `engine/output/the-uncapped-ledger-stage2.json`
- Stage 3 → ChatGPT: `engine/prompts-generated/the-uncapped-ledger-stage3-browser.txt`
  → save to `engine/output/the-uncapped-ledger-stage3.json`

The Stage 3 prompts explicitly tell the reviewer to (a) confirm each actual against a primary source and
(b) NOT fact-check the labelled projections as facts, only sanity-check their method.

## STEP 2 — Bring me the Stage 2/3 JSON (Stage 6 synthesis)

Once the six reply files exist, I (or a future session) run Stage 6:
- Read `stage6-preamble.txt` first.
- Apply Stage 3 fact corrections; address Stage 2 bias flags; tag every change CORRECTED / REPHRASED /
  INTRODUCED with traceability.
- Patch the reader JSON / dossier JSON accordingly. If any cardinal-sin flag (overclaim / underclaim /
  misleading framing / unverified detail) cannot be resolved, soften or drop the card.
- Update `stageScores` (pa/ba/fc/sr) and `finalScore` from the real returned scores, and clear the DRAFT
  language from `stageScoresNote` / `finalScoreNote` on D002.

## STEP 3 — Manual primary-source confirmation

Open these and confirm the named figures (briefs list table/page targets):
- DOSM Supply & Utilisation Accounts 2020–2024 PDF → rice SSR 56.2%, year attached.
- DOSM External Trade → food import bill RM42.64B (2014), RM78.80B (2023).
- IKU NHMS 2023 fact sheet → overweight+obese series, undiagnosed shares.
- MOF Fiscal Outlook 2026 (belanjawan.mof.gov.my) → debt 63.5/64.7/84.1%, guarantees RM424.7B, deficit path.
- IMF Article IV 2026; Act 850 text → the 3% / 60% benchmarks and 2028 timing.

## STEP 4 — Publish (per artifact, only after 1–3 clear)

1. Set `"published": true`, set `sourceDate` to publish date.
2. Issues: `node scripts/validate-issues.mjs` (exit 0) + `node scripts/validate-language.mjs --issue NNNN`.
   Dossier: `node scripts/validate-dossiers.mjs` (exit 0).
3. `npm run build` locally to confirm OG images / dossier image variants generate and `astro build` passes.
4. Grep for stealth banned terms (must be zero) across the reader JSON.
5. Commit + push to `main` per the publishing pipeline (this work currently lives on the feature branch;
   merging to main is a separate, explicit decision — do not push to main without sign-off).

## Sequencing recommendation

Ship in this order, matching the agreed radar priority and effort:
1. **Issue 2001** (diabetes) — highest signal, lowest risk, one chart. Quick win.
2. **Issue 2002** (rice) — clean target-vs-actual story.
3. **Dossier D002** (fiscal) — the flagship; most exhibits, most primary-PDF confirmation, so it benefits
   from going last once the lighter two have exercised the review loop.

## Optional — more issues from the research (not yet built)

The research report's §E shortlist still has unbuilt stories, ranked: support-ratio (B.4), non-revenue
water / Perlis 64% (B.5), "free healthcare costs a third out-of-pocket" (B.8), below-replacement-since-2013
(B.3). Each has its data and method already worked in `docs/research/malaysia-underreported-data-forecasts.md`.
