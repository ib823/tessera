# FORA v2.1 — Responses to follow-up items R01–R09

10 Nov 2026 · Owner role: product owner (Ikmal) · Prepared by Claude as design and engineering document owner.

This pack contains documentation changes only. No implementation, deployment or outreach was done.

## References

- **Spec**: "FORA Engineering Spec — Paywall, Gift & Earn and T4A compatibility (v2.1)". Exported as FORA_Engineering_Spec_v2.1.docx.
- **Canvas**: the FORA design canvas, version 77. Its board sources are in canvas-source/.
- **Checks**: checks/run_checks.py. These are static scans of the design source files, not runtime tests. All 13 checks pass. A mutation test confirms they fail when old copy is put back.

## Summary of outcomes

| Item | Verdict on the reviewer's point | Status | Remaining decision |
|---|---|---|---|
| R01 | Confirmed | Updated and reconciled | PD-12 (Following, newsletters, bylines, BM) |
| R02 | Confirmed (all 6 rows) | Updated and reconciled; open values labelled with their PD number | PD-03, PD-04, PD-10 |
| R03 | Confirmed | Updated and reconciled | Values are proposals; the convention is fixed |
| R04 | Confirmed | Updated and reconciled; provider scope pending | PD-14 (new), PD-03, PD-05 |
| R05 | Confirmed | Updated and reconciled | Edge store choice (engineering) |
| R06 | Confirmed | Updated; the yearly/family value is pending | PD-15 (new) |
| R07 | Confirmed | Updated; provider-dependent parts labelled | PD-03 |
| R08 | Confirmed | Updated and reconciled; consumer inventory is a planned engineering task | — |
| R09 | Confirmed | Register and acceptance map corrected | A02 economics with Ikmal (PD-01) |

I found no reviewer error to refute in R01–R09. The reviewer's billing arithmetic, the RSS reading and the reading of K08 and A02 are all correct.

---

## R01 — Phase 1 scope is now portable

**Disposition.** Confirmed. The phase rules depended on canvas metadata that the exported PDFs do not carry.

**What changed**

- **PHASE_MANIFEST.csv** (57 rows). It lists every board, its page, its phase tag, its Phase 1 use, the components that are not in Phase 1, and the substitution or omission for each.
- **Spec section "Phase manifest (R01)"** sets the cross-board rules:
  - Bottom nav is Top stories, Latest, Saved. Following returns to slot 3 only if PD-12 approves it.
  - Omitted in Phase 1: brief, newsletter, Most read, bylines, live labels, ad slots and membership UI.
  - Alerts are limited to the existing push, with its schedule of no more than 3 a week (Tue/Thu/Sat), per repo CLAUDE.md.
  - About and Corrections copy comes from T4A's existing pages. The board text is illustrative.
  - Language links: only the ones T4A has today.
- **K01 wording.** It now says "revamp/ directory on a separate feature branch (currently codex/t4a-revamp)". The same wording is in the canvas "scope" note.

**References.** Spec: Phase manifest (R01); K01. Canvas: "scope" note. PHASE_MANIFEST.csv.

**Acceptance.** check R01 (every board is tagged and listed in the manifest) passes. Planned: a Phase 1 build test confirming none of the omitted components appear.

**Owner.** Ikmal for PD-12. Engineering lead for the build check.

**Related new finding.** N09: the 10b reader's Highlight action is kept only if T4A already has that feature. Engineering confirms against the current code.

## R02 — Paywall copy reconciled with the rule tables

**Disposition.** Confirmed: all six differences were real. Each one is now either aligned with the spec or labelled as a proposal with its PD number.

| Difference | Fix | Where |
|---|---|---|
| "first 25%" / "25% shown" | Preview is "hook and first fact" for every issue type; there is no separate long-form rule | PaywallFlow, Pw02 (copy and board title); spec preview.content |
| Safety and fact-check content promised as always free | Wording changed to "Corrections, sources and change logs". Any category label now says "proposal, pending PD-10". PD-10 itself stays open. | Pw01, Pw08, PwStates, PaywallFlow; spec free.always |
| "Verify phone or email" leads to 2 free issues | Account by any method; a verified phone is needed for 2 a week | PaywallFlow, Pw08; spec meter.account_limit |
| "stays 14 days" / "After 14 days with no refund" | "14 days and the refund window" (the window depends on PD-03) | PaywallFlow, Pw09; spec reward.paid_referral |
| Rule caption "device, network or card match" | "same account, phone, device or card · a shared network only raises the risk score" | PwStates |
| "Includes SST" | "Tax: pending (PD-04)" | Pw04; spec payments paragraph |

