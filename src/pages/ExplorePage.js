import { useEffect, useState } from "react";
import { db, auth } from "../firebase";
import { handleVote } from "../utils/voteUtils";
import {
  collection,
  getDocs,
  doc,
  updateDoc,
  arrayUnion,
  onSnapshot
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
  const [commentText, setCommentText] = useState({});

  const uid = auth.currentUser?.uid;

  /* 🔄 Initial Load */
  useEffect(() => {
    const load = async () => {
      const qSnap = await getDocs(collection(db, "questions"));
      const aSnap = await getDocs(collection(db, "answers"));

      setQuestions(qSnap.docs.map(d => ({ id: d.id, ...d.data() })));
      setAnswers(aSnap.docs.map(d => ({ id: d.id, ...d.data() })));
    };
    load();
  }, []);

  /* 🧠 Live Updates */
  useEffect(() => {
    const unsubQ = onSnapshot(collection(db, "questions"), snap => {
      setQuestions(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    });

    const unsubA = onSnapshot(collection(db, "answers"), snap => {
      setAnswers(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    });

    return () => {
      unsubQ();
      unsubA();
    };
  }, []);

  const normalizedSearch = search.trim().toLowerCase();
  const answeredQuestionIds = new Set(answers.map(a => a.questionId));

  const visible = questions
    .filter(q => answeredQuestionIds.has(q.id))
    .filter(q => q.resourceType === activeResource)
    .filter(q => q.content.toLowerCase().includes(normalizedSearch))
    .map(q => {
      const qAnswers = answers.filter(a => a.questionId === q.id);
      return { ...q, answers: qAnswers };
    });

  const refreshAnswers = async () => {
    const aSnap = await getDocs(collection(db, "answers"));
    setAnswers(aSnap.docs.map(d => ({ id: d.id, ...d.data() })));
  };

  const addComment = async (answerId) => {
    if (!commentText[answerId]?.trim()) return;

    const safeComment = {
      userId: uid,
      text: commentText[answerId],
      createdAt: Date.now()
    };

    await updateDoc(doc(db, "answers", answerId), {
      comments: arrayUnion(safeComment)
    });

    setCommentText({ ...commentText, [answerId]: "" });
    refreshAnswers();
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        padding: 30,
        background: "linear-gradient(to bottom, #eff6ff, #ffffff)"
      }}
    >
      <ProfileMenu />

      {/* 🔍 SEARCH */}
      <div style={{ display: "flex", justifyContent: "center", marginBottom: 20 }}>
        <input
          placeholder="Search questions..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          style={{
            width: 320,
            padding: 10,
            borderRadius: 12,
            border: "1px solid #cbd5e1",
            boxShadow: "0 3px 8px rgba(0,0,0,0.05)"
          }}
        />
      </div>

      {/* 🎯 RESOURCE FILTER */}
      <div style={{ display: "flex", gap: 10, overflowX: "auto", marginBottom: 25 }}>
        {RESOURCES.map(r => (
          <button
            key={r}
            onClick={() => setActiveResource(r)}
            style={{
              padding: "8px 18px",
              borderRadius: 20,
              border: "none",
              fontWeight: 500,
              background: activeResource === r ? "#2563eb" : "#e2e8f0",
              color: activeResource === r ? "white" : "#334155",
              cursor: "pointer"
            }}
          >
            {r}
          </button>
        ))}
      </div>

      {/* 📌 QUESTIONS */}
      {visible.map(q => (
        <div
          key={q.id}
          style={{
            background: "white",
            padding: 20,
            borderRadius: 16,
            marginBottom: 25,
            boxShadow: "0 5px 15px rgba(0,0,0,0.08)"
          }}
        >
          <p style={{ fontWeight: 700, fontSize: 16, marginBottom: 12 }}>
            {q.content}
          </p>

          {q.answers.map(a => (
            <div
              key={a.id}
              style={{
                background: "#f1f5f9",
                padding: 15,
                borderRadius: 14,
                marginTop: 12
              }}
            >
              <p style={{ marginBottom: 10 }}>{a.content}</p>

              {/* 👍👎💬 */}
              <div style={{ display: "flex", alignItems: "center", gap: 15 }}>
                <button
                  onClick={() => handleVote(a, "useful")}
                  style={voteBtn}
                >
                  👍 {a.usefulCount || 0}
                </button>

                <button
                  onClick={() => handleVote(a, "notUseful")}
                  style={voteBtn}
                >
                  👎 {a.notUsefulCount || 0}
                </button>

                <span
                  style={{
                    cursor: "pointer",
                    color: "#2563eb",
                    fontWeight: 500
                  }}
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

              {/* COMMENTS SECTION */}
              {openComments[a.id] && (
                <div style={{ marginTop: 15 }}>
                  {(a.comments || []).map((c, i) => (
                    <div
                      key={i}
                      style={{
                        fontSize: 13,
                        background: "#e2e8f0",
                        padding: 8,
                        borderRadius: 8,
                        marginBottom: 6
                      }}
                    >
                      {c.text}
                    </div>
                  ))}

                  <textarea
                    placeholder="Add comment..."
                    value={commentText[a.id] || ""}
                    onChange={e =>
                      setCommentText({
                        ...commentText,
                        [a.id]: e.target.value
                      })
                    }
                    style={{
                      width: "100%",
                      marginTop: 8,
                      padding: 8,
                      borderRadius: 8,
                      border: "1px solid #cbd5e1"
                    }}
                  />
                  <button
                    onClick={() => addComment(a.id)}
                    style={{
                      marginTop: 8,
                      background: "#2563eb",
                      color: "white",
                      border: "none",
                      padding: "6px 14px",
                      borderRadius: 8,
                      cursor: "pointer"
                    }}
                  >
                    Post
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      ))}
    </div>
  );
}

const voteBtn = {
  border: "none",
  background: "#e2e8f0",
  padding: "6px 12px",
  borderRadius: 8,
  cursor: "pointer"
};
