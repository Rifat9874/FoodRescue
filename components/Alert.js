import Icon from "./Icon";

const ICONS = { error: "alert", success: "checkCircle", info: "info" };

// Inline message box. type: "error" | "success" | "info"
export default function Alert({ type = "info", children, className = "" }) {
  return (
    <div
      className={`alert alert-${type} ${className}`}
      role={type === "error" ? "alert" : "status"}
    >
      <Icon name={ICONS[type]} size={18} />
      <div>{children}</div>
    </div>
  );
}
