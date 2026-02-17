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

  // 🔄 Initial load (kept)
  useEffect(() => {
    const load = async () => {
      const qSnap = await getDocs(collection(db, "questions"));
      const aSnap = await getDocs(collection(db, "answers"));

      setQuestions(qSnap.docs.map(d => ({ id: d.id, ...d.data() })));
      setAnswers(aSnap.docs.map(d => ({ id: d.id, ...d.data() })));
    };
    load();
  }, []);

  // 🧠 Live updates
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

  // 🎯 Only show questions that have answers
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

  /*const toggleLike = async (answer) => {
    const ref = doc(db, "answers", answer.id);
    const liked = answer.likedBy?.includes(uid);
    const disliked = answer.dislikedBy?.includes(uid);

    await updateDoc(ref, {
      likes: liked ? (answer.likes || 0) - 1 : (answer.likes || 0) + 1,
      dislikes: disliked ? (answer.dislikes || 0) - 1 : (answer.dislikes || 0),
      likedBy: liked ? arrayRemove(uid) : arrayUnion(uid),
      dislikedBy: disliked ? arrayRemove(uid) : []
    });

    refreshAnswers();
  };

  const toggleDislike = async (answer) => {
    const ref = doc(db, "answers", answer.id);
    const disliked = answer.dislikedBy?.includes(uid);
    const liked = answer.likedBy?.includes(uid);

    await updateDoc(ref, {
      dislikes: disliked ? (answer.dislikes || 0) - 1 : (answer.dislikes || 0) + 1,
      likes: liked ? (answer.likes || 0) - 1 : (answer.likes || 0),
      dislikedBy: disliked ? arrayRemove(uid) : arrayUnion(uid),
      likedBy: liked ? arrayRemove(uid) : []
    });

    refreshAnswers();
  };*/

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

      <div style={{ display: "flex", gap: 8, overflowX: "auto", marginBottom: 15 }}>
        {RESOURCES.map(r => (
          <button
            key={r}
            onClick={() => setActiveResource(r)}
            style={{
              padding: "8px 14px",
              borderRadius: 14,
              background: activeResource === r ? "#2563eb" : "#e5e7eb",
              color: activeResource === r ? "white" : "black",
              border: "none"
            }}
          >
            {r}
          </button>
        ))}
      </div>

      {visible.map(q => (
        <div key={q.id} style={{ background: "white", padding: 14, borderRadius: 12, marginBottom: 16 }}>
          <p style={{ fontWeight: 700 }}>{q.content}</p>

          {q.answers.map(a => (
            <div key={a.id} style={{ background: "#f3f4f6", padding: 10, borderRadius: 10, marginTop: 8 }}>
              <p>{a.content}</p>

              <div style={{ fontSize: 14 }}>
                <button onClick={() => handleVote(a, "useful")}>
  👍 {a.usefulCount || 0}
</button>

&nbsp;&nbsp;

<button onClick={() => handleVote(a, "notUseful")}>
  👎 {a.notUsefulCount || 0}
</button>

                <span
                  style={{ cursor: "pointer", color: "#2563eb" }}
                  onClick={() =>
                    setOpenComments({ ...openComments, [a.id]: !openComments[a.id] })
                  }
                >
                  💬 {(a.comments || []).length} Comments
                </span>
              </div>

              {openComments[a.id] && (
                <div style={{ marginTop: 8 }}>
                  {(a.comments || []).map((c, i) => (
                    <div key={i} style={{ fontSize: 13, background: "#e5e7eb", padding: 6, borderRadius: 6 }}>
                      {c.text}
                    </div>
                  ))}

                  <textarea
                    placeholder="Add comment..."
                    value={commentText[a.id] || ""}
                    onChange={e =>
                      setCommentText({ ...commentText, [a.id]: e.target.value })
                    }
                    style={{ width: "100%", marginTop: 6 }}
                  />
                  <button onClick={() => addComment(a.id)}>Post</button>
                </div>
              )}
            </div>
          ))}
        </div>
      ))}
    </div>
  );
}
