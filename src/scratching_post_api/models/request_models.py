from pydantic import BaseModel

class PaginationReq(BaseModel):
    offset: int | None
    count: int | None