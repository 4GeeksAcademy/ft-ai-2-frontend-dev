import os
from contextlib import asynccontextmanager
from typing import Annotated

from dotenv import load_dotenv
from fastapi import FastAPI, Depends
from sqlmodel import SQLModel, Session, create_engine


load_dotenv()

DB_CONN_STR = os.getenv("DB_URL", "")

engine = create_engine(DB_CONN_STR)


def get_session():
    with Session(engine) as session:
        yield session


SessionDep = Annotated[Session, Depends(get_session)]

load_dotenv()


@asynccontextmanager
async def lifespan(app: FastAPI):
    SQLModel.metadata.create_all(engine)
    yield

app = FastAPI(
    title="Dockerized App",
    lifespan=lifespan,
)


@app.get("/hello")
def hello_world():
    return {
        "message": "Hello world."
    }
