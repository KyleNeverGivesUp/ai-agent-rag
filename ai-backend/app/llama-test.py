import chromadb

client = chromadb.HttpClient(
    host="chromadb",
    port=8000,
)

collection = client.get_or_create_collection("test")

collection.add(
    documents=["hello world"],
    ids=["1"]
)

res = collection.query(
    query_texts=["hello"],
    n_results=1
)

print(res)