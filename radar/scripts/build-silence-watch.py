#!/usr/bin/env python3
"""Build a focused silence-watch report from the radar issue queue.

The queue is ~88% silence_anomaly entries (events with structural
importance but unexpectedly low coverage). They accumulate across
cycles and become invisible — the curated `top-issues-to-develop.md`
biases toward higher-visibility picks, so genuinely under-reported
items sit unread for weeks. This script extracts them into a separate
ranked report so the curator can see what's been accumulating.

Two tracks are produced from the same candidate pool:

  Accumulated — silence_score × structural_importance × age_factor.
  Age factor saturates at 30 days so a 50-day-old item doesn't dominate.

  Fresh — silence_score × structural_importance, restricted to items
  first seen in the last `--fresh-window` days. The age factor in the
  accumulated track is worth up to 2x, so a story that broke this week
  can never outrank a month-old one no matter how important it is. The
  curator needs both views: what has been quietly compounding, and what
  just landed. Without the fresh track the develop list reads as a list
  of old news.

Outputs:
  radar/output/silence-watch.json   — machine-readable, full detail
  radar/output/silence-watch.md     — human-readable curator brief

Excludes items whose topic words overlap with an already-published
issue (`src/data/issues/*.json`) or a brief in flight
(`engine/briefs/*.md`). The overlap test runs **per document**: a title
must share `COVERAGE_THRESHOLD` significant words with one single issue
or brief. Testing against the union of every published issue's
vocabulary (the previous behaviour) meant any long news headline
collided with the ~2,000-issue corpus on three common words and was
dropped as "already covered" — which silently hid the biggest fresh
stories from the curator.

Near-duplicate titles are collapsed by silence-detector `event_id`
then by 4-word title prefix.

Usage:
  python radar/scripts/build-silence-watch.py
  python radar/scripts/build-silence-watch.py --top 20
  python radar/scripts/build-silence-watch.py --fresh-window 14
"""

import argparse
import json
import math
import re
from collections import defaultdict
from datetime import datetime, timezone
from pathlib import Path

RADAR_DIR = Path(__file__).resolve().parent.parent
REPO_DIR = RADAR_DIR.parent
QUEUE_PATH = RADAR_DIR / "output" / "issue-queue.json"
JSON_OUT = RADAR_DIR / "output" / "silence-watch.json"
MD_OUT = RADAR_DIR / "output" / "silence-watch.md"
PUBLISHED_DIR = REPO_DIR / "src" / "data" / "issues"
BRIEFS_DIR = REPO_DIR / "engine" / "briefs"

STOPWORDS = {
    "the", "a", "an", "of", "and", "or", "to", "in", "for", "is", "by",
    "on", "at", "as", "with", "from", "that", "this", "it", "its", "be",
    "are", "was", "were", "has", "have", "had", "but", "not", "no",
    "yang", "dan", "di", "ke", "dari", "pada", "akan", "atau", "untuk",
    "says", "said", "new", "over", "up", "down", "after", "before", "may",
    "via", "into", "out", "than", "more", "less", "all", "some",
}

# A title must share this many *distinctive* significant words with a single
# published issue or in-flight brief before it counts as already covered.
COVERAGE_THRESHOLD = 3

# Share of a title's distinctive words that must land inside one brief before
# it counts as in flight. Guards the size asymmetry described in
# `_covered_by_any`. Swept against a hand-labelled probe set on the 2026-08-04
# queue (632 candidate titles, 87 briefs): 0.30 admitted 6 of 10 known-bad
# matches, 0.40 lost 3 of 14 known-good ones, and 0.35 was the widest setting
# that held every known-bad out.
INFLIGHT_OVERLAP_RATIO = 0.35

# How much of a brief counts as its topic. Enough to carry the title and the
# opening statement of what the brief is about, short of the CONTEXT timeline
# and the bibliography — see `_brief_topic_text`.
BRIEF_TOPIC_CHARS = 1000

# Words this common across the corpus carry no topical signal — "billion",
# "malaysia", "minister", "government" recur in hundreds of issues, so three
# of them colliding says nothing about whether the story was covered.
COMMON_WORD_RATIO = 0.02
COMMON_WORD_FLOOR = 5

