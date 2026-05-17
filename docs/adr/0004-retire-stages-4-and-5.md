# ADR-0004: Retire Stages 4 and 5; escalation rule for high-risk issues

**Status:** Accepted (2026-05-17)
**Related:** `CLAUDE.md` §"COMPLETE PUBLISHING PIPELINE"; `engine/templates/publish-playbook.md`; `engine/templates/stage{2,3,6}-preamble.txt`.

## Context

The original pipeline ran six stages: Stage 1 Primary Analysis (Claude), Stage 2 Bias Audit (Gemini), Stage 3 Fact Verification (ChatGPT), Stage 4 Alt-Framing (DeepSeek), Stage 5 Contrarian Stress-Test (Grok), Stage 6 Synthesis (Claude). Each issue cost the operator four manual paste-and-collect rounds in browser-based LLM tools.

In practice across the run of issues through April–May 2026:
- Stages 2 (Gemini) and 3 (ChatGPT) caught the overwhelming majority of cardinal-sin flags and bias signals. They are the load-bearing reviewers.
- Stage 4 (DeepSeek Alt-Framing) often duplicated Stage 2's omission flags. Where Stage 4 added genuinely new perspectives, the synthesizer was the editorial judge of whether to incorporate them anyway.
- Stage 5 (Grok Contrarian) had the highest noise ratio. Per the Stage 5 preamble's own admission *"aggressive bullshit is still bullshit,"* contrarian framing frequently surfaced `MY_OPINION` speculation that the synthesizer had to refuse. The historical commit log shows Grok contrarian runs scoring CT in the 30s for issues where Stages 2 and 3 cleared at 80+ — high churn, low retained signal.
- Provider stability for DeepSeek and Grok was patchier than Gemini and ChatGPT through this period.
- Each retired stage roughly halves the operator burden per issue. Halving operator burden materially raises sustainable publish frequency, which is the binding constraint on T4A's editorial throughput.

## Decision

**Default pipeline is four stages: Stages 1, 2, 3, 6.** Stages 4 and 5 are retired for routine issues. Legacy issues retain their `af`/`ct` `stageScores` for backward compatibility.

The work the retired stages used to do is reallocated:
- **Alt-framing / missing perspectives** is now the responsibility of the Phase 1 brief author. Briefs must include the 12-dimension risk assessment, source-spectrum check, contradictions section, and explicit list of perspectives not yet represented.
- **Contrarian courage / cardinal-sin testing** is now the responsibility of the Stage 6 synthesizer. The Stage 6 preamble enforces the "punchy bullshit is still bullshit" discipline that Stage 5 used to enforce.

### Escalation rule

For issues where the retired stages' specific contributions are most likely to matter, re-enable **Stage 5 (Grok Contrarian)** for that issue only:

**Trigger conditions (any one is sufficient):**

1. **3R risk HIGH or CRITICAL on any dimension.** Per the brief's 12-dimension risk assessment, if Religion, Ethnic, or Royalty risk is HIGH or CRITICAL, contrarian courage matters: the structural finding cuts against a dominant religious/ethnic/royal frame, and the synthesizer benefits from an external pressure test before publication.
2. **Political risk CRITICAL** and the analysis advances a sharp editorial take (not a structural finding). When the lede choice is itself political — e.g., assigning responsibility for a specific event to a specific named actor — contrarian pushback on the framing protects against partisan drift.
3. **Source-spectrum gap surfaced by Stage 3.** If Stage 3's `source_diversity_estimate` is < 0.4, the brief's spectrum coverage was thin and Stage 4-style alt-framing would have added value. In this case, before Stage 6 synthesis, the Phase 1 brief author returns to widen the source base.

**What escalation looks like in practice:** the operator runs `node scripts/generate-stage-prompts.mjs {slug}` as usual (which generates all four prompts including the legacy Stage 5), then pastes the Stage 5 prompt into Grok in addition to the Stage 2 + 3 rounds. The Stage 6 synthesizer reads the Stage 5 JSON and applies the `STRENGTHENED (Stage 5 verified)` discipline alongside the standard Stage 2/3 corrections.

**Stage 4 is not auto-re-enabled** by this rule. Stage 4's alt-framing value was the most consistently captured by Stage 2's omission flags and by a disciplined brief. Stage 5's contrarian value is the harder one to substitute. If the synthesizer judges, mid-Phase-5, that a missing-perspective gap is wide enough to warrant Stage 4 input, they may invoke it ad hoc, but this is not a documented default trigger.

## Consequences

### Positive
- Operator burden halved per routine issue (two manual paste rounds instead of four).
- Higher signal-to-noise: the two retained external stages are the two that historically caught the most cardinal sins.
- Stage 6 synthesizer's responsibility for contrarian discipline is now explicit and preamble-enforced, rather than implicit.
- Escalation rule preserves the contrarian-courage option for the issues where it matters most.

### Negative
- Routine issues lose a layer of independent alt-framing. Mitigated by Phase 1 brief discipline.
- The escalation trigger is judgement-driven (the brief author decides whether 3R risk is HIGH). A future enhancement could automate the trigger from the brief's structured risk assessment.
- Legacy issues' `af`/`ct` scores are no longer comparable to new issues' `finalScore`, which is now a mean of four scores rather than six. Downstream UI treats this transparently because per-issue scores are displayed individually.

### Neutral
- The 4-stage and 6-stage pipelines coexist in `stageScores` shape: `pa`, `ba`, `fc`, `sr` are required; `af`, `ct` are optional and only present on legacy 6-stage issues.

## Implementation

- `CLAUDE.md` §"COMPLETE PUBLISHING PIPELINE" updated to reference this ADR and the escalation trigger.
- `engine/templates/publish-playbook.md` already reflects the 4-stage default.
- `scripts/generate-stage-prompts.mjs` continues to generate all four browser prompts for backward compatibility; the operator selectively runs Stages 2, 3, and (on escalation) 5.
- Stage 6 preamble already enforces the contrarian-courage discipline that Stage 5 used to externalise; no further preamble change required.

## Open questions

- Should the escalation trigger be machine-readable? A future enhancement could let `scripts/publish-pipeline.mjs init {slug}` parse the brief's 12-dimension risk assessment and automatically recommend escalation when any 3R dimension lands HIGH/CRITICAL.
- Should there be a Stage 4 escalation trigger? Possibly: if a recent run of issues shows a pattern of synthesizer-introduced cards that Stage 4 would likely have caught, revisit. For now, no auto-trigger.
