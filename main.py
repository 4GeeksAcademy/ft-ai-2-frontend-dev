from fastapi import FastAPI

from src.db_basics import Watch, db, WatchRead, Watches, WatchWrite

app = FastAPI()


@app.get("/watches", response_model=Watches)
async def get_all_watches():
    # db.all() now returns Watch instances thanks to PydanticMiddleware ✨
    return {
        "watches": db.all()
    }


@app.post("/watches", response_model=WatchRead)
async def create_watch(watch: WatchWrite):
    # db.insert() accepts both dicts and Pydantic models
    new_watch = Watch(**watch.model_dump())
    doc_id = db.insert(new_watch)
    return db.get(doc_id=doc_id)
