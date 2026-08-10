# Backend

This contains the blueprint of the functionality of the backend of Auth Demo.

## Routes

### Auth Routes

- `POST /register` - Allows users to register a `User`.
- `POST /login` - Allows users to get a JWT token with their `email` and `password`.  Returns a `User` object

### User Routes

- `GET /user/{id}` - Gets a single user from the database.
- `PATCH /user/{id}` - Allows a user to change their `gravatar_url`, `email`, and `display_name`, requires JWT token.


## Models

The `User` model represents a user of the Auth Demo application.  It contains a **hashed** password, along with the rest of the user profile details.

```python
class User(BaseModel):
    id: uuid.UUID
    email: str
    password: str
    display_name: str
    gravatar_url: str
```