**Acceptance.** Six R02 source checks pass.

**Owner.** Ikmal for PD-03, PD-04 and PD-10. Until those are decided, the screens are not final copy.

## R03 — One exact billing timeline

**Disposition.** Confirmed. v2's configuration said retries came 2, 4 and 7 days after failure, while its example used calendar dates 2, 4 and 7 Dec. The C08 acceptance row also said "end of 8 Dec", which is wrong.

**Fixed convention**

- **Timezone.** Asia/Kuala_Lumpur (UTC+8, no daylight saving).
- **Offsets.** Elapsed 24-hour days.
- **T.** The renewal attempt at period_end.
- **Retries.** At T+1, T+3 and T+6 days.
- **Grace end G.** T+7 days, exclusive.

**Worked example.** T = 2026-12-01T00:00:00+08:00. Retries run on 2, 4 and 7 Dec at 00:00. G = 2026-12-08T00:00:00+08:00. If payment succeeds before G, the new period starts at T.

**What changed**

- The spec's billing timeline table, plus config keys billing.retry_offsets and billing.grace_days.
- Billing board copy: "until 8 Dec, 00:00 MYT (the end of 7 Dec)", "Past due · access until 8 Dec, 00:00".
- PwStates caption: "Failure T = 1 Dec 00:00 MYT · retries T+1d, T+3d, T+6d · grace ends T+7d (exclusive)".
- C08 acceptance row.

**Acceptance (planned).**

- Entitled at 2026-12-07T23:59:59+08:00.
- Not entitled at 2026-12-08T00:00:00+08:00.
- Retries scheduled at the three timestamps, ±5 min.

The R03 source check passes.

## R04 — Account, contact and endpoint request rules

**Disposition.** Confirmed.

**What changed**

- **Request-mechanism table.**
  - JavaScript requests: CSRF token and Idempotency-Key sent as headers.
  - No-JS HTML forms: hidden _csrf and _idem fields that the server generates for each form render.
  - Provider webhooks: exempt from cookies and CSRF. They are authenticated by signature and deduplicated by gateway_event_id.
  - GET never changes state.
  - The spec lists the six required no-JS forms.
- **Account and contact flow.** There are no provisional accounts.
  - A new reader verifies a contact (an SMS code by default, or email, Google or Apple) before checkout. That verification creates the account.
  - The RM 1 trial needs a verified phone. Other plans can be bought with a verified email only.
  - Receipts and reminders go to the verified contacts: SMS for a phone, email for an email address.
- **Contact storage.** New contact_points table: deliverable addresses, encrypted at rest. identities keeps hashes for matching only.
- **SMS provider.** One provider sends codes, receipts and reminders. That provider is a new pending decision, PD-14. P6 copy is changed to say the number is used "for sign-in codes and, if you become a member, receipts and renewal reminders". P4 says the number is confirmed by code before payment.

**References.** Spec: API surface "Request mechanism (R04)"; "Account and contact flow (R04)"; Data model (contact_points, checkout_sessions, invoices). Canvas: Pw04, Pw06.

**Remaining.** PD-14 (SMS provider), PD-03 (gateway capabilities), PD-05 (disclosures), and E19 (recycled numbers, merges, invitations).

**Acceptance (planned).** An authorisation and CSRF test matrix per caller type. A no-JS form test for each of the six forms. Notification routing tests by contact type.

## R05 — Pass revocation, access states and caching

**Disposition.** Confirmed. v2 said "never after a refund or cancellation", which contradicted access continuing to the period end, and it had no revocation mechanism.

**Revocation (what changed)**

- A replicated edge **revocation store** maps account_id to min_entitlement_version.
  - Billing writes it on refund, chargeback, a fraud decision or account deletion.
  - The edge reads it on every full-variant request. That is a key-value read, not a database call.
  - Target propagation is 60 s or less, depending on the store chosen.
