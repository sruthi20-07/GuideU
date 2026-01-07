import { useState } from "react";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "../firebase";
import { Link, useNavigate } from "react-router-dom";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [popup, setPopup] = useState(null);
  const navigate = useNavigate();

  const validate = () => {
    if (!email || !password) return "All fields are required";
    if (!/^\S+@\S+\.\S+$/.test(email)) return "Invalid email format";
    if (password.length < 6) return "Password must be at least 6 characters";
    return null;
  };

  const login = async () => {
    const error = validate();
    if (error) {
      setPopup({ text: error, type: "error" });
      return;
    }

    try {
      await signInWithEmailAndPassword(auth, email, password);
      setPopup({ text: "Login successful", type: "success" });
      setTimeout(() => navigate("/dashboard"), 2000);
    } catch {
      setPopup({ text: "Wrong credentials. Try again.", type: "error" });
    }
  };

  return (
    <div style={styles.page}>
      <div style={styles.card}>
        <h2 style={styles.title}>GuideU Login</h2>

        <input style={styles.input} placeholder="Email" onChange={e => setEmail(e.target.value)} />
        <input style={styles.input} type="password" placeholder="Password" onChange={e => setPassword(e.target.value)} />

        <button style={styles.button} onClick={login}>Login</button>

        <p style={styles.text}>
          New user? <Link to="/register">Create account</Link>
        </p>
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
    width: 360,
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
  text: { marginTop: 14, textAlign: "center" },
  popup: {
    position: "fixed",
    bottom: 20,
    padding: 12,
    borderRadius: 6
  }
};
