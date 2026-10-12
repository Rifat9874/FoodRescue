export function formatDate(value) {
  if (!value) return "";
  return new Date(value).toLocaleString("en-GB", { dateStyle: "medium", timeStyle: "short" });
}

// Converts a date to the "YYYY-MM-DDTHH:mm" string a datetime-local input needs.
export function toLocalInput(value) {
  const d = new Date(value);
  const shifted = new Date(d.getTime() - d.getTimezoneOffset() * 60000);
  return shifted.toISOString().slice(0, 16);
}

// Human friendly "time remaining" for an expiry date, e.g. { text: "Expires in 3h", urgent: false }.
export function timeLeft(value) {
  const ms = new Date(value).getTime() - Date.now();
  if (Number.isNaN(ms)) return { text: "", urgent: false };
  if (ms <= 0) return { text: "Expired", urgent: true };
  const minutes = Math.floor(ms / 60000);
  if (minutes < 60) return { text: `Expires in ${Math.max(minutes, 1)}m`, urgent: true };
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return { text: `Expires in ${hours}h`, urgent: hours < 3 };
  return { text: `Expires in ${Math.floor(hours / 24)}d`, urgent: false };
}
