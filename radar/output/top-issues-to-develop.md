# Radar — Top Issues to Develop

Scan: 2026-05-16 05:11 UTC. Queue size: 783. Latest published ID: 1987.

Curated from `radar/output/issue-queue.json`. Already-published items
(Norway-NSM 1983, e-invoice 1984/1985, Malay grievance 1986, gerontocracy
1987, Zahid insults 1980, Sabah 40% 1981, RedNote 1982, 1MDB recovery
1979) and items already in flight under `engine/briefs/` are excluded.

Picks are ordered by editorial leverage, not raw radar score — the queue
ranks by controversy-potential, but T4A picks should be high-leverage
*and* primary-source verifiable *and* not already saturated in mainstream
coverage.

---

## Tier A — develop next (this week)

### A1. Court of Appeal: emergency proclamations beyond judicial review
- **Radar:** #74, p72=0.59, [legal]
- **Date:** 4 May 2026 (Putrajaya)
- **Why develop:** Article 150 emergency powers were the central
  separation-of-powers fight of 2021. A Court of Appeal ruling that
  proclamations are now non-justiciable is a structural shift in the
  judicial-executive balance. Mainstream coverage will report it as a
  procedural loss for the petitioners; the T4A angle is the precedent it
  sets for the next emergency.
- **Verification path:** judgment text, Federal Constitution Art. 150,
  prior cases (Stephen Kalong Ningkan, Teh Cheng Poh).
- **Lenses:** Legal, Governance, Historical.
- **Risk flags:** none material — judicial ruling, public record.

