# MVP Scope — Citizen Weather Tracker API

> **Purpose:** Demonstrate ORM usage (SQLModel) through a community weather-tracking application.
> All three core relationship types (one-to-many, many-to-many, self-referential) are covered.

## 1. Goals

1. **Showcase SQLModel relationships** — one-to-many (User → WeatherData, User → Project), many-to-many (WeatherData ↔ Project via join table).
2. **Demonstrate CRUD patterns** — create, read, update, delete for each model with proper validation via Pydantic.
3. **Illustrate query patterns** — filter by fields, traverse relationships, aggregate (AVG temp per location, count per user).
4. **Provide a working API** — FastAPI endpoints with `/docs` for interactive testing.
5. **Keep it small** — no auth, no user accounts, no file uploads. Laypeople can submit data anonymously.

## 2. Data Model (SQLModel Tables)

The existing spec in [`data-model.md`](data-model.md) is a **Pydantic BaseModel sketch**. The MVP must translate it into **SQLModel table classes** with proper relationship fields.

### 2.1 User

| Field   | Type            | Notes                              |
|---------|-----------------|------------------------------------|
| id      | int \| None     | Primary key, auto-increment        |
| email   | str             | Unique, validated via Pydantic     |
| name    | str             | Display name (new in MVP)          |

**Relationships:**
- `weather_data: list[WeatherData]` — one-to-many (back_populates=user)
- `projects_owned: list[Project]` — one-to-many (back_populates=owner)

### 2.2 WeatherData

| Field      | Type            | Notes                               |
|------------|-----------------|-------------------------------------|
| id         | int \| None     | Primary key, auto-increment         |
| user_id    | int \| None     | FK → user.id (nullable = anonymous) |
| lat        | float           | Required                            |
| lon        | float           | Required                            |
| altitude   | float \| None   | Meters                              |
| temp       | float \| None   | Celsius                             |
| windspeed  | float \| None   | kph                                 |
| wind_dir   | float \| None   | Degrees                             |
| pressure   | float \| None   | kPa                                 |
| humidity   | float \| None   | Percentage                          |
| recorded_at| str \| datetime | ISO 8601 timestamp of observation   |
| created_at | str \| datetime | Auto-set on insert                  |

**Relationships:**
- `user: User | None` — many-to-one (back_populates=weather_data)
- `projects: list[Project]` — many-to-many via join table (back_populates=weather_data)

### 2.3 Project

| Field       | Type            | Notes                      |
|-------------|-----------------|----------------------------|
| id          | int \| None     | Primary key, auto-increment|
| owner_id    | int \| None     | FK → user.id               |
| title       | str             | Required                   |
| description | str             | Required                   |
| created_at  | str \| datetime | Auto-set on insert         |

**Relationships:**
- `owner: User` — many-to-one (back_populates=projects_owned)
- `weather_data: list[WeatherData]` — many-to-many via join table (back_populates=projects)

### 2.4 Join Table: WeatherDataProjectLink

| Field          | Type    | Notes                            |
|----------------|---------|----------------------------------|
| weather_data_id| int\|None| FK → weatherdata.id, PK (composite) |
| project_id     | int\|None| FK → project.id, PK (composite)     |

Required because SQLModel needs an explicit `link_model` for many-to-many relationships with additional metadata.

## 3. ORM Demonstration Patterns

| Pattern | Example | Why It Matters |
|---------|---------|---------------|
| **One-to-many create** | POST `/users/{id}/weather` — creates weather data linked to user | Shows FK + back_populates |
| **Many-to-many link** | POST `/projects/{id}/weather` — links existing weather data to project | Shows link_model usage |
| **Cascade load** | GET `/users/{id}` — returns user + nested weather_data | Shows eager vs lazy loading |
| **Filter across relationship** | GET `/weather?project_id=1` — find all weather by project | Shows join traversal |
| **Aggregation** | GET `/weather/stats?lat=...&lon=...` — avg temp, humidity for location | Shows SQL aggregate functions |
| **Update with relationship** | PATCH `/weather/{id}` — move weather to different user | Shows relationship mutation |
| **Delete with cascade** | DELETE `/users/{id}` — remove user and all their weather data | Shows cascade semantics |

## 4. API Routes

### 4.1 Users

| Method | Path               | Description                         | ORM Pattern           |
|--------|--------------------|-------------------------------------|-----------------------|
| POST   | `/users`           | Create user                         | Basic insert          |
| GET    | `/users`           | List users (paginated)              | Select + paginate     |
| GET    | `/users/{id}`      | Get user with weather, projects     | Relationship load     |
| PATCH  | `/users/{id}`      | Update user                         | Partial update        |
| DELETE | `/users/{id}`      | Delete user + cascade weather/proj  | Cascade delete        |

### 4.2 Weather Data

