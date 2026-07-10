"""Query helpers for World Cup match data."""

from __future__ import annotations

from worldcup.models import Match, MatchHistorySummary, WinRatio


def matches_by_team(matches: list[Match], team: str) -> list[Match]:
    team_lower = team.lower()
    return [
        match
        for match in matches
        if match.team_1.lower() == team_lower or match.team_2.lower() == team_lower
    ]


def matches_by_stage(matches: list[Match], stage: str) -> list[Match]:
    stage_lower = stage.lower()
    return [match for match in matches if match.stage.lower() == stage_lower]


def _head_to_head(matches: list[Match], team_1: str, team_2: str) -> list[Match]:
    a = team_1.lower()
    b = team_2.lower()
    result: list[Match] = []
    for match in matches:
        sides = {match.team_1.lower(), match.team_2.lower()}
        if sides == {a, b}:
            result.append(match)
    return result


def _goals_for(match: Match, team: str) -> int:
    if match.team_1.lower() == team.lower():
        return match.score_1
    return match.score_2


def win_ratio(matches: list[Match], team_1: str, team_2: str) -> WinRatio:
    h2h = _head_to_head(matches, team_1, team_2)
    team_1_wins = sum(1 for m in h2h if m.winner.lower() == team_1.lower())
    team_2_wins = sum(1 for m in h2h if m.winner.lower() == team_2.lower())
    draws = sum(1 for m in h2h if m.winner.lower() == "draw")
    played = len(h2h)

    return WinRatio(
        team_1=team_1,
        team_2=team_2,
        matches_played=played,
        team_1_wins=team_1_wins,
        team_2_wins=team_2_wins,
        draws=draws,
        team_1_win_ratio=(team_1_wins / played) if played else 0.0,
        team_2_win_ratio=(team_2_wins / played) if played else 0.0,
    )


def match_history(matches: list[Match], team_1: str, team_2: str) -> MatchHistorySummary:
    h2h = _head_to_head(matches, team_1, team_2)
    team_1_wins = sum(1 for m in h2h if m.winner.lower() == team_1.lower())
    team_2_wins = sum(1 for m in h2h if m.winner.lower() == team_2.lower())
    draws = sum(1 for m in h2h if m.winner.lower() == "draw")

    return MatchHistorySummary(
        team_1=team_1,
        team_2=team_2,
        matches_played=len(h2h),
        team_1_wins=team_1_wins,
        team_2_wins=team_2_wins,
        draws=draws,
        team_1_goals=sum(_goals_for(m, team_1) for m in h2h),
        team_2_goals=sum(_goals_for(m, team_2) for m in h2h),
        matches=h2h,
    )
