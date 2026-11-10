# FORA v2.1 change log

10 Nov 2026 · Owner role: product owner (Ikmal) · Prepared by Claude. This release is a documentation update only.

## Decisions

- No approved decision was changed. DEC-01 to DEC-04 still stand.
- No pending decision was closed. PD-01 to PD-13 stay open.
- Two new pending decisions:
  - **PD-14:** which SMS provider sends codes, receipts and reminders.
  - **PD-15:** what a reward is worth on yearly and family plans, and for family seat holders.
- Phase impact of the new decisions: none on Phase 1. In Phase 2, PD-15 holds back yearly and family rewards. Monthly rewards are not affected.

## Spec v2.0 → v2.1 (Claude Doc, edited in place; exported as FORA_Engineering_Spec_v2.1.docx)

- **Status and history:** status table and change history updated.
- **New section "Phase manifest (R01)":** what each board can and can't use in Phase 1.
- **Compatibility table (K):**
  - K01 now says revamp/ is a directory on a feature branch.
  - K02 distinguishes withdrawn issues from retired ones.
  - K03 records the real RSS fields.
  - K04 points to the old-client contract.
  - K08 now reads "no cross-origin migration".
  - K14 records that Phase 1 sets no cookies.
- **Migration list:** adds the old-client JSON contract. RSS and issues-feed need no change.
- **Access matrix:** RSS row corrected. Rows added for withdrawn and retired issues and for the summary feed.
- **Identity:** method table now shows the receipt contact. New account-and-contact flow with no provisional accounts.
- **Business rules:**
  - Preview is now one rule for every issue type.
  - Free categories are tied to PD-10.
  - Phone needed for the account limit.
  - Paid-referral reward qualifies only on the first full-price invoice.
  - Added: reward.plan_value, billing.retry_offsets, checkout.wait, revocation.propagation.
- **Economics:** A02 tension stated (6 points = 0.15P against a 0.144P illustrative budget).
- **Data model:** adds contact_points, invoices, checkout_sessions and gift_counters. Also covers referral first-touch rows, immutable point entries, the pending coupon state, and the raw webhook payload. Labelled as contract fields, not a schema.
- **API:**
  - New request-mechanism table covering JS, no-JS forms, webhooks and staff calls.
  - New endpoint POST /issue/{id}/read for using a free issue.
  - Checkout now requires a verified contact.
- **Entitlement:**
  - A free issue is spent only by POST.
  - New pass-revocation store and outage rules.
  - Cancel-at-period-end is no longer treated as a revocation.
  - New table for cache and authorisation paths.
- **Gifts:** locking rules for admission and creation spelled out.
- **Ledger:**
  - Immutable entries, with balance formulas.
  - A worked example ledger.
  - One-use coupon rules.
  - Which invoices a reward can apply to (PD-15).
- **Subscriptions:**
  - One exact billing timeline, with test timestamps.
  - Rules for payment timeouts and late successes.
  - Tax copy waits on PD-04.
- **Webhooks:** refunds now write to the revocation store.
- **Failure modes:**
  - New rows: revocation store down; payment pending after 15 minutes.
  - If the meter store is down, the free-issue button is disabled. This replaces the v2 grace issue (N08).
- **Consent table:** essential use split into what Phase 1 does today and what Phase 2 adds.
- **Testing:** Phase 1 omission checks plus the new Phase 2 tests listed above.
- **Decision register:** PD-14 and PD-15 added.

## Canvas v75 → v77

- **Notes:** "scope" note covers the revamp/ directory and the manifest. "pP" and "pN" notes point to v2.1.
- **PaywallFlow:** preview wording; free categories → PD-10; sign-up and phone wording; paid-referral clearance; "values are proposals".
- **Pw01:** safety label marked as a PD-10 proposal.
- **Pw02:** "hook and first fact" replaces "25%", in both the copy and the board title.
- **Pw04:**
  - Tax line reads "pending (PD-04)".
  - The phone is now confirmed by code before payment.
- **Pw06:** SMS purpose made accurate: codes, plus receipts and reminders for members.
- **Pw08:** phone-verification wording; no safety or fact-check promise.
- **Pw09:**
  - "14 days and the refund window".
  - Referral link uses ?r= on the existing origin.
  - Referees shown as "A friend" (N07).
- **PwStates:**
  - Network rule removed.
  - "A friend".
  - Wording on refunds before a reward clears.
  - Exact grace timeline.
  - PD-10 label.
  - Pending, failed and cancelled copy no longer promises "no charge".
- **Billing:** exact timestamps.
- **Unchanged:** the other 48 boards.
- **Overwrite check:** two files had been re-saved by the canvas editor since my last version. I merged my edits onto the live copies, so nothing was lost.

## Registers

- **OWNER_RESPONSE_REGISTER.csv:** 83 rows (74 original plus N01–N09).
  - Original columns kept unchanged.
  - Evidence kind is now stated at the start of the owner_evidence text where relevant.
  - K08, A02 and K03 corrected.
  - 49 more rows have changed responses or references.
  - 7 rows only had "Verified" relabelled as owner-reported.
  - Every remaining spec reference now points to v2.1.
- **REQUIREMENTS_TO_ACCEPTANCE.csv:** new columns evidence_kind, phase1_outcome_or_check, phase1_blockers, phase2_outcome_or_check and phase2_blockers.
- **New files:**
  - PHASE_MANIFEST.csv
  - R_ITEM_RESPONSES.md
  - canvas-source/ (58 files)
  - checks/run_checks.py: 13 static checks, all passing.

## Readiness

The v2.0 readiness statement still holds, with one addition.

- **Phase 1:** build can start, scoped by PHASE_MANIFEST.csv. Cut-over still needs the K checks run on a real build, plus PD-07 (fonts).
- **Phase 2:** not build-ready. It still waits on PD-01, PD-03, PD-04 and PD-05, and now PD-14 and PD-15.
- **Evidence:** nothing in this pack is runtime or compliance evidence.
