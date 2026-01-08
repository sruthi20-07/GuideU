import { useEffect, useState } from "react";
import { auth, db } from "../firebase";
import {
  doc,
  getDoc,
  setDoc,
  updateDoc,
  serverTimestamp
} from "firebase/firestore";

export default function DailyTasksPage() {
  const [tasks, setTasks] = useState([]);
  const [newTask, setNewTask] = useState("");
  const [streak, setStreak] = useState(0);
  const [lastCompletedDate, setLastCompletedDate] = useState(null);
  const [showPopup, setShowPopup] = useState(false);

  const uid = auth.currentUser?.uid;
  const today = new Date().toISOString().slice(0, 10);

  /* 🔹 LOAD DATA */
  useEffect(() => {
    if (!uid) return;

    const load = async () => {
      const snap = await getDoc(doc(db, "dailyTasks", uid));
      if (!snap.exists()) return;

      const data = snap.data();

      let loadedTasks = data.tasks || [];

      // 🔁 RESET TASKS IF NEW DAY
      if (data.date !== today) {
        loadedTasks = loadedTasks.map(t => ({ ...t, done: false }));
      }

      setTasks(loadedTasks);
      setStreak(data.streak || 0);
      setLastCompletedDate(data.lastCompletedDate ?? null);

      // Save reset if day changed
      if (data.date !== today) {
        await save(
          loadedTasks,
          data.streak || 0,
          data.lastCompletedDate ?? null
        );
      }
    };

    load();
  }, [uid]);

  /* 🔹 SAVE HELPER (🔥 FIXED) */
  const save = async (tasksData, streakVal, lastDate) => {
    await setDoc(doc(db, "dailyTasks", uid), {
      tasks: tasksData,
      streak: streakVal,
      lastCompletedDate: lastDate ?? null, // ✅ NEVER undefined
      date: today,
      updatedAt: serverTimestamp()
    });
  };

  /* 🔹 ADD TASK */
  const addTask = async () => {
    if (!newTask.trim()) return;

    const updated = [...tasks, { title: newTask.trim(), done: false }];
    setTasks(updated);
    setNewTask("");

    await save(updated, streak, lastCompletedDate);
  };

  /* 🔹 COMPLETE TASK (NO UNCHECK) */
  const completeTask = async (index) => {
    if (tasks[index].done) return;

    const updated = [...tasks];
    updated[index].done = true;
    setTasks(updated);

    let newStreak = streak;
    let newLastDate = lastCompletedDate;

    const allDone =
      updated.length > 0 && updated.every(t => t.done);

    // 🔥 INCREASE STREAK ONLY ONCE PER DAY
    if (allDone && lastCompletedDate !== today) {
      newStreak = streak + 1;
      newLastDate = today;

      setStreak(newStreak);
      setLastCompletedDate(today);

      // ✅ UPDATE USER PROFILE
      await updateDoc(doc(db, "users", uid), {
        dailyStreak: newStreak
      });

      // 🎉 SHOW POPUP
      setShowPopup(true);
      setTimeout(() => setShowPopup(false), 2000);
    }

    await save(updated, newStreak, newLastDate);
  };

  return (
    <div style={styles.page}>
      <div style={styles.card}>
        <h2>Daily Tasks</h2>
        <p style={styles.streak}>🔥 Streak: {streak} days</p>

        {/* ADD TASK */}
        <div style={styles.addRow}>
          <input
            style={styles.input}
            placeholder="Add task..."
            value={newTask}
            onChange={e => setNewTask(e.target.value)}
          />
          <button style={styles.addBtn} onClick={addTask}>
            Add
          </button>
        </div>

        {/* TASK LIST */}
        {tasks.map((task, i) => (
          <div key={i} style={styles.row}>
            <input
              type="checkbox"
              checked={task.done}
              disabled={task.done}
              onChange={() => completeTask(i)}
            />
            <span
              style={{
                marginLeft: 8,
                textDecoration: task.done ? "line-through" : "none"
              }}
            >
              {task.title}
            </span>
          </div>
        ))}
      </div>

      {/* 🎉 POPUP */}
      {showPopup && (
        <div style={styles.popupOverlay}>
          <div style={styles.popup}>
            🎉 You completed all tasks today!
          </div>
        </div>
      )}
    </div>
  );
}

/* 🎨 STYLES */
const styles = {
  page: {
    minHeight: "100vh",
    background: "#f3f4f6",
    display: "flex",
    justifyContent: "center",
    alignItems: "center"
  },
  card: {
    background: "#fff",
    padding: 28,
    borderRadius: 12,
    width: 420,
    boxShadow: "0 10px 25px rgba(0,0,0,0.1)"
  },
  streak: {
    color: "#ef4444",
    fontWeight: "bold"
  },
  addRow: {
    display: "flex",
    gap: 8,
    marginBottom: 10
  },
  input: {
    flex: 1,
    padding: 8,
    borderRadius: 6,
    border: "1px solid #ccc"
  },
  addBtn: {
    padding: "8px 12px",
    background: "#4f46e5",
    color: "#fff",
    border: "none",
    borderRadius: 6
  },
  row: {
    display: "flex",
    alignItems: "center",
    marginTop: 8
  },
  popupOverlay: {
    position: "fixed",
    inset: 0,
    background: "rgba(0,0,0,0.3)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center"
  },
  popup: {
    background: "#22c55e",
    color: "#fff",
    padding: "16px 24px",
    borderRadius: 10,
    fontSize: 16,
    fontWeight: 600
  }
};
