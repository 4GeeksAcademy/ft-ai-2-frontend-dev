# Rule: One Step at a Time

- Only **one** refactor step may be `in-progress` at any time.
- No code may be written for step N+1 until step N is marked `completed` and the user (or an explicit decision record) has confirmed moving forward.
- A "step" is a file in `memory-bank/refactor-plan/`. Each step must be small enough to complete in a single session.