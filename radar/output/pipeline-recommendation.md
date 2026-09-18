# Pipeline Recommendation — Editorial Review of Radar Top Issues

_Editorial-review companion to the radar's curated develop list
(`radar/output/top-issues-to-develop.md`). This is the `editorial review`
step in the documented flow: `radar scan → issue-queue.json +
silence-watch.md → top-issues-to-develop.md → editorial review → publish
pipeline`. The radar does not write issues; this note recommends which
curated candidates enter the 10-phase publish flow, in what order, and
with what guardrails. Nothing here is published._

## Data-freshness

- **Raw queue**, **state**, and **health** from the CI scan at
  **2026-09-18 22:14 UTC** (run 1956; queue 1,214; 505 events; five
  sources healthy; six streams ok). The scan has run every two hours
  without a failed run in the last eight cycles today. No local rescan
  this cycle: the container cannot build `lifelines` (same
  `autograd-gamma` wheel failure noted on 4 Sep), and CI is the record.
- **Silence-watch** as committed by CI from the same scan (25 accumulated,
  15 fresh picks).
- **Curated develop list** refreshed 2026-09-18. The previous edition was
  pinned to 2026-09-03.
- **Latest published issue:** `2012` (sourceDate 2026-09-05). Next free
  ID: `2013`. No brief is currently waiting on approval; all three
  briefs from the 4 Sep edition shipped.

## Status reconciliation (since the 4 Sep curation)

| Prior pick | Topic | Now |
|------------|-------|-----|
| A1 | Sarawak haze / Transboundary Haze Act | **Published as 2011 (4 Sep).** Suhakam Clean Air Act call (17 Sep) and the westward haze are edition-2 material. |
| A2 | Tabung Haji RCI restatement | **Published as 2010 (4 Sep).** Azeez Rahim charged 9 Sep; Jamil Khir claims trial 14 Sep. Period update only. |
| A3 | Felda decade-late audit | **Published as 2012 (5 Sep).** Special-committee interim report due end-Sept. |
| B1-B4 | Border system, factory fires, KWAN Bill, Melaka nominated reps | Still open. Melaka promoted to B3 (polls now in the queue). |
| — | **AGC discontinues four Muhyiddin charges** | **New. Tier A1.** |
| — | **Political financing gap, RM50m donation drive** | **New. Tier A2. Stage 5 triggered.** |
| — | **800kWh electricity exemption** | **New. Tier A3.** |
| — | **Negeri Sembilan proclamation** | **Update to 1976, Stage 5 required.** |

## Recommended development order (next three publish slots)

Notifications fire Tue/Thu 08:00 and Sat 09:00 MYT. The scan landed at
06:14 MYT on Saturday 19 September; the 09:00 slot today cannot be met,
so the slots are **Tue 22 Sep, Thu 24 Sep, Sat 26 Sep**. Two of the
three picks are live prosecutions or live politics, so ordering is by
half-life, not by how long each has waited.

1. **A2 — no political-financing law, and a party crowdfunding a RM50m
   fine.** Tuesday, while the pardon is still the national conversation
   and before the Melaka campaign absorbs it. Governance / Legal /
   Political. This is the one pick that fires the Stage 5 escalation
   (Political CRITICAL with a sharp take); start the brief on Saturday so
   the extra Grok round fits before Monday evening. Hard guardrails:
   (a) no card evaluates the pardon or the Pardons Board; (b) the
   critique is the absence of a statute, not the party or the donors;
   (c) do not imply the drive is unlawful; (d) the 2018 pledge, the 2019
   NCC and MACC's 8 Sep statement are the spine, all primary. Drafts
   1307 and 1114 are superseded, not revived.
2. **A1 — the AGC's unexplained discontinuance.** Thursday. Governance /
   Legal / Political. Cleanest primary-source path of the three: the
   AGC statement, the court order, the charge sheets, Article 145(3), and
   T4A's own 1997 for the structural half. Three charges remain live:
   count, quote, never characterise. Merge the 3 Aug carry-over (AG vs
   Malaysian Bar on DNAA standing) into this brief as the second case
   if the Federal Court date is known; otherwise leave it out.
3. **A3 — the 800kWh exemption and its missing bill.** Saturday.
   Economic / Governance / Environmental. Zero 3R load, and the only
   Economic-lens pick since 2004. Fold accumulated S1 (diesel RM2.5b a
   month) and S2 (RM50b fuel-subsidy bill) into the brief as the
   denominator; do not publish either radar number without the MoF
   source. This is also the natural opener for a pre-Budget run: Budget
   session opens 5 Oct, Budget 2027 is tabled 23 Oct.

