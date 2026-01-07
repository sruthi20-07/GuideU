import { useState } from "react";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { doc, setDoc } from "firebase/firestore";
import { auth, db } from "../firebase";
import { useNavigate } from "react-router-dom";

export default function Register() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [year, setYear] = useState(1);
  const [branch, setBranch] = useState("");
  const [popup, setPopup] = useState(null);
  const navigate = useNavigate();

  const validate = () => {
    if (!name || !email || !password || !branch) return "All fields are required";
    if (!/^\S+@\S+\.\S+$/.test(email)) return "Invalid email format";
    if (password.length < 6) return "Password must be at least 6 characters";
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
      await setDoc(doc(db, "users", res.user.uid), { name, email, year, branch });

      setPopup({ text: "Registration successful", type: "success" });
      setTimeout(() => navigate("/dashboard"), 2000);
    } catch {
      setPopup({ text: "Registration failed. Try again.", type: "error" });
    }
  };

  return (
    <div style={styles.page}>
      <div style={styles.card}>
        <h2 style={styles.title}>Create Account</h2>

        <input style={styles.input} placeholder="Name" onChange={e => setName(e.target.value)} />
        <input style={styles.input} placeholder="Email" onChange={e => setEmail(e.target.value)} />
        <input style={styles.input} type="password" placeholder="Password" onChange={e => setPassword(e.target.value)} />

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

        <button style={styles.button} onClick={register}>Register</button>
      </div>

      {popup && <div style={{ ...styles.popup, background: popup.type === "error" ? "#fee2e2" : "#dcfce7" }}>{popup.text}</div>}
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
    width: 380,
    padding: 32,
    borderRadius: 14,
    background: "white",
    boxShadow: "0 10px 25px rgba(0,0,0,0.1)"
  },
  title: { textAlign: "center", marginBottom: 20 },
  input: {
    width: "100%",
    padding: 10,
    marginBottom: 12,
    borderRadius: 6,
    border: "1px solid #c7d2fe"
  },
  button: {
    width: "100%",
    padding: 10,
    background: "#2563eb",
    color: "white",
    borderRadius: 6,
    border: "none",
    cursor: "pointer"
  },
  popup: {
    position: "fixed",
    bottom: 20,
    padding: 12,
    borderRadius: 6
  }
};
