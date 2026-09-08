# Celery Demonstration

Celery Demonstration is a simple webapp using React JS and Typescript on the frontend, FastAPI for the backend, and docker compose for managing the stack.  We will use Celery 5.5, Celery Flower for task monitoring, and Redis as both a mesage broker and results store.

## Project Structure

- `demo-front/`: Single-page react app written in typescript with buttons to spawn tasks.
- `demo-back/`: Minimal FastAPI application with API endpoints to run tasks in Celery.
