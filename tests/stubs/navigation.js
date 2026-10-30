// Test doubles: redirect() and notFound() throw, exactly like the real ones do.
export function redirect(url) { const e = new Error("NEXT_REDIRECT"); e.url = url; throw e; }
export function notFound() { throw new Error("NEXT_NOT_FOUND"); }
