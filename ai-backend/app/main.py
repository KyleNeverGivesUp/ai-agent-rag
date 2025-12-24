from fastapi import FastAPI
from pydantic import BaseModel
import os
import chromadb


app = FastAPI()

@app.get("/health")
def health():
    return {"ok": True, "service": "ai-backend"}

class ChatRequest(BaseModel):
    message: str

@app.post("/chat")
def chat(req: ChatRequest):
    return{
        "reply": req.message
    }

chroma_client = chromadb.Client()

class DocumentRequest(BaseModel):
    content: str
    title: str = "untitled"