import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { auth, db } from "../firebase";
import { query, where } from "firebase/firestore";

import {
  collection,
  onSnapshot,
  doc,
  updateDoc
} from "firebase/firestore";



export default function NotificationsPage() {
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState([]);

  /* 🔔 Load Notifications */
  useEffect(() => {
  if (!auth.currentUser) return;

  const q = query(
    collection(db, "notifications"),
    where("userId", "==", auth.currentUser.uid)
  );

  const unsubscribe = onSnapshot(
    q,
    (snap) => {
      setNotifications(
        snap.docs.map(d => ({ id: d.id, ...d.data() }))
      );
    },
    (error) => {
      console.error("Notification listener error:", error);
    }
  );

  return () => unsubscribe();
}, []);


  /* 🕒 Format Time */
  const formatTime = (ts) => {
    if (!ts) return "";
    if (ts.toDate) return ts.toDate().toLocaleString();
    if (ts.seconds) return new Date(ts.seconds * 1000).toLocaleString();
    return "";
  };

  /* 📌 Handle Click */
  const openNotification = async (n) => {
  // 1️⃣ mark as read
  await updateDoc(doc(db, "notifications", n.id), {
    isRead: true
  });

  // 2️⃣ If question notification → go to Suggest page
  if (n.type === "question") {
    navigate(`/suggest?branch=${n.branch}&question=${n.questionId}`);
    return;
  }

  // 3️⃣ If answer notification → go to Ask page
  if (n.type === "answer") {
    navigate(`/ask?branch=${n.branch}&question=${n.questionId}&answer=${n.answerId}`);
    return;
  }
};



  return (
    <div style={{ padding: 24 }}>
      <h2>🔔 Notifications</h2>

      {notifications.length === 0 && (
        <div style={{ marginTop: 20 }}>No notifications yet.</div>
      )}

      {notifications.map((n) => (
        <div
          key={n.id}
          onClick={() => openNotification(n)}
          style={{
            padding: 14,
            borderRadius: 10,
            marginTop: 12,
            cursor: "pointer",
            background: n.isRead ? "#f3f4f6" : "#e0f2fe",
            borderLeft: n.isRead
              ? "4px solid transparent"
              : "4px solid #2563eb"
          }}
        >
          <div style={{ fontWeight: 600 }}>
            {n.message}
          </div>

          <div style={{ fontSize: 12, marginTop: 4, color: "#6b7280" }}>
            {formatTime(n.createdAt)}
          </div>
        </div>
      ))}
    </div>
  );
}
