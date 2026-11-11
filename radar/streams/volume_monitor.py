"""Stream 1: Volume Monitor — CUSUM + STL + BOCPD change-point detection.

Monitors mention counts per keyword/platform/language in 15-minute windows.
Detects controversy spikes using:
  - CUSUM (Cumulative Sum) — O(1) per observation, optimal for abrupt shifts
  - STL decomposition — removes daily/weekly seasonality before alerting
  - BOCPD (Bayesian Online Change Point Detection) — full posterior over regime changes

Reference: framework §2.4 (Change-Point Detection)
"""

import ast
import hashlib
from collections import defaultdict
from datetime import datetime, timezone, timedelta
from typing import Any

import numpy as np
from loguru import logger

from radar.keywords import keyword_pattern


class CUSUMDetector:
    """Page's CUSUM for detecting abrupt mean shifts.

    Runs on deseasonalized residuals. O(1) per observation, constant memory.
    """

    def __init__(self, k: float = 0.5, h: float = 4.0, cooldown_steps: int = 8):
        self.k = k  # Allowance parameter (slack)
        self.h = h  # Decision threshold
        self.cooldown_steps = cooldown_steps  # Steps after alert before re-alerting
        self.s_plus = 0.0
        self.s_minus = 0.0
        self._cooldown = 0

    def update(self, z: float) -> dict | None:
        """Process one standardized observation. Returns alert dict or None."""
        if self._cooldown > 0:
            self._cooldown -= 1
            # Still accumulate but don't alert
            self.s_plus = max(0.0, self.s_plus + z - self.k)
            self.s_minus = max(0.0, self.s_minus - z - self.k)
            return None

        self.s_plus = max(0.0, self.s_plus + z - self.k)
        self.s_minus = max(0.0, self.s_minus - z - self.k)

        if self.s_plus > self.h:
            severity = min(1.0, self.s_plus / (2 * self.h))
            self.s_plus = 0.0
            self._cooldown = self.cooldown_steps
            return {"direction": "up", "severity": severity, "statistic": self.s_plus}

        if self.s_minus > self.h:
            severity = min(1.0, self.s_minus / (2 * self.h))
            self.s_minus = 0.0
            self._cooldown = self.cooldown_steps
            return {"direction": "down", "severity": severity, "statistic": self.s_minus}

        return None

    def reset(self):
        self.s_plus = 0.0
        self.s_minus = 0.0
        self._cooldown = 0

    def get_state(self) -> dict:
        return {"s_plus": self.s_plus, "s_minus": self.s_minus, "cooldown": self._cooldown}

    def load_state(self, state: dict):
        self.s_plus = state.get("s_plus", 0.0)
        self.s_minus = state.get("s_minus", 0.0)
        self._cooldown = state.get("cooldown", 0)


class STLDeseasonalizer:
    """Simple seasonal decomposition for removing daily/weekly patterns.

    Uses a rolling-window approach rather than full STL when we have
    insufficient data for statsmodels STL (needs >= 2 full periods).
    Falls back to statsmodels STL when enough data accumulates.
    """

    def __init__(self, daily_period: int = 96, weekly_period: int = 672):
        self.daily_period = daily_period
        self.weekly_period = weekly_period
        self._history: list[float] = []
        self._max_history = weekly_period * 3  # Keep 3 weeks

    def add_and_deseasonalize(self, value: float) -> float:
        """Add observation and return deseasonalized residual.

        Returns value minus the expected seasonal value at this position.
        A residual near 0 means the value matches the seasonal pattern.
        """
        self._history.append(value)

        # Trim history
        if len(self._history) > self._max_history:
            self._history = self._history[-self._max_history:]

        n = len(self._history)

        if n >= self.daily_period * 2:
            # Compute expected value at each position in the cycle
            period = self.daily_period
            seasonal_means = np.zeros(period)
            seasonal_counts = np.zeros(period)
            for i, v in enumerate(self._history):
                pos = i % period
                seasonal_means[pos] += v
                seasonal_counts[pos] += 1
            seasonal_counts = np.maximum(seasonal_counts, 1)
            seasonal_means /= seasonal_counts

            current_pos = (n - 1) % period
            # Residual = observed - expected at this time of day
            return value - seasonal_means[current_pos]

        # Not enough data — just subtract recent mean
        window = self._history[-min(n, 96):]
        return value - np.mean(window)

    def get_baseline_stats(self, window_days: int = 7) -> tuple[float, float]:
        """Return (mean, std) from the baseline window."""
        window_size = window_days * self.daily_period
        data = self._history[-window_size:] if len(self._history) >= window_size else self._history
        if len(data) < 2:
            return 0.0, 1.0
        return float(np.mean(data)), max(float(np.std(data)), 0.01)