# Scheduled-event placeholders the queue mints every cycle from the
# parliamentary calendar. They carry high structural importance and near-zero
# coverage forever, so they permanently squat the top of the ranking without
# ever being a developable finding.
CALENDAR_STUB_RE = re.compile(
    r"^(parliament|dewan|budget|session)\b[\w\s]*\b"
    r"(session|sitting|opens|opening|presentation|tabling|reading)\b\s*$"
)

# Minimum significant words before a title is a story rather than a topic.
MIN_TITLE_WORDS = 4


def _normalize(text: str) -> str:
    text = text.lower()
    text = re.sub(r"[^a-z0-9\s]", " ", text)
    return re.sub(r"\s+", " ", text).strip()


def _significant_words(text: str) -> set[str]:
    return {w for w in _normalize(text).split() if len(w) > 3 and w not in STOPWORDS}


def _title_prefix_key(title: str) -> str:
    words = [w for w in _normalize(title).split() if w not in STOPWORDS]
    return " ".join(words[:4])


def _age_days(item: dict, now: datetime) -> float:
    """Days since the item was first seen in the queue."""
    for key in ("first_seen", "timestamp"):
        ts = item.get(key)
        if not ts:
            continue
        try:
            dt = datetime.fromisoformat(ts.replace("Z", "+00:00"))
            return max(0.0, (now - dt).total_seconds() / 86400)
        except (ValueError, TypeError):
            continue
    return 0.0


def _age_factor(days: float) -> float:
    """Boost long-accumulated items but cap at 30 days so old items don't dominate."""
    return 1.0 + min(days, 30.0) / 30.0


def load_published_docs() -> list[set[str]]:
    """Significant words per published issue — one word-set per issue.

    Kept per-issue rather than merged: the coverage test compares a title
    against each issue separately, so a title only counts as covered when it
    matches one specific story.
    """
    docs: list[set[str]] = []
    if not PUBLISHED_DIR.exists():
        return docs
    for path in PUBLISHED_DIR.glob("*.json"):
        try:
            data = json.loads(path.read_text())
        except (json.JSONDecodeError, OSError):
            continue
        if not data.get("published"):
            continue
        text = f"{data.get('headline', '')} {data.get('context', '')}"
        words = _significant_words(text)
        if words:
            docs.append(words)
    return docs


def _brief_topic_text(path: Path) -> str:
    """Slug plus the brief's opening prose — what the brief is *about*.

    Matching on the slug alone under-matched badly, because a slug names the
    angle the writer chose rather than the words a newswire uses.
    `factory-fires-compliance-gap` shares two significant words with its own
    radar headline, and `tabung-haji-rci-2017-restatement` shares none with
    "tiada 'sakau' dalam RCI TH" — so both briefs' topics kept resurfacing as
    undeveloped picks while the work was already at Stage 3.

    The opening slice rather than the whole file, because briefs carry a
    CONTEXT timeline and a 15-25 entry bibliography. Matching against those
    would suppress any candidate that merely shares a citation with an
    in-flight brief, which is the opposite and worse failure. Briefs use at
    least three header conventions (`# BRIEF — x`, `# ISSUE 1973 — x`, a bare
    `ISSUE: x` first line), so this takes the opening prose instead of parsing
    for a section that only 52 of 87 briefs actually have.

    Front-matter boilerplate ("slug", "radar provenance", "brief status")
    recurs across every brief and is dropped by `common_words` downstream.
    """
    stem = path.stem.replace("-", " ")
    try:
        head = path.read_text()[:BRIEF_TOPIC_CHARS]
    except OSError:
        return stem
    return f"{stem} {head}"


def load_inflight_docs() -> list[set[str]]:
    """Significant words per in-flight brief — one word-set per brief."""
    docs: list[set[str]] = []
    if not BRIEFS_DIR.exists():
        return docs
    for path in BRIEFS_DIR.glob("*.md"):
        words = _significant_words(_brief_topic_text(path))
        if words:
            docs.append(words)
    return docs


def common_words(docs: list[set[str]]) -> set[str]:
    """Words appearing across enough documents to carry no topical signal."""
    if not docs:
        return set()
    df: defaultdict[str, int] = defaultdict(int)
    for doc in docs:
        for word in doc:
            df[word] += 1
    cutoff = max(COMMON_WORD_FLOOR, int(COMMON_WORD_RATIO * len(docs)))
    return {word for word, count in df.items() if count >= cutoff}


