export default function QuestionCard({ question, onSelect }) {
  return (
    <div className="question-card" onClick={() => onSelect(question)}>
      <h4>{question.title}</h4>
      <p>{question.description}</p>
    </div>
  );
}
