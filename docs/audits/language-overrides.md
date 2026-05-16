# Language Quality — Documented Overrides

> **Purpose.** Canonical list of `scripts/validate-language.mjs` warnings intentionally left as-is, with the rationale per warning. Anything not on this list is a real warning to action. Cross-reference: `docs/research/language-quality.md` §7-§8 for the rules behind each category.

**Last updated:** 2026-05-16 (after the 72→4 remediation sweep).
**Current warning count on corpus:** 4 (all enumerated below).

---

## Override 1 — Issue 1146 fact[2].sub: "was approved by JTK Sabah"

**Card text:** *"TNG eWallet was approved by JTK Sabah for migrant worker salaries — RM3.5B disbursed in 2025. B40 use wallets for government handouts but fall back to cash daily."*

**Validator says:** agentless passive — consider active voice naming the agent.

**Decision:** KEEP passive.

**Rationale:** The issue is about digital wallet adoption among migrant workers and the B40 population. The subject of every card is the wallet (TNG eWallet, the technology, its uptake). Active voice — *"JTK Sabah approved TNG eWallet…"* — switches the subject from the wallet to the labour department, burying the lead in a card whose job is to document wallet adoption mechanics. Passive preserves the topic continuity that the rest of the issue depends on.

**Cross-reference:** `docs/research/language-quality.md` §4 — *"Exceptions: when the actor is genuinely unknown, or when the action — not the actor — is the story."* The eWallet adoption is the story; the regulator is incidental.

---

## Override 2 — Issue 1206 fact[2].big: "were rejected by banks and legitimate lenders"

**Card text:** *"72% of Ah Long victims are B40 workers who were rejected by banks and legitimate lenders first"*

**Validator says:** agentless passive — consider active voice naming the agent.

**Decision:** KEEP passive.

**Rationale:** The passive sits inside a restrictive relative clause modifying "B40 workers". Rewriting to active — *"…B40 workers whom banks and legitimate lenders rejected first"* — produces a grammatically correct but stylistically clumsy clause that breaks the rhythm of the sentence. The relative-clause passive is idiomatic English for describing a class of people defined by an experience. The agent (banks, legitimate lenders) is already named within the by-clause, so no information is hidden.

**Cross-reference:** The active-voice rule in `docs/research/language-quality.md` §4 is about *clauses of accountability* — *"mistakes were made"* — not restrictive relative clauses that describe a class. This is the latter.

---

## Override 3 — Issue 1294 fact[2].big: "Article 12(4) of Federal Constitution addresses children's religious education"

**Card text:** *"Article 12(4) of Federal Constitution addresses children's religious education"*

**Validator says:** weak abstraction — *"addresses"* signals thinkpiece, not discovery.

**Decision:** KEEP.

**Rationale:** "Addresses" is the standard legal-text idiom for what a constitutional provision *does*. Replacements like *"Article 12(4) covers children's religious education"* or *"Article 12(4) governs children's religious education"* are acceptable but no clearer than "addresses" in this register. The Constitutional Court itself uses the phrasing *"the provision addresses X"* in published judgments. Changing it would replace an established legal idiom with a synonym that carries no additional precision.

**Cross-reference:** `docs/research/language-quality.md` §6 — the elevated-vocabulary table is for replacing *generic* abstractions, not domain idioms. Legal-text *"addresses"* is the latter.

---

## Override 4 — Issue 1871 hook.sub: "ESSCOM was created by executive directive"

**Card text:** *"The 2013 Lahad Datu incursion killed at least 68 people. ESSCOM was created by executive directive on 1 April 2013 and has never been codified into law"*

**Validator says:** agentless passive — consider active voice naming the agent.

**Decision:** KEEP passive.

**Rationale:** The actor here is institutional rather than personal — "the executive branch" or "the government" or "Cabinet". None of these names sharpens the card; all of them clutter it. The means of creation — *executive directive* — is the structural story (an agency operating since 2013 that has never been codified into law). The passive *"was created by executive directive"* foregrounds the means; active rewrites like *"Government created ESSCOM by executive directive"* dilute that focus.

**Cross-reference:** `docs/research/language-quality.md` §4 — same exception as Override 1: when the action/means is the story, not the actor.

---

## Suppressed false-positive classes (handled in the validator itself)

These are not overrides — they are validator-level fixes from the 2026-05-16 hardening passes:

1. **`addresses` as a noun** (e.g., *"1,200 Malaysian IP addresses"*). Validator now skips the warning when *addresses* is preceded within 2 words by a network-noun qualifier (`IP`, `email`, `e-mail`, `physical`, `home`, `street`, `office`, `postal`, `mailing`, `web`, `URL`, `server`, `MAC`).

2. **`considers` as a classification verb** (e.g., *"World Bank considers anything above 5.1 times income severely unaffordable"*). Validator now skips when *considers* is followed by a threshold idiom (`anything above/below/over/under`, `more/less than`, `values above/below`, `X as Y`).

3. **Hyphenated compounds inside proper nouns** (e.g., *"National Anti-Corruption Plan"*). Validator now skips when both halves are Title-Cased AND the following word is also Title-Cased — the signature of a proper-noun phrase.

4. **Temporal `by` after a passive** (e.g., *"the land was excised by 2006"*). Validator now skips when the word following *by* is a 4-digit year, *now*, *then*, *year-end*, *month-end*, or *the [end/start/beginning/deadline/time]*.

---

## Process for adding a new override

1. Run `node scripts/validate-language.mjs --issue NNNN` after editing.
2. If a warning persists and the writer believes it should stand, add an entry to this file with:
   - The card text
   - The validator category
   - The decision (KEEP)
   - The rationale (which exception in `docs/research/language-quality.md` applies, or new exception with justification)
3. If the warning class is a recurring false positive, harden the validator itself rather than adding many per-issue overrides. The validator already has 4 such suppressions (listed in the section above).
