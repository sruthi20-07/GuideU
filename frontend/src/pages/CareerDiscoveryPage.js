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

  const inputStyle = {
    width: "100%",
    padding: "10px 12px",
    borderRadius: 8,
    border: "1px solid #ccc",
    fontSize: 14
  };

  function Field({ label, children }) {
    return (
      <div>
        <label style={{ fontWeight: 600, fontSize: 14 }}>{label}</label>
        <div style={{ marginTop: 6 }}>{children}</div>
      </div>
    );
  }

  function Select({ name, options }) {
    return (
      <select
        value={form[name]}
        onChange={e =>
          setForm({ ...form, [name]: e.target.value.toLowerCase() })
        }
        style={inputStyle}
      >
        <option value="">Select</option>
        {options.map(o => (
          <option key={o} value={o.toLowerCase()}>
            {o}
          </option>
        ))}
      </select>
    );
  }

  // ML placeholder
  const predictCareer = () => {
    // TODO: Replace with ML model
    return "Software Engineer";
  };

  // Roadmap with phases, skills, and badges
  const buildRoadmap = (career) => {
    const plans = {
      "Software Engineer": [
        {
          phase: "Foundations",
          months: [1, 2, 3],
          skills: [
            { name: "Programming Basics", level: "beginner" },
            { name: "Problem Solving", level: "beginner" },
            { name: "Git & Version Control", level: "beginner" }
          ]
        },
        {
          phase: "Core Skills",
          months: [4, 5, 6],
          skills: [
            { name: "Web Development", level: "intermediate" },
            { name: "Backend Fundamentals", level: "intermediate" },
            { name: "DSA Intermediate", level: "intermediate" }
          ]
        },
        {
          phase: "Advanced Projects",
          months: [7, 8, 9],
          skills: [
            { name: "Full Stack Applications", level: "advanced" },
            { name: "Open Source Contribution", level: "advanced" },
            { name: "Interview Prep", level: "advanced" }
          ]
        },
        {
          phase: "Professional Milestones",
          months: [10, 11, 12],
          skills: [
            { name: "Portfolio Building", level: "master" },
            { name: "Internship / Freelance", level: "master" },
            { name: "Capstone Project", level: "master" }
          ]
        }
      ]
      // Add other careers similarly
    };

    return plans[career] || [];
  };

  const submitQuiz = async () => {
    for (let k in form) {
      if (!form[k] || form[k].trim() === "") {
        setError("Please fill all fields before submitting.");
        return;
      }
    }

    if (Number(form.hours) <= 0) {
      setError("Study hours must be greater than 0.");
      return;
    }

    setError("");
    const career = predictCareer();
    const roadmap = buildRoadmap(career);

    await setDoc(doc(db, "careerProfiles", auth.currentUser.uid), {
      ...form,
      targetCareer: career,
      roadmap,
      createdAt: serverTimestamp()
    });

    setResult({ targetCareer: career, roadmap });
  };

  // Map skill levels to colors / badges
  const skillBadge = (level) => {
    const colors = {
      beginner: "#e0f2fe",
      intermediate: "#bae6fd",
      advanced: "#38bdf8",
      master: "#0284c7"
    };
    return { background: colors[level], padding: "4px 8px", borderRadius: 6, marginRight: 6, fontSize: 13, fontWeight: 600 };
  };

  return (
    <div style={{ minHeight: "100vh", background: "#f4f6fa", display: "flex", justifyContent: "center", padding: 20 }}>
      <div style={{ width: "100%", maxWidth: 1000, background: "white", padding: 28, borderRadius: 16, boxShadow: "0 10px 25px rgba(0,0,0,0.1)" }}>

        {!result && (
          <>
            <h2 style={{ textAlign: "center", marginBottom: 16 }}> CareerDiscovery</h2>
            <p style={{ textAlign: "center", color: "#555", marginBottom: 24 }}>
              Take our data-driven career assessment test to discover personalized career options, skill recommendations, and learning paths tailored to your profile.
            </p>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
              <Field label="Primary Interest"><Select name="interest" options={["Software","Web","Mobile","AI","ML","Data","Analytics","Startup","Product","GATE","Research"]} /></Field>
              <Field label="Strongest Skill"><Select name="strength" options={["Logic","Problem-Solving","Analysis","Math","Creativity","Design"]} /></Field>
              <Field label="Learning Style"><Select name="learningStyle" options={["Visual","Reading","Hands-on"]} /></Field>
              <Field label="Current Goal"><Select name="goal" options={["Job","Research","Startup"]} /></Field>
              <Field label="Current Skill"><Select name="currentSkill" options={["Python","R","JavaScript","Java","SQL","Excel","None"]} /></Field>
              <Field label="Study Hours / Week">
                <input type="number" value={form.hours} onChange={e => setForm({ ...form, hours: e.target.value })} style={inputStyle} />
              </Field>
            </div>

            {error && <p style={{ color: "red", marginTop: 10 }}>{error}</p>}

            <button onClick={submitQuiz} style={{ marginTop: 24, width: "100%", padding: "12px 0", background: "#2563eb", color: "white", borderRadius: 10, border: "none", fontSize: 16, fontWeight: 600, cursor: "pointer" }}>
              Click here to know
            </button>
          </>
        )}

        {result && (
          <div style={{ marginTop: 18 }}>
            <button onClick={() => setResult(null)} style={{ float: "right", background: "#2563eb", color: "white", border: "none", borderRadius: 8, width: 32, height: 32, cursor: "pointer" }}>✕</button>

            <h3 style={{ color: "#0284c7" }}>🎯 Suggested Career: {result.targetCareer}</h3>
            <p style={{ marginTop: 6, color: "#555" }}>
              Based on your interests, strengths, learning style, and goals, this career is the best fit for you. Follow the personalized roadmap to build the required skills and milestones.
            </p>

            <h4 style={{ marginTop: 16 }}>Personalized Learning Roadmap</h4>
            {result.roadmap.map(phase => (
              <div key={phase.phase} style={{ marginTop: 12, padding: 16, background: "#f0f9ff", borderRadius: 12 }}>
                <h5 style={{ marginBottom: 8, color: "#2563eb" }}>{phase.phase} (Months {phase.months[0]}–{phase.months[phase.months.length-1]})</h5>
                <div style={{ display: "flex", flexWrap: "wrap" }}>
                  {phase.skills.map(skill => (
                    <span key={skill.name} style={skillBadge(skill.level)}>{skill.name}</span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
