# Safety Rules

This directory contains the rules for this project. Each file
addresses a specific concern area. Rules are small, self-contained, and should
be referenced when making changes in the corresponding domain.

## Index

| File | Scope |
|------|-------|
|[00-strong-signals.md](./00-strong-signals.md)|Wait for explicit user approval, ADR, or plan step before writing code.|
|[01-one-step-at-a-time.md](./01-one-step-at-a-time.md)|Only one refactor step may be in-progress at any time.|
|[02-plan-before-act.md](./02-plan-before-act.md)|Read the plan and ADRs first; ask if ambiguous.|
|[03-preserve-behavior.md](./03-preserve-behavior.md)|Refactoring must not alter observable behavior without authorization.|
|[04-no-side-quests.md](./04-no-side-quests.md)|Note extraneous issues; don't fix them without approval.|
|[05-document-every-change.md](./05-document-every-change.md)|Every code change must update a plan step or ADR.|
|[06-commit-frequently.md](./06-commit-frequently.md)|Commit per step with descriptive `refactor(step):` messages.|
|[07-when-stuck.md](./07-when-stuck.md)|Stop, document blocker, propose solution, wait for user.|

---

## Quick Reference: Do / Don't

| Situation | Do | Don't |
|-----------|----|-------|
| You spot duplicate code | Note it for a future step | Refactor it now |
| A test is failing | Diagnose & propose a fix | Fix it without approval |
| The plan says "consolidate" but not how | Ask the user | Pick an approach yourself |
| You finish a step | Commit, mark completed | Start the next step |
