"""Pydantic models for World Cup data."""

from datetime import date
from typing import Optional

from pydantic import BaseModel, Field, field_validator


class Match(BaseModel):
    match_id: int
    date: date
    stage: str
    group: Optional[str] = None
    team_1: str
    team_2: str
    score_1: int
    score_2: int
    winner: str
    decided_by_penalties: bool
    notes: Optional[str] = None

    @field_validator("group", "notes", mode="before")
    @classmethod
    def empty_str_to_none(cls, value: object) -> object:
        if value == "":
            return None
        return value

    @field_validator("decided_by_penalties", mode="before")
    @classmethod
    def parse_yes_no(cls, value: object) -> object:
        if isinstance(value, str):
            return value.strip().lower() == "yes"
        return value


class Team(BaseModel):
    team: str
    group: str
    confederation: str
    host_nation: bool
    world_cup_debut: bool
    eliminated_round: Optional[str] = None

    @field_validator("eliminated_round", mode="before")
    @classmethod
    def empty_str_to_none(cls, value: object) -> object:
        if value == "":
            return None
        return value

    @field_validator("host_nation", "world_cup_debut", mode="before")
    @classmethod
    def parse_yes_no(cls, value: object) -> object:
        if isinstance(value, str):
            return value.strip().lower() == "yes"
        return value


class WinRatio(BaseModel):
    team_1: str
    team_2: str
    matches_played: int
    team_1_wins: int
    team_2_wins: int
    draws: int
    team_1_win_ratio: float = Field(description="Wins for team_1 / matches_played")
    team_2_win_ratio: float = Field(description="Wins for team_2 / matches_played")


class MatchHistorySummary(BaseModel):
    team_1: str
    team_2: str
    matches_played: int
    team_1_wins: int
    team_2_wins: int
    draws: int
    team_1_goals: int
    team_2_goals: int
    matches: list[Match]
