import "./Home.css";
import bookImg from "../assets/book.png";
import logoImg from "../assets/logo-book.png";

export default function Home() {
  return (
    <div className="home-wrapper">
      <div className="home-card">

        {/* NAVBAR */}
        <nav className="navbar">
          <div className="nav-left">
            <img src={logoImg} alt="GuideU Logo" />
            <span>GuideU</span>
          </div>

          <div className="nav-right">
            <button className="login-btn">Login</button>
            <button className="signup-btn">Sign Up</button>
          </div>
        </nav>

        {/* HERO */}
        <div className="hero">
          <div className="hero-left">
            <img src={bookImg} alt="Books" />
          </div>

          <div className="hero-right">
            <h1>GuideU</h1>
            <p>
              One platform connecting students and alumni to build
              careers with clarity, structure, and real guidance.
            </p>

            <div className="hero-buttons">
              <button className="primary">Get Started</button>
              <button className="outline">Learn More</button>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
<<<<<<< HEAD
}
=======
}
>>>>>>> main
