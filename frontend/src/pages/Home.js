import "./Home.css";
import bookImg from "./assets/book.png";
import logoImg from "./assets/logo-book.png";
import { useNavigate } from "react-router-dom";

export default function Home() {
  const navigate = useNavigate();

  return (
    <div className="home-wrapper">
      {/* NAVBAR */}
      <nav className="home-navbar">
        <div className="nav-left">
          <img src={logoImg} alt="GuideU Logo" />
          <span>GuideU</span>
        </div>

        <div className="nav-right">
          <button className="outline-btn" onClick={() => navigate("/login")}>
            Login
          </button>
          <button className="primary-btn" onClick={() => navigate("/register")}>
            Sign Up
          </button>
        </div>
      </nav>

      {/* HERO SECTION */}
      <div className="hero">
        <div className="hero-left">
          <h1>GuideU</h1>
          <p>
            One platform connecting students and alumni to build careers
            with clarity, structure, and real guidance.
          </p>

          <div className="hero-buttons">
            <button
              className="primary-btn"
              onClick={() => navigate("/register")}
            >
              Get Started
            </button>

            <button
              className="outline-btn"
              onClick={() => navigate("/login")}
            >
              Overview
            </button>
          </div>
        </div>

        <div className="hero-right">
          <img src={bookImg} alt="Books illustration" />
        </div>
      </div>
    </div>
  );
}
