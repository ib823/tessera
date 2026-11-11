"""RSS news feed connector for Malaysian news outlets."""

from datetime import datetime, timezone
from email.utils import parsedate_to_datetime
from typing import Any

import feedparser

from .base_connector import BaseConnector


class NewsRSSConnector(BaseConnector):
    """Polls RSS feeds from Malaysian news outlets."""

    def __init__(self, config: dict):
        super().__init__("news_rss", config)
        self.feeds = config.get("feeds", [])
        self._seen_urls: set[str] = set()
        # Keep max 10k URLs in dedup set
        self._max_seen = 10_000

    def fetch(self) -> list[dict[str, Any]]:
        """Fetch new articles from all configured RSS feeds."""
        events = []

        for feed_cfg in self.feeds:
            name = feed_cfg["name"]
            url = feed_cfg["url"]
            lang = feed_cfg.get("language", "english")
            region = feed_cfg.get("region", "domestic")

            try:
                parsed = feedparser.parse(url)
            except Exception as e:
                self.log.warning(f"Failed to parse feed {name}: {e}")
                self.record_batch(name, "failed", reason=type(e).__name__)
                continue

            http_status = parsed.get("status", 200)
            if http_status >= 400:
                self.record_batch(name, "rate_limited" if http_status == 429 else "failed",
                                  reason=f"http_{http_status}")
                continue
            if parsed.bozo and not parsed.entries:
                self.log.warning(f"Feed {name} returned no entries (bozo={parsed.bozo})")
                self.record_batch(name, "failed", reason="unparseable_feed")
                continue

            before = len(events)
            for entry in parsed.entries:
                link = entry.get("link", "")
                if link in self._seen_urls:
                    continue
                self._seen_urls.add(link)

                # Parse timestamp
                timestamp = datetime.now(timezone.utc)
                if entry.get("published"):
                    try:
                        timestamp = parsedate_to_datetime(entry.published)
                        if timestamp.tzinfo is None:
                            timestamp = timestamp.replace(tzinfo=timezone.utc)
                    except (ValueError, TypeError):
                        pass

                # Combine title + summary for text
                title = entry.get("title", "")
                summary = entry.get("summary", entry.get("description", ""))
                text = f"{title}. {summary}" if summary else title

                events.append(self.make_event(
                    timestamp=timestamp,
                    text=text,
                    lang=lang,
                    platform="news",
                    source_name=name,
                    url=link,
                    title=title,
                    region=region,
                ))
            fetched = len(events) - before
            self.record_batch(name, "healthy" if fetched else "healthy_empty", fetched)

        # Prune dedup set if too large
        if len(self._seen_urls) > self._max_seen:
            # Keep only the most recent half (rough approximation)
            excess = len(self._seen_urls) - self._max_seen // 2
            for _ in range(excess):
                self._seen_urls.pop()

        return events
