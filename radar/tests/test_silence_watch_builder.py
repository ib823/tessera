"""Tests for the silence-watch report builder.

The builder is loaded by path because its filename is hyphenated and so
cannot be imported as a module — the same trick `run-radar.py` uses.
It depends on nothing outside the standard library.
"""

import importlib.util
import json
from datetime import datetime, timedelta, timezone
from pathlib import Path

import pytest

_BUILDER_PATH = Path(__file__).resolve().parent.parent / "scripts" / "build-silence-watch.py"
_spec = importlib.util.spec_from_file_location("_silence_watch_builder", _BUILDER_PATH)
sw = importlib.util.module_from_spec(_spec)
_spec.loader.exec_module(sw)


NOW = datetime(2026, 8, 3, 12, 0, tzinfo=timezone.utc)


def make_item(title, *, silence=0.99, importance=0.6, age_days=1.0, event_id=None):
    first_seen = (NOW - timedelta(days=age_days)).isoformat()
    return {
        "issue_id": f"T4A-{abs(hash(title)) % 10**6}",
        "title": title,
        "detection_type": "silence_anomaly",
        "first_seen": first_seen,
        "timestamp": first_seen,
        "controversy_score": silence,
        "bias_dimensions_at_risk": ["political"],
        "stream_signals": {
            "silence": {
                "silence_score": silence,
                "structural_importance": importance,
                "suppression_pattern": "NORMAL",
                "news_mentions": 4,
                "social_mentions": 2,
                "event_id": event_id,
            }
        },
    }


class TestCoverageFilter:
    """Coverage must be judged per published issue, never against the corpus."""

    def test_scattered_corpus_words_do_not_suppress_a_new_story(self):
        # No single issue covers the story, but between them the corpus
        # supplies every word in it. The union-based test dropped this.
        docs = [
            {"court", "ruling", "appeal", "loss"},
            {"profit", "fund", "annual"},
            {"report", "commission", "enforcement"},
        ]
        title = "commission report finds fund 2017 profit should have been a loss"
        # Every word of the title appears somewhere in the corpus, but no
        # single issue matches more than two.
        assert sw._covered_by_any(title, docs) is False

    def test_single_matching_issue_still_suppresses(self):
        docs = [
            {"court", "ruling", "appeal"},
            {"commission", "report", "profit", "fund", "loss"},
        ]
        title = "commission report finds fund 2017 profit should have been a loss"
        assert sw._covered_by_any(title, docs) is True

    def test_no_documents_means_nothing_is_covered(self):
        assert sw._covered_by_any("any headline at all here", []) is False

    def test_empty_title_is_not_covered(self):
        assert sw._covered_by_any("", [{"some", "words", "here"}]) is False


class TestCommonWords:
    def test_words_in_many_documents_are_common(self):
        docs = [{"billion", "malaysia", f"topic{i}"} for i in range(20)]
        common = sw.common_words(docs)
        assert "billion" in common
        assert "malaysia" in common
        assert "topic3" not in common

    def test_common_words_do_not_count_toward_coverage(self):
        docs = [{"billion", "malaysia", "losses", f"topic{i}"} for i in range(20)]
        common = sw.common_words(docs)
        # Three shared words, all of them corpus-wide filler.
        title = "malaysia records factory fires with billion in losses since 2020"
        assert sw._covered_by_any(title, docs, common) is False

    def test_distinctive_words_still_count(self):
        docs = [{"billion", "malaysia", "losses", f"topic{i}"} for i in range(20)]
        docs.append({"tabung", "haji", "restatement", "billion"})
        common = sw.common_words(docs)
        title = "commission finds tabung haji restatement wipes out billion in profit"
        assert sw._covered_by_any(title, docs, common) is True

    def test_empty_corpus_has_no_common_words(self):
        assert sw.common_words([]) == set()


