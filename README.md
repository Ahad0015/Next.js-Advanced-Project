# Addis Eats

A food-ordering app for Addis Ababa with a staff analytics dashboard. Built with Next.js (App Router, JavaScript, `src/` directory),
Tailwind CSS 4, SWR, Zod and Recharts. Customers browse the menu, fill a cart, check out and follow their order. Staff see a revenue
dashboard and the kitchen queue.

**Deployed URL:** `PUT-YOUR-DEPLOYED-URL-HERE` (replace this after you deploy; the steps are under "Deploy" below)

## Run it from a fresh clone

```
git clone <your-repo-url>
cd addis-eats
cp .env.example .env.local      # then edit the values
npm install
npm run build
npm run start                   # http://localhost:3000
```

`npm run dev` for development. The build downloads two Google fonts (Bricolage Grotesque and Public Sans) through `next/font`, so it needs an internet connection.

## Environment variables

| Variable | Used for | Example |
|---|---|---|
| `NEXT_PUBLIC_SITE_URL` | Absolute URLs in metadata, sitemap, `robots.txt` and share previews | `https://your-site.example.com` |
| `NEXT_PUBLIC_GA_ID` | Google Analytics id; the script loads lazily. Leave empty to disable | `G-XXXXXXXXXX` |

`.env.local` is gitignored; `.env.example` is committed with dummy values. There are no secrets in this project today.
`NEXT_PUBLIC_` variables are visible in the browser by design; never put a secret in one.

## Demo accounts (development only)

| Email | Password | Role |
|---|---|---|
| `hana@example.com` | `hana-pass-123` | customer |
| `dawit@example.com` | `dawit-pass-123` | customer |
| `kitchen@example.com` | `kitchen-pass-123` | staff (dashboard and kitchen) |

## Where is the dashboard?

1. After any change, **rebuild before starting**: `npm run build`, then `npm run start`. `npm run start` serves the last build, so a build made before
   the dashboard existed will not have it.
2. **Sign in as staff**: `kitchen@example.com` / `kitchen-pass-123`. You land on the dashboard. (Customers do not see it; they get a 404.)
3. Staff also get **Dashboard** and **Kitchen** links in the header, and in the account menu. Or open `/dashboard` directly.
4. Until a real order exists the charts show clearly labelled sample data.

## Placing an order

Add dishes to the cart, open **Checkout**, fill the delivery details and press **Place order**. You are taken to a confirmation page
("Thank you ... Your order is confirmed") with your order, the total and what happens next. **My orders** then lists it.

## Try the Day 46 states

| URL | Shows |
|---|---|
| `/dashboard` (as staff) | The dashboard on sample data (clearly labelled) until a real order exists |
| `/dashboard?range=7d` / `30d` / `90d` | The range filter |
| `/dashboard?source=live` | Live data only; the empty state until someone orders |
| `/dashboard?demo=loading` / `empty` / `error` | Forces the skeleton, empty and error states |
| `/orders?demo=loading` / `empty` / `error` | Same for the orders table |
| `/orders?sort=total&dir=asc&page=2` | Sorting and paging come from the URL |

## Scripts

| Command | What it does |
|---|---|
| `npm run dev` / `build` / `start` | Develop, build, serve the build |
| `npm run lint` | ESLint |
| `npm test` | Dashboard maths (30 checks), server actions (16 checks) and the cart (1 regression check) |
| `npm run attacks` | Runs the sign-in and authorization attacks against a running production server |

## Documents

`AUTH.md` (layers and attacks), `DATA.md` (every query), `STRATEGY.md` (rendering per route), `BOUNDARY.md` (server and client),
`PERF.md` (performance budget), `FINAL_REPORT.md` (what was built, checked and what is left).

## API

| Method | Path | Success | Errors |
|---|---|---|---|
| GET | `/api/dishes?q=&page=&limit=` | 200 `{ items, page, limit, total, totalPages }` | |
| GET | `/api/dishes/[id]` | 200 | 404 |
| POST | `/api/orders` | 201 | 400 invalid JSON, 401 not signed in, 422 validation (with `fieldErrors`) |
| GET | `/api/orders/[id]` | 200 | 401, 403 not yours, 404 |
| GET | `/api/me` | 200 `{ user }` | |