def _covered_by_any(
    title: str,
    docs: list[set[str]],
    stopset: set[str] | None = None,
    threshold: int = COVERAGE_THRESHOLD,
    min_ratio: float = 0.0,
) -> bool:
    """True when the title shares `threshold` distinctive words with one document.

    Per-document, never against the union of all of them: with ~2,000 published
    issues the merged vocabulary matches almost any Malaysian news headline on
    three words, which suppressed genuinely new stories. Corpus-common words
    are excluded for the same reason at a smaller scale — "RM4.21b in factory
    fire losses" and a 2024 flood-cost issue share billion/losses/malaysia
    while having nothing to do with each other.

    `min_ratio` additionally requires that the overlap account for a given
    share of the title's own distinctive words. An absolute count is only
    meaningful when the two sides are of comparable size: a published issue is
    a headline plus context (~20 significant words), but a brief's topic text
    runs to ~77, and against a document that large a long news lede clears
    three shared words by coincidence alone. Measured on the 2026-08-04 queue,
    coincidental matches land at 0.17-0.25 of the title while genuine ones land
    at 0.36-0.56, so the ratio separates them where the raw count cannot.
    """
    words = _significant_words(title)
    if not words or not docs:
        return False
    if stopset:
        words = words - stopset
    if len(words) < threshold:
        return False
    floor = max(threshold, math.ceil(min_ratio * len(words)))
    return any(len(words & doc) >= floor for doc in docs)


def _is_stub(title: str) -> bool:
    """Drop topic keywords and calendar placeholders — not developable findings."""
    normalized = _normalize(title)
    words = [w for w in normalized.split() if w not in STOPWORDS]
    if len(words) < MIN_TITLE_WORDS:
        return True
    return bool(CALENDAR_STUB_RE.match(normalized))


def collect_candidates(queue: list[dict], now: datetime) -> list[dict]:
    """Filter the queue down to developable silence anomalies, deduped."""
    published_docs = load_published_docs()
    inflight_docs = load_inflight_docs()
    published_common = common_words(published_docs)
    inflight_common = common_words(inflight_docs)

    candidates = []
    for item in queue:
        if item.get("detection_type") != "silence_anomaly":
            continue
        sig = (item.get("stream_signals") or {}).get("silence") or {}
        silence = float(sig.get("silence_score", 0))
        importance = float(sig.get("structural_importance", 0))
        # The accumulation problem is below the alert_level=critical threshold,
        # so we use a lower floor here and rely on the rank score to surface
        # the genuinely worrying items.
        if silence < 0.5 or importance < 0.4:
            continue
        title = item.get("title", "") or sig.get("title", "")
        if _is_stub(title):
            continue
        if _covered_by_any(title, published_docs, published_common):
            continue
        if _covered_by_any(
            title, inflight_docs, inflight_common, min_ratio=INFLIGHT_OVERLAP_RATIO
        ):
            continue

        days = _age_days(item, now)
        rank_score = silence * importance * _age_factor(days)
        candidates.append({
            "item": item,
            "silence": silence,
            "importance": importance,
            "age_days": days,
            "rank_score": rank_score,
            "fresh_score": silence * importance,
            "pattern": sig.get("suppression_pattern", "?"),
            "event_id": sig.get("event_id"),
            "news_mentions": int(sig.get("news_mentions", 0)),
            "social_mentions": int(sig.get("social_mentions", 0)),
            "title": title,
        })

    # Dedupe: first by event_id, then by title prefix
    by_event: dict[str, dict] = {}
    by_prefix: dict[str, dict] = {}
    for c in candidates:
        eid = c["event_id"]
        if eid and eid in by_event:
            if c["rank_score"] > by_event[eid]["rank_score"]:
                by_event[eid] = c
            continue
        prefix = _title_prefix_key(c["title"])
        if prefix and prefix in by_prefix:
            if c["rank_score"] > by_prefix[prefix]["rank_score"]:
                by_prefix[prefix] = c
            continue
        if eid:
            by_event[eid] = c
        if prefix:
            by_prefix[prefix] = c

    deduped = list({id(c): c for c in (*by_event.values(), *by_prefix.values())}.values())
    deduped.sort(key=lambda c: c["rank_score"], reverse=True)
    return deduped