class TestInflightBriefMatching:
    """A brief's topic is its content, not the slug its author happened to pick."""

    BRIEF = """# BRIEF — RCI: Tabung Haji's declared RM3.4b profit for 2017 was a RM1.4b loss

**Slug:** tabung-haji-rci-2017-restatement

## ISSUE

The commission found that for financial year 2017 the pilgrimage fund reported
a RM3.4 billion profit when the accounting standards would have produced a
RM1.4 billion net loss, and that the distribution breached section 22.
"""

    def _briefs(self, tmp_path, monkeypatch, **files):
        for name, body in files.items():
            (tmp_path / f"{name}.md").write_text(body)
        monkeypatch.setattr(sw, "BRIEFS_DIR", tmp_path)
        return sw.load_inflight_docs()

    def test_body_words_absent_from_the_slug_are_picked_up(self, tmp_path, monkeypatch):
        docs = self._briefs(
            tmp_path, monkeypatch, **{"tabung-haji-rci-2017-restatement": self.BRIEF}
        )
        assert "pilgrimage" in docs[0]
        assert "commission" in docs[0]
        # The slug still contributes, so nothing that matched before stops matching.
        assert "restatement" in docs[0]

    def test_headline_sharing_no_slug_words_is_still_covered(self, tmp_path, monkeypatch):
        docs = self._briefs(
            tmp_path, monkeypatch, **{"tabung-haji-rci-2017-restatement": self.BRIEF}
        )
        # Shares nothing with the slug; shares the story with the brief body.
        title = "commission finds pilgrimage fund breached section 22 distribution rules"
        assert sw._covered_by_any(title, [sw._significant_words(sw._brief_topic_text(p))
                                          for p in tmp_path.glob("*.md")]) is True
        assert sw._covered_by_any(title, docs) is True

    def test_slug_only_matching_would_have_missed_it(self, tmp_path, monkeypatch):
        # Pins the defect this replaced: the slug alone shares no significant
        # word with the headline above, so the pick resurfaced as undeveloped
        # while the brief was already at Stage 3.
        slug_words = sw._significant_words("tabung haji rci 2017 restatement")
        title = "commission finds pilgrimage fund breached section 22 distribution rules"
        assert sw._covered_by_any(title, [slug_words]) is False

    def test_ratio_guard_rejects_coincidental_overlap(self, tmp_path, monkeypatch):
        docs = self._briefs(
            tmp_path, monkeypatch, **{"tabung-haji-rci-2017-restatement": self.BRIEF}
        )
        # A long unrelated lede that clips three of the brief's words in
        # passing. Three is enough on a headline-sized document and far too
        # little against a brief.
        title = (
            "bolivian prosecutor orders arrest of former leader over protest "
            "deaths, commission reports billion in damages from the standards "
            "dispute across seven regions this year"
        )
        assert sw._covered_by_any(title, docs, threshold=3) is True
        assert sw._covered_by_any(
            title, docs, threshold=3, min_ratio=sw.INFLIGHT_OVERLAP_RATIO
        ) is False

    def test_ratio_default_leaves_published_matching_unchanged(self):
        docs = [{"commission", "report", "profit", "fund", "loss"}]
        title = "commission report finds fund 2017 profit should have been a loss"
        assert sw._covered_by_any(title, docs) is True

    def test_brief_without_h1_or_sections_falls_back_to_slug(self, tmp_path, monkeypatch):
        docs = self._briefs(tmp_path, monkeypatch, **{"byd-miti-tanjung-malim": ""})
        assert docs and "tanjung" in docs[0]

    def test_bibliography_is_out_of_range(self, tmp_path, monkeypatch):
        # Sources sit far past the topic window, so a candidate that merely
        # shares a citation with an in-flight brief is not suppressed.
        body = "# BRIEF — a narrow topic\n\n" + ("filler word here. " * 200)
        body += "\n## SOURCES\n1. Bolivian prosecutor orders arrest of Morales\n"
        docs = self._briefs(tmp_path, monkeypatch, **{"narrow-topic": body})
        assert "bolivian" not in docs[0]
        assert "morales" not in docs[0]


