import { useEffect, useState, useRef } from "react";
import { auth, db } from "../firebase";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { signOut } from "firebase/auth";
import { useNavigate } from "react-router-dom";
import { avatarMap, AVATAR_KEYS } from "../utils/avatarMap";

export default function ProfileMenu() {
  const [open, setOpen] = useState(false);
  const [editAvatar, setEditAvatar] = useState(false);
  const [profile, setProfile] = useState(null);
  const menuRef = useRef();

  const navigate = useNavigate();

  useEffect(() => {
    if (!auth.currentUser) return;

    const load = async () => {
      const snap = await getDoc(doc(db, "users", auth.currentUser.uid));
      const data = snap.data();

      // 🧹 AUTO-REPAIR BROKEN AVATAR DATA
      if (!data.avatar || !avatarMap[data.avatar]) {
        const defaultAvatar = AVATAR_KEYS[0];

        await updateDoc(doc(db, "users", auth.currentUser.uid), {
          avatar: defaultAvatar
        });

        setProfile({ ...data, avatar: defaultAvatar });
      } else {
        setProfile(data);
      }
    };

    load();
  }, []);

  // Close menu when clicking outside
  useEffect(() => {
    const handler = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setOpen(false);
        setEditAvatar(false);
      }
    };

    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const updateAvatar = async (key) => {
    await updateDoc(doc(db, "users", auth.currentUser.uid), { avatar: key });
    setProfile(prev => ({ ...prev, avatar: key }));
    setEditAvatar(false);
  };

  const logout = async () => {
    await signOut(auth);
    navigate("/");
  };

  if (!profile) return null;

  // 🔥 IMPORTANT FIX
  const userYear = profile.year === "alumni"
    ? "alumni"
    : Number(profile.year);

  return (
    <div style={{ position: "absolute", top: 15, right: 15 }} ref={menuRef}>
      {/* AVATAR ICON */}
      <div onClick={() => setOpen(prev => !prev)} style={{ cursor: "pointer" }}>
        <img
          src={avatarMap[profile.avatar]}
          alt="profile"
          style={{ width: 44, height: 44, borderRadius: "50%" }}
        />
      </div>

      {open && (
        <div style={styles.menu}>
          <strong>{profile.name}</strong>

          {/* 🎯 YEAR BASED STATS DISPLAY */}

          {userYear === 1 && (
            <div style={{ marginTop: 8 }}>
              ❓ Questions Asked: {profile.questionsAsked || 0}
            </div>
          )}

          {[2,3,4].includes(userYear) && (
            <div style={{ marginTop: 8 }}>
              ❓ Questions Asked: {profile.questionsAsked || 0}
              <br />
              💬 Answers Given: {profile.answersGiven || 0}
            </div>
          )}

          {userYear === "alumni" && (
            <div style={{ marginTop: 8 }}>
              💬 Answers Given: {profile.answersGiven || 0}
            </div>
          )}

          <div style={{ marginTop: 10 }}>
            <button
              onClick={() => setEditAvatar(prev => !prev)}
              style={styles.editBtn}
            >
              ✏️ Change Avatar
            </button>
          </div>

          {editAvatar && (
            <div style={styles.avatarGrid}>
              {AVATAR_KEYS.map(key => (
                <img
                  key={key}
                  src={avatarMap[key]}
                  onClick={() => updateAvatar(key)}
                  style={{
                    ...styles.avatar,
                    border:
                      profile.avatar === key
                        ? "3px solid #2563eb"
                        : "2px solid transparent"
                  }}
                  alt="avatar"
                />
              ))}
            </div>
          )}

          <button onClick={logout} style={styles.logout}>
            Logout
          </button>
        </div>
      )}
    </div>
  );
}

const styles = {
  menu: {
    marginTop: 10,
    background: "white",
    padding: 14,
    width: 240,
    borderRadius: 12,
    boxShadow: "0 10px 20px rgba(0,0,0,.15)"
  },
  editBtn: {
    width: "100%",
    padding: 6,
    borderRadius: 6,
    background: "#e5e7eb",
    border: "none",
    cursor: "pointer"
  },
  avatarGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(3,1fr)",
    gap: 10,
    marginTop: 10
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: "50%",
    cursor: "pointer"
  },
  logout: {
    marginTop: 12,
    width: "100%",
    padding: 8,
    background: "#ef4444",
    color: "white",
    border: "none",
    borderRadius: 6,
    cursor: "pointer"
  }
};
