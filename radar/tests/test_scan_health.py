"""CI must reject old health artifacts and complete collection failures."""

from datetime import datetime, timedelta, timezone
import importlib.util
from pathlib import Path


spec = importlib.util.spec_from_file_location(
    "check_health", Path(__file__).parents[1] / "scripts" / "check-health.py")
check_health = importlib.util.module_from_spec(spec)
spec.loader.exec_module(check_health)

START = datetime(2026, 11, 12, tzinfo=timezone.utc)
NOW = START + timedelta(minutes=3)


def valid_health():
    return {
        "last_scan": NOW.isoformat(), "events_fetched": 5,
        "sources": {"news_rss": {"status": "degraded", "events_fetched": 5,
            "last_fetch": (NOW - timedelta(seconds=1)).isoformat()}},
        "streams": {"volume_monitor": "ok"},
    }


def test_partial_coverage_is_usable_when_events_are_fresh():
    assert check_health.validate_health(valid_health(), START, NOW) == []


def test_previous_cycle_health_is_rejected():
    health = valid_health()
    health["last_scan"] = (START - timedelta(hours=2)).isoformat()
    assert "this scan invocation" in " ".join(check_health.validate_health(health, START, NOW))


def test_all_rate_limited_sources_are_rejected():
    health = valid_health()
    health["events_fetched"] = 0
    health["sources"]["news_rss"].update(status="rate_limited", events_fetched=0)
    problems = check_health.validate_health(health, START, NOW)
    assert "scan fetched no usable events" in problems
    assert "no source supplied fresh events successfully" in problems


def test_stale_source_cannot_be_hidden_by_a_new_health_timestamp():
    health = valid_health()
    health["sources"]["news_rss"]["last_fetch"] = (START - timedelta(hours=2)).isoformat()
    assert "no source supplied fresh events successfully" in check_health.validate_health(health, START, NOW)


def test_future_or_missing_scan_timestamp_is_rejected():
    for value in (None, "not-a-date", (NOW + timedelta(hours=1)).isoformat()):
        health = valid_health()
        health["last_scan"] = value
        assert check_health.validate_health(health, START, NOW)


def test_all_stream_failures_are_rejected():
    health = valid_health()
    health["streams"] = {"volume_monitor": "error"}
    assert "no processing stream succeeded" in check_health.validate_health(health, START, NOW)
