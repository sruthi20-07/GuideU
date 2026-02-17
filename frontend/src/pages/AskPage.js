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

  const usersSnap = await getDocs(collection(db, "users"));

 const normalizeYear = (year) => {
  if (!year) return 0;

  const y = year.toString().trim().toLowerCase();

  if (y.includes("alumni")) return 5;
  if (y.includes("1")) return 1;
  if (y.includes("2")) return 2;
  if (y.includes("3")) return 3;
  if (y.includes("4")) return 4;

  return 0;
};

const askerYear = normalizeYear(profile.year);

for (const userDoc of usersSnap.docs) {
  const userData = userDoc.data();

  console.log("--------------");
  console.log("User ID:", userDoc.id);
  console.log("User Branch:", userData.branch);
  console.log("Selected Branch:", selectedBranch);

  const receiverYear = normalizeYear(userData.year);

  if (
  userDoc.id !== myUid &&
  userData.branch &&
  selectedBranch &&
  userData.branch.trim().toLowerCase() ===
    selectedBranch.trim().toLowerCase() &&
  receiverYear > askerYear
)
 {
    await addDoc(collection(db, "notifications"), {
      userId: userDoc.id,
      message: `A question was asked in ${selectedBranch} Branch - ${profile.year}`,
      type: "question",
      branch: selectedBranch,
      questionId: questionRef.id,
      answerId: null,
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
          <div
  id={q.id}
  key={q.id}
  style={{ background: "white", padding: 14, borderRadius: 10, marginBottom: 14 }}
>

            <b>{q.content}</b>

            <div style={{ fontSize: 12, color: "#6b7280", marginBottom: 6 }}>
  Posted anonymously • {formatTime(q.createdAt)}
</div>


            {qAnswers.length === 0 && isMine && (
              <div style={{ color: "#f59e0b", fontSize: 13 }}>⏳ Waiting for answer</div>
            )}

            {qAnswers.map(a => (
              <div
  id={a.id}
  key={a.id}
  style={{ background: "#f3f4f6", padding: 8, borderRadius: 8, marginTop: 6 }}
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
