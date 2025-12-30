import { useState } from "react";
import { GoogleLogin } from "@react-oauth/google";
import { Link, useNavigate } from "react-router-dom";
import { FcGoogle } from "react-icons/fc";
import { FaGithub } from "react-icons/fa";

export default function Signup(){
    const navigate = useNavigate();
    const [error, setError] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [emailChecked, setEmailChecked] = useState(false);
    const [emailExists, setEmailExists] = useState(false);
    const [loading, setLoading] = useState(false);
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
                                <FcGoogle/>
                            </button>
                        </div>
                        <div className="divider">
                            <span>or</span>
                        </div>

                        <div>
                            <label className="input-label">Email address</label>
                        </div>
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
                        <div>
                            <label className="input-label" htmlFor="password">
                                Password
                            </label>
                            <div className="input-group">
                            <input
                                id="password"
                                type="password"
                                name="password"
                                placeholder="Enter your password"
                                required
                                value={password}
                                onChange={(event) => setPassword(event.target.value)}
                            />
                            </div>
                        </div>      
                    </div>
                </div>
            </div>
        </div>
    )
}