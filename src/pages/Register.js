import { useState } from "react";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { doc, setDoc } from "firebase/firestore";
import { auth, db } from "../firebase";
import { useNavigate } from "react-router-dom";
import { avatarMap, AVATAR_KEYS } from "../utils/avatarMap";

export default function Register() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [year, setYear] = useState(1);
  const [branch, setBranch] = useState("");
  const [avatar, setAvatar] = useState("");
  const [popup, setPopup] = useState(null);

  const navigate = useNavigate();

  const validate = () => {
    if (!name || !email || !password || !branch || !avatar)
      return "All fields including profile picture are required";
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
        avatar,
        dailyStreak: 0,
        createdAt: new Date()
      });

      setPopup({ text: "Registration successful", type: "success" });
      setTimeout(() => navigate("/dashboard"), 1500);
    } catch (err) {
      console.error(err);

      if (err.code === "auth/email-already-in-use") {
        setPopup({ text: "This email is already registered. Please login instead.", type: "error" });
      } else if (err.code === "auth/weak-password") {
        setPopup({ text: "Password should be at least 6 characters.", type: "error" });
      } else {
        setPopup({ text: err.message, type: "error" });
      }
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

        <p style={{ fontWeight: 600 }}>Select Profile Picture</p>

        <div style={styles.avatarGrid}>
          {AVATAR_KEYS.map(key => (
            <img
              key={key}
              src={avatarMap[key]}
              alt="avatar"
              onClick={() => setAvatar(key)}
              style={{
                ...styles.avatar,
                border: avatar === key
                  ? "3px solid #2563eb"
                  : "2px solid transparent"
              }}
            />
          ))}
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
    background: "#eef2ff",
    display: "flex",
    justifyContent: "center",
    alignItems: "center"
  },
  card: {
    width: 420,
    padding: 30,
    borderRadius: 14,
    background: "white",
    boxShadow: "0 10px 25px rgba(0,0,0,0.1)"
  },
  title: { textAlign: "center", marginBottom: 16 },
  input: {
    width: "100%",
    padding: 10,
    marginBottom: 12,
    borderRadius: 6,
    border: "1px solid #c7d2fe"
  },
  avatarGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(3, 1fr)",
    gap: 12,
    marginBottom: 18
  },
  avatar: {
    width: 70,
    height: 70,
    borderRadius: "50%",
    cursor: "pointer"
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
