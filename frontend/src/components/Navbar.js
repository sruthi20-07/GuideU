import { useContext, useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { auth, db } from "../firebase";
import { doc, getDoc } from "firebase/firestore";
import { MenuContext } from "../context/MenuContext";

export default function Navbar() {
  const navigate = useNavigate();
  const { toggleMenu } = useContext(MenuContext);

  const [profileOpen, setProfileOpen] = useState(false);
  const [profile, setProfile] = useState(null);
  const profileRef = useRef(null);

  /* Load user profile */
  useEffect(() => {
    if (!auth.currentUser) return;

    const loadProfile = async () => {
      const snap = await getDoc(
        doc(db, "users", auth.currentUser.uid)
      );
      setProfile(snap.data());
    };

    loadProfile();
  }, []);

  /* ✅ CLOSE PROFILE ON OUTSIDE CLICK */
  useEffect(() => {
    function handleClickOutside(e) {
      if (
        profileOpen &&
        profileRef.current &&
        !profileRef.current.contains(e.target)
      ) {
        setProfileOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () =>
      document.removeEventListener("mousedown", handleClickOutside);
  }, [profileOpen]);

  const name = profile?.name || "User";
  const initial = name.charAt(0).toUpperCase();

  return (
    <div style={styles.navbar}>
      {/* LEFT */}
      <div style={styles.left}>
        {/* 🔒 3 DOT MENU */}
        <button
          style={styles.menuBtn}
          onClick={toggleMenu}
          title="Open menu"
        >
          ⋮
        </button>

        <button
          style={styles.backBtn}
          onClick={() => navigate(-1)}
        >
          Back
        </button>
      </div>

      {/* CENTER */}
      <div style={styles.center}>GuideU</div>

      {/* RIGHT */}
      <div style={styles.right} ref={profileRef}>
        <div
          style={styles.avatar}
          onClick={() => setProfileOpen(!profileOpen)}
        >
          {initial}
        </div>

        {profileOpen && profile && (
          <div style={styles.dropdown}>
            {/* USER INFO */}
            <div style={styles.userInfo}>
              <div style={styles.avatarLarge}>{initial}</div>
              <div>
                <div style={styles.name}>{profile.name}</div>
                <div style={styles.sub}>
                  Year: {profile.year}<br />
                  Branch: {profile.branch}
                </div>
              </div>
            </div>

            <div style={styles.divider} />

            {/* STATS */}
            <div style={styles.statRow}>
              <span>Questions Asked</span>
              <b>{profile.questionsAsked || 0}</b>
            </div>

            <div style={styles.statRow}>
              <span>Questions Answered</span>
              <b>{profile.questionsAnswered || 0}</b>
            </div>

            <div style={styles.statRow}>
              <span>Coins</span>
              <b>🪙 {profile.coins || 0}</b>
            </div>

            <div style={styles.divider} />

            {/* LOGOUT */}
            <div
              style={styles.logout}
              onClick={() => {
                auth.signOut();
                navigate("/login");
              }}
            >
              Logout
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

/* ---------- STYLES ---------- */
const styles = {
  navbar: {
    height: 60,
    background: "white",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    padding: "0 16px",
    boxShadow: "0 1px 5px rgba(0,0,0,0.1)",
    position: "sticky",
    top: 0,
    zIndex: 1000
  },
  left: {
    display: "flex",
    alignItems: "center",
    gap: 12
  },
  center: {
    fontWeight: 600,
    fontSize: 16
  },
  right: {
    position: "relative"
  },
  menuBtn: {
    fontSize: 30,
    fontWeight: 900,
    background: "transparent",
    border: "none",
    cursor: "pointer",
    color: "#000"
  },
  backBtn: {
    background: "#0ea5e9",
    color: "white",
    border: "none",
    padding: "6px 16px",
    borderRadius: 6,
    cursor: "pointer",
    fontWeight: 500
  },
  avatar: {
    width: 36,
    height: 36,
    borderRadius: "50%",
    background: "#2563eb",
    color: "white",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontWeight: 600,
    cursor: "pointer"
  },
  dropdown: {
    position: "absolute",
    right: 0,
    top: 48,
    width: 260,
    background: "white",
    borderRadius: 12,
    boxShadow: "0 10px 25px rgba(0,0,0,0.15)",
    padding: 14,
    zIndex: 2000
  },
  userInfo: {
    display: "flex",
    alignItems: "center",
    gap: 12
  },
  avatarLarge: {
    width: 48,
    height: 48,
    borderRadius: "50%",
    background: "#2563eb",
    color: "white",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontWeight: 700,
    fontSize: 18
  },
  name: {
    fontWeight: 600
  },
  sub: {
    fontSize: 13,
    color: "#555",
    lineHeight: 1.4
  },
  divider: {
    height: 1,
    background: "#eee",
    margin: "12px 0"
  },
  statRow: {
    display: "flex",
    justifyContent: "space-between",
    fontSize: 14,
    padding: "6px 0"
  },
  logout: {
    marginTop: 6,
    padding: "8px",
    textAlign: "center",
    borderRadius: 6,
    cursor: "pointer",
    color: "#dc2626",
    fontWeight: 600
  }
};
