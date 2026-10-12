import Icon from "./Icon";
import { CATEGORY_INFO } from "@/lib/constants";

// Clickable category chips with live counts. `selected` = "" means all categories.
export default function CategoryBrowser({ categories, selected, onSelect }) {
  const total = categories.reduce((sum, c) => sum + c.count, 0);
  const items = [{ name: "", label: "All food", icon: "grid", count: total }].concat(
    categories.map((c) => ({ name: c.name, label: c.name, icon: CATEGORY_INFO[c.name]?.icon || "box", count: c.count }))
  );
  return (
    <div className="category-bar" role="group" aria-label="Food categories">
      {items.map((c) => (
        <button
          key={c.label}
          type="button"
          className="category-chip"
          aria-pressed={selected === c.name}
          onClick={() => onSelect(c.name)}
        >
          <Icon name={c.icon} size={18} />
          <span>{c.label}</span>
          <em>{c.count}</em>
        </button>
      ))}
    </div>
  );
}
