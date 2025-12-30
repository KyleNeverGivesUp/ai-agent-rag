import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useGoogleLogin } from "@react-oauth/google";
import { FcGoogle } from "react-icons/fc";
import { FaGithub, FaEye, FaEyeSlash } from "react-icons/fa";
import { GiFox } from "react-icons/gi";

const CHECK_EMAIL_URL = "/auth/check-email";
const LOGIN_URL = "/auth/login";
const GOOGLE_LOGIN_URL = "/auth/google";

export default function Login() {
  const navigate = useNavigate();
  const [error, setError] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [emailChecked, setEmailChecked] = useState(false);
  const [emailExists, setEmailExists] = useState(false);
  const [loading, setLoading] = useState(false);

  const googleLogin = useGoogleLogin({
    scope: "openid email profile",
    onSuccess: async (tokenResponse) => {
      console.log("Google token:", tokenResponse.access_token);
      try {
        const authResponse = await fetch(GOOGLE_LOGIN_URL, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            access_token: tokenResponse.access_token,
          }),
        });
        if (!authResponse.ok) {
          throw new Error("Google auth failed");
        }
        const authData = await authResponse.json();
        localStorage.setItem("access_token", authData?.token || "google-token");
        if (authData?.user) {
          localStorage.setItem("user_profile", JSON.stringify(authData.user));
        }
      } catch (err) {
        console.error("Failed to complete Google login:", err);
        setError("Google login failed.");
        return;
      }
      navigate("/chat");
    },
    onError: () => setError("Google login failed."),
  });

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");
    const trimmedEmail = email.trim();

    if (!trimmedEmail) {
      setError("Email is required.");
      return;
    }

    if (!emailChecked) {
      setLoading(true);
      try {
        const response = await fetch(CHECK_EMAIL_URL, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ email: trimmedEmail }),
        });
        // console.log('这里')
        // console.log(response)
        if (!response.ok) {
          throw new Error("Email check failed.");
        }

        const data = await response.json();
        const exists = Boolean(data?.exists);
        setEmailChecked(true);
        setEmailExists(exists);

        if (!exists) {
          setError("Email does not exist");
        }
      } catch (err) {
        setError("Email check failed. Please try again.");
      } finally {
        setLoading(false);
      }
      return;
    }

    if (emailExists) {
      if (!password.trim()) {
        setError("Password is required.");
        return;
      }

      setLoading(true);
      try {
        const response = await fetch(LOGIN_URL, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ email: trimmedEmail, password }),
        });

        if (!response.ok) {
          throw new Error("Login failed");
        }

        const data = await response.json();
        localStorage.setItem("access_token", data?.token || "email-token");
        if (data?.user) {
          localStorage.setItem("user_profile", JSON.stringify(data.user));
        }
        navigate("/chat");
      } catch (err) {
        setError("Invalid email or password.");
      } finally {
        setLoading(false);
      }
    }
  };

  const showEmailError = Boolean(error && emailChecked && !emailExists);
  const showFormError = Boolean(error && !showEmailError);

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
                name="email"
                placeholder="Enter your email address"
                required
                value={email}
                onChange={(event) => {
                  setEmail(event.target.value);
                  if (emailChecked) {
                    setEmailChecked(false);
                    setEmailExists(false);
                    setPassword("");
                  }
                }}
              />
            </div>
            {showEmailError ? <p id="error-msg">{error}</p> : null}

            {emailChecked && emailExists ? (
              <>
                <label className="input-label" htmlFor="password">
                  Password
                </label>
                <div className="input-group">
                  <input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    name="password"
                    placeholder="Enter your password"
                    required
                    className="password-input"
                    value={password}
                    onChange={(event) => setPassword(event.target.value)}
                  />
                  <button
                    type="button"
                    className="password-toggle"
                    onClick={() => setShowPassword((prev) => !prev)}
                    aria-label={showPassword ? "Hide password" : "Show password"}
                  >
                    {showPassword ? <FaEyeSlash /> : <FaEye />}
                  </button>
                </div>
              </>
            ) : null}

            <button type="submit" className="login-btn">
              {loading ? "Please wait..." : "Continue"}{" "}
              <span className="btn-arrow">›</span>
            </button>
          </form>

          {showFormError ? <p id="error-msg">{error}</p> : null}

          {/* <button type="button" className="passkey-btn">
            Use passkey instead
          </button> */}
        </div>
        <div className="signup-card">
          <span>Don't have an account?</span>
          <Link to="/signup" className="chatbot-btn">Sign up</Link>
          {/* <a href="#">Sign up</a> */}
          </div>
        </div>
      </div>
    </div>
  );
}
