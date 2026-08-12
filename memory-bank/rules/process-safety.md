# AI / Development Process Safety Rules

## Prompt & Context Hygiene

1. **Specify the full context.** When asking an AI to write code, include the
   relevant architecture context, existing patterns, and constraints. Ambiguous
   prompts produce unsafe code.

2. **Review all AI-generated code.** Never accept AI output without human review.
   Treat AI as a pair programmer, not an autonomous developer. Every change must
   be understood before it is committed.

3. **Test AI-generated code.** Any code produced by an AI must have corresponding
   tests (unit, integration, or manual as appropriate) before merge.

4. **Keep the memory-bank current.** When a decision is made or a pattern is
   established, record it in the memory-bank. Stale documentation leads to
   inconsistent and unsafe code.

## Individual Task Scope

5. **One file or concern per AI interaction.** When working with an AI on code
   generation, scope each interaction to a single file or a single logical
   concern. Broad requests like "build the whole app" produce brittle, untestable
   results. Break the work into focused steps.

6. **Validate incrementally.** After each task-sized unit is generated, verify it
   before moving on — check types, lint, run tests, or visually confirm. Do not
   batch multiple untested changes before verifying.

7. **Define the boundary before starting.** Before asking an AI to write code,
   clearly state what is in scope for *this* interaction and what is explicitly
   out of scope. This prevents scope creep and produces cleaner results.

8. **Prefer small, focused prompts.** A prompt should describe one thing to build
   or change, with enough context for the AI to do it correctly. If a prompt
   reads like a list of unrelated items, split it into separate interactions.

## Code Review Safety

9. **One concern per PR.** Pull requests should address a single logical change.
   Mixing features, refactors, and fixes in one PR makes review difficult and
   increases the chance of introducing bugs.

10. **Run linting and type checking before commit.** Use pre-commit hooks or CI
    to enforce `tsc --noEmit`, `eslint`, `prettier --check`, `mypy` (or
    `pyright`), and `autopep8` before code is merged.

11. **Don't suppress linters without justification.** A comment must accompany
    any `eslint-disable`, `# type: ignore`, or `# noqa` explaining the reason.

## Branch & Commit Safety

12. **Feature branches.** All development should happen on feature branches
    branched from `main`. Never commit directly to `main`.

13. **Meaningful commit messages.** Commit messages should explain *why* a change
    was made, not just *what* changed. Follow conventional commits format
    (`feat:`, `fix:`, `chore:`, `docs:`, etc.).

14. **Don't commit generated files.** Build artifacts, `node_modules/`,
    `.next/`, `__pycache__/`, `*.pyc`, and similar generated files must be in
    `.gitignore` and never committed.

## Human-in-the-Loop & Scope Discipline

18. **Never build without asking.** AI agents must never write implementation
    code (files, routes, components, tests, migrations) unless a human has
    explicitly requested it or approved a plan to do so. "Helping spec out a
    project" means producing documents, outlines, and plans — not writing
    application code.

19. **Spec phase and build phase are separate.** When a user asks for a spec,
    design document, or architecture plan, produce only that. Do not begin
    implementing the spec unless the user follows up with a request to build.
    Treat "spec this out" and "build this" as two distinct, gated interactions.

20. **Ask before expanding scope.** If a task naturally leads to additional
    work (e.g., fixing a bug reveals a related issue, or building a feature
    suggests a refactor), flag it to the user rather than doing it. Do not
    expand scope without confirmation.

21. **Explicit go-ahead required.** Before writing any code that affects more
    than a trivial change, state concisely what you intend to build and wait
    for the user to say yes. This is especially important when:
    - Creating new files or directories
    - Adding new dependencies
    - Refactoring existing code
    - Making changes outside the immediate task boundary

22. **Prefer questions over action.** When a request is ambiguous, ask a
    clarifying question rather than guessing and building. A wrong guess that
    produces code is worse than a delay while the requirements are clarified.

23. **One task at a time.** Do not proceed to the next task until the current
    one has been reviewed and approved by the user. Batch-completing multiple
    tasks without checkpoints deprives the human of the chance to course-correct.

## Environment Safety

15. **Use `.env.local` for local secrets.** Never commit `.env*` files that
    contain real secrets. Only commit `.env.example` or `.env.sample` with
    placeholder values.

16. **Isolated Python environments.** Always use a virtual environment (venv) or
    Conda environment for Python development. Never install packages globally.

17. **Lock files are source of truth.** Commit `package-lock.json` (or `yarn.lock`,
    `pnpm-lock.yaml`) and any Python lock files. They ensure reproducible
    installs across environments.