# T4A Radar — Controversy Detection & Prediction Engine

Stage 0 of The Fourth Angle editorial pipeline. Scans Malaysian discourse to detect and predict controversies across ethnic, religious, political, and economic dimensions.

Based on the mathematical framework in `fourth-angle-controversy-radar-framework.md`.

## Architecture

```
                        ┌─────────────────────────┐
                        │     DATA SOURCES         │
                        │  Twitter/X  News RSS     │
                        │  GDELT    Google Trends   │
                        └──────────┬──────────────┘
                                   │ events
                        ┌──────────▼──────────────┐
                        │   SOURCE AGGREGATOR      │
                        │   Unified event stream   │
                        └──────────┬──────────────┘
                                   │
            ┌──────────┬───────────┼───────────┬──────────┐
            ▼          ▼           ▼           ▼          ▼
     ┌──────────┐┌──────────┐┌──────────┐┌──────────┐┌──────────┐
     │ VOLUME   ││ CASCADE  ││POLARIZE  ││NARRATIVE ││ BRIDGE   │
     │ CUSUM    ││ Hawkes   ││Esteban-  ││  JSD     ││  HHI     │
     │ BOCPD    ││ n*       ││Ray Index ││  Entropy ││ Velocity │
     │ STL      ││ MLE      ││Bimodal   ││  TF-IDF  ││          │
     └────┬─────┘└────┬─────┘└────┬─────┘└────┬─────┘└────┬─────┘
          │           │           │           │           │
          └───────────┴─────┬─────┴───────────┴───────────┘
                            │ alerts
                   ┌────────▼────────┐
                   │ BAYESIAN FUSION │
                   │ Beta-Binomial   │
                   │ Weighted update │
                   └────────┬────────┘
                            │
                   ┌────────▼────────┐
                   │  ISSUE QUEUE    │
                   │  Ranked output  │──→ T4A Pipeline Stage 1
                   └─────────────────┘
```

## Setup

1. Copy `.env.example` to `.env` and add your API keys:
   ```
   cp .env.example .env
   ```

2. Install dependencies:
   ```
   pip install -r requirements.txt
   ```

3. Review `config/config.yaml` for keyword lists and thresholds.

## Usage

```bash
# Run single scan cycle
python run-radar.py --once

# Run continuously (every 30 minutes)
python run-radar.py

# Check current issue queue
python run-radar.py --status

# Get detail on a specific topic
python run-radar.py --topic "corruption"

# Run simulation with synthetic data
python scripts/simulate.py
```

## Output

The radar produces `output/issue-queue.json`:

```json
[
  {
    "issue_id": "T4A-2026-0142",
    "title": "keyword",
    "controversy_score": 0.82,
    "confidence": 0.75,
    "stream_signals": { ... },
    "bias_dimensions_at_risk": ["ethnic", "religious"],
    "priority": "critical",
    "priority_rank": 1
  }
]
```

## Testing

```bash
pytest radar/tests/ -v --tb=short
```

## Detection Streams

| Stream | Method | What it detects |
|--------|--------|-----------------|
| Volume Monitor | CUSUM + BOCPD + STL | Sudden mention spikes |
| Cascade Tracker | Hawkes Process | Self-exciting viral cascades |
| Polarization | Esteban-Ray Index | Ethnic opinion splits |
| Narrative Frag | Jensen-Shannon Divergence | Cross-community framing differences |
| Network Bridge | HHI-based bridge score | Topics crossing community boundaries |

## Global / Malaysia-Impact Pass

In addition to the domestic-Malaysia scan, the radar pulls a curated
**global** news stream — international RSS (BBC, Al Jazeera, NHK, The
Diplomat) plus regional (CNA, Nikkei Asia, SCMP, Caixin) and bilateral
(Jakarta Post, Bangkok Post, The Hindu, Arab News), and a GDELT
malaysia-interest query (themes + adjacent-country actors + keyword
filter). Foreign-channel events are persisted to
`radar/output/foreign-events.json` on a rolling 24h window.

Once a day, `radar/scripts/malaysia-impact-pass.py` reads that buffer
plus `radar/config/malaysia-exposure-map.yaml` (~60 hand-curated
transmission channels — palm oil, ringgit, Strait of Malacca, US chip
controls, Saudi haj, Indonesian haze, etc.) and asks Claude Haiku to
score the events for Malaysia downstream impact. Output:

- `radar/output/malaysia-impact-watch.json` — ranked hypotheses
- `radar/output/malaysia-impact-watch.md` — human briefing

The pass is gated on `ANTHROPIC_API_KEY` — without it, the script
exits cleanly with no output. GitHub Actions workflow:
`.github/workflows/malaysia-impact-pass.yml` runs it daily at 22:00 UTC.
