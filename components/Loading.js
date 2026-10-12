// Loading indicators: a spinner for pages and shimmering skeletons for card grids.
export function Spinner({ label = "Loading…" }) {
  return (
    <div className="state" role="status" aria-live="polite">
      <div className="spinner" />
      {label}
    </div>
  );
}

export function CardSkeletons({ count = 3 }) {
  return (
    <div className="grid" aria-busy="true" aria-label="Loading">
      {Array.from({ length: count }, (_, i) => (
        <div key={i} className="skeleton skeleton-card" />
      ))}
    </div>
  );
}
