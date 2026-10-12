import Icon from "./Icon";
import { DEMO_ACCOUNTS, DEMO_ENABLED } from "@/lib/demo";

// One-click demo logins (one per role) shown under the login form.
export default function DemoAccounts({ onSelect, disabled }) {
  if (!DEMO_ENABLED) return null;
  return (
    <section className="demo" aria-labelledby="demo-title">
      <div className="demo-head">
        <h2 id="demo-title">Try a demo account</h2>
        <p className="muted small">Sign in with one click to explore FoodRescue as each type of user.</p>
      </div>
      <div className="demo-grid">
        {DEMO_ACCOUNTS.map((a) => (
          <button key={a.role} type="button" className="demo-card" disabled={disabled} onClick={() => onSelect(a)}>
            <span className="stat-icon"><Icon name={a.icon} size={18} /></span>
            <span>
              <strong>{a.title}</strong>
              <small>{a.text}</small>
            </span>
          </button>
        ))}
      </div>
    </section>
  );
}
