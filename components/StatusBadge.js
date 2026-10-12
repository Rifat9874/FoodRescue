const COLORS = {
  AVAILABLE: "badge-green",
  APPROVED: "badge-green",
  COMPLETED: "badge-green",
  ACTIVE: "badge-green",
  RESERVED: "badge-yellow",
  PENDING: "badge-yellow",
  ASSIGNED: "badge-blue",
  IN_TRANSIT: "badge-blue",
  PICKED_UP: "badge-blue",
  EXPIRED: "badge-red",
  CANCELLED: "badge-red",
  REJECTED: "badge-red",
  SUSPENDED: "badge-red",
};

export default function StatusBadge({ status }) {
  return <span className={`badge ${COLORS[status] || ""}`}>{status.replaceAll("_", " ")}</span>;
}
