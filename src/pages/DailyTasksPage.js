import { useEffect, useState } from "react";
import { auth, db } from "../firebase";
import { doc, getDoc, setDoc, serverTimestamp } from "firebase/firestore";

export default function DailyTasksPage() {
  const [tasks, setTasks] = useState([]);
  const [streak, setStreak] = useState(0);
  const today = new Date().toISOString().slice(0, 10);

  useEffect(() => {
    const load = async () => {
      const snap = await getDoc(doc(db, "dailyTasks", auth.currentUser.uid));

      if (snap.exists() && snap.data().date === today) {
        setTasks(snap.data().tasks);
      } else {
        generateTasks();
      }

      const prog = await getDoc(doc(db, "progress", auth.currentUser.uid));
      if (prog.exists()) setStreak(prog.data().currentStreak || 0);
    };
    load();
  }, []);

  const generateTasks = async () => {
    const base = [
      "Solve 1 DSA problem",
      "Watch 1 system design video",
      "Practice 1 coding question",
      "Read 10 pages of tech blog"
    ];

    const newTasks = base.map(t => ({ title: t, done: false }));

    await setDoc(doc(db, "dailyTasks", auth.currentUser.uid), {
      date: today,
      tasks: newTasks,
      createdAt: serverTimestamp()
    });

    setTasks(newTasks);
  };

  const toggleTask = async (index) => {
    const updated = [...tasks];
    updated[index].done = !updated[index].done;
    setTasks(updated);

    await setDoc(doc(db, "dailyTasks", auth.currentUser.uid), {
      date: today,
      tasks: updated,
      createdAt: serverTimestamp()
    });

    if (updated.every(t => t.done)) {
      const newStreak = streak + 1;
      setStreak(newStreak);

      await setDoc(doc(db, "progress", auth.currentUser.uid), {
        currentStreak: newStreak,
        lastUpdated: serverTimestamp()
      }, { merge: true });
    }
  };

  return (
    <div style={{ padding: 24 }}>
      <h2>Daily Micro Tasks</h2>
      <p>🔥 Current Streak: {streak} days</p>

      {tasks.map((task, i) => (
        <div key={i} style={{ marginTop: 10 }}>
          <input type="checkbox" checked={task.done} onChange={() => toggleTask(i)} />
          <span style={{ marginLeft: 8 }}>{task.title}</span>
        </div>
      ))}
    </div>
  );
}