| Method | Path                      | Description                          | ORM Pattern           |
|--------|---------------------------|--------------------------------------|-----------------------|
| POST   | `/weather`                | Create weather data (optional user)  | Insert with FK        |
| GET    | `/weather`                | List weather (filter by lat/lon/date)| Filter + paginate     |
| GET    | `/weather/{id}`           | Get single weather record            | PK lookup             |
| PATCH  | `/weather/{id}`           | Update weather fields                | Partial update        |
| DELETE | `/weather/{id}`           | Delete weather record                | Single delete         |
| GET    | `/weather/stats`          | Aggregated stats (avg temp, etc.)    | Group by + aggregates |

### 4.3 Projects

| Method | Path                        | Description                           | ORM Pattern           |
|--------|-----------------------------|---------------------------------------|-----------------------|
| POST   | `/projects`                 | Create project                        | Insert with owner FK  |
| GET    | `/projects`                 | List projects (paginated)             | Select + paginate     |
| GET    | `/projects/{id}`            | Get project with weather data         | Relationship load     |
| PATCH  | `/projects/{id}`            | Update project                        | Partial update        |
| DELETE | `/projects/{id}`            | Delete project + unlink weather       | Cascade (link only)   |
| POST   | `/projects/{id}/weather`    | Link weather data to project          | Many-to-many add      |
| DELETE | `/projects/{id}/weather/{wd_id}` | Unlink weather from project      | Many-to-many remove   |

### 4.4 Health

| Method | Path       | Description              |
|--------|------------|--------------------------|
| GET    | `/health`  | DB connectivity check    |

## 5. Request/Response Shapes (Pydantic)

Each table model needs three Pydantic layers:

- **`ModelBase`** (shared fields, no id, no relationships) — used for POST input
- **`ModelPublic`** (Base + id) — used for list responses
- **`ModelPublicDetailed`** (Public + loaded relationships) — used for detail GETs

This separation keeps the API clean and prevents accidental relationship loading on list endpoints.

## 6. Non-Goals (Out of Scope for MVP)

| Feature           | Rationale                                        |
|-------------------|--------------------------------------------------|
| Authentication    | Adds complexity; MVP focuses on ORM patterns     |
| User registration | Not needed without auth                          |
| File/image upload | Project says "mocked up" — out of ORM demo scope |
| CSV export        | Nice-to-have, adds no new ORM patterns           |
| Tests             | Will be added in a separate build phase          |
| Deployment config | Docker/CI out of scope for spec phase            |

## 7. Tech Stack

| Component      | Choice          | Why                                      |
|----------------|-----------------|------------------------------------------|
| Framework      | FastAPI         | Existing in pyproject.toml               |
| ORM            | SQLModel        | Existing; unifies Pydantic + SQLAlchemy  |
| Database       | PostgreSQL      | Existing (Neon via psycopg[binary])      |
| Package mgr    | uv              | Existing convention                      |
| No secret mgr  | dotenv          | Existing convention (`DB_URL` in `.env`) |

## 8. Project Structure

```
src/
├── __init__.py                 # Engine, session dependency
├── models/
│   ├── __init__.py
│   ├── user.py                 # User SQLModel table
│   ├── weather_data.py         # WeatherData SQLModel table
│   └── project.py              # Project + join table
├── routers/
│   ├── __init__.py
│   ├── users.py                # /users endpoints
│   ├── weather.py              # /weather endpoints
│   └── projects.py             # /projects endpoints
└── schemas/
    ├── __init__.py
    ├── user.py                 # Create/Public/Detailed Pydantic models
    ├── weather.py
    └── project.py
```

Why this layout:
- Models directory = SQLModel table definitions (what goes in the DB)
- Schemas directory = Pydantic request/response models (what goes over the wire)
- Routers directory = FastAPI route handlers

This separation is the standard FastAPI pattern and keeps the ORM relationships cleanly separated from API serialization.

## 9. Build Phases (Recommended Order)

Per process-safety rules, each phase should be a separate interaction:

| Phase | Scope | Est. Files |
|-------|-------|-----------|
| **1** | Replace existing `one_to_many.py` / `many_to_many.py` with new model files (user, weather_data, project, join table). Update `src/models/__init__.py`. | 4 files |
| **2** | Create `src/schemas/` with Create/Public/Detailed Pydantic models for all three entities. | 4 files |
| **3** | Create `src/routers/users.py` — full CRUD for users (POST, GET list, GET detail, PATCH, DELETE). | 2 files |
| **4** | Create `src/routers/weather.py` — full CRUD for weather + stats aggregation endpoint. | 2 files |
| **5** | Create `src/routers/projects.py` — full CRUD for projects + link/unlink weather data. | 2 files |
| **6** | Wire routers into `main.py`. Add `/health` endpoint. Clean up old demo code. | 1 file |

---

*This spec is a DRAFT. Once approved, each phase above needs explicit go-ahead before implementation begins.*