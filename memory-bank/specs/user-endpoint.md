# User CRUD Endpoints

The User object is a placeholder object to represent users in the database.

```python
class User(BaseModel):
    id: int | None
    handle: str
    posts: list["PostBase"]
```

## Endpoints

`GET /user/{user_id}` - This allows you to get details on a single user

**Response:**

```python
class User(BaseModel):
    id: int | None
    handle: str
    posts: list["PostBase"]
```

**HTTP Responses:**

- `200 Success` on success
- `404 Not Found` if user doesn't exist

`POST /register` - This endpoint allows you to make a user on the API

**Response:**

```python
class User(BaseModel):
    id: int | None
    handle: str
    posts: list["PostBase"]
```

**HTTP Responses:**

- `200 Success` on success
- `400 Bad Request` if a user with that username already exists.
