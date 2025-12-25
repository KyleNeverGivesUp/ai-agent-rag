from fastapi import FastAPI
from pydantic import BaseModel
import chromadb

app = FastAPI()

client = chromadb.HttpClient(
    host="chromadb",
    port=8000,
)

collection = client.get_or_create_collection("demo")

class IngestRequest(BaseModel):
    text: str

class ChatRequest(BaseModel):
    query: str

@app.post("/ingest")
def ingest(req: IngestRequest):
    collection.add(
        documents=[req.text],
        ids=[str(len(collection.get()["ids"]) + 1)]
    )
    return {"status": "ok"}

@app.post("/chat")
def chat(req: ChatRequest):
    result = collection.query(
        query_texts=[req.query],
        n_results=1
    )
    return {"result": result}