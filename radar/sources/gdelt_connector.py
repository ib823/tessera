"""GDELT DOC API connector — domestic + global Malaysia-interest scans.

GDELT DOC API permits up to 32 logical OR operands per query and recommends
short focused queries. The malaysia_interest scan therefore issues several
narrower queries per cycle rather than one large OR.

Two complementary scan strategies for the global scope:
  Strategy A — themes × keywords. High precision: requires a Malaysia-channel
  theme (e.g. ECON_TRADE, SANCTIONS) AND a Malaysia-adjacent keyword.
  Strategy B — themes × adjacent-country source filter. Catches stories
  tagged with relevant themes published in neighbour countries.

Events carry metadata.scope ∈ {"domestic","malaysia_interest"} so
downstream consumers can filter foreign-channel events.
"""

import os
import time
from datetime import datetime, timezone
from typing import Any

import requests

from .base_connector import BaseConnector

# Keep batches small enough that any single query stays well under 32 OR
# operands. Total query count per cycle = ceil(themes/T) × ceil(kw/K) +
# ceil(themes/T) × ceil(actors/A). Tuned for ~10 queries per scan.
THEMES_PER_BATCH = 7
KEYWORDS_PER_BATCH = 7
ACTORS_PER_BATCH = 7
SLEEP_BETWEEN_QUERIES_SEC = 0.5


class GDELTConnector(BaseConnector):
    """Queries GDELT DOC API for Malaysia-related events and tone data."""

    def __init__(self, config: dict):
        super().__init__("gdelt", config)
        self.api_url = os.environ.get(
            "GDELT_API_URL", "https://api.gdeltproject.org/api/v2/doc/doc"
        )
        self.domestic_cfg = config.get("domestic", {}) or {}
        self.interest_cfg = config.get("malaysia_interest", {}) or {}
        # Backwards compatibility with the pre-2026-05 schema
        if not self.domestic_cfg and config.get("country_filter"):
            self.domestic_cfg = {
                "enabled": True,
                "country": config["country_filter"],
                "maxrecords": 250,
                "timespan": "60min",
            }

    def fetch(self) -> list[dict[str, Any]]:
        events: list[dict[str, Any]] = []
        if self.domestic_cfg.get("enabled", False):
            events.extend(self._fetch_domestic())
        if self.interest_cfg.get("enabled", False):
            events.extend(self._fetch_malaysia_interest())
        return events

    def _fetch_domestic(self) -> list[dict[str, Any]]:
        country = self.domestic_cfg.get("country", "MY")
        return self._query(
            query_str=f"sourcecountry:{country}",
            scope="domestic",
            maxrecords=self.domestic_cfg.get("maxrecords", 250),
            timespan=self.domestic_cfg.get("timespan", "60min"),
        )

    def _fetch_malaysia_interest(self) -> list[dict[str, Any]]:
        themes = self.interest_cfg.get("themes", []) or []
        keywords = self.interest_cfg.get("keywords", []) or []
        actors = self.interest_cfg.get("adjacent_actors", []) or []
        maxrecords = self.interest_cfg.get("maxrecords", 250)
        timespan = self.interest_cfg.get("timespan", "60min")

        events: list[dict[str, Any]] = []
        seen_urls: set[str] = set()

        # Strategy A: themes × keywords (high precision)
        if themes and keywords:
            for theme_batch in _batch(themes, THEMES_PER_BATCH):
                for kw_batch in _batch(keywords, KEYWORDS_PER_BATCH):
                    theme_part = " OR ".join(f"theme:{t}" for t in theme_batch)
                    kw_part = " OR ".join(_quote(k) for k in kw_batch)
                    query = f"({theme_part}) AND ({kw_part})"
                    batch_events = self._query(query, "malaysia_interest", maxrecords, timespan)
                    events.extend(self._dedupe(batch_events, seen_urls))
                    time.sleep(SLEEP_BETWEEN_QUERIES_SEC)

        # Strategy B: themes × adjacent source countries (captures regional tagging)
        if themes and actors:
            for theme_batch in _batch(themes, THEMES_PER_BATCH):
                for actor_batch in _batch(actors, ACTORS_PER_BATCH):
                    theme_part = " OR ".join(f"theme:{t}" for t in theme_batch)
                    actor_part = " OR ".join(f"sourcecountry:{a}" for a in actor_batch)
                    query = f"({theme_part}) AND ({actor_part})"
                    batch_events = self._query(query, "malaysia_interest", maxrecords, timespan)
                    events.extend(self._dedupe(batch_events, seen_urls))
                    time.sleep(SLEEP_BETWEEN_QUERIES_SEC)

        return events

    @staticmethod
    def _dedupe(events: list[dict], seen: set) -> list[dict]:
        out = []
        for ev in events:
            url = (ev.get("metadata") or {}).get("url", "")
            key = url or ev.get("text", "")[:120]
            if key in seen:
                continue
            seen.add(key)
            out.append(ev)
        return out

    def _query(
        self,
        query_str: str,
        scope: str,
        maxrecords: int,
        timespan: str,
    ) -> list[dict[str, Any]]:
        params = {
            "query": query_str,
            "mode": "ArtList",
            "maxrecords": maxrecords,
            "format": "json",
            "sort": "DateDesc",
            "timespan": timespan,
        }

        try:
            resp = requests.get(self.api_url, params=params, timeout=15)
            if resp.status_code == 429:
                self.log.warning(f"GDELT rate limited ({scope}) — skipping this batch")
                return []
            resp.raise_for_status()
            text = resp.text.strip()
            if not text or text[0] != '{':
                self.log.warning(f"GDELT {scope} non-JSON: {text[:100]}")
                return []
            data = resp.json()
        except requests.RequestException as e:
            self.log.warning(f"GDELT {scope} request failed: {e}")
            return []
        except ValueError as e:
            self.log.warning(f"GDELT {scope} invalid JSON: {e}")
            return []

        articles = data.get("articles", []) or []
        events: list[dict[str, Any]] = []

        for art in articles:
            date_str = art.get("seendate", "")
            try:
                timestamp = datetime.strptime(date_str, "%Y%m%dT%H%M%SZ").replace(
                    tzinfo=timezone.utc
                )
            except (ValueError, TypeError):
                timestamp = datetime.now(timezone.utc)

            source_lang = (art.get("language") or "English").lower()
            if source_lang in ("malay", "bahasa melayu", "indonesian"):
                lang = "malay"
            elif source_lang in ("chinese", "mandarin"):
                lang = "chinese"
            elif source_lang == "tamil":
                lang = "tamil"
            else:
                lang = "english"

            events.append(self.make_event(
                timestamp=timestamp,
                text=art.get("title", ""),
                lang=lang,
                platform="gdelt",
                source_name=art.get("domain", "unknown"),
                url=art.get("url", ""),
                tone=art.get("tone", 0.0),
                goldstein_score=None,
                socialimage=art.get("socialimage", ""),
                scope=scope,
                source_country=art.get("sourcecountry", ""),
            ))

        return events


def _batch(items: list, size: int) -> list[list]:
    if not items:
        return []
    return [items[i:i + size] for i in range(0, len(items), size)]


def _quote(kw: str) -> str:
    """Wrap multi-word keywords in quotes for GDELT phrase search."""
    return f'"{kw}"' if " " in kw else kw


# Backwards-compatible export for any existing callers
_batch_keywords = _batch
