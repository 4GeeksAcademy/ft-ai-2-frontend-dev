from fastapi import FastAPI
from scalar_fastapi import get_scalar_api_reference

from src.scratching_post_api.routers.post_router import router as post_router
from src.scratching_post_api.routers.user_router import router as user_router

app = FastAPI()

app.include_router(post_router)
app.include_router(user_router)


@app.get("/scalar", include_in_schema=False)
async def scalar_html():
    return get_scalar_api_reference()
