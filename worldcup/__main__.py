"""Command-line interface for World Cup match summaries."""

from __future__ import annotations

import argparse
import sys

from worldcup.formatters import format_output
from worldcup.loader import load_matches
from worldcup import queries


def build_parser() -> argparse.ArgumentParser:
    shared = argparse.ArgumentParser(add_help=False)
    shared.add_argument(
        "-f",
        "--format",
        choices=("csv", "json", "yaml"),
        default="json",
        help="Output format (default: json).",
    )
    shared.add_argument(
        "--data-dir",
        default=None,
        help="Optional path to a directory containing matches.csv.",
    )

    parser = argparse.ArgumentParser(
        prog="worldcup",
        description="Summarize World Cup match data from CSV files.",
        parents=[shared],
    )
    subparsers = parser.add_subparsers(dest="command", required=True)

    by_team = subparsers.add_parser(
        "by-team",
        parents=[shared],
        help="List matches involving a team.",
    )
    by_team.add_argument("team", help="Team name, e.g. Mexico")

    by_stage = subparsers.add_parser(
        "by-stage",
        parents=[shared],
        help="List matches for a tournament stage.",
    )
    by_stage.add_argument(
        "stage",
        help='Stage name, e.g. "Group Stage", "Round of 32", "Round of 16"',
    )

    win_ratio = subparsers.add_parser(
        "win-ratio",
        parents=[shared],
        help="Show win ratio between two teams in head-to-head matches.",
    )
    win_ratio.add_argument("team_1", help="First team")
    win_ratio.add_argument("team_2", help="Second team")

    history = subparsers.add_parser(
        "history",
        parents=[shared],
        help="Summarize match history between two teams.",
    )
    history.add_argument("team_1", help="First team")
    history.add_argument("team_2", help="Second team")

    return parser


def run(argv: list[str] | None = None) -> int:
    parser = build_parser()
    args = parser.parse_args(argv)

    matches_path = None
    if args.data_dir:
        from pathlib import Path

        matches_path = Path(args.data_dir) / "matches.csv"

    matches = load_matches(matches_path)

    if args.command == "by-team":
        result = queries.matches_by_team(matches, args.team)
    elif args.command == "by-stage":
        result = queries.matches_by_stage(matches, args.stage)
    elif args.command == "win-ratio":
        result = queries.win_ratio(matches, args.team_1, args.team_2)
    elif args.command == "history":
        result = queries.match_history(matches, args.team_1, args.team_2)
    else:
        parser.error(f"Unknown command: {args.command}")
        return 2

    sys.stdout.write(format_output(result, args.format))
    return 0


def main() -> None:
    raise SystemExit(run())


if __name__ == "__main__":
    main()
