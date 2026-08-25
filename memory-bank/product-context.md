# Brevity.app - The micro-est microblog.

This is an application intended to be a very stripped-down microblogging service allowing users to post incredibly short messages that other users can see and respond to.  This is intended as a demonstration of observability and telemetry in applications.

## Key Features

- Posting short text messages on the platform (limited to 200 characters, but characters that aren't letters or numbers are disallowed unless tagging another user, in which case you may only @ the user and add no more text.)
- Liking posts
- Following users to see their one-word posts

## Architecture

- docker compose for containerization
- brevity: NextJS 16 frontend using Typescript and TailwindCSS 4
- brevity api: FastAPI backend using SQLModel
    - Auth uses `jose` and `libpass` for JWT authentication
    - alembic for database migrations
    - postgres for a relational database
- brevity analytics: FastAPI analytics server supporting both individual events using RESTful requests and streaming events using WebSockets
    - TinyDB for analytics data storage.

## Users

- People who belive that brevity is the heart of wit, and are taking that idea to the logical extremes.
