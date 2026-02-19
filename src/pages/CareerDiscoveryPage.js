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

  const calculateCareer = () => {
    const score = {
      "Software Engineer": 0,
      "Data Analyst": 0,
      "ML Engineer": 0,
      "Startup Founder": 0,
      "Higher Studies": 0
    };

    if (["software","web","mobile"].includes(form.interest)) score["Software Engineer"] += 4;
    if (["ai","ml"].includes(form.interest)) score["ML Engineer"] += 4;
    if (["data","analytics"].includes(form.interest)) score["Data Analyst"] += 4;
    if (["startup","product"].includes(form.interest)) score["Startup Founder"] += 4;
    if (["gate","research"].includes(form.interest)) score["Higher Studies"] += 4;

    if (["logic","problem-solving"].includes(form.strength)) score["Software Engineer"] += 3;
    if (["analysis","math"].includes(form.strength)) score["Data Analyst"] += 3;
    if (["creativity","design"].includes(form.strength)) score["Startup Founder"] += 3;

    if (form.learningStyle === "hands-on") score["Software Engineer"] += 2;
    if (form.learningStyle === "reading") score["Higher Studies"] += 2;

    if (form.goal === "job") score["Software Engineer"] += 2;
    if (form.goal === "research") score["Higher Studies"] += 3;
    if (form.goal === "startup") score["Startup Founder"] += 3;

    if (["python","r"].includes(form.currentSkill)) {
      score["ML Engineer"] += 2;
      score["Data Analyst"] += 2;
    }

    if (["js","java"].includes(form.currentSkill)) score["Software Engineer"] += 2;
    if (["sql","excel"].includes(form.currentSkill)) score["Data Analyst"] += 2;

    return Object.entries(score).sort((a,b)=>b[1]-a[1])[0][0];
  };

  const buildRoadmap = (career) => {
    const plans = {
      "Software Engineer": ["Programming Foundations","DSA","Web Basics","Advanced JavaScript","Backend & APIs","Databases","Mini Projects","Full Stack Project","Open Source","Interview Prep","Internships","Final Capstone"],
      "Data Analyst": ["Python & Excel","Statistics","SQL","Data Cleaning","Visualization","BI Tools","Mini Projects","Advanced Analytics","Domain Focus","Portfolio","Internships","Final Project"],
      "ML Engineer": ["Python & Math","Linear Algebra","Statistics","ML Algorithms","Evaluation","Deep Learning","Mini ML Projects","Deployment","Advanced ML","Research","Internships","Final ML Project"],
      "Startup Founder": ["Problem Discovery","Market Research","Ideation","MVP","User Feedback","Growth","Funding","Marketing","Sales","Scale","Legal","Launch"],
      "Higher Studies": ["Core Subjects","Advanced Math","Research Methods","Literature Review","Exam Prep","Mocks","Weak Areas","Projects","Thesis","Applications","Interviews","Submission"]
    };

    return plans[career].map((focus, i) => ({ month: i + 1, focus }));
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
    const career = calculateCareer();
    const roadmap = buildRoadmap(career);

    await setDoc(doc(db, "careerProfiles", auth.currentUser.uid), {
      ...form,
      targetCareer: career,
      roadmap,
      createdAt: serverTimestamp()
    });

    setResult({ targetCareer: career, roadmap });
  };

  return (
    <div style={{ height: "100vh", background: "#f4f6fa", display: "flex", justifyContent: "center", alignItems: "center" }}>
      <div style={{ width: "100%", maxWidth: 900, background: "white", padding: "28px 36px", borderRadius: 16, boxShadow: "0 10px 25px rgba(0,0,0,0.1)" }}>

        <h2 style={{ textAlign: "center", marginBottom: 20 }}>Career Discovery</h2>

        {!result && (
          <>
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

            <button onClick={submitQuiz} style={{ marginTop: 16, width: "100%", padding: "12px 0", background: "#2563eb", color: "white", borderRadius: 10, border: "none", fontSize: 16, fontWeight: 600, cursor: "pointer" }}>
              See My Career Path
            </button>
          </>
        )}

        {result && (
          <div style={{ marginTop: 18, padding: 22, borderRadius: 14, background: "#f9fafb", position: "relative" }}>
            <button onClick={() => setResult(null)} style={{ position: "absolute", top: 12, right: 12, background: "#2563eb", color: "white", border: "none", borderRadius: 8, width: 32, height: 32, cursor: "pointer" }}>✕</button>
            <h3>Suggested Career: {result.targetCareer}</h3>
            <h4 style={{ marginTop: 10 }}>12-Month Learning Roadmap</h4>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 6, marginTop: 8 }}>
              {result.roadmap.map(step => (
                <div key={step.month}><b>Month {step.month}</b> — {step.focus}</div>
              ))}
            </div>
          </div>
        )}

      </div>
    </div>
  );
}