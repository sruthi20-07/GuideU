import { useEffect, useState } from "react";
import { auth, db } from "../firebase";

import {
  collection,
  query,
  where,
  addDoc,
  serverTimestamp,
  doc,
  getDoc,
  onSnapshot,
  updateDoc,
  getDocs
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

  /* ================== ONE-TIME DATA REPAIR ================== */
  const repairMissingUsernames = async () => {
    const qSnap = await getDocs(collection(db, "questions"));
    const aSnap = await getDocs(collection(db, "answers"));

    for (const d of qSnap.docs) {
      const q = d.data();
      if (!q.askedByName && q.askedById) {
        const u = await getDoc(doc(db, "users", q.askedById));
        if (u.exists()) {
          await updateDoc(doc(db, "questions", d.id), {
            askedByName: u.data().name
          });
        }
      }
    }

    for (const d of aSnap.docs) {
      const a = d.data();
      if (!a.answeredByName && a.answeredById) {
        const u = await getDoc(doc(db, "users", a.answeredById));
        if (u.exists()) {
          await updateDoc(doc(db, "answers", d.id), {
            answeredByName: u.data().name
          });
        }
      }
    }

    alert("Repair finished. Reload the page.");
  };

  const [profile, setProfile] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [answers, setAnswers] = useState([]);
  const [activeResource, setActiveResource] = useState(RESOURCES[0]);
  const [desc, setDesc] = useState("");
  const [search, setSearch] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  const [params] = useSearchParams();
  const selectedBranch = params.get("branch");
  const myUid = auth.currentUser?.uid;

  // ===== SAFE DATE FORMATTER (fixes your crash) =====
  const formatTime = (ts) => {
    if (!ts) return "";
    if (ts.toDate) return ts.toDate().toLocaleString();
    if (ts.seconds) return new Date(ts.seconds * 1000).toLocaleString();
    return "";
  };

  /* ================= DATA LOADER ================= */

  const loadData = async () => {
    if (!myUid || !selectedBranch) return;

    const userSnap = await getDoc(doc(db, "users", myUid));
    setProfile(userSnap.data());

    const qRef = query(
      collection(db, "questions"),
      where("branch", "==", selectedBranch),
      where("resourceType", "==", activeResource)
    );

    const unsubQ = onSnapshot(qRef, snap => {
      const all = snap.docs.map(d => ({ id: d.id, ...d.data() }));

      const mine = all.filter(q => q.askedById === myUid);
      const publicAnswered = all.filter(q => q.isAnswered);

      const merged = [
        ...mine,
        ...publicAnswered.filter(q => q.askedById !== myUid)
      ];

      setQuestions(merged);
    });

    const unsubA = onSnapshot(collection(db, "answers"), snap => {
      setAnswers(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    });

    return () => {
      unsubQ();
      unsubA();
    };
  };

  useEffect(() => {
    let unsub = () => {};
    loadData().then(u => (unsub = u));
    return () => unsub();
  }, [activeResource, selectedBranch, myUid]);

  /* ================= SUBMIT QUESTION ================= */

  const submitQuestion = async () => {
    if (!desc.trim()) return;

    const newQuestion = {
      content: desc,
      askedById: myUid,
      askedByName: profile.name,
      askedByYear: profile.year,
      branch: selectedBranch,
      resourceType: activeResource,
      isAnswered: false,
      createdAt: serverTimestamp()
    };

    setQuestions(prev => [newQuestion, ...prev]);
    await addDoc(collection(db, "questions"), newQuestion);

    setDesc("");
    setSuccessMsg("✔ Question submitted successfully");
    setTimeout(() => setSuccessMsg(""), 3000);
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
        <div style={{ background: "#d1fae5", padding: 10, borderRadius: 8, marginBottom: 12 }}>
          {successMsg}
        </div>
      )}

      <input
        placeholder="Search questions..."
        value={search}
        onChange={e => setSearch(e.target.value)}
        style={{ width: 260, padding: 8, borderRadius: 8, marginBottom: 14 }}
      />

      <div style={{ display: "flex", gap: 10, marginBottom: 16 }}>
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

      {visible.map(q => {
        const qAnswers = answers.filter(a => a.questionId === q.id);
        const isMine = q.askedById === myUid;

        return (
          <div key={q.id} style={{ background: "white", padding: 14, borderRadius: 10, marginBottom: 14 }}>
            <b>{q.content}</b>

            <div style={{ fontSize: 12, color: "#6b7280", marginBottom: 6 }}>
              Asked by <b>{q.askedByName}</b> — 
              {q.askedByYear === 5 ? " Alumni" : ` Year ${q.askedByYear}`} •{" "}
              {formatTime(q.createdAt)}
            </div>

            {qAnswers.length === 0 && isMine && (
              <div style={{ color: "#f59e0b", fontSize: 13 }}>⏳ Waiting for answer</div>
            )}

            {qAnswers.map(a => (
              <div key={a.id} style={{ background: "#f3f4f6", padding: 8, borderRadius: 8, marginTop: 6 }}>
                {a.content}
                <div style={{ fontSize: 12 }}>
                  Answered by <b>{a.answeredByName}</b> — 
                  {a.answeredByYear === 5 ? " Alumni" : ` Year ${a.answeredByYear}`} •{" "}
                  {formatTime(a.createdAt)}
                </div>
              </div>
            ))}
          </div>
        );
      })}

      <textarea
        placeholder="Describe your question..."
        value={desc}
        onChange={e => setDesc(e.target.value)}
        style={{ width: "100%", height: 70, padding: 8, borderRadius: 8 }}
      />

      <button onClick={submitQuestion} style={{ marginTop: 10 }}>
        Submit Question
      </button>
    </div>
  );
}