class BOCPDDetector:
    """Bayesian Online Change Point Detection (Adams & MacKay, 2007).

    Uses Normal-Gamma conjugate prior for Gaussian observations.
    Maintains run-length posterior P(r_t | x_{1:t}).
    """

    def __init__(
        self,
        hazard_lambda: float = 200.0,
        threshold: float = 0.5,
        max_run_length: int = 500,
    ):
        self.hazard = 1.0 / hazard_lambda  # Constant hazard rate
        self.threshold = threshold
        self.max_run_length = max_run_length

        # Normal-Gamma prior hyperparameters
        self.mu0 = 0.0
        self.kappa0 = 1.0
        self.alpha0 = 1.0
        self.beta0 = 1.0

        # Run-length posterior (log space for numerical stability)
        self._log_R = np.array([0.0])  # P(r_0 = 0) = 1

        # Sufficient statistics per run length
        self._sum_x = np.array([0.0])
        self._sum_x2 = np.array([0.0])
        self._n = np.array([0.0])

    def update(self, x: float) -> dict | None:
        """Process one observation. Returns alert dict if changepoint detected."""
        # Predictive probability for each run length
        log_pred = self._log_predictive(x)

        # Growth probabilities: P(r_t = r_{t-1} + 1)
        log_growth = self._log_R + log_pred + np.log(1.0 - self.hazard)

        # Changepoint probability: P(r_t = 0)
        log_cp = np.logaddexp.reduce(self._log_R + log_pred + np.log(self.hazard))

        # New run-length posterior
        new_log_R = np.concatenate([[log_cp], log_growth])

        # Normalize
        log_evidence = np.logaddexp.reduce(new_log_R)
        new_log_R -= log_evidence

        # Update sufficient statistics
        new_n = np.concatenate([[0.0], self._n + 1.0])
        new_sum_x = np.concatenate([[0.0], self._sum_x + x])
        new_sum_x2 = np.concatenate([[0.0], self._sum_x2 + x * x])

        # Truncate for O(1) memory
        if len(new_log_R) > self.max_run_length:
            new_log_R = new_log_R[: self.max_run_length]
            new_n = new_n[: self.max_run_length]
            new_sum_x = new_sum_x[: self.max_run_length]
            new_sum_x2 = new_sum_x2[: self.max_run_length]
            # Renormalize after truncation
            log_evidence = np.logaddexp.reduce(new_log_R)
            new_log_R -= log_evidence

        self._log_R = new_log_R
        self._n = new_n
        self._sum_x = new_sum_x
        self._sum_x2 = new_sum_x2

        # Check if a recent changepoint is detected
        # Sum probability of run lengths 0-2 (changepoint in last 3 steps)
        max_recent = min(3, len(new_log_R))
        cp_prob = float(np.sum(np.exp(new_log_R[:max_recent])))
        # Also check if the MAP run length just dropped significantly
        map_run_length = int(np.argmax(new_log_R))
        if cp_prob > self.threshold or map_run_length <= 2:
            if cp_prob > self.threshold:
                return {
                    "changepoint_probability": cp_prob,
                    "severity": min(1.0, cp_prob),
                }
        return None

    def _log_predictive(self, x: float) -> np.ndarray:
        """Log predictive probability under Normal-Gamma posterior for each run length."""
        # Posterior hyperparameters for each run length
        kappa_n = self.kappa0 + self._n
        mu_n = (self.kappa0 * self.mu0 + self._sum_x) / kappa_n
        alpha_n = self.alpha0 + self._n / 2.0
        beta_n = (
            self.beta0
            + 0.5 * (self._sum_x2 - self._sum_x**2 / np.maximum(self._n, 1e-10))
            + 0.5 * self.kappa0 * self._n * (self._sum_x / np.maximum(self._n, 1e-10) - self.mu0) ** 2
            / kappa_n
        )
        beta_n = np.maximum(beta_n, 1e-10)

        # Student-t predictive: t_{2*alpha_n}(mu_n, beta_n*(kappa_n+1)/(alpha_n*kappa_n))
        df = 2.0 * alpha_n
        scale = np.sqrt(beta_n * (kappa_n + 1.0) / (alpha_n * kappa_n))
        scale = np.maximum(scale, 1e-10)

        # Student-t log pdf (vectorized)
        from scipy.special import gammaln

        z = (x - mu_n) / scale
        log_p = (
            gammaln((df + 1.0) / 2.0)
            - gammaln(df / 2.0)
            - 0.5 * np.log(df * np.pi)
            - np.log(scale)
            - ((df + 1.0) / 2.0) * np.log(1.0 + z**2 / df)
        )

        return log_p

    def get_state(self) -> dict:
        return {
            "log_R": self._log_R.tolist(),
            "sum_x": self._sum_x.tolist(),
            "sum_x2": self._sum_x2.tolist(),
            "n": self._n.tolist(),
        }

    def load_state(self, state: dict):
        self._log_R = np.array(state["log_R"])
        self._sum_x = np.array(state["sum_x"])
        self._sum_x2 = np.array(state["sum_x2"])
        self._n = np.array(state["n"])


