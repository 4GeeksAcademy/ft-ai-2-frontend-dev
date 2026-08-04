"""Simple Agent Loop — a terminal-based chatbot powered by LiteLLM."""

from __future__ import annotations

import sys

from agent_loop.chat import run_chat
from agent_loop.config import load_config


def main() -> None:
    """Entrypoint: load config, start chat, handle clean exit."""
    try:
        config = load_config()
    except SystemExit as exc:
        print(exc, file=sys.stderr)
        raise

    try:
        run_chat(config)
    except (SystemExit, KeyboardInterrupt):
        # Clean exit requested by the UI (Ctrl+C, /exit)
        pass
    except RuntimeError as exc:
        msg = str(exc)
        if "No available video device" in msg:
            print(
                "Error: This application requires a graphical terminal or "
                "display server (e.g., X11, Wayland, or SSH with -X/-Y).\n"
                "Cannot initialize the video device.",
                file=sys.stderr,
            )
            raise SystemExit(1) from exc
        raise
