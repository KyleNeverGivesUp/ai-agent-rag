import express from "express";

const app = express();
app.use(express.json());

app.get("/health", (req, res) => {
  res.json({ ok: true, service: "node-bff" });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Node BFF running on port ${PORT}`);
});

app.post("/chat", async(req, res)=> {
  const response = await fetch("http://ai-backend:8000/chat", {
    method: "POST",
    headers: {"Content-Type": "application/json"},
    body: JSON.stringify(req.body),
  });

  const data = await response.json();
  res.join(data);
});