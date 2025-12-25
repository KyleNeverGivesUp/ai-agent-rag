# AI RAG Chatbot (FastAPI + ChromaDB + React)

This project is a **minimal, end-to-end Retrieval-Augmented Generation (RAG) chatbot**.  
It is designed for learning and understanding how RAG systems work in practice, from ingestion to retrieval to LLM generation.

The system allows you to:
- Ingest raw text into a vector database
- Retrieve relevant context using semantic search
- Use an LLM to generate answers grounded in retrieved context
- Interact with everything through a web UI built with React

---

## Tech Stack

### Backend
- **FastAPI** – API server
- **ChromaDB** – Vector database
- **OpenRouter** – LLM and embedding provider
- **Docker / Docker Compose**

### Frontend
- **React ** – Web UI
- **Fetch API** – Backend communication

---

## Architecture
Browser (React)
|
FastAPI Backend
|
ChromaDB (Vector Search)
|
LLM (OpenRouter)

Key idea:
- The frontend only talks to FastAPI
- FastAPI handles retrieval and prompt construction
- ChromaDB stores embeddings and performs similarity search
- The LLM generates answers using retrieved context

