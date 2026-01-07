import { useEffect, useState } from "react";
import { auth, db } from "../firebase";
import { doc, getDoc, setDoc, serverTimestamp } from "firebase/firestore";

export default function MentalHealthPage() {
  const [stress, setStress] = useState(3);
  const [motivation, setMotivation] = useState(3);
  const [notes, setNotes] = useState("");

  useEffect(() => {
    const load = async () => {
      const snap = await getDoc(doc(db, "mentalHealth", auth.currentUser.uid));
      if (snap.exists()) {
        const d = snap.data();
        setStress(d.stressLevel);
        setMotivation(d.motivationLevel);
        setNotes(d.notes || "");
      }
    };
    load();
  }, []);

  const saveCheckIn = async () => {
    await setDoc(doc(db, "mentalHealth", auth.currentUser.uid), {
      stressLevel: stress,
      motivationLevel: motivation,
      notes,
      lastCheckIn: serverTimestamp()
    });

    alert("Check-in saved. Take care of yourself.");
  };

  return (
    <div style={{ padding: 24 }}>
      <h2>Weekly Wellbeing Check</h2>

      <div style={{ marginTop: 16 }}>
        <label>Stress Level (1–5)</label><br />
        <input type="range" min="1" max="5" value={stress} onChange={e => setStress(Number(e.target.value))} />
        <span> {stress}</span>
      </div>

      <div style={{ marginTop: 16 }}>
        <label>Motivation Level (1–5)</label><br />
        <input type="range" min="1" max="5" value={motivation} onChange={e => setMotivation(Number(e.target.value))} />
        <span> {motivation}</span>
      </div>

      <div style={{ marginTop: 16 }}>
        <label>Notes</label><br />
        <textarea
          style={{ width: "100%", height: 80 }}
          value={notes}
          onChange={e => setNotes(e.target.value)}
        />
      </div>

      <button onClick={saveCheckIn} style={{ marginTop: 20 }}>
        Save Check-in
      </button>
    </div>
  );
}
