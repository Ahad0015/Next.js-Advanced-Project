
const BASE = process.env.BASE ?? "http://localhost:3000";
let failed = 0;
const say = (ok, text) => { if (!ok) failed++; console.log(`  ${ok ? "STOPPED " : "NOT STOPPED"}  ${text}`); };

const unesc = (s) => s.replace(/&quot;/g, '"').replace(/&amp;/g, "&").replace(/&#x27;/g, "'");
const req = (path, init = {}) => fetch(BASE + path, { redirect: "manual", ...init });

async function hiddenFields(path) {
  const html = await (await req(path)).text();
  const form = html.match(/<form[\s\S]*?<\/form>/)?.[0] ?? "";
  return [...form.matchAll(/<input([^>]*type="hidden"[^>]*)>/g)].map((m) => [
    unesc(m[1].match(/name="([^"]*)"/)?.[1] ?? ""), unesc(m[1].match(/value="([^"]*)"/)?.[1] ?? "")]);
}
// Sign in the way a browser without JavaScript does: a plain multipart form post.
async function signIn(email, password, next = "/") {
  const fd = new FormData();
  (await hiddenFields("/signin")).filter(([k]) => k !== "next").forEach(([k, v]) => fd.append(k, v));
  fd.append("next", next); fd.append("email", email); fd.append("password", password);
  const res = await req("/signin", { method: "POST", body: fd });
  const cookie = (res.headers.getSetCookie?.() ?? []).find((c) => c.startsWith("session="));
  return { res, location: res.headers.get("location"), cookie: cookie?.split(";")[0], raw: cookie };
}
const asUser = (cookie) => ({ headers: { Cookie: cookie } });
const postJson = (path, body, cookie) => req(path, {
  method: "POST", headers: { "Content-Type": "application/json", ...(cookie ? { Cookie: cookie } : {}) }, body: JSON.stringify(body),
});

try { await req("/api/me"); } catch { console.error(`Server not reachable at ${BASE}. Run \`npm run start\` first.`); process.exit(1); }

const hana = await signIn("hana@example.com", "hana-pass-123");
const dawit = await signIn("dawit@example.com", "dawit-pass-123");
const staff = await signIn("kitchen@example.com", "kitchen-pass-123");
const order = { name: "Hana T", phone: "0911223344", address: "Bole Road 12", neighbourhood: "Bole", dishId: "1", quantity: 2 };
const placed = await (await postJson("/api/orders", order, hana.cookie)).json();

console.log("\nAttack 1: act while signed out");
let r = await postJson("/api/orders", order);
say(r.status === 401, `POST /api/orders with no cookie -> ${r.status} (layer 3: getSession() in the handler)`);
r = await req(`/api/orders/${placed.id}`);
say(r.status === 401, `GET /api/orders/[id] with no cookie -> ${r.status}`);
for (const p of ["/checkout", "/orders", `/orders/${placed.id}`]) {
  r = await req(p);
  say(r.status === 307 && (r.headers.get("location") ?? "").startsWith("/signin"), `GET ${p} with no cookie -> ${r.status} ${r.headers.get("location")} (layer 1: proxy)`);
}
r = await req("/orders", asUser("session=forged-value-that-is-not-a-session"));
say(r.status === 307, `GET /orders with a FORGED cookie -> ${r.status} ${r.headers.get("location")} (layer 1 lets it through, layer 2 getSession() rejects it)`);

console.log("\nAttack 2: act as someone else");
r = await req(`/api/orders/${placed.id}`, asUser(dawit.cookie));
say(r.status === 403, `Dawit reads Hana's order through the API -> ${r.status} (layer 3: ownership check)`);
r = await req(`/orders/${placed.id}`, asUser(dawit.cookie));
const body = await r.text();
// The loading skeleton starts streaming before the ownership check runs, so the HTTP status can be 200;
// what matters is that Dawit gets the not-found page and none of Hana's order.
say(body.includes("could not find that page") && !body.includes("Order details") && !body.includes(order.address) && !body.includes("Doro Wat"),
  `Dawit opens Hana's order page -> HTTP ${r.status} but the not-found page, none of her order (it never confirms the order exists)`);
const list = await (await req("/orders", asUser(dawit.cookie))).text();
say(!list.includes(placed.id), "Dawit's /orders list does not contain Hana's order (query scoped to the session id)");
r = await req("/kitchen", asUser(hana.cookie));
say(r.status === 404, `Hana (customer) opens /kitchen -> ${r.status} (role comes from the server's user record)`);
r = await req("/kitchen", asUser(staff.cookie));
say(r.status === 200, `Chef Sara (staff) opens /kitchen -> ${r.status} (the allowed case still works)`);

console.log("\nAttack 3: a crafted sign-in link with an external next");
for (const evil of ["https://evil.example", "//evil.example", "/\\evil.example", "javascript:alert(1)"]) {
  const page = await (await req(`/signin?next=${encodeURIComponent(evil)}`)).text();
  const hidden = page.match(/name="next"[^>]*value="([^"]*)"|value="([^"]*)"[^>]*name="next"/);
  const carried = unesc(hidden?.[1] ?? hidden?.[2] ?? "(none)");
  const result = await signIn("hana@example.com", "hana-pass-123", evil); // a tampered hidden field too
  say(result.location === "/", `next=${JSON.stringify(evil)}: form carries ${JSON.stringify(carried)}, tampered post redirects to ${result.location} (safeNext, checked on the page AND in the action)`);
}
const good = await signIn("hana@example.com", "hana-pass-123", "/orders");
say(good.location === "/orders", `a legitimate next=/orders still returns to ${good.location}`);

console.log("\nCookie flags (from Set-Cookie):", (good.raw ?? "").split(";").slice(1).map((s) => s.trim()).join("; "));
console.log(failed === 0 ? "\nEvery attack was stopped." : `\n${failed} attack(s) were NOT stopped.`);
process.exit(failed === 0 ? 0 : 1);
