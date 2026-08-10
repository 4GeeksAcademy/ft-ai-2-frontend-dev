# Project Architecture Spec

- turborepo monorepo for project organization
- `uv` for python package management.
- FastAPI backend with TinyDB for data storage
    - TinyDB Middleware for allowing usage of Pydantic models in the TinyDB database
- `python-jose[cryptography]` and `passlib[bcrypt]` for JWT creation and validation.


Frontend is out of scope for this phase of the project.
