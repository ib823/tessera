#!/usr/bin/env python3
"""Malaysia-impact pass — scores recent foreign news for Malaysia downstream effect.

Reads:
  radar/output/foreign-events.json  (rolling 24h, produced by run-radar.py)
  radar/config/malaysia-exposure-map.yaml

Writes:
  radar/output/malaysia-impact-watch.json  (machine-readable hypotheses)
  radar/output/malaysia-impact-watch.md    (human-readable briefing)

Skips silently if no API key is set or no events to process.

Usage:
  python radar/scripts/malaysia-impact-pass.py
  python radar/scripts/malaysia-impact-pass.py --dry-run  # don't call API; print prompt
"""

import argparse
import json
import os
import re
import sys
from datetime import datetime, timezone
from pathlib import Path

import yaml

RADAR_DIR = Path(__file__).resolve().parent.parent
FOREIGN_EVENTS_PATH = RADAR_DIR / "output" / "foreign-events.json"
EXPOSURE_MAP_PATH = RADAR_DIR / "config" / "malaysia-exposure-map.yaml"
WATCH_JSON = RADAR_DIR / "output" / "malaysia-impact-watch.json"
WATCH_MD = RADAR_DIR / "output" / "malaysia-impact-watch.md"

MODEL = "claude-haiku-4-5-20251001"
MAX_EVENTS_TO_SCORE = 80
MAX_HYPOTHESES = 20


def load_exposure_map() -> dict:
    with open(EXPOSURE_MAP_PATH) as f:
        return yaml.safe_load(f) or {}


def load_foreign_events() -> list[dict]:
    if not FOREIGN_EVENTS_PATH.exists():
        return []
    with open(FOREIGN_EVENTS_PATH) as f:
        data = json.load(f)
        return data if isinstance(data, list) else []


def dedupe_events(events: list[dict]) -> list[dict]:
    """Collapse near-identical titles from different mirrors."""
    seen_titles: set[str] = set()
    out = []
    for ev in events:
        title = (ev.get("text") or "").strip()
        # Normalise to first 100 chars lower
        key = re.sub(r"\s+", " ", title[:100].lower())
        if key in seen_titles:
            continue
        seen_titles.add(key)
        out.append(ev)
    return out


def format_exposure_map(exposure_map: dict) -> str:
    nodes = exposure_map.get("nodes", []) or []
    lines = []
    for n in nodes:
        triggers = ", ".join(n.get("triggers", []) or [])
        targets = ", ".join(n.get("targets", []) or [])
        lag = n.get("lag_days", [])
        lag_str = f"{lag[0]}-{lag[1]}d" if isinstance(lag, list) and len(lag) == 2 else "?"
        lines.append(
            f"- {n['id']} [{n['cat']}, conf={n.get('confidence', '?')}, lag={lag_str}]: "
            f"{n.get('note', '')}\n"
            f"    triggers: {triggers}\n"
            f"    targets: {targets}"
        )
    return "\n".join(lines)


def format_events(events: list[dict]) -> str:
    lines = []
    for i, ev in enumerate(events[:MAX_EVENTS_TO_SCORE], 1):
        title = (ev.get("text") or "")[:240].replace("\n", " ")
        meta = ev.get("metadata") or {}
        source = ev.get("source_name") or meta.get("source_country") or "?"
        platform = ev.get("platform", "?")
        scope = meta.get("scope") or meta.get("region") or platform
        ts = ev.get("timestamp", "")[:16]
        lines.append(f"[{i}] ({ts} · {source} · {scope}) {title}")
    return "\n".join(lines)


def build_prompt(events: list[dict], exposure_map: dict) -> str:
    map_str = format_exposure_map(exposure_map)
    events_str = format_events(events)
    return f"""You score foreign-news events for their downstream impact on Malaysia.

Malaysia's exposure map below describes transmission channels — the mechanisms
through which a foreign event reaches Malaysian domestic interest. Use them as
priors; do not invent channels not on the map.

=== EXPOSURE MAP ===
{map_str}

=== FOREIGN EVENTS (past 24h) ===
{events_str}

=== TASK ===
Identify the events from the list above that have material Malaysian
downstream impact potential. For each, output a JSON object:

  - "event_idx": integer index from the list above
  - "event_title": the headline (truncated to 200 chars)
  - "channels": array of exposure-map node ids this travels through
  - "predicted_my_effect": 1-2 sentences on the expected Malaysian downstream
    effect, naming the specific sector/ministry/market that feels it
  - "target": one short string — primary Malaysian target (e.g. "MOF", "ringgit",
    "Penang E&E", "MPOB", "PETRONAS dividends")
  - "horizon_days": integer estimate of days until Malaysian domestic
    discourse will surface this (median expectation)
  - "confidence": 0-100 — how confident are you the predicted effect occurs
  - "novelty": 0-100 — how unusual or unprecedented is this trigger pattern
    (100 = no clear historical analog, 0 = textbook repeat)
  - "rationale": one short sentence on why this combination of channels +
    event matters

Rules:
- Skip events with no plausible Malaysian channel.
- Skip pure cultural/entertainment unless they intersect 3R or diplomacy.
- Prefer events with named specifics (places, numbers, named actors) over
  vague trends.
- Maximum {MAX_HYPOTHESES} hypotheses, ranked by (confidence × novelty × inverse-horizon).
- Output ONLY a JSON array. No prose before or after. No markdown fences.
"""


