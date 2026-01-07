import { useEffect, useState } from "react";
import { auth, db } from "../firebase";
import { collection, getDocs, doc, getDoc } from "firebase/firestore";
import { signOut } from "firebase/auth";
import { useNavigate } from "react-router-dom";

export default function ProfileMenu() {
  const [open, setOpen] = useState(false);
  const [profile, setProfile] = useState(null);
  const [dailyStreak, setDailyStreak] = useState(0);
  const [stats, setStats] = useState({
    questions: 0,
    answered: 0,
    coins: 0
  });

  const navigate = useNavigate();

  useEffect(() => {
    const load = async () => {
      const uid = auth.currentUser.uid;

      const userSnap = await getDoc(doc(db, "users", uid));
      const me = userSnap.data();
      setProfile(me);
      setDailyStreak(me.dailyStreak || 0);

      const qSnap = await getDocs(collection(db, "questions"));
      const aSnap = await getDocs(collection(db, "answers"));

      const myQuestions = qSnap.docs.filter(d => d.data().askedById === uid);
      const myAnswers = aSnap.docs.filter(d => d.data().answeredById === uid);

      const uniqueAnsweredQuestions = new Set(
        myAnswers.map(a => a.data().questionId)
      );

      setStats({
        questions: myQuestions.length,
        answered: uniqueAnsweredQuestions.size,
        coins: uniqueAnsweredQuestions.size
      });
    };

    load();
  }, []);

  const logout = async () => {
    await signOut(auth);
    navigate("/");
  };

  if (!profile) return null;

  const isAlumni = profile.year === 5 || profile.year === "alumni";
  const displayYear = isAlumni ? "🎓 Alumni" : `Year ${profile.year}`;

  return (
    <div style={{ position: "absolute", top: 15, right: 15, zIndex: 100 }}>
      <div
        onClick={() => setOpen(true)}
        style={{
          width: 42,
          height: 42,
          borderRadius: "50%",
          background: "#2563eb",
          color: "white",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          cursor: "pointer",
          fontWeight: 600
        }}
      >
        {profile.name?.[0]?.toUpperCase()}
      </div>

      {open && (
        <div
          style={{
            position: "absolute",
            right: 0,
            top: 50,
            background: "white",
            padding: 16,
            borderRadius: 12,
            width: 240,
            boxShadow: "0 10px 20px rgba(0,0,0,.15)"
          }}
        >
          {/* ❌ CLOSE BUTTON */}
          <div
            onClick={() => setOpen(false)}
            style={{
              position: "absolute",
              top: 8,
              right: 10,
              cursor: "pointer",
              fontSize: 18,
              fontWeight: 700,
              color: "#444"
            }}
          >
            ×
          </div>

          <strong>{profile.name}</strong>
          <div style={{ fontSize: 12, color: "#555", marginBottom: 10 }}>
            {profile.branch} • {displayYear}
          </div>

          <div style={{ fontSize: 13, lineHeight: "1.6" }}>

            {/* 1st Year */}
            {profile.year === 1 && (
              <>
                📝 Questions Asked: {stats.questions}<br />
                🔥 Daily Streak: {dailyStreak} days
              </>
            )}

            {/* 2nd–4th Year */}
            {profile.year > 1 && profile.year < 5 && (
              <>
                📝 Questions Asked: {stats.questions}<br />
                🪙 Coins: {stats.coins}<br />
                🔥 Daily Streak: {dailyStreak} days
              </>
            )}

            {/* Alumni */}
            {isAlumni && (
              <>
                🪙 Coins: {stats.coins}
              </>
            )}

          </div>

          <button
            onClick={logout}
            style={{
              marginTop: 14,
              width: "100%",
              padding: 9,
              borderRadius: 8,
              background: "#ef4444",
              color: "white",
              border: "none",
              cursor: "pointer",
              fontWeight: 600
            }}
          >
            Logout
          </button>
        </div>
      )}
    </div>
  );
}
