import { useEffect, useState } from "react";
import { auth, db } from "../firebase";
import { doc, getDoc, setDoc, serverTimestamp } from "firebase/firestore";

export default function RoadmapPage() {
  const [profile, setProfile] = useState(null);
  const [roadmap, setRoadmap] = useState(null);

  const [track, setTrack] = useState("Software");
  const [hours, setHours] = useState(10);
  const [interests, setInterests] = useState("");

  useEffect(() => {
    const load = async () => {
      const user = await getDoc(doc(db, "users", auth.currentUser.uid));
      setProfile(user.data());

      const rm = await getDoc(doc(db, "roadmaps", auth.currentUser.uid));
      if (rm.exists()) setRoadmap(rm.data());
    };
    load();
  }, []);

  const buildTopics = (year, interestsList) => {
    const topics = [];

    if (interestsList.includes("web")) {
      topics.push("HTML", "CSS", "JavaScript", "React", "Backend Basics");
    }

    if (interestsList.includes("ai") || interestsList.includes("ml")) {
      topics.push("Python", "Statistics", "Machine Learning", "Data Analysis");
    }

    if (interestsList.includes("data")) {
      topics.push("SQL", "Data Visualization", "Big Data Basics");
    }

    if (interestsList.includes("startup")) {
      topics.push("Idea Validation", "Product Design", "MVP Building");
    }

    if (interestsList.includes("gate")) {
      topics.push("Engineering Math", "Core Subjects", "Aptitude");
    }

    if (year >= 3) {
      topics.push("Advanced DSA", "System Design", "Internship Preparation");
    }

    if (year === 4) {
      topics.push("Placements", "Mock Interviews", "Final Year Project");
    }

    return [...new Set(topics)];
  };

  const generateRoadmap = async () => {
    const startYear = Number(profile.year);
    const interestList = interests.toLowerCase().split(",").map(i => i.trim());

    const plan = {};

    for (let y = startYear; y <= 4; y++) {
      let yearTopics = buildTopics(y, interestList);

      if (hours < 7) yearTopics = yearTopics.slice(0, 4);
      if (hours >= 12) yearTopics.push("Extra Practice Projects");

      plan[y] = yearTopics;
    }

    await setDoc(doc(db, "roadmaps", auth.currentUser.uid), {
      track,
      yearWisePlan: plan,
      generatedFrom: "userInterests",
      lastGenerated: serverTimestamp()
    });

    const rm = await getDoc(doc(db, "roadmaps", auth.currentUser.uid));
    setRoadmap(rm.data());
  };

  if (!profile) return null;

  return (
    <div style={{ padding: 24 }}>
      <h2>Personalized Roadmap</h2>

      <div style={{ marginTop: 20 }}>
        <label>Track</label><br />
        <select value={track} onChange={e => setTrack(e.target.value)}>
          <option>Software</option>
          <option>AI / Data</option>
          <option>Higher Studies</option>
          <option>Startups</option>
        </select>
      </div>

      <div style={{ marginTop: 12 }}>
        <label>Available Hours / Week</label><br />
        <input type="number" value={hours} onChange={e => setHours(Number(e.target.value))} />
      </div>

      <div style={{ marginTop: 12 }}>
        <label>Your Interests (comma separated)</label><br />
        <input
          placeholder="web, ai, data, startup, gate"
          value={interests}
          onChange={e => setInterests(e.target.value)}
        />
      </div>

      <button onClick={generateRoadmap} style={{ marginTop: 16 }}>
        Generate Roadmap
      </button>

      {roadmap && (
        <div style={{ marginTop: 24 }}>
          {Object.entries(roadmap.yearWisePlan).map(([year, topics]) => (
            <div key={year} style={{ marginBottom: 16 }}>
              <strong>Year {year}</strong>
              <ul>
                {topics.map((t, i) => <li key={i}>{t}</li>)}
              </ul>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
