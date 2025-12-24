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

class SearchRequest(BaseModel):
    query: str
    top_k: int = 3

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

@app.post("/search")
def search(req: SearchRequest):
    try:
        collection = chroma_client.get_or_create_collection(
            name="documents",
            metadata={"hnsw:space": "cosine"}
        )

        res = collection.query(
            query_texts=[req.query],
            n_results=max(1, req.top_k)
        )

        # Normalize Chroma response shape
        hits = []
        ids = res.get("ids", [[]])[0]
        docs = res.get("documents", [[]])[0]
        metas = res.get("metadatas", [[]])[0]
        dists = res.get("distances", [[]])[0] or res.get("embeddings", [[]])[0]
        for i in range(len(docs)):
            hits.append({
                "id": ids[i] if i < len(ids) else None,
                "document": docs[i],
                "metadata": metas[i] if i < len(metas) else None,
                "score": dists[i] if i < len(dists) else None
            })

        return {"query": req.query, "results": hits}
    except Exception as e:
        return {"status": "error", "message": str(e)}