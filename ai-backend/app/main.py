from fastapi import FastAPI
from pydantic import BaseModel
import os
import chromadb

app = FastAPI()

@app.get("/health")
def health():
    return {"ok": True, "service": "ai-backend"}

class DocumentRequest(BaseModel):
    content: str
    title: str = "untitled"

class ChatRequest(BaseModel):
    message: str

chroma_client = chromadb.HttpClient(
    host="chromadb",
    port=8000,
)

@app.post("/chat")
def chat(req: ChatRequest):
    return{
        "reply": req.message
    }

@app.post("/documents")
def upload_document(doc: DocumentRequest):
    try:
        collection = chroma_client.get_or_create_collection(
            name = "documents",
            metadata={"hnsw:space": "cosine"}
        )

        collection.add(
            documents = [doc.content],
            ids=[doc.title],
            metadatas=[{"title": doc.title}]
        )
        return {
            "status": "success",
            "title": doc.title,
            "message": "Document uploaded successfully"
        }
    except Exception as e:
        return{
            "status": "error",
            "message": str(e)
        }
    
@app.get("/documents/count")
def docuemnts_count():
    collection = chroma_client.get_or_create_collection(
        name="documents",
        metadata={"hnsw:space": "cosine"}
    )
    return {"count": collection.count()}

@app.get("/")
def index():
    return {
        "ok": True,
        "routes": [
            "/health",
            "/chat",
            "/documents",
            "/documents/count"
        ]
    }

@app.get("/documents/peek")
def documents_peek(limit: int = 5):
    collection = chroma_client.get_or_create_collection(
        name="documents",
        metadata={"hnsw:space": "cosine"}
    )
    data = collection.peek(limit)
    return {
        "ids": data.get("ids", []),
        "documents": data.get("documents", []),
        "metadatas": data.get("metadatas", [])
    }


@app.get("/documents/{doc_id}")
def get_document(doc_id: str):
    collection = chroma_client.get_or_create_collection(
        name="documents",
        metadata={"hnsw:space": "cosine"}
    )
    res = collection.get(ids=[doc_id], include=["documents", "metadatas"])
    return {
        "id": (res.get("ids") or [None])[0],
        "document": (res.get("documents") or [None])[0],
        "metadata": (res.get("metadatas") or [None])[0]
    }