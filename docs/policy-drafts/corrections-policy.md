DRAFT — not legal advice — requires review by a Malaysian-qualified lawyer before publication

# Corrections policy: draft

Prepared 8 November 2026. Web sources accessed 8 November 2026.

- **Part A (for the owner, not for publication):** how updates work today, the gaps, and a proposed data structure.
- **Part B (the draft policy):** reader-facing text. `[PLACEHOLDERS]` are for the owner. Response times are proposals for the owner to accept or change.
- **Questions for counsel and the owner:** at the end.

---

## Part A. How updates work today (not for publication)

### A1. The current process

The repository's editorial guidelines ("To update an existing issue") say: edit `src/data/issues/{id}.json`, set `"status": "updated"`, increment `edition`, commit and push. Readers see:

- an "Updated · Edition N" badge on the static issue page (`src/pages/issue/[id].astro:122`);
- an "Edition N" badge in the desktop reader when the edition is above 1 (`src/components/DesktopReader.svelte:367-369`);
- an "Updated" label in feed rows and cards (`src/components/FeedRow.svelte:72-73`, `src/components/MobileCard.svelte:117-118`, `src/components/DesktopCard.svelte:90-91`).

The only public statement on corrections is one line on `/disclaimer`: "Errors are corrected in updated editions. Report concerns to thefourthangle@proton.me" (`src/pages/disclaimer.astro:104`).

### A2. Gaps found in the data (checked 8 November 2026)

1. **No record of what changed.** The `Issue` type has no field for a change history (`src/data/issue-types.ts:17-51`), and none of the 1,060 issue files has one. A reader cannot tell whether "Edition 3" fixed a typo or reversed a finding.
2. **How many issues this affects.** Of 92 published issues, 36 are past edition 1: 15 at edition 2, 18 at edition 3 and **3 at edition 4** (0154, 1102, 1229). The earlier audit's "up to edition 3" understates it by one edition.
3. **Inconsistent labelling.** Published issue 1043 is at edition 2 but has `status: "new"`, so it shows no "Updated" label.
4. **Retractions are invisible.** 41 issue files are marked `retired: true` because their central premise was found false. Retired issues are left out of the build, and `/issue/{id}` returns a 404 (`src/data/issue-types.ts:37-50`). If any of them was ever public, someone who read or shared it has no way to learn it was withdrawn. The local clone is shallow, so its history cannot show whether any retired issue was published; a full clone can.
5. **Old editions cannot be verified.** `public/signatures.json` keeps one fingerprint per issue, for the current edition only. Once an issue is updated, a shared screenshot of the earlier edition no longer matches anything on `/verify`.
6. **No response times or reporting route** beyond the one email address.

### A3. Benchmark

The International Fact-Checking Network's Code of Principles, commitment 5 ("Open & Honest Corrections Policy"), expects signatories to "publish their corrections policy and follow it scrupulously", to make the policy easy to find, to define clearly what it does and does not cover, and, when credible evidence shows a mistake, to correct it openly so that readers of the original see the corrected version. Source: https://ifcncodeofprinciples.poynter.org/the-commitments (accessed 8 November 2026). T4A is not a signatory; the commitment is a useful yardstick.

### A4. Proposed data structure

Add an optional `changelog` array and an optional `retraction` object to `src/data/issues/{id}.json`, and render them in the reader and on the static issue page:

```json
"changelog": [
  {
    "edition": 2,
    "date": "2026-11-12",
    "type": "correction",
    "cards": [2],
    "note": "Illustrative: Card 2 said RM2.4 billion vanished. The source report says up to RM2.4 billion is unaccounted for."
  }
]
```

```json
"retraction": {
  "date": "2026-11-12",
  "note": "We withdrew this issue because its central claim was wrong: ... "
}
```

Supporting changes (engineering, for a separate task):

- `scripts/validate-issues.mjs`: when `edition` is above 1, require one `changelog` entry per edition above 1, and require `status: "updated"`. Allowed `type` values: `correction`, `clarification`, `update`.
- Build: for a retired issue with a `retraction` object, generate a retraction page at `/issue/{id}` instead of a 404.
- Signatures: keep one fingerprint per edition, so `/verify` can say "this is edition 2; edition 3 corrected card 2".
- Feed: show "Corrected" (instead of "Updated") for 14 days after a `correction` entry.
- Backfill: for the 36 published issues past edition 1, rebuild the history from a full clone (`git log -p -- src/data/issues/{id}.json`). Where that is impossible, add one honest line: "Changes before [DATE] were not logged."