def call_claude(prompt: str) -> str:
    try:
        from anthropic import Anthropic
    except ImportError:
        print("anthropic SDK not installed — pip install anthropic", file=sys.stderr)
        sys.exit(1)
    api_key = os.environ.get("ANTHROPIC_API_KEY", "")
    if not api_key:
        print("ANTHROPIC_API_KEY not set — skipping impact pass", file=sys.stderr)
        sys.exit(0)
    client = Anthropic(api_key=api_key)
    resp = client.messages.create(
        model=MODEL,
        max_tokens=8000,
        messages=[{"role": "user", "content": prompt}],
    )
    return resp.content[0].text


def parse_response(text: str) -> list[dict]:
    """Parse the model output as a JSON array, tolerating common formatting."""
    s = text.strip()
    # Strip code fences if present
    if s.startswith("```"):
        s = re.sub(r"^```(?:json)?\s*", "", s)
        s = re.sub(r"\s*```$", "", s)
    # Find the first '[' and last ']'
    start = s.find("[")
    end = s.rfind("]")
    if start == -1 or end == -1 or end <= start:
        raise ValueError("no JSON array found in model output")
    return json.loads(s[start:end + 1])


def rank_score(h: dict) -> float:
    conf = float(h.get("confidence", 0))
    nov = float(h.get("novelty", 0))
    horizon = max(1.0, float(h.get("horizon_days", 30)))
    return (conf * nov) / horizon


def render_markdown(output: dict) -> str:
    lines = [
        "# Malaysia Impact Watch",
        "",
        f"Generated: {output['generated']}",
        f"Events considered: {output['events_considered']} · "
        f"Hypotheses: {len(output['hypotheses'])} · "
        f"Model: {output['model']}",
        "",
        "Foreign news scored for Malaysia downstream impact potential. "
        "Ranked by (confidence × novelty / horizon). Channels reference "
        "`radar/config/malaysia-exposure-map.yaml`.",
        "",
        "---",
        "",
    ]
    for i, h in enumerate(output["hypotheses"], 1):
        title = (h.get("event_title") or "?")[:200]
        channels = ", ".join(h.get("channels") or [])
        lines.extend([
            f"## {i}. {title}",
            "",
            f"- **Channels:** {channels}",
            f"- **Target:** {h.get('target', '?')}",
            f"- **Predicted MY effect:** {h.get('predicted_my_effect', '?')}",
            f"- **Horizon:** {h.get('horizon_days', '?')} days  ·  "
            f"**Confidence:** {h.get('confidence', '?')}/100  ·  "
            f"**Novelty:** {h.get('novelty', '?')}/100",
            f"- **Rationale:** {h.get('rationale', '?')}",
            "",
        ])
    return "\n".join(lines)


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--dry-run", action="store_true",
                        help="Print prompt and exit, no API call")
    args = parser.parse_args()

    events = load_foreign_events()
    if not events:
        print("No foreign events to score — exiting cleanly")
        return 0
    events = dedupe_events(events)
    events.sort(key=lambda e: e.get("timestamp", ""), reverse=True)

    exposure_map = load_exposure_map()
    if not exposure_map.get("nodes"):
        print("Exposure map missing or empty — aborting", file=sys.stderr)
        return 1

    prompt = build_prompt(events, exposure_map)

    if args.dry_run:
        print(prompt)
        return 0

    text = call_claude(prompt)
    try:
        hypotheses = parse_response(text)
    except (ValueError, json.JSONDecodeError) as e:
        print(f"Failed to parse model output: {e}", file=sys.stderr)
        print("Raw output:", file=sys.stderr)
        print(text[:2000], file=sys.stderr)
        return 1

    hypotheses.sort(key=rank_score, reverse=True)
    hypotheses = hypotheses[:MAX_HYPOTHESES]

    output = {
        "generated": datetime.now(timezone.utc).isoformat(),
        "events_considered": min(len(events), MAX_EVENTS_TO_SCORE),
        "model": MODEL,
        "exposure_map_version": exposure_map.get("version"),
        "hypotheses": hypotheses,
    }

    WATCH_JSON.parent.mkdir(parents=True, exist_ok=True)
    with open(WATCH_JSON, "w") as f:
        json.dump(output, f, indent=2, default=str)
    with open(WATCH_MD, "w") as f:
        f.write(render_markdown(output))

    print(f"Wrote {len(hypotheses)} hypotheses to {WATCH_JSON.name} and {WATCH_MD.name}")
    return 0


if __name__ == "__main__":
    sys.exit(main())
