import { useEffect, useState } from "react";
import { db } from "../firebase";
import {
  collection,
  getDocs,
  query,
  where
} from "firebase/firestore";
import ProfileMenu from "../components/ProfileMenu";

const RESOURCES = [
  "Certifications",
  "Semester Preparation Tips",
  "Internships",
  "Coding Platforms",
  "Hackathons"
];

export default function ExplorePage() {
  const [questions, setQuestions] = useState([]);
  const [answers, setAnswers] = useState([]);
  const [activeResource, setActiveResource] = useState(RESOURCES[0]);
  const [search, setSearch] = useState("");
  const [openComments, setOpenComments] = useState({});

  useEffect(() => {
    const load = async () => {
      const qSnap = await getDocs(
        query(collection(db, "questions"), where("isAnswered", "==", true))
      );
      const aSnap = await getDocs(collection(db, "answers"));

      setQuestions(qSnap.docs.map(d => ({ id: d.id, ...d.data() })));
      setAnswers(aSnap.docs.map(d => ({ id: d.id, ...d.data() })));
    };

    load();
  }, []);

  // 🔧 Search fix added here
  const normalizedSearch = search.trim().toLowerCase();

  const visible = questions
    .filter(q => q.resourceType === activeResource)
    .filter(q => q.content.toLowerCase().includes(normalizedSearch))
    .map(q => {
      const qAnswers = answers.filter(a => a.questionId === q.id);
      const likes = qAnswers.reduce((sum, a) => sum + (a.likes || 0), 0);
      return { ...q, likes, answers: qAnswers };
    })
    .sort((a, b) => b.likes - a.likes);

  return (
    <div style={{ padding: 20 }}>
      <ProfileMenu />

      <div style={{ display: "flex", justifyContent: "center", marginBottom: 12 }}>
        <input
          placeholder="Search..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          style={{ width: 260, padding: 8, borderRadius: 8 }}
        />
      </div>

      {/* 🔧 No results feedback */}
      {visible.length === 0 && normalizedSearch && (
        <div style={{ textAlign: "center", color: "#777", marginBottom: 12 }}>
          No questions match your search
        </div>
      )}

      <div style={{ display: "flex", gap: 8, overflowX: "auto", marginBottom: 15 }}>
        {RESOURCES.map(r => (
          <button
            key={r}
            onClick={() => setActiveResource(r)}
            style={{
              whiteSpace: "nowrap",
              padding: "8px 14px",
              borderRadius: 14,
              border: "none",
              background: activeResource === r ? "#2563eb" : "#e5e7eb",
              color: activeResource === r ? "white" : "black"
            }}
          >
            {r}
          </button>
        ))}
      </div>

      {visible.map(q => (
        <div key={q.id} style={{ background: "white", padding: 12, borderRadius: 10, marginBottom: 12 }}>
          <div style={{ fontSize: 12, color: "#555", marginBottom: 4 }}>
            {q.resourceType} • {q.branch} • Year {q.askedByYear}
          </div>

          <p style={{ fontWeight: 600 }}>{q.content}</p>

          {q.answers.map(a => (
            <div key={a.id} style={{ background: "#f3f4f6", padding: 8, borderRadius: 8, marginTop: 6 }}>
              {a.content}

              <div style={{ fontSize: 12, marginTop: 4 }}>
                👍 {a.likes || 0} &nbsp; 👎 {a.dislikes || 0}
                &nbsp; 
                <span
                  style={{ cursor: "pointer", color: "#2563eb" }}
                  onClick={() =>
                    setOpenComments({
                      ...openComments,
                      [a.id]: !openComments[a.id]
                    })
                  }
                >
                  💬 {(a.comments || []).length} Comments
                </span>
              </div>

              {openComments[a.id] && (
                <div style={{ marginTop: 6 }}>
                  {(a.comments || []).map((c, i) => (
                    <div
                      key={i}
                      style={{
                        fontSize: 12,
                        background: "#e5e7eb",
                        padding: 6,
                        borderRadius: 6,
                        marginTop: 4
                      }}
                    >
                      {c.text}
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      ))}
    </div>
  );
}
