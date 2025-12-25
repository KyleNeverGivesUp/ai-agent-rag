from fastapi import FastAPI
from pydantic import BaseModel
import chromadb
import os
from openai import OpenAI
import time
import numpy as np

client_llm = OpenAI(
    # 只在这里传 Key，不要在下面的 headers 里重复传
    api_key=os.getenv("OPENROUTER_API_KEY"),
    base_url="https://openrouter.ai/api/v1",
    default_headers={
        # 这两个是 OpenRouter 建议（非强制）的，有助于识别流量
        "HTTP-Referer": "http://localhost:8000", 
        "X-Title": "My-FastAPI-App",
    },
)

app = FastAPI()

client = None
collection = None

@app.on_event("startup")
def startup():
    global client, collection
    print(f"DEBUG: OpenRouter Key is {os.getenv('OPENROUTER_API_KEY')}")
    for i in range(10):  # 最多等 10 次
        try:
            print(f"Connecting to ChromaDB... attempt {i+1}")
            client = chromadb.HttpClient(
                host="chromadb",
                port=8000
            )
            collection = client.get_or_create_collection("demo")
            print("Connected to ChromaDB")
            return
        except Exception as e:
            print("Chroma not ready yet:", e)
            time.sleep(2)

    raise RuntimeError("ChromaDB not ready after waiting")

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
    # 1. 向量检索
    result = collection.query(
        query_texts=[req.query],
        n_results=3
    )

    docs = result["documents"][0]

    context = "\n".join(docs)

    # 2. 构造 prompt
    messages = [
        {
            "role": "system",
            "content": "You are a helpful assistant. Answer the question using the provided context. say something to prove you are a llm"
        },
        {
            "role": "user",
            "content": f"Context:\n{context}\n\nQuestion:\n{req.query}"
        }
    ]

    # 3. 调 OpenRouter
    response = client_llm.chat.completions.create(
        model=os.getenv("OPENROUTER_MODEL"),
        messages=messages,
        temperature=0.2,
    )

    answer = response.choices[0].message.content

    return {
        "answer": answer,
        "sources": docs
    }

@app.get("/debug/embeddings")
def debug_embeddings():
    data = collection.get(include=["documents", "embeddings"])
    return {
        "count": len(data["ids"]),
        "example_document": data["documents"][0],
        "embedding_length": len(data["embeddings"][0]),
        "embedding_preview": data["embeddings"][0][:10]  # 前 10 个值
    }


def cosine_sim(a, b):
    a = np.array(a)
    b = np.array(b)
    return float(np.dot(a, b) / (np.linalg.norm(a) * np.linalg.norm(b)))

@app.get("/debug/similarity")
def debug_similarity():
    data = collection.get(include=["documents", "embeddings"])
    if len(data["embeddings"]) < 2:
        return {"error": "need at least 2 documents"}

    sim = cosine_sim(data["embeddings"][0], data["embeddings"][1])
    return {
        "doc1": data["documents"][0],
        "doc2": data["documents"][1],
        "cosine_similarity": sim
    }