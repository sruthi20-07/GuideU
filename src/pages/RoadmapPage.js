import { useState, useEffect } from "react";
import { FaCheckCircle } from "react-icons/fa";

// Topics with steps
const topicsData = {
  java: [
    { step: "Getting Started with Java", details: [
        { text: "Install JDK", link: "https://www.oracle.com/java/technologies/javase-jdk11-downloads.html" },
        { text: "Set up IDE", link: "https://www.jetbrains.com/idea/download/" },
        { text: "Hello World program", link: "https://www.geeksforgeeks.org/hello-world-in-java/" }
      ] },
    { step: "Variables & Datatypes", details: [
        { text: "int, float, double, char", link: "https://www.w3schools.com/java/java_variables.asp" },
        { text: "String basics", link: "https://www.geeksforgeeks.org/strings-in-java/" },
        { text: "Type conversion", link: "https://www.geeksforgeeks.org/type-conversion-in-java/" }
      ] },
    { step: "Operators", details: [
        { text: "Arithmetic operators", link: "https://www.w3schools.com/java/java_operators.asp" },
        { text: "Logical operators", link: "https://www.geeksforgeeks.org/logical-operators-in-java/" },
        { text: "Comparison operators", link: "https://www.geeksforgeeks.org/comparison-operators-in-java/" }
      ] },
    { step: "Control Flow", details: [
        { text: "if-else statements", link: "https://www.w3schools.com/java/java_conditions.asp" },
        { text: "switch-case", link: "https://www.javatpoint.com/java-switch" },
        { text: "loops", link: "https://www.w3schools.com/java/java_for_loop.asp" }
      ] },
  ],
  python: [
    { step: "Getting Started with Python", details: [
        { text: "Install Python", link: "https://www.python.org/downloads/" },
        { text: "Set up IDE", link: "https://www.jetbrains.com/pycharm/download/" },
        { text: "Hello World", link: "https://www.w3schools.com/python/python_intro.asp" }
      ] },
    { step: "Variables & Data Types", details: [
        { text: "Numbers, Strings, Lists, Tuples", link: "https://www.w3schools.com/python/python_datatypes.asp" },
        { text: "Type conversion", link: "https://www.w3schools.com/python/python_casting.asp" }
      ] },
    { step: "Control Flow", details: [
        { text: "if-else statements", link: "https://www.w3schools.com/python/python_conditions.asp" },
        { text: "Loops", link: "https://www.w3schools.com/python/python_for_loops.asp" }
      ] },
  ]
};

export default function RoadmapPage() {
  const [topic, setTopic] = useState("");
  const [hours, setHours] = useState(5);
  const [roadmap, setRoadmap] = useState([]);
  const [completed, setCompleted] = useState({});

  useEffect(() => {
    setRoadmap([]);
    setCompleted({});
    setTopic("");
    setHours(5);
  }, []);

  const handleGenerate = () => {
    if (!topic) return alert("Please select a topic!");
    const steps = topicsData[topic.toLowerCase()];
    if (!steps) return alert("Topic not available!");
    setRoadmap(steps.slice(0, hours));
    setCompleted({});
  };

  const toggleStep = (index) => {
    const newCompleted = { ...completed };
    
    // Only allow marking the current step if previous steps are completed
    if (index === 0 || completed[index - 1]) {
      newCompleted[index] = !completed[index];
      setCompleted(newCompleted);
    }

    // Congrats popup after all completed
    if (roadmap.length > 0 && Object.values(newCompleted).length === roadmap.length &&
        Object.values(newCompleted).every((v) => v === true)) {
      setTimeout(() => alert("🎉 Congratulations! You have completed the roadmap!"), 200);
    }
  };

  return (
  <div
    style={{
      minHeight: "100vh",
      background: "linear-gradient(to bottom, #eff6ff, #ffffff)",
      padding: 30
    }}
  >
    <div style={{ maxWidth: 900, margin: "auto" }}>

      {/* Title */}
      <h1
        style={{
          fontSize: 32,
          fontWeight: "bold",
          marginBottom: 30,
          color: "#1e3a8a",
          textAlign: "center"
        }}
      >
        AI Roadmap Generator
      </h1>

      {/* Controls */}
      <div
        style={{
          display: "flex",
          gap: 12,
          marginBottom: 40,
          background: "white",
          padding: 20,
          borderRadius: 12,
          boxShadow: "0 4px 12px rgba(0,0,0,0.05)"
        }}
      >
        <select
          value={topic}
          onChange={(e) => setTopic(e.target.value)}
          style={{
            padding: 10,
            flex: 1,
            borderRadius: 8,
            border: "1px solid #cbd5e1"
          }}
        >
          <option value="">Select Topic</option>
          {Object.keys(topicsData).map((t) => (
            <option key={t} value={t}>
              {t.charAt(0).toUpperCase() + t.slice(1)}
            </option>
          ))}
        </select>

        <select
          value={hours}
          onChange={(e) => setHours(Number(e.target.value))}
          style={{
            padding: 10,
            borderRadius: 8,
            border: "1px solid #cbd5e1"
          }}
        >
          {[...Array(8)].map((_, i) => (
            <option key={i} value={i + 1}>
              {i + 1} {i === 0 ? "hour" : "hours"}
            </option>
          ))}
        </select>

        <button
          onClick={handleGenerate}
          style={{
            padding: "10px 20px",
            background: "#2563eb",
            color: "white",
            border: "none",
            borderRadius: 8,
            cursor: "pointer",
            fontWeight: "bold",
            transition: "0.3s"
          }}
        >
          Generate Roadmap
        </button>
      </div>

      {/* Vertical roadmap */}
      <div style={{ position: "relative", marginLeft: 50 }}>
        {roadmap.map((step, i) => (
          <div
            key={i}
            style={{
              display: "flex",
              alignItems: "flex-start",
              marginBottom: 60,
              position: "relative"
            }}
          >
            {/* Connector line */}
            {i !== roadmap.length - 1 && (
              <div
                style={{
                  position: "absolute",
                  top: 32,
                  left: 14,
                  width: 4,
                  height: 60,
                  backgroundColor: completed[i] ? "#2563eb" : "#bfdbfe",
                  transition: "background-color 0.3s"
                }}
              />
            )}

            {/* Step circle */}
            <div
              onClick={() => toggleStep(i)}
              style={{
                width: 28,
                height: 28,
                borderRadius: "50%",
                backgroundColor: completed[i] ? "#2563eb" : "#3b82f6",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "#fff",
                fontWeight: "bold",
                cursor: "pointer",
                zIndex: 2,
                boxShadow: "0 2px 6px rgba(0,0,0,0.15)"
              }}
            >
              {completed[i] ? <FaCheckCircle /> : i + 1}
            </div>

            {/* Step card */}
            <div
              style={{
                backgroundColor: "white",
                padding: 18,
                borderRadius: 12,
                marginLeft: 25,
                flex: 1,
                boxShadow: "0 4px 12px rgba(0,0,0,0.05)"
              }}
            >
              <h2
                style={{
                  margin: "0 0 10px 0",
                  color: "#1e3a8a"
                }}
              >
                {step.step}
              </h2>
              <ul style={{ margin: 0, paddingLeft: 20 }}>
                {step.details.map((d, idx) => (
                  <li key={idx}>
                    <a
                      href={d.link}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{ color: "#2563eb", textDecoration: "none" }}
                    >
                      {d.text}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        ))}
      </div>

    </div>
  </div>
);

}
