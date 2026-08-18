from contextlib import asynccontextmanager

from dotenv import load_dotenv
from fastapi import FastAPI
from sqlmodel import SQLModel

from src.models import engine, SessionDep, get_session
from src.models.one_to_many import (Book, Shelf)
from src.models.many_to_many import (Store, Product)

load_dotenv()
SQLModel.metadata.create_all(engine)

@asynccontextmanager
async def lifespan(app: FastAPI):
    SQLModel.metadata.create_all(engine)
    yield

app = FastAPI()
