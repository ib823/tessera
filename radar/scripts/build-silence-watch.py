#!/usr/bin/env python3
"""Build a focused silence-watch report from the radar issue queue.

The queue is ~88% silence_anomaly entries (events with structural
importance but unexpectedly low coverage). They accumulate across
cycles and become invisible — the curated `top-issues-to-develop.md`
biases toward higher-visibility picks, so genuinely under-reported
items sit unread for weeks. This script extracts them into a separate
ranked report so the curator can see what's been accumulating.

Ranking: silence_score × structural_importance × age_factor.
Age factor saturates at 30 days so a 50-day-old item doesn't dominate.

Outputs:
  radar/output/silence-watch.json   — machine-readable, full detail
  radar/output/silence-watch.md     — human-readable curator brief

Excludes items whose topic words overlap with an already-published
issue (`src/data/issues/*.json`) or a brief in flight
(`engine/briefs/*.md`). Near-duplicate titles are collapsed by
silence-detector `event_id` then by 4-word title prefix.

Usage:
  python radar/scripts/build-silence-watch.py
  python radar/scripts/build-silence-watch.py --top 20
"""

import argparse
import json
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


def load_published_terms() -> set[str]:
    """Significant words from every published issue's headline + context."""
    terms: set[str] = set()
    if not PUBLISHED_DIR.exists():
        return terms
    for path in PUBLISHED_DIR.glob("*.json"):
        try:
            data = json.loads(path.read_text())
        except (json.JSONDecodeError, OSError):
            continue
        if not data.get("published"):
            continue
        text = f"{data.get('headline', '')} {data.get('context', '')}"
        terms |= _significant_words(text)
    return terms


def load_inflight_terms() -> set[str]:
    """Significant words from in-flight brief filenames."""
    terms: set[str] = set()
    if not BRIEFS_DIR.exists():
        return terms
    for path in BRIEFS_DIR.glob("*.md"):
        slug = path.stem.replace("-", " ")
        terms |= _significant_words(slug)
    return terms


def _covered_by_published(title: str, published_terms: set[str], threshold: int = 3) -> bool:
    """A silence item is 'covered' if 3+ significant words match a published issue."""
    if not published_terms:
        return False
    overlap = _significant_words(title) & published_terms
    return len(overlap) >= threshold


def _covered_by_inflight(title: str, inflight_terms: set[str], threshold: int = 3) -> bool:
    """A silence item is 'in flight' if 3+ significant words match a brief filename."""
    if not inflight_terms:
        return False
    overlap = _significant_words(title) & inflight_terms
    return len(overlap) >= threshold


def _is_stub(title: str) -> bool:
    """Drop single-word and very short stubs — they're attention signals, not issues."""
    words = [w for w in _normalize(title).split() if w not in STOPWORDS]
    return len(words) < 3


