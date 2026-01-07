import { useEffect, useState } from "react";
import { auth, db } from "../firebase";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { signOut } from "firebase/auth";
import { useNavigate } from "react-router-dom";

/* 👤 AVATARS */
import avatar1 from "../assets/avatars/avatar1.png";
import avatar2 from "../assets/avatars/avatar2.png";
import avatar3 from "../assets/avatars/avatar3.png";
import avatar4 from "../assets/avatars/avatar4.png";
import avatar5 from "../assets/avatars/avatar5.png";
import avatar6 from "../assets/avatars/avatar6.png";

const AVATARS = [avatar1, avatar2, avatar3, avatar4, avatar5, avatar6];

export default function ProfileMenu() {
  const [open, setOpen] = useState(false);
  const [profile, setProfile] = useState(null);
  const [editAvatar, setEditAvatar] = useState(false);

  const navigate = useNavigate();

  useEffect(() => {
    const load = async () => {
      const snap = await getDoc(doc(db, "users", auth.currentUser.uid));
      setProfile(snap.data());
    };
    load();
  }, []);

  const changeAvatar = async (a) => {
    await updateDoc(doc(db, "users", auth.currentUser.uid), { avatar: a });
    setProfile({ ...profile, avatar: a });
    setEditAvatar(false);
  };

  const logout = async () => {
    await signOut(auth);
    navigate("/");
  };

  if (!profile) return null;

  return (
    <div style={{ position: "absolute", top: 15, right: 15, zIndex: 100 }}>
      <div onClick={() => setOpen(true)} style={{ cursor: "pointer" }}>
        <img
          src={profile.avatar}
          alt="avatar"
          style={{ width: 42, height: 42, borderRadius: "50%" }}
        />
      </div>

      {open && (
        <div style={styles.menu}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <img src={profile.avatar} style={styles.bigAvatar} />
            <span
              onClick={() => setEditAvatar(!editAvatar)}
              style={styles.pencil}
            >
              ✏️
            </span>
          </div>

          {editAvatar && (
            <div style={styles.avatarGrid}>
              {AVATARS.map((a, i) => (
                <img
                  key={i}
                  src={a}
                  onClick={() => changeAvatar(a)}
                  style={styles.avatar}
                />
              ))}
            </div>
          )}

          <strong>{profile.name}</strong>
          <button style={styles.logout} onClick={logout}>Logout</button>
        </div>
      )}
    </div>
  );
}

const styles = {
  menu: {
    position: "absolute",
    right: 0,
    top: 50,
    background: "white",
    padding: 16,
    borderRadius: 12,
    width: 260,
    boxShadow: "0 10px 20px rgba(0,0,0,.15)"
  },
  bigAvatar: {
    width: 60,
    height: 60,
    borderRadius: "50%"
  },
  pencil: {
    cursor: "pointer",
    fontSize: 18
  },
  avatarGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(3,1fr)",
    gap: 10,
    margin: "12px 0"
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: "50%",
    cursor: "pointer"
  },
  logout: {
    marginTop: 14,
    width: "100%",
    padding: 9,
    background: "#ef4444",
    color: "white",
    border: "none",
    borderRadius: 8,
    cursor: "pointer"
  }
};