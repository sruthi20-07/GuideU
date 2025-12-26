import { useEffect, useState } from "react";
import { auth, db } from "../firebase";
import { doc, getDoc } from "firebase/firestore";
import { useNavigate } from "react-router-dom";
import ProfileMenu from "../components/ProfileMenu";

const BRANCHES = [
  "CSE", "IT", "AI&DS", "AIML",
  "ECE", "EEE", "MECH", "CIVIL", "CYBER SECURITY"
];

export default function Dashboard() {
  const [profile, setProfile] = useState(null);
  const [selectedBranch, setSelectedBranch] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const load = async () => {
      const snap = await getDoc(doc(db, "users", auth.currentUser.uid));
      setProfile(snap.data());
    };
    load();
  }, []);

  if (!profile) {
    return <div style={{ padding: 30 }}>Loading...</div>;
  }

  const year = Number(profile.year);

  const showAsk = year >= 1 && year <= 4;
  const showExplore = true;
  const showSuggest = year >= 2;

  return (
    <div style={{ padding: 24 }}>
      <ProfileMenu />

      <h2>Welcome, {profile.name}</h2>

      {/* Branch Selection */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(3, 1fr)",
          gap: 16,
          marginTop: 20,
          marginBottom: 30
        }}
      >
        {BRANCHES.map(branch => (
          <div
            key={branch}
            onClick={() => setSelectedBranch(branch)}
            style={{
              padding: 16,
              borderRadius: 12,
              background: selectedBranch === branch ? "#2563eb" : "#e5e7eb",
              color: selectedBranch === branch ? "white" : "black",
              textAlign: "center",
              fontWeight: 600,
              cursor: "pointer"
            }}
          >
            {branch}
          </div>
        ))}
      </div>

      {/* Action Buttons */}
      <div style={{ display: "flex", gap: 12 }}>
        {showAsk && (
          <button
            disabled={!selectedBranch}
            onClick={() => navigate(`/ask?branch=${selectedBranch}`)}
          >
            Ask
          </button>
        )}

        {showExplore && (
          <button onClick={() => navigate("/explore")}>
            Explore
          </button>
        )}

        {showSuggest && (
          <button
            disabled={!selectedBranch}
            onClick={() => navigate(`/suggest?branch=${selectedBranch}`)}
          >
            Suggest
          </button>
        )}
      </div>
    </div>
  );
}
