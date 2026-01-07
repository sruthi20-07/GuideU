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
  getDoc,
  limit
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
          where("isAnswered", "==", true),
          where("askedByYear", "==", me.year),
          limit(30)
        )
      );

      const mySnap = await getDocs(
        query(
          collection(db, "questions"),
          where("askedById", "==", auth.currentUser.uid),
          where("branch", "==", selectedBranch),
          where("resourceType", "==", activeResource),
          where("askedByYear", "==", me.year)
        )
      );

      const answered = answeredSnap.docs.map(d => ({ id: d.id, ...d.data() }));
      const mine = mySnap.docs.map(d => ({ id: d.id, ...d.data() }));

      const merged = [
        ...answered,
        ...mine.filter(m => !answered.some(a => a.id === m.id))
      ];

      setQuestions(merged);

      if (merged.length === 0) {
        setAnswers([]);
        return;
      }

      const ids = merged.map(q => q.id).slice(0, 10);

      const ansSnap = await getDocs(
        query(
          collection(db, "answers"),
          where("questionId", "in", ids),
          where("branch", "==", selectedBranch),
          where("resourceType", "==", activeResource),
          where("askedByYear", "==", me.year)
        )
      );

      setAnswers(ansSnap.docs.map(d => ({ id: d.id, ...d.data() })));
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

  if (!profile) return null;

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

      {visible.map(q => (
        <div key={q.id} style={{ background: "white", padding: 14, borderRadius: 10, marginBottom: 14 }}>
          <p style={{ fontWeight: 600 }}>{q.content}</p>

          {answers.filter(a => a.questionId === q.id).map(a => (
            <div key={a.id} style={{ background: "#f3f4f6", padding: 8, borderRadius: 8, marginTop: 6 }}>
              <div style={{ fontSize: 12, color: "#555" }}>
                Answered by: {a.answeredByName}
              </div>

              {a.content}

              <div style={{ marginTop: 6 }}>
                <button onClick={() => reactToAnswer(a, "like")}>👍 {a.likes || 0}</button>
                <button onClick={() => reactToAnswer(a, "dislike")} style={{ marginLeft: 6 }}>
                  👎 {a.dislikes || 0}
                </button>
              </div>
            </div>
          ))}
        </div>
      ))}
    </div>
  );
}
