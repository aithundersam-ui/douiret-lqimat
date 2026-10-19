-- Douiret Lqimat: database for the admin side and dashboard.
-- Run this once in Supabase: Dashboard → SQL Editor → New query → paste → Run.
-- It is safe to run again: it only creates what is missing.

create extension if not exists "pgcrypto";

-- Products: what the shop sells (made here or bought for resale).
create table if not exists public.products (
  id uuid primary key default gen_random_uuid(),
  name_ar text not null,
  name_fr text not null default '',
  category text not null default 'traditional',
  source text not null default 'made' check (source in ('made', 'resale')),
  unit text not null default 'piece' check (unit in ('piece', 'kg', 'box', 'tray')),
  price numeric(12, 2) not null default 0 check (price >= 0),
  unit_cost numeric(12, 2) not null default 0 check (unit_cost >= 0),
  active boolean not null default true,
  created_at timestamptz not null default now()
);

-- Daily counts: one row per product per day (produced or bought, sold, wasted).
-- Price and cost are copied in when the row is saved, so later price changes
-- don't rewrite past results.
create table if not exists public.daily_counts (
  id uuid primary key default gen_random_uuid(),
  day date not null,
  product_id uuid not null references public.products (id) on delete cascade,
  produced numeric(12, 2) not null default 0 check (produced >= 0),
  sold numeric(12, 2) not null default 0 check (sold >= 0),
  wasted numeric(12, 2) not null default 0 check (wasted >= 0),
  unit_price numeric(12, 2) not null default 0,
  unit_cost numeric(12, 2) not null default 0,
  created_at timestamptz not null default now(),
  unique (day, product_id)
);

-- Pre-orders for weddings, Eid, events.
create table if not exists public.orders (
  id uuid primary key default gen_random_uuid(),
  customer text not null,
  phone text not null default '',
  due_date date not null,
  items text not null default '',
  total numeric(12, 2) not null default 0 check (total >= 0),
  deposit numeric(12, 2) not null default 0 check (deposit >= 0),
  status text not null default 'confirmed'
    check (status in ('confirmed', 'in_production', 'ready', 'delivered', 'cancelled')),
  created_at timestamptz not null default now()
);

-- Purchases of ingredients and resale products.
create table if not exists public.purchases (
  id uuid primary key default gen_random_uuid(),
  day date not null default current_date,
  supplier text not null default '',
  item text not null,
  total numeric(12, 2) not null default 0 check (total >= 0),
  paid numeric(12, 2) not null default 0 check (paid >= 0),
  created_at timestamptz not null default now()
);

-- Other expenses: rent, electricity, gas, wages, packaging…
create table if not exists public.expenses (
  id uuid primary key default gen_random_uuid(),
  day date not null default current_date,
  category text not null default 'other',
  description text not null default '',
  amount numeric(12, 2) not null default 0 check (amount >= 0),
  created_at timestamptz not null default now()
);

create index if not exists daily_counts_day_idx on public.daily_counts (day);
create index if not exists orders_due_date_idx on public.orders (due_date);
create index if not exists purchases_day_idx on public.purchases (day);
create index if not exists expenses_day_idx on public.expenses (day);

-- Security: only signed-in staff can read or change anything.
-- Staff accounts are added in Supabase: Authentication → Users → Add user.
-- Products are also readable by everyone, so the public menu can use them later.
do $$
declare t text;
begin
  foreach t in array array['products', 'daily_counts', 'orders', 'purchases', 'expenses'] loop
    execute format('alter table public.%I enable row level security', t);
    execute format('drop policy if exists "staff full access" on public.%I', t);
    execute format(
      'create policy "staff full access" on public.%I for all to authenticated using (true) with check (true)', t);
  end loop;
end $$;

drop policy if exists "public can read active products" on public.products;
create policy "public can read active products" on public.products
  for select to anon using (active);
