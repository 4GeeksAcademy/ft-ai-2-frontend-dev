---
id: cli-project-bootstrapping
name: CLI Project Bootstrapping
version: 1.0.0
description: >
  A skill for using command-line tools to scaffold, initialize, and configure
  new software projects. Prefers interactive CLI generators and package-manager
  init commands over manual file creation.
agents:
  - any
requires:
  - shell
  - git
inputs:
  type: object
  properties:
    project_type:
      type: string
      description: The kind of project to bootstrap (e.g. nextjs, react, python, node, vite, nuxt, astro, etc.)
    project_name:
      type: string
      description: The name of the new project.
    project_dir:
      type: string
      description: The parent directory where the project should be created.
    options:
      type: object
      description: Additional flags or options to pass to the scaffolding tool.
---

# CLI Project Bootstrapping

A skill for bootstrapping new projects using their official CLI scaffolding tools
instead of creating files manually. This ensures projects follow community best
practices, use up-to-date templates, and come with correct configuration out of
the box.

## Principles

1. **Use the official scaffolder.** Every major framework and toolchain provides
   a `create-*` or `init` command. Use it.
2. **Prefer `pnpm` over `npm` or `yarn`** when the tool supports it (faster,
   disk-efficient).
3. **Let the CLI do the work.** Do not manually create `package.json`,
   `tsconfig.json`, or config files that the scaffolder generates.
4. **Only scaffold, don't install after.** Use `--noinstall` or equivalent when
   available so the agent can inspect the scaffold before installing — or let
   the agent batch-install later.
5. **Commit the scaffold immediately.** After scaffolding succeeds, run
   `git init && git add -A && git commit -m "Initial scaffold: <project>"` to
   create a clean baseline.

## Common Scaffolding Commands

### Next.js (App Router)

```bash
# Interactive (preferred for humans)
pnpm create next-app@latest

# Non-interactive (preferred for agents)
pnpm create next-app@latest ./my-app --typescript --tailwind --eslint --app --src-dir --import-alias "@/*" --no-turbopack
```

### React + Vite

```bash
pnpm create vite@latest ./my-app --template react-ts
```

### Vue / Nuxt

```bash
# Vue
pnpm create vue@latest ./my-app

# Nuxt
pnpm create nuxt@latest ./my-app
```

### Node.js / TypeScript package

```bash
# Create directory and init
mkdir my-package && cd my-package
pnpm init
pnpm add -D typescript @types/node
npx tsc --init
```

### Python (uv — modern, fast)

```bash
# New project in current directory
uv init .

# New project with name
uv init my-project

# With dependencies
uv init my-project && cd my-project && uv add fastapi uvicorn

# Create a package (src layout)
uv init --package my-package
```

### Python (pip — classic)

```bash
mkdir my-project && cd my-project
python -m venv .venv
source .venv/bin/activate
pip install --upgrade pip
```

### Astro

```bash
pnpm create astro@latest ./my-app --template basics --typescript strict --no-install
```

### SvelteKit

```bash
pnpm create svelte@latest ./my-app
```

### Expo (React Native)

```bash
pnpm create expo@latest ./my-app
```

### Turborepo (monorepo)

```bash
# Interactive scaffold — prompts for package manager, template, etc.
pnpm create turbo@latest

# Non-interactive with defaults
pnpm create turbo@latest ./my-monorepo

# Scaffold from a specific template
pnpm create turbo@latest ./my-monorepo --template with-react

# Scaffold with npm (if pnpm is not available)
npx create-turbo@latest ./my-monorepo
```

**Available templates** (omit `--template` for the default `basic`):

| Template | Description |
|---|---|
| `basic` | Minimal empty monorepo with `turbo.json` |
| `with-react` | React app + shared UI package |
| `with-vite` | Vite-based React app + shared packages |
| `with-nextjs` | Next.js app + shared UI + config packages |
| `with-prisma` | Next.js + Prisma + shared packages |
| `with-tailwind` | Tailwind CSS across all apps & packages |
| `with-docker` | Dockerized apps in a monorepo |
| `with-changesets` | Monorepo with changesets for versioning |

After scaffolding, inspect `turbo.json` to verify the pipeline configuration
(tasks, outputs, dependsOn, cache settings). Turborepo caches task output by
default — useful for CI but can be skipped locally with `--no-cache` or by
setting `"outputs": []`.

### Rust (Cargo)

```bash
cargo new my-project
cargo new my-project --lib   # library crate
```

### Go

```bash
go mod init github.com/user/my-project
```

## Agent Workflow

When asked to bootstrap a new project, follow these steps:

1. **Identify the project type** from the user's request.
2. **Check the tool is available.** If the scaffolding tool isn't installed,
   install it globally first (e.g., `pnpm add -g create-next-app`), or use
   `pnpm dlx` / `npx` to run it without installing.
3. **Run the scaffold command** with appropriate flags for a non-interactive
   (headless) environment. Use `--yes`, `--defaults`, or pipe answers when
   the tool requires interaction.
4. **Change into the project directory** and verify the structure.
5. **Initialize git** and make an initial commit.
6. **Report success** with a summary of what was created.

## Troubleshooting

| Problem | Solution |
|---|---|
| Scaffolder prompts for input | Pass `--yes`, `--defaults`, `-y`, or pipe `\n` |
| Tool not found globally | Use `pnpm dlx`, `npx`, or `uvx` to run without install |
| `create-*` is interactive-only | Use `expect` or `printf` to pre-fill answers |
| Directory already exists | Use `--force` flag or scaffold into a temp dir and move |
| `uv init` creates a script not a project | Add `--package` flag for library projects |

## Related Skills

- [Python Environment Setup](./python-environment-setup.md)
- [Git Workflow](./git-workflow.md)