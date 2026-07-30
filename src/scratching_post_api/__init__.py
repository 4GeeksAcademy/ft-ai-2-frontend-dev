import uvicorn


def main() -> None:
    """Run the FastAPI server with uvicorn."""
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=False)


def dev() -> None:
    """Run the FastAPI server with hot-reload enabled."""
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
