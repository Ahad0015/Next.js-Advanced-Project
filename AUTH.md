# Authentication and authorization: Addis Eats

Custom, server-side sessions (no external provider). Three layers protect the private routes; each proves something different.

## The layers

| Layer | Where | What it proves | What it does NOT prove |
|---|---|---|---|
| 1. Proxy | `src/proxy.js` (`/checkout`, `/orders`, `/dashboard`, `/kitchen`) | A cookie named `session` exists | That it is valid or belongs to anyone |
| 2. Session | `getSession()` in layouts, pages, actions and handlers | The id is in the server's session store, unexpired, and the user still exists. The role comes from the server's user record | That this user may touch this record |
| 3. Ownership / role | In the page, action or handler that reads or writes | The order belongs to `session.userId`, or `role === "staff"` | Nothing further |

Layouts for `/dashboard` and `/orders` also check the session **before** the loading skeleton streams, so a bad cookie gets a real
redirect (307) and a customer opening `/dashboard` gets a real 404. Pages check again, because layouts do not re-run on every
client-side navigation.

## Route table

| Surface | Who | Proxy | Session | Ownership / role |
|---|---|---|---|---|
| `/signin` | anyone | no | redirects if already signed in | `next` sanitised by `safeNext()` on the page and again in the action |
| `/checkout` | signed in | yes | page redirects to `/signin?next=/checkout` | `placeOrder` checks again |
| `/checkout/success` | signed in | yes | page redirects | only the user's own orders are shown; other ids are ignored (then redirect to `/orders`) |
| `/orders` | signed in | yes | layout + page redirect | query filtered to `session.userId` |
| `/orders/[id]` | the owner | yes | layout + page | 404 unless `order.userId === session.userId` |
| `/dashboard` | staff only | yes | layout + page redirect | `role !== "staff"` gives 404 (layout and page) |
| `/kitchen` | staff only | yes | page redirects | `role !== "staff"` gives 404 |
| `GET /api/orders/[id]` | the owner | n/a | 401 | 403 if not the owner, 404 if missing |
| `POST /api/orders` | signed in | n/a | 401 | `userId` from the session, never the body |
| `GET /api/me` | anyone | n/a | `{ user: null }` when signed out | role from the server record |
| actions `signIn` / `signOut` | anyone | n/a | none | generic error; `next` re-sanitised / deletes the session |
| action `placeOrder` | signed in | n/a | refused when signed out | `userId` from the session; price from the menu; unknown fields dropped |
| action `cancelOrder` | the owner | n/a | refused when signed out | owner check, and a delivered or cancelled order cannot be cancelled |

## The session

Cookie `session`: a random 64-hex-character id (`randomBytes(32)`), new on every sign-in. `HttpOnly`, `Secure` (production only),
`SameSite=lax`, `Max-Age` 8 hours. It holds only the id; the user and the **role** are looked up on the server, so editing the
cookie cannot make anyone staff. Passwords are never stored: `scrypt` with a per-user salt, compared in constant time.

## Attacks and what stopped each

Run against a production build. `npm run attacks` (HTTP level) and `npm run test:actions` (the server actions called directly) repeat them.

| Attack | Result | What stopped it |
|---|---|---|
| `POST /api/orders` / `GET /api/orders/[id]` with no cookie | 401 | layer 3 in the handler |
| `/checkout`, `/orders`, `/dashboard`, `/orders/[id]` with no cookie | 307 to `/signin?next=...` | layer 1 proxy |
| `/orders` with a forged cookie | 307 to `/signin?next=/orders` | layer 1 passes it, layer 2 rejects it (in the orders layout) |
| `/dashboard` with a forged cookie | redirect | layer 2 (dashboard layout) |
| `placeOrder` / `cancelOrder` with no cookie or a forged one | refused, nothing saved | layer 2 inside the action |
| Dawit reads Hana's order via the API | 403 | layer 3 ownership |
| Dawit opens Hana's order page | not-found page, none of her data (HTTP 200 because the skeleton had started streaming) | layer 3 |
| Dawit cancels Hana's order | refused; her order unchanged | layer 3 inside the action |
| A customer opens `/dashboard` or `/kitchen` | 404 | role from the server's record |
| Form sends `userId`, `status`, `total` | ignored; the order is built from the session and the menu price | the schema keeps only validated fields |
| Cancel an already delivered order | refused | the status rule lives in the action, not the button |
| `next=https://evil.example`, `//evil.example`, `/\evil.example`, `javascript:...` | all end at `/` | `safeNext()` on the page and in the action |
| Wrong password vs unknown email | identical message | generic error |

## Known gaps

- **Sessions, users and orders live in server memory.** They vanish on restart and are not shared between server instances. On serverless
  hosting you would be signed out at random. Deploy as one long-running Node process, or move sessions and data to a database.
- No rate limiting on sign-in; no registration or password reset (not part of this project); CSRF protection is `SameSite=lax` plus
  Next.js's own origin check on server actions.
- The demo accounts and passwords are listed on the sign-in page (development only). Remove that block before real use.
- Order status (placed, preparing, on the way, delivered) is **simulated from the order's age** (15 s, 40 s, 70 s); there is no real kitchen workflow.
