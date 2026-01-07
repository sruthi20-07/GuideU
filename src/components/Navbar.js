import { useNavigate } from "react-router-dom";

export default function Navbar() {
  const navigate = useNavigate();

  return (
    <div className="topbar">
      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
        <button
          onClick={() => navigate(-1)}
          style={{ background: "#e5e7eb", color: "#111" }}
        >
          ← Back
        </button>
        <h2 style={{ margin: 0 }}>GuideU</h2>
      </div>
    </div>
  );
}