Every error uses one shape: `{ "error": { "code", "message" } }`.

## Deploy

1. Push to GitHub and deploy from the repository.
2. Set `NEXT_PUBLIC_SITE_URL` (and optionally `NEXT_PUBLIC_GA_ID`) in the host's settings; redeploy after changing them.
3. Verify from the page source, not the code: View Source on the live site and check the title, `canonical`, `og:image` (absolute, on your domain)
   and the JSON-LD on a dish page; then open `/sitemap.xml` and `/robots.txt`.
4. **Sessions, users and orders are stored in server memory.** Deploy as one long-running Node process (`npm run build` then `npm run start`).
   On serverless hosting you would be signed out at random and orders would disappear. A database is the production fix.

## Build output

```
Route (app)                     Revalidate  Expire
┌ ○ /
├ ○ /_not-found
├ ƒ /api/dishes
├ ƒ /api/dishes/[id]
├ ƒ /api/me
├ ƒ /api/orders
├ ƒ /api/orders/[id]
├ ○ /cart
├ ƒ /checkout
├ ƒ /checkout/success
├ ƒ /dashboard
├ ƒ /kitchen
├ ○ /menu                               1m      1y
├   /menu/[id]
│ ├ ● /menu/1  /menu/2  /menu/3  [+5 more paths]
├ ƒ /menu/[id]/opengraph-image
├ ○ /opengraph-image
├ ƒ /orders
├ ƒ /orders/[id]
├ ○ /robots.txt
├ ƒ /signin
└ ○ /sitemap.xml

ƒ Proxy (Middleware)

○ (Static)   ● (SSG)   ƒ (Dynamic)
```

## Project structure (`src/`)

```
├── app
│   ├── api
│   │   ├── dishes
│   │   │   ├── [id]
│   │   │   │   └── route.js
│   │   │   └── route.js
│   │   ├── me
│   │   │   └── route.js
│   │   └── orders
│   │       ├── [id]
│   │       │   └── route.js
│   │       └── route.js
│   ├── cart
│   │   ├── CartView.js
│   │   └── page.js
│   ├── checkout
│   │   ├── OrderForm.js
│   │   └── page.js
│   ├── dashboard
│   │   ├── layout.js
│   │   ├── loading.js
│   │   ├── page.js
│   │   ├── parts.js
│   │   └── RevenueChart.js
│   ├── kitchen
│   │   ├── layout.js
│   │   └── page.js
│   ├── menu
│   │   ├── [id]
│   │   │   ├── not-found.js
│   │   │   ├── opengraph-image.jsx
│   │   │   └── page.js
│   │   ├── AddToCartButton.js
│   │   ├── data.js
│   │   ├── DishCard.js
│   │   ├── DishList.js
│   │   ├── FilterShell.js
│   │   ├── layout.js
│   │   ├── loading.js
│   │   ├── page.js
│   │   └── SearchBox.js
│   ├── orders
│   │   ├── [id]
│   │   │   ├── OrderStatus.js
│   │   │   └── page.js
│   │   ├── CancelButton.js
│   │   ├── layout.js
│   │   ├── loading.js
│   │   ├── OrderTable.js
│   │   └── page.js
│   ├── signin
│   │   ├── page.js
│   │   └── SignInForm.js
│   ├── actions.js
│   ├── error.js
│   ├── favicon.ico
│   ├── globals.css
│   ├── GoogleAnalytics.js
│   ├── layout.js
│   ├── not-found.js
│   ├── opengraph-image.jsx
│   ├── page.js
│   ├── providers.js
│   ├── robots.js
│   ├── sitemap.js
│   └── SiteNav.js
├── components
│   ├── Icons.js
│   ├── Pagination.js
│   ├── StaffShell.js
│   └── ui.js
├── lib
│   ├── analytics.js
│   ├── db.js
│   ├── fetcher.js
│   ├── format.js
│   ├── http.js
│   ├── neighbourhoods.js
│   ├── orders.js
│   ├── safe-next.js
│   ├── sampleData.js
│   ├── schema.js
│   ├── session.js
│   ├── site.js
│   ├── tableQuery.js
│   └── users.js
└── proxy.js
```
