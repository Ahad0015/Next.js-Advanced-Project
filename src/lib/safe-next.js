// src/lib/safe-next.js
export function safeNext(value, fallback = "/") {
  if (typeof value !== "string" || !value.startsWith("/")) return fallback;
  if (value.startsWith("//") || value.includes("\\")) return fallback;

  try {
    // Final guard: it must stay on our own origin.
    const url = new URL(value, "http://localhost");
    if (url.origin !== "http://localhost") return fallback;
  } catch {
    return fallback;
  }
  return value;
}