### A5. How corrections map to the editorial pipeline (internal)

The editorial guidelines already require every synthesis change to be tagged `CORRECTED`, `REPHRASED` or `INTRODUCED (self-verified)`, and lists four "cardinal sins": overclaim, underclaim, misleading framing and unverified detail. The draft policy uses those same four as the definition of an error that needs a correction, so the public promise and the internal standard match. A correction should re-run the fact verification and synthesis review stages on the changed cards only, with the result saved alongside the original stage outputs in `engine/output/`.

### A6. Legal note

Under the Defamation Act 1957 (Act 286), s.7 (unintentional defamation) lets a publisher make an "offer of amends" that includes a suitable correction and apology, with procedural requirements including an affidavit, and s.10 allows an apology to be given in evidence in mitigation of damages. This was read only in an OCR reproduction at https://lawplayer.com/my/act/act-286 (accessed 8 November 2026), which warns that its text may contain errors. **Counsel must check the official text.** The practical point: wording a correction about a named person can carry legal consequences, so the policy routes those cases to counsel before publication.

---

## Part B. Draft policy (reader-facing)

> Style: plain English, no em-dashes. Remove `[PLACEHOLDERS]` before publication.

# Corrections policy

Last updated: [DATE].

## Our standard

Every number, date, name, law and quote in a T4A issue should trace to a primary source: an official document, a court ruling, a regulator's publication, a peer-reviewed study, or a named news outlet citing one. Before publication, every issue goes through 4 independent review stages: primary analysis, a bias audit, fact verification and a synthesis review. Higher-risk issues get a fifth, a contrarian stress test.

Review catches a lot. It does not catch everything. When we get something wrong, we fix it in the open and say what we changed.

## What we count as an error

We correct an issue when it contains any of these:

- **A wrong fact:** a number, date, name, quote, law or section number, or attribution that the source does not support.
- **An overclaim:** a claim stronger than the evidence. For example (illustrative), "RM2.4 billion vanished" when the source says "up to RM2.4 billion is unaccounted for".
- **An underclaim:** a claim weaker than the evidence. For example, "some have alleged" when a court has ruled.
- **Misleading framing:** facts that are each accurate but, as selected or ordered, leave a false impression.
- **An untraceable detail:** a specific we cannot trace to a source.

We do not change an issue because someone dislikes its conclusion. We change it when the evidence shows it is wrong.

## Four kinds of change

| Label | When we use it | What you will see |
|---|---|---|
| **Correction** | We published an error of the kinds listed above | A new edition, a changelog line saying what was wrong and what it says now, and a "Corrected" label in the feed for 14 days |
| **Clarification** | The facts were right, but the wording could be misread, or context was missing | A new edition and a changelog line |
| **Update** | Something happened after publication (a ruling, new data, an official response), or we added sources to an older issue, and nothing we published was wrong | A new edition and a changelog line |
| **Retraction** | The central claim of the issue is wrong | We withdraw the issue. A retraction notice stays at the same web address and explains what was wrong. We do not rewrite a false premise into a different story |

Spelling, punctuation, layout and broken-link fixes that do not change meaning are made without a new edition.

## How you will see a change

- **A changelog line for every edition.** Under the headline and at the end of the issue, one line per edition, newest first. An illustrative example (not a real correction):
  *Edition 3 · [DATE] · Correction: Card 2 said RM2.4 billion vanished. The source report says up to RM2.4 billion is unaccounted for.*
- **A public corrections log.** Every correction, clarification and retraction is listed at [/corrections], newest first.
- **Earlier editions stay checkable.** Each edition keeps its own fingerprint, so a screenshot of an older edition can still be checked at [/verify], which will tell you that a newer edition exists.
- **Review scores follow the latest edition.** When a correction changes a card, the corrected text goes back through review, and the scores shown are for the current edition. The changelog line says if the scores changed.
- **Notifications.** We do not send extra notifications for corrections. [OWNER: decide whether to send one for the retraction of an issue that was sent as a notification.]