This gives Governance → Legal → Economic across the three slots. If A2
slips on Stage 5 turnaround, swap A1 into Tuesday and A2 into Thursday;
do not push A2 to Saturday, where a pardon story eight days old reads as
commentary. If A3 slips on the tariff documents, promote **B4 (custody
death appeal, accumulated S23)**: it is the silence-watch's oldest
structurally-important item at 176 days and satisfies the
one-accumulated-pick-per-cycle rule that A3 otherwise covers through
S1/S2.

## October queue (first two slots after the budget session opens)

- **B1 — Sabah / Sarawak seats, Article 46 and nationwide
  re-delineation.** Brief now from the 11-17 Sep statements and the
  Bintulu Port repeal Acts; Stage 1 when the amendment bill is tabled.
- **B2 — the 2024 citizenship amendment's missing commencement date.**
  Verify gazette status first; if nothing is in force, it is a new Rights
  issue; if part is, it is an update to 1325.
- **S15 — PWD's RM2b road-maintenance allocation spent by August** is the
  Budget-week Governance pick.

## Stage 5 escalation calls

Per CLAUDE.md and ADR-0004, re-enable the Grok contrarian stress-test
when a brief marks Religion / Ethnic / Royalty risk HIGH+, marks
Political risk CRITICAL with a sharp take, or when Stage 3
`source_diversity_estimate` is below 0.4.

- **A2 (political financing):** Political CRITICAL, Royalty adjacent.
  **Required.** Run Stage 5 with the explicit instruction that the pardon
  decision is out of scope; the stress-test is on whether the
  "no statute" framing is fair to the party and to the donors.
- **A1 (AGC discontinuance):** Political HIGH, 3R none. **Not required**
  at brief stage. Watch Stage 3's source-diversity score: the coverage is
  FMT / Malay Mail / Bernama heavy until the court order and the charge
  sheets are pulled.
- **A3 (electricity):** all LOW. Not required.
- **1976 update (Negeri Sembilan):** Royalty CRITICAL. **Required** for
  the edition-2 cards, even though the base issue is published.
- **B4 (custody death):** Ethnic MEDIUM. Re-assess after the brief.
- **Skips that would fire the trigger** (Catholic-clergy remark, GISBH
  fatwa, Act 355 repeal call, the pardon decision itself) do not enter
  the pipeline this cycle.

## Before drafting Stage 1 for A2

- Establish the drive's mechanics from Umno's own statement before
  writing a single number: account holder, cap per donor, whether names
  will be published, whether the RM50m is the fine alone or includes
  costs. A drive with voluntary disclosure changes the reframe.
- Separate three legal regimes cleanly on the fact cards: the Societies
  Act (party accounts to the Registrar), the Election Offences Act
  (campaign spending caps and returns), and the missing political-
  financing statute (donations outside campaigns). Mixing them is the
  most likely Stage 3 correction.
- Pick one phrase for the statute across all cards ("political financing
  law") and one for the drive ("the donation drive"); no elegant
  variation.
- Hook emotion: anger-at-process (a promise from 2018, a bill the
  anti-graft agency itself is asking for), not anger at the party.

## Before drafting Stage 1 for A1

- Get the exact procedural outcome for each of the four charges (DNAA vs
  acquittal) from the court record, not from headlines; the queue carries
  both words in different entries.
- The 14-15 Sep police-report episode (MACC officer vs defence lawyer)
  belongs on one fact card as a dated sequence, not as a motive claim.
- Reframe candidate: "The office that decided this is the office
  Parliament is still deciding how to split." Verify the committee status
  against 1997's brief before using it.

## Operational gaps to close

1. `radar/output/malaysia-impact-watch.{json,md}` still do not exist. The
   daily pass reports success in Actions but exits before writing because
   `ANTHROPIC_API_KEY` is unset. Unchanged since 3 Aug. Either set the
   secret or disable the workflow; a green run that produces nothing is
   worse than a red one.
2. `radar/config/malaysia-calendar.json` has no 2026 state-election
   window, but Melaka-poll items are in the queue. Add a Melaka window
   (assembly term ends around November 2026) so the hazard model's
   `days_to_election` covariate stops reading as calendar-free.
3. The top 16 queue ranks are keyword stubs and calendar predictors.
   Curators should keep reading the silence-watch and the fresh list;
   consider a stub filter in `build-silence-watch.py`'s `_is_stub` for
   single-word titles at the queue level too.

_Refreshed 2026-09-18 as the editorial-review companion to the
2026-09-18 22:14 UTC scan; supersede on the next curator refresh._
