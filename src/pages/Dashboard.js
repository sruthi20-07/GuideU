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

  /* 🔹 Load user profile */
  useEffect(() => {
    if (!auth.currentUser) return;

    const load = async () => {
      const snap = await getDoc(doc(db, "users", auth.currentUser.uid));
      if (snap.exists()) {
        setProfile(snap.data());
      }
    };

    load();
  }, []);

  /* 🔹 Close menu on outside click */
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

  const normalizedYear = String(profile.year).toLowerCase();
  const isAlumni =
    normalizedYear.includes("alumni") ||
    normalizedYear.includes("5");

  return (
    <div style={styles.page}>
      {/* SIDE MENU */}
      {menuOpen && (
        <div ref={menuRef} style={styles.sideMenu}>

          <p style={styles.item} onClick={() => {
            setActiveView("overview");
            toggleMenu();
          }}>
            📊 Overview
          </p>

          <p style={styles.item} onClick={() => {
            navigate("/explore");
            toggleMenu();
          }}>
            🔎 Explore
          </p>

          <p style={styles.item} onClick={() => {
            navigate("/ask-suggest");
            toggleMenu();
          }}>
            💬 Ask / Suggest
          </p>

          {!isAlumni && (
            <>
              <p style={styles.item} onClick={() => {
                navigate("/roadmap");
                toggleMenu();
              }}>
                🧭 Roadmap
              </p>

              <p style={styles.item} onClick={() => {
                navigate("/career");
                toggleMenu();
              }}>
                🎓 Career Discovery
              </p>

              <p style={styles.item} onClick={() => {
                navigate("/tasks");
                toggleMenu();
              }}>
                📅 Daily Tasks
              </p>

              <p style={styles.item} onClick={() => {
                navigate("/wellbeing");
                toggleMenu();
              }}>
                💙 Wellbeing
              </p>
            </>
          )}

          {isAlumni ? (
            <p
              style={{ ...styles.item, color: "#2563eb", fontWeight: 600 }}
              onClick={() => {
                navigate("/alumni");
                toggleMenu();
              }}
            >
              🎓 Alumni Experience
            </p>
          ) : (
            <p
              style={{ ...styles.item, color: "#2563eb" }}
              onClick={() => {
                navigate("/alumni-stories");
                toggleMenu();
              }}
            >
              🎓 Alumni Stories
            </p>
          )}

          <p style={styles.item} onClick={() => {
            setActiveView("leaderboard");
            toggleMenu();
          }}>
            🏆 Leaderboard
          </p>
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
                wellbeing support.
              </p>
            </div>

            <div style={styles.cards}>

  {/* 🔎 Explore */}
  <div
    style={{ ...styles.card, background: "#e0f2fe" }}
    onClick={() => navigate("/explore")}
  >
    <h4>🔎 Explore</h4>
    <p>Discover opportunities related to your branch.</p>
  </div>

  {/* 💬 Ask / Suggest */}
  <div
    style={{ ...styles.card, background: "#ede9fe" }}
    onClick={() => navigate("/ask-suggest")}
  >
    <h4>💬 Ask / Suggest</h4>
    <p>Ask questions and learn from peers and seniors.</p>
  </div>

  {/* 🧭 Roadmap */}
  {!isAlumni && (
    <div
      style={{ ...styles.card, background: "#fef3c7" }}
      onClick={() => navigate("/roadmap")}
    >
      <h4>🧭 Roadmap</h4>
      <p>Structured learning roadmap from beginner to placement.</p>
    </div>
  )}

  {/* 🎓 Career Discovery */}
  {!isAlumni && (
    <div
      style={{ ...styles.card, background: "#dbeafe" }}
      onClick={() => navigate("/career")}
    >
      <h4>🎓 Career Discovery</h4>
      <p>Explore different career paths and domains.</p>
    </div>
  )}

  {/* 📅 Daily Tasks */}
  {!isAlumni && (
    <div
      style={{ ...styles.card, background: "#dcfce7" }}
      onClick={() => navigate("/tasks")}
    >
      <h4>📅 Daily Tasks</h4>
      <p>Track your daily productivity and habits.</p>
    </div>
  )}

  {/* 💙 Wellbeing */}
  {!isAlumni && (
    <div
      style={{ ...styles.card, background: "#fee2e2" }}
      onClick={() => navigate("/wellbeing")}
    >
      <h4>💙 Wellbeing</h4>
      <p>Maintain balance and mental health.</p>
    </div>
  )}

  {/* 🎓 Alumni Stories */}
  <div
    style={{ ...styles.card, background: "#f3e8ff" }}
    onClick={() =>
      isAlumni ? navigate("/alumni") : navigate("/alumni-stories")
    }
  >
    <h4>🎓 Alumni Stories</h4>
    <p>Learn from alumni experiences and journeys.</p>
  </div>

  {/* 🏆 Leaderboard */}
  <div
    style={{ ...styles.card, background: "#fef9c3" }}
    onClick={() => setActiveView("leaderboard")}
  >
    <h4>🏆 Leaderboard</h4>
    <p>See top performers and rankings.</p>
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
    background: "linear-gradient(to right, #eff6ff, #f0f9ff)"
  },
  content: {
    padding: 30
  },
  subtitle: {
    color: "#475569",
    marginBottom: 18
  },
  aboutBox: {
    background: "white",
    padding: 22,
    borderRadius: 16,
    marginBottom: 26,
    boxShadow: "0 6px 18px rgba(0,0,0,0.08)",
    lineHeight: 1.7
  },
  sideMenu: {
    position: "fixed",
    top: 60,
    left: 0,
    width: 230,
    height: "100%",
    background: "white",
    padding: 20,
    boxShadow: "2px 0 12px rgba(0,0,0,0.15)",
    zIndex: 1000
  },
  item: {
    padding: "12px 14px",
    cursor: "pointer",
    fontWeight: 500,
    borderRadius: 8
  },
  cards: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
    gap: 20
  },
 card: {
  padding: 20,
  borderRadius: 16,
  boxShadow: "0 8px 20px rgba(0,0,0,0.08)",
  cursor: "pointer",
  transition: "transform 0.2s ease"
}

};
