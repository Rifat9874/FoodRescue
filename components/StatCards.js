import Icon from "./Icon";

const ICONS = ["utensils", "list", "checkCircle", "leaf", "heart", "truck"];

// Grid of dashboard numbers: [{ label, value }]
export default function StatCards({ cards }) {
  return (
    <div className="grid-3">
      {cards.map((c, i) => (
        <div className="card stat" key={c.label}>
          <div className="stat-icon"><Icon name={ICONS[i % ICONS.length]} size={22} /></div>
          <div><strong>{c.value}</strong><span>{c.label}</span></div>
        </div>
      ))}
    </div>
  );
}
