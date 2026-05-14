-- Run this in your Supabase SQL Editor if you hit "Database error saving new user"
-- It replaces the trigger with a safer version and adds the missing INSERT policy.

-- 1. Drop the old trigger (may have caused the error)
drop trigger if exists on_auth_user_created on auth.users;
drop function if exists handle_new_user();

-- 2. Recreate the trigger function with explicit search_path
create or replace function handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, email, full_name, role)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'full_name', ''),
    'customer'
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure handle_new_user();

-- 3. Add INSERT policy so the client can also upsert profiles
drop policy if exists "Users can insert own profile" on profiles;
create policy "Users can insert own profile" on profiles
  for insert with check (auth.uid() = id);
