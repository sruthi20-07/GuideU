import { db, auth } from "../firebase";
import {
  doc,
  updateDoc,
  increment,
  setDoc,
  getDoc,
  serverTimestamp
} from "firebase/firestore";

export const handleVote = async (answer, type) => {
  try {
    const currentUser = auth.currentUser;

    if (!currentUser) {
      alert("Login required");
      return;
    }

    const voterId = currentUser.uid;
    const ownerId = answer.answeredById;

    // ❌ Prevent self voting
    if (voterId === ownerId) {
      alert("You cannot vote your own answer");
      return;
    }

    const voteId = `${answer.id}_${voterId}`;
    const voteRef = doc(db, "answerVotes", voteId);
    const voteSnap = await getDoc(voteRef);

    const answerRef = doc(db, "answers", answer.id);
    const ownerRef = doc(db, "users", ownerId);

    // -------------------------------
    // CASE 1: First time voting
    // -------------------------------
    if (!voteSnap.exists()) {

      // Update answer count
      await updateDoc(answerRef, {
        [type === "useful" ? "usefulCount" : "notUsefulCount"]:
          increment(1)
      });

      // Save vote
      await setDoc(voteRef, {
        answerId: answer.id,
        userId: voterId,
        type: type,
        createdAt: serverTimestamp()
      });

      // If useful → give coin
      if (type === "useful") {
        await updateDoc(ownerRef, {
          coins: increment(1),
          totalUsefulReceived: increment(1)
        });
      }

      return;
    }

    // -------------------------------
    // CASE 2: Vote exists
    // -------------------------------
    const previousType = voteSnap.data().type;

    // If same vote clicked again → do nothing
    if (previousType === type) {
      alert("You already selected this option");
      return;
    }

    // If switching vote (like → dislike or vice versa)

    // Remove previous vote count
    await updateDoc(answerRef, {
      [previousType === "useful" ? "usefulCount" : "notUsefulCount"]:
        increment(-1)
    });

    // Add new vote count
    await updateDoc(answerRef, {
      [type === "useful" ? "usefulCount" : "notUsefulCount"]:
        increment(1)
    });

    // Update vote document
    await updateDoc(voteRef, {
      type: type
    });

    // Adjust coins if switching
    if (previousType === "useful" && type === "notUseful") {
      await updateDoc(ownerRef, {
        coins: increment(-1),
        totalUsefulReceived: increment(-1)
      });
    }

    if (previousType === "notUseful" && type === "useful") {
      await updateDoc(ownerRef, {
        coins: increment(1),
        totalUsefulReceived: increment(1)
      });
    }

  } catch (error) {
    console.error("Vote error:", error);
  }
};
