# Douiret Lqimat · دويرة اللقيمات

Website for Douiret Lqimat, a bakery in Algiers: traditional and modern Algerian sweets and mini savories.

The website is in English (`/en/`, the main language), Arabic (`/ar/`) and French (`/fr/`); the staff area is in English and Arabic. It is mobile-first and exported as static files, so it can be hosted for free.

## Pages

- `/en/`, `/ar/`, `/fr/`: home (what we do, featured menu, team, contact)
- `/en/menu/`, `/ar/menu/`, `/fr/menu/`: full menu with category filters
- `/en/admin/`, `/ar/admin/`: staff area (sign-in required; `/fr/admin/` opens the English one), with:
  - **Dashboard**: revenue, cost of goods, waste, expenses, net profit, waste %, made-here vs resale, daily revenue chart, best sellers, most waste, upcoming pre-orders, money owed to suppliers
  - **Today**: per product, what was made (or bought), sold and wasted, with what should be left
  - **Orders**, **Products**, **Purchases**, **Expenses**: add, edit and delete records
  - **Website**: edit everything on the home page (texts in English, Arabic and French, contact details, WhatsApp number, opening hours, social links, team members with photos). Product photos, descriptions and "show on home page" are set in **Products**.

The public pages are built with the latest saved content, and also refresh it in the browser, so changes from the Website screen show up straight away without a rebuild. While nothing is saved yet (no products, no team members), the site shows the sample content from `src/data/`.

## The database (Supabase)

The staff area stores its data in [Supabase](https://supabase.com) (free plan). Until it is connected, the staff area runs in **demo mode**: sample numbers, kept only in the browser.

To connect it, once:

1. Create a free project on supabase.com.
2. In the project, open **SQL Editor**, paste the contents of `supabase/schema.sql` and click **Run**. Run it again after updates that change the file: it only adds what is missing and keeps existing data. It also creates the public `site` storage bucket for photos.
3. In **Authentication → Users**, click **Add user** for each staff member (email and password).
4. In **Project Settings → API**, copy the **Project URL** and the **anon public** key.
5. In Netlify, open **Site configuration → Environment variables** and add:
   - `NEXT_PUBLIC_SUPABASE_URL` = the Project URL
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY` = the anon public key
6. Redeploy the site (Deploys → Trigger deploy).

The anon key is meant to be public; the data is protected by the row-level security rules in `schema.sql`, which only let signed-in staff read or change it.

## Editing the content

Day to day, edit the site from the staff area (**Website** and **Products**). The files in `src/data/` only hold the sample content shown before anything is saved:

| File | What it holds |
|---|---|
| `shop.ts` | Phone, WhatsApp number, address, map link, opening hours, social links |
| `menu.ts` | Categories and products (names in EN/AR/FR, price in DZD, unit, photo, featured on home) |
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
