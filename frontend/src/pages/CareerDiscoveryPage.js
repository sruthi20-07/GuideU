import { useState } from "react";
import { auth, db } from "../firebase";
import { doc, setDoc, serverTimestamp } from "firebase/firestore";

const CAREERS = {
  "Software Engineer": ["DSA", "JavaScript", "React", "System Design"],
  "Data Analyst": ["Python", "SQL", "Statistics", "Data Visualization"],
  "ML Engineer": ["Python", "ML Algorithms", "Math", "Deep Learning"],
  "Startup Founder": ["Product Thinking", "MVP Building", "Marketing"],
  "Higher Studies": ["Math", "Core Subjects", "Aptitude", "Research"]
};

export default function CareerDiscoveryPage() {
  const [answers, setAnswers] = useState({
    interest: "",
    strength: "",
    learningStyle: ""
  });

  const [result, setResult] = useState(null);

  const calculateCareer = () => {
    if (answers.interest === "ai") return "ML Engineer";
    if (answers.interest === "data") return "Data Analyst";
    if (answers.interest === "startup") return "Startup Founder";
    if (answers.interest === "gate") return "Higher Studies";
    return "Software Engineer";
  };

  const submitQuiz = async () => {
    const career = calculateCareer();

    const payload = {
      interests: [answers.interest],
      strengths: [answers.strength],
      learningStyle: answers.learningStyle,
      targetCareer: career,
      currentSkills: [],
      timeAvailability: 10,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    };

    await setDoc(doc(db, "careerProfiles", auth.currentUser.uid), payload);

    setResult({
      career,
      skills: CAREERS[career]
    });
  };

  return (
    <div style={{ padding: 24 }}>
      <h2>Career Discovery</h2>

      {!result ? (
        <>
          <div style={{ marginTop: 16 }}>
            <label>What interests you most?</label><br />
            <select onChange={e => setAnswers({ ...answers, interest: e.target.value })}>
              <option value="">Select</option>
              <option value="software">Software</option>
              <option value="ai">AI / ML</option>
              <option value="data">Data</option>
              <option value="startup">Startups</option>
              <option value="gate">Higher Studies</option>
            </select>
          </div>

          <div style={{ marginTop: 16 }}>
            <label>Your biggest strength?</label><br />
            <select onChange={e => setAnswers({ ...answers, strength: e.target.value })}>
              <option value="">Select</option>
              <option value="logic">Logical Thinking</option>
              <option value="creativity">Creativity</option>
              <option value="analysis">Analysis</option>
              <option value="communication">Communication</option>
            </select>
          </div>

          <div style={{ marginTop: 16 }}>
            <label>Preferred learning style?</label><br />
            <select onChange={e => setAnswers({ ...answers, learningStyle: e.target.value })}>
              <option value="">Select</option>
              <option value="visual">Visual</option>
              <option value="reading">Reading</option>
              <option value="hands-on">Hands-on</option>
            </select>
          </div>

          <button onClick={submitQuiz} style={{ marginTop: 20 }}>
            See My Career Path
          </button>
        </>
      ) : (
        <div style={{ marginTop: 24 }}>
          <h3>Suggested Career: {result.career}</h3>
          <p>Skills you should focus on:</p>
          <ul>
            {result.skills.map((s, i) => <li key={i}>{s}</li>)}
          </ul>
        </div>
      )}
    </div>
  );
}
