# Final report: Addis Eats (Day 36 to Day 46)

## 1. What I based this on (and what I could not read)

| Source | Status |
|---|---|
| Day 36, 37, 38, 39, 40 PDFs | Read in full in this conversation. |
| Day 42, 43, 44, 45, 46 | Only the **in-class exercise screenshots** were available to me, not the slide PDFs. Features for those days follow the exercise text. |
| Day 41 | No PDF or screenshot in this conversation; the project already contained its work (SWR search, order polling). |
| Your Day 44 project | The starting point (with my Day 45 edits). |

Where a day's PDF was not available I did not guess its contents. In particular, **I chose Recharts for the charts** because the Day 46
exercise names a bar chart with a fixed-height container and tick formatting but I could not see the library the PDF teaches. If the PDF
specifies a different library, tell me and I will convert the two charts in `RevenueChart.js`.

## 2. Audit: what the project had, and what was wrong

| Found | Fix |
|---|---|
| No cart: "Cart" in the nav led to a placeholder page; `addItem` was never called | A working cart (add, quantity, remove, persists for the browser session) and a multi-dish checkout |
| `CategoryBar` highlighted a category but filtered nothing; the "vegetarian" toggle was separate | One working category filter with counts (`FilterShell`) |
| Orders had no price, total or neighbourhood, so revenue could not be calculated | Orders now store `unitPrice`, `total` and `neighbourhood`; the schema requires a neighbourhood |
| No dashboard | `/dashboard` (staff only) with charts, cards and tables |
| Orders page was a list, not a sortable, pageable table | `OrderTable`: real table markup, sorting and paging from the URL |
| Dead or unfinished controls, unstyled pages, no responsive navigation | Consistent design system, responsive header, staff shell, every button wired |
| Stretched images (Day 44 review), out-of-date STRATEGY and BOUNDARY | Fixed in Day 45; rewritten again here |

## 3. What was built

- **Public site:** home, menu (search, category filter, cards with add-to-cart), dish page (metadata, JSON-LD, share image), cart, sign-in.
- **Customer area:** checkout (with a no-JavaScript fallback), my orders (sortable, paged, cancel with a confirmation dialog), live order tracking.
- **Staff area:** dashboard (revenue and orders analytics) and kitchen queue, behind a role check.
- **Platform:** session auth with a proxy, route handlers, server actions, Zod validation, metadata and SEO files.

## 4. Day 36 to 46 checklist

| Day | Concept | Where it lives | How it was checked |
|---|---|---|---|
| 36 | File-based routing, dynamic `[id]`, `next/link`, loading / error / not-found files | `app/**`, `menu/[id]`, `loading.js`, `error.js`, `not-found.js` | Build route table; end-to-end test |
| 37 | Root and nested layouts, rendering strategies, `generateStaticParams`, streaming | `app/layout.js`, `menu/layout.js`, staff layouts; `STRATEGY.md` | Build markers match `STRATEGY.md` |
| 38 | Server vs client components, composition with `children`, providers | `BOUNDARY.md`; `SearchBox` > `FilterShell` > `DishList` | `grep "use client"`; no page or layout is a client component |
| 39 | Route handlers, Zod, server actions, status codes, authorization inside handlers | `app/api/**`, `app/actions.js`, `lib/schema.js` | `npm run test:actions`, end-to-end test |
| 41 | Client data fetching with SWR: debounced search, polled status | `SearchBox.js`, `OrderStatus.js`, `/api/dishes` | Inspected the code and HTML; **typing and polling not exercised in a browser** |
| 42 | Sessions, proxy, safe redirects, ownership, roles | `proxy.js`, `lib/session.js`, `safe-next.js`, `AUTH.md` | `npm run attacks` (16 attacks stopped) |
| 43 | `next/image`, `next/font`, `next/script`, env files | `DishCard`, `app/page.js`, `layout.js`, `GoogleAnalytics.js`, `.env.example`, `PERF.md` | Image bytes measured; **Lighthouse not run** |
| 44 | Metadata, title template, Open Graph, JSON-LD, sitemap, robots | `layout.js`, `generateMetadata`, `opengraph-image`, `sitemap.js`, `robots.js` | Parsed from the served HTML |
| 45 | Auth / data / performance documents, deployment | `AUTH.md`, `DATA.md`, `PERF.md`, `README.md` | Written; **deployment not done** |
| 46 | Data representation: aggregate on the server, bar chart (revenue by neighbourhood), line chart (orders over time), accessible tables, URL-sorted paged table, four states | `app/dashboard/*`, `orders/OrderTable.js`, `lib/analytics.js` | 30 maths checks, end-to-end test, axe-core |
| 40 | Foundations project: documents and mechanical checks | `STRATEGY.md`, `BOUNDARY.md` | The Day 40 `verify` script is not part of this project |

Not implemented, on purpose: **registration** (the exercises only need sign-in and sign-out), **monthly and yearly filters** (there is
at most 190 days of data, so a yearly view would be meaningless), a real payment system.

## 5. Authentication and authorization

See `AUTH.md`. In short: server-side sessions, three layers (proxy, session, ownership or role), a staff role for `/dashboard` and
`/kitchen` checked on the server, safe `next` redirects, and every server action and handler re-checks the session and the owner.
No secrets exist in the code or the repository.

## 6. Metadata and SEO

