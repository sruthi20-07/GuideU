import { useEffect, useState } from "react";
import { auth, db } from "../firebase";
import {
  collection,
  getDocs,
  addDoc,
  serverTimestamp,
  updateDoc,
  doc,
  getDoc
} from "firebase/firestore";
import { useSearchParams } from "react-router-dom";
import ProfileMenu from "../components/ProfileMenu";

export default function SuggestPage() {
  const [profile, setProfile] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [answers, setAnswers] = useState([]);
  const [answerText, setAnswerText] = useState({});
  const [editText, setEditText] = useState({});
  const [activeYear, setActiveYear] = useState(null);
  const [submitted, setSubmitted] = useState({});

  const [params] = useSearchParams();
  const selectedBranch = params.get("branch");

  /* 🔹 LOAD DATA (ONLY ONCE) */
  useEffect(() => {
    const load = async () => {
      const userSnap = await getDoc(
        doc(db, "users", auth.currentUser.uid)
      );
      setProfile(userSnap.data());

      const qSnap = await getDocs(collection(db, "questions"));
      const aSnap = await getDocs(collection(db, "answers"));

      const allQuestions = qSnap.docs.map(d => ({
        id: d.id,
        ...d.data()
      }));

      const filteredQuestions = selectedBranch
        ? allQuestions.filter(q => q.branch === selectedBranch)
        : allQuestions;

      setQuestions(filteredQuestions);
      setAnswers(aSnap.docs.map(d => ({ id: d.id, ...d.data() })));
    };

    load();
  }, [selectedBranch]);

  /* 🔹 YEAR LOGIC */
  const userYear =
    profile?.year === "alumni" ? 5 : Number(profile?.year);

  const maxYear = userYear ? userYear - 1 : 0;

  const years = [];
  for (let y = 1; y <= maxYear; y++) years.push(y);

  useEffect(() => {
    if (years.length && !activeYear) {
      setActiveYear(years[0]);
    }
  }, [years, activeYear]);

  if (!profile || !activeYear) return null;

  /* 🔹 SUBMIT ANSWER */
  const submitAnswer = async (qid) => {
    if (!answerText[qid]?.trim()) {
      alert("Write an answer");
      return;
    }

    await addDoc(collection(db, "answers"), {
      questionId: qid,
      content: answerText[qid],
      answeredById: auth.currentUser.uid,
      answeredByYear: userYear,
      createdAt: serverTimestamp()
    });

    const aSnap = await getDocs(collection(db, "answers"));
    setAnswers(aSnap.docs.map(d => ({ id: d.id, ...d.data() })));

    setSubmitted({ ...submitted, [qid]: true });
    setAnswerText({ ...answerText, [qid]: "" });
  };

  /* 🔹 SAVE EDIT */
  const saveEdit = async (aid) => {
    await updateDoc(doc(db, "answers", aid), {
      content: editText[aid]
    });

    const aSnap = await getDocs(collection(db, "answers"));
    setAnswers(aSnap.docs.map(d => ({ id: d.id, ...d.data() })));
    setEditText({ ...editText, [aid]: "" });
  };

  /* 🔹 QUESTION FILTERING */
  const yearQuestions = questions.filter(
    q => Number(q.askedByYear) === activeYear
  );

  const hasAnyAnswer = (qid) =>
    answers.some(a => a.questionId === qid);

  const answered = yearQuestions.filter(q =>
    hasAnyAnswer(q.id)
  );

  const unanswered = yearQuestions.filter(q =>
    !hasAnyAnswer(q.id)
  );

  return (
    <div style={{ padding: 20 }}>
      <ProfileMenu />

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

        {/* UNANSWERED */}
        <div style={{ flex: 1 }}>
          <div style={{ background: "#fee2e2", padding: 10, borderRadius: 10, fontWeight: 700 }}>
            Unanswered
          </div>

          {unanswered.map(q => (
            <div key={q.id} style={{ background: "#fff7f7", padding: 12, borderRadius: 10, marginTop: 10 }}>
              <div style={{ fontWeight: 600 }}>{q.content}</div>

              <textarea
                placeholder="Write your answer..."
                value={answerText[q.id] || ""}
                onChange={e =>
                  setAnswerText({ ...answerText, [q.id]: e.target.value })
                }
                style={{ width: "100%", marginTop: 6 }}
              />

              <button onClick={() => submitAnswer(q.id)} style={{ marginTop: 6 }}>
                Submit
              </button>
            </div>
          ))}
        </div>

        {/* ANSWERED */}
        <div style={{ flex: 1 }}>
          <div style={{ background: "#dcfce7", padding: 10, borderRadius: 10, fontWeight: 700 }}>
            Answered
          </div>

          {answered.map(q => (
            <div key={q.id} style={{ background: "#f0fdf4", padding: 12, borderRadius: 10, marginTop: 10 }}>
              <div style={{ fontWeight: 600 }}>{q.content}</div>

              {answers
                .filter(a => a.questionId === q.id)
                .map(a => (
                  <div key={a.id} style={{ background: "#ecfeff", padding: 8, borderRadius: 8, marginTop: 6 }}>
                    {a.answeredById === auth.currentUser.uid ? (
                      <>
                        <textarea
                          value={editText[a.id] ?? a.content}
                          onChange={e =>
                            setEditText({ ...editText, [a.id]: e.target.value })
                          }
                          style={{ width: "100%" }}
                        />
                        <button onClick={() => saveEdit(a.id)}>Save</button>
                      </>
                    ) : (
                      <div>{a.content}</div>
                    )}
                  </div>
                ))}

              {/* ADD ANOTHER ANSWER */}
              <textarea
                placeholder="Add another answer..."
                value={answerText[q.id] || ""}
                onChange={e =>
                  setAnswerText({ ...answerText, [q.id]: e.target.value })
                }
                style={{ width: "100%", marginTop: 8 }}
              />

              <button onClick={() => submitAnswer(q.id)} style={{ marginTop: 6 }}>
                Submit
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}