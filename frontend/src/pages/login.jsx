import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useGoogleLogin } from "@react-oauth/google";
import { FcGoogle } from "react-icons/fc";
import { FaGithub } from "react-icons/fa";
import { GiFox } from "react-icons/gi";

const STATIC_USERNAME = "kyle";
const STATIC_PASSWORD = "kyle";
const STATIC_TOKEN = "kyle-token";
// Backend login endpoint (disabled in static mode)
// const API_URL = "http://localhost:8000/token";

export default function Login() {
  const navigate = useNavigate();
  const [error, setError] = useState("");

  const googleLogin = useGoogleLogin({
    onSuccess: async (tokenResponse) => {
      console.log("Google token:", tokenResponse.access_token);
      // TODO: Send token to backend /api/auth/google
      localStorage.setItem("access_token", "google-token");
      navigate("/chat");
    },
    onError: () => setError("Google login failed."),
  });

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
        <div className="login-shell">
          <div className="login-card">
          <h2>Sign in to AI Agent</h2>
          <p>Welcome back! Please sign in to continue</p>

          <div className="oauth-row">
            <button className="oauth-btn" type="button">
              <FaGithub className="text-xl" />
            </button>
            <button
              className="oauth-btn"
              type="button"
              onClick={() => googleLogin()}
            >
              <FcGoogle className="text-xl" />
            </button>
            {/* <button className="oauth-btn" type="button">
              <GiFox className="text-xl text-orange-500" />
            </button> */}
          </div>

          <div className="divider">
            <span>or</span>
          </div>

          <form onSubmit={handleSubmit}>
            <label className="input-label" htmlFor="email">
              Email address
            </label>
            <div className="input-group">
              <input
                id="email"
                type="email"
                name="username"
                placeholder="Enter your email address"
                required
              />
            </div>

            <button type="submit" className="login-btn">
              Continue <span className="btn-arrow">›</span>
            </button>
          </form>

          {error ? <p id="error-msg">{error}</p> : null}

          {/* <button type="button" className="passkey-btn">
            Use passkey instead
          </button> */}
        </div>
        <div className="signup-card">
          <span>Don't have an account?</span>
          <a href="#">Sign up</a>
          </div>
        </div>
      </div>
    </div>
  );
}
