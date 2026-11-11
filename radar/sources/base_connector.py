"""Base connector class for all data source connectors."""

import time
from abc import ABC, abstractmethod
from datetime import datetime, timezone
from typing import Any

from loguru import logger


class BaseConnector(ABC):
    """Abstract base class for data source connectors.

    All connectors return events in the standardized format:
    {
        "timestamp": "2026-03-24T14:30:00Z",
        "text": "content text",
        "lang": "malay"|"english"|"chinese"|"tamil"|"mixed",
        "platform": "twitter"|"news"|"gdelt"|"google_trends",
        "source_name": "specific source name",
        "metadata": {}  # platform-specific fields
    }
    """

    def __init__(self, name: str, config: dict):
        self.name = name
        self.config = config
        self.log = logger.bind(component=f"source.{name}")
        self.last_fetch: datetime | None = None
        self.error_count = 0
        self.success_count = 0
        self._batch_results: list[dict] = []
        self._events_fetched = 0

    def record_batch(self, label: str, status: str, events_count: int = 0,
                     reason: str | None = None):
        """Record a feed/query outcome, including failures handled by a connector.

        An empty successful response is different from a request that failed.
        Connectors that handle their own errors must report them here.
        """
        result = {"label": label, "status": status, "events_fetched": events_count}
        if reason:
            result["reason"] = reason
        self._batch_results.append(result)
        if status in ("healthy", "healthy_empty"):
            self.success_count += 1
        else:
            self.error_count += 1

    @abstractmethod
    def fetch(self) -> list[dict[str, Any]]:
        """Fetch new events. Returns list of standardized event dicts."""
        ...

    def health_check(self) -> dict:
        """Return connector health status."""
        total = self.success_count + self.error_count
        succeeded = sum(r["status"] in ("healthy", "healthy_empty") for r in self._batch_results)
        failed = len(self._batch_results) - succeeded
        limited = sum(r["status"] == "rate_limited" for r in self._batch_results)
        if not self._batch_results:
            status = "unknown"
        elif failed and succeeded:
            status = "degraded"
        elif failed:
            status = "rate_limited" if limited == failed else "failed"
        else:
            status = "healthy" if self._events_fetched else "healthy_empty"
        return {
            "name": self.name,
            "last_fetch": self.last_fetch.isoformat() if self.last_fetch else None,
            "error_rate": self.error_count / max(total, 1),
            "success_count": self.success_count,
            "error_count": self.error_count,
            "status": status,
            "events_fetched": self._events_fetched,
            "batches": {"attempted": len(self._batch_results), "succeeded": succeeded,
                        "failed": failed, "rate_limited": limited},
            "batch_results": list(self._batch_results),
        }

    def safe_fetch(self) -> list[dict[str, Any]]:
        """Fetch with error handling and retry logic."""
        max_retries = 3
        self._batch_results = []
        self._events_fetched = 0
        for attempt in range(max_retries):
            previous_batches = len(self._batch_results)
            try:
                events = self.fetch()
                self.last_fetch = datetime.now(timezone.utc)
                self._events_fetched = len(events)
                if len(self._batch_results) == previous_batches:
                    self.record_batch(self.name, "healthy" if events else "healthy_empty", len(events))
                self.log.info(f"Fetched {len(events)} events")
                return events
            except Exception as e:
                self.last_fetch = datetime.now(timezone.utc)
                self.record_batch(self.name, "failed", reason=type(e).__name__)
                wait = 2 ** attempt
                self.log.warning(
                    f"Fetch attempt {attempt + 1}/{max_retries} failed: {e}. "
                    f"Retrying in {wait}s..."
                )
                if attempt < max_retries - 1:
                    time.sleep(wait)
        self.log.error(f"All {max_retries} fetch attempts failed")
        return []

    @staticmethod
    def make_event(
        timestamp: datetime,
        text: str,
        lang: str,
        platform: str,
        source_name: str,
        **metadata,
    ) -> dict[str, Any]:
        """Create a standardized event dict."""
        return {
            "timestamp": timestamp.isoformat(),
            "text": text,
            "lang": lang,
            "platform": platform,
            "source_name": source_name,
            "metadata": metadata,
        }
