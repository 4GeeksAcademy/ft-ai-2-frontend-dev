import asyncio

from collections.abc import Iterable

from fastapi import FastAPI, WebSocket
from fastapi.responses import StreamingResponse
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI(title="RTC Demo")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class ConnectionManager:
    def __init__(self):
        self.active: list[WebSocket] = []

    async def connect(self, websocket: WebSocket):
        await websocket.accept()
        self.active.append(websocket)

    def disconnect(self, websocket: WebSocket):
        self.active.remove(websocket)

    async def broadcast(self, message: str):
        dead = []
        for conn in self.active:
            try:
                await conn.send_json(message)
            except Exception:
                dead.append(conn)
        for conn in dead:
            self.active.remove(conn)

manager = ConnectionManager()

frankenstein: list[str] = []

with open("./assets/frankenstein.txt", "rt") as frank:
    frankenstein = frank.readlines()

@app.get(
    "/frankenstein",
    response_class=StreamingResponse,
)
async def read_frankenstein() -> Iterable[str]:
    """
    Unidirectional RTC is just listening.
    """
    for line in frankenstein:
        await asyncio.sleep(0.125)
        yield line


@app.websocket("/pingpong")
async def ping_pong(websocket: WebSocket):
    """
    Bidirectional RTC lets you send and recieve.
    """
    await websocket.accept()
    while True:
        data = await websocket.receive_text()
        if data.lower() == "ping":
            await websocket.send_text("pong")


@app.websocket("/chat/ws")
async def chat(websocket: WebSocket):
    await manager.connect(websocket)
    while True:
        data = await websocket.receive_json()
        await manager.broadcast({
            "username": data.get("username", "anonymous user"),
            "message": data.get("message", "")
        })
