# Post CRUD Endpoints

The Post object is used to represent a user post in the API.

```python
class Post(BaseModel):
    id: int | None
    content: str
    author: int | None
    response_to: int | None
    create: datetime
    media: list["MediaItem"]
```

## Endpoints

### Read Single Post

`GET /post/{post_id}` - Allows a single Post to be read

**Response:**

```python
class PostRead(BaseModel):
    id: int | None
    content: str
    author: int | None
    response_to: int | None
    created: datetime
    media: list["MediaItem"]
```

**HTTP Responses:**

- `204 No Content` on success
- `404 Not Found` if post doesn't exist

### Batch Read Posts

`GET /post` - Allows multiple posts to be read at one time.

**Route Parameters:**

```python
class PaginationReq(BaseModel):
    offset: int | None
    count: int | None
```

**Response:**

```python
class PostReadMany(BaseModel):
    posts: list["PostRead"]
    offset: int
    total: int
```

**HTTP Responses:**

- `204 No Content` on success

### Create Post

`POST /post` - Allows the frontend to create a Post object in the API

**Request body:**

```python
class PostCreate(BaseModel):
    content: str
    author: int | None
    response_to: int | None
    media: list["MediaItem"]
```

**Response:**

```python
class PostRead(BaseModel):
    id: int | None
    content: str
    author: int | None
    response_to: int | None
    created: datetime
    media: list["MediaItem"]
```

### Update Post

`PATCH /post/{post_id}` - Allows the frontend to update a Post object in the API if they are the owner.

**Request body:**

```python
class PostUpdate(BaseModel):
    content: str | None
    media: list["MediaItem"] | None
```

**Response:**

```python
class PostRead(BaseModel):
    id: int | None
    content: str
    author: int | None
    response_to: int | None
    created: datetime
    media: list["MediaItem"]
```

### Delete Post

`DELETE /post/{post_id}` - Allows the frontend to delete a Post object in the API if they are the owner.

**HTTP Responses:**

- `204 No Content` on success
- `404 Not Found` if post object didn't exist before delete request
- `401 Unauthorized` if someone who is not the post owner attempts to delete a post.
