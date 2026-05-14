-- ============================================================
-- RLS COMPLETE FIX
-- Run this in Supabase SQL Editor to replace all policies
-- ============================================================

-- 1. Helper function — checks admin without triggering RLS recursion
create or replace function is_admin()
returns boolean
language sql
security definer
stable
set search_path = public
as $$
  select exists (
    select 1 from profiles
    where id = auth.uid() and role = 'admin'
  );
$$;

-- ============================================================
-- PROFILES
-- ============================================================
drop policy if exists "Users can view own profile"      on profiles;
drop policy if exists "Users can update own profile"    on profiles;
drop policy if exists "Admins can view all profiles"    on profiles;
drop policy if exists "Users can insert own profile"    on profiles;

create policy "profiles_select_own"
  on profiles for select
  using (auth.uid() = id);

create policy "profiles_select_admin"
  on profiles for select
  using (is_admin());

create policy "profiles_insert_own"
  on profiles for insert
  with check (auth.uid() = id);

create policy "profiles_update_own"
  on profiles for update
  using (auth.uid() = id);

create policy "profiles_update_admin"
  on profiles for update
  using (is_admin());

-- ============================================================
-- PRODUCTS
-- ============================================================
drop policy if exists "Anyone can read products"   on products;
drop policy if exists "Admins can manage products" on products;

create policy "products_select_all"
  on products for select
  using (true);

create policy "products_insert_admin"
  on products for insert
  with check (is_admin());

create policy "products_update_admin"
  on products for update
  using (is_admin());

create policy "products_delete_admin"
  on products for delete
  using (is_admin());

-- ============================================================
-- DESIGNERS
-- ============================================================
drop policy if exists "Anyone can read designers"   on designers;
drop policy if exists "Admins can manage designers" on designers;

create policy "designers_select_all"
  on designers for select
  using (true);

create policy "designers_insert_admin"
  on designers for insert
  with check (is_admin());

create policy "designers_update_admin"
  on designers for update
  using (is_admin());

create policy "designers_delete_admin"
  on designers for delete
  using (is_admin());

-- ============================================================
-- JOURNAL POSTS
-- ============================================================
drop policy if exists "Anyone can read published posts" on journal_posts;
drop policy if exists "Admins can manage all posts"     on journal_posts;

create policy "journal_select_published"
  on journal_posts for select
  using (published = true);

create policy "journal_select_admin"
  on journal_posts for select
  using (is_admin());

create policy "journal_insert_admin"
  on journal_posts for insert
  with check (is_admin());

create policy "journal_update_admin"
  on journal_posts for update
  using (is_admin());

create policy "journal_delete_admin"
  on journal_posts for delete
  using (is_admin());

-- ============================================================
-- CART ITEMS
-- ============================================================
drop policy if exists "Users can manage own cart" on cart_items;

create policy "cart_select_own"
  on cart_items for select
  using (auth.uid() = user_id);

create policy "cart_insert_own"
  on cart_items for insert
  with check (auth.uid() = user_id);

create policy "cart_update_own"
  on cart_items for update
  using (auth.uid() = user_id);

create policy "cart_delete_own"
  on cart_items for delete
  using (auth.uid() = user_id);

-- ============================================================
-- NEWSLETTER
-- ============================================================
drop policy if exists "Anyone can subscribe"          on newsletter_subscribers;
drop policy if exists "Admins can read subscribers"   on newsletter_subscribers;

create policy "newsletter_insert_all"
  on newsletter_subscribers for insert
  with check (true);

create policy "newsletter_select_admin"
  on newsletter_subscribers for select
  using (is_admin());

-- ============================================================
-- ORDERS (new table)
-- ============================================================
create table if not exists orders (
  id              uuid default gen_random_uuid() primary key,
  user_id         uuid references auth.users(id) on delete set null,
  session_id      text unique,
  payment_intent  text,
  status          text default 'pending'
                  check (status in ('pending','paid','failed','refunded')),
  total           numeric(10,2),
  currency        text default 'CHF',
  items           jsonb default '[]',
  customer_email  text,
  created_at      timestamptz default now(),
  updated_at      timestamptz default now()
);

alter table orders enable row level security;

create policy "orders_select_own"
  on orders for select
  using (auth.uid() = user_id);

create policy "orders_select_admin"
  on orders for select
  using (is_admin());

create policy "orders_insert_service"
  on orders for insert
  with check (true);          -- Edge Function uses service role, bypasses RLS

create policy "orders_update_service"
  on orders for update
  using (true);               -- Edge Function uses service role
