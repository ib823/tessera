"""Explicit clocks for legacy fixtures dated 24 March 2026.

Only tests opting into this fixture freeze time. Production expiry and fresh
evidence regression tests can set their own clocks independently.
"""

from datetime import datetime, timezone
from importlib import import_module

import pytest


@pytest.fixture
def march_stream_clock(monkeypatch):
    class Clock(datetime):
        current = datetime(2026, 3, 24, 6, tzinfo=timezone.utc)

        @classmethod
        def now(cls, tz=None):
            if tz is None:
                return cls.current.replace(tzinfo=None)
            return cls.current.astimezone(tz)

    for name in ("volume_monitor", "cascade_tracker", "polarization",
                 "narrative_frag", "network_bridge", "silence_detector"):
        monkeypatch.setattr(import_module(f"radar.streams.{name}"), "datetime", Clock)
    return Clock
