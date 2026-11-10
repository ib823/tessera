# FORA Phase 1 coverage

10 November 2026. Authority: the owner’s v2.1 engineering spec and `PHASE_MANIFEST.csv`, plus the user’s instruction to proceed with the recommended approach. The manifest contains 23 Phase 1 boards, including four visual references; the other 34 boards remain outside this implementation.

This is an adaptation to canonical T4A issues. It does not claim a pixel-for-pixel reproduction of illustrative stories or implementation of all 57 boards. The owner’s prescribed substitutions and omissions apply.

| Owner board(s) | Implemented application surface | Evidence |
| --- | --- | --- |
| Foundations; BrandTokens | Light/dark semantic palette, focus, controls, reduced motion and forced colours | `src/styles/fora.css`; accessibility and text-size suite |
| BrandLogo | Compass and outlined Newsreader lockup; favicon, PWA and share assets | `Logo.svelte`, `UtilityHeader.astro`, `public/`, font provenance and licence |
| Main; DesktopHome | Lead issue, secondary stories, latest rail, capped responsive grid and topic discovery | `TodayView.svelte`; canonical-feed, date, layout, native-link and Back tests |
| Latest | Chronological list, publication-week headings, more-results expansion and URL entry | `TodayView.svelte`, `App.svelte`; chronology, week and Back tests |
| Category; TopicHub | Existing primary-lens taxonomy and crawlable `/topic/*` pages | `pages/topic/[slug].astro`; topic counts, links, sitemap, axe and 200% text tests |
| Search; DesktopSearch | Query in URL, real issue type/topic filters, result list, empty state; desktop filters column | `App.svelte`, `SearchFilters.svelte`, `MobileCard.svelte`; query/filter/reload/Back tests |
| Article; FactCheck; Explainer; DesktopArticle | Visual references only: serif hierarchy, readable measure and existing trust information applied to the issue reader | `DesktopReader.svelte`, `InsightReader.svelte`; no new article schema, byline or newsroom claims |
| IssueReader | Compact phone header, scrollable card area, fixed Back/Highlight/Next, full sources and changes; desktop/tablet full reading view | Real long-card tests at 320/360px and 100%/200% text; keyboard, anchor, no-JS and image-failure regressions |
| Share | Existing share sheet, real-font image export, link copied state and verification copy | `ShareModal.svelte`, `lib/share-card.ts`; share/verification regressions; 592 social cards regenerated |
| Referred | Existing `/issue/{id}#card-N` landing, full canonical issue, metadata and actual topic link | Desktop/mobile reader and SSG issue page; anchor and first-screen prompt tests |
| Saved | Reading progress, saved highlights, archive access and Angle Code entry; no accounts | `MobileDock.svelte`, `App.svelte`, `HighlightsPanel.svelte`; library, migration, highlight and sync-consent tests |
| Alerts | One existing push switch, fixed schedule, browser permission and error states | `NotificationBell.svelte`; alert-panel test; notify worker unchanged. Opt-in service integration still requires deployment-origin validation. |
| About; Corrections | Existing About, policy, corrections, support and accessibility layouts; original body copy retained | Shared policy layout; source text comparison for seven authoritative pages; axe and 200% text tests |
| Error | Existing 404 search/recovery, withdrawn notices/noindex and retired-issue behavior | 404, withdrawal, metadata and public-artifact regression tests |
| States | Existing offline and storage banners, empty lists/search, long text, copy and notification states | Shared tokens; existing state/keyboard suite plus new reflow and alert tests |

Dossiers have no Phase 1 replacement layout board. Their reading structure is retained, with shared typography, navigation and the FORA dark palette; axe and print checks cover the adaptation. Graphics and other existing routes remain reachable. The three primary destinations are **Top stories, Latest, Saved**.

## Deliberate adaptations

- D06 option 1 is selected within the unchanged font budget. The canvas’s full font payload is not shipped. Measurements and hashes are in `FONT-DECISION.json`.
- Real issue context replaces the illustrative newsroom summaries. Original dates, editions, scores, card order, citations and change history remain authoritative.
- Long cards scroll. The reference board’s fixed placeholder clipping is not used to hide text or reduce its size.
- No bylines, live labels, Following, newsletters, briefs, Most read, accounts, membership, paywalls, gifts, ads, new channels or new tracking were added.
- The upstream font licence is preserved verbatim. Only its `github` copyright marker is exempted from stealth scanning, at an exact path and pinned SHA-256. The separate regression rejects changed notices, notices elsewhere and prohibited content. All other stealth terms still apply.

## Review and release boundaries

Local code and build evidence are recorded in `IMPLEMENTATION.md`. A hosted preview, secret-backed signatures, Firefox/WebKit runs and live-origin worker checks are not established by these screenshots or by the owner’s static checks. Production cut-over remains subject to the user’s approval.
