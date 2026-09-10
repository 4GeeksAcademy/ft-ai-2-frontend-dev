# Rule: Wait for Strong Signals Before Writing Code

**No code is written until a strong signal confirms it should be.**

A "strong signal" is one of:

| Signal | What it looks like |
|--------|--------------------|
| **Explicit user approval** | The user says "go ahead", "approved", "proceed", or equivalent. |
| **Formal decision record** | An ADR (Architecture Decision Record) has been written, placed in `memory-bank/decisions/`, and explicitly referenced as the basis for the change. |
| **Refactor step is current** | The current refactor step in `memory-bank/refactor-plan/` is marked `in-progress` and this code change is the exact work described in that step. |

**Actions that do NOT count as strong signals:**
- An agent's own analysis or "best guess"
- A vague user statement like "we should probably..."
- An unanswered question or a question the user hasn't responded to
- The existence of a TODO comment in the code
- A CI failure that hasn't been diagnosed in writing

> **When in doubt, ask. Do not guess.**