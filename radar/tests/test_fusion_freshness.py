"""Evidence freshness survives replay, decay, and process restarts."""

from datetime import datetime, timedelta, timezone

import pytest

from radar.fusion.bayesian_fusion import BayesianFusion


NOW = datetime(2026, 11, 12, tzinfo=timezone.utc)


def test_alert_replay_after_restart_does_not_increase_score_or_refresh_age():
    fusion = BayesianFusion({})
    evidence = {"timestamp": NOW.isoformat(), "severity": 0.9}
    fusion.update("topic", "volume_monitor", evidence)
    saved_score = fusion.get_ranked_issues()[0]["controversy_score"]
    restored = BayesianFusion({})
    restored.load_state(fusion.get_state())
    restored.update("topic", "volume_monitor", evidence)
    output = restored.get_ranked_issues()[0]
    assert output["controversy_score"] == saved_score
    assert output["timestamp"] == NOW.isoformat()
    restored.decay_all(NOW + timedelta(days=8))
    assert restored.get_ranked_issues() == []


def test_decay_is_elapsed_incrementally_instead_of_repeated_from_last_evidence():
    once, twice = BayesianFusion({}), BayesianFusion({})
    for fusion in (once, twice):
        fusion.update("topic", "volume_monitor", {"timestamp": NOW.isoformat(), "severity": 0.9})
    once.decay_all(NOW + timedelta(hours=2))
    twice.decay_all(NOW + timedelta(hours=1))
    twice.decay_all(NOW + timedelta(hours=2))
    assert once._topics["topic"].alpha == pytest.approx(twice._topics["topic"].alpha)
    assert once._topics["topic"].last_updated == NOW


def test_late_source_evidence_keeps_its_date_and_receives_age_weight():
    fusion = BayesianFusion({})
    fusion.update("topic", "volume_monitor", {"timestamp": NOW.isoformat(), "severity": 0.9})
    fusion.decay_all(NOW + timedelta(hours=2))
    before = fusion._topics["topic"].alpha
    fusion.update("topic", "cascade_tracker", {"timestamp": (NOW + timedelta(hours=1)).isoformat(), "n_star": 0.95})
    topic = fusion._topics["topic"]
    assert topic.last_updated == NOW + timedelta(hours=1)
    assert topic.last_decay_at == NOW + timedelta(hours=2)
    assert topic.alpha - before == pytest.approx(2 * 0.2 * 0.95)


def test_source_timestamp_takes_precedence_over_scan_timestamp():
    fusion = BayesianFusion({})
    source_time = (NOW - timedelta(days=8)).isoformat()
    fusion.update("stale", "silence_detector", {"timestamp": NOW.isoformat(),
                  "last_evidence_at": source_time, "silence_score": 1, "structural_importance": 0.8})
    fusion.decay_all(NOW)
    assert fusion.get_ranked_issues() == []
