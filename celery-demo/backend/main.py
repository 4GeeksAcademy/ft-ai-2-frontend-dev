from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

from backend.celery_app import run_crunch, run_chain

app = FastAPI(title="Celery Demo")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)


# ---------------------------------------------------------------------------
# Request / response models
# ---------------------------------------------------------------------------
class CrunchRequest(BaseModel):
    duration: int | None = None


class TaskResponse(BaseModel):
    task_id: str


class TaskStatusResponse(BaseModel):
    task_id: str
    status: str
    result: dict | None = None


# ---------------------------------------------------------------------------
# Endpoints
# ---------------------------------------------------------------------------
@app.post("/api/tasks/crunch", response_model=TaskResponse)
def dispatch_crunch(body: CrunchRequest):
    task = run_crunch(body.duration)
    return TaskResponse(task_id=task.id)


@app.post("/api/tasks/chain", response_model=TaskResponse)
def dispatch_chain(body: CrunchRequest):
    result = run_chain(body.duration)
    return TaskResponse(task_id=result.id)


@app.get("/api/tasks/{task_id}", response_model=TaskStatusResponse)
def get_task_status(task_id: str):
    from backend.celery_app import app as celery_app

    result = celery_app.AsyncResult(task_id)
    response = TaskStatusResponse(
        task_id=task_id,
        status=result.status,
        result=result.result if result.ready() else None,
    )
    if result.failed():
        raise HTTPException(status_code=500, detail=str(result.traceback))
    return response


# ---------------------------------------------------------------------------
# Health check
# ---------------------------------------------------------------------------
@app.get("/api/health")
def health():
    return {"status": "ok"}