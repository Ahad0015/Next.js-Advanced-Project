# Data fetching: Addis Eats

Read to render on the **server**. Use the **client** only when the person or a timer triggers the request again and again.

| Query | Side | Key | Refresh rule | Seeded with | Why |
|---|---|---|---|---|---|
| Menu dishes | Server | direct call | ISR, `revalidate = 60` | n/a | Read to render; no endpoint needed. |
| One dish | Server | `id` param | prebuilt (`generateStaticParams`) | n/a | Ids known at build time. |
| My orders table | Server | session user + `?sort&dir&page` | dynamic on each request; `revalidatePath("/orders")` after a write | n/a | Per-person; the table state lives in the URL, so it can be bookmarked and works without JavaScript. |
| Kitchen table | Server | `?sort&dir&page` | dynamic | n/a | Staff only. |
| **Dashboard aggregates** | Server | `?range&source` | dynamic; recomputed per request | n/a | The orders are summed on the server and only the small summaries (6 neighbourhood rows, up to 30 points) go to the chart. The raw orders never reach the browser. |
| Dashboard table | Server | `?range&source&sort&dir&page` | dynamic | n/a | Same pattern as the orders table. |
| **Search** (`SearchBox`) | Client (SWR) | `/api/dishes?q=&page=&limit=4`, `null` while the box is empty | no polling; `revalidateOnFocus: false`; deduped for 60 s | The empty-term view is the server-rendered menu (`children`), so first paint is never blank | Typing triggers it; debounced 300 ms so a word is one request. |
| **Order status** | Client (SWR) | `/api/orders/[id]` | polls every 5 s; stops when `delivered` or `cancelled` | the server-rendered order (`fallbackData`) | Repeats over time. |
| **Who is signed in** (`SiteNav`) | Client (SWR) | `/api/me` | re-checked after each navigation | none | The header lives in the root layout; a cookie read there would make every page dynamic. |
| Cart | Client only | n/a | `sessionStorage` | n/a | Private to the browser until checkout. |

## Writes

| Write | How | After it |
|---|---|---|
| Place order(s) | server action `placeOrder` (form + `useActionState`). One order per dish in the cart, all validated before any is saved | `revalidatePath("/orders")`, `revalidatePath("/dashboard")`, then `redirect("/checkout/success?ids=...")` (Post/Redirect/Get: refreshing the confirmation cannot order twice) |
| Cancel order | server action `cancelOrder` | same |
| Sign in / out | server actions | `signIn` redirects; `SiteNav` re-reads `/api/me` |
| Anything outside the UI | route handler `POST /api/orders` | none |

## Revenue data (important)

Orders live in server memory and start empty, so there is no real sales history. The dashboard therefore has two sources:

- **Live**: orders placed through this app since the server started. Each order stores its price at the time (`unitPrice`, `total`).
- **Sample**: deterministic, generated data (`src/lib/sampleData.js`) for 190 days, every record marked `isSample`. It is always labelled
  "Sample data, not real sales" on the page. The dashboard shows live data when there is any, otherwise sample data; the toggle switches.

Revenue = sum of `total` for orders that are not cancelled. "Previous period" = the same number of days immediately before the selected range.
A previous period of zero shows "No earlier period to compare with" instead of a percentage. Days are Addis Ababa days (UTC+3).
The maths is checked against an independent calculation by `npm run test:analytics`.
