from fastapi import FastAPI
from scalar_fastapi import get_scalar_api_reference

app = FastAPI()


@app.get("/scalar", include_in_schema=False)
async def scalar_html():
    return get_scalar_api_reference()


@app.get("/hello")
async def hello_world():
    return {
        "messge": "Hello world",
    }
