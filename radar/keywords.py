"""Keyword boundaries for whitespace-separated and CJK scripts."""

import re


def _cjk(character: str) -> bool:
    code = ord(character)
    return (0x3400 <= code <= 0x9FFF or 0xF900 <= code <= 0xFAFF
            or 0x20000 <= code <= 0x323AF or 0x3040 <= code <= 0x30FF
            or 0xAC00 <= code <= 0xD7AF)


def keyword_pattern(keyword: str) -> re.Pattern:
    """Match CJK phrases within text and Latin words at word boundaries."""
    left = "" if keyword and _cjk(keyword[0]) else r"(?<!\w)"
    right = "" if keyword and _cjk(keyword[-1]) else r"(?!\w)"
    return re.compile(left + re.escape(keyword) + right, re.IGNORECASE)
