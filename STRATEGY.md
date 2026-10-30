# Rendering strategy: Addis Eats

Every route, how it renders, and one line saying why. Markers are from `npm run build`:
`○` static, `●` prerendered from params, `ƒ` dynamic.

| Route | Marker | Strategy | Why |
|---|---|---|---|
| `/` | ○ | Static | Same for every visitor, built once. |
| `/menu` | ○ | Static + `revalidate = 60` (ISR) | The menu changes rarely; a minute of staleness is fine and speed matters most. |
| `/menu/[id]` | ● | Static (`generateStaticParams`) | Dish ids are known at build time, so every dish page is prebuilt. |
| `/cart` | ○ | Static shell + client `CartView` | The page is the same for everyone; only the cart contents (browser memory) are personal. |
| `/signin` | ƒ | Dynamic | Reads the session and `?next=`. |
| `/checkout` | ƒ | Dynamic (`force-dynamic`) | Depends on who is asking (session cookie). |
| `/checkout/success` | ƒ | Dynamic | Confirmation after an order; shows only the signed-in user's own orders (ids come from the URL, ownership is checked). |
| `/orders` | ƒ | Dynamic (`force-dynamic`) | The signed-in customer's own orders; sorted and paged from the URL. |
| `/orders/[id]` | ƒ | Dynamic | Private to its owner; first status rendered on the server, then polled. |
| `/kitchen` | ƒ | Dynamic (`force-dynamic`) | Staff only; all live orders. |
| `/dashboard` | ƒ | Dynamic (`force-dynamic`) | Staff only; aggregates orders at request time; range, source, sort and page come from the URL. |
| `/api/dishes`, `/api/dishes/[id]` | ƒ | Route handlers | Read the query string / params per request (search). |
| `/api/orders`, `/api/orders/[id]` | ƒ | Route handlers | Write an order; read one order (session and owner checks). |
| `/api/me` | ƒ | Route handler | "Who is signed in?" for the header. |
| `/sitemap.xml`, `/robots.txt` | ○ | Generated files | Built from the dish data and fixed rules. |
| `/opengraph-image` | ○ | Generated image | The site-wide share preview. |
| `/menu/[id]/opengraph-image` | ƒ | Generated per request | One preview per dish from the dish record. |

`src/proxy.js` runs first on `/checkout` (including `/checkout/success`), `/orders`, `/dashboard` and `/kitchen` (the Proxy line in the build output).

## Layouts

- `app/layout.js`: root. `<html>`, fonts, header (`SiteNav`), footer, skip link, `Providers`, analytics.
- `app/menu/layout.js`: nested. Opening-hours note above `/menu` and every dish; stays mounted between them.
- `app/dashboard/layout.js`, `app/kitchen/layout.js`: staff shell (sidebar on wide screens, tabs on phones). The dashboard layout also checks the session before anything streams.
- `app/orders/layout.js`: checks the session before the loading skeleton streams.

## States (loading, empty, error)

| State | Where | How to see it |
|---|---|---|
| Loading | `menu/loading.js`, `orders/loading.js` (five table rows), `dashboard/loading.js` | `/orders?demo=loading`, `/dashboard?demo=loading` (adds a 2.5 s delay) |
| Empty | `/orders` (no orders), `/dashboard` (no data in range) | `/orders?demo=empty`, `/dashboard?demo=empty`, or `/dashboard?source=live` before any order |
| Error | `app/error.js` (all segments) | `/orders?demo=error`, `/dashboard?demo=error` |

## A consequence worth knowing

A loading skeleton streams before the page's own checks run. So when the page then calls `notFound()` (someone
else's order) the HTTP status is 200 and the body is the not-found page with `noindex`; no order data is sent.
Where a real status matters (signed-out or forged cookie, non-staff on the dashboard) the check is in a layout,
which runs before the skeleton.
