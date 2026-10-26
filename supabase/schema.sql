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

-- Website content edited from the staff area (Website screen).
alter table public.products add column if not exists description_ar text not null default '';
alter table public.products add column if not exists description_fr text not null default '';
alter table public.products add column if not exists featured boolean not null default false;
alter table public.products add column if not exists image_url text not null default '';

-- Texts, contact details and hours of the home page, stored as one JSON value.
create table if not exists public.site_content (
  key text primary key,
  value jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);

create table if not exists public.team_members (
  id uuid primary key default gen_random_uuid(),
  name_ar text not null default '',
  name_fr text not null default '',
  role_ar text not null default '',
  role_fr text not null default '',
  photo_url text not null default '',
  sort integer not null default 0,
  created_at timestamptz not null default now()
);

-- English (the website's main language) next to Arabic and French.
alter table public.products add column if not exists name_en text not null default '';
alter table public.products add column if not exists description_en text not null default '';
alter table public.products alter column name_ar set default '';
alter table public.team_members add column if not exists name_en text not null default '';
alter table public.team_members add column if not exists role_en text not null default '';

-- Invoices, proforma invoices and delivery notes (bons de livraison) made from the staff area (Invoices screen).
create table if not exists public.invoices (
  id uuid primary key default gen_random_uuid(),
  kind text not null default 'invoice' check (kind in ('invoice', 'proforma', 'delivery')),
  number text not null unique,
  issue_date date not null default current_date,
  due_date date not null default current_date,
  customer_name text not null default '',
  customer_address text not null default '',
  customer_phone text not null default '',
  customer_tax_id text not null default '',
  payment_method text not null default 'cash',
  lines jsonb not null default '[]'::jsonb,
  discount numeric(12, 2) not null default 0 check (discount >= 0),
  vat_rate numeric(5, 2) not null default 0 check (vat_rate >= 0),
  stamp_duty numeric(12, 2) not null default 0 check (stamp_duty >= 0),
  notes text not null default '',
  order_id uuid references public.orders (id) on delete set null,
  created_at timestamptz not null default now()
);

-- Delivery notes (bons de livraison) were added after the first version of the table.
alter table public.invoices drop constraint if exists invoices_kind_check;
alter table public.invoices add constraint invoices_kind_check check (kind in ('invoice', 'proforma', 'delivery'));

-- Staff-only settings, such as the business details printed on invoices.
create table if not exists public.settings (
  key text primary key,
  value jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);

-- Staff accounts: who is the master admin (manages accounts) and who is blocked.
-- Changed only by the Netlify function behind the Members screen (it uses the secret key).
create table if not exists public.staff_profiles (
  user_id uuid primary key,
  email text not null default '',
  name text not null default '',
  role text not null default 'staff' check (role in ('master', 'staff')),
  active boolean not null default true,
  created_at timestamptz not null default now()
);

create index if not exists invoices_issue_date_idx on public.invoices (issue_date);
create index if not exists daily_counts_day_idx on public.daily_counts (day);
create index if not exists orders_due_date_idx on public.orders (due_date);
create index if not exists purchases_day_idx on public.purchases (day);
create index if not exists expenses_day_idx on public.expenses (day);

-- A blocked account loses access at once, even before its sign-in session runs out.
create or replace function public.is_active_staff() returns boolean
  language sql stable security definer set search_path = public as $$
  select not exists (select 1 from public.staff_profiles where user_id = auth.uid() and not active)
$$;

-- Security: only signed-in staff can read or change anything.
-- Staff accounts are added in Supabase: Authentication → Users → Add user.
-- Products are also readable by everyone, so the public menu can use them later.
do $$
declare t text;
begin
  foreach t in array array['products', 'daily_counts', 'orders', 'purchases', 'expenses', 'site_content', 'team_members', 'settings'] loop
    execute format('alter table public.%I enable row level security', t);
    execute format('drop policy if exists "staff full access" on public.%I', t);
    execute format(
      'create policy "staff full access" on public.%I for all to authenticated using (public.is_active_staff()) with check (public.is_active_staff())', t);
  end loop;
end $$;

-- The master admin (see staff_profiles below) is the only one who can delete invoices.
create or replace function public.is_master() returns boolean
  language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.staff_profiles where user_id = auth.uid() and role = 'master' and active)
$$;

-- Invoices, proformas and delivery notes: staff can create, read and correct them; only the master admin can delete them.
alter table public.invoices enable row level security;
drop policy if exists "staff full access" on public.invoices;
drop policy if exists "staff read invoices" on public.invoices;
create policy "staff read invoices" on public.invoices for select to authenticated using (public.is_active_staff());
drop policy if exists "staff create invoices" on public.invoices;
create policy "staff create invoices" on public.invoices for insert to authenticated with check (public.is_active_staff());
drop policy if exists "staff correct invoices" on public.invoices;
create policy "staff correct invoices" on public.invoices for update to authenticated using (public.is_active_staff()) with check (public.is_active_staff());
drop policy if exists "master deletes invoices" on public.invoices;
create policy "master deletes invoices" on public.invoices for delete to authenticated using (public.is_master());

-- Each staff member can read their own profile (to know if they are master). Nobody can change it from the app.
alter table public.staff_profiles enable row level security;
drop policy if exists "read own profile" on public.staff_profiles;
create policy "read own profile" on public.staff_profiles for select to authenticated using (user_id = auth.uid());

-- Existing logins get a profile; if there is no master yet, the oldest login becomes master.
-- To choose the master yourself: update public.staff_profiles set role = 'master' where email = 'you@example.com';
do $$
begin
  if to_regclass('auth.users') is not null then
    insert into public.staff_profiles (user_id, email)
      select id, coalesce(email, '') from auth.users
      on conflict (user_id) do nothing;
    if not exists (select 1 from public.staff_profiles where role = 'master' and active) then
      update public.staff_profiles set role = 'master'
        where user_id = (select id from auth.users order by created_at limit 1);
    end if;
  end if;
end $$;

drop policy if exists "public can read active products" on public.products;
create policy "public can read active products" on public.products
  for select to anon using (active);

drop policy if exists "public can read site content" on public.site_content;
create policy "public can read site content" on public.site_content
  for select to anon using (true);

drop policy if exists "public can read team" on public.team_members;
create policy "public can read team" on public.team_members
  for select to anon using (true);

-- Photo storage: a public "site" bucket that only signed-in staff can write to.
-- (Skipped automatically outside Supabase, where the storage schema doesn't exist.)
do $$
begin
  if to_regclass('storage.buckets') is not null then
    insert into storage.buckets (id, name, public) values ('site', 'site', true)
      on conflict (id) do update set public = true;
    drop policy if exists "staff upload site photos" on storage.objects;
    create policy "staff upload site photos" on storage.objects
      for insert to authenticated with check (bucket_id = 'site');
    drop policy if exists "staff change site photos" on storage.objects;
    create policy "staff change site photos" on storage.objects
      for update to authenticated using (bucket_id = 'site');
    drop policy if exists "staff delete site photos" on storage.objects;
    create policy "staff delete site photos" on storage.objects
      for delete to authenticated using (bucket_id = 'site');
  end if;
end $$;
