import { useEffect, useState, useContext, useRef } from "react";
import { auth, db } from "../firebase";
import { doc, getDoc } from "firebase/firestore";
import { MenuContext } from "../context/MenuContext";
import { useNavigate } from "react-router-dom";

export default function Dashboard() {
  const { menuOpen, toggleMenu } = useContext(MenuContext);
  const [profile, setProfile] = useState(null);
  const [activeView, setActiveView] = useState("overview"); // default
  const menuRef = useRef(null);
  const navigate = useNavigate();

  /* Load user profile */
  useEffect(() => {
    if (!auth.currentUser) return;

    const load = async () => {
      const snap = await getDoc(
        doc(db, "users", auth.currentUser.uid)
      );
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
    return () =>
      document.removeEventListener("mousedown", handleOutsideClick);
  }, [menuOpen, toggleMenu]);

  if (!profile) return <div style={{ padding: 30 }}>Loading...</div>;

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

          <p style={styles.item}>Branches</p>
          <p style={styles.item}>Roadmap</p>
          <p style={styles.item}>Career Discovery</p>
          <p style={styles.item}>Daily Tasks</p>
          <p style={styles.item}>Wellbeing</p>
        </div>
      )}

      {/* MAIN CONTENT */}
      <div style={styles.content}>
        {activeView === "overview" && (
          <>
            <h2>Welcome, {profile.name} </h2>
            <p style={styles.subtitle}>
              Your personal student guidance and career support platform
            </p>

            {/* ABOUT GUIDEU – SINGLE PARA */}
            <div style={styles.aboutBox}>
              <p>
                <b>GuideU</b> is a student‑centric guidance platform designed to
                support students throughout their academic journey by providing
                clear career guidance, structured learning roadmaps, productivity
                tools, and wellbeing support. It helps students overcome common
                challenges such as career confusion, skill selection, placement
                preparation, and academic stress by offering organised, reliable,
                and easy‑to‑understand guidance in one place. GuideU aims to empower
                students with clarity, confidence, and direction, making it easier
                for them to plan their future and grow steadily during college life.
              </p>
            </div>

            {/* FEATURES */}
            <div style={styles.cards}>
              <div style={styles.card}>
                <h4>🎓 Career Guidance</h4>
                <p>
                  Explore career paths related to your branch and understand
                  the skills and tools required for each role.
                </p>
              </div>

              <div style={styles.card}>
                <h4>🧭 Learning Roadmaps</h4>
                <p>
                  Follow structured roadmaps that guide you from beginner level
                  to internship and placement readiness.
                </p>
              </div>

              <div style={styles.card}>
                <h4>🤝 Ask & Explore</h4>
                <p>
                  Ask questions, clear doubts, and learn from peers,
                  seniors, and curated guidance.
                </p>
              </div>

              <div style={styles.card}>
                <h4>📅 Daily Productivity</h4>
                <p>
                  Manage daily tasks, stay consistent with goals,
                  and track your academic progress.
                </p>
              </div>

              <div style={styles.card}>
                <h4>💙 Student Wellbeing</h4>
                <p>
                  Monitor stress and motivation levels and maintain
                  a healthy balance between studies and personal life.
                </p>
              </div>

              <div style={styles.card}>
                <h4>🚀 Your Growth Partner</h4>
                <p>
                  GuideU is your companion throughout college,
                  helping you grow with clarity, confidence, and direction.
                </p>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

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