def extract_silence_picks(queue: list[dict], now: datetime, top_n: int) -> list[dict]:
    """Top-N accumulated picks: silence × importance × age."""
    return collect_candidates(queue, now)[:top_n]


def extract_fresh_picks(
    candidates: list[dict], top_n: int, window_days: float
) -> list[dict]:
    """Top-N picks first seen inside the window, ranked without the age factor.

    The accumulated ranking cannot surface these: a story three days old
    carries an age factor of ~1.0 against ~2.0 for anything past 30 days, so
    it needs roughly double the silence × importance of a month-old item just
    to draw level.
    """
    fresh = [c for c in candidates if c["age_days"] <= window_days]
    fresh.sort(key=lambda c: c["fresh_score"], reverse=True)
    return fresh[:top_n]


def _pick_payload(pick: dict, rank: int) -> dict:
    return {
        "rank": rank,
        "title": pick["title"],
        "rank_score": round(pick["rank_score"], 4),
        "fresh_score": round(pick["fresh_score"], 4),
        "silence_score": round(pick["silence"], 4),
        "structural_importance": round(pick["importance"], 4),
        "age_days": round(pick["age_days"], 1),
        "suppression_pattern": pick["pattern"],
        "news_mentions": pick["news_mentions"],
        "social_mentions": pick["social_mentions"],
        "event_id": pick["event_id"],
        "controversy_score": pick["item"].get("controversy_score"),
        "bias_dimensions_at_risk": pick["item"].get("bias_dimensions_at_risk", []),
        "timestamp": pick["item"].get("timestamp"),
        "first_seen": pick["item"].get("first_seen"),
    }


def write_json(
    picks: list[dict],
    fresh: list[dict],
    now: datetime,
    queue_size: int,
    fresh_window_days: float,
) -> None:
    payload = {
        "generated_at": now.isoformat(),
        "queue_size": queue_size,
        "fresh_window_days": fresh_window_days,
        "picks": [_pick_payload(p, i + 1) for i, p in enumerate(picks)],
        "fresh_picks": [_pick_payload(p, i + 1) for i, p in enumerate(fresh)],
    }
    JSON_OUT.write_text(json.dumps(payload, indent=2))


def _bucket_pattern(pattern: str) -> str:
    return {
        "HIDDEN_STORY": "zero news, zero social",
        "MEDIA_BLACKOUT": "social only — no news",
        "PUBLIC_BLIND_SPOT": "news only — no social",
        "DELAYED_FUSE": "24h+ silence then rising",
        "NORMAL": "below-expected coverage",
    }.get(pattern, pattern)


def _render_pick(lines: list[str], label: str, pick: dict, show_age_factor: bool) -> None:
    title = pick["title"].strip()
    if len(title) > 110:
        title = title[:107] + "..."
    dims = pick["item"].get("bias_dimensions_at_risk") or []
    dim_str = ", ".join(dims) if dims else "—"
    ts = (pick["item"].get("timestamp") or "")[:10]
    first_seen = (pick["item"].get("first_seen") or "")[:10]
    lines.append(f"\n### {label}. {title}\n")
    if show_age_factor:
        lines.append(
            f"- **Rank score:** {pick['rank_score']:.3f} "
            f"(silence={pick['silence']:.2f} × importance={pick['importance']:.2f} "
            f"× age_factor)\n"
        )
    else:
        lines.append(
            f"- **Fresh score:** {pick['fresh_score']:.3f} "
            f"(silence={pick['silence']:.2f} × importance={pick['importance']:.2f}, "
            f"no age weighting)\n"
        )
    lines.append(
        f"- **Age in queue:** {pick['age_days']:.1f} days "
        f"(source date: {ts or '—'}, first seen: {first_seen or '—'})\n"
    )
    lines.append(
        f"- **Coverage:** {pick['news_mentions']} news, "
        f"{pick['social_mentions']} social — pattern: _{_bucket_pattern(pick['pattern'])}_\n"
    )
    lines.append(f"- **Dimensions at risk:** {dim_str}\n")
    if pick["event_id"]:
        lines.append(f"- **Event ID:** {pick['event_id']}\n")


