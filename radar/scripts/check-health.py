#!/usr/bin/env python3
"""Reject stale or unusable scan output before CI persists it."""

import argparse
import json
from datetime import datetime, timedelta, timezone
from pathlib import Path


def parse_time(value: str) -> datetime:
    result = datetime.fromisoformat(value.strip().replace("Z", "+00:00"))
    if result.tzinfo is None:
        raise ValueError("health timestamps must include a timezone")
    return result.astimezone(timezone.utc)


def validate_health(health: dict, started_at: datetime, now: datetime) -> list[str]:
    """Return fatal problems; partial coverage remains visible but can be usable."""
    problems = []
    try:
        scanned_at = parse_time(health["last_scan"])
        if not started_at <= scanned_at <= now + timedelta(seconds=60):
            problems.append("health.json does not belong to this scan invocation")
    except (KeyError, TypeError, ValueError, AttributeError):
        problems.append("missing or invalid last_scan")

    if not isinstance(health.get("events_fetched"), int) or health["events_fetched"] <= 0:
        problems.append("scan fetched no usable events")

    viable = []
    for name, source in health.get("sources", {}).items():
        if source.get("status") not in ("healthy", "degraded"):
            continue
        try:
            fetched_at = parse_time(source["last_fetch"])
            if (started_at <= fetched_at <= now + timedelta(seconds=60)
                    and source.get("events_fetched", 0) > 0):
                viable.append(name)
        except (KeyError, TypeError, ValueError, AttributeError):
            continue
    if not viable:
        problems.append("no source supplied fresh events successfully")
    if not any(status == "ok" for status in health.get("streams", {}).values()):
        problems.append("no processing stream succeeded")
    return problems


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--started-at-file", type=Path, required=True)
    parser.add_argument("--health", type=Path, default=Path("radar/output/health.json"))
    parser.add_argument("--queue", type=Path, default=Path("radar/output/issue-queue.json"))
    args = parser.parse_args()
    try:
        started_at = parse_time(args.started_at_file.read_text())
        health = json.loads(args.health.read_text())
        queue = json.loads(args.queue.read_text())
        if not isinstance(health, dict) or not isinstance(queue, list):
            raise ValueError("health must be an object and issue queue must be an array")
    except (OSError, ValueError, TypeError) as exc:
        print(f"ERROR: unreadable scan output: {exc}")
        return 1

    for name, source in health.get("sources", {}).items():
        print(f"{name}: {source.get('status', 'unknown')}, "
              f"events={source.get('events_fetched', 0)}, "
              f"batches={source.get('batches', {})}")
    problems = validate_health(health, started_at, datetime.now(timezone.utc))
    for problem in problems:
        print(f"ERROR: {problem}")
    print(f"Events: {health.get('events_fetched', 0)}; queued issues: {len(queue)}")
    return int(bool(problems))


if __name__ == "__main__":
    raise SystemExit(main())
