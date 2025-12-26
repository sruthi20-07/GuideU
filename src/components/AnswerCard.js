export default function AnswerCard({ answer }) {
  return (
    <div className="answer-card">
      <p>{answer.content}</p>
      <small>By {answer.role} (Year {answer.year})</small>
    </div>
  );
}
