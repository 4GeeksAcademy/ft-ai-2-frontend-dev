# Wordweb

Wordweb is a concept mapping application meant for use in the browser. This
application is meant to allow instructors to build maps of concepts and
vocabulary for students to explore.

## Key Features

- Create concept maps with named nodes grouped by category
- Category-based visual clustering via reagraph's native `clusterAttribute`
- Mobile-first web frontend
- Fuzzy search in the map builder view
- Clean, mobile-first UI

## Current Status

The project is scaffolded as a Turborepo monorepo at `wordweb/`:

- **Frontend:** NextJS 14+ app with all directories in place, dependencies
  installed. No source code yet — ready for component implementation.
- **Backend:** FastAPI app with `uv` package management and all dependencies
  installed. Directory structure created, ready for route and service
  implementation.
- **Documentation:** Full MVP spec suite in `memory-bank/specs/` and safety
  rules in `memory-bank/rules/`.

## Getting Started

```bash
cd wordweb
npm install          # frontend deps
uv sync --project apps/backend   # backend deps
npm run dev          # start both servers
```

