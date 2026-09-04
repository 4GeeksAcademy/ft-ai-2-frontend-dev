# Rule: Preserve Existing Behavior

- Refactoring changes must not alter the observable behavior of the application unless a decision record explicitly authorizes a behavior change.
- After every code change, the agent should verify (where practical) that the existing functionality still works — e.g., by checking that the API contract is preserved, or that the UI still renders.
- If a behavior change is discovered to be necessary mid-step, the agent must stop and propose a new ADR or plan amendment before proceeding.