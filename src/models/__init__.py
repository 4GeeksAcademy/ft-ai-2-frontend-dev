import os
from typing import Annotated

from dotenv import load_dotenv
from fastapi import Depends
from sqlmodel import Session, create_engine

load_dotenv()

NEON_CONN_STR = os.getenv("DB_URL")

engine = create_engine(NEON_CONN_STR)

def get_session():
    with Session(engine) as session:
        yield session


SessionDep = Annotated[Session, Depends(get_session)]
