import { useContext, useEffect, useRef, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { auth, db } from "../firebase";
import {
  doc,
  getDoc,
  collection,
  query,
  where,
  onSnapshot,
  updateDoc
} from "firebase/firestore";
import { MenuContext } from "../context/MenuContext";
import { avatarMap, AVATAR_KEYS } from "../utils/avatarMap";

export default function Navbar() {
  const navigate = useNavigate();
  const location = useLocation();
  const { toggleMenu } = useContext(MenuContext);

  const [profileOpen, setProfileOpen] = useState(false);
  const [editAvatar, setEditAvatar] = useState(false);
  const [profile, setProfile] = useState(null);
  const [dailyStreak, setDailyStreak] = useState(0);
  const [notifications, setNotifications] = useState([]);
  const profileRef = useRef(null);

  const hideNavbar =
    location.pathname === "/login" ||
    location.pathname === "/register";

  useEffect(() => {
    if (!auth.currentUser) return;

    getDoc(doc(db, "users", auth.currentUser.uid)).then(snap => {
      const data = snap.data();
      setProfile(data);
      setDailyStreak(data?.dailyStreak || 0);
    });
  }, []);

  useEffect(() => {
    if (!auth.currentUser) return;

    const q = query(
      collection(db, "notifications"),
      where("userId", "==", auth.currentUser.uid)
    );

    const unsub = onSnapshot(q, snap => {
      setNotifications(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    });

    return () => unsub();
  }, []);

  useEffect(() => {
    function close(e) {
      if (
        profileOpen &&
        profileRef.current &&
        !profileRef.current.contains(e.target)
      ) {
        setProfileOpen(false);
        setEditAvatar(false);
      }
    }
    document.addEventListener("mousedown", close);
    return () => document.removeEventListener("mousedown", close);
  }, [profileOpen]);

  if (hideNavbar) return null;

  const name = profile?.name || "User";
  const initial = name.charAt(0).toUpperCase();

  const avatarSrc =
    profile?.avatar && avatarMap[profile.avatar]
      ? avatarMap[profile.avatar]
      : null;

  const isAlumni = profile?.year === 5 || profile?.year === "alumni";
  const displayYear = isAlumni ? "🎓 Alumni" : `Year: ${profile?.year}`;

  return (
    <div style={styles.navbar}>
      <div style={styles.left}>
        <button
          style={styles.menuBtn}
          onClick={() => {
            setProfileOpen(false);
            if (location.pathname === "/dashboard") {
              toggleMenu();
            } else {
              navigate("/dashboard");
              setTimeout(() => toggleMenu(), 0);
            }
          }}
        >
          ⋮
        </button>

        <button
          style={styles.backBtn}
          onClick={() => {
            setProfileOpen(false);
            navigate(-1);
          }}
        >
          Back
        </button>
      </div>

      <div style={styles.center}>GuideU</div>

      <div style={styles.right} ref={profileRef}>
        <div style={{ cursor: "pointer", marginRight: 12 }}>
          🔔 {notifications.filter(n => !n.read).length}
        </div>

        <div
          style={styles.avatar}
          onClick={(e) => {
            e.stopPropagation();
            setProfileOpen(prev => !prev);
          }}
        >
          {avatarSrc ? (
            <img
              src={avatarSrc}
              alt="avatar"
              style={{ width: "100%", height: "100%", borderRadius: "50%" }}
            />
          ) : (
            initial
          )}
        </div>

        {profileOpen && profile && (
          <div style={styles.dropdown}>
            <div onClick={() => setProfileOpen(false)} style={styles.closeBtn}>×</div>

            <div style={styles.userInfo}>
              <div style={{ position: "relative" }}>
                <div style={styles.avatarLarge}>
                  {avatarSrc ? (
                    <img
                      src={avatarSrc}
                      alt="avatar"
                      style={{ width: "100%", height: "100%", borderRadius: "50%" }}
                    />
                  ) : (
                    initial
                  )}
                </div>

                {/* ✏️ EDIT ICON */}
                <div
                  style={{
                    position: "absolute",
                    bottom: -2,
                    right: -2,
                    background: "#2563eb",
                    color: "#fff",
                    borderRadius: "50%",
                    width: 22,
                    height: 22,
                    fontSize: 12,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    cursor: "pointer"
                  }}
                  onClick={() => setEditAvatar(prev => !prev)}
                >
                  ✏️
                </div>
              </div>

              <div>
                <div style={styles.name}>{profile.name}</div>
                <div style={styles.sub}>
                  {displayYear}<br />
                  Branch: {profile.branch}
                </div>
              </div>
            </div>

            {editAvatar && (
              <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 10, marginTop: 12 }}>
                {AVATAR_KEYS.map(key => (
                  <img
                    key={key}
                    src={avatarMap[key]}
                    alt="avatar"
                    style={{
                      width: 50,
                      height: 50,
                      borderRadius: "50%",
                      cursor: "pointer",
                      border: profile.avatar === key ? "3px solid #2563eb" : "2px solid transparent"
                    }}
                    onClick={async () => {
                      await updateDoc(doc(db, "users", auth.currentUser.uid), { avatar: key });
                      setProfile(prev => ({ ...prev, avatar: key }));
                      setEditAvatar(false);
                    }}
                  />
                ))}
              </div>
            )}

            <div style={styles.divider} />

            <div style={{ fontSize: 14, lineHeight: "1.6" }}>
              📝 Questions Asked: {profile.questionsAsked || 0}<br />
              🪙 Coins: {profile.coins || 0}<br />
              🔥 Daily Streak: {dailyStreak} days
            </div>

            <div style={styles.divider} />

            <div style={{ marginTop: 10 }}>
              <b>Notifications</b>
              {notifications.map(n => (
                <div
                  key={n.id}
                  style={{
                    fontSize: 13,
                    padding: 6,
                    background: n.read ? "#f3f4f6" : "#e0f2fe",
                    marginTop: 6,
                    borderRadius: 6,
                    cursor: "pointer"
                  }}
                  onClick={async () => {
                    await updateDoc(doc(db, "notifications", n.id), { read: true });
                    navigate(n.link);
                  }}
                >
                  {n.message}
                </div>
              ))}
            </div>

            <div style={styles.divider} />

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
    background: "#fff",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    padding: "0 16px",
    position: "sticky",
    top: 0,
    zIndex: 9999,
    boxShadow: "0 1px 5px rgba(0,0,0,0.1)"
  },

  left: {
    display: "flex",
    alignItems: "center",
    gap: 10,
    marginLeft: 4
  },

  center: { fontWeight: 600 },

  right: { position: "relative" },

  menuBtn: {
    width: 40,
    height: 40,
    fontSize: 26,
    fontWeight: 800,
    background: "transparent",
    border: "none",
    cursor: "pointer",
    color: "#000",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    lineHeight: "1"
  },

  backBtn: {
    background: "#0ea5e9",
    color: "#fff",
    border: "none",
    padding: "6px 14px",
    borderRadius: 6,
    cursor: "pointer",
    height: 32
  },

  avatar: {
    width: 36,
    height: 36,
    borderRadius: "50%",
    background: "#2563eb",
    color: "#fff",
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
    background: "#fff",
    borderRadius: 12,
    padding: 14,
    boxShadow: "0 10px 25px rgba(0,0,0,0.15)"
  },

  closeBtn: {
    position: "absolute",
    top: 8,
    right: 10,
    cursor: "pointer",
    fontSize: 18,
    fontWeight: 700,
    color: "#444"
  },

  userInfo: { display: "flex", gap: 12 },

  avatarLarge: {
    width: 48,
    height: 48,
    borderRadius: "50%",
    background: "#2563eb",
    color: "#fff",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontWeight: 700
  },

  name: { fontWeight: 600 },
  sub: { fontSize: 13, color: "#555" },
  divider: { height: 1, background: "#eee", margin: "12px 0" },

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
