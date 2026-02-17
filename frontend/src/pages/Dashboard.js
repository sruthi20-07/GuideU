import { useNavigate } from "react-router-dom";
import { useEffect, useState, useContext, useRef } from "react";
import { auth, db } from "../firebase";
import { doc, getDoc } from "firebase/firestore";
import { MenuContext } from "../context/MenuContext";
import Leaderboard from "../components/Leaderboard";

export default function Dashboard() {
  const { menuOpen, toggleMenu } = useContext(MenuContext);
  const [profile, setProfile] = useState(null);
  const [activeView, setActiveView] = useState("overview");
  const menuRef = useRef(null);
  const navigate = useNavigate();

  /* Load user profile */
  useEffect(() => {
    if (!auth.currentUser) return;

    const load = async () => {
      const snap = await getDoc(doc(db, "users", auth.currentUser.uid));
      setProfile(snap.data());
    };

    load();
  }, []);

  /* Close menu when clicking outside */
  useEffect(() => {
    function handleOutsideClick(e) {
      if (menuOpen && menuRef.current && !menuRef.current.contains(e.target)) {
        toggleMenu();
      }
    }

    document.addEventListener("mousedown", handleOutsideClick);
    return () => document.removeEventListener("mousedown", handleOutsideClick);
  }, [menuOpen, toggleMenu]);

  if (!profile) return <div style={{ padding: 30 }}>Loading...</div>;

  // 🧠 Alumni role logic
  const isAlumni = profile.year === 5 || profile.year === "alumni";

  return (
    <div style={styles.page}>
      {/* SIDE MENU */}
      {menuOpen && (
        <div ref={menuRef} style={styles.sideMenu}>
          <p
            style={{
              ...styles.item,
              ...(activeView === "overview" && styles.activeItem)
            }}
            onClick={() => {
  setActiveView("overview");
  toggleMenu();
}}

          >
            Overview
          </p>

          <p
            style={styles.item}
            onClick={() => {
              navigate("/explore");
              toggleMenu();
            }}
          >
            Explore
          </p>

         <p
  style={styles.item}
  onClick={() => {
    navigate("/ask-suggest");
    toggleMenu();
  }}
>
  Ask / Suggest
</p>
<p
  style={styles.item}
  onClick={() => {
    setActiveView("leaderboard");
    toggleMenu();
  }}
>
  🏆 Leaderboard
</p>


          {/* 🚫 Restricted for Alumni */}
          {!isAlumni && (
            <>
              <p style={styles.item} onClick={() => { navigate("/roadmap"); toggleMenu(); }}>
                Roadmap
              </p>

              <p style={styles.item} onClick={() => { navigate("/career"); toggleMenu(); }}>
                Career Discovery
              </p>

              <p style={styles.item} onClick={() => { navigate("/tasks"); toggleMenu(); }}>
                Daily Tasks
              </p>

              <p style={styles.item} onClick={() => { navigate("/wellbeing"); toggleMenu(); }}>
                Wellbeing
              </p>

            </>
          )}
        </div>
      )}

      {/* MAIN CONTENT */}
      <div style={styles.content}>
        {activeView === "overview" && (
          <>
            <h2>Welcome, {profile.name}</h2>

            <p style={styles.subtitle}>
              Your personal student guidance and career support platform
            </p>

            <div style={styles.aboutBox}>
              <p>
                <b>GuideU</b> is a student-centric guidance platform designed to support
                students throughout their academic journey by providing clear career
                guidance, structured learning roadmaps, productivity tools, and
                wellbeing support. GuideU empowers students with clarity, confidence,
                and direction.
              </p>
            </div>
            <div style={styles.cards}>
              <div style={styles.card}>
                <h4>🎓 Career Guidance</h4>
                <p>Explore career paths related to your branch.</p>
              </div>

              <div style={styles.card}>
                <h4>🧭 Learning Roadmaps</h4>
                <p>Structured roadmaps from beginner to placement.</p>
              </div>

              <div style={styles.card}>
                <h4>🤝 Ask & Explore</h4>
                <p>Ask questions and learn from peers and seniors.</p>
              </div>

              <div style={styles.card}>
                <h4>📅 Daily Productivity</h4>
                <p>Track tasks and maintain consistency.</p>
              </div>

              <div style={styles.card}>
                <h4>💙 Student Wellbeing</h4>
                <p>Maintain balance and mental health.</p>
              </div>

              <div style={styles.card}>
                <h4>🚀 Your Growth Partner</h4>
                <p>Clarity, confidence, and direction.</p>
              </div>
            </div>
          </>
        )}
        {activeView === "leaderboard" && (
    <Leaderboard />
  )}
      </div>
    </div>
  );
}

/* ---------- STYLES ---------- */

const styles = {
  page: {
    minHeight: "100vh",
    background: "#f4f6f8"
  },
  content: {
    padding: 30
  },
  subtitle: {
    color: "#555",
    marginBottom: 18
  },
  aboutBox: {
    background: "white",
    padding: 22,
    borderRadius: 12,
    marginBottom: 26,
    boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
    lineHeight: 1.7
  },
  sideMenu: {
    position: "fixed",
    top: 60,
    left: 0,
    width: 220,
    height: "100%",
    background: "white",
    padding: 20,
    boxShadow: "2px 0 10px rgba(0,0,0,0.15)",
    zIndex: 1000
  },
  item: {
    padding: "10px 12px",
    cursor: "pointer",
    fontWeight: 500,
    borderRadius: 6
  },
  activeItem: {
    background: "#e0e7ff",
    color: "#1e3a8a",
    fontWeight: 600
  },
  cards: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
    gap: 20
  },
  card: {
    background: "white",
    padding: 20,
    borderRadius: 12,
    boxShadow: "0 5px 15px rgba(0,0,0,0.08)"
  }
};