def extract_silence_picks(queue: list[dict], now: datetime, top_n: int) -> list[dict]:
    """Filter, dedupe, rank, return the top-N silence picks."""
    published_terms = load_published_terms()
    inflight_terms = load_inflight_terms()

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
        if _covered_by_published(title, published_terms):
            continue
        if _covered_by_inflight(title, inflight_terms):
            continue

        days = _age_days(item, now)
        rank_score = silence * importance * _age_factor(days)
        candidates.append({
            "item": item,
            "silence": silence,
            "importance": importance,
            "age_days": days,
            "rank_score": rank_score,
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
    return deduped[:top_n]


def write_json(picks: list[dict], now: datetime, queue_size: int) -> None:
    payload = {
        "generated_at": now.isoformat(),
        "queue_size": queue_size,
        "picks": [
            {
                "rank": i + 1,
                "title": p["title"],
                "rank_score": round(p["rank_score"], 4),
                "silence_score": round(p["silence"], 4),
                "structural_importance": round(p["importance"], 4),
                "age_days": round(p["age_days"], 1),
                "suppression_pattern": p["pattern"],
                "news_mentions": p["news_mentions"],
                "social_mentions": p["social_mentions"],
                "event_id": p["event_id"],
                "controversy_score": p["item"].get("controversy_score"),
                "bias_dimensions_at_risk": p["item"].get("bias_dimensions_at_risk", []),
                "timestamp": p["item"].get("timestamp"),
                "first_seen": p["item"].get("first_seen"),
            }
            for i, p in enumerate(picks)
        ],
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


def write_markdown(picks: list[dict], now: datetime, queue_size: int) -> None:
    lines = []
    lines.append("# Radar — Silence Watch\n")
    lines.append(
        f"Scan: {now.strftime('%Y-%m-%d %H:%M UTC')}. Queue size: {queue_size}. "
        f"Picks shown: {len(picks)}.\n"
    )
    lines.append(
        "These are structurally important events that have accumulated in the\n"
        "radar queue with unexpectedly low coverage. Rank score combines\n"
        "silence × structural importance × age — items that have been silent\n"
        "for weeks rise above fresh-but-quiet items. Already-published topics\n"
        "and in-flight briefs are filtered out.\n"
    )
    lines.append(
        "Auto-generated by `radar/scripts/build-silence-watch.py`. The\n"
        "curated `top-issues-to-develop.md` should pick at least one item\n"
        "from this list per scan cycle — otherwise underreported issues\n"
        "compound into a timebomb the radar warned about but T4A never\n"
        "developed.\n"
    )
    lines.append("\n---\n")

    if not picks:
        lines.append("\n_No silence picks above threshold this cycle._\n")
        MD_OUT.write_text("\n".join(lines))
        return

    for i, p in enumerate(picks, 1):
        title = p["title"].strip()
        if len(title) > 110:
            title = title[:107] + "..."
        dims = p["item"].get("bias_dimensions_at_risk") or []
        dim_str = ", ".join(dims) if dims else "—"
        ts = (p["item"].get("timestamp") or "")[:10]
        first_seen = (p["item"].get("first_seen") or "")[:10]
        lines.append(f"\n### S{i}. {title}\n")
        lines.append(
            f"- **Rank score:** {p['rank_score']:.3f} "
            f"(silence={p['silence']:.2f} × importance={p['importance']:.2f} × age_factor)\n"
        )
        lines.append(
            f"- **Age in queue:** {p['age_days']:.1f} days "
            f"(source date: {ts or '—'}, first seen: {first_seen or '—'})\n"
        )
        lines.append(
            f"- **Coverage:** {p['news_mentions']} news, "
            f"{p['social_mentions']} social — pattern: _{_bucket_pattern(p['pattern'])}_\n"
        )
        lines.append(f"- **Dimensions at risk:** {dim_str}\n")
        if p["event_id"]:
            lines.append(f"- **Event ID:** {p['event_id']}\n")

    lines.append("\n---\n")
    lines.append("\n## How to use this list\n")
    lines.append(
        "\n1. Open the top 3 and check whether each has a verifiable primary\n"
        "   source (official document, court judgment, gazette, regulator\n"
        "   publication). If not, drop it.\n"
        "2. If it does, run the publish playbook against it — these are\n"
        "   exactly the issues T4A exists to surface.\n"
        "3. If the curator skips a silence pick for editorial reasons,\n"
        "   note it in `top-issues-to-develop.md` under a Skip section so\n"
        "   the next scan doesn't re-surface it indefinitely.\n"
    )

    MD_OUT.write_text("\n".join(lines))


def build(top_n: int = 25) -> dict:
    if not QUEUE_PATH.exists():
        raise SystemExit(f"Queue not found: {QUEUE_PATH}. Run a radar cycle first.")
    queue = json.loads(QUEUE_PATH.read_text())
    now = datetime.now(timezone.utc)
    picks = extract_silence_picks(queue, now, top_n)
    write_json(picks, now, len(queue))
    write_markdown(picks, now, len(queue))
    return {"queue_size": len(queue), "picks": len(picks)}


def main():
    parser = argparse.ArgumentParser(description="Build T4A radar silence-watch report")
    parser.add_argument("--top", type=int, default=25, help="Number of picks to include")
    args = parser.parse_args()
    result = build(top_n=args.top)
    print(f"Wrote {JSON_OUT.relative_to(REPO_DIR)} and {MD_OUT.relative_to(REPO_DIR)}")
    print(f"Queue size: {result['queue_size']}, picks: {result['picks']}")


if __name__ == "__main__":
    main()
