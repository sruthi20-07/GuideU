import { useEffect, useState } from "react";
import { db, auth } from "../firebase";
import {
  collection,
  getDocs,
  query,
  where,
  updateDoc,
  doc,
  getDoc,
  limit
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
  const [profile, setProfile] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [answers, setAnswers] = useState([]);
  const [activeResource, setActiveResource] = useState(RESOURCES[0]);
  const [search, setSearch] = useState("");
  const [openComments, setOpenComments] = useState({});
  const [commentText, setCommentText] = useState({});
  const [sortMode, setSortMode] = useState("top"); // "top" | "latest"

  useEffect(() => {
    const load = async () => {
      const userSnap = await getDoc(doc(db, "users", auth.currentUser.uid));
      const me = userSnap.data();
      setProfile(me);

      const qSnap = await getDocs(
        query(
          collection(db, "questions"),
          where("isAnswered", "==", true),
          where("askedByYear", "==", me.year),
          limit(40)
        )
      );

      const qs = qSnap.docs.map(d => ({ id: d.id, ...d.data() }));
      setQuestions(qs);

      if (!qs.length) {
        setAnswers([]);
        return;
      }

      const ids = qs.map(q => q.id).slice(0, 10);

      const aSnap = await getDocs(
        query(collection(db, "answers"), where("questionId", "in", ids))
      );

      setAnswers(aSnap.docs.map(d => ({ id: d.id, ...d.data() })));
    };

    load();
  }, []);

  if (!profile) return null;

  const normalizedSearch = search.trim().toLowerCase();

  const visible = questions
    .filter(q => q.resourceType === activeResource)
    .filter(q => q.content.toLowerCase().includes(normalizedSearch))
    .map(q => {
      const qAnswers = answers.filter(a => a.questionId === q.id);

      const likes = qAnswers.reduce((sum, a) => sum + (a.likes || 0), 0);
      const latestActivity = Math.max(
        ...qAnswers.map(a => a.createdAt?.seconds || 0),
        0
      );

      return {
        ...q,
        likes,
        latestActivity,
        answers: qAnswers
      };
    })
    .sort((a, b) =>
      sortMode === "top"
        ? b.likes - a.likes
        : b.latestActivity - a.latestActivity
    );

  const reactToAnswer = async (answer, type) => {
    const uid = auth.currentUser.uid;
    if (answer.answeredById === uid) return;

    const likedBy = answer.likedBy || [];
    const dislikedBy = answer.dislikedBy || [];

    let newLiked = likedBy;
    let newDisliked = dislikedBy;

    if (type === "like" && !likedBy.includes(uid)) {
      newLiked = [...likedBy, uid];
      newDisliked = dislikedBy.filter(x => x !== uid);
    }

    if (type === "dislike" && !dislikedBy.includes(uid)) {
      newDisliked = [...dislikedBy, uid];
      newLiked = likedBy.filter(x => x !== uid);
    }

    await updateDoc(doc(db, "answers", answer.id), {
      likedBy: newLiked,
      dislikedBy: newDisliked,
      likes: newLiked.length,
      dislikes: newDisliked.length
    });

    setAnswers(prev =>
      prev.map(a =>
        a.id === answer.id
          ? { ...a, likedBy: newLiked, dislikedBy: newDisliked, likes: newLiked.length, dislikes: newDisliked.length }
          : a
      )
    );
  };

  const addComment = async (answer) => {
    const uid = auth.currentUser.uid;
    const text = commentText[answer.id];
    if (!text) return;

    const old = answer.comments || [];
    if (old.some(c => c.uid === uid)) return;

    const newComments = [...old, { uid, text }];

    await updateDoc(doc(db, "answers", answer.id), { comments: newComments });

    setAnswers(prev =>
      prev.map(a => (a.id === answer.id ? { ...a, comments: newComments } : a))
    );

    setCommentText({ ...commentText, [answer.id]: "" });
  };

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

      <div style={{ display: "flex", justifyContent: "center", gap: 10, marginBottom: 14 }}>
        <button
          onClick={() => setSortMode("top")}
          style={{
            padding: "6px 14px",
            borderRadius: 12,
            border: "none",
            fontWeight: 600,
            background: sortMode === "top" ? "#2563eb" : "#e5e7eb",
            color: sortMode === "top" ? "white" : "black"
          }}
        >
          🔥 Top
        </button>

        <button
          onClick={() => setSortMode("latest")}
          style={{
            padding: "6px 14px",
            borderRadius: 12,
            border: "none",
            fontWeight: 600,
            background: sortMode === "latest" ? "#2563eb" : "#e5e7eb",
            color: sortMode === "latest" ? "white" : "black"
          }}
        >
          🕒 Latest
        </button>
      </div>

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
              <div style={{ fontSize: 12, color: "#444" }}>
                Answered by: {a.answeredByName}
              </div>

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
      ))}
    </div>
  );
}
