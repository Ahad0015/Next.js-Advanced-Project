# Server and client boundary: Addis Eats

Every component, which side it runs on, and why. Server by default; `"use client"` only on the smallest piece that
needs state, an event handler, a timer or a browser API. No `page.js` or `layout.js` is a client component.

| Component | Side | Why |
|---|---|---|
| `app/layout.js` | Server | Shell, fonts, metadata; wraps children in `Providers`. |
| `app/providers.js` | Client | The cart (reducer + `sessionStorage`) is browser state shared by several components. |
| `app/SiteNav.js` | Client | Active link (`usePathname`), open/closed menus, signed-in user (SWR on `/api/me`). Reading the cookie in the root layout instead would make every route dynamic. |
| `app/GoogleAnalytics.js` | Server | Only renders `next/script` (`lazyOnload`). |
| `app/page.js`, `menu/page.js`, `menu/[id]/page.js` | Server | Read data and render. The menu page awaits its data directly. |
| `app/menu/DishList.js`, `DishCard.js` | Server | Plain markup from data; ship no JavaScript. |
| `app/menu/AddToCartButton.js` | Client | `onClick` and the cart. A leaf inside server-rendered cards; receives plain `{ id, name, price }`. |
| `app/menu/FilterShell.js` | Client | Selected category state. The grid arrives as `children`, so its code stays on the server. |
| `app/menu/SearchBox.js` | Client | Typing triggers requests: debounce + SWR. Wraps the server-rendered menu as `children`. |
| `app/cart/page.js` | Server | Heading and static shell. |
| `app/cart/CartView.js` | Client | Edits the cart (quantity, remove, clear). |
| `app/checkout/page.js` | Server | Reads the session, redirects if signed out, loads the dishes. |
| `app/checkout/OrderForm.js` | Client | `useActionState` (pending, field errors) and the cart. Also server-rendered, so it works without JavaScript. |
| `app/checkout/success/page.js` | Server | Reads the session and the user's own orders; renders the confirmation. |
| `app/checkout/success/ClearCart.js` | Client | Empties the cart once after an order; draws nothing. |
| `app/signin/page.js` | Server | Reads the session and the sanitised `next`. |
| `app/signin/SignInForm.js` | Client | `useActionState` for pending and error state. |
| `app/orders/page.js`, `OrderTable.js` | Server | Reads orders for the session user; the table is real markup, sorted and paged from the URL (links, no JavaScript). |
| `app/orders/CancelButton.js` | Client | Opens a native `<dialog>` to confirm, then calls the `cancelOrder` action. |
| `app/orders/[id]/page.js` | Server | Checks ownership and renders the first status. |
| `app/orders/[id]/OrderStatus.js` | Client | Polls `/api/orders/[id]` every 5 s (SWR), seeded with the server's order. |
| `app/dashboard/page.js` | Server | Checks the role, aggregates the orders, passes only small summaries on. Cards, tables and filters are server-rendered. |
| `app/dashboard/RevenueChart.js` | Client | Recharts draws SVG and measures the screen. **The only client code on the dashboard page.** |
| `app/dashboard/parts.js` | Server | Summary cards, filter links, accessible data tables. |
| `app/kitchen/page.js` | Server | Staff check on the server; reuses `OrderTable`. |
| `app/error.js` | Client | Error boundaries must be client components (retry uses an event handler). |
| `app/actions.js` | Server | `"use server"`: `signIn`, `signOut`, `placeOrder`, `cancelOrder`. Public endpoints, so each checks session, owner and input inside. |
| `app/api/**/route.js`, `proxy.js` | Server | Endpoints and the cookie check. |
| `components/*.js` | Server | Icons, page header, empty state, status badge, pagination, staff shell: plain markup. |
| `lib/*.js` | Server (some shared) | Data, sessions, analytics. `format.js`, `neighbourhoods.js`, `fetcher.js` hold no secrets and are safe to import from client files. |

## Client files: 13, each defended

`providers.js`, `SiteNav.js`, `AddToCartButton.js`, `FilterShell.js`, `SearchBox.js`, `CartView.js`, `OrderForm.js`,
`ClearCart.js`, `SignInForm.js`, `CancelButton.js`, `OrderStatus.js`, `RevenueChart.js`, `error.js`. Check with
`grep -rl "use client" src`.

If one had to go first: `FilterShell` (could be merged into `SearchBox`). Everything else is triggered by a person or a timer.

## Composition (client shells wrapping server content)

`SearchBox` > `FilterShell` > `DishList`: all passed as `children` from `menu/page.js`, so the dish grid is rendered
on the server and never bundled into the client shells.

## First Load JS

Measure with DevTools (Network, JS, cache disabled) on `npm run start`:

| Page | Before | After | Notes |
|---|---|---|---|
| `/menu` | (your earlier number) | measure again | The cart, nav and search now ship; the grid does not. |
| `/dashboard` | n/a | measure | Recharts is loaded only on this route. |

Write the explanation in your own words once you have the numbers.
