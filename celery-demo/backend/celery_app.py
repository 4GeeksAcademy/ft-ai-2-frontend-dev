import os
import time
from datetime import datetime, timezone

from celery import Celery, chain

# ---------------------------------------------------------------------------
# Celery application
# ---------------------------------------------------------------------------
BROKER_URL = os.environ.get("CELERY_BROKER_URL", "redis://localhost:6379/0")
RESULT_BACKEND = os.environ.get("CELERY_RESULT_BACKEND", "redis://localhost:6379/0")

app = Celery("celery_demo", broker=BROKER_URL, backend=RESULT_BACKEND)


# ---------------------------------------------------------------------------
# Tasks
# ---------------------------------------------------------------------------
@app.task
def crunch_data(duration: int | None = None) -> dict:
    """Simulate CPU‑heavy work by sleeping for *duration* seconds (or a
    random 5‑10 seconds when *duration* is ``None``).

    Returns a dict so the result can be passed naturally to the next task
    in a Celery chain.
    """
    import random

    if duration is None:
        duration = random.randint(5, 10)

    print(f"crunch_data(): working for {duration} second(s)")
    time.sleep(duration)
    return {"duration": duration, "status": "complete"}


@app.task
def process_result(result: dict) -> dict:
    """Second step in the Celery chain — enriches the output of
    :func:`crunch_data` with a ``processed_by`` timestamp.
    """
    print(f"process_result(): received {result}")
    result["processed_by"] = datetime.now(timezone.utc).isoformat()
    return result


# ---------------------------------------------------------------------------
# Helpers – used by the demo script / API endpoints
# ---------------------------------------------------------------------------
def run_crunch(duration: int | None = None):
    """Send a single ``crunch_data`` task and return the async result."""
    task = crunch_data.delay(duration)
    return task


def run_chain(duration: int | None = None):
    """Send a ``crunch_data | process_result`` chain and return the async
    result for the *last* task in the chain.
    """
    workflow = chain(crunch_data.s(duration), process_result.s())
    result = workflow.apply_async()
    return result