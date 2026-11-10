# FORA browser assessment — findings and limits

10 November 2026 (MYT). Phase 1 only, feature branch codex/t4a-revamp. Final totals are in BROWSER-RESULTS.md once the runs complete.

## Confirmed corrections

1. Empty mobile Saved tabs referenced a missing tabpanel. The panel now exists in the empty state. The screen-reader heading also identifies Saved/Reading rather than saying the library is empty when it contains issues.
2. Opening an issue from mobile search left Search as a second h1. The background heading now follows the same heading-level rule as other surfaces.
3. OpinionBar animation frames continued after their reader unmounted and could read a null issue during Back navigation. The frames are now cancelled and guarded on destruction.
4. Angle Code did not move focus into its dialog, contain Tab navigation or close on Escape, and lacked a close control. It now uses a native modal dialog, an explicit Close button, focus cycling and focus return.
5. Feed keyboard handlers could treat Enter on another control as an instruction to open a story. Both mobile and desktop feed shortcuts now respect interactive controls and handled events.
6. Latest could render while a URL rewrite removed ?feed=latest. Canonical surface URL construction now preserves the selected feed.
7. Stored reading position could override an explicit Saved/search/Latest destination. Explicit destinations now take priority while keeping the saved position in storage.
8. Entering a story reset that story's stored card position to zero. Initial navigation now preserves an existing position for the same story.
9. A mobile feed IntersectionObserver could replace the saved card position just because a search row became visible. Search browsing no longer writes that position, and feed browsing preserves an in-progress card position.

## Test-harness corrections, not product defects

- The generic static server preferred the /infographics/ directory over /infographics.html and falsely returned 404. The isolated test server now resolves the actual generated clean-URL file first. Production-origin routing is still an independent check.
- New test selectors initially assumed a desktop result counter on phones, assumed Saved opened Highlights by default, and treated native Sources/Changes summaries as headings. They were corrected to follow the existing intended controls and assert their actual behavior.
- A filter URL was sampled before its documented debounce completed; the test now waits for the URL before recording it.
- The breakpoint test initially measured before the debounced shell resize completed. It now retries the settled geometry within three seconds, without relaxing the geometry assertion.
- The old-app upgrade fixture needed generated hero variants. Nine responsive variants for issue 1976, produced from the same canonical art with the unchanged responsive-art pipeline, were supplied. The baseline application source is the unchanged root source; the upgrade check is not a visual baseline comparison.
- One regression attempt was stopped after its served output was rebuilt during the run. That attempt is excluded from final totals. The final build's SHA-256 manifest is compared before/after verification so a result cannot silently mix builds.

## Scope limits

The broad matrix is Chromium browser automation with emulated viewport/touch settings. It is not physical hardware, Safari/iOS certification or a proof for every possible viewport. Root-font enlargement is not browser chrome zoom. Screenshots are captures for review, not approved pixel-diff baselines. Axe thresholds and exclusions are described in BROWSER-TESTING.md.

The independent local matrix blocks external services and service workers. Existing tests separately cover local service-worker handling and mocked sync contracts. Real worker opt-in, preview response headers/caching and actual-device interactions require the hosted preview. Production signing credentials and Cloudflare preview credentials remain absent.

Firefox and WebKit executables are missing. Official Playwright downloads returned HTTP 403 Domain forbidden. The cloud-environment onboarding draft now preserves existing domains and adds cdn.playwright.dev and playwright.download.prss.microsoft.com, with current startup/test instructions. This draft is saved, not applied or published. The tool requires the user to review/save the settings and publish the environment before treating the reusable configuration as activated. No network bypass was attempted.
