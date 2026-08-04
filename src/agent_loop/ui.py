"""tcod-based terminal UI with scrollable chat history and text input."""

from __future__ import annotations

from collections.abc import Callable

import tcod
import tcod.constants
import tcod.event
import tcod.color

CONSOLE_WIDTH = 80
CONSOLE_HEIGHT = 24

# Colour palette — using tcod.color.Color or plain RGB tuples
# (named colour constants like tcod.black are deprecated)
COLOUR_BG = tcod.color.Color(0, 0, 0)
COLOUR_HEADER_BG = tcod.color.Color(0, 0, 128)
COLOUR_HEADER_FG = tcod.color.Color(255, 255, 255)
COLOUR_INPUT_FG = tcod.color.Color(255, 255, 255)
COLOUR_INPUT_BG = tcod.color.Color(0, 0, 0)
COLOUR_YOU_PREFIX = tcod.color.Color(0, 255, 255)
COLOUR_AGENT_PREFIX = tcod.color.Color(0, 255, 0)
COLOUR_ERROR_PREFIX = tcod.color.Color(255, 0, 0)
COLOUR_TEXT = tcod.color.Color(255, 255, 255)
COLOUR_SEPARATOR = tcod.color.Color(128, 128, 128)


class ChatUI:
    """tcod-based terminal UI with scrollable chat history and text input."""

    def __init__(self) -> None:
        self.messages: list[tuple[str, str]] = []  # (sender, text)
        self.input_buffer: str = ""
        self.scroll_offset: int = 0

    # ── public API used by chat.py ──────────────────────────────────────

    def add_message(self, sender: str, text: str) -> None:
        """Append a message and auto-scroll to it."""
        self.messages.append((sender, text))
        self.scroll_offset = 0  # auto-scroll to newest

    def render(self) -> None:
        """Draw the current state to the terminal."""
        self.console.clear()
        self._draw_header()
        self._draw_messages()
        self._draw_input()
        self.context.present(self.console)

    def run(self, on_message: Callable[[str], None]) -> None:
        """Run the main event loop.

        Args:
            on_message: Called **synchronously** with the user's text when
                        they press Enter.  The UI is rendered before this
                        call, so you can add messages and call ``render()``
                        inside the callback for loading-indicator effects.

        Raises:
            SystemExit: On quit / Ctrl+C.
        """
        with tcod.context.new(
            columns=CONSOLE_WIDTH,
            rows=CONSOLE_HEIGHT,
            title="Simple Agent Loop",
            vsync=True,
        ) as self.context:
            self.console = tcod.console.Console(CONSOLE_WIDTH, CONSOLE_HEIGHT)

            while True:
                self.render()

                for event in tcod.event.wait():
                    if isinstance(event, tcod.event.Quit):
                        return

                    if isinstance(event, tcod.event.KeyDown):
                        self._handle_keydown(event, on_message)

    # ── internal drawing helpers ───────────────────────────────────────

    def _draw_header(self) -> None:
        """Draw the top header bar."""
        title = " Simple Agent Loop "
        hint = "Ctrl+C / /exit to quit"
        self.console.draw_rect(
            0, 0, CONSOLE_WIDTH, 1,
            ord(" "), fg=COLOUR_HEADER_FG, bg=COLOUR_HEADER_BG,
        )
        self.console.print_box(
            0, 0, CONSOLE_WIDTH - len(hint) - 1, 1,
            title, fg=COLOUR_HEADER_FG, bg=COLOUR_HEADER_BG,
        )
        self.console.print_box(
            CONSOLE_WIDTH - len(hint) - 1, 0, len(hint), 1,
            hint, fg=COLOUR_HEADER_FG, bg=COLOUR_HEADER_BG,
        )

        # Separator line below header
        sep_char = tcod.constants.CHAR_HLINE if hasattr(
            tcod.constants, "CHAR_HLINE") else ord("─")
        for x in range(CONSOLE_WIDTH):
            self.console.rgb[x, 1] = sep_char, COLOUR_SEPARATOR, COLOUR_BG

    def _draw_messages(self) -> None:
        """Draw the scrollable message area (rows 2 … height-2)."""
        content_height = CONSOLE_HEIGHT - \
            3  # rows 2 .. height-2 (excl. input bar)

        # Work out which messages are visible given the scroll offset
        start_index = max(0, len(self.messages) -
                          content_height - self.scroll_offset)
        visible = self.messages[start_index:]
        visible = visible[-content_height:]  # clamp to screen height

        y = 2  # start below header + separator
        for sender, text in visible:
            if y >= CONSOLE_HEIGHT - 1:
                break
            prefix, colour = self._prefix_for(sender)
            label = f"{prefix} {text}"
            self.console.print_box(
                1, y, CONSOLE_WIDTH - 2, 1, label, fg=colour)
            y += 1

    def _draw_input(self) -> None:
        """Draw the bottom input bar."""
        input_y = CONSOLE_HEIGHT - 1
        self.console.draw_rect(
            0, input_y, CONSOLE_WIDTH, 1,
            ord(" "), fg=COLOUR_INPUT_FG, bg=COLOUR_INPUT_BG,
        )
        display = f"> {self.input_buffer}"
        self.console.print_box(0, input_y, CONSOLE_WIDTH, 1,
                               display, fg=COLOUR_INPUT_FG, bg=COLOUR_INPUT_BG)

    # ── event handling ──────────────────────────────────────────────────

    def _handle_keydown(  # noqa: PLR0912, PLR0915 — keyboard dispatch
        self,
        event: tcod.event.KeyDown,
        on_message: Callable[[str], None],
    ) -> None:
        sym = event.sym
        ks = tcod.event.KeySym

        # --- quit on Ctrl+C ---
        if sym == ks.c and (event.mod & (tcod.event.Modifier.LCTRL | tcod.event.Modifier.RCTRL)):
            raise SystemExit(0)

        # --- submit ---
        if sym == ks.RETURN:
            text = self.input_buffer.strip()
            self.input_buffer = ""
            if text == "/exit":
                raise SystemExit(0)
            if text:
                on_message(text)
            return

        # --- scrolling ---
        if sym == ks.UP:
            self.scroll_offset = min(
                self.scroll_offset + 1, self._max_scroll())
            return
        if sym == ks.DOWN:
            self.scroll_offset = max(self.scroll_offset - 1, 0)
            return
        if sym == ks.PAGEUP:
            self.scroll_offset = min(
                self.scroll_offset + 10, self._max_scroll())
            return
        if sym == ks.PAGEDOWN:
            self.scroll_offset = max(self.scroll_offset - 10, 0)
            return

        # --- input editing ---
        if sym == ks.BACKSPACE:
            self.input_buffer = self.input_buffer[:-1]
            return
        if sym == ks.SPACE:
            self.input_buffer += " "
            return

        # Printable ASCII character (lowercase letters already handled by SDL)
        if 32 <= sym.value <= 126 and len(self.input_buffer) < CONSOLE_WIDTH - 3:
            self.input_buffer += chr(sym.value)

    # ── helpers ─────────────────────────────────────────────────────────

    @staticmethod
    def _prefix_for(sender: str) -> tuple[str, tcod.color.Color]:
        lower = sender.lower()
        if "error" in lower:
            return f"[{sender}]", COLOUR_ERROR_PREFIX
        if lower == "you":
            return "You:", COLOUR_YOU_PREFIX
        return f"{sender}:", COLOUR_AGENT_PREFIX

    def _max_scroll(self) -> int:
        content_height = CONSOLE_HEIGHT - 3
        return max(0, len(self.messages) - content_height)
