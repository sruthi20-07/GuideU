import { useEffect, useState } from "react";
import { collection, query, orderBy, limit, onSnapshot } from "firebase/firestore";
import { db } from "../firebase";

export default function Leaderboard() {
  const [topUsers, setTopUsers] = useState([]);

  useEffect(() => {
    const q = query(
      collection(db, "users"),
      orderBy("coins", "desc"),
      limit(3)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const users = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setTopUsers(users);
    });

    return () => unsubscribe();
  }, []);

  return (
    <div style={{
      marginTop: 30,
      background: "white",
      padding: 20,
      borderRadius: 12,
      boxShadow: "0 4px 12px rgba(0,0,0,0.08)"
    }}>
      <h3 style={{ marginBottom: 12 }}>🏆 Top Contributors</h3>

      {topUsers.length === 0 && <p>No rankings yet.</p>}

      {topUsers.map((user, index) => (
        <div
          key={user.id}
          style={{
            display: "flex",
            justifyContent: "space-between",
            padding: "8px 0",
            fontWeight: index === 0 ? "600" : "500"
          }}
        >
          <span>
            {index === 0 && "🥇 "}
            {index === 1 && "🥈 "}
            {index === 2 && "🥉 "}
            {user.name}
          </span>
          <span>🪙 {user.coins || 0}</span>
        </div>
      ))}
    </div>
  );
}