class TestStubFilter:
    def test_single_word_topic_is_a_stub(self):
        assert sw._is_stub("malay") is True

    def test_calendar_placeholder_is_a_stub(self):
        assert sw._is_stub("parliament budget session session opens") is True
        assert sw._is_stub("budget 2027 presentation") is True

    def test_real_headline_survives(self):
        title = (
            "royal commission finds tabung haji 2017 profit should have been "
            "a rm1.4b loss"
        )
        assert sw._is_stub(title) is False

    def test_parliament_story_is_not_a_calendar_stub(self):
        # Only bare placeholders are stubs; a parliament story with substance
        # must survive the filter.
        title = (
            "new cybercrime and anti-racing bills to join two constitutional "
            "amendments when parliament resumes monday"
        )
        assert sw._is_stub(title) is False


class TestTracks:
    def _candidates(self, items):
        queue = list(items)
        return sw.collect_candidates(queue, NOW)

    def test_fresh_track_ignores_age_weighting(self, monkeypatch):
        monkeypatch.setattr(sw, "load_published_docs", lambda: [])
        monkeypatch.setattr(sw, "load_inflight_docs", lambda: [])
        old = make_item(
            "older quieter story about a state water contract dispute",
            importance=0.45,
            age_days=60,
        )
        fresh = make_item(
            "fresh important story about a federal audit finding released today",
            importance=0.70,
            age_days=2,
        )
        candidates = self._candidates([old, fresh])

        # Accumulated ranking puts the 60-day-old item first (0.99*0.45*2.0
        # beats 0.99*0.70*1.07) — that is the behaviour the fresh track exists
        # to counterbalance.
        assert candidates[0]["age_days"] > 30

        picks = sw.extract_fresh_picks(candidates, top_n=5, window_days=7)
        assert len(picks) == 1
        assert picks[0]["age_days"] == pytest.approx(2, abs=0.1)

    def test_fresh_window_excludes_older_items(self, monkeypatch):
        monkeypatch.setattr(sw, "load_published_docs", lambda: [])
        monkeypatch.setattr(sw, "load_inflight_docs", lambda: [])
        items = [
            make_item("story one about a ministry procurement review", age_days=3),
            make_item("story two about a licensing board decision", age_days=20),
        ]
        candidates = self._candidates(items)
        assert len(sw.extract_fresh_picks(candidates, top_n=5, window_days=7)) == 1
        assert len(sw.extract_fresh_picks(candidates, top_n=5, window_days=30)) == 2

    def test_thresholds_drop_low_silence_and_low_importance(self, monkeypatch):
        monkeypatch.setattr(sw, "load_published_docs", lambda: [])
        monkeypatch.setattr(sw, "load_inflight_docs", lambda: [])
        items = [
            make_item("well covered story about a ministry statement", silence=0.2),
            make_item("trivial story about a local council notice", importance=0.1),
            make_item("qualifying story about an audit finding released", silence=0.9),
        ]
        candidates = self._candidates(items)
        assert len(candidates) == 1
        assert "qualifying" in candidates[0]["title"]


class TestOutputs:
    def test_json_and_markdown_carry_both_tracks(self, monkeypatch, tmp_path):
        monkeypatch.setattr(sw, "load_published_docs", lambda: [])
        monkeypatch.setattr(sw, "load_inflight_docs", lambda: [])
        monkeypatch.setattr(sw, "JSON_OUT", tmp_path / "silence-watch.json")
        monkeypatch.setattr(sw, "MD_OUT", tmp_path / "silence-watch.md")

        items = [
            make_item("accumulated story about a stalled highway audit", age_days=45),
            make_item("fresh story about a commission finding this week", age_days=2),
        ]
        candidates = sw.collect_candidates(items, NOW)
        fresh = sw.extract_fresh_picks(candidates, top_n=5, window_days=7)
        sw.write_json(candidates, fresh, NOW, len(items), 7.0)
        sw.write_markdown(candidates, fresh, NOW, len(items), 7.0)

        payload = json.loads((tmp_path / "silence-watch.json").read_text())
        assert payload["fresh_window_days"] == 7.0
        assert len(payload["picks"]) == 2
        assert len(payload["fresh_picks"]) == 1
        assert payload["fresh_picks"][0]["fresh_score"] == pytest.approx(0.594, abs=1e-3)

        md = (tmp_path / "silence-watch.md").read_text()
        assert "## Fresh signal" in md
        assert "## Accumulated" in md
        assert "### F1." in md
        assert "### S1." in md
