# Dev Conventions

- Use the `cli-project-bootstrapping` skill when bootstrapping projects.
- Use TypeScript with strict mode.
- Organize components in folders by feature.
- Style with utility-first Tailwind CSS in markup (avoid BEM and `@apply`
  unless there is a clear shared component edge case).
- Prefer established design patterns.
- Follow PEP8 for Python code.
- Format Python code with `autopep8`, and JS/TS/HTML/CSS with Prettier.
- Manage Python dependencies with `uv` (not pip). Use `uv add <package>` to add
  dependencies and `uv sync` to install. The `uv.lock` file must be committed.