## How to report an error

Email [CORRECTIONS EMAIL] with:

1. the issue number or link;
2. which card (1 to 7) or the headline;
3. what you think is wrong;
4. your source, if you have one (a link or document);
5. whether you are the person or organisation named in the issue, so we can prioritise.

You do not need to give your name. We do not publish the names of people who report errors unless they ask us to.

Legal complaints, such as a claim of defamation, should go to [LEGAL NOTICE ADDRESS] so they reach the right person quickly.

## How fast we respond

These are targets, not guarantees. "Working days" means Malaysian working days.

| Type of report | We acknowledge within | We decide within | If we agree, the fix is live within |
|---|---|---|---|
| **Urgent:** a claim that could wrongly harm a named person, a claim touching race, religion or royalty, or a safety risk | 1 working day | 2 working days | 1 working day after deciding. If we cannot check the claim quickly, we take the card, or the whole issue, down while we check |
| **Substantive:** a wrong fact that changes what a card says | 2 working days | 5 working days | 2 working days after deciding |
| **Minor:** wording, missing context, small slips | 5 working days | 10 working days | 14 days, usually in the next edition |

We reply to the person who reported the error with what we decided and why.

[OWNER: confirm these targets are realistic for current staffing. Missing a published target costs more trust than publishing a slower one.]

## How corrections go through review

A correction is a new edition, and new text gets the same scrutiny as the original:

- **Fact verification:** every changed claim is checked against a primary source. If the claim touches race, religion or royalty, it needs two independent primary sources, or we drop it.
- **Synthesis review:** we check that the fix does not introduce a new error or tilt the balance of the issue.
- **A record of every change:** internally, each changed sentence is logged as corrected, rephrased or newly verified, with its source.
- **Errors we find ourselves count too.** If review finds an error in a published issue that no reader reported, we correct it under this policy.

If we cannot verify a claim within reasonable effort, we remove it or soften it to what the evidence supports. A delayed fix is better than a confident wrong one.

## What we will not do

- Change a published claim without saying so.
- Delete an issue to hide a mistake. Retractions stay visible.
- Treat a complaint differently because of who made it, or which side of politics it comes from.

## Contact

- Corrections: [CORRECTIONS EMAIL]
- Legal notices: [LEGAL NOTICE ADDRESS]
- Everything else: [CONTACT EMAIL]

---

## Questions for counsel and the owner

1. **Defamation exposure of correction wording.** Should every correction or retraction that concerns a named individual be cleared by counsel before publication? Could a public correction note be treated as an admission, and how should it be coordinated with an offer of amends under s.7 of the Defamation Act 1957 or an apology under s.10? (Text read only in an OCR reproduction; please check the official Act.)
2. **Retraction notices.** A notice must say what was wrong without repeating the false claim. What wording limits the risk of republishing it? Should the original text of a retracted issue stay accessible anywhere?
3. **Take-down while checking.** Is the proposal to take down a card or issue while an urgent complaint is checked the right default, and does taking it down carry its own risk (for example, being read as conceding the point)?
4. **Response-time promises.** Should the targets be framed as "we aim to" to avoid creating enforceable obligations?
5. **Malaysian Media Council Act 2025.** The Star reported that this Act came into force on 14 June 2025 and that the Council will act "as a channel for the public to voice complaints against the media" (https://www.thestar.com.my/news/nation/2025/06/13/media-council-act-2025-takes-effect-june-14-same-day-as-national-journalists-day, accessed 8 November 2026). Does it reach T4A, which describes itself as an analysis platform and "not a licensed news outlet" (`src/pages/disclaimer.astro`)? If T4A joined or fell under the Council, would its code or complaints process require changes to this policy? (Not researched beyond the news report.)
6. **Past editions.** For the 36 published issues already past edition 1 with no record of what changed, is a line saying "changes before [DATE] were not logged" enough, or should T4A reconstruct and publish each change from its version history?
7. **Retired issues.** For the 41 retired issues, if any was ever public, should T4A now publish retraction notices at their old addresses?
8. **Language.** Should this policy also be published in Bahasa Malaysia? (Not a PDPA requirement; the owner's choice.)
