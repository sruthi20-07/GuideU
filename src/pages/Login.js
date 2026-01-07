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
    if (!email || !password)
      return "All fields are required";

    if (!/^\S+@\S+\.\S+$/.test(email))
      return "Invalid email format";

    if (password.length < 6)
      return "Password must be at least 6 characters";

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
    <div className="auth-container">

      {popup && (
        <div className="popup-overlay">
          <div className={`popup-box popup-${popup.type}`}>
            {popup.type === "error" && (
              <span className="popup-close" onClick={() => setPopup(null)}>×</span>
            )}
            {popup.text}
          </div>
        </div>
      )}

      <div className="form-box">
        <h2>Login</h2>

        <input placeholder="Email" onChange={e => setEmail(e.target.value)} />
        <input type="password" placeholder="Password" onChange={e => setPassword(e.target.value)} />

        <button onClick={login}>Login</button>

        <p style={{ textAlign: "center" }}>
          New user? <Link to="/register">Create account</Link>
        </p>
      </div>
    </div>
  );
}