- **Cancel-at-period-end is not a revocation.** valid_until ends access at exactly the period end.
- **New purchases** take effect immediately, because activation issues a fresh pass.
- **Outages.** If the entitlement service is down, the 24-hour stale-if-error grace applies only when the revocation store is reachable and has no newer entry for the account. If the revocation store is also down, only unexpired passes (15 minutes) are honoured.

**Caching and free issues (what changed)**

- A **cache and authorisation table** covers preview, free issue, member, gift and verified crawler.
- Only the anonymous preview is shared-cached, keyed by path and edition.
- Any request carrying a session cookie, a pass or a `g` parameter bypasses the cache.
- Every response that contains locked cards or personal state is `private, no-store`.
- A free issue is spent only by POST /issue/{id}/read. This is a plain button, so it works without JavaScript. GET requests never spend a free issue, so link previews, prefetching and crawlers can't use up a reader's allowance.
- Design follow-up: the "Use a free issue" button state for a reader who still has credits is specified in the spec but not yet drawn on P2.

**References.** Spec: "Access pass and revocation (E05, R05)"; "Cache and authorisation path"; "Decision vocabulary (E04)"; Webhook handling; Failure modes rows 1–3.

**Acceptance (planned).**

- A refund is enforced at the edge within 60 s.
- Access is denied at valid_until.
- Chaos tests run with the entitlement service down, and with both it and the revocation store down.
- A cache isolation test across two readers.
- No GET request ever writes to meter_usage.

**Related new finding.** N08: v2 gave readers one grace issue while the meter store was down. That cannot be reconciled with POST consumption, so the free-issue button is now disabled in that state.

## R06 — Financial invariants

**Disposition.** Confirmed. All four questions are answered, and the fourth is left with Ikmal as a new decision.

1. **Reward value by plan.**
   - Monthly plan (proposal): a free month makes the next full-price invoice RM 0; half price makes it 50%.
   - Coupons never apply to the RM 1 trial invoice.
   - A free account's coupons stay queued until its first full-price invoice.
   - Yearly and family invoices, and seat holders who do not pay their own invoice, are **PD-15 (new, pending)**. Their coupons stay queued until that is decided.
   - A paid-referral reward applies only to the referee's first full-price invoice, once per referee (idempotency key paid:{referral_id}).
2. **One-use rules.** Invoice finalisation runs as one transaction:
   - lock the subscription row;
   - lock the queued coupons FOR UPDATE, in precedence order;
   - count the rolling 365-day cap under the same lock;
   - apply the coupon with a conditional update (state = queued);
   - a unique index on coupons.applied_invoice prevents a second coupon on the same invoice.
   Gifts are also serialised: the gift row is locked during admission, and a gift_counters row is locked during creation.
3. **Ledger semantics.**
   - Entries are immutable. A `clear` is a zero-amount marker naming the earn and its month.
   - The spec gives formulas for pending, cleared(M) and carry.
   - A worked ledger shows a post-close reversal carried as negative balance.
   - Clear progress is recorded by the clear entries themselves. month_closes tracks only the close job.
4. **Model references.**
   - The coupon enum now includes `pending`.
   - payment_events stores the raw payload, encrypted. Its retention period follows PD-05.
   - Referral rows are created at first touch, so pre-sign-up reads already have a stable referral_id.
   - The data-model table is labelled as contract fields, not a full schema. The spec stays the authority until a schema file exists.

**References.** Spec: "Entries are immutable (E09, R06)", ledger table, Worked ledger, "One-use rules (R06)", "Which invoices (PD-15)", Gift links (Admission, Creation), Data model.

**Acceptance (planned).** Reproduce the worked ledger exactly. Test one coupon per invoice and one invoice per coupon under concurrency, the rolling cap, and concurrent gift admission and creation.

## R07 — Payment timeout and late success

**Disposition.** Confirmed. The "no charge" wording was not supported.

**What changed**

