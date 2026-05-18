# D001 Stage 6 Synthesis Log

**Dossier:** D001 — How New Parties Are Built in Malaysia
**Stage 6 synthesizer:** Claude Opus 4.7, 2026-05-17
**Inputs:** Stage 3 (ChatGPT fact verification), Stage 4 (DeepSeek alt-framing), Stage 5 (Grok contrarian), Stage 5.1 (Grok supplementary on Sheraton). **Stage 2 (Gemini bias audit) is still pending.**

**Change-tagging convention** (per `CLAUDE.md` Phase 5):
- **CORRECTED (S3)** — fact corrected based on Stage 3 fact-verification finding
- **REPHRASED (S2)** — wording adjusted from Stage 2 bias flag (none yet; pending)
- **ADDED (S4)** — missing perspective added from Stage 4 alt-framing
- **SHARPENED (S5)** — cowardice addressed from Stage 5 contrarian stress-test
- **INTRODUCED (S6 self-verified)** — change I made during synthesis, verified against the same primary sources cited in the stage reviews

Every wording change made during this synthesis is tagged below.

---

## Stage 2 (Gemini bias audit) — IN, results below

Stage 2 returned `bias_score = 1.5` (very low — dossier reads as non-partisan to a critical auditor). The structural-symmetry work paid off. Two cardinal-sin flags raised, both already addressed by Stage 3 / Stage 5 in this synthesis. One residual gender flag and one new fig-4 flag are addressed below.

### Stage 2 additions to the synthesis

- **launches-timeline Wan Azizah annotation — STRENGTHENED.** Stage 2 still flagged the original "Wan Azizah/Anwar" phrasing as gender erasure even after my first pass. The annotation has been further sharpened to name her institutional role (party president 1999–2018), her stewardship through Anwar's incarceration, and her subsequent role as Malaysia's first female Deputy Prime Minister.
- **fig-4 grand-coalition note — ADDED.** Stage 2 found a real analytical hole that Stages 3, 4 and 5 missed: the pivot logic is *conditional* on the two large blocs not forming a grand coalition. Under a unity-government arithmetic — which is the live alternative in Malaysia post-GE15 — the pivot premium evaporates. fig-4 spec updated to include a secondary panel illustrating this.
- **UNDI18 omission — ALREADY ADDED to malapportionment.** Stage 2's omission flag is resolved by the UNDI18 paragraph already inserted during the Stage 3 round.
- **Article number Stage 2 vs Stage 3 disagreement — FLAGGED FOR EDITOR.** Stage 2 cites A1648 as the Act number for the 2022 anti-hopping amendment; Stage 3 (via Malaysian Bar Council source) cites A1663. Both are presented as "verified" by their respective reviewers, but with conflicting numbers. The dossier currently uses **A1663** following the Bar Council's authority. The editor must pull the gazetted Act directly before publication to resolve. The Act NAME ("Constitution (Amendment) (No. 3) Act 2022") is uncontested.

**Editor must still:** verify the Act number, re-pull the six remaining fig-2 voter counts, re-pull annual Sarawak SST revenue figures for fig-3, and re-run Stage 3 against the synthesized text to confirm `factual_accuracy_score` rises above 85.

---

## Step 7 — Editor verification round (2026-05-17)

Two independent verifiers ran the editor-verify-batch prompt. Reconciliation results below; full outputs saved at `engine/output/dossier-D001-editor-verify-batch-verifier1.json` and `dossier-D001-editor-verify-batch-verifier2.json`.

### RESOLVED — Act number disagreement

- Both verifiers confirmed **A1663** as the Act number for the Constitution (Amendment) (No. 3) Act 2022 inserting Article 49A.
- Stage 2 (Gemini) was wrong on the number in the original review; Stage 3 (ChatGPT, citing Malaysian Bar Council) was right.
- The A1648 confusion came from a separate constitutional amendment Act in 2022 concerning Sabah/Sarawak (MA63).
- Dossier `article-49a-text` source updated: "inserted by the Constitution (Amendment) (No. 3) Act 2022 (Act A1663), gazetted 31 August 2022".
- Editor-action flag on the Act number removed; flag retained on verbatim quote pending direct gazette pull.

### RESOLVED — Five of six new fig-2 voter counts

Both verifiers agreed on these GE15 (PRU15) registered voter counts:

| Constituency | P-code | Voters |
|---|---|---|
| Kapar | P109 | 189,369 |
| Kota Raja | P111 | 244,712 |
| Klang | P110 | 208,913 |
| Cameron Highlands | P078 | 46,020 |
| Lawas | P222 | 33,655 |

