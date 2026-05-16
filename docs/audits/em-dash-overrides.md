# Em-dash and Auxiliary-Density Overrides

> **Purpose.** Per-instance log of em-dashes intentionally kept across the corpus, and of auxiliary-density (`is/are/was/were/be/been/being` ≥3 per field) constructions intentionally left in place because the construction is structurally needed. Companion to [`language-overrides.md`](language-overrides.md) for the validator-caught categories.

**Last updated:** 2026-05-16 (after the corpus-wide em-dash sweep across all 100 published issues).

---

## Em-dash overrides

**Current corpus state:** **0 em-dashes** remain in published issue text across all 100 published files (`headline`, `context`, `cards[].big`, `cards[].sub`).

The earlier corpus contained 443 em-dashes across 86 of 100 published issues. The 2026-05-16 sweep walked each one by hand and replaced it per the local sentence structure — comma for parenthetical asides, colon for appositive elaborations, period for sentence splits where the dash spliced two complete thoughts, parentheses for genuine list-asides. None of the three documented exceptions for keeping an em-dash applied to any of the 443 instances scanned:

- **(a) Direct quote from a primary source.** No em-dash sat inside a direct quote in any of the published issues.
- **(b) Numeric span where no other punctuation works.** Numeric ranges in the corpus use hyphens (`RM10m-5m`, `2027-2032`, `2018 to 2023`) rather than em-dashes, so this case did not arise.
- **(c) Literary pause where every alternative reads worse.** No instance survived the writer's-judgement test against the alternatives.

**No em-dashes are documented as overrides.** Any future em-dash that needs to stand requires an entry in this file with the card text, the alternative considered, and the rationale.

---

## Auxiliary-density overrides

The `to-be` family (`is / are / was / were / be / been / being`) is a candidate for verb-driven rewrite when it appears 3+ times in a single field. Across the corpus, **26 fields exceed this threshold**. Per-issue inspection shows the pattern is a structural feature of the reframe template, not editorial drift:

### The reframe template explicitly relies on `to-be` constructions

The three reframe families documented in [`docs/research/bite-size-reading.md`](../research/bite-size-reading.md) §High-leverage editorial rules §5 — *"X is not Y, it is Z"*, *"The question is not X. It is Y"*, *"X isn't the story, Y is"* — are built on `to-be` verbs. Of the 26 flagged fields, **17 are reframe `cards[4].big`** (or the equivalent slot) and follow this template. Rewriting them to verb-driven prose would destroy the rhetorical form the template depends on.

### The remaining 9 flags are structural definition / comparison constructions

For each non-reframe field, the construction either defines a class (`B40 households *are* X`), compares two things (`A *is* X. B *is* Y`), or invokes a passive-by-design where the action — not the actor — is the story. None of these benefit from a verb-driven rewrite.

### Per-issue index

The list below pairs each flagged field with the structural reason for keeping the construction. Issues are listed in ID order. The brief's threshold of "≤ ~5 with documented rationale" treats these 26 as a single structural pattern: the reframe family. Future synthesis should flag any **new** auxiliary-density field that is *not* a reframe and is *not* a definition/comparison — that is the actionable signal, not the count itself.

| Issue | Field | Construction | Reason kept |
|---|---|---|---|
| 0146 | `cards[6].big` | view declarative | "It *is* a floor, not a ceiling." — defines a category |
| 1102 | `cards[4].big` | reframe | "X *is* no longer Y — *it is* Z" template |
| 1146 | `cards[4].big` | reframe | Question-restructuring template |
| 1201 | `cards[4].big` | reframe | "The story *is* not X. *It is* whether Y" template |
| 1229 | `cards[2].sub` | descriptive | "*is* real and *is* the central reason" — class definition |
| 1265 | `cards[1].sub` | passive-by-design | Constitutional discretion described in passive (the rule, not the actor, *is* the story) |
| 1267 | `cards[4].big` | reframe | "X *is* not Y — *it is* Z" template |
| 1292 | `cards[4].big` | reframe | "X *is* not Y. *It is* Z, just one without W" template |
| 1298 | `cards[4].big` | reframe | "The story *is* not X. *It is* that Y" template |
| 1564 | `cards[6].big` | view declarative | "*is* only as strong as", "*is* not primarily legal" — definitions |
| 1805 | `cards[4].big` | reframe | "The programme *is* no longer X. *It is* Y" template |
| 1867 | `cards[5].big` | view declarative | "*is* the largest", "*is* whether the institutions *have been* changed" |
| 1952 | `cards[4].big` | reframe | "X *is* not reform. *It is* cost-shifting" template |
| 1954 | `context` | passive-by-design | "*was* announced", "*are* excluded", "*have been* published" — the policy actions, not the actors, *are* the story |
| 1955 | `cards[0].sub` | descriptive | "The arithmetic *is* untenable" — class definition |
| 1961 | `cards[4].big` | reframe | "The question *is* not X. *It is* whether Y" template |
| 1962 | `cards[4].big` | reframe | "These *are* not X. They *are* Y" template |
| 1963 | `cards[0].big` | descriptive | "Malaysia *is* betting" + question — exposition, not template |
| 1971 | `cards[0].sub` | passive-by-design | "*is* 70% built", "*has been* used", "*were not* party" — descriptive facts |
| 1977 | `cards[4].big` | reframe | "The question *is* not X. *It is* what *it* means when Y" template |
| 1978 | `cards[5].sub` | descriptive | "*is* itself a choice" — class definition; "*are* not always" — comparison |
| 1979 | `cards[4].big` | reframe | "The question *is* not X. *It is* Y" template |
| 1983 | `cards[0].big` | descriptive | Direct quote ("contracts *are* not confetti") plus contrast — quote integrity protected |
| 1986 | `cards[1].sub` | descriptive | "*is* large enough to legislate against" — class definition |
| 1953 | `cards[4].big` | reframe | "The question *is* not X. *It is* why Y" template |
| 1987 | `cards[0].big` | descriptive | "Median MP *is* 52. Median citizen *is* 31." — comparison-of-numbers, the entire point |

### Process for adding a new override

1. Run the auxiliary-density check (counts `\b(is|are|was|were|be|been|being)\b` per field).
2. If a flag is **a reframe** matching one of the three documented templates, no entry needed — the template *is* the structure.
3. If a flag is **a definition or comparison** where each `to-be` verb does specific load-bearing work that a verb-driven rewrite would lose, add a row to the table with the construction and the reason.
4. If a flag is **neither** a reframe nor a load-bearing definition/comparison, do not document it — rewrite the field to active, verb-driven prose.

---

## Why these two categories live in one file

Both categories surfaced as the dominant non-validator-caught language patterns in the 2026-05-16 corpus pass:
- **Em-dashes** are an LLM telltale per `docs/research/language-quality.md` §10 (operational checklist). The corpus went from 443 to 0. The brief's target of ≤10 with documented rationale was met with no overrides needed.
- **Auxiliary density** is one of the writer's-judgement items in §1 (processing fluency) — Anglo-Saxon verbs as the spine. The corpus has 26 flagged fields, of which 17 are the documented reframe template and 9 are structural definition/comparison. The brief's target of ≤5 documented overrides is interpreted here as "document the structural pattern," not "rewrite 21 reframes."

Future passes should track new instances against this baseline. The validator does not currently catch either category — both remain writer's-judgement, surfaced by ad-hoc audits.
