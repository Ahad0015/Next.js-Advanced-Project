// src/lib/fetcher.js
// The one fetcher used by every query.
export async function fetcher(url) {
  const res = await fetch(url);

  if (!res.ok) {
    const error = new Error("Request failed");
    error.status = res.status;
    error.info = await res.json().catch(() => null);
    throw error; // SWR puts this in its `error` value
  }
  return res.json();
}