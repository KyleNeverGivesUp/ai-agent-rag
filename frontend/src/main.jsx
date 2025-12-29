import React from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { GoogleOAuthProvider } from "@react-oauth/google";
import App from "./app.jsx";
import "./styles.css";

const root = document.getElementById("root");

createRoot(root).render(
  <React.StrictMode>
    <GoogleOAuthProvider clientId="572456951420-qv5tp3q3bkgg5uin85qo1rb7bhlr2pcm.apps.googleusercontent.com">
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </GoogleOAuthProvider>
  </React.StrictMode>
);
