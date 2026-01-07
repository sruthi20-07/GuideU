import { useEffect, useState } from "react";
import { auth, db } from "../firebase";
import { doc, getDoc, setDoc, serverTimestamp } from "firebase/firestore";

/* Normalize text */
const normalize = (text) =>
  text.toLowerCase().replace(/[^a-z0-9]/g, "");

/* Known interest keywords */
const interestKeywords = {
  software: ["c", "cprogramming", "java", "python"],
  web: ["html", "css", "javascript", "react", "reactjs"],
  backend: ["spring", "springboot", "node", "express"],
  data: ["data", "sql", "analytics"],
  ai: ["ai", "ml", "machinelearning"],
  cloud: ["cloud", "aws", "devops"]
};

/* Topics for known categories */
const categoryTopics = {
  software: [
    "Programming Fundamentals",
    "Control Structures",
    "Functions & Modular Coding",
    "Problem Solving Practice"
  ],
  web: [
    "HTML & CSS",
    "JavaScript Basics",
    "React Fundamentals",
    "Frontend Best Practices"
  ],
  backend: [
    "Spring Boot Basics",
    "REST APIs",
    "Backend Architecture"
  ],
  data: [
    "SQL Fundamentals",
    "Data Analysis",
    "Data Visualization"
  ],
  ai: [
    "Python for AI",
    "Statistics",
    "Machine Learning Basics"
  ],
  cloud: [
    "Cloud Fundamentals",
    "Deployment Basics",
    "DevOps Concepts"
  ]
};

/* Detect categories */
const detectCategories = (interestList) => {
  const categories = new Set();

  interestList.forEach(word => {
    const w = normalize(word);
    for (let cat in interestKeywords) {
      interestKeywords[cat].forEach(k => {
        if (w.includes(k) || k.includes(w)) {
          categories.add(cat);
        }
      });
    }
  });

  return [...categories];
};

/* Validate interest */
const isMeaningfulInterest = (interest) => {
  const cleaned = interest.toLowerCase().trim();

  if (cleaned.length < 3) return false;

  const invalidWords = ["language", "technology", "tech", "skill", "course"];
  if (invalidWords.includes(cleaned)) return false;

  const parts = cleaned.split(" ");
  if (parts.length === 2 && parts[0].length === 1 && parts[1] === "language") {
    return false;
  }

  return true;
};

/* Generic roadmap */
const buildGenericRoadmap = (interest) => [
  `Introduction to ${interest}`,
  `Fundamentals of ${interest}`,
  `Core Concepts in ${interest}`,
  `Hands-on Practice with ${interest}`,
  `Mini Projects using ${interest}`,
  `Advanced Topics in ${interest}`
];

export default function RoadmapPage() {
  const [profile, setProfile] = useState(null);
  const [roadmap, setRoadmap] = useState(null);

  const [interests, setInterests] = useState("");
  const [hours, setHours] = useState(10);
  const [error, setError] = useState("");

  useEffect(() => {
    const load = async () => {
      if (!auth.currentUser) return;

      const userSnap = await getDoc(doc(db, "users", auth.currentUser.uid));
      if (userSnap.exists()) setProfile(userSnap.data());

      const rmSnap = await getDoc(doc(db, "roadmaps", auth.currentUser.uid));
      if (rmSnap.exists()) {
        const data = rmSnap.data();
        setRoadmap({ ...data, flowchartTopics: data.flowchartTopics || [] });
      }
    };
    load();
  }, []);

  const generateRoadmap = async () => {
    setError("");

    const rawInterests = interests
      .split(",")
      .map(i => i.trim())
      .filter(Boolean);

    if (rawInterests.length === 0) {
      setError("Please enter at least one interest.");
      return;
    }

    const categories = detectCategories(rawInterests);
    let flowTopics = [];

    categories.forEach(cat => {
      if (categoryTopics[cat]) {
        flowTopics.push(...categoryTopics[cat]);
      }
    });

    rawInterests.forEach(interest => {
      const norm = normalize(interest);
      const matched = Object.values(interestKeywords)
        .flat()
        .some(k => norm.includes(k) || k.includes(norm));

      if (!matched && isMeaningfulInterest(interest)) {
        flowTopics.push(...buildGenericRoadmap(interest));
      }
    });

    flowTopics = [...new Set(flowTopics)];

    if (flowTopics.length === 0) {
      setError("Please enter a valid technology or domain.");
      return;
    }

    if (hours < 7) flowTopics = flowTopics.slice(0, 4);
    if (hours >= 12) flowTopics.push("Advanced Practice Projects");

    const data = {
      interests: rawInterests,
      flowchartTopics: flowTopics,
      lastGenerated: serverTimestamp()
    };

    await setDoc(doc(db, "roadmaps", auth.currentUser.uid), data);
    setRoadmap(data);
  };

  // ENTER key handler
  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      generateRoadmap();
    }
  };

  if (!profile) return null;

  return (
    <div style={styles.page}>
      <div style={styles.card}>
        <h2 style={styles.title}>Interest-Based Roadmap</h2>

        <div style={styles.formGroup}>
          <label>Your Interests</label>
          <input
            style={styles.input}
            placeholder="C programming, Java, Blockchain, UI UX"
            value={interests}
            onChange={e => setInterests(e.target.value)}
            onKeyDown={handleKeyDown}
          />
        </div>

        <div style={styles.formGroup}>
          <label>Available Hours / Week</label>
          <input
            type="number"
            style={styles.input}
            value={hours}
            onChange={e => setHours(Number(e.target.value))}
          />
        </div>

        {error && <p style={{ color: "red" }}>{error}</p>}

        <button style={styles.button} onClick={generateRoadmap}>
          Generate Flowchart
        </button>
      </div>

      {roadmap && roadmap.flowchartTopics.length > 0 && (
        <div style={styles.roadmapSection}>
          <h3>Your Learning Flowchart</h3>

          {roadmap.flowchartTopics.map((topic, index) => (
            <div key={index} style={{ textAlign: "center" }}>
              <div style={styles.flowBox}>{topic}</div>
              {index !== roadmap.flowchartTopics.length - 1 && (
                <div style={styles.arrow}>↓</div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

/* Styles */
const styles = {
  page: {
    minHeight: "100vh",
    background: "#f2f6fc",
    padding: 24
  },
  card: {
    maxWidth: 600,
    margin: "auto",
    background: "#fff",
    padding: 30,
    borderRadius: 14,
    boxShadow: "0 10px 25px rgba(0,0,0,0.1)"
  },
  title: {
    textAlign: "center",
    marginBottom: 20
  },
  formGroup: {
    marginBottom: 14
  },
  input: {
    width: "100%",
    padding: 10,
    marginTop: 4,
    borderRadius: 8,
    border: "1px solid #ccc"
  },
  button: {
    width: "100%",
    padding: 12,
    background: "#4f46e5",
    color: "#fff",
    border: "none",
    borderRadius: 8,
    fontSize: 16,
    cursor: "pointer",
    marginTop: 10
  },
  roadmapSection: {
    maxWidth: 700,
    margin: "30px auto",
    background: "#fff",
    padding: 20,
    borderRadius: 14,
    boxShadow: "0 5px 15px rgba(0,0,0,0.08)"
  },
  flowBox: {
    padding: "12px 16px",
    background: "#eef2ff",
    borderRadius: 10,
    fontWeight: 600,
    marginTop: 10
  },
  arrow: {
    fontSize: 22,
    margin: "6px 0",
    color: "#4f46e5"
  }
};