import { useState } from "react";
import { auth, db } from "../firebase";
import { doc, setDoc, serverTimestamp } from "firebase/firestore";

export default function CareerDiscoveryPage() {
  const [form, setForm] = useState({
    interest: "",
    strength: "",
    learningStyle: "",
    goal: "",
    currentSkill: "",
    hours: ""
  });

  const [error, setError] = useState("");
  const [result, setResult] = useState(null);

  const calculateCareer = () => {
    const score = {
      "Software Engineer": 0,
      "Data Analyst": 0,
      "ML Engineer": 0,
      "Startup Founder": 0,
      "Higher Studies": 0
    };

    if (form.interest === "software") score["Software Engineer"] += 3;
    if (form.interest === "ai") score["ML Engineer"] += 3;
    if (form.interest === "data") score["Data Analyst"] += 3;
    if (form.interest === "startup") score["Startup Founder"] += 3;
    if (form.interest === "gate") score["Higher Studies"] += 3;

    if (form.strength === "logic") score["Software Engineer"] += 2;
    if (form.strength === "analysis") score["Data Analyst"] += 2;
    if (form.strength === "creativity") score["Startup Founder"] += 2;

    if (form.learningStyle === "hands-on") score["Software Engineer"] += 1;
    if (form.goal === "research") score["Higher Studies"] += 2;
    if (form.currentSkill === "python") score["ML Engineer"] += 1;
    if (form.currentSkill === "sql") score["Data Analyst"] += 1;

    return Object.entries(score).sort((a, b) => b[1] - a[1])[0][0];
  };

  const submitQuiz = async () => {
    for (let key in form) {
      if (!form[key]) {
        setError("Please fill all fields before submitting.");
        return;
      }
    }

    setError("");

    const career = calculateCareer();

    const roadmap = Array.from({ length: 12 }).map((_, i) => ({
      month: i + 1,
      focus: `${career} Development`,
      task: "Learn fundamentals, practice, and build projects"
    }));

    const payload = {
      ...form,
      targetCareer: career,
      roadmap,
      createdAt: serverTimestamp()
    };

    await setDoc(doc(db, "careerProfiles", auth.currentUser.uid), payload);
    setResult(payload);
  };

  return (
    <div style={{ padding: 24, maxWidth: 820, margin: "auto" }}>
      <h2>Career Discovery</h2>

      {!result && (
        <>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
            {[
              ["interest", "Primary Interest", ["software", "ai", "data", "startup", "gate"]],
              ["strength", "Strongest Skill", ["logic", "analysis", "creativity"]],
              ["learningStyle", "Learning Style", ["visual", "reading", "hands-on"]],
              ["goal", "Current Goal", ["job", "research", "startup"]],
              ["currentSkill", "Current Skill", ["python", "js", "sql", "none"]]
            ].map(([key, label, options]) => (
              <div key={key}>
                <label>{label}</label>
                <select value={form[key]} onChange={e => setForm({ ...form, [key]: e.target.value })}>
                  <option value="">Select</option>
                  {options.map(o => (
                    <option key={o} value={o}>{o}</option>
                  ))}
                </select>
              </div>
            ))}

            <div>
              <label>Study Hours / Week</label>
              <input
                type="number"
                value={form.hours}
                onChange={e => setForm({ ...form, hours: e.target.value })}
              />
            </div>
          </div>

          {error && <p style={{ color: "red", marginTop: 10 }}>{error}</p>}

          <button onClick={submitQuiz} style={{ marginTop: 20 }}>
            See My Career Path
          </button>
        </>
      )}

      {result && (
        <div style={{
          marginTop: 30,
          padding: 24,
          borderRadius: 12,
          background: "#f9fafb",
          boxShadow: "0 8px 20px rgba(0,0,0,0.1)",
          position: "relative"
        }}>
          <button
            onClick={() => setResult(null)}
            style={{ position: "absolute", top: 10, right: 10, fontSize: 18 }}
          >
            ✕
          </button>

          <h3>Suggested Career: {result.targetCareer}</h3>

          <h4>12-Month Roadmap</h4>
          {result.roadmap.map(step => (
            <div key={step.month}>
              <b>Month {step.month}</b>: {step.focus}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
