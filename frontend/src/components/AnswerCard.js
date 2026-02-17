import React from "react";
import { handleVote } from "../utils/voteUtils";

export default function AnswerCard({ answer }) {
  return (
    <div
      className="answer-card"
      style={{
        border: "1px solid #ddd",
        padding: 10,
        marginBottom: 10,
        borderRadius: 8
      }}
    >
      <p>{answer.content}</p>

      <div style={{ marginTop: 10 }}>
        <button
          onClick={() => handleVote(answer.id, "useful")}
          style={{ marginRight: 10 }}
        >
          👍 {answer.usefulCount ?? 0}
        </button>

        <button onClick={() => handleVote(answer.id, "notUseful")}>
          👎 {answer.notUsefulCount ?? 0}
        </button>
      </div>
    </div>
  );
}
