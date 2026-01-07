export default function ResourceTabs({ resources, onSelect }) {
  return (
    <div>
      {resources.map((r, i) => (
        <div key={i} className="resource-card" onClick={() => onSelect(r)}>
          <h4>{r.title}</h4>
          <p>{r.description}</p>
        </div>
      ))}
    </div>
  );
}
