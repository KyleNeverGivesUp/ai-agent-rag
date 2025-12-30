import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

export default function Chat() {
  const navigate = useNavigate();
  const [messages, setMessages] = useState([
    { role: "assistant", content: "Welcome to the RAG Chatbot based on Llama v3.3. Ask me anything regarding UCSD." },
  ]);
  const [input, setInput] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [error, setError] = useState("");
  const [sources, setSources] = useState([]);
  const [userProfile, setUserProfile] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem("access_token");
    const storedProfile = localStorage.getItem("user_profile");
    if (!token) {
      navigate("/login");
    }
    if (storedProfile) {
      try {
        setUserProfile(JSON.parse(storedProfile));
      } catch {
        setUserProfile(null);
      }
    }
  }, [navigate]);

  const token = useMemo(() => localStorage.getItem("access_token"), []);

  // const apiUrl = "http://143.110.228.170:8000/chat";

  const apiUrl = "/api/chat";

  console.log(apiUrl);

  const handleLogout = () => {
    localStorage.removeItem("access_token");
    localStorage.removeItem("user_profile");
    navigate("/login");
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    const trimmed = input.trim();
    if (!trimmed || isSending) {
      return;
    }

    setError("");
    setIsSending(true);
    setInput("");
    setSources([]);
    setMessages((prev) => [...prev, { role: "user", content: trimmed }]);

    try {
      const response = await fetch(apiUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ query: trimmed }),
      });

      if (!response.ok) {
        throw new Error("Chat request failed");
      }

      const data = await response.json();
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: data.answer || "No response returned." },
      ]);
      if (Array.isArray(data.sources)) {
        setSources(data.sources);
      }
    } catch (err) {
      setError("Request failed. Check backend or token.");
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: "Sorry, I couldn't reach the backend." },
      ]);
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="chat-page">
      <div className="chat-card">
        <div className="chat-header">
          <h1>Kyle's Chatbot</h1>
          <div className="chat-user">
            {userProfile?.initial ? (
              <div
                className="user-avatar"
                style={{ backgroundColor: userProfile.avatar_color }}
              >
                {userProfile.initial}
              </div>
            ) : null}
            <button className="ghost-btn" onClick={handleLogout}>
              Logout
            </button>
          </div>
        </div>

        <div className="chat-window">
          {messages.map((message, index) => (
            <div key={`${message.role}-${index}`} className={`chat-bubble ${message.role}`}>
              {message.content}
            </div>
          ))}
        </div>

        <form className="chat-input" onSubmit={handleSubmit}>
          <input
            type="text"
            placeholder="Type your message..."
            value={input}
            onChange={(event) => setInput(event.target.value)}
            disabled={isSending}
          />
          <button type="submit" className="chat-btn" disabled={isSending}>
            {isSending ? "Sending..." : "Send"}
          </button>
        </form>

        {error ? <p className="chat-error">{error}</p> : null}

        {sources.length ? (
          <div className="sources">
            <h3>Sources</h3>
            <ul>
              {sources.map((source, index) => (
                <li key={`source-${index}`}>{source}</li>
              ))}
            </ul>
          </div>
        ) : null}
      </div>
    </div>
  );
}
