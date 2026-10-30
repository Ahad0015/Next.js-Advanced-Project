# Performance: Addis Eats

## Setup

Production build (`npm run build` + `npm run start`), Chrome Incognito with no extensions, Lighthouse
Navigation mode, Mobile with simulated throttling, Performance category only. Run each page **three times**
and record the median. Compare like with like: same page, same device settings, production build both times.

## The budget

Fill **both** columns. A "Before" you did not measure cannot be filled in afterwards, so the cells marked
`MEASURE` are yours to record: check out the commit from before the image and font changes
(`git log --oneline`, then `git stash` or `git checkout <commit>`), build, run Lighthouse, write the numbers,
then return to the latest code and measure again.

| Metric (page: `/`) | Budget | Before | After | What caused the change |
|---|---|---|---|---|
| Lighthouse performance score | 90 or more | MEASURE | 95 (median of 94, 95, 96) | all four changes below together |
| LCP (the hero image) | 2.5 s or less | MEASURE | MEASURE | `preload` on the hero, resized webp, `sizes` |
| CLS | 0.1 or less | MEASURE | MEASURE | real `width`/`height` on every image, `next/font` fallback metrics |
| INP (lab proxy: TBT) | 200 ms or less | MEASURE | MEASURE | analytics moved to `lazyOnload` |
| Hero image transferred | 150 KB or less | 632,339 B (the raw file, as a plain `<img>`) | 70,496 B at 640 px, 147,620 B at 1080 px, 176,948 B at 1920 px (webp) | `next/image` resizes to the width the browser asks for and re-encodes as webp |
| `/menu` thumbnails (8 images) | 300 KB or less | 402,935 B (raw files) | 229,656 B at 384 px (webp) | `next/image` with `sizes`; the saving is modest because the source files are already small (452 to 614 px wide) |
| Third-party script | does not block the page | MEASURE (loaded how?) | Google Analytics via `next/script` `lazyOnload` | loads after the page is idle |

The two image rows were measured with `curl` against `/_next/image` on a production build (bytes downloaded,
before compression by the network). The Lighthouse rows must come from Lighthouse. The earlier note in this
file listed "LCP: 92, CLS: 92, TBT: 87"; those are Lighthouse **metric scores out of 100**, not the metric values,
so record the actual LCP in seconds, CLS as a number, and INP/TBT in milliseconds.

## What each change does

- **`next/image` with real dimensions and `sizes`:** images are resized to the width actually displayed and
  served as webp. The true `width`/`height` reserve the right space before the file loads, so nothing jumps
  (CLS), and the picture is not stretched. Each dish file's real size is stored in `src/app/menu/data.js`.
- **`preload` on the hero only:** the one largest above-the-fold image starts downloading immediately (LCP).
  Nothing else on `/menu` is marked high priority.
- **Hero box:** `hero.jpg` is square (1254 by 1254). It sits in a fixed 16:9 box with `object-cover`, which crops
  it instead of squashing it.
- **`next/font`:** the font is self-hosted with a size-matched fallback, so the swap does not shift the text.
- **`next/script` with `lazyOnload`:** analytics loads after the page is idle, so it adds no work while the page
  becomes usable (TBT/INP).

## Environment setup

`.env.example` lists every variable with dummy values and is committed. `.env.local` is gitignored
(`.env*` is ignored, `!.env.example` is the one exception). A fresh clone runs with:

```
cp .env.example .env.local     # then put your real values in
```

On the deployed host, set `NEXT_PUBLIC_SITE_URL` to the real address, or every canonical link, sitemap entry and
social preview will point at `localhost`.

## Added in the final pass

- The hero now sits in a 4:3 box (`fill`, `object-cover`, `preload`) on the home page; the file is unchanged, so the byte counts above still apply.
- Recharts (about the largest new dependency) is only loaded on `/dashboard`, a staff-only page, so it does not affect the public pages.
- The skeletons (`menu`, `orders`, `dashboard`) have the same shape as the finished pages, so nothing shifts when data arrives.
- Not measured: Lighthouse on the redesigned pages. Run it on the home page and `/menu` and update the table.
