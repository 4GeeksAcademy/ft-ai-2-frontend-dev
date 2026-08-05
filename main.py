from fastapi import FastAPI

from src.db_basics import Watch, WatchRead, Watches, WatchWrite, watches

app = FastAPI()


@app.get("/watches", response_model=Watches)
async def get_all_watches():
    # watches.all() returns list[Watch] — Pydantic instances ✨
    return {
        "watches": watches.all()
    }


@app.post("/watches", response_model=WatchRead)
async def create_watch(watch: WatchWrite):
    # Insert either a model or a dict — middleware handles serialisation
    new_watch = Watch(**watch.model_dump())
    doc_id = watches.insert(new_watch)
    return watches.get(doc_id=doc_id)
