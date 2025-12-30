from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from . import auth, chat
from .db import init_db

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.on_event("startup")
def startup():
    print("Starting backend...")
    init_db()
    collection = chat.init_chroma()
    chat.set_collection(collection)


app.include_router(auth.router)
app.include_router(chat.router)
