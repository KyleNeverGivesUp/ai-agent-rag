import os
import time

import chromadb
import numpy as np
from fastapi import APIRouter
from openai import OpenAI

from .schemas import ChatRequest, IngestRequest

router = APIRouter(tags=["chat"])

# initial LLM authentication
client_llm = OpenAI(
    api_key=os.getenv("OPENROUTER_API_KEY"),
    base_url="https://openrouter.ai/api/v1",
    default_headers={
        "HTTP-Referer": os.getenv("APP_ORIGIN", "http://localhost:8000"),
        "X-Title": os.getenv("APP_NAME", "My-FastAPI-App"),
    },
)

collection = None


def init_chroma():
    for i in range(10):
        try:
            print(f"Connecting to ChromaDB... attempt {i + 1}")
            client = chromadb.HttpClient(host="chromadb", port=8000)
            coll = client.get_or_create_collection("demo")
            print("Connected to ChromaDB")
            return coll
        except Exception as exc:
            print("Chroma not ready yet:", exc)
            time.sleep(2)

    raise RuntimeError("ChromaDB not ready after waiting")


def set_collection(coll):
    global collection
    collection = coll


def _require_collection():
    if collection is None:
        raise RuntimeError("Chroma collection is not initialized")


@router.post("/ingest")
def ingest(req: IngestRequest):
    _require_collection()
    collection.add(
        documents=[req.text],
        ids=[str(len(collection.get()["ids"]) + 1)],
    )
    return {"status": "ok"}


@router.post("/chat")
def chat(req: ChatRequest):
    _require_collection()
    # 1. vector retrieval
    result = collection.query(query_texts=[req.query], n_results=3)

    docs = result["documents"][0]

    context = "\n".join(docs)

    # 2. construct prompt
    messages = [
        {
            "role": "system",
            "content": (
                "You are a helpful assistant. Answer the question using the provided "
                "context. say something to prove you are a llm"
            ),
        },
        {
            "role": "user",
            "content": f"Context:\n{context}\n\nQuestion:\n{req.query}",
        },
    ]

    # 3. call remote LLM
    response = client_llm.chat.completions.create(
        model=os.getenv("OPENROUTER_MODEL"),
        messages=messages,
        temperature=0.2,
    )

    answer = response.choices[0].message.content

    return {"answer": answer, "sources": docs}


@router.get("/debug/embeddings")
def debug_embeddings():
    _require_collection()
    data = collection.get(include=["documents", "embeddings"])
    return {
        "count": len(data["ids"]),
        "example_document": data["documents"][0],
        "embedding_length": len(data["embeddings"][0]),
        "embedding_preview": data["embeddings"][0][:10],
    }


def _cosine_sim(a, b):
    a = np.array(a)
    b = np.array(b)
    return float(np.dot(a, b) / (np.linalg.norm(a) * np.linalg.norm(b)))


@router.get("/debug/similarity")
def debug_similarity():
    _require_collection()
    data = collection.get(include=["documents", "embeddings"])
    if len(data["embeddings"]) < 2:
        return {"error": "need at least 2 documents"}

    sim = _cosine_sim(data["embeddings"][0], data["embeddings"][1])
    return {
        "doc1": data["documents"][0],
        "doc2": data["documents"][1],
        "cosine_similarity": sim,
    }
