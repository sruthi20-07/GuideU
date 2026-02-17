import { useEffect, useState } from "react";
import { db, auth } from "../firebase";
import {
  collection,
  addDoc,
  onSnapshot,
  serverTimestamp,
  doc,
  getDoc,
  updateDoc,
  arrayUnion,
  arrayRemove
} from "firebase/firestore";

export default function AlumniExperiencePage() {
  const [experiences, setExperiences] = useState([]);
  const [text, setText] = useState("");
  const [isAlumni, setIsAlumni] = useState(false);
  const [loading, setLoading] = useState(true);
  const [commentText, setCommentText] = useState({});
  const [commentsMap, setCommentsMap] = useState({});
  const uid = auth.currentUser?.uid;

  /* 🔄 Load Experiences + Comments (Stable Version) */
  useEffect(() => {
    const unsub = onSnapshot(
      collection(db, "alumniExperiences"),
      (snap) => {
        const expData = snap.docs.map(d => ({
          id: d.id,
          ...d.data()
        }));

        setExperiences(expData);

        expData.forEach(exp => {
          const commentRef = collection(
            db,
            "alumniExperiences",
            exp.id,
            "comments"
          );

          onSnapshot(commentRef, (commentSnap) => {
            setCommentsMap(prev => ({
              ...prev,
              [exp.id]: commentSnap.docs
                .map(c => ({
                  id: c.id,
                  ...c.data()
                }))
                .sort((a, b) =>
                  (b.createdAt?.seconds || 0) -
                  (a.createdAt?.seconds || 0)
                )
            }));
          });
        });
      }
    );

    return () => unsub();
  }, []);

  /* 🔐 Check Alumni Role */
  useEffect(() => {
    const checkRole = async () => {
      const user = auth.currentUser;
      if (!user) return;

      const userDoc = await getDoc(doc(db, "users", user.uid));
      if (userDoc.exists()) {
        const year = String(userDoc.data().year).toLowerCase();
        if (year.includes("alumni") || year.includes("5")) {
          setIsAlumni(true);
        }
      }

      setLoading(false);
    };

    checkRole();
  }, []);

  /* 📝 Submit Experience */
  const submitExperience = async () => {
    if (!text.trim()) return;

    const user = auth.currentUser;
    const userDoc = await getDoc(doc(db, "users", user.uid));
    const userData = userDoc.data();

    await addDoc(collection(db, "alumniExperiences"), {
      content: text,
      createdAt: serverTimestamp(),
      userId: user.uid,
      name: userData?.name || "Alumni",
      branch: userData?.branch || "",
      likes: 0,
      dislikes: 0,
      likedBy: [],
      dislikedBy: []
    });

    setText("");
  };

  /* 👍 Like Experience */
  const toggleLike = async (exp) => {
    const ref = doc(db, "alumniExperiences", exp.id);

    const liked = exp.likedBy?.includes(uid);
    const disliked = exp.dislikedBy?.includes(uid);

    await updateDoc(ref, {
      likes: liked ? (exp.likes || 0) - 1 : (exp.likes || 0) + 1,
      dislikes: disliked ? (exp.dislikes || 0) - 1 : exp.dislikes || 0,
      likedBy: liked ? arrayRemove(uid) : arrayUnion(uid),
      dislikedBy: disliked ? arrayRemove(uid) : exp.dislikedBy || []
    });
  };

  /* 👎 Dislike Experience */
  const toggleDislike = async (exp) => {
    const ref = doc(db, "alumniExperiences", exp.id);

    const disliked = exp.dislikedBy?.includes(uid);
    const liked = exp.likedBy?.includes(uid);

    await updateDoc(ref, {
      dislikes: disliked ? (exp.dislikes || 0) - 1 : (exp.dislikes || 0) + 1,
      likes: liked ? (exp.likes || 0) - 1 : exp.likes || 0,
      dislikedBy: disliked ? arrayRemove(uid) : arrayUnion(uid),
      likedBy: liked ? arrayRemove(uid) : exp.likedBy || []
    });
  };

  /* 💬 Add Comment */
  const addComment = async (expId) => {
    if (!commentText[expId]?.trim()) return;

    const userDoc = await getDoc(doc(db, "users", uid));
    const name = userDoc.data()?.name || "User";

    await addDoc(
      collection(db, "alumniExperiences", expId, "comments"),
      {
        text: commentText[expId],
        userId: uid,
        name,
        likes: 0,
        likedBy: [],
        createdAt: serverTimestamp()
      }
    );

    setCommentText(prev => ({ ...prev, [expId]: "" }));
  };

  /* ❤️ Like Comment */
  const likeComment = async (expId, comment) => {
    const ref = doc(
      db,
      "alumniExperiences",
      expId,
      "comments",
      comment.id
    );

    const liked = comment.likedBy?.includes(uid);

    await updateDoc(ref, {
      likes: liked ? (comment.likes || 0) - 1 : (comment.likes || 0) + 1,
      likedBy: liked ? arrayRemove(uid) : arrayUnion(uid)
    });
  };

  if (loading) return <div style={{ padding: 30 }}>Loading...</div>;

  return (
    <div style={{ padding: 20 }}>
      <h2>🎓 Alumni Experiences</h2>

      {isAlumni && (
        <div style={styles.postBox}>
          <textarea
            placeholder="Share your journey..."
            value={text}
            onChange={e => setText(e.target.value)}
            style={styles.textarea}
          />
          <button onClick={submitExperience} style={styles.button}>
            Post
          </button>
        </div>
      )}

      {experiences.map(exp => (
        <div key={exp.id} style={styles.card}>
          <div style={{ fontWeight: 600 }}>
            🎓 {exp.name}
          </div>
          <div style={{ fontSize: 13, color: "#666" }}>
            {exp.branch} • Alumni
          </div>

          <p>{exp.content}</p>

          {/* 👍👎 */}
          <div style={{ marginBottom: 10 }}>
            <button onClick={() => toggleLike(exp)}>
              👍 {exp.likes || 0}
            </button>
            <button onClick={() => toggleDislike(exp)}>
              👎 {exp.dislikes || 0}
            </button>
          </div>

          {/* 💬 Comment Box */}
          <textarea
            placeholder="Add comment..."
            value={commentText[exp.id] || ""}
            onChange={e =>
              setCommentText(prev => ({
                ...prev,
                [exp.id]: e.target.value
              }))
            }
            style={styles.commentBox}
          />
          <button onClick={() => addComment(exp.id)}>
            Comment
          </button>

          {/* 💬 Comments */}
          {commentsMap[exp.id]?.map(comment => (
            <div key={comment.id} style={styles.comment}>
              <b>{comment.name}</b>
              <div>{comment.text}</div>

              <button
                onClick={() => likeComment(exp.id, comment)}
                style={{
                  background: "transparent",
                  border: "none",
                  cursor: "pointer",
                  color: comment.likedBy?.includes(uid)
                    ? "#ef4444"
                    : "#555"
                }}
              >
                ❤️ {comment.likes || 0}
              </button>
            </div>
          ))}
        </div>
      ))}
    </div>
  );
}

const styles = {
  postBox: {
    background: "#ecfeff",
    padding: 15,
    borderRadius: 10,
    marginBottom: 20
  },
  textarea: {
    width: "100%",
    height: 80,
    marginBottom: 10
  },
  button: {
    background: "#2563eb",
    color: "white",
    padding: "6px 12px",
    border: "none",
    borderRadius: 6,
    cursor: "pointer"
  },
  card: {
    background: "white",
    padding: 15,
    marginBottom: 15,
    borderRadius: 10,
    boxShadow: "0 3px 8px rgba(0,0,0,0.05)"
  },
  commentBox: {
    width: "100%",
    marginTop: 8
  },
  comment: {
    background: "#f3f4f6",
    padding: 8,
    borderRadius: 6,
    marginTop: 6
  }
};
