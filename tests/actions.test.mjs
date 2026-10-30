// The server actions, called directly: signed out, as someone else, with smuggled fields,
// with bad input, and with a crafted next. Run with:  npm run test:actions
import assert from "node:assert/strict";
import { signIn, placeOrder, cancelOrder } from "@/app/actions";
import { orders } from "@/lib/db";
import { jar } from "../tests/stubs/headers.js";

let passed = 0;
const test = async (name, fn) => { await fn(); passed++; console.log("  ok  " + name); };
const form = (o) => { const f = new FormData(); for (const [k, v] of Object.entries(o)) f.set(k, v); return f; };

async function login(email, password, next = "/") {
  jar.request = null; jar.lastSet = undefined;
  try { return { state: await signIn({ message: "", email: "" }, form({ email, password, next })) }; }
  catch (e) { if (e.message !== "NEXT_REDIRECT") throw e; return { redirect: e.url, sid: jar.lastSet }; }
}
const as = (sid) => { jar.request = sid; };
// A successful placeOrder ends with redirect() (it throws, like the real one); an unsuccessful one returns errors.
async function place(fields) {
  try { return await placeOrder(null, form(fields)); }
  catch (e) { if (e.message !== "NEXT_REDIRECT") throw e; return { ok: true, redirect: e.url }; }
}

const hana = await login("hana@example.com", "hana-pass-123");
const dawit = await login("dawit@example.com", "dawit-pass-123");
const details = { name: "Hana T", phone: "0911223344", address: "Bole Road 12", neighbourhood: "Bole" };
const cart = (lines) => JSON.stringify(lines);
const fresh = () => orders[orders.length - 1];

console.log("signed out");
await test("placeOrder is refused", async () => {
  as(null);
  const r = await place({ ...details, dishId: "1", quantity: "1" });
  assert.equal(r.ok, false); assert.match(r.message, /sign in/i); assert.equal(orders.length, 0);
});
await test("cancelOrder is refused", async () => { as(null); const r = await cancelOrder("x"); assert.equal(r.ok, false); });
await test("a forged cookie is refused", async () => {
  as("forged-value");
  const r = await place({ ...details, dishId: "1", quantity: "1" });
  assert.equal(r.ok, false); assert.equal(orders.length, 0);
});

console.log("placing orders");
await test("one dish: the server prices it and ignores smuggled fields", async () => {
  as(hana.sid);
  const r = await place({ ...details, dishId: "1", quantity: "2", userId: "someone-else", status: "delivered", total: "1", unitPrice: "1" });
  assert.equal(r.ok, true);
  const o = fresh();
  assert.equal(r.redirect, `/checkout/success?ids=${o.id}`); // goes to the confirmation page
  assert.equal(o.total, 700); assert.equal(o.unitPrice, 350);
  assert.equal(o.status, "placed"); assert.notEqual(o.userId, "someone-else");
  assert.equal(o.neighbourhood, "Bole");
});
await test("a cart with two dishes saves two orders", async () => {
  as(hana.sid); const before = orders.length;
  const r = await place({ ...details, items: cart([{ id: "2", qty: 1 }, { id: "3", qty: 3 }]) });
  assert.equal(r.ok, true); assert.equal(orders.length, before + 2);
});
await test("one bad line saves nothing (all or nothing)", async () => {
  as(hana.sid); const before = orders.length;
  const r = await place({ ...details, items: cart([{ id: "2", qty: 1 }, { id: "999", qty: 1 }]) });
  assert.equal(r.ok, false); assert.ok(r.fieldErrors.items); assert.equal(orders.length, before);
});
await test("every problem is reported at once, even with no dish chosen", async () => {
  as(hana.sid);
  const r = await place({ name: "H", phone: "abc", address: "x", neighbourhood: "" });
  for (const k of ["name", "phone", "address", "neighbourhood", "items"]) assert.ok(r.fieldErrors[k], "missing error for " + k);
  assert.equal(r.values.name, "H"); // what was typed comes back
});
await test("quantity 0 and quantity 99 are rejected", async () => {
  as(hana.sid);
  for (const q of ["0", "99"]) assert.equal((await place({ ...details, dishId: "1", quantity: q })).ok, false);
});
await test("a neighbourhood outside the delivery list is rejected", async () => {
  as(hana.sid);
  assert.equal((await place({ ...details, neighbourhood: "Mars", dishId: "1", quantity: "1" })).ok, false);
});

console.log("cancelling");
await test("someone else's order cannot be cancelled", async () => {
  as(hana.sid); await place({ ...details, dishId: "4", quantity: "1" }); const o = fresh();
  as(dawit.sid);
  const r = await cancelOrder(o.id);
  assert.equal(r.ok, false); assert.equal(o.status, "placed");
});
await test("the owner can cancel, once", async () => {
  const o = fresh(); as(hana.sid);
  assert.equal((await cancelOrder(o.id)).ok, true); assert.equal(o.status, "cancelled");
  assert.equal((await cancelOrder(o.id)).ok, false);
});
await test("a delivered order cannot be cancelled (the rule lives in the action)", async () => {
  as(hana.sid); await place({ ...details, dishId: "5", quantity: "1" }); const o = fresh();
  o.createdAt = new Date(Date.now() - 120000).toISOString(); // two minutes ago: delivered
  const r = await cancelOrder(o.id); assert.equal(r.ok, false); assert.notEqual(o.status, "cancelled");
});
await test("an unknown order id is refused", async () => { as(hana.sid); assert.equal((await cancelOrder("nope")).ok, false); });

console.log("signing in");
await test("staff land on the dashboard by default; customers on the home page", async () => {
  assert.equal((await login("kitchen@example.com", "kitchen-pass-123")).redirect, "/dashboard");
  assert.equal((await login("kitchen@example.com", "kitchen-pass-123", "/kitchen")).redirect, "/kitchen");
  assert.equal((await login("hana@example.com", "hana-pass-123")).redirect, "/");
});
await test("a crafted next never leaves the site", async () => {
  for (const evil of ["https://evil.example", "//evil.example", "/\\evil.example", "javascript:alert(1)"]) {
    assert.equal((await login("hana@example.com", "hana-pass-123", evil)).redirect, "/");
  }
  assert.equal((await login("hana@example.com", "hana-pass-123", "/orders")).redirect, "/orders");
});
await test("wrong password and unknown email give the same message", async () => {
  const a = (await login("hana@example.com", "nope")).state.message;
  const b = (await login("nobody@example.com", "nope")).state.message;
  assert.equal(a, b); assert.ok(a);
});

console.log(`\n${passed} checks passed`);
