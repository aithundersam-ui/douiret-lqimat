# Douiret Lqimat · دويرة اللقيمات

Website for Douiret Lqimat, a bakery in Algiers: traditional and modern Algerian sweets and mini savories.

The site is bilingual (Arabic at `/ar/`, French at `/fr/`), mobile-first, and exported as static files, so it can be hosted for free.

## Pages

- `/ar/`, `/fr/`: home (what we do, featured menu, team, contact)
- `/ar/menu/`, `/fr/menu/`: full menu with category filters

## Editing the content

All content lives in `src/data/`:

| File | What it holds |
|---|---|
| `shop.ts` | Phone, WhatsApp number, address, map link, opening hours, social links |
| `menu.ts` | Categories and products (names in AR/FR, price in DZD, unit, photo, featured on home) |
| `team.ts` | Team members (names, roles, photos) |

Photos go in `public/menu/` and `public/team/` and are referenced like `/menu/makrout.webp`. Interface text (titles, buttons) is in `src/lib/dictionary.ts`.

The product list mirrors the Products tab of the store management workbook. In the next phase (admin side and dashboard) it moves into a database and the admin edits it directly.

## Running locally

```bash
npm install
npm run dev      # http://localhost:3000
npm run build    # static site in out/
```

## Deploying

The site is hosted on Netlify. `netlify.toml` holds the build settings, so importing the repository on Netlify needs no extra setup, and every push to `main` goes live automatically. Set the `NEXT_PUBLIC_SITE_URL` environment variable in Netlify to the final address (for example `https://douiretlqimat.com`) so link previews on WhatsApp and Facebook show the logo.
