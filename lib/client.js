// Small fetch wrapper used by all pages. Throws Error(message) so the UI can show it.
export async function api(path, options = {}) {
  let response;
  try {
    response = await fetch(path, {
      credentials: "same-origin",
      ...options,
      headers: { "Content-Type": "application/json" },
      body: options.body ? JSON.stringify(options.body) : undefined,
    });
  } catch {
    throw new Error("Network error. Check your connection and try again.");
  }

  let data = {};
  try {
    data = await response.json();
  } catch {
    // empty or non-JSON body
  }
  if (!response.ok) throw new Error(data.error || "Request failed. Please try again.");
  return data;
}
