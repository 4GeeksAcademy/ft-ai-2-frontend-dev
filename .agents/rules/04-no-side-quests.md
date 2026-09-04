# Rule: No Side Quests

- If during refactoring the agent notices a bug, code smell, or improvement opportunity **outside** the current plan step, the agent must:
  1. Note it in the session memory (`/memories/session/`).
  2. **Do not fix it.** Do not refactor it. Do not add a TODO comment to the code.
  3. Optionally propose it as a future step after completing the current one.
- The only exception is if the issue **blocks** the current step — in which case the agent must first explain the blocker and get user permission before addressing it.