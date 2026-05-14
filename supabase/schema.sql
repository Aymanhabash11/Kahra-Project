-- ============================================================
-- House of Nomad Stories — Supabase Schema
-- Run this in your Supabase SQL Editor
-- ============================================================

-- Designers
create table if not exists designers (
  id uuid default gen_random_uuid() primary key,
  name text not null,
  handle text unique,
  origin text,
  bio text,
  image_url text,
  website text,
  created_at timestamptz default now()
);

-- Products
create table if not exists products (
  id uuid default gen_random_uuid() primary key,
  title text not null,
  handle text unique,
  description text,
  price numeric(10,2),
  currency text default 'CHF',
  collection text,
  designer_id uuid references designers(id) on delete set null,
  vendor text,
  product_url text,
  image_url text,
  all_images jsonb default '[]',
  materials text,
  care_instructions text,
  sizes jsonb default '[]',
  colors jsonb default '[]',
  in_stock boolean default true,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Profiles (extends auth.users)
create table if not exists profiles (
  id uuid references auth.users(id) on delete cascade primary key,
  email text,
  full_name text,
  avatar_url text,
  role text default 'customer' check (role in ('customer', 'admin')),
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Journal Posts
create table if not exists journal_posts (
  id uuid default gen_random_uuid() primary key,
  title text not null,
  slug text unique,
  excerpt text,
  content text,
  cover_image text,
  category text,
  author text,
  published boolean default false,
  published_at timestamptz,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Cart Items (persistent, user-specific)
create table if not exists cart_items (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id) on delete cascade,
  product_id text not null,
  product_title text,
  product_image text,
  product_price numeric(10,2),
  product_vendor text,
  quantity integer default 1 check (quantity > 0),
  size text default '',
  color text default '',
  created_at timestamptz default now()
);

-- Newsletter Subscribers
create table if not exists newsletter_subscribers (
  id uuid default gen_random_uuid() primary key,
  email text unique not null,
  name text,
  created_at timestamptz default now()
);

-- ============================================================
-- ROW LEVEL SECURITY
-- ============================================================

alter table profiles enable row level security;
alter table products enable row level security;
alter table designers enable row level security;
alter table journal_posts enable row level security;
alter table cart_items enable row level security;
alter table newsletter_subscribers enable row level security;

-- Profiles
create policy "Users can view own profile" on profiles
  for select using (auth.uid() = id);

create policy "Users can update own profile" on profiles
  for update using (auth.uid() = id);

create policy "Admins can view all profiles" on profiles
  for select using (
    exists (select 1 from profiles where id = auth.uid() and role = 'admin')
  );

-- Products: public read, admin write
create policy "Anyone can read products" on products
  for select using (true);

create policy "Admins can manage products" on products
  for all using (
    exists (select 1 from profiles where id = auth.uid() and role = 'admin')
  );

-- Designers: public read, admin write
create policy "Anyone can read designers" on designers
  for select using (true);

create policy "Admins can manage designers" on designers
  for all using (
    exists (select 1 from profiles where id = auth.uid() and role = 'admin')
  );

-- Journal: public read published, admin read/write all
create policy "Anyone can read published posts" on journal_posts
  for select using (published = true);

create policy "Admins can manage all posts" on journal_posts
  for all using (
    exists (select 1 from profiles where id = auth.uid() and role = 'admin')
  );

-- Cart: users own their rows
create policy "Users can manage own cart" on cart_items
  for all using (auth.uid() = user_id);

-- Newsletter
create policy "Anyone can subscribe" on newsletter_subscribers
  for insert with check (true);

create policy "Admins can read subscribers" on newsletter_subscribers
  for select using (
    exists (select 1 from profiles where id = auth.uid() and role = 'admin')
  );

-- ============================================================
-- AUTO-CREATE PROFILE ON SIGNUP TRIGGER
-- ============================================================

create or replace function handle_new_user()
returns trigger language plpgsql security definer as $$
begin
  insert into profiles (id, email, full_name)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'full_name', '')
  );
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure handle_new_user();
