export default function QuestionCard({ question }) {
  return (
    <div className="question-card" style={{ marginBottom: 20 }}>
      <h3>{question.title}</h3>
    </div>
  );
}