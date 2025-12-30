import { useState } from "react";
import { GoogleLogin } from "@react-oauth/google";
import { Link, useNavigate } from "react-router-dom";
import { FcGoogle } from "react-icons/fc";
import { FaGithub, FaEye, FaEyeSlash } from "react-icons/fa";

const SIGNUP_URL = "/api/auth/signup";

export default function Signup(){
    const navigate = useNavigate();
    const [error, setError] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [emailChecked, setEmailChecked] = useState(false);
    const [emailExists, setEmailExists] = useState(false);
    const [loading, setLoading] = useState(false);

    const signupSubmit = async (event)=>{
        event.preventDefault();
        setError("");
        if (!email.trim() || !password.trim()) {
            setError("Email and password are required.");
            return;
        }
        setLoading(true);
        try {
            const response = await fetch(SIGNUP_URL, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ email: email.trim(), password }),
            });
            if (!response.ok) {
                const data = await response.json().catch(() => ({}));
                const message =
                    data?.detail || "Signup failed. Please try again.";
                throw new Error(message);
            }
            const data = await response.json();
            if (data?.ok) {
                localStorage.setItem("access_token", data?.token || "email-token");
                if (data?.user) {
                    localStorage.setItem("user_profile", JSON.stringify(data.user));
                }
                navigate("/chat");
            }
        } catch (err) {
            setError(err?.message || "Signup failed. Please try again.");
        } finally {
            setLoading(false);
        }
    }
    return(
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
                        <h2>Create your account</h2>
                        <p>Welcome! Please fill in the details to get started</p>

                        <div className="oauth-row">
                            <button className="oauth-btn" type="button" >
                                <FaGithub className="text-xl" />
                            </button>
                            <button className="oauth-btn" type="button" onClick={()=> GoogleLogin()}>
                                <FcGoogle className="text-xl"/>
                            </button>
                        </div>
                        <div className="divider">
                            <span>or</span>
                        </div>

                        <form onSubmit={signupSubmit} autoComplete="off">
                            <label className="input-label">Email address</label>
                            <div className="input-group">
                             <input
                                id="email"
                                type="email"
                                name="email"
                                placeholder="Enter your email address"
                                required
                                autoComplete="off"
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
                             
                            <label className="input-label" htmlFor="password">
                                Password
                            </label>
                            <div className="password-wrapper">
                                <input
                                    id="password"
                                    type={showPassword ? "text" : "password"}
                                    name="password"
                                    placeholder="Enter your password"
                                    required
                                    autoComplete="new-password"
                                    value={password}
                                    onChange={(event) => setPassword(event.target.value)}
                                />
                                <button
                                type="button"
                                className="password-toggle"
                                onClick={()=> setShowPassword(prev => !prev)}
                                aria-label={showPassword ? "Hide password" : "Show password"}
                                >
                                    {showPassword ? <FaEyeSlash /> : <FaEye />}
                                </button>
                            </div>
                            
                            <button type="submit" className="login-btn">
                                {loading ? "Please wait..." : "Continue"}{" "}
                                <div className="btn-arrow">›</div>
                            </button>
                            {error ? <p id="error-msg">{error}</p> : null}
                        </form>  
                    </div>
                     <div className="signup-card">
                        <span>Don't have an account?</span>
                        <Link to="/login">Sign in</Link>
                    </div>
                </div>
            </div>
        </div>
    )
}
