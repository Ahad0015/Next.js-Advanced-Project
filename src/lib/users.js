// src/lib/users.js
import { scryptSync, randomBytes, timingSafeEqual } from "node:crypto";

const hash = (password, salt) => scryptSync(password, salt, 32);

function makeUser(id, name, email, password, role) {
  const salt = randomBytes(16);
  return { id, name, email, role, salt, hash: hash(password, salt) };
}

globalThis.__addisUsers ??= [
  makeUser("u1", "Hana", "hana@example.com", "hana-pass-123", "customer"),
  makeUser("u2", "Dawit", "dawit@example.com", "dawit-pass-123", "customer"),
  makeUser("u3", "Chef Sara", "kitchen@example.com", "kitchen-pass-123", "staff"),
];
export const users = globalThis.__addisUsers;

export function getUserById(id) {
  return users.find((u) => u.id === id) ?? null;
}

export function verifyUser(email, password) {
  const user = users.find((u) => u.email === email);
  if (!user) {
    hash(password, Buffer.alloc(16)); // same work either way, so timing doesn't reveal which emails exist
    return null;
  }
  return timingSafeEqual(hash(password, user.salt), user.hash) ? user : null;
}