def write_markdown(
    picks: list[dict],
    fresh: list[dict],
    now: datetime,
    queue_size: int,
    fresh_window_days: float,
) -> None:
    lines = []
    lines.append("# Radar — Silence Watch\n")
    lines.append(
        f"Scan: {now.strftime('%Y-%m-%d %H:%M UTC')}. Queue size: {queue_size}. "
        f"Accumulated picks: {len(picks)}. Fresh picks: {len(fresh)}.\n"
    )
    lines.append(
        "Structurally important events sitting in the radar queue with\n"
        "unexpectedly low coverage. Already-published topics and in-flight\n"
        "briefs are filtered out. Two tracks, because they answer different\n"
        "questions:\n"
    )
    lines.append(
        "- **Fresh signal** (below, first) — what landed in the last\n"
        f"  {fresh_window_days:.0f} days, ranked on silence × importance alone.\n"
        "  This is the track to read when picking what to publish this week.\n"
        "- **Accumulated** — the same score multiplied by an age factor, so\n"
        "  items that have been quiet for weeks rise. This is the track that\n"
        "  catches slow-burn stories nobody followed up.\n"
    )
    lines.append(
        "Auto-generated by `radar/scripts/build-silence-watch.py`. The\n"
        "curated `top-issues-to-develop.md` should pick at least one item\n"
        "from each track per scan cycle — otherwise underreported issues\n"
        "compound into a timebomb the radar warned about but T4A never\n"
        "developed, and the develop list drifts into old news.\n"
    )
    lines.append("\n---\n")

    lines.append(f"\n## Fresh signal — first seen in the last {fresh_window_days:.0f} days\n")
    if not fresh:
        lines.append("\n_No fresh picks above threshold this cycle._\n")
    else:
        for i, p in enumerate(fresh, 1):
            _render_pick(lines, f"F{i}", p, show_age_factor=False)

    lines.append("\n---\n")
    lines.append("\n## Accumulated — silence compounding over time\n")
    if not picks:
        lines.append("\n_No silence picks above threshold this cycle._\n")
    else:
        for i, p in enumerate(picks, 1):
            _render_pick(lines, f"S{i}", p, show_age_factor=True)

    lines.append("\n---\n")
    lines.append("\n## How to use this list\n")
    lines.append(
        "\n1. Open the top 3 of each track and check whether each has a\n"
        "   verifiable primary source (official document, court judgment,\n"
        "   gazette, regulator publication). If not, drop it.\n"
        "2. If it does, run the publish playbook against it — these are\n"
        "   exactly the issues T4A exists to surface.\n"
        "3. If the curator skips a pick for editorial reasons, note it in\n"
        "   `top-issues-to-develop.md` under a Skip section so the next scan\n"
        "   doesn't re-surface it indefinitely.\n"
    )

    MD_OUT.write_text("\n".join(lines))


def build(
    top_n: int = 25, fresh_top: int = 15, fresh_window_days: float = 7.0
) -> dict:
    if not QUEUE_PATH.exists():
        raise SystemExit(f"Queue not found: {QUEUE_PATH}. Run a radar cycle first.")
    queue = json.loads(QUEUE_PATH.read_text())
    now = datetime.now(timezone.utc)
    candidates = collect_candidates(queue, now)
    picks = candidates[:top_n]
    fresh = extract_fresh_picks(candidates, fresh_top, fresh_window_days)
    write_json(picks, fresh, now, len(queue), fresh_window_days)
    write_markdown(picks, fresh, now, len(queue), fresh_window_days)
    return {"queue_size": len(queue), "picks": len(picks), "fresh": len(fresh)}


def main():
    parser = argparse.ArgumentParser(description="Build T4A radar silence-watch report")
    parser.add_argument("--top", type=int, default=25, help="Number of picks to include")
    parser.add_argument(
        "--fresh-top", type=int, default=15, help="Number of fresh-signal picks"
    )
    parser.add_argument(
        "--fresh-window",
        type=float,
        default=7.0,
        help="Days since first seen for the fresh-signal track",
    )
    args = parser.parse_args()
    result = build(
        top_n=args.top, fresh_top=args.fresh_top, fresh_window_days=args.fresh_window
    )
    print(f"Wrote {JSON_OUT.relative_to(REPO_DIR)} and {MD_OUT.relative_to(REPO_DIR)}")
    print(
        f"Queue size: {result['queue_size']}, picks: {result['picks']}, "
        f"fresh: {result['fresh']}"
    )


if __name__ == "__main__":
    main()
