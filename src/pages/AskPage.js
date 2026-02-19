import { useEffect, useState } from "react";
import { auth, db } from "../firebase";
import { increment, updateDoc } from "firebase/firestore";
import {
  collection,
  query,
  where,
  addDoc,
  serverTimestamp,
  doc,
  getDoc,
  onSnapshot
} from "firebase/firestore";
import { getDocs } from "firebase/firestore";  
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
  useEffect(() => {
  if (!myUid || !selectedBranch) return;

  const load = async () => {
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

  let unsub = () => {};
  load().then(u => (unsub = u));

  return () => unsub();
}, [activeResource, selectedBranch, myUid]);
useEffect(() => {
  const questionId = params.get("question");
  const answerId = params.get("answer");

  setTimeout(() => {
    if (questionId) {
      const element = document.getElementById(questionId);
      if (element) {
        element.scrollIntoView({ behavior: "smooth", block: "center" });

        // highlight
        element.style.outline = "3px solid #facc15";
        setTimeout(() => {
          element.style.outline = "";
        }, 2000);
      }
    }

    if (answerId) {
      const element = document.getElementById(answerId);
      if (element) {
        element.scrollIntoView({ behavior: "smooth", block: "center" });

        element.style.outline = "3px solid #facc15";
        setTimeout(() => {
          element.style.outline = "";
        }, 2000);
      }
    }
  }, 300);

}, [questions, answers, params]);




  /* ================= SUBMIT QUESTION ================= */
const submitQuestion = async () => {
 
  if (!desc.trim()) return;

  if (!profile) {
    alert("Please wait... profile loading.");
    return;
  }

  if (!selectedBranch) {
    alert("Branch not selected.");
    return;
  }

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

  const questionRef = await addDoc(
    collection(db, "questions"),
    newQuestion
  );

  await updateDoc(doc(db, "users", myUid), {
    questionsAsked: increment(1)
  }).catch(async () => {
    await updateDoc(doc(db, "users", myUid), {
      questionsAsked: 1
    });
  });

  /* 🔔 NOTIFICATION LOGIC — CORRECT VERSION */

  const usersSnap = await getDocs(collection(db, "users"));

  const askerYear = Number(profile.year);
  const questionBranch = selectedBranch?.trim().toLowerCase();

  for (const userDoc of usersSnap.docs) {
    const userData = userDoc.data();

    const receiverBranch = userData.branch?.trim().toLowerCase();
    const receiverYearRaw = userData.year;
    const receiverYear = String(receiverYearRaw).toLowerCase();

    if (userDoc.id === myUid) continue;

    if (receiverBranch !== questionBranch) continue;

    let shouldNotify = false;

    if (receiverYear === "alumni" || Number(receiverYear) === 5) {
      shouldNotify = true;
    } else if (Number(receiverYear) > askerYear) {
      shouldNotify = true;
    }

    if (shouldNotify) {
      await addDoc(collection(db, "notifications"), {
        userId: userDoc.id,
        message: `New question from Year ${askerYear} in ${selectedBranch}`,
        type: "question",
        branch: selectedBranch,
        questionId: questionRef.id,
        isRead: false,
        createdAt: serverTimestamp()
      });
    }
  }

  setDesc("");
  setSuccessMsg("✔ Question submitted successfully");
  setTimeout(() => setSuccessMsg(""), 3000);
};



 if (!profile || !selectedBranch) return null;
  const normalizedSearch = search.trim().toLowerCase();

  const filtered = questions
  .filter(q => q.content.toLowerCase().includes(normalizedSearch))
  .sort((a, b) => (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0));

const answeredQuestions = filtered.filter(q =>
  answers.some(a => a.questionId === q.id)
);

const unansweredQuestions = filtered.filter(q =>
  !answers.some(a => a.questionId === q.id)
);


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
      {[1, 2, 3, 4].includes(Number(profile.year)) && (

  <div
    style={{
      background: "white",
      padding: 16,
      borderRadius: 10,
      marginBottom: 20,
      boxShadow: "0 2px 6px rgba(0,0,0,0.05)"
    }}
  >
    <textarea
      placeholder="Describe your question..."
      value={desc}
      onChange={e => setDesc(e.target.value)}
      style={{
        width: "100%",
        height: 70,
        padding: 8,
        borderRadius: 8,
        border: "1px solid #d1d5db",
        marginBottom: 10
      }}
    />

    <button
      onClick={submitQuestion}
      style={{
        background: "#2563eb",
        color: "white",
        border: "none",
        padding: "8px 16px",
        borderRadius: 8,
        cursor: "pointer"
      }}
    >
      Submit Question
    </button>
  </div>
)}


      <div style={{ display: "flex", gap: 20, alignItems: "flex-start" }}>

  {/* ANSWERED */}
  <div style={{ flex: 1 }}>
    <div
      style={{
        background: "#d1fae5",
        padding: 12,
        borderRadius: 10,
        marginBottom: 10,
        fontWeight: "bold"
      }}
    >
      Answered
    </div>

    {answeredQuestions.map(q => {
      const qAnswers = answers.filter(a => a.questionId === q.id);
      const isMine = q.askedById === myUid;

      return (
        <div
          id={q.id}
          key={q.id}
          style={{
            background: "#ecfdf5",
            padding: 14,
            borderRadius: 10,
            marginBottom: 14
          }}
        >
          <b>{q.content}</b>

          <div style={{ fontSize: 12, color: "#6b7280", marginBottom: 6 }}>
            Posted anonymously • {formatTime(q.createdAt)}
          </div>

          {qAnswers.map(a => (
            <div
              id={a.id}
              key={a.id}
              style={{
                background: "white",
                padding: 8,
                borderRadius: 8,
                marginTop: 6
              }}
            >
              {a.content}
              <div style={{ fontSize: 12 }}>
                Answered anonymously • {formatTime(a.createdAt)}
              </div>
            </div>
          ))}
        </div>
      );
    })}
  </div>

  {/* UNANSWERED */}
  <div style={{ flex: 1 }}>
    <div
      style={{
        background: "#fee2e2",
        padding: 12,
        borderRadius: 10,
        marginBottom: 10,
        fontWeight: "bold"
      }}
    >
      Unanswered
    </div>

    {unansweredQuestions.map(q => {
      const qAnswers = answers.filter(a => a.questionId === q.id);
      const isMine = q.askedById === myUid;

      return (
        <div
          id={q.id}
          key={q.id}
          style={{
            background: "#fef2f2",
            padding: 14,
            borderRadius: 10,
            marginBottom: 14
          }}
        >
          <b>{q.content}</b>

          <div style={{ fontSize: 12, color: "#6b7280", marginBottom: 6 }}>
            Posted anonymously • {formatTime(q.createdAt)}
          </div>

          {isMine && (
            <div style={{ color: "#f59e0b", fontSize: 13 }}>
              ⏳ Waiting for answer
            </div>
          )}
        </div>
      );
    })}
  </div>

</div>


    </div>
  );
}
