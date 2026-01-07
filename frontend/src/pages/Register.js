import { useState } from "react";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { doc, setDoc } from "firebase/firestore";
import { auth, db } from "../firebase";
import { useNavigate } from "react-router-dom";

/* 👤 AVATARS */
import avatar1 from "../assets/avatars/avatar1.png";
import avatar2 from "../assets/avatars/avatar2.png";
import avatar3 from "../assets/avatars/avatar3.png";
import avatar4 from "../assets/avatars/avatar4.png";
import avatar5 from "../assets/avatars/avatar5.png";
import avatar6 from "../assets/avatars/avatar6.png";

const AVATARS = [avatar1, avatar2, avatar3, avatar4, avatar5, avatar6];

export default function Register() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [year, setYear] = useState(1);
  const [branch, setBranch] = useState("");
  const [avatar, setAvatar] = useState(null);
  const [popup, setPopup] = useState(null);

  const navigate = useNavigate();

  const validate = () => {
    if (!name || !email || !password || !branch || !avatar)
      return "All fields including avatar are required";
    if (!/^\S+@\S+\.\S+$/.test(email))
      return "Invalid email format";
    if (password.length < 6)
      return "Password must be at least 6 characters";
    return null;
  };

  const register = async () => {
    const error = validate();
    if (error) {
      setPopup({ text: error, type: "error" });
      return;
    }

    try {
      const res = await createUserWithEmailAndPassword(auth, email, password);

      await setDoc(doc(db, "users", res.user.uid), {
        name,
        email,
        year,
        branch,
        avatar,        // 👈 SAVED HERE
        createdAt: new Date()
      });

      setPopup({ text: "Registration successful", type: "success" });
      setTimeout(() => navigate("/dashboard"), 1500);
    } catch (err) {
      setPopup({ text: "Registration failed. Try again.", type: "error" });
    }
  };

  return (
    <div style={styles.page}>
      <div style={styles.card}>
        <h2 style={styles.title}>Create Account</h2>

        <input style={styles.input} placeholder="Name"
          onChange={e => setName(e.target.value)} />

        <input style={styles.input} placeholder="Email"
          onChange={e => setEmail(e.target.value)} />

        <input style={styles.input} type="password" placeholder="Password"
          onChange={e => setPassword(e.target.value)} />

        <select style={styles.input} onChange={e => setYear(e.target.value)}>
          <option value={1}>1st Year</option>
          <option value={2}>2nd Year</option>
          <option value={3}>3rd Year</option>
          <option value={4}>4th Year</option>
          <option value="alumni">Alumni</option>
        </select>

        <select style={styles.input} onChange={e => setBranch(e.target.value)}>
          <option value="">Select Branch</option>
          <option value="CSE">CSE</option>
          <option value="IT">IT</option>
          <option value="AI&DS">AI&DS</option>
          <option value="AIML">AIML</option>
          <option value="ECE">ECE</option>
          <option value="EEE">EEE</option>
          <option value="MECH">MECH</option>
          <option value="CIVIL">CIVIL</option>
          <option value="CYBER SECURITY">CYBER SECURITY</option>
        </select>

        {/* 👤 AVATAR SELECTION */}
        <div style={styles.avatarSection}>
          <p style={{ fontWeight: 600, marginBottom: 8 }}>
            Choose an Avatar
          </p>

          <div style={styles.avatarGrid}>
            {AVATARS.map((a, i) => (
              <img
                key={i}
                src={a}
                alt="avatar"
                onClick={() => setAvatar(a)}
                style={{
                  ...styles.avatar,
                  border: avatar === a
                    ? "3px solid #2563eb"
                    : "2px solid transparent"
                }}
              />
            ))}
          </div>
        </div>

        <button style={styles.button} onClick={register}>
          Register
        </button>
      </div>

      {popup && (
        <div style={{
          ...styles.popup,
          background: popup.type === "error" ? "#fee2e2" : "#dcfce7"
        }}>
          {popup.text}
        </div>
      )}
    </div>
  );
}

const styles = {
  page: {
    minHeight: "100vh",
    background: "linear-gradient(to right, #f8fafc, #eef2ff)",
    display: "flex",
    justifyContent: "center",
    alignItems: "center"
  },
  card: {
    width: 400,
    padding: 32,
    borderRadius: 14,
    background: "white",
    boxShadow: "0 10px 25px rgba(0,0,0,0.1)"
  },
  title: {
    textAlign: "center",
    marginBottom: 20
  },
  input: {
    width: "100%",
    padding: 10,
    marginBottom: 12,
    borderRadius: 6,
    border: "1px solid #c7d2fe"
  },
  avatarSection: {
    marginBottom: 18
  },
  avatarGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(3, 1fr)",
    gap: 12
  },
  avatar: {
    width: 70,
    height: 70,
    borderRadius: "50%",
    cursor: "pointer",
    objectFit: "cover"
  },
  button: {
    width: "100%",
    padding: 10,
    background: "#2563eb",
    color: "white",
    borderRadius: 6,
    border: "none",
    cursor: "pointer",
    fontWeight: 600
  },
  popup: {
    position: "fixed",
    bottom: 20,
    padding: 12,
    borderRadius: 6
  }
};