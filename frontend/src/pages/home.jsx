import { Link } from "react-router-dom";

export default function Home() {
  return (
    <div>
      <nav>
        <div className="logo">KYLE.HU</div>
        <ul>
          <li>
            <a href="#home">Home</a>
          </li>
          <li>
            <a href="#about">About</a>
          </li>
          <li>
            <Link to="/login" className="chatbot-btn">
              <span className="new-badge" aria-label="new feature">NEW</span>
              Chatbot
            </Link>
          </li>
        </ul>
      </nav>

      <header id="home">
        <img src="/profile.jpg" alt="Kyle Hu" className="profile-img" />
        <h1>Kyle Hu</h1>
        <p>
          Computer Science @ UCSD '27 <br />
          Systems - AI Infra - Engineering
        </p>

        <div className="social-links">
          <a
            href="https://github.com/KyleNeverGivesup"
            target="_blank"
            rel="noreferrer"
          >
            <i className="fab fa-github"></i>
          </a>
          <a
            href="https://linkedin.com/in/kylehu112"
            target="_blank"
            rel="noreferrer"
          >
            <i className="fab fa-linkedin"></i>
          </a>
        </div>
      </header>

      <section className="about-section" id="about">
        <div className="about-container">
          <h2>About Me</h2>
          <p>
            I bridge the gap between academic theory and industrial scale. With{" "}
            <strong>4 years of engineering experience</strong> at tech companies like{" "}
            <strong>Bilibili</strong>, I returned to <strong>UCSD</strong> to deepen my
            understanding of CS fundamentals.
          </p>
          <p style={{ marginTop: "1rem" }}>
            Currently, I am deep-diving into <strong>Full Stack AI development</strong>,
            specifically building systems with <strong>RAG</strong> and the{" "}
            <strong>Model Context Protocol (MCP)</strong>.
          </p>
          <p style={{ marginTop: "1rem" }}>
            Prior to this, I conducted research on <strong>AI-based database engines</strong>,
            where I optimized inference pipelines for high-performance query execution.
            Welcome to my personal space!
          </p>
        </div>
      </section>

      <div className="footer">(c) 2025 Kyle Hu. Built with passion.</div>
    </div>
  );
}