- Root layout: `metadataBase`, title template `%s | Addis Eats`, default description, Open Graph defaults, theme colour.
- Every page has its own title and description; the home page uses an absolute title.
- Dish pages: `generateMetadata` (name, price, summary), JSON-LD `MenuItem` built from the same dish object, a generated share image per dish.
- `sitemap.xml` from the real dish data (10 public URLs); `robots.txt` disallows `/cart`, `/checkout`, `/orders`, `/signin`, `/kitchen`, `/dashboard`, `/api/`.
- Private pages carry `noindex`. No private data appears in metadata.

## 7. Revenue chart and data representation (Day 46)

- `app/dashboard/page.js` (server) checks the role, aggregates the orders and passes only small summaries on.
- `RevenueChart.js` (client, the only client code on the page): a **bar chart** of revenue by neighbourhood (ETB tick labels, fixed-height box)
  and a **line chart** of orders per day (or per week for the 90-day range), each with a heading naming the range and the unit, a legend and tooltips.
- The same data is in tables beneath each chart; the line chart's table is inside a disclosure, the neighbourhood table is always visible.
- Summary cards: revenue, orders, average order value (each with its change against the previous period of equal length) and cancelled orders.
- Also: best-selling dishes, and a sortable, paged table of the orders in the period (state in the URL, links for sorting and paging).
- Filters are links (`?range=7d|30d|90d`, `?source=sample|live`) so the choice is bookmarkable. Invalid values fall back safely.
- **Data:** live orders from this app, or clearly labelled **sample data**. Sample revenue is never presented as real.
- The four states (loading, empty, error, success) can each be forced, see the README.

## 8. UI and UX: before and after

| Area | Before | After |
|---|---|---|
| Look | Unstyled pages, one typeface, no system | Tokens for colour and type (collard green, berbere red, turmeric); Bricolage Grotesque headings, Public Sans body; one set of buttons, fields, cards, badges, tables |
| Navigation | A few text links, no active state | Sticky header with active link, cart count, account menu, mobile menu; staff sidebar (tabs on phones); skip link |
| Home | A heading and a link | Hero, three dishes from the menu, delivery areas |
| Menu | A list; a category bar that did nothing | Cards with images, price, add-to-cart; working filter with counts; debounced search with loading, empty and error states |
| Dish | Image and text | Two-column layout, add to cart, breadcrumb |
| Cart / checkout | Placeholder / single-dish form | Cart with quantity steppers; checkout with delivery details and an order summary; confirmation with tracking links |
| Orders | A list | Accessible table: sortable headings, paging, status badges, cancel with a confirmation dialog |
| Status | Raw text | A progress timeline that updates itself |
| Dashboard | None | Cards, two charts, accessible tables, filters, four states |
| Accessibility | Not designed | Visible focus ring, labelled fields with linked errors, landmarks, `aria-sort`, `aria-current`, reduced-motion support |

## 9. Testing: what was actually run

| Check | Result |
|---|---|
| `npm run lint` | clean |
| `npm test` (`test:analytics`, `test:actions`, `test:cart`) | 30, 16 and 1 checks pass |
| `npm run build` | passes |
| End-to-end test of pages, metadata, authorization, dashboard filters and states, orders, sorting and paging (my own script, not shipped) | 96 checks pass |
| `npm run attacks` | 16 of 16 attacks stopped |
| axe-core on 13 pages of server HTML | 0 violations. **Colour contrast could not be measured** (no browser); the palette was chosen to meet 4.5:1 |

The production build in my environment could not download Google fonts, so I built and tested a **scratch copy with the two font lines
stubbed**; everything else was your real code. The font names were checked against Next.js's font list.

## 10. Not verified: please check these yourself

1. **How it looks.** I had no browser, so desktop, tablet and phone layouts, spacing, colours, the hamburger menu, the account dropdown and
   the confirmation dialog were **not** viewed. Please open each page at three widths.
2. **Charts in the browser:** the charts render in the server HTML, but hover tooltips and resizing were not exercised.
3. **Client behaviour:** filter chips, debounced search, polling, add-to-cart feedback and the error page (`error.js`) run in the browser;
   I confirmed the server side (the server sends an errored boundary with only a digest) but not the visual result.
4. **Lighthouse:** not run. Fill the `MEASURE` cells in `PERF.md`.
5. **Fonts and deployment:** build once on your machine with internet; deploy and verify the live page source.
6. **Real revenue:** none exists yet. Place a few orders as a customer, then open the dashboard as staff to see live data.

## 10b. Fixes after your first test run

| You reported | Cause | Fix |
|---|---|---|
| "Something went wrong" after checking out | A bug of mine: after an order, the form emptied the cart, but the emptying function was rebuilt on every render, so the cart emptied itself forever and React stopped it. My server-side tests ran without JavaScript, so they could not see it. | The cart actions now keep one identity, and clearing an empty cart does nothing. A real React test (`npm run test:cart`) reproduced the loop before the fix and passes after it. |
| No clear success message | The success text was inside the form and disappeared on refresh | A dedicated **confirmation page** (`/checkout/success`): thank-you, confirmed order, total, address, what happens next, and a tracking link. Refreshing it cannot place the order twice. |
| Cannot find the dashboard | It is staff-only and only appears after signing in as staff; and `npm run start` serves the last build, which may predate the dashboard | Staff now land on the dashboard after signing in; **Dashboard** is also in the account menu; the sign-in page shows the staff account openly; README explains the rebuild |

## 11. Known limitations and next steps

- Data is in memory (see `AUTH.md`): restart empties orders and sessions; use one long-running server, or add a database.
- Order status is simulated from the order's age.
- No payments, registration, password reset or rate limiting.
- The dashboard looks at the last 90 days at most; a longer history needs real data.
- Next steps: a database, real order status updates from the kitchen, Lighthouse tuning, and a deployed URL in the README.
