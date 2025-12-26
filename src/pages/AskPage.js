import { useEffect, useState } from "react";
import { auth, db } from "../firebase";
import {
  collection,
  getDocs,
  query,
  where,
  addDoc,
  serverTimestamp,
  updateDoc,
  doc,
  getDoc
} from "firebase/firestore";
import { useSearchParams } from "react-router-dom";
import ProfileMenu from "../components/ProfileMenu";

const RESOURCES = [
  "Certifications",
  "Semester Preparation Tips",
  "Internships",
  "Coding Platforms",
  "Hackathons"
];

export default function AskPage() {
  const [profile, setProfile] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [answers, setAnswers] = useState([]);
  const [activeResource, setActiveResource] = useState(RESOURCES[0]);
  const [desc, setDesc] = useState("");
  const [search, setSearch] = useState("");
  const [successMsg, setSuccessMsg] = useState("");
  const [commentText, setCommentText] = useState({});

  const [params] = useSearchParams();
  const selectedBranch = params.get("branch");

  useEffect(() => {
    const load = async () => {
      const userSnap = await getDoc(doc(db, "users", auth.currentUser.uid));
      const me = userSnap.data();
      setProfile(me);

      const answeredSnap = await getDocs(
        query(
          collection(db, "questions"),
          where("branch", "==", selectedBranch),
          where("resourceType", "==", activeResource),
          where("isAnswered", "==", true)
        )
      );

      const mySnap = await getDocs(
        query(
          collection(db, "questions"),
          where("askedById", "==", auth.currentUser.uid),
          where("branch", "==", selectedBranch),
          where("resourceType", "==", activeResource)
        )
      );

      const answered = answeredSnap.docs.map(d => ({ id: d.id, ...d.data() }));
      const mine = mySnap.docs.map(d => ({ id: d.id, ...d.data() }));

      const merged = [
        ...answered,
        ...mine.filter(m => !answered.some(a => a.id === m.id))
      ];

      const aSnap = await getDocs(collection(db, "answers"));

      setQuestions(merged);
      setAnswers(aSnap.docs.map(d => ({ id: d.id, ...d.data() })));
    };

    if (selectedBranch) load();
  }, [activeResource, selectedBranch]);

  const submitQuestion = async () => {
    if (!desc.trim()) return;

    await addDoc(collection(db, "questions"), {
      content: desc,
      resourceType: activeResource,
      branch: selectedBranch,
      askedById: auth.currentUser.uid,
      askedByYear: profile.year,
      isAnswered: false,
      createdAt: serverTimestamp()
    });

    setDesc("");
    setSuccessMsg("✔ Question submitted successfully");
    setTimeout(() => setSuccessMsg(""), 3000);
  };

  const reactToAnswer = async (answer, type) => {
    const uid = auth.currentUser.uid;
    if (answer.answeredById === uid) return;

    const likedBy = answer.likedBy || [];
    const dislikedBy = answer.dislikedBy || [];

    if (type === "like" && !likedBy.includes(uid)) {
      const newLiked = [...likedBy, uid];
      const newDisliked = dislikedBy.filter(x => x !== uid);
      await updateDoc(doc(db, "answers", answer.id), {
        likedBy: newLiked,
        dislikedBy: newDisliked,
        likes: newLiked.length,
        dislikes: newDisliked.length
      });
    }

    if (type === "dislike" && !dislikedBy.includes(uid)) {
      const newDisliked = [...dislikedBy, uid];
      const newLiked = likedBy.filter(x => x !== uid);
      await updateDoc(doc(db, "answers", answer.id), {
        dislikedBy: newDisliked,
        likedBy: newLiked,
        dislikes: newDisliked.length,
        likes: newLiked.length
      });
    }

    const snap = await getDocs(collection(db, "answers"));
    setAnswers(snap.docs.map(d => ({ id: d.id, ...d.data() })));
  };

  const addComment = async (answer) => {
    const uid = auth.currentUser.uid;
    const text = commentText[answer.id];
    if (!text) return;

    const old = answer.comments || [];
    if (old.some(c => c.uid === uid)) return;

    const newComments = [...old, { uid, text }];

    await updateDoc(doc(db, "answers", answer.id), {
      comments: newComments
    });

    const snap = await getDocs(collection(db, "answers"));
    setAnswers(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    setCommentText({ ...commentText, [answer.id]: "" });
  };

  if (!profile) return null;

  // 🔧 Search fix added here
  const normalizedSearch = search.trim().toLowerCase();

  const visible = questions
    .filter(q => q.content.toLowerCase().includes(normalizedSearch))
    .sort((a, b) => (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0));

  return (
    <div style={{ padding: 24 }}>
      <ProfileMenu />

      {successMsg && (
        <div style={{
          background: "#d1fae5",
          color: "#065f46",
          padding: 10,
          borderRadius: 8,
          marginBottom: 12,
          textAlign: "center"
        }}>
          {successMsg}
        </div>
      )}

      <div style={{ textAlign: "center", marginBottom: 14 }}>
        <input
          placeholder="Search questions..."
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

      <div style={{ display: "flex", gap: 10, overflowX: "auto", marginBottom: 16 }}>
        {RESOURCES.map(r => (
          <button
            key={r}
            onClick={() => setActiveResource(r)}
            style={{
              whiteSpace: "nowrap",
              padding: "8px 14px",
              borderRadius: 14,
              fontWeight: 600,
              background: activeResource === r ? "#2563eb" : "#e5e7eb",
              color: activeResource === r ? "white" : "black",
              border: "none"
            }}
          >
            {r}
          </button>
        ))}
      </div>

      {visible.map(q => {
        const hasAnswer = answers.some(a => a.questionId === q.id);

        return (
          <div key={q.id} style={{ background: "white", padding: 14, borderRadius: 10, marginBottom: 14 }}>
            <p style={{ fontWeight: 600 }}>{q.content}</p>

            {!hasAnswer && (
              <div style={{ color: "#f59e0b", fontSize: 13, marginBottom: 6 }}>
                ⏳ Waiting for answer
              </div>
            )}

            {answers.filter(a => a.questionId === q.id).map(a => (
              <div key={a.id} style={{ background: "#f3f4f6", padding: 8, borderRadius: 8, marginTop: 6 }}>
                {a.content}

                <div style={{ marginTop: 6 }}>
                  <button onClick={() => reactToAnswer(a, "like")}>👍 {a.likes || 0}</button>
                  <button onClick={() => reactToAnswer(a, "dislike")} style={{ marginLeft: 6 }}>
                    👎 {a.dislikes || 0}
                  </button>
                </div>

                <input
                  placeholder="Add comment"
                  value={commentText[a.id] || ""}
                  onChange={e => setCommentText({ ...commentText, [a.id]: e.target.value })}
                  style={{ width: "100%", marginTop: 6 }}
                />

                <button onClick={() => addComment(a)} style={{ marginTop: 4 }}>
                  Comment
                </button>

                {(a.comments || []).map((c, i) => (
                  <div key={i} style={{ fontSize: 12, marginTop: 4 }}>
                    💬 {c.text}
                  </div>
                ))}
              </div>
            ))}
          </div>
        );
      })}

      <div style={{ marginTop: 20 }}>
        <textarea
          placeholder="Describe your question..."
          value={desc}
          onChange={e => setDesc(e.target.value)}
          style={{ width: "100%", height: 70, padding: 8, borderRadius: 8, resize: "none" }}
        />
        <button onClick={submitQuestion} style={{ marginTop: 10 }}>
          Submit Question
        </button>
      </div>
    </div>
  );
}
