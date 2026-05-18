# D001 Cross-LLM Review Runbook

**Dossier:** D001 — How New Parties Are Built in Malaysia
**Pipeline:** 4-stage cross-LLM review (Stages 2, 3, 4, 5). Stage 6 synthesis happens after all four return.
**Important:** For dossiers, Stages 4 and 5 are **re-enabled** (they are retired for regular issues). The reason is in `docs/research/t4a-dossier-design.md` §10 — dossier length raises overclaim risk, so the contrarian and alt-framing checks earn their cycle back.

---

## Execution order

Run the four prompts in any order — they are independent — but **complete all four before moving to Stage 6 synthesis**.

| Stage | Tool | Prompt file | Save response to |
|---|---|---|---|
| 2 | **Gemini** (Advanced / 2.5 Pro with web search on) | `dossier-D001-stage2-gemini-browser.txt` | `engine/output/dossier-D001-stage2.json` |
| 3 | **ChatGPT** (GPT-4o or later with browse on) | `dossier-D001-stage3-chatgpt-browser.txt` | `engine/output/dossier-D001-stage3.json` |
| 4 | **DeepSeek** (V3 with web search on) | `dossier-D001-stage4-deepseek-browser.txt` | `engine/output/dossier-D001-stage4.json` |
| 5 | **Grok** (with web search on) | `dossier-D001-stage5-grok-browser.txt` | `engine/output/dossier-D001-stage5.json` |

---

## What to do before pasting each prompt

1. **Open a fresh chat** in the target LLM. Do not reuse a chat that has prior context — it pollutes the audit.
2. **Enable web search / browse** in the LLM's interface. This is non-negotiable. The preambles explicitly require primary-source verification via search.
3. **Set the LLM to its most-capable thinking mode** if one exists (Gemini 2.5 Pro "Thinking", GPT "o1-mode", DeepSeek "DeepThink", Grok "Think"). Speed is not a virtue here — accuracy is.
4. **Copy the entire prompt file** including the dossier content at the bottom. Do not truncate.
5. **Paste and submit.** Wait for the full response.

## What to do with each response

1. **Verify the response is valid JSON.** It must start with `{` and end with `}` with no markdown fences. If the LLM wrapped it in ```json … ``` strip the fences. If the LLM added a preface ("Here is the audit:") strip that too.
2. **Save** the cleaned JSON to the path in the table above.
3. **If the LLM refused or returned partial output**, re-prompt with: "Continue from where you stopped. Return ONLY the remaining JSON. Do not repeat the preamble." Merge the two outputs.
4. **Do not edit the JSON contents.** The synthesis stage needs the raw reviewer output.

## What "good" looks like per stage

- **Stage 2 (Gemini bias audit):** `bias_score` under 25, partisan/racial/religious flag arrays mostly empty, no flagged cardinal sins. If `bias_score > 40`, do not proceed to publication — return to draft and rewrite.
- **Stage 3 (ChatGPT fact verification):** `factual_accuracy_score` over 85, `source_diversity_estimate` over 0.6, every numeric claim with `status: VERIFIED` and primary source URL. Any `INCORRECT` claim must be corrected before publication.
- **Stage 4 (DeepSeek alt-framing):** `completeness_score` over 75, two or fewer high-importance missing facts. Anything with `importance > 0.7` must be integrated in synthesis.
- **Stage 5 (Grok contrarian):** `courage_score` over 75. If `confidence_inflation_estimate > +0.3` (overclaim), tone down the synthesis. If `< -0.3` (under-claim), sharpen.

## After all four return

1. Run Stage 6 synthesis with `engine/templates/stage6-preamble.txt` as the editor preamble, and the four stage outputs as inputs.
2. Tag every wording change in synthesis as `CORRECTED (Stage 3)`, `REPHRASED (Stage 2)`, `ADDED (Stage 4)`, `SHARPENED (Stage 5)`, or `INTRODUCED (Stage 6 self-verified)`.
3. Update `src/data/dossiers/D001.json` with the final synthesised content.
4. Run the legal + accuracy check from `CLAUDE.md` Phase 6.
5. Set `published: true` only after all checks pass.

## Specific dossier deltas from the regular pipeline

Each Stage 2–5 prompt has been adapted in two ways for the dossier format:

- **Review at section level, not card level.** Where the regular preamble says "card 2", the dossier prompts say "section_id: pivotal-player" etc.
- **Reviewers must also audit Figure specifications.** Charts and figures can themselves commit cardinal sins (misleading scale, missing denominator, selective time window). The prompts include the figure spec for review.
- **The research brief is included** so the reviewer has the citation context for every claim being audited.

If any reviewer fails to follow the section-id convention and reverts to card numbering, the synthesis stage will map it back — but ideally the LLM follows the new schema.
