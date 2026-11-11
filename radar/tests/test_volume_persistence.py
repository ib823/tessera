"""Operational volume detection across independent scheduled scans."""

import json
from datetime import datetime, timedelta, timezone

import pytest

from radar.streams.volume_monitor import VolumeMonitor


START = datetime(2026, 11, 1, tzinfo=timezone.utc)
KEY = ("corruption", "news", "english")
CONFIG = {
    "keywords": ["corruption", "federal court"],
    "bucket_minutes": 15,
    "cusum": {"k": 0.5, "h": 4, "cooldown_hours": 0},
    "bocpd": {"hazard_lambda": 50, "changepoint_threshold": 0.3, "max_run_length": 50},
}


def documents(bucket, count, *, offset=0):
    return [{
        "text": "Minister discusses corruption reform",
        "lang": "english",
        "platform": "news",
        "timestamp": (START + timedelta(minutes=15 * bucket + 1)).isoformat(),
        "metadata": {"url": f"https://example.com/{bucket}/{offset + i}"},
    } for i in range(count)]


def restarted(monitor):
    loaded = VolumeMonitor(CONFIG)
    loaded.load_state(json.loads(json.dumps(monitor.get_state())))
    return loaded


def test_first_scheduled_scan_processes_completed_event_buckets():
    monitor = VolumeMonitor(CONFIG)
    monitor.process(documents(0, 3), now=START + timedelta(minutes=20))
    assert monitor._stl[KEY]._history == [3]
    assert len(monitor.get_state()["bocpd"][str(KEY)]["log_R"]) == 2


def test_pending_bucket_survives_restart_without_recounting_documents():
    monitor = VolumeMonitor(CONFIG)
    events = documents(0, 2)
    monitor.process(events, now=START + timedelta(minutes=5))
    assert not monitor.get_state()["stl"]

    loaded = restarted(monitor)
    loaded.process(events + documents(0, 1, offset=2), now=START + timedelta(minutes=20))
    assert loaded._stl[KEY]._history == [3]
    # Closed buckets reject even an unseen late document instead of adding it
    # to the current scan's count.
    loaded.process(documents(0, 1, offset=3), now=START + timedelta(minutes=25))
    assert loaded._stl[KEY]._history == [3]


def test_restart_preserves_baseline_and_detects_real_spike():
    baseline = [event for bucket in range(30) for event in documents(bucket, 3)]
    original = VolumeMonitor(CONFIG)
    original.process(baseline, now=START + timedelta(minutes=15 * 30))
    loaded = restarted(original)
    new_events = documents(30, 30)
    scan_time = START + timedelta(minutes=15 * 31)
    original.process(new_events, now=scan_time)
    loaded.process(new_events, now=scan_time)

    assert loaded.get_state() == original.get_state()
    upward = [alert for alert in loaded.get_active_alerts(scan_time)
              if alert.get("direction") == "up"]
    assert upward
    assert upward[0]["keyword"] == "corruption"
    assert upward[0]["current_rate"] == 30


def test_empty_scans_zero_fill_established_series_and_advance_watermark():
    monitor = VolumeMonitor(CONFIG)
    monitor.process(documents(0, 2), now=START + timedelta(minutes=15))
    loaded = restarted(monitor)
    loaded.process([], now=START + timedelta(minutes=45))
    loaded.process(documents(3, 1), now=START + timedelta(minutes=60))
    assert loaded._stl[KEY]._history == [2, 0, 0, 1]
    assert loaded.get_state()["next_bucket"] == (START + timedelta(minutes=60)).isoformat()


def test_keywords_use_shared_topics_and_word_boundaries():
    monitor = VolumeMonitor(CONFIG)
    assert monitor._extract_keywords("Minister discusses corruption at the Federal Court") == ["corruption", "federal court"]
    assert monitor._extract_keywords("Federal courtyard reform") == []
    assert VolumeMonitor({})._extract_keywords("Minister discusses reform") == ["minister"]


def test_chinese_keywords_match_inside_unsegmented_phrases():
    monitor = VolumeMonitor({"keywords": ["贪污", "corruption"]})
    assert monitor._extract_keywords("反贪污委员会调查政府项目") == ["贪污"]
    assert monitor._extract_keywords("An anticorruption investigation") == []


def test_event_timestamps_normalize_offsets_and_reject_future_or_invalid_data():
    monitor = VolumeMonitor(CONFIG)
    good = documents(0, 1)[0]
    good["timestamp"] = "2026-11-01T08:01:00+08:00"
    bad = [dict(documents(0, 1, offset=1)[0], timestamp="invalid"),
           dict(documents(0, 1, offset=2)[0], timestamp="2026-11-02T00:00:00Z")]
    monitor.process([good, *bad], now=START + timedelta(minutes=15))
    assert monitor._stl[KEY]._history == [1]


def test_old_state_restores_without_executable_key_parsing():
    monitor = VolumeMonitor(CONFIG)
    monitor.process_count(KEY, 3, START)
    old = {name: values for name, values in monitor.get_state().items() if name in ("cusum", "bocpd")}
    loaded = VolumeMonitor(CONFIG)
    loaded.load_state(old)
    assert loaded.get_state()["cusum"] == old["cusum"]
    assert loaded.get_state()["bocpd"] == old["bocpd"]
    with pytest.raises((ValueError, SyntaxError)):
        loaded.load_state({"cusum": {"__import__('os').system('false')": {}}})


def test_inactive_keys_expire_and_history_is_bounded():
    monitor = VolumeMonitor(CONFIG)
    monitor.process(documents(0, 1), now=START + timedelta(minutes=15))
    monitor.flush_completed(START + timedelta(days=8))
    assert not monitor.get_state()["stl"]
    assert not monitor.get_state()["first_bucket"]
