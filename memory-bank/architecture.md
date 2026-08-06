# Wordweb Architecture

## Project Tooling

- turborepo for application management within the project.

## Frontend

- NextJS application written in Typescript
- Component-based architecture
- Styling done with `tailwindcss`.
- `reagraph` for vocab map display
- `fuzejs` for fuzzy search

## Backend

- Python
- FastAPI
- TinyDB for data storage
    - with a TinyDB middleware to allow storing pydantic models
    - with a TinyDB serializer for uuids.
