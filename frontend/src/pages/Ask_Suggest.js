import { useEffect, useState } from "react";
import { auth, db } from "../firebase";
import { doc, getDoc } from "firebase/firestore";
import { useNavigate } from "react-router-dom";
import ProfileMenu from "../components/ProfileMenu";

const BRANCHES = [
  "CSE",
  "IT",
  "AI&DS",
  "AIML",
  "ECE",
  "EEE",
  "MECH",
  "CIVIL",
  "CYBER SECURITY"
];

export default function AskSuggest() {
  const [profile, setProfile] = useState(null);
  const [selectedBranch, setSelectedBranch] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const load = async () => {
      if (!auth.currentUser) return;
      const snap = await getDoc(
        doc(db, "users", auth.currentUser.uid)
      );
      setProfile(snap.data());
    };
    load();
  }, []);

  if (!profile) {
    return <div style={{ padding: 30 }}>Loading...</div>;
  }

  const isAlumni = profile.year === "alumni";
  const year = isAlumni ? 5 : Number(profile.year);

  return (
    <div style={{ padding: 24 }}>
      <ProfileMenu />

      <h2 style={{ marginBottom: 10 }}>
        Welcome, {profile.name}
      </h2>

      <p style={{ color: "#555", marginBottom: 20 }}>
        Select your branch to continue
      </p>

      {/* 🔹 BRANCH GRID (3 x 3) */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(3, 1fr)",
          gap: 16,
          marginBottom: 30
        }}
      >
        {BRANCHES.map(branch => (
          <div
            key={branch}
            onClick={() => setSelectedBranch(branch)}
            style={{
              padding: 18,
              borderRadius: 12,
              background:
                selectedBranch === branch
                  ? "#2563eb"
                  : "#e5e7eb",
              color:
                selectedBranch === branch
                  ? "white"
                  : "#111",
              textAlign: "center",
              fontWeight: 600,
              cursor: "pointer",
              transition: "0.2s ease"
            }}
          >
            {branch}
          </div>
        ))}
      </div>

      {/* 🔹 ACTION BUTTONS */}
      <div style={{ display: "flex", gap: 14 }}>
        {/* 1st–4th years → ASK */}
        {year <= 4 && (
          <button
            disabled={!selectedBranch}
            onClick={() =>
              navigate(`/ask?branch=${selectedBranch}`)
            }
          >
            Ask
          </button>
        )}

        {/* 2nd–4th + Alumni → SUGGEST */}
        {year >= 2 && (
          <button
            disabled={!selectedBranch}
            onClick={() =>
              navigate(`/suggest?branch=${selectedBranch}`)
            }
          >
            Suggest
          </button>
        )}
      </div>
    </div>
  );
}