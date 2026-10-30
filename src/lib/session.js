// src/lib/session.js
import { cookies } from "next/headers";
import { randomBytes } from "node:crypto";
import { getUserById } from "./users";

const COOKIE = "session";
const MAX_AGE = 60 * 60 * 8; // 8 hours

globalThis.__addisSessions ??= new Map();
const sessions = globalThis.__addisSessions;

export async function createSession(userId) {
  const sid = randomBytes(32).toString("hex"); // unguessable, new on every sign-in
  sessions.set(sid, { userId, expires: Date.now() + MAX_AGE * 1000 });

  const store = await cookies();
  store.set(COOKIE, sid, {
    httpOnly: true, // JavaScript in the page cannot read it
    secure: process.env.NODE_ENV === "production", // HTTPS only in production
    sameSite: "lax", // not sent on cross-site POSTs
    path: "/",
    maxAge: MAX_AGE,
  });
}

// Used on every server surface: pages, actions and route handlers.
export async function getSession() {
  const store = await cookies();
  const sid = store.get(COOKIE)?.value;
  if (!sid) return null;

  const record = sessions.get(sid);
  if (!record || record.expires < Date.now()) {
    sessions.delete(sid);
    return null;
  }

  const user = getUserById(record.userId);
  if (!user) return null;

  // The role comes from the server's user record, never from the cookie.
  return { userId: user.id, name: user.name, role: user.role };
}

export async function destroySession() {
  const store = await cookies();
  const sid = store.get(COOKIE)?.value;
  if (sid) sessions.delete(sid);
  store.delete(COOKIE);
}