class VolumeMonitor:
    """Combines CUSUM + STL + BOCPD for volume-based change-point detection.

    Maintains per-keyword, per-platform, per-language time series.
    """

    def __init__(self, config: dict):
        self.config = config
        self.log = logger.bind(component="volume_monitor")

        # Parameters
        cusum_cfg = config.get("cusum", {})
        bocpd_cfg = config.get("bocpd", {})
        stl_cfg = config.get("stl", {})

        self.cusum_k = cusum_cfg.get("k", 0.5)
        self.cusum_h = cusum_cfg.get("h", 4.0)
        cooldown_hours = cusum_cfg.get("cooldown_hours", 2)
        self.bucket_minutes = config.get("bucket_minutes", 15)
        self.cooldown_steps = int(cooldown_hours * 60 / self.bucket_minutes)

        self.hazard_lambda = bocpd_cfg.get("hazard_lambda", 200)
        self.bocpd_threshold = bocpd_cfg.get("changepoint_threshold", 0.5)
        self.max_run_length = bocpd_cfg.get("max_run_length", 500)

        self.daily_period = stl_cfg.get("daily_period", 96)
        self.weekly_period = stl_cfg.get("weekly_period", 672)
        self.baseline_days = config.get("baseline_window_days", 7)
        self.keywords = tuple(dict.fromkeys(
            str(kw).lower() for kw in config.get("keywords", []) if str(kw).strip()
        ))
        self._keyword_patterns = [(kw, keyword_pattern(kw)) for kw in self.keywords]
        self.retention_days = config.get("retention_days", max(self.baseline_days, 7))
        self.max_seen_events = max(1, config.get("max_seen_events", 20_000))
        self.max_keys = max(1, config.get("max_keys", 2_000))

        # Per-key state: key = (keyword, platform, language)
        self._cusum: dict[tuple, CUSUMDetector] = defaultdict(
            lambda: CUSUMDetector(self.cusum_k, self.cusum_h, self.cooldown_steps)
        )
        self._bocpd: dict[tuple, BOCPDDetector] = defaultdict(
            lambda: BOCPDDetector(self.hazard_lambda, self.bocpd_threshold, self.max_run_length)
        )
        self._stl: dict[tuple, STLDeseasonalizer] = defaultdict(
            lambda: STLDeseasonalizer(self.daily_period, self.weekly_period)
        )

        # Event-time buckets and a watermark survive scheduled --once runs.
        # The watermark is the first bucket not yet processed.
        self._pending: dict[datetime, dict[tuple, int]] = {}
        self._next_bucket: datetime | None = None
        self._first_bucket: dict[tuple, datetime] = {}
        self._last_seen: dict[tuple, datetime] = {}
        self._seen_events: dict[str, datetime] = {}

        # Active alerts
        self._active_alerts: list[dict] = []

    @staticmethod
    def _utc(value) -> datetime | None:
        try:
            parsed = value if isinstance(value, datetime) else datetime.fromisoformat(str(value).replace("Z", "+00:00"))
            return parsed.replace(tzinfo=timezone.utc) if parsed.tzinfo is None else parsed.astimezone(timezone.utc)
        except (ValueError, TypeError, OverflowError):
            return None

    def _bucket(self, timestamp: datetime) -> datetime:
        seconds = self.bucket_minutes * 60
        return datetime.fromtimestamp(int(timestamp.timestamp() // seconds) * seconds, timezone.utc)

    def process(self, events: list[dict[str, Any]], now: datetime | None = None):
        """Count new documents by event time and process completed buckets.

        Already-closed buckets are immutable: delayed/replayed documents cannot
        be counted as a fresh spike in a later scheduled scan.
        """
        now = self._utc(now or datetime.now(timezone.utc))
        cutoff = now - timedelta(days=self.retention_days)
        for event in events:
            ts = self._utc(event.get("timestamp"))
            if ts is None or ts < cutoff or ts > now:
                continue
            bucket = self._bucket(ts)
            if self._next_bucket is not None and bucket < self._next_bucket:
                continue
            text = str(event.get("text", ""))
            url = (event.get("metadata") or {}).get("url")
            identity = str(url) if url else f"{event.get('platform', '')}|{text}|{ts.isoformat()}"
            fingerprint = hashlib.sha256(identity.encode()).hexdigest()
            if fingerprint in self._seen_events:
                continue
            self._seen_events[fingerprint] = ts
            lang = event.get("lang", "unknown")
            platform = event.get("platform", "unknown")
            for kw in self._extract_keywords(text):
                key = (kw, platform, lang)
                if key not in self._first_bucket and len(self._first_bucket) >= self.max_keys:
                    continue
                self._first_bucket[key] = min(bucket, self._first_bucket.get(key, bucket))
                self._last_seen[key] = max(bucket, self._last_seen.get(key, bucket))
                counts = self._pending.setdefault(bucket, {})
                counts[key] = counts.get(key, 0) + 1
        self._seen_events = dict(sorted(
            ((key, ts) for key, ts in self._seen_events.items() if ts >= cutoff),
            key=lambda item: item[1],
        )[-self.max_seen_events:])
        self.flush_completed(now)

    def _extract_keywords(self, text: str) -> list[str]:
        """Use configured topics, with the legacy fallback for standalone callers."""
        if self._keyword_patterns:
            text = text.lower()
            return [kw for kw, pattern in self._keyword_patterns if pattern.search(text)]
        words = text.lower().split()
        stop = {"the", "a", "an", "is", "was", "are", "in", "on", "at", "to", "for",
                "of", "and", "or", "but", "yang", "dan", "ini", "itu", "di", "ke"}
        significant = [w for w in words if len(w) > 3 and w not in stop]
        if significant:
            return [significant[0]]  # Use first significant word as topic key
        return ["_general"]

    def process_count(self, key: tuple, count: float, timestamp: datetime):
        """Directly process a count for a specific key. Used in testing."""
        stl = self._stl[key]
        cusum = self._cusum[key]
        bocpd = self._bocpd[key]

        # Deseasonalize
        residual = stl.add_and_deseasonalize(count)

        # Standardize the deseasonalized residual for CUSUM
        mean, std = stl.get_baseline_stats(self.baseline_days)
        # For z-score, we want: how many std deviations is this residual from 0?
        # If the seasonal model is good, residual should be ~ N(0, sigma_residual)
        # Use overall std as a conservative estimate of residual std
        if std < 0.1:
            z = 0.0
        else:
            z = residual / std

        # Run CUSUM on standardized deseasonalized residual
        cusum_alert = cusum.update(z)
        if cusum_alert:
            alert = {
                "keyword": key[0],
                "platform": key[1],
                "language": key[2],
                "alert_type": "cusum",
                "severity": cusum_alert["severity"],
                "timestamp": timestamp.isoformat(),
                "baseline_rate": mean,
                "current_rate": count,
                "z_score": z,
                "direction": cusum_alert["direction"],
            }
            self._active_alerts.append(alert)

        # Run BOCPD on raw value
        bocpd_alert = bocpd.update(count)
        if bocpd_alert:
            alert = {
                "keyword": key[0],
                "platform": key[1],
                "language": key[2],
                "alert_type": "bocpd",
                "severity": bocpd_alert["severity"],
                "timestamp": timestamp.isoformat(),
                "baseline_rate": mean,
                "current_rate": count,
                "z_score": z,
                "changepoint_probability": bocpd_alert["changepoint_probability"],
            }
            self._active_alerts.append(alert)

    def flush_completed(self, now: datetime | None = None):
        """Flush closed event-time buckets, including zero counts between scans."""
        now = self._utc(now or datetime.now(timezone.utc))
        completed_end = self._bucket(now)
        cutoff = completed_end - timedelta(days=self.retention_days)
        expired = {key for key, ts in self._last_seen.items() if ts < cutoff}
        for key in expired:
            for states in (self._first_bucket, self._last_seen, self._stl, self._cusum, self._bocpd):
                states.pop(key, None)
        self._pending = {ts: {key: count for key, count in counts.items() if key not in expired}
                         for ts, counts in self._pending.items() if ts >= cutoff}
        self._seen_events = {key: ts for key, ts in self._seen_events.items() if ts >= cutoff}
        if self._next_bucket is None:
            self._next_bucket = min(self._pending, default=completed_end)
        cursor = max(self._next_bucket, cutoff)
        step = timedelta(minutes=self.bucket_minutes)
        while cursor < completed_end:
            counts = self._pending.pop(cursor, {})
            for key, first in self._first_bucket.items():
                if first <= cursor:
                    self.process_count(key, float(counts.get(key, 0)), cursor + step)
            cursor += step
        self._next_bucket = max(cursor, self._next_bucket)
        self.get_active_alerts(now)

    def get_active_alerts(self, now: datetime | None = None) -> list[dict]:
        """Return all active alerts sorted by severity descending."""
        # Keep only alerts from last 24 hours
        cutoff = self._utc(now or datetime.now(timezone.utc)) - timedelta(hours=24)
        self._active_alerts = [
            a for a in self._active_alerts
            if (self._utc(a.get("timestamp")) or datetime.min.replace(tzinfo=timezone.utc)) >= cutoff
        ]
        return sorted(self._active_alerts, key=lambda a: a.get("severity", 0), reverse=True)

    def get_state(self) -> dict:
        """Serialize state for persistence."""
        return {
            "version": 2,
            "cusum": {str(k): v.get_state() for k, v in self._cusum.items()},
            "bocpd": {str(k): v.get_state() for k, v in self._bocpd.items()},
            "stl": {str(k): list(v._history) for k, v in self._stl.items()},
            "next_bucket": self._next_bucket.isoformat() if self._next_bucket else None,
            "pending": {ts.isoformat(): {str(k): count for k, count in counts.items()}
                        for ts, counts in self._pending.items()},
            "first_bucket": {str(k): ts.isoformat() for k, ts in self._first_bucket.items()},
            "last_seen": {str(k): ts.isoformat() for k, ts in self._last_seen.items()},
            "seen_events": {key: ts.isoformat() for key, ts in self._seen_events.items()},
            "active_alerts": [dict(alert) for alert in self._active_alerts],
        }

    def load_state(self, state: dict):
        """Restore state from persistence."""
        for k_str, v in state.get("cusum", {}).items():
            key = self._state_key(k_str)
            self._cusum[key].load_state(v)
        for k_str, v in state.get("bocpd", {}).items():
            key = self._state_key(k_str)
            self._bocpd[key].load_state(v)
        for k_str, history in state.get("stl", {}).items():
            stl = self._stl[self._state_key(k_str)]
            stl._history = list(history)[-stl._max_history:]
        self._next_bucket = self._utc(state.get("next_bucket"))
        self._pending = {self._utc(ts): {self._state_key(k): int(count) for k, count in counts.items()}
                         for ts, counts in state.get("pending", {}).items() if self._utc(ts) is not None}
        for attribute in ("first_bucket", "last_seen"):
            setattr(self, "_" + attribute, {self._state_key(k): self._utc(ts)
                    for k, ts in state.get(attribute, {}).items() if self._utc(ts) is not None})
        self._seen_events = {key: self._utc(ts) for key, ts in state.get("seen_events", {}).items()
                             if self._utc(ts) is not None}
        self._active_alerts = list(state.get("active_alerts", []))

    @staticmethod
    def _state_key(value: str) -> tuple:
        key = ast.literal_eval(value)
        if not isinstance(key, tuple) or len(key) != 3 or not all(isinstance(part, str) for part in key):
            raise ValueError("Invalid volume state key")
        return key
