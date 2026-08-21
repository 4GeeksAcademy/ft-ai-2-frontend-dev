# ft-ai-2-frontend-dev

<!-- TOC:START -->

## Module Demonstrations

Each demonstration lives on its own branch:

- Providing Visual Specs To The AI: [module/specs-pt-1](https://github.com/4GeeksAcademy/ft-ai-2-frontend-dev/tree/module/specs-pt-1)
- Single Page Apps: [module/spa](https://github.com/4GeeksAcademy/ft-ai-2-frontend-dev/tree/module/spa)
- Structure: [module/structure](https://github.com/4GeeksAcademy/ft-ai-2-frontend-dev/tree/module/structure)
- Building An Application: [module/book_app](https://github.com/4GeeksAcademy/ft-ai-2-frontend-dev/tree/module/book_app)
- Making `fetch` requests: [module/restful_apis](https://github.com/4GeeksAcademy/ft-ai-2-frontend-dev/tree/module/restful_apis)
- Helping LLMs Understand APIs: [module/agents_and_apis](https://github.com/4GeeksAcademy/ft-ai-2-frontend-dev/tree/module/agents_and_apis)
- Server VS Client Components: [module/server_client_divide](https://github.com/4GeeksAcademy/ft-ai-2-frontend-dev/tree/module/server_client_divide)
- API Concepts Review: [module/api_review](https://github.com/4GeeksAcademy/ft-ai-2-frontend-dev/tree/module/api_review)
- Python [module/python](https://github.com/4GeeksAcademy/ft-ai-2-frontend-dev/tree/module/python)
- Defining Backend Architecture: [module/backend_arch](https://github.com/4GeeksAcademy/ft-ai-2-frontend-dev/tree/module/backend_arch)
- Designing Routes: [module/designing_routes](https://github.com/4GeeksAcademy/ft-ai-2-frontend-dev/tree/module/designing_routes)
- File I/O: [module/file-io](https://github.com/4GeeksAcademy/ft-ai-2-frontend-dev/tree/module/file-io)
- File I/O Example: [module/file-io-example](https://github.com/4GeeksAcademy/ft-ai-2-frontend-dev/tree/module/file-io-example)
- TinyDB Example: [module/db-basics](https://github.com/4GeeksAcademy/ft-ai-2-frontend-dev/tree/module/db-basics)
- Relational Database (SQLModel): [module/relational-db](https://github.com/4GeeksAcademy/ft-ai-2-frontend-dev/tree/module/relational-db)
<!-- TOC:END -->

## Current Branch: `module/relational-db` — Citizen Weather Tracker API

A FastAPI backend demonstrating **SQLModel ORM** with PostgreSQL, covering all three core relationship types (one-to-many, many-to-many, and self-referential — planned).

### Tech Stack

| Tool        | Purpose                     |
|-------------|-----------------------------|
| **FastAPI** | Web framework & API routing |
| **SQLModel**| ORM (Pydantic + SQLAlchemy) |
| **PostgreSQL** | Relational database     |
| **psycopg** | PostgreSQL driver (binary)  |
| **uv**      | Python package manager      |

### Data Model

| Model         | Key Fields                                      | Relationships                                                       |
|---------------|-------------------------------------------------|---------------------------------------------------------------------|
| **User**      | `id`, `email` (unique), `name`                 | Owns weather data (`1:N`), owns projects (`1:N`)                    |
| **WeatherData** | `id`, `lat`, `lon`, `temp`, `humidity`, `pressure`, `windspeed`, `wind_dir`, `altitude`, `recorded_at` | Belongs to a user (`N:1`), linked to projects (`N:M`) |
| **Project**   | `id`, `title`, `description`                   | Owned by a user (`N:1`), linked to weather data (`N:M`) via join table |

A **`WeatherDataProjectLink`** join table manages the many-to-many relationship between weather records and projects.

### API Endpoints

#### Users (`/users`)

| Method   | Path              | Description                                       |
|----------|-------------------|---------------------------------------------------|
| `POST`   | `/users/`         | Create a user                                     |
| `GET`    | `/users/`         | List users (paginated)                            |
| `GET`    | `/users/{id}`     | Get a single user with their weather & projects    |
| `PATCH`  | `/users/{id}`     | Update a user                                     |
| `DELETE` | `/users/{id}`     | Delete a user (cascades to weather & projects)     |

#### Weather Data (`/weather`)

| Method   | Path                 | Description                                       |
|----------|----------------------|---------------------------------------------------|
| `POST`   | `/weather/`          | Create a weather record                           |
| `GET`    | `/weather/`          | List weather data (filter by user, location, date)|
| `GET`    | `/weather/stats`     | Aggregated weather stats (avg temp, humidity, etc.)|
| `GET`    | `/weather/{id}`      | Get a single weather record with user & projects   |

#### Projects (`/projects`)

| Method   | Path                              | Description                               |
|----------|-----------------------------------|-------------------------------------------|
| `POST`   | `/projects/`                      | Create a project                          |
| `GET`    | `/projects/`                      | List projects (filter by owner)           |
| `GET`    | `/projects/{id}`                  | Get a project with owner & linked weather  |
| `PATCH`  | `/projects/{id}`                  | Partially update a project                |
| `DELETE` | `/projects/{id}`                  | Delete a project & unlink weather data     |
| `POST`   | `/projects/{id}/weather/{w_id}`   | Link a weather record to a project        |
| `DELETE` | `/projects/{id}/weather/{w_id}`   | Unlink a weather record from a project    |

### Running Locally

1. **Create a `.env` file** with your PostgreSQL connection string (using the `psycopg` driver):
   ```env
   DB_URL=postgresql+psycopg://user:password@host:port/dbname
   ```

2. **Install dependencies** and start the server:
   ```bash
   uv sync
   uv run uvicorn main:app --reload
   ```

3. **Open the interactive docs** at [http://localhost:8000/docs](http://localhost:8000/docs)

### Health Check

```bash
curl http://localhost:8000/health
# {"status":"ok"}
```