### A2. Harmony and Reconciliation Bill — Singapore/Australia/Zimbabwe model
- **Radar:** #66, p72=1.00, [ethnic, political]
- **Date:** 7 April 2026 (Putrajaya)
- **Why develop:** The RHB is the structural successor to Sedition Act
  reform. Choice of comparator countries (Singapore's MRHA, Australia's
  18C, Zimbabwe's NPRC) signals the enforcement model government is
  leaning toward — mediation vs criminal sanction. This is *exactly* the
  policy-not-people frame the 3R rule asks for.
- **Verification path:** AGC drafting notes, Singapore MRHA text,
  Australia RDA s.18C, Zimbabwe NPRC Act, Hansard mentions.
- **Lenses:** Legal, Political, Historical.
- **Adjacency:** strong pair with 1980 (Zahid insults) — consider
  cross-linking via `related[]`.

### A3. Penang Islamic Dept halts Chinese temple's Hari Raya open house
- **Radar:** #85, p72=1.00, [ethnic, religious]
- **Date:** 8 April 2026 (George Town)
- **Why develop:** A jurisdictional question with a long shadow — does a
  state Islamic department have authority to order a non-Muslim place of
  worship to cancel an event branded as a religious celebration? The
  factual story is small; the precedent is large. Falls inside the
  highest-bar 3R verification standard, so source the JHEAIPP letter
  directly, not just news characterisations.
- **Verification path:** JHEAIPP order/statement, temple
  representative's response, Federal Constitution Art. 11/3, AGC
  guidance on inter-faith events.
- **Lenses:** Rights, Legal, Religious (carefully — critique the
  jurisdictional reach, not the faith).
- **Risk flags:** 3R-sensitive. Hold the issue if any specific cannot be
  traced to two independent primary sources.

### A4. MACC RM1.1B contract probe — Rafizi delivers 28 pages
- **Radar:** #43, p72=0.83, [economic, institutional, political]
- **Date:** 14 May 2026 (Putrajaya)
- **Why develop:** Live, named, dated, with a documentary trail. A sitting
  MP delivering specific evidence to MACC on a RM1.1B contract is the
  cleanest accountability story in the queue. The T4A frame: where does
  this sit in the broader pattern of contract-without-tender deals? Pair
  with the squash-court CEO arrest (A5) for the structural reframe.
- **Verification path:** MACC statement, Rafizi's filed letter, contract
  metadata via MOF e-Perolehan if accessible.
- **Lenses:** Governance, Economic, Political.

### A5. Federal agency CEO arrested over RM1m bribe — squash court project
- **Radar:** #88, p72=0.96, [ethnic, institutional, legal]
- **Date:** 14 April 2026
- **Why develop:** Specific, recent, verifiable, low-defamation-risk
  (charges already filed). Ties into the broader institutional-corruption
  arc T4A is tracking. Useful as either a standalone or as the second
  fact card in a "small-grift, big-pattern" piece with A4.
- **Verification path:** MACC statement, court charge sheet, statutory
  body annual report.
- **Lenses:** Governance, Economic, Legal.

---

## Tier B — develop if Tier A blocked

### B1. Bukit Kayu Hitam shooting → border agency armed with pistols/tasers
- **Radar:** #37, p72=0.48, [ethnic, political]
- **Date:** 17 April 2026
- **Frame:** Border use-of-force escalation. Pair with #86
  (Bukit Kayu Hitam passport rejections) for the wider AKPS governance
  picture.

### B2. Investment fraud losses RM1.47B in 2025
- **Radar:** #92, p72=0.29, [political]
- **Date:** 18 April 2026
- **Frame:** PDRM commercial crime data. Concrete, denominator-friendly
  scam-economy story. Verify with PDRM CCID annual data and SC
  enforcement bulletins.

### B3. Terengganu DOE — 3km Pantai Teluk Kalong oil spill, vessel identified
- **Radar:** #70, p72=0.29, [environmental, political]
- **Date:** 17 April 2026
- **Frame:** Environmental Quality Act enforcement test — does the
  identified vessel actually face penalty under EQA s.27, and what is the
  historical conviction rate?

### B4. Geopolitical tensions — Malaysia–West Asia trade −30.4%
- **Radar:** #94, p72=0.63, [economic, ethnic, political]
- **Date:** 21 April 2026
- **Frame:** MATRADE figures translate the Israel-Iran conflict into
  domestic export terms. Useful affordability/economy piece if paired
  with the RON95 subsidy data.

### B5. MACC RM500k transaction probe — former minister
- **Radar:** #62, p72=0.97, [ethnic, institutional, political]
- **Date:** 10 April 2026
- **Frame:** Hold until a name is publicly attached — current reporting
  is "former minister" without identification, which makes it
  defamation-fragile. Watch for the charge sheet.

---

## Skip — already covered or saturated

- #9 Norway NSM → published 1983
- #15 / #34 Zahid Islamic education / insults → published 1980
- #25 / #80 Fuel subsidies → covered in 1102 / 1201 arc
- #32 1MDB recovery → published 1979
- #45 / #81 Sabah 40% AGC stay → published 1981
- #60 Shah Alam community forest → Stage 1 already in
  `engine/output/shah-alam-community-forest-ruling-stage1.json`
- #77 RM82B local-currency trade → reader output already produced

---

## Methodology notes

- "Already covered" check ran against `src/data/issues/*.json` headlines
  and contexts plus `engine/briefs/*.md` filenames. False negatives are
  possible — confirm with `grep -ri <topic>` before opening a brief.
- "Saturated" means mainstream coverage already supplies the missing
  context T4A would otherwise add. Picks below privilege issues where
  Stages 2/3 will likely surface a real factual or framing gap.
- Single-word and stub titles (e.g. "anwar", "umno", "police") were
  excluded — they are signal of attention, not of a developable issue.
- The `silence_anomaly` detection bias in the queue (687/783) means many
  high-rank items are *low* news mentions but high *structural*
  importance — that is the queue working as designed, but it also means
  the rank order is not the develop order.

### Silence-watch obligation (Tier S)

Underreported issues accumulate fast. The radar produces an auto-ranked
`silence-watch.md` each cycle (see `radar/output/silence-watch.md`),
sorting silence anomalies by `silence × structural importance × age in
queue`. Items that have been silent for weeks rise above fresh-but-quiet
items, so genuinely accumulated picks surface.

**Curator rule:** every cycle, at least one Tier A or Tier B pick must
come from the top 5 of `silence-watch.md`, OR the curator must list each
of those top 5 in the Skip section below with a one-line reason. This
prevents silence picks from compounding into a timebomb the radar warned
about but T4A never developed.
