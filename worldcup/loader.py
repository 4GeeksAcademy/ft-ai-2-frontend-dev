"""Load World Cup CSV data into pydantic models."""

from __future__ import annotations

import csv
from pathlib import Path

from worldcup.models import Match, Team

DATA_DIR = Path(__file__).resolve().parent.parent / "data"


def load_matches(path: Path | None = None) -> list[Match]:
    csv_path = path or DATA_DIR / "matches.csv"
    with csv_path.open(newline="", encoding="utf-8") as handle:
        reader = csv.DictReader(handle)
        return [Match.model_validate(row) for row in reader]


def load_teams(path: Path | None = None) -> list[Team]:
    csv_path = path or DATA_DIR / "teams.csv"
    with csv_path.open(newline="", encoding="utf-8") as handle:
        reader = csv.DictReader(handle)
        return [Team.model_validate(row) for row in reader]
