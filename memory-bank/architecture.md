# Wordweb Architecture

## Project Tooling

- **Turborepo** for monorepo orchestration (tasks pipeline in `turbo.json`)
- **npm workspaces** (`apps/*`) for JS package management
- **uv** for Python package management (lockfile via `uv.lock`)
- **Prettier** with `prettier-plugin-tailwindcss` for code formatting

## Frontend

- NextJS 14+ (App Router) written in TypeScript (strict mode)
- Component-based architecture organized by feature
- Styling done with Tailwind CSS
- `reagraph` for graph visualization with category-based clustering
- `fuse.js` for fuzzy search

## Backend

- Python 3.11+
- FastAPI with CORS configured for `http://localhost:3000`
- Pydantic for request/response validation
- TinyDB for JSON-based document storage
    - With a TinyDB middleware to allow storing Pydantic models
    - With a TinyDB serializer for UUIDs

## Project Structure

The project lives under `wordweb/`:

- `wordweb/apps/frontend/` — NextJS application
- `wordweb/apps/backend/` — FastAPI application
- `wordweb/memory-bank/` — Project documentation and specs
