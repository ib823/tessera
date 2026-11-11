"""Regression coverage for scheduled orchestration and persisted outputs."""

import importlib.util
import json
from datetime import datetime, timedelta, timezone
from pathlib import Path
from unittest.mock import Mock

import pytest

from radar.fusion.bayesian_fusion import BayesianFusion
from radar.streams.silence_detector import SilenceDetector
from radar.keywords import keyword_pattern


_spec = importlib.util.spec_from_file_location("_radar_runner", Path(__file__).parents[1] / "run-radar.py")
runner = importlib.util.module_from_spec(_spec)
_spec.loader.exec_module(runner)
NOW = datetime(2026, 11, 12, 4, tzinfo=timezone.utc)


@pytest.fixture
def output_dir(tmp_path, monkeypatch):
    for name, target in {
        "OUTPUT_DIR": tmp_path,
        "QUEUE_PATH": tmp_path / "queue.json",
        "HEALTH_PATH": tmp_path / "health.json",
        "FOREIGN_EVENTS_PATH": tmp_path / "foreign.json",
        "ARCHIVE_DIR": tmp_path / "archive",
    }.items():
        monkeypatch.setattr(runner, name, target)
    return tmp_path


def issue(title="topic", score=0.9, timestamp=None, **extra):
    return {"title": title, "controversy_score": score,
            "timestamp": timestamp or NOW.isoformat(), **extra}


def test_current_score_replaces_peak_and_preserves_separate_history(output_dir):
    first_seen = (NOW - timedelta(days=6)).isoformat()
    runner.QUEUE_PATH.write_text(json.dumps([issue(timestamp=first_seen, first_seen=first_seen)]))
    runner.write_issue_queue([issue(score=0.2)], now=NOW)
    saved = json.loads(runner.QUEUE_PATH.read_text())[0]
    assert saved["controversy_score"] == 0.2
    assert saved["timestamp"] == NOW.isoformat()
    assert saved["first_seen"] == first_seen
    assert saved["peak_controversy_score"] == 0.9
    assert saved["peak_at"] == first_seen


def test_expired_high_score_cannot_be_renewed_by_rendering_queue(output_dir):
    stale = issue(timestamp=(NOW - timedelta(days=8)).isoformat())
    runner.QUEUE_PATH.write_text(json.dumps([stale]))
    # Fusion emits all topics; merely appearing in that list is not evidence.
    runner.write_issue_queue([issue(score=0.1, timestamp=stale["timestamp"])], now=NOW)
    assert json.loads(runner.QUEUE_PATH.read_text()) == []


def test_queue_age_uses_actual_offset_not_string_order(output_dir):
    cutoff = NOW - timedelta(days=7)
    old_local = (cutoff - timedelta(hours=1)).astimezone(timezone(timedelta(hours=8))).isoformat()
    recent_negative_offset = (cutoff + timedelta(hours=1)).astimezone(timezone(timedelta(hours=-8))).isoformat()
    runner.write_issue_queue([issue("old", timestamp=old_local),
                              issue("recent", timestamp=recent_negative_offset)], now=NOW)
    assert [row["title"] for row in json.loads(runner.QUEUE_PATH.read_text())] == ["recent"]


def test_foreign_window_normalizes_offsets_and_replaces_older_url(output_dir):
    def event(url, timestamp):
        return {"text": "event", "timestamp": timestamp, "platform": "news",
                "metadata": {"url": url, "region": "international"}}
    old = event("same", (NOW - timedelta(hours=30)).isoformat())
    runner.FOREIGN_EVENTS_PATH.write_text(json.dumps([old]))
    offset_old = (NOW - timedelta(hours=25)).astimezone(timezone(timedelta(hours=8))).isoformat()
    offset_recent = (NOW - timedelta(hours=23)).astimezone(timezone(timedelta(hours=-8))).isoformat()
    runner.persist_foreign_events([event("same", NOW.isoformat()), event("too-old", offset_old),
                                   event("recent", offset_recent), event("invalid", "invalid"),
                                   event("future", (NOW + timedelta(hours=1)).isoformat())], now=NOW)
    saved = json.loads(runner.FOREIGN_EVENTS_PATH.read_text())
    assert {row["metadata"]["url"] for row in saved} == {"same", "recent"}
    assert all(row["timestamp"].endswith("+00:00") for row in saved)


def test_health_keeps_batch_failures_and_actual_stream_error(output_dir):
    source = Mock()
    source.health.return_value = [{"name": "rss", "status": "degraded", "events_fetched": 3,
                                   "batches": {"failed": 1, "succeeded": 1}}]
    runner.write_health(source, {"volume_monitor": object(), "disabled": None}, 3, 1,
                        {"volume_monitor": "error"})
    saved = json.loads(runner.HEALTH_PATH.read_text())
    assert saved["sources"]["rss"]["batches"]["failed"] == 1
    assert saved["streams"] == {"volume_monitor": "error", "disabled": "disabled"}


def test_empty_scan_flushes_volume_monitor():
    monitor = Mock()
    result = runner._process_stream("volume_monitor", monitor, [], NOW)
    monitor.process.assert_called_once_with([], now=NOW)
    assert result[1] == "ok"


def stop_at_queue(monkeypatch):
    monkeypatch.setattr(runner, "persist_foreign_events", lambda events: None)
    def stop(*args, **kwargs):
        raise RuntimeError("queue captured")
    monkeypatch.setattr(runner, "write_issue_queue", stop)


