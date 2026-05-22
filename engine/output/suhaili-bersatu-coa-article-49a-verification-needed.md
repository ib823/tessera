# Verification Required — Issue 2000

**Status:** Phase 1 gate held pending external lookup. DO NOT proceed to Stage 1 until items below are resolved.
**Brief:** `engine/briefs/suhaili-bersatu-coa-article-49a.md`
**Reason for hold:** Brief's structural argument depends on facts the radar entry surfaced but the brief author could not directly verify. The radar's silence-ratio (99%) signals these will need direct registry/court access, not press aggregation.

---

## The brief's structural argument (what needs to be true for the issue to hold)

The brief claims: **Article 49A(2)(c)'s expulsion carve-out is being functionally narrowed by judicial practice. The CoA's 29 April 2026 ruling upheld a party-internal route around the carve-out, with the consequence that an MP loses their seat through a mechanism Parliament tried to prevent.**

If this claim is true, it is a precedent-setting story. If the CoA ruling was instead on narrow procedural grounds (failure to plead, time-bar, jurisdiction), the structural framing collapses and the issue should be **either reframed or held**.

---

## What to verify, ranked by how decisive each item is

### TIER 1 — verification blocks the entire issue

**V1. Court of Appeal 29 April 2026 ruling — actual judgment text.**

- *What:* The full grounds-of-judgment for the three-member CoA panel that unanimously dismissed Suhaili Abdul Rahman's appeal.
- *Where to look:* 
  - Putrajaya Court of Appeal registry (in-person or e-Filing portal if accessible).
  - eJudiciary system (`ejudgment.kehakiman.gov.my`) — search "Suhaili Abdul Rahman" + "Bersatu" or by appeal number.
  - The Edge Markets / Malaysiakini / FMT coverage may contain quoted ratio paragraphs.
- *What to extract:*
  - Did the CoA engage the 49A(2)(c) carve-out **on its merits**, or sidestep on procedure?
  - Operative ratio: what specific mechanism produced the loss of MP status? (deemed resignation under 49A(1)(a)? Article 51? Election Commission ruling? Bersatu constitution's deemed-vacancy clause?)
  - Names of the three judges and their reasoning.
- *Decision criteria:* If the ratio is on procedural grounds only (e.g., the suit was struck out for jurisdictional reasons), HOLD the issue or reframe to a narrower scope. If the ratio engages the carve-out on merits, PROCEED.

**V2. Original High Court ruling — same case.**

- *What:* The first-instance judgment Suhaili appealed from.
- *Where:* eJudiciary or High Court KL registry.
- *Why decisive:* The CoA presumably affirmed the High Court's reasoning. The High Court ruling is the more detailed text and will state the original mechanism the courts treat as causing seat loss.

### TIER 2 — verification refines the brief but doesn't block

**V3. Bersatu Party Constitution — current edition.**

- *What:* The specific membership-termination clauses and any deemed-vacancy provisions for MPs.
- *Where:* Registrar of Societies (ROS), Bersatu's own publications.
- *Why useful:* If Bersatu's constitution has a clause that explicitly treats membership cessation as a deemed-resignation triggering Article 49A(1)(a), that is the bridge that gets around the (2)(c) carve-out. If no such clause exists, the courts must be reading the carve-out narrowly themselves.

**V4. Election Commission status of Labuan seat.**

- *What:* Did the EC declare a vacancy? Has a by-election been scheduled, deferred, or omitted?
- *Where:* SPR (`spr.gov.my`) announcements; Speaker's letters to the EC under Article 54.
- *Why useful:* Confirms the practical consequence (seat actually lost vs theoretical loss). Also tests whether Article 54(1)'s 2-year carve-out window (opened 19 Dec 2025) applies — if it does, no by-election fires anyway, which dilutes the "MP lost seat" framing.

**V5. Dates of the underlying party-cessation event.**

- *What:* When did Bersatu's Supreme Council terminate Suhaili's membership? Why?
- *Where:* Bersatu Supreme Council minutes (likely not public); press coverage from the relevant period.

### TIER 3 — useful background, optional

**V6. Hansard transcript — Article 49A second-reading debate (October 2022).**

- *What:* Parliament's stated legislative intent for the 49A(2)(c) carve-out.
- *Where:* `parlimen.gov.my` Hansard archive for October 2022 sittings.
- *Why useful:* If the brief argues "Parliament drafted 49A(2)(c) to prevent X, and the courts are routing around it," that argument is strengthened by direct citation of the second-reading debate where the intent was articulated.

**V7. Comparative jurisprudence on anti-defection law.**

- *What:* India's Tenth Schedule (anti-defection) and South Africa's floor-crossing repeal — both have judicial doctrine on party-vs-MP authority.
- *Where:* Academic legal databases, IDEAS / IDEAS Malaysia comparative papers.
- *Why useful:* Provides a benchmark for what the doctrinal options look like in comparable jurisdictions. T4A standard practice references comparators (Singapore, Australia, Zimbabwe were used in issue 1991 on Harmony Bill).

---

## Decision tree after verification

```
V1 + V2 resolved
├── CoA engaged 49A(2)(c) on merits, ruled against Suhaili
│   └── PROCEED to Stage 1. Brief's structural argument holds.
├── CoA sidestepped on procedural grounds (jurisdiction, time-bar, etc.)
│   ├── Reframe issue to "the procedural barrier" angle (narrower but still publishable)
│   └── Or HOLD until a future case engages the carve-out on merits.
└── CoA ruled in Suhaili's favour (and our radar entry is wrong)
    └── HOLD issue, reframe entirely or drop.
```

---

## What I can do without external lookup

Nothing more on the substantive verification. The radar entry and the Rafizi-Nik Nazmi brief (T4A issue 1993) are the cleanest internal anchors; both are already cited in the brief.

If external lookup confirms the brief's framing, the engine context block is ready and the brief structure is complete. Phase 2 (Stage 1 Primary Analysis) becomes mechanical once V1+V2 are resolved.

---

## When verification returns

To resume:

1. Paste relevant text from V1 (CoA ruling), V2 (High Court ruling) into this directory as supporting files, e.g., `engine/output/suhaili-bersatu-coa-article-49a-source-V1-coa-judgment.md`.
2. Update `engine/briefs/suhaili-bersatu-coa-article-49a.md`: replace [LOW] markers with verified facts; cite specific paragraphs.
3. Re-run brief through `node scripts/sim-brief-context.mjs` if any party-positions need updating (unlikely for this issue, but possible if Bersatu's stance shifts).
4. If decision-tree says PROCEED: signal approval, brief author resumes Phase 2.
5. If decision-tree says REFRAME / HOLD: write a short note explaining the change and re-open the brief.
