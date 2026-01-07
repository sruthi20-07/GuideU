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
  const [params] = useSearchParams();

  const selectedBranch = params.get("branch");

  useEffect(() => {
    const load = async () => {
      const userSnap = await getDoc(doc(db, "users", auth.currentUser.uid));
      const me = userSnap.data();
      setProfile(me);

      const qSnap = await getDocs(collection(db, "questions"));
      const aSnap = await getDocs(collection(db, "answers"));

      const allQ = qSnap.docs.map(d => ({ id: d.id, ...d.data() }));
      const allA = aSnap.docs.map(d => ({ id: d.id, ...d.data() }));

      const filtered = selectedBranch
        ? allQ.filter(q => q.branch === selectedBranch)
        : allQ;

      setQuestions(filtered);
      setAnswers(allA);
    };

    load();
  }, [selectedBranch]);

  if (!profile) return null;

  const userYear = profile.year === "alumni" ? 5 : Number(profile.year);
  const maxYear = userYear - 1;

  const years = [];
  for (let y = 1; y <= maxYear; y++) years.push(y);

  const submitAnswer = async (qid) => {
    if (!answerText[qid]?.trim()) return;

    await addDoc(collection(db, "answers"), {
      questionId: qid,
      content: answerText[qid],
      answeredById: auth.currentUser.uid,
      answeredByYear: userYear,
      createdAt: serverTimestamp()
    });

    const aSnap = await getDocs(collection(db, "answers"));
    setAnswers(aSnap.docs.map(d => ({ id: d.id, ...d.data() })));
    setAnswerText({ ...answerText, [qid]: "" });
  };

  const saveEdit = async (aid) => {
    await updateDoc(doc(db, "answers", aid), { content: editText[aid] });

    const aSnap = await getDocs(collection(db, "answers"));
    setAnswers(aSnap.docs.map(d => ({ id: d.id, ...d.data() })));
    setEditText({ ...editText, [aid]: "" });
  };

  return (
    <div style={{ padding: 20 }}>
      <ProfileMenu />

      <div style={{ display: "grid", gridTemplateColumns: `repeat(${years.length}, 1fr)`, gap: 16 }}>
        {years.map(year => {
          const yearQuestions = questions.filter(q => Number(q.askedByYear) === year);

          const unanswered = yearQuestions.filter(q =>
            !answers.some(a => a.questionId === q.id)
          );

          const answered = yearQuestions.filter(q =>
            answers.some(a => a.questionId === q.id)
          );

          return (
            <div key={year} style={{ background: "#f8fafc", padding: 12, borderRadius: 12 }}>
              <h3 style={{ textAlign: "center" }}>{year} Year</h3>

              <div style={{
                background: "#dbeafe",
                color: "#1e40af",
                padding: "6px 10px",
                borderRadius: 8,
                marginTop: 6,
                fontWeight: 700,
                textAlign: "center"
              }}>
                Answered
              </div>

              {answered.map(q => (
                <div key={q.id} style={{ background: "white", padding: 8, borderRadius: 8, marginTop: 6 }}>
                  <div style={{ fontWeight: 600 }}>{q.content}</div>

                  {answers.filter(a => a.questionId === q.id).map(a => (
                    <div key={a.id} style={{ background: "#eef2f7", padding: 6, borderRadius: 6, marginTop: 4 }}>
                      {a.answeredById === auth.currentUser.uid ? (
                        <>
                          <textarea
                            value={editText[a.id] ?? a.content}
                            onChange={e => setEditText({ ...editText, [a.id]: e.target.value })}
                            style={{ width: "100%", height: 40 }}
                          />
                          <button onClick={() => saveEdit(a.id)}>Save</button>
                        </>
                      ) : (
                        <div>{a.content}</div>
                      )}
                    </div>
                  ))}
                </div>
              ))}

              <div style={{
                background: "#fee2e2",
                color: "#991b1b",
                padding: "6px 10px",
                borderRadius: 8,
                marginTop: 10,
                fontWeight: 700,
                textAlign: "center"
              }}>
                Unanswered
              </div>

              {unanswered.map(q => (
                <div key={q.id} style={{ background: "white", padding: 8, borderRadius: 8, marginTop: 6 }}>
                  <div style={{ fontWeight: 600 }}>{q.content}</div>
                  <textarea
                    placeholder="Write answer..."
                    value={answerText[q.id] || ""}
                    onChange={e => setAnswerText({ ...answerText, [q.id]: e.target.value })}
                    style={{ width: "100%", height: 50, marginTop: 6 }}
                  />
                  <button onClick={() => submitAnswer(q.id)}>Submit</button>
                </div>
              ))}
            </div>
          );
        })}
      </div>
    </div>
  );
}
