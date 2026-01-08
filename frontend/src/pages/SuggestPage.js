import { useEffect, useState } from "react";
import { auth, db } from "../firebase";
import {
  collection,
  onSnapshot,
  addDoc,
  serverTimestamp,
  doc,
  getDoc,
  query,
  orderBy,
  updateDoc,
  getDocs
} from "firebase/firestore";
import { useSearchParams } from "react-router-dom";
import ProfileMenu from "../components/ProfileMenu";

export default function SuggestPage() {
  const [profile, setProfile] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [answers, setAnswers] = useState([]);
  const [answerText, setAnswerText] = useState({});
  const [activeYear, setActiveYear] = useState(null);

  const [params] = useSearchParams();
  const selectedBranch = params.get("branch");

  /* ================= LOAD PROFILE + REALTIME DATA ================= */
  useEffect(() => {
    let unsubQ = () => {};
    let unsubA = () => {};

    const load = async () => {
      const userSnap = await getDoc(doc(db, "users", auth.currentUser.uid));
      setProfile(userSnap.data());

      const qRef = query(collection(db, "questions"), orderBy("createdAt", "desc"));

      unsubQ = onSnapshot(qRef, snap => {
        const all = snap.docs.map(d => ({ id: d.id, ...d.data() }));
        const filtered = selectedBranch
          ? all.filter(q => q.branch === selectedBranch)
          : all;
        setQuestions(filtered);
      });

      unsubA = onSnapshot(collection(db, "answers"), snap => {
        setAnswers(snap.docs.map(d => ({ id: d.id, ...d.data() })));
      });
    };

    load();

    return () => {
      unsubQ();
      unsubA();
    };
  }, [selectedBranch]);

  /* ================= YEAR LOGIC ================= */
  const userYear = profile?.year === "alumni" ? 5 : Number(profile?.year);
  const maxYear = userYear ? userYear - 1 : 0;

  const years = [];
  for (let y = 1; y <= maxYear; y++) years.push(y);

  useEffect(() => {
    if (years.length && !activeYear) setActiveYear(years[0]);
  }, [years, activeYear]);

  if (!profile || !activeYear) return null;

  /* ================= SUBMIT ANSWER ================= */
  const submitAnswer = async (qid) => {
    if (!answerText[qid]?.trim()) {
      alert("Please write an answer");
      return;
    }

    await addDoc(collection(db, "answers"), {
      questionId: qid,
      content: answerText[qid],
      answeredById: auth.currentUser.uid,
      answeredByName: profile.name,
      answeredByYear: userYear,
      createdAt: serverTimestamp()
    });

    setAnswerText({ ...answerText, [qid]: "" });
  };

  /* ================= DATA REPAIR (RUN ONCE) ================= */
  const repairNames = async () => {
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

    alert("Repair complete. Reload the page.");
  };

  /* ================= FILTER QUESTIONS ================= */
  const yearQuestions = questions.filter(
    q => Number(q.askedByYear) === activeYear
  );

  const hasAnyAnswer = (qid) =>
    answers.some(a => a.questionId === qid);

  const answered = yearQuestions.filter(q => hasAnyAnswer(q.id));
  const unanswered = yearQuestions.filter(q => !hasAnyAnswer(q.id));

  /* ================= STYLES ================= */
  const submitBtn = {
    background: "#2563eb",
    color: "#fff",
    border: "none",
    padding: "8px 18px",
    borderRadius: 8,
    fontWeight: 600,
    cursor: "pointer",
    marginTop: 8
  };

  return (
    <div style={{ padding: 20 }}>
      <ProfileMenu />

      {/* RUN THIS ONCE TO FIX OLD DATA */}
      
      {/* YEAR BUTTONS */}
      <div style={{ display: "flex", gap: 12, marginBottom: 20 }}>
        {years.map(y => (
          <button
            key={y}
            onClick={() => setActiveYear(y)}
            style={{
              padding: "8px 16px",
              borderRadius: 8,
              border: "none",
              background: activeYear === y ? "#2563eb" : "#e5e7eb",
              color: activeYear === y ? "white" : "black",
              fontWeight: 600
            }}
          >
            {y} Year
          </button>
        ))}
      </div>




      <div style={{ display: "flex", gap: 20 }}>

        {/* ================= UNANSWERED ================= */}
        <div style={{ flex: 1 }}>
          <div style={{
            background: "#fee2e2",
            padding: 10,
            borderRadius: 10,
            fontWeight: 700
          }}>
            Unanswered
          </div>

          {unanswered.map(q => (
            <div
              key={q.id}
              style={{
                background: "#fff7f7",
                padding: 12,
                borderRadius: 10,
                marginTop: 10
              }}
            >
              <div style={{ fontWeight: 600 }}>{q.content}</div>

              <textarea
                placeholder="Write your answer..."
                value={answerText[q.id] || ""}
                onChange={e =>
                  setAnswerText({ ...answerText, [q.id]: e.target.value })
                }
                style={{ width: "100%", marginTop: 8 }}
              />

              <button
                style={submitBtn}
                onClick={() => submitAnswer(q.id)}
              >
                Submit
              </button>
            </div>
          ))}
        </div>

        {/* ================= ANSWERED ================= */}
        <div style={{ flex: 1 }}>
          <div style={{
            background: "#dcfce7",
            padding: 10,
            borderRadius: 10,
            fontWeight: 700
          }}>
            Answered
          </div>

          {answered.map(q => (
            <div
              key={q.id}
              style={{
                background: "#f0fdf4",
                padding: 12,
                borderRadius: 10,
                marginTop: 10
              }}
            >
             <div style={{ fontWeight: 600 }}>{q.content}</div>
<div style={{ fontSize: 12, color: "#6b7280" }}>
  Asked by: {q.askedByName} — {q.askedByYear === 5 ? "Alumni" : `Year ${q.askedByYear}`} •{" "}
  {q.createdAt?.toDate().toLocaleString()}
</div>

              {answers
  .filter(a => a.questionId === q.id)
  .map(a => (
    <div key={a.id} style={{ background: "#ecfeff", padding: 8, borderRadius: 8, marginTop: 6 }}>
      {a.content}
      <div style={{ fontSize: 12, marginTop: 4 }}>
        Answered by: {a.answeredByName} — {a.answeredByYear === 5 ? "Alumni" : `Year ${a.answeredByYear}`} •{" "}
        {a.createdAt?.toDate().toLocaleString()}
      </div>
    </div>
))}

              <textarea
                placeholder="Add another answer..."
                value={answerText[q.id] || ""}
                onChange={e =>
                  setAnswerText({ ...answerText, [q.id]: e.target.value })
                }
                style={{ width: "100%", marginTop: 10 }}
              />

              <button
                style={submitBtn}
                onClick={() => submitAnswer(q.id)}
              >
                Submit
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
