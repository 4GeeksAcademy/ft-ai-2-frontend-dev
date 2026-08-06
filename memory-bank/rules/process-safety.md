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

## Code Review Safety

5. **One concern per PR.** Pull requests should address a single logical change.
   Mixing features, refactors, and fixes in one PR makes review difficult and
   increases the chance of introducing bugs.

6. **Run linting and type checking before commit.** Use pre-commit hooks or CI
   to enforce `tsc --noEmit`, `eslint`, `prettier --check`, `mypy` (or
   `pyright`), and `autopep8` before code is merged.

7. **Don't suppress linters without justification.** A comment must accompany
   any `eslint-disable`, `# type: ignore`, or `# noqa` explaining the reason.

## Branch & Commit Safety

8. **Feature branches.** All development should happen on feature branches
   branched from `main`. Never commit directly to `main`.

9. **Meaningful commit messages.** Commit messages should explain *why* a change
   was made, not just *what* changed. Follow conventional commits format
   (`feat:`, `fix:`, `chore:`, `docs:`, etc.).

10. **Don't commit generated files.** Build artifacts, `node_modules/`,
    `.next/`, `__pycache__/`, `*.pyc`, and similar generated files must be in
    `.gitignore` and never committed.

## Environment Safety

11. **Use `.env.local` for local secrets.** Never commit `.env*` files that
    contain real secrets. Only commit `.env.example` or `.env.sample` with
    placeholder values.

12. **Isolated Python environments.** Always use a virtual environment (venv) or
    Conda environment for Python development. Never install packages globally.

13. **Lock files are source of truth.** Commit `package-lock.json` (or `yarn.lock`,
    `pnpm-lock.yaml`) and any Python lock files. They ensure reproducible
    installs across environments.