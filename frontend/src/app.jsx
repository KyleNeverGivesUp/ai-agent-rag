import { Routes, Route } from "react-router-dom";
import Home from "./pages/home.jsx";
import Login from "./pages/login.jsx";
import Chat from "./pages/chat.jsx";
import Signup from "./pages/signup.jsx"

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/login" element={<Login />} />
      <Route path="/chat" element={<Chat />} />
      <Route path="*" element={<Home />} />
      <Route path="/signup" element={<Signup />} />
    </Routes>
  );
}
