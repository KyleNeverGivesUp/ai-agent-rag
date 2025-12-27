import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

const STATIC_USERNAME = "kyle";
const STATIC_PASSWORD = "kyle";
const STATIC_TOKEN = "kyle-token";
// Backend login endpoint (disabled in static mode)
// const API_URL = "http://localhost:8000/token";

export default function Login() {
  const navigate = useNavigate();
  const [error, setError] = useState("");

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");

    const username = event.target.username.value.trim();
    const password = event.target.password.value.trim();

    if (username !== STATIC_USERNAME || password !== STATIC_PASSWORD) {
      setError("Invalid username or password.");
      return;
    }

    localStorage.setItem("access_token", STATIC_TOKEN);
    navigate("/chat");

    // Backend login flow (disabled in static mode)
    // const formData = new URLSearchParams();
    // formData.append("username", username);
    // formData.append("password", password);

    // try {
    //   const response = await fetch(API_URL, {
    //     method: "POST",
    //     headers: {
    //       "Content-Type": "application/x-www-form-urlencoded",
    //     },
    //     body: formData,
    //   });

    //   if (!response.ok) {
    //     throw new Error("Login failed");
    //   }

    //   const data = await response.json();
    //   localStorage.setItem("access_token", data.access_token);
    //   navigate("/chat");
    // } catch (err) {
    //   setError("Invalid username or password.");
    // }
  };

  return (
    <div>
      <nav>
        <div className="logo">KYLE.HU</div>
        <ul>
          <li>
            <Link to="/">Home</Link>
          </li>
        </ul>
      </nav>

      <div className="login-wrapper">
        <div className="login-card">
          <h2>Welcome Back</h2>
          <p>Please login to access the RAG Chatbot</p>

          <form onSubmit={handleSubmit}>
            <div className="input-group">
              <i className="fas fa-user"></i>
              <input type="text" name="username" placeholder="Username" required />
            </div>

            <div className="input-group">
              <i className="fas fa-lock"></i>
              <input type="password" name="password" placeholder="Password" required />
            </div>

            <button type="submit" className="login-btn">
              Login <i className="fas fa-arrow-right"></i>
            </button>
          </form>

          {error ? <p id="error-msg">{error}</p> : null}
        </div>
      </div>
    </div>
  );
}
