import Icon from "./Icon";

const POINTS = [
  "Post or request surplus food in minutes",
  "Verified donors and NGOs only",
  "Every pickup tracked from request to hand-over",
];

// Decorative panel shown beside the login and register forms.
export default function AuthSide({ title, text }) {
  return (
    <aside className="auth-side">
      <h2>{title}</h2>
      <p>{text}</p>
      <ul>
        {POINTS.map((p) => (
          <li key={p}><Icon name="checkCircle" size={20} />{p}</li>
        ))}
      </ul>
    </aside>
  );
}