- **Session states.** checkout_sessions move through: created → pending → succeeded, failed or cancelled. Only the provider can set a final state. FORA's own states are expired_unconfirmed and superseded.
- **15-minute wait.** After 15 minutes the page stops waiting and asks the provider to cancel, where the provider supports that.
- **"No charge"** is only said when the provider reports failed or cancelled.
- **Late success** after the timeout still activates the membership, unless another session for the same period already succeeded. In that case the later payment is refunded automatically.
- **Switching payment method** supersedes the earlier session.
- **When cancellation and settlement race,** the provider's final status wins, and daily reconciliation fixes any mismatch.
- **PwStates copy:**
  - Pending: "If your bank confirms after we stop waiting, your membership still starts."
  - Failed: "Your bank reported the payment as failed."
  - Cancelled: "The payment was cancelled before it completed."

**Remaining.** Everything that depends on provider behaviour is labelled PD-03.

**References.** Spec: "Payment timeout and late success (R07)", Failure modes. Canvas: PwStates.

**Acceptance.** Planned: expired_unconfirmed followed by a late success; a duplicate payment refunded after a method switch. The R07 source check passes.

## R08 — Current baseline and old-client migration

**Disposition.** Confirmed.

- **RSS.** src/lib/rss.ts sends title, link, guid, context, date and lens categories, with no card text. The access matrix, K03 and the migration list are corrected, and Phase 2 needs no RSS change.
- **issues-feed.json** already carries no card text.
- **Withdrawn and retired issues** are now told apart, per the repo's CLAUDE.md and build-issues-json.mjs:
  - withdrawn: the page stays, with a notice, the change log, noindex and no reader;
  - retired: 404.
- **Old-client contract.** "A version field" is replaced by a contract:
  - Known consumer: the site's own reader, which fetches /issues/{id}.json.
  - External consumers can't be enumerated, because there is no analytics. Engineering will inventory the workers (notify, social, tfa-sync) and any host logs first.
  - Path, keys and card order stay the same. A locked card carries one fixed public sentence plus `locked: true`, and the file carries schemaVersion 2.
  - Full cards come only from /api/issues/{id}/full.
  - Text already received stays with the reader (accepted limitation).
- **Consent table.** The essential row is split:
  - Phase 1 as today: localStorage only, no cookies, no accounts.
  - Phase 2 additions: device and session cookies, disclosed under PD-05.

**References.** Spec: K02–K04, K14, access matrix, migration list items 2–4, consent table.

**Acceptance.**

- Planned: RSS snapshot against main.
- Planned: the pinned last Phase 1 reader build renders a schemaVersion 2 fixture without errors.
- Planned: schema contract tests for v1 and v2.
- Planned (engineering task): the consumer inventory.

## R09 — Classifications corrected

**Disposition.** Confirmed.

- **K08.** Changed from "Refuted/reviewer error" to "Not applicable/superseded": the question was neutral, and DEC-03 answers it. Evidence kind is owner decision. A deploy-target check is planned, and the K07 tests are still required.
- **A02.** The rationale is corrected. The six points are 5 for sign-up plus 1 for a read, and both values are still in v2.1. Their nominal value of 0.15P exceeds the 0.144P illustrative budget. That tension is now written into the economics paragraph and left with Ikmal (status: Pending decision/dependency).
- **Mixed-phase rows.** The acceptance map now has separate Phase 1 and Phase 2 outcome and blocker columns for every row. C01, C03, F10, K14, K09 and others now show Phase 1 as "no change" with no Phase 2 blockers attached.
- **Evidence kinds.** Every row now carries an evidence_kind. Rows that v2 marked "Verified" are relabelled "Owner-reported design-source check (not independently verified)".
- **D01 and D05.** The executable board sources and check script are supplied (canvas-source/ and checks/). Interactive behaviour needs the published canvas. Production behaviour is untested.
- **K03.** Corrected to "Partly confirmed / Updated and reconciled" (see R08).

**Register totals (83 rows: 74 original IDs plus N01–N09).**

| Verdict | Rows |
|---|---|
| Confirmed | 61 |
| Partly confirmed | 15 |
| Not applicable/superseded | 6 |
| Already specified | 1 |

| Status | Rows |
|---|---|
| Updated and reconciled | 59 |
| Pending decision/dependency | 15 |
| Explicitly deferred | 7 |
| Referenced existing authority | 2 |
