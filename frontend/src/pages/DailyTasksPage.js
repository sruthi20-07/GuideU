import { useEffect, useState } from "react";
import { auth, db } from "../firebase";
import { doc, getDoc, setDoc, serverTimestamp } from "firebase/firestore";

export default function DailyTasksPage() {
  const [allTasks, setAllTasks] = useState([]);
  const [selected, setSelected] = useState([]);
  const [newTask, setNewTask] = useState("");
  const [started, setStarted] = useState(false);
  const [streak, setStreak] = useState(0);

  const uid = auth.currentUser?.uid;
  const today = new Date().toISOString().slice(0, 10);

  // 🔹 Load data
  useEffect(() => {
    if (!uid) return;

    const load = async () => {
      const snap = await getDoc(doc(db, "dailyTasks", uid));
      if (snap.exists()) {
        const data = snap.data();
        setAllTasks(data.tasks || []);
        setSelected(data.selected || []);
        setStarted(data.started || false);
        setStreak(data.streak || 0);
      }
    };

    load();
  }, [uid]);

  // 🔹 Add task manually
  const addTask = async () => {
    if (!newTask.trim()) return;

    const updated = [...allTasks, { title: newTask.trim(), done: false }];
    setAllTasks(updated);
    setNewTask("");

    await setDoc(doc(db, "dailyTasks", uid), {
      tasks: updated,
      selected,
      started,
      streak,
      date: today,
      updatedAt: serverTimestamp()
    });
  };

  // 🔹 Delete task
  const deleteTask = async (title) => {
    const updated = allTasks.filter(t => t.title !== title);
    setAllTasks(updated);
    setSelected(selected.filter(t => t !== title));

    await setDoc(doc(db, "dailyTasks", uid), {
      tasks: updated,
      selected: selected.filter(t => t !== title),
      started,
      streak,
      date: today,
      updatedAt: serverTimestamp()
    });
  };

  // 🔹 Select for today
  const toggleSelect = (title) => {
    setSelected(
      selected.includes(title)
        ? selected.filter(t => t !== title)
        : [...selected, title]
    );
  };

  // 🔹 Start day
  const startDay = async () => {
    setStarted(true);

    await setDoc(doc(db, "dailyTasks", uid), {
      tasks: allTasks,
      selected,
      started: true,
      streak,
      date: today,
      updatedAt: serverTimestamp()
    });
  };

  // 🔹 Complete task
  const toggleTask = async (index) => {
    const updated = [...allTasks];
    updated[index].done = !updated[index].done;
    setAllTasks(updated);

    let newStreak = streak;

    const selectedTasks = updated.filter(t => selected.includes(t.title));
    if (selectedTasks.length > 0 && selectedTasks.every(t => t.done)) {
      newStreak = streak + 1;
      setStreak(newStreak);
    }

    await setDoc(doc(db, "dailyTasks", uid), {
      tasks: updated,
      selected,
      started,
      streak: newStreak,
      date: today,
      updatedAt: serverTimestamp()
    });
  };

  return (
    <div style={styles.page}>
      <div style={styles.card}>
        <h2>Daily Tasks</h2>
        <p style={styles.streak}>🔥 Streak: {streak} days</p>

        {/* Add task */}
        <div style={styles.addRow}>
          <input
            style={styles.input}
            placeholder="Add what you want to do..."
            value={newTask}
            onChange={e => setNewTask(e.target.value)}
          />
          <button style={styles.addBtn} onClick={addTask}>Add</button>
        </div>

        {/* Task list */}
        {allTasks.map((task, i) => (
          <div key={i} style={styles.row}>
            <input
              type="checkbox"
              disabled={started}
              checked={selected.includes(task.title)}
              onChange={() => toggleSelect(task.title)}
            />
            <span style={{ marginLeft: 8 }}>{task.title}</span>
            <button
              style={styles.deleteBtn}
              onClick={() => deleteTask(task.title)}
            >
              ✕
            </button>
          </div>
        ))}

        {!started && (
          <button
            style={styles.startBtn}
            disabled={selected.length === 0}
            onClick={startDay}
          >
            Start Day
          </button>
        )}

        {/* Today's tasks */}
        {started && (
          <>
            <p>
              {
                allTasks.filter(
                  t => selected.includes(t.title) && t.done
                ).length
              } / {selected.length} completed
            </p>

            {allTasks
              .filter(t => selected.includes(t.title))
              .map((task, i) => (
                <div key={i} style={styles.row}>
                  <input
                    type="checkbox"
                    checked={task.done}
                    onChange={() => toggleTask(allTasks.indexOf(task))}
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

            {selected.length > 0 &&
              allTasks
                .filter(t => selected.includes(t.title))
                .every(t => t.done) && (
                <div style={styles.doneBox}>
                  🎉 All selected tasks completed! Streak increased!
                </div>
              )}
          </>
        )}
      </div>
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
    width: 440,
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
  deleteBtn: {
    marginLeft: "auto",
    background: "none",
    border: "none",
    color: "red",
    cursor: "pointer"
  },
  startBtn: {
    marginTop: 15,
    width: "100%",
    padding: 10,
    background: "#22c55e",
    color: "#fff",
    border: "none",
    borderRadius: 6
  },
  doneBox: {
    marginTop: 15,
    padding: 10,
    background: "#ecfdf5",
    borderRadius: 6,
    color: "#065f46",
    fontWeight: "bold"
  }
};