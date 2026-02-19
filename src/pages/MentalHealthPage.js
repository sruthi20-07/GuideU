import { useEffect, useState } from "react";
import { auth, db } from "../firebase";
import { doc, getDoc, setDoc, serverTimestamp } from "firebase/firestore";

export default function MentalHealthPage() {
  const [user, setUser] = useState(null);
  const [form, setForm] = useState({
    sleepHours: "",
    studyHours: "",
    anxious: "no",
    productive: "yes",
    demotivating: "",
    workload: "no",
    needHelp: "no",
    notes: "",
    stressLevel: null,
    motivationLevel: null
  });

  const [canEdit, setCanEdit] = useState(true);

  /* 🔹 WAIT FOR AUTH */
  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((u) => {
      setUser(u);
    });
    return unsubscribe;
  }, []);

  /* 🔹 LOAD DATA AFTER USER READY */
  useEffect(() => {
    if (!user) return;

    const load = async () => {
      const ref = doc(db, "mentalHealth", user.uid);
      const snap = await getDoc(ref);

      if (snap.exists()) {
        const data = snap.data();
        setForm(data);

        if (data.lastCheckIn) {
          const last = data.lastCheckIn.toDate();
          const diffHours =
            (Date.now() - last.getTime()) / (1000 * 60 * 60);

          if (diffHours < 24) {
            setCanEdit(false);
          }
        }
      }
    };

    load();
  }, [user]);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  /* 🔹 AUTO CALCULATION */
  const calculateLevels = () => {
    let stress = 1;
    let motivation = 5;

    if (form.sleepHours < 6) stress += 2;
    if (form.sleepHours >= 7) motivation += 1;
    if (form.studyHours > 6) stress += 1;
    if (form.studyHours >= 3) motivation += 1;
    if (form.anxious === "yes") stress += 2;
    if (form.productive === "yes") motivation += 2;
    else stress += 1;
    if (form.workload === "yes") stress += 2;
    if (form.needHelp === "yes") stress += 1;
    if (form.demotivating.trim() !== "") stress += 1;

    return {
      stressLevel: Math.min(10, Math.max(1, stress)),
      motivationLevel: Math.min(10, Math.max(1, motivation))
    };
  };

  /* 🔹 SAVE */
  const saveCheckIn = async () => {
    if (!user) {
      alert("Please login again.");
      return;
    }

    const { stressLevel, motivationLevel } = calculateLevels();

    const data = {
      ...form,
      sleepHours: Number(form.sleepHours),
      studyHours: Number(form.studyHours),
      stressLevel,
      motivationLevel,
      lastCheckIn: serverTimestamp()
    };

    await setDoc(doc(db, "mentalHealth", user.uid), data);

    setForm(data);
    setCanEdit(false);
  };

  return (
    <div style={styles.page}>
      <div style={styles.card}>
        <h2 style={styles.title}>WellBeing Check</h2>

        {!canEdit && (
          <p style={styles.lockText}>
            You can update again after 24 hours
          </p>
        )}

        <div style={styles.qBlock}>
          <p>How many hours did you sleep?</p>
          <input
            style={styles.input}
            type="number"
            name="sleepHours"
            disabled={!canEdit}
            value={form.sleepHours}
            onChange={handleChange}
          />
        </div>

        <div style={styles.qBlock}>
          <p>How many hours did you study?</p>
          <input
            style={styles.input}
            type="number"
            name="studyHours"
            disabled={!canEdit}
            value={form.studyHours}
            onChange={handleChange}
          />
        </div>

        <div style={styles.qBlock}>
          <p>Did you feel anxious today?</p>
          <select
            style={styles.input}
            name="anxious"
            disabled={!canEdit}
            value={form.anxious}
            onChange={handleChange}
          >
            <option>yes</option>
            <option>no</option>
          </select>
        </div>

        <div style={styles.qBlock}>
          <p>Were you productive today?</p>
          <select
            style={styles.input}
            name="productive"
            disabled={!canEdit}
            value={form.productive}
            onChange={handleChange}
          >
            <option>yes</option>
            <option>no</option>
          </select>
        </div>

        <div style={styles.qBlock}>
          <p>Is there anything that demotivates you?</p>
          <input
            style={styles.input}
            type="text"
            name="demotivating"
            disabled={!canEdit}
            value={form.demotivating}
            onChange={handleChange}
          />
        </div>

        <div style={styles.qBlock}>
          <p>Do you feel workload pressure?</p>
          <select
            style={styles.input}
            name="workload"
            disabled={!canEdit}
            value={form.workload}
            onChange={handleChange}
          >
            <option>yes</option>
            <option>no</option>
          </select>
        </div>

        <div style={styles.qBlock}>
          <p>Do you feel you need someone to talk to?</p>
          <select
            style={styles.input}
            name="needHelp"
            disabled={!canEdit}
            value={form.needHelp}
            onChange={handleChange}
          >
            <option>yes</option>
            <option>no</option>
          </select>
        </div>

        <div style={styles.qBlock}>
          <p>Anything you want to mention</p>
          <textarea
            style={styles.textarea}
            rows="3"
            name="notes"
            disabled={!canEdit}
            value={form.notes}
            onChange={handleChange}
          />
        </div>

        <button
          style={styles.button}
          disabled={!canEdit}
          onClick={saveCheckIn}
        >
          Save WellBeing Check
        </button>

        {!canEdit && (
          <div style={styles.resultBox}>
            <h3>Your WellBeing Summary</h3>
            <p>Stress Level: <b>{form.stressLevel}/10</b></p>
            <p>Motivation Level: <b>{form.motivationLevel}/10</b></p>
          </div>
        )}
      </div>
    </div>
  );
}

/* 🎨 STYLES */
const styles = {
  page: {
    minHeight: "100vh",
    background: "#f2f6fc",
    display: "flex",
    justifyContent: "center",
    alignItems: "center"
  },
  card: {
    background: "#fff",
    padding: 30,
    borderRadius: 12,
    width: 420,
    boxShadow: "0 10px 25px rgba(0,0,0,0.1)"
  },
  title: {
    textAlign: "center",
    marginBottom: 10
  },
  lockText: {
    color: "red",
    textAlign: "center",
    marginBottom: 15
  },
  qBlock: {
    marginBottom: 15
  },
  input: {
    width: "100%",
    padding: 8,
    borderRadius: 6,
    border: "1px solid #ccc"
  },
  textarea: {
    width: "100%",
    padding: 8,
    borderRadius: 6,
    border: "1px solid #ccc"
  },
  button: {
    width: "100%",
    padding: 10,
    background: "#4f46e5",
    color: "#fff",
    border: "none",
    borderRadius: 6,
    fontSize: 16,
    cursor: "pointer",
    marginTop: 10
  },
  resultBox: {
    marginTop: 20,
    padding: 15,
    background: "#eef2ff",
    borderRadius: 8,
    textAlign: "center"
  }
};
