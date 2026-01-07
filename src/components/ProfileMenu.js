import { useEffect, useState } from "react";
import { auth, db } from "../firebase";
import { collection, getDocs, doc, getDoc } from "firebase/firestore";
import { signOut } from "firebase/auth";
import { useNavigate } from "react-router-dom";

export default function ProfileMenu() {
  const [open, setOpen] = useState(false);
  const [profile, setProfile] = useState(null);
  const [stats, setStats] = useState({
    questions: 0,
    answered: 0,
    likedGiven: 0,
    coins: 0
  });

  const navigate = useNavigate();

  useEffect(() => {
    const load = async () => {
      const uid = auth.currentUser.uid;

      const userSnap = await getDoc(doc(db, "users", uid));
      const me = userSnap.data();
      setProfile(me);

      const qSnap = await getDocs(collection(db, "questions"));
      const aSnap = await getDocs(collection(db, "answers"));

      const myQuestions = qSnap.docs.filter(d => d.data().askedById === uid);
      const myAnswers = aSnap.docs.filter(d => d.data().answeredById === uid);

      const uniqueAnsweredQuestions = new Set(
        myAnswers.map(a => a.data().questionId)
      );

      let likedGiven = 0;
      aSnap.docs.forEach(d => {
        const a = d.data();
        if ((a.likedBy || []).includes(uid)) likedGiven += 1;
      });

      setStats({
        questions: myQuestions.length,
        answered: uniqueAnsweredQuestions.size,
        likedGiven,
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
  const displayYear = isAlumni ? "Alumni" : `Year ${profile.year}`;

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
            padding: 14,
            borderRadius: 10,
            width: 230,
            boxShadow: "0 10px 20px rgba(0,0,0,.15)"
          }}
        >
          {/* ❌ Close Button */}
          <div
            onClick={() => setOpen(false)}
            style={{
              position: "absolute",
              top: 8,
              right: 10,
              cursor: "pointer",
              fontSize: 16,
              fontWeight: 700,
              color: "#444"
            }}
          >
            ×
          </div>

          <strong>{profile.name}</strong>
          <div style={{ fontSize: 12, color: "#555", marginBottom: 8 }}>
            {profile.branch} • {displayYear}
          </div>

          <div style={{ fontSize: 13, lineHeight: "1.6" }}>
            {profile.year === 1 && (
              <>
                📝 Questions Asked: {stats.questions}<br />
                ❤️ Likes Given: {stats.likedGiven}
              </>
            )}

            {profile.year > 1 && profile.year < 5 && (
              <>
                📝 Questions Asked: {stats.questions}<br />
                🧑‍🏫 Questions Answered: {stats.answered}<br />
                🪙 Coins: {stats.coins}
              </>
            )}

            {isAlumni && (
              <>
                🧑‍🏫 Questions Answered: {stats.answered}<br />
                🪙 Coins: {stats.coins}
              </>
            )}
          </div>

          <button
            onClick={logout}
            style={{
              marginTop: 12,
              width: "100%",
              padding: 8,
              borderRadius: 6,
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