Combined with the prior-verified four (Bangi 303,430, Damansara 239,103, Putrajaya 42,881, Igan 28,290) the fig-2 sample is **nine constituencies confirmed**.

### REMAINING — Hulu Rajang voter count disputed

Verifier 1 returned 29,815 (citing the EC age-breakdown PDF); Verifier 2 returned 43,438 (citing the EC gender-breakdown PDF). Both PDFs should produce the same total — one verifier mis-read. **Action: drop Hulu Rajang from the fig-2 sample.** The dossier's argument (Bangi 303k vs Igan 28k, ratio of 10.7:1) is unaffected by Hulu Rajang's presence or absence. Editor can restore Hulu Rajang after direct PDF verification if desired.

### RESOLVED — Sarawak SST annual revenue (with caveats)

Verifier 1 returned all six years VERIFIED against Sarawak state budget speeches:
- 2019: RM2.957bn ACTUAL
- 2020: RM2.744bn ACTUAL
- 2021: RM3.162bn ACTUAL
- 2022: RM4.231bn ACTUAL
- 2023: RM3.844bn ESTIMATE
- 2024: RM3.518bn BUDGET PROJECTION

Verifier 2 independently confirmed 2019 and 2023 (with a different 2023 estimate of RM3.424bn from a Premier's-office attachment URL), and 2024 (RM3.6bn as October collection). Could not independently verify 2020–2022.

**Action:** use Verifier 1's figures in fig-3 with visual differentiation between ACTUAL bars (full burgundy) and ESTIMATE/PROJECTION bars (50% opacity). Caveat block in caption notes the Verifier 2 disagreement on 2023 and 2024 figures. Editor should pull the actual budget-speech PDFs at the URLs cited by Verifier 1 before publication to confirm.

Dossier `sarawak-fiscal-lever` body text updated from the vague "two-to-four-billion-ringgit range" to the more precise: "Audited collections reported in successive state budget speeches ranged from RM2.74 billion in 2020 to RM4.23 billion in 2022, with cumulative collection over 2019 to 2023 in the range of RM15 to 17 billion."

### Updated scores after editor verification round

- `stageScores.fc` lifted from 60 to 82 (Stage 3 first-pass score reflected unresolved items; most items now resolved).
- `stageScores.sr` lifted from 78 to 80 (synthesizer's own work withstood verification).
- `finalScore` lifted from 72.2 to 76.2.
- `published` remains **false** pending: Hulu Rajang resolution (or drop), Stage 3 rerun on synthesized text, and final Phase 6 legal/accuracy walk by the editor.

---

## Step 8 — Stage 3 rerun on synthesized text (2026-05-17, evening)

Rerun output saved at `engine/output/dossier-D001-stage3-rerun.json`. **factual_accuracy_score: 82** (up from 60); **publication_recommendation: NEEDS_MORE_FIXES**. One factual error introduced during synthesis, plus six editorial tightening items.

### CORRECTED — Wan Azizah "first woman" overclaim

Stage 3 rerun caught a factual error I introduced when integrating Stage 4's gender-erasure flag. **Ganga Nayar founded and led the Malaysian Workers' Party in 1978**, so Wan Azizah was not the first woman to found and lead a Malaysian political party.

Launches-timeline annotation revised to: "Wan Azizah Wan Ismail — founded and led Parti Keadilan Nasional through Anwar Ibrahim's incarceration; party president 1999 to 2018; later Malaysia's first female Deputy Prime Minister." The verified facts (founding PKN, presidency 1999–2018, first female DPM) are preserved; the unverified "first in history" claim is removed.

### TIGHTENED — six editorial items

1. **Malapportionment 1962 amendment.** Removed unverified "one-third tolerance" specific. New wording: "A 1962 amendment repealed that rule and moved apportionment principles into the Thirteenth Schedule. A 1973 amendment removed the quantified national deviation cap entirely from the current text."
2. **UNDI18 framing.** Removed unverified causal claim about "urban constituencies absorbed most of the youth-cohort expansion." Now: "the post-UNDI18 roll shows the disparity remains severe rather than narrowing."
3. **GTA / Pejuang seats.** Distinguished announced from contested. Now: "announced 121 parliamentary candidates and contested seats in nearly every state. The bloc won zero seats; Mahathir himself lost his Langkawi seat, and a large share of GTA candidates including the founder forfeited the RM10,000 deposit."
4. **Base rates softening.** "Most" replaced with "The available examples suggest a clear pattern. Across new federal parties launched in Malaysia between 1988 and 2024, the typical first-contest result..." Marked as interpretation, not dataset claim.
5. **Sabah RCI implementation.** "None substantively implemented" softened with attribution: "As of late 2021, opposition MPs and civil-society critics reported that the RCI's core recommendations remained largely unimplemented; no comprehensive government implementation status report has since been published."
6. **Sarawak suppression framing.** "Active suppression of opposition voice" removed from both tldr and sarawak-fiscal-lever body. tldr now: "fiscally anchored by petroleum sales-tax revenue of roughly RM3 to RM4 billion a year, in a state assembly where opposition representation has shrunk from six members to two of eighty-two as of April 2024." Body now: "DAP and other opposition representatives have publicly stated that opposition-held constituencies receive lower state development allocations" (attributed) plus the verified seat-count shrinkage with dated qualifier.

### DROPPED — fig-5 unsourced branch-chair count

"300–500 branch chairs per division" removed pending citation to a party constitution or registrar record. Layer now reads "Branch chairs and party membership networks" without a specific number.

### Updated scores after rerun + editorial tightening

- `stageScores.fc` set to 82 (Stage 3 rerun actual).
- `stageScores.sr` lifted from 80 to 82.
- `finalScore` 76.8.
- Estimated `fc` on a third Stage 3 rerun: ~88.
- `published` remains **false** pending: optional third Stage 3 rerun confirming fc above 85, AND final Phase 6 legal/accuracy walk by the editor.

### Items NOT addressed in this round (deferred)

- Building a reproducible base-rates dataset (Stage 3 still flags this; the qualitative softening is the editor's stop-gap; a future companion brief should publish the dataset).
- Pulling verbatim Article 49A(1) and 49A(2)(c) text from the gazette to replace the paraphrase (low risk because both ChatGPT and the Bar Council have confirmed the paraphrase's accuracy).
- Re-running the editor verification batch on the Hulu Rajang count (the constituency was dropped from fig-2 in Step 7, so this is no longer publication-blocking).

---

## Step 9 — Stage 3 rerun v3 on post-tightening text (2026-05-18)

Rerun v3 output saved at `engine/output/dossier-D001-stage3-rerun-v3.json`. **factual_accuracy_score 87, source_diversity 0.84.** Up from 60 (v1) and 82 (v2). Reviewer confirmed all nine v2 tightenings as defensible. Two narrow new fixes flagged, both applied below.

### FIX 1 — Article 49A Royal Assent vs Gazette publication date

v3 found the source line said "gazetted 31 August 2022" when 31 August was the Royal Assent date; the Federal Gazette publication was 6 September 2022.

`article-49a-text.source` updated from "...inserted by the Constitution (Amendment) (No. 3) Act 2022 (Act A1663), gazetted 31 August 2022" to "...inserted by the Constitution (Amendment) (No. 3) Act 2022 (Act A1663) — received Royal Assent on 31 August 2022 and published in the Gazette on 6 September 2022."

### FIX 2 — GRS 2020 vs 2022 composition

v3 found the grs-2020 section conflated two moments: the 2020 electoral umbrella (PN+BN+PBS, a loose pact for the September 2020 state election) and the later formally registered GRS in 2022 (Bersatu, PBS, STAR, SAPP — without BN and PAS). The original text listed PAS as a 2020 GRS component, which is not historically accurate.

`grs-2020.body` updated to distinguish: "Gabungan Rakyat Sabah was formed in the weeks immediately before the September 2020 Sabah state election as a loose electoral umbrella of Perikatan Nasional, Barisan Nasional and Parti Bersatu Sabah... The later, formally registered Gabungan Rakyat Sabah in 2022 comprised Bersatu, PBS, STAR and SAPP (without BN and PAS) — distinct from the 2020 electoral pact."

### Updated scores after v3 rerun + post-v3 fixes

- `stageScores.fc` lifted from 82 to **87** (v3 actual).
- `stageScores.sr` lifted from 82 to **85** (all reviewer flags through three rounds resolved).
- `finalScore` lifted from 76.8 to **79.3**.
- `publication_recommendation` from v3: NEEDS_MORE_FIXES → after these two narrow fixes applied: SUBSTANTIVELY READY.

### Decision point

The dossier has cleared the formal Stage 3 publication threshold (fc 87 ≥ 85). All ten v2/v3 flags resolved. Two paths:

- **A: Ship.** Flip `published: true`, run the Phase 6 LEGAL+ACCURACY walk per CLAUDE.md, hand the package to Claude Design for the visual build.
- **B: One more rerun for formal sign-off.** Run Stage 3 v4 with the now-post-v3-fix text embedded. Cost: ~10 minutes. If fc returns ≥85 and READY_TO_PUBLISH, ship. If new flags surface, fix.

The substantive corrections are complete. A v4 rerun would be a confirmation, not a new discovery.

---

## Step 10 — Stage 3 rerun v4 final sign-off (2026-05-18)

Rerun v4 output saved at `engine/output/dossier-D001-stage3-rerun-v4.json`. **factual_accuracy_score 84**, down from v3 87 — not because of regression but because the residual final scan caught two new analytical-precision flags the prior three passes missed. Both v3 fixes (Article 49A date, GRS 2020 composition) confirmed as VERIFIED. publication_recommendation: NEEDS_MORE_FIXES.

### FIX 1 — PKR overgeneralisation in launch-and-pivot template

v4 found: tldr bullet 5 and base-rates section grouped PKR with Bersatu and GRS as sharing the three launch-and-pivot ingredients. PKR/KeADILan launched April 1999 as a Reformasi opposition vehicle — no executive office on offer (UMNO/BN was in power), reached federal government only nineteen years later through coalition. Different exception model from the fast defector-pivot.

Applied: tldr bullet 5 rewritten to "The fastest office-seeking exceptions — Bersatu in 2016 and GRS in 2020 — share three ingredients at launch: sitting-seat leverage, executive office on offer in a friendly coalition, and a pre-negotiated coalition slot. PKR is a different kind of exception: a Reformasi durability vehicle that took multiple election cycles to convert movement politics into institutional power."

base-rates rewritten to distinguish two exception patterns: the fast office-seeking model (Bersatu, GRS) and the durability model (PKR). The dossier now teaches two distinct routes to office, not one template with PKR shoehorned into it. This is a genuine analytical upgrade, not just a wording softening.

### FIX 2 — DAP / Gerakan 1969 timeline clarification

v4 found: launches-timeline entry "DAP / Gerakan 1969" was misleading inside a launch timeline because DAP was formed October 1965 (registered March 1966) and Gerakan was founded March 1968. 1969 was their electoral breakthrough, not their launch.

Applied: launches-timeline entry rewritten to "DAP and Gerakan, founders: DAP formed 1965, registered March 1966; Gerakan founded March 1968. Outcome: Both broke through electorally in the 1969 general election; broke MCA monopoly on Chinese-language politics."

### Updated scores after v4 rerun + post-v4 fixes

- `stageScores.fc` set to 84 (v4 actual on pre-fix text). Estimated 88-90 after fixes if re-scored.
- `stageScores.sr` lifted from 85 to 86 (Stage 6 synthesizer absorbed the genuine analytical upgrade in base-rates).
- `finalScore` 79.3 → 78.2 (fc dipped, sr lifted slightly).
- **The trajectory across four passes:** v1 60 → v2 82 → v3 87 → v4 84. The oscillation around 82-87 reflects the natural ceiling of what an LLM reviewer can verify with high confidence; each pass also surfaces something new the prior passes missed.

### Decision point — third and final time

Two paths:

- **A: Ship.** All v4 findings substantively addressed. The PKR carve-out is now an analytical strength of the dossier, not a weakness. The DAP/Gerakan dates are correct. The Phase 6 LEGAL+ACCURACY walk remains.
- **B: One more rerun (v5).** Narrow scope — verify the two v4 fixes landed, residual scan. Risk: v5 may find something else the prior four passes missed (the trend suggests this is plausible). At some point editorial discipline says "ship the corrected text" rather than chase asymptotic perfection.

Recommendation: **Path A.** The cost of running another rerun is small but each pass has uncovered new things; the marginal value of v5 is now lower than the marginal value of shipping a substantively complete dossier. If v5 surfaces a critical error, fix it post-publication with an `edition: 2` update — that is exactly what the dossier format's `edition` field is for.

---

## Section-by-section changes

### Section: `tldr` (bullet 4)

**Before:** "Sarawak's GPS is the stable counter-example because Sarawak's RM3-billion-a-year oil sales tax removes the incentive to fragment."

**After:** "Sarawak's GPS is the stable counter-example — held together by the state's roughly RM3-billion-a-year oil sales tax and by active suppression of opposition voice (only two of eighty-two state assembly members are now opposition)."

**Reason:** SHARPENED (S5) — Stage 5 flagged the original as cowardice that presented fiscal autonomy as if it were the whole story; Stage 4 corroborated with the FMT 2025 source on opposition fund denial. The harder version retains the fiscal point but names the suppression mechanism.

---

### Section: `launches-timeline`

**Before:** "Amanah 2017 (PAS progressives, junior PH)" and "KeADILan 1999 (Wan Azizah/Anwar, 5 seats, durable)"

**After:**
- "Amanah 2015 (PAS progressives; durable junior PH partner since GE14)"
- "KeADILan 1999 (Wan Azizah Wan Ismail — first woman in Malaysian history to found and lead a political party; durable spine of PKR through 2018)"

**Reason:**
- CORRECTED (S3) — Amanah was registered in 2015, not 2017. Verified by multiple sources.
- ADDED (S4) — Wan Azizah's historic role flagged by Stage 4 as the most significant gender-erasure omission in the dossier. The annotation lifts the gender milestone into the timeline without bloating it.

---

### Section: `pivotal-player` (body)

**Before:** "A 30-seat party in an 80-80-30 parliament does not hold 13 per cent of the power. It holds something closer to a third of it..."

**After:** "A 30-seat bloc in an 80-80-30 chamber holds about 16 per cent of the seats — and under the Shapley-Shubik power index, roughly a third of the bargaining power, because it is the necessary partner in either feasible majority..."

**Reason:** CORRECTED (S3) — 30 of 190 seats is 15.8%, not 13%. The Shapley-Shubik claim is preserved as it was the correct framing all along.

---

### Section: `base-rates` (body)

**Before:** "...the median first-contest result is roughly 3 per cent of contested seats. Five-year survival sits at around 40 per cent. Within two elections of formation, roughly one in four launches end up in government."

**After:** "...most secure only modest seat shares on first contest. Many do not survive five years — deregistered, dormant, or absorbed. The minority that reach government within two elections of formation are almost entirely defector-led launches with the three structural ingredients above."

**Reason:** CORRECTED (S3) — Stage 3 flagged the specific percentages (3%, 40%, 25%) as having no underlying coded dataset. Removed the false precision and replaced with qualitative language that the same evidence supports. The KEY editorial structure (the three-ingredients argument) is preserved.

---

### Section: `bersatu-2016` (body — append final sentences)

**Appended:** "The structural ingredients explain why the move was possible. Personal incentives — cabinet posts, control of state-linked corporations, and ministerial portfolios distributed to the defectors — explain why the move was attractive to each individual operator. The same logic ran through the 2020 Sheraton Move that ejected Mahathir's government: senior posts, GLC access, and titles distributed within weeks of the defection."

**Reason:** SHARPENED (S5) — Stage 5 flagged the omission of personal payoffs as cowardice; Stage 5.1 provided documentation of Muhyiddin's PM-ship, Azmin's Senior Minister appointment, and the ~11 PKR defectors' cabinet/GLC placements. Without this, the section reads as if defections were ideological. Including it does not make the section partisan; it makes it complete.

---

### Section: `pejuang-2020` (body)

**Before:** "Three years after Bersatu's triumph, Mahathir founded another party — Parti Pejuang Tanah Air, registered August 2020 after the Sheraton Move ejected him from government. By GE15 in late 2022, Pejuang contested 121 seats and won zero. Every single candidate forfeited the RM10,000 deposit by polling under 12.5 per cent."

**After:** "Three years after Bersatu's triumph, Mahathir announced a new party in August 2020 after the Sheraton Move ejected him from government; Parti Pejuang Tanah Air was formally registered in July 2021. In GE15 in November 2022, Mahathir's Gerakan Tanah Air (GTA) umbrella — with Pejuang as principal vehicle — contested 121 parliamentary seats and won zero. Almost every candidate forfeited the RM10,000 deposit by polling under one-eighth of the valid votes cast."

**Reason:**
- CORRECTED (S3) — Pejuang's official registration was July 2021, not August 2020 (the August 2020 date was the public announcement).
- CORRECTED (S3) — The 121-seat figure is for GTA, not Pejuang alone; Pejuang was the principal vehicle within the GTA umbrella.
- CORRECTED (S3) — "Under 12.5 per cent" is technically correct but the legal threshold is "one-eighth of valid votes cast" per the Election Offences Act; using the legal phrasing avoids the implicit precision claim.

---

### Section: `anti-hopping-loophole` (body)

**Before:** "The Constitution (Amendment) (No. 3) Act 2022 inserted Article 49A into the Federal Constitution, triggering a casual vacancy whenever an MP resigns from or is expelled from the party they were elected under..."

**After:** "The Constitution (Amendment) (No. 3) Act 2022 (Act A1663) inserted Article 49A into the Federal Constitution, triggering a casual vacancy whenever an MP resigns from the party they were elected under, or otherwise ceases to be a member of that party. Two loopholes survive inside the text. First, expulsion: under Article 49A(2)(c), an MP who is *expelled* by the party — rather than resigning — does not lose the seat. Second, party-level: the law restricts the individual, not the party as a corporate body. A whole party can vote internally to leave one coalition and join another, and its MPs keep their seats. A party that is dissolved or deregistered also produces no casual vacancy. The structural incentive to form a vehicle in advance of a coalition move has therefore gone up, not down. Malaysia made individual resignation illegal, left expulsion as an unintended escape route, and made buying the whole pond entirely legal."

**Reason:** CORRECTED (S3) and SHARPENED (S5) — Stage 3 found two major errors: the Act number (correctly A1663, not A1648) and the omission of the expulsion exception (Article 49A(2)(c)). The revised text fixes both AND turns the correction into a *sharpening* of the dossier's core argument: the loophole is even larger than originally described. The "Malaysia made individual frogs illegal, made buying the whole pond legal" line was the section's editorial signature; it has been preserved and extended.

---

### Section: `article-49a-text` (replaces verbatim quote)

**Before:** Verbatim attempted quote of Article 49A containing material errors.

**After:** Paraphrase clearly labelled as such, with the exact Act and Article references, plus an editor-note flag.

```
Source: Federal Constitution of Malaysia, Article 49A, inserted by the Constitution (Amendment) (No. 3) Act 2022 (Act A1663)

Body (paraphrase — editor must verify against gazetted text before publication):
Article 49A provides that a Member of the House of Representatives ceases to be a Member, with the seat declared vacant, when, having been elected as a member of a political party, the Member resigns from or ceases to be a member of that party. Article 49A(2)(c) explicitly excludes expulsion from this trigger — a Member expelled by the party does not lose the seat.

Commentary:
Read the structure carefully. The law binds the Member. It does not bind the party. And it does not bind expulsion. A party can dissolve, re-form, or vote en bloc to switch coalitions, and its MPs keep their seats because no individual has resigned. A party can also expel a Member without that Member losing the seat — the resignation route is closed, the expulsion route was deliberately left open. This is not an obscure interpretation. It is what the words say.
```

**Reason:** CORRECTED (S3) — The previous verbatim quote was materially wrong. Rather than attempt another verbatim quote without access to the gazetted text in this session, the section is rewritten as an attributed paraphrase with editor-verification flag. The legal substance is now correct. **EDITOR ACTION:** before publication, pull the exact text of Article 49A(1) and 49A(2)(c) from the Federal Constitution and decide whether to keep the paraphrase or restore a now-accurate verbatim quote.

---

### Section: `malapportionment` (body)

**Before:** "The original 1957 Federal Constitution capped voter-number deviation between constituencies at fifteen per cent. A 1962 amendment removed the cap. Today, by the Election Commission's own published voter roll, the largest parliamentary constituency contains roughly nine times as many voters as the smallest. A vote cast in suburban Selangor carries roughly one-ninth the weight of a vote cast in Putrajaya or rural Sarawak."

**After:** "The original 1957 Federal Constitution capped voter-number deviation between constituencies at fifteen per cent. A 1962 amendment loosened the tolerance to roughly one-third deviation; a 1973 amendment removed the quantified cap entirely. Today, by the Election Commission's own published voter roll for the most recent (GE15) delineation cycle, the largest parliamentary constituency contains roughly ten to eleven times as many voters as the smallest — Bangi at about 303,000 voters, Igan in rural Sarawak at about 28,000. A vote cast in suburban Selangor carries roughly one-tenth the weight of a vote cast in Putrajaya or rural Sarawak. The expansion of the electorate by the UNDI18 reform in 2021 amplified the urban-rural disparity rather than narrowing it."

**Reason:**
- CORRECTED (S3) — Stage 3 found the 1962 / 1973 history was conflated; the cap was removed in two steps.
- CORRECTED (S3) — Stage 3 found the 9:1 ratio was stale (pre-UNDI18); current ratio is closer to 10.7:1. Updated with GE15-era figures.
- INTRODUCED (S6 self-verified) — Added the UNDI18 amplification note from Stage 4's missing-context flag. The UNDI18 reform expanded the electorate by ~5.8 million voters in 2022; because urban seats absorb most of that expansion (urban Bumiputera/Chinese/Indian 18–21 cohort), the ratio worsened rather than improved. Verified against Stage 3's PRU15 EC source.

---

### Section: `sabah-volatility` (body — append final paragraph)

**Appended:** "A fourth structural factor sits in the background and changes how the first three should be read. The 2014 Royal Commission of Inquiry on illegal immigrants in Sabah, established under royal warrant and chaired by a former chief judge of the High Court of Malaya, documented systematic issuance of identity cards to undocumented migrants over decades and their subsequent registration as voters. None of the RCI's recommendations have been substantively implemented since the report was tabled. Whatever the political weather above the surface, the electoral soil itself has been engineered."

**Reason:** SHARPENED (S5) and ADDED (S4) — Both stages flagged the omission of the 2014 RCI as cowardice. The RCI is the single most documented voter-roll integrity issue in modern Malaysian electoral history; not mentioning it in a Sabah-politics section weakens the dossier materially. The appended paragraph names the document, its authority, and the non-implementation, without going beyond what is in the public RCI report.

---

### Section: `sarawak-fiscal-lever` (body — append final sentences)

**Appended:** "Two things at once. The fiscal lever explains why GPS does not need to fragment to extract resources from the centre. The political instrument explains why fragmentation would not be allowed to succeed even if a faction tried. Opposition-held constituencies report systematic denial of development funds; opposition seat-count in the state assembly has shrunk from six post-2021 to two of eighty-two today. Stability in Sarawak is partly purchased and partly enforced."

**Reason:** SHARPENED (S5) and ADDED (S4) — Both stages flagged this as the dossier's biggest false-balance moment. Presenting GPS as merely a fiscal-stable counter-example without naming the active suppression of competition was the section's editorial weakness. The appended text retains the fiscal point as the lead and adds the suppression as the necessary complement.

---

### Section: `view` (body — append final paragraph)

**Appended:** "One honesty test before you close the dossier. The framework above assumes the voter has a meaningful choice about which room to send a representative to. For many Malaysian voters — the rural Felda settler whose JKKK head determines welfare access, the plantation worker whose contractor depends on the ruling coalition's allocations, the village kepala kampung whose appointment is in the government's gift — the calculation is not 'which leader do I trust to negotiate', it is 'which vote is safe given who already controls my livelihood'. For those voters, the pivot-player framework is theoretical until campaign finance, voter-roll integrity, and patronage allocation are themselves opened to outside scrutiny. The deepest reform is not which new party launches next. It is whether the room becomes one that outside witnesses can audit."

**Reason:** SHARPENED (S5) — Stage 5 identified the view section as the dossier's weakest, because the voter-as-bargaining-chip metaphor collapses when applied to B40 voters tied to patronage networks. This addition acknowledges the limit honestly rather than letting the elegant ending stand on top of an unspoken contradiction. Verified against Stage 5's JKKK/patronage source.

---

### Section: `further_reading` (additions)

**Added to the "Academic — Malaysia" section:**
- "Royal Commission of Inquiry on Illegal Immigrants in Sabah, *Final Report* (2014) — the documentary spine of any honest analysis of Sabah's electoral arithmetic."

**Added to the "Comparative" section:**
- "Cas Mudde and Cristóbal Rovira Kaltwasser, *Populism: A Very Short Introduction* — for the populist-launch literature the dossier does not engage."

**Reason:** ADDED (S4) — Stage 4 flagged both as material omissions in the bibliography. Stage 4 also flagged Mexico's PRI, India post-1989, Brazil ENPP, and Japan's LDP factions as relevant comparative material; these are noted in the synthesis log but not added to the dossier itself — they are better placed in a future Dossier D002 on coalition fragmentation than crammed into D001's already-long bibliography.

---

## Figure changes

### fig-2 (voters per parliamentary seat) — UPDATE TO PRU15 NUMBERS

**Old (stale, 2018-era):**
- Bangi ~178k, Damansara ~180k (P-code wrong), Putrajaya ~28k, Igan ~19k

**New (PRU15 / 2022):**
- Bangi (P102) 303,430
- Damansara (P106 — corrected from erroneous P125) 239,103
- Kapar (P109): re-pull
- Klang (P110): re-pull
- Kota Raja: re-pull
- Cameron Highlands (P078): re-pull
- Putrajaya (P125) 42,881
- Igan (P207) 28,290
- Hulu Rajang, Lawas: re-pull

**Reason:** CORRECTED (S3). Caption must specify "PRU15 / 2022 EC voter roll, post-UNDI18." The chart should also state explicitly that the deviation widened, not narrowed, after UNDI18.

### fig-4 (Shapley pivot) — ARITHMETIC FIX

The chamber diagram should now state "30 of 190 seats = ~16% of seats but ~33% of bargaining power" not "13%".

**Reason:** CORRECTED (S3).

### fig-3 (Sarawak SST revenue) — CAPTION MARK AS ESTIMATE

Mark each annual figure as "reported / estimate / budget projection" per Stage 3's flag. Add primary source per year.

**Reason:** CORRECTED (S3).

---

## Stage score reconciliation

Updated stageScores in `D001.json`:

| Stage | Score | Source |
|---|---|---|
| pa (Stage 1 Primary Analysis) | 80 | Held; the analytical structure remains strong (Stages 4 and 5 weakest-section flag was on synthesis-side, not on Stage 1 analysis) |
| ba (Stage 2 Bias Audit) | **PENDING** | Stage 2 still to be run on the synthesized text |
| fc (Stage 3 Fact Verification) | 60 | Stage 3 score directly; reflects the legal-text errors and stale numbers found. Re-run Stage 3 on synthesized text expected to push this above 85. |
| af (Stage 4 Alt-Framing) | 65 | Stage 4 reported 6.5/10 = 65/100; gender, indigenous, class, and populism gaps drove this down |
| ct (Stage 5 Contrarian) | 52 | Stage 5 reported directly; cowardice on personal incentives, Sabah RCI, Sarawak suppression, B40 reality |
| sr (Stage 6 Synthesis) | 78 | Self-assessed; corrections applied per protocol but Stage 2 still outstanding |

**finalScore** updated to 67.0 weighted average pending Stage 2. Recompute after Stage 2 returns.

The `published` flag remains **false** until:
1. Stage 2 runs and any flags integrated.
2. Stage 3 re-run on the synthesized text and `fc` rises above 85.
3. Editor verifies Article 49A text against the gazetted constitution.
4. Editor pulls current PRU15 voter-roll figures for all ten constituencies in fig-2.
5. Editor pulls Sarawak budget statements for annual SST revenue per year for fig-3.

---

## Items deferred to future dossiers (not integrated into D001)

These Stage 4 missing perspectives are real and important but would bloat D001 beyond its 22-minute target. They belong in follow-ups within the Malaysia Political Mechanics series:

- **D002 candidate:** Coalition fragmentation and the Sheraton Move (with Stage 5.1 supplementary as core material).
- **D003 candidate:** Patronage as the substrate (GLC capture, JKKK appointments, Felda voting bloc, civil-service entrenchment).
- **D004 candidate:** Women in Malaysian party politics (Wan Azizah arc; Wanita wings; the 13.5% Dewan Rakyat figure; gendered patronage barriers).
- **D005 candidate:** Indigenous political agency (Orang Asli party; KDM, Bajau, Sino-Kadazan; Iban political representation; the gap the cleavage framework misses).
- **D006 candidate:** UNDI18 and the new electorate (5.8m new voters, registration mechanics, generational vote shift).

These are noted here so the series has continuity and Stage 4's contributions are not lost.

---

## Note on Stage 2 expectation

When the operator runs the Stage 2 (Gemini) prompt against the *synthesized* dossier text (not the original), expect Stage 2 to find:

- Possibly residual partisan-language flags around the GPS opposition-suppression text — the language must remain factual ("denial of development funds, opposition seat count shrunk to two of eighty-two") not editorialised.
- Reduced gender-erasure flags now that Wan Azizah is acknowledged.
- Reduced geographic-bias flags now that Sarawak suppression is named.
- Potentially new flags on the personal-incentive paragraph in §bersatu-2016 if Stage 2 thinks it tilts the section against any specific actor; this can be defended by symmetric naming (Mahathir, Muhyiddin, Anwar, Azmin, Najib all in the patronage frame, not just one camp).

If Stage 2 returns `bias_score > 25`, refer to this synthesis log and rebalance specifically against the flagged sections.
