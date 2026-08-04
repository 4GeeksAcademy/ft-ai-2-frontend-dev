"""Chat loop — integrates the UI with the LLM backend."""

from __future__ import annotations

from agent_loop.config import Config
from agent_loop.llm import ask_llm
from agent_loop.ui import ChatUI


def run_chat(config: Config) -> None:
    """Run the interactive chat session.

    Args:
        config: Application configuration (API key, model, base URL).
    """
    ui = ChatUI()

    def handle_message(text: str) -> None:
        """Callback invoked when the user submits a message."""
        # Show user message immediately
        ui.add_message("You", text)
        ui.render()

        # Show a brief loading indicator
        ui.add_message("…", "thinking …")
        ui.render()

        try:
            response = ask_llm(prompt=text, config=config)
            # Replace loading message with the actual response
            ui.messages.pop()  # remove the "thinking …" line
            ui.add_message("Agent", response)
        except Exception as exc:  # noqa: BLE001
            ui.messages.pop()  # remove the "thinking …" line
            ui.add_message("Error", f"{exc!s}")

    ui.run(on_message=handle_message)