def test_only_actual_upward_detector_alerts_enter_volume_fusion(monkeypatch):
    now = datetime.now(timezone.utc)
    source = Mock()
    source.fetch_all.return_value = [{"text": "corruption reform", "platform": "news",
                                     "timestamp": (now - timedelta(minutes=1)).isoformat()}] * 30
    monitor = Mock()
    monitor.get_active_alerts.return_value = [
        {"keyword": "real-spike", "severity": 0.9, "direction": "up", "z_score": 3,
         "timestamp": (now - timedelta(minutes=1)).isoformat()},
        {"keyword": "quiet-period", "severity": 0.9, "direction": "down", "z_score": -3,
         "timestamp": (now - timedelta(minutes=1)).isoformat()},
    ]
    fusion = BayesianFusion({})
    stop_at_queue(monkeypatch)
    with pytest.raises(RuntimeError, match="queue captured"):
        runner.run_cycle(source, {"volume_monitor": monitor}, fusion,
                         {"keywords": {"topics": {"english": ["corruption"]}}})
    assert [row["title"] for row in fusion.get_ranked_issues()] == ["real-spike"]


def test_fetch_time_events_survive_normalization_and_share_detector_clock(monkeypatch):
    times = iter([NOW, NOW + timedelta(seconds=2), NOW + timedelta(seconds=3)])
    class FetchClock(datetime):
        @classmethod
        def now(cls, tz=None):
            return next(times)
    monkeypatch.setattr(runner, "datetime", FetchClock)
    fetched_stamp = (NOW + timedelta(seconds=1)).isoformat()
    source = Mock()
    source.fetch_all.return_value = [{"text": "Undated feed item", "platform": "news",
                                     "timestamp": fetched_stamp}]
    monitor = Mock()
    monitor.get_active_alerts.return_value = []
    stop_at_queue(monkeypatch)
    with pytest.raises(RuntimeError, match="queue captured"):
        runner.run_cycle(source, {"volume_monitor": monitor}, BayesianFusion({}), {})
    assert monitor.process.call_args.args[0][0]["timestamp"] == fetched_stamp
    assert monitor.process.call_args.kwargs["now"] == NOW + timedelta(seconds=2)


def test_chinese_keyword_matches_inside_phrase_in_topic_evaluation(monkeypatch):
    source = Mock()
    source.fetch_all.return_value = [{"text": "政府宣布补贴改革", "platform": "news",
                    "timestamp": (datetime.now(timezone.utc) - timedelta(minutes=1)).isoformat()}] * 2
    stream = Mock()
    stream.evaluate_topic.return_value = {"alert_level": "normal"}
    stream.get_active_alerts.return_value = []
    stop_at_queue(monkeypatch)
    with pytest.raises(RuntimeError, match="queue captured"):
        runner.run_cycle(source, {"polarization": stream}, BayesianFusion({}),
                {"keywords": {"economic": {"chinese": ["补贴"]}}})
    assert stream.evaluate_topic.call_args.args[0] == "补贴"
    assert keyword_pattern("act").search("impact") is None
    assert keyword_pattern("act").search("the Act passed")


def test_silence_ingested_once_by_full_title_and_future_event_is_ignored(monkeypatch):
    now = datetime.now(timezone.utc)
    detector = SilenceDetector({})
    for title, date in [("Budget 2027 presentation", now - timedelta(hours=24)),
                        ("Future budget presentation", now + timedelta(days=180))]:
        detector.add_institutional_event("budget_allocation", title,
             "Annual national budget presentation to Parliament", date=date,
             fiscal_text="National budget allocation RM300 billion total expenditure")
    fusion = BayesianFusion({})
    stop_at_queue(monkeypatch)
    with pytest.raises(RuntimeError, match="queue captured"):
        runner.run_cycle(None, {"silence_detector": detector}, fusion, {})
    output = fusion.get_ranked_issues()
    assert [row["title"] for row in output] == ["budget 2027 presentation"]
    assert output[0]["timestamp"] == (now - timedelta(hours=24)).isoformat()


def test_main_restores_volume_state_before_single_cycle(monkeypatch):
    volume = Mock()
    fusion = Mock()
    cycle = Mock()
    monkeypatch.setattr("sys.argv", ["run-radar.py", "--once"])
    monkeypatch.setattr(runner, "load_dotenv", lambda: None)
    monkeypatch.setattr(runner, "load_config", lambda: {})
    monkeypatch.setattr(runner, "setup_logging", lambda config: Mock())
    monkeypatch.setattr(runner, "init_sources", lambda config: None)
    monkeypatch.setattr(runner, "init_streams", lambda config: {"volume_monitor": volume})
    monkeypatch.setattr(runner, "init_fusion", lambda config: fusion)
    monkeypatch.setattr(runner, "load_state", lambda: {"fusion": {}, "volume_monitor": {"version": 2}})
    monkeypatch.setattr(runner, "run_cycle", cycle)
    runner.main()
    volume.load_state.assert_called_once_with({"version": 2})
    cycle.assert_called_once()


def test_bad_institutional_timestamp_is_normalized_before_registration(monkeypatch):
    sd = Mock()
    sd.evaluate_all.return_value = []
    source = Mock()
    source.fetch_all.return_value = [{"text": "Court ruling", "platform": "court", "timestamp": "invalid"}]
    monkeypatch.setattr(runner, "persist_foreign_events", lambda events: None)
    monkeypatch.setattr(runner, "_process_stream", lambda *args: (_ for _ in ()).throw(RuntimeError("stop after registration")))
    with pytest.raises(RuntimeError, match="stop after registration"):
        runner.run_cycle(source, {"silence_detector": sd}, BayesianFusion({}), {})
    stamp = sd.add_institutional_event.call_args.kwargs["date"]
    assert stamp.tzinfo == timezone.